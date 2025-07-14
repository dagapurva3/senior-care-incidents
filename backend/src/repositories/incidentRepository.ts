import Incident from '../models/incident';
import { Op } from 'sequelize';

export async function createIncident(data: any) {
  return Incident.create(data);
}

export async function getIncidentsByUser(userId: string, options: any = {}) {
  return Incident.findAndCountAll({ where: { userId, ...options.where }, ...options });
}

export async function findIncidentById(id: string, userId: string) {
  return Incident.findOne({ where: { id, userId } });
}

export async function updateIncidentStatus(
  id: string,
  userId: string,
  status: "open" | "in_progress" | "resolved" | "closed"
) {
  const incident = await Incident.findOne({ where: { id, userId } });
  if (!incident) return null;
  incident.status = status;
  await incident.save();
  return incident;
}

export async function exportIncidentsByUser(userId: string) {
  return Incident.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
} 