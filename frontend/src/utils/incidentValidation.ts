// Validation utility for incident forms
import { Incident, CreateIncidentRequest } from '../types';

export const VALID_TYPES = ["fall", "behaviour", "medication", "other"];
export const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

export function validateIncidentForm(data: CreateIncidentRequest): string | null {
  if (!data.type || !VALID_TYPES.includes(data.type)) {
    return `Type must be one of: ${VALID_TYPES.join(', ')}`;
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    return "Description must be at least 10 characters long";
  }
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    return `Status must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  return null;
}
