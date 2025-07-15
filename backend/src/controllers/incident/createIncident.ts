import { Request, Response } from 'express';
import { createIncidentService } from '../../services/incidentService';
import { handleError } from './utils';

export async function createIncidentController(req: Request, res: Response): Promise<void> {
  try {
    const incident = await createIncidentService(req.user!.uid, req.body);
    res.status(201).json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
  }
}
