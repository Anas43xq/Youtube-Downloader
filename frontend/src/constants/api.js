// --- FILE: frontend/src/constants/api.js ---

const base = import.meta.env.VITE_BACKEND_URL ?? "";

export const API_BASE = base;

export const ENDPOINTS = {
  INFO:     `${base}/api/info`,
  DOWNLOAD: `${base}/api/download`,
  PROGRESS: `${base}/api/progress`,
  FILE:     `${base}/api/file`,
  OPEN:     `${base}/api/open`,
  HEALTH:   `${base}/health`,
};
