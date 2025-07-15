import { Request, Response } from 'express';
import {
  createIncidentService,
  listIncidentsService,
  updateIncidentStatusService,
  exportIncidentsService,
  summarizeIncidentService,
} from '../services/incidentService';

function handleError(res: Response, error: any, status: number = 400) {
  res.status(status).json({ error: error.message || 'An unexpected error occurred.' });
}

export async function createIncidentController(req: Request, res: Response) {
  try {
    const incident = await createIncidentService(req.user!.uid, req.body);
    res.status(201).json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
  }
}

export async function listIncidentsController(req: Request, res: Response) {
  try {
    const result = await listIncidentsService(req.user!.uid, req.query);
    res.json(result);
  } catch (error: any) {
    handleError(res, error, 500);
  }
}

export async function updateIncidentStatusController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const incident = await updateIncidentStatusService(req.user!.uid, id, status);
    res.json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
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
    handleError(res, error, 500);
  }
}

export async function summarizeIncidentController(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const incident = await summarizeIncidentService(req.user!.uid, id);
    res.json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
  }
}