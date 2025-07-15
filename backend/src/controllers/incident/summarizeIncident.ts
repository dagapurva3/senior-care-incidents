import { Request, Response } from 'express';
import { summarizeIncidentService } from '../../services/incidentService';
import { handleError } from './utils';

export async function summarizeIncidentController(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const incident = await summarizeIncidentService(req.user!.uid, id);
    res.json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
  }
}
