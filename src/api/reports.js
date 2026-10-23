import { apiClient, getClientId } from './client.js';

/**
 * Health check
 */
export async function checkApiHealth() {
  return apiClient('/api/health');
}

/**
 * Fetch aggregated dashboard statistics
 */
export async function getDashboardStats() {
  return apiClient('/api/dashboard/stats');
}

/**
 * Fetch paginated and filtered problem reports
 */
export async function getReports(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.priority && params.priority !== 'all') searchParams.set('priority', params.priority);
  if (params.neighborhood && params.neighborhood !== 'all') searchParams.set('neighborhood', params.neighborhood);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.sort) searchParams.set('sort', params.sort);

  const query = searchParams.toString();
  return apiClient(`/api/reports${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single report by ID
 */
export async function getReportById(id) {
  return apiClient(`/api/reports/${encodeURIComponent(id)}`);
}

/**
 * Check for possible duplicate reports before resident submits
 */
export async function checkDuplicates(reportData) {
  return apiClient('/api/reports/check-duplicates', {
    method: 'POST',
    body: JSON.stringify({
      title: reportData.title || '',
      category: reportData.category || '',
      neighborhood: reportData.neighborhood || '',
      description: reportData.description || ''
    })
  });
}

/**
 * Submit a new problem report
 */
export async function createReport(reportData) {
  return apiClient('/api/reports', {
    method: 'POST',
    body: JSON.stringify(reportData)
  });
}

/**
 * Confirm/upvote an existing problem report
 */
export async function confirmReport(reportId) {
  const clientId = getClientId();
  return apiClient(`/api/reports/${encodeURIComponent(reportId)}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ clientId })
  });
}

/**
 * Get status updates timeline for a report
 */
export async function getReportUpdates(reportId) {
  return apiClient(`/api/reports/${encodeURIComponent(reportId)}/updates`);
}
