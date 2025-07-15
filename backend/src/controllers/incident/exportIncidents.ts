import { Request, Response } from 'express';
import { exportIncidentsService } from '../../services/incidentService';
import { handleError } from './utils';

export async function exportIncidentsController(req: Request, res: Response): Promise<void> {
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
