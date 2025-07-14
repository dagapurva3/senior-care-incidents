// Validation utilities for incident creation and update
import { IncidentAttributes } from '../models/incident';

export const VALID_TYPES = ["fall", "behaviour", "medication", "other"];
export const VALID_STATUSES = ["open", "in_progress", "resolved", "closed"];

export function validateIncidentData(data: Partial<IncidentAttributes>) {
  if (!data.type || !VALID_TYPES.includes(data.type)) {
    throw new Error(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  if (!data.description || typeof data.description !== 'string' || data.description.trim().length < 10) {
    throw new Error("Description must be at least 10 characters long");
  }
  if (data.status && !VALID_STATUSES.includes(data.status)) {
    throw new Error(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }
}
