import axios from "axios";
import { auth } from "./firebase";
import { Incident, CreateIncidentRequest } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface GetIncidentsParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface IncidentsResponse {
  incidents: Incident[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const createIncident = async (
  incident: CreateIncidentRequest
): Promise<Incident> => {
  const response = await api.post("/incidents", incident);
  return response.data;
};

export const getIncidents = async (params?: GetIncidentsParams): Promise<IncidentsResponse> => {
  const response = await api.get("/incidents", { params });
  return response.data;
};

export const updateIncidentStatus = async (id: string, status: string): Promise<Incident> => {
  const response = await api.patch(`/incidents/${id}/status`, { status });
  return response.data;
};

export const summarizeIncident = async (id: string): Promise<Incident> => {
  const response = await api.post(`/incidents/${id}/summarize`);
  return response.data;
};

export const exportIncidents = async (format: "json" | "csv" = "json"): Promise<Blob | Incident[]> => {
  const response = await api.get("/incidents/export", { 
    params: { format },
    responseType: format === "csv" ? "blob" : "json"
  });
  return response.data;
};
