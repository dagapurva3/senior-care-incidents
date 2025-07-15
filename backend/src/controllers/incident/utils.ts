import { Response } from 'express';

export function handleError(res: Response, error: any, status: number = 400): void {
    res.status(status).json({ error: error.message || 'An unexpected error occurred.' });
}
