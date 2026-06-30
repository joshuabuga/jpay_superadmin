export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';

// Base URL for media/document files served by the backend
const apiUrl = new URL(API_BASE_URL);
export const MEDIA_BASE_URL = `${apiUrl.protocol}//${apiUrl.host}`;

/** Resolve a document URL (may be relative or absolute) to a full URL */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${MEDIA_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
