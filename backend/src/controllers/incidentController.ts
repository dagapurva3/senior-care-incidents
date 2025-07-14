import { Request, Response } from 'express';
import {
  createIncidentService,
  listIncidentsService,
  updateIncidentStatusService,
  exportIncidentsService,
  summarizeIncidentService,
} from '../services/incidentService';

export async function createIncidentController(req: Request, res: Response) {
  try {
    const incident = await createIncidentService(req.user!.uid, req.body);
    res.status(201).json(incident);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function listIncidentsController(req: Request, res: Response) {
  try {
    const result = await listIncidentsService(req.user!.uid, req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateIncidentStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const incident = await updateIncidentStatusService(req.user!.uid, id, status);
    res.json(incident);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

export async function exportIncidentsController(req: Request, res: Response) {
  try {
    const { format = 'json' } = req.query;
    const result = await exportIncidentsService(req.user!.uid, format as string);
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="incidents.csv"');
      res.send(result.csv);
    } else {
      res.json(result.incidents);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function summarizeIncidentController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const incident = await summarizeIncidentService(req.user!.uid, id);
    res.json(incident);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
} 