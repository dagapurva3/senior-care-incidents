import { Request, Response } from 'express';

export interface IncidentController {
  createIncidentController(req: Request, res: Response): Promise<void>;
  listIncidentsController(req: Request, res: Response): Promise<void>;
  updateIncidentStatusController(req: Request, res: Response): Promise<void>;
  exportIncidentsController(req: Request, res: Response): Promise<void>;
  summarizeIncidentController(req: Request, res: Response): Promise<void>;
}
