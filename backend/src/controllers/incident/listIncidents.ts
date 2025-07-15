import { Request, Response } from 'express';
import { listIncidentsService } from '../../services/incidentService';
import { handleError } from './utils';

export async function listIncidentsController(req: Request, res: Response): Promise<void> {
  try {
    const result = await listIncidentsService(req.user!.uid, req.query);
    res.json(result);
  } catch (error: any) {
    handleError(res, error, 500);
  }
}
