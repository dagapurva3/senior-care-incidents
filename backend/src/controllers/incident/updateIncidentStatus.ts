import { Request, Response } from 'express';
import { updateIncidentStatusService } from '../../services/incidentService';
import { handleError } from './utils';

export async function updateIncidentStatusController(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const incident = await updateIncidentStatusService(req.user!.uid, id, status);
    res.json(incident);
  } catch (error: any) {
    handleError(res, error, 400);
  }
}
