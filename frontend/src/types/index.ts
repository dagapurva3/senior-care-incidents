export interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

export interface Incident {
  id: string;
  userId: string;
  type: string;
  description: string;
  summary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentRequest {
  type: string;
  description: string;
  status?: string;
}
