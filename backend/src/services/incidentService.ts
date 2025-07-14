import {
  createIncident as repoCreateIncident,
  getIncidentsByUser,
  findIncidentById,
  updateIncidentStatus as repoUpdateIncidentStatus,
  exportIncidentsByUser,
} from '../repositories/incidentRepository';
import { summarizeIncident } from './openai';

const VALID_TYPES = ["fall", "behaviour", "medication", "other"];
const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

export async function createIncidentService(userId: string, data: any) {
  const { type, description, status = "open" } = data;

  if (!type || !description) {
    throw new Error("Type and description are required");
  }
  if (typeof type !== 'string' || typeof description !== 'string') {
    throw new Error("Type and description must be strings");
  }
  if (description.trim().length < 10) {
    throw new Error("Description must be at least 10 characters long");
  }
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  return repoCreateIncident({ userId, type, description: description.trim(), status });
}

export async function listIncidentsService(userId: string, query: any) {
  const {
    page = 1,
    limit = 10,
    search = "",
    type = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "DESC"
  } = query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const offset = (pageNum - 1) * limitNum;

  const where: any = {};
  if (search) where.description = { $iLike: `%${search}%` };
  if (type) where.type = type;
  if (status) where.status = status;

  const validSortFields = ["createdAt", "updatedAt", "type", "status"];
  const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : "createdAt";
  const sortDirection = sortOrder === "ASC" ? "ASC" : "DESC";

  const { count, rows } = await getIncidentsByUser(userId, {
    where,
    order: [[sortField, sortDirection]],
    limit: limitNum,
    offset,
  });
  const totalPages = Math.ceil(count / limitNum);
  return {
    incidents: rows,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: count,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

export async function updateIncidentStatusService(userId: string, id: string, status: string) {
  if (!id) throw new Error("Incident ID is required");
  if (!status) throw new Error("Status is required");
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const incident = await repoUpdateIncidentStatus(
    id,
    userId,
    status as "open" | "in_progress" | "resolved" | "closed"
  );
  if (!incident) throw new Error("Incident not found");
  return incident;
}

export async function exportIncidentsService(userId: string, format: string = "json") {
  const incidents = await exportIncidentsByUser(userId);
  if (format === "csv") {
    const csvHeader = "ID,Type,Description,Status,Summary,Created At,Updated At\n";
    const csvData = incidents.map(incident =>
      `"${incident.id}","${incident.type}","${incident.description.replace(/"/g, '""')}","${incident.status}","${incident.summary?.replace(/"/g, '""') || ''}","${incident.createdAt}","${incident.updatedAt}"`
    ).join('\n');
    return { csv: csvHeader + csvData };
  }
  return { incidents };
}

export async function summarizeIncidentService(userId: string, id: string) {
  const incident = await findIncidentById(id, userId);
  if (!incident) throw new Error("Incident not found");
  const summary = await summarizeIncident(incident.description, incident.type);
  incident.summary = summary;
  await incident.save();
  return incident;
} 