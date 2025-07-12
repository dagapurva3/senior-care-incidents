import { Request } from 'express';

export interface Incident {
    id: string;
    userId: string;
    type: string;
    description: string;
    summary?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateIncidentRequest {
    type: string;
    description: string;
    status?: string;
}

export interface User {
    uid: string;
    email?: string;
    name?: string;
}

export interface AuthRequest extends Request {
    user?: User;
}
