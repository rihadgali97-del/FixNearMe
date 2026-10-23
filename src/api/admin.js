import { apiClient, getAdminToken, setAdminToken, clearAdminToken } from './client.js';

export { getAdminToken, setAdminToken, clearAdminToken };

/**
 * Fetch all reports for administration with full triage details
 */
export async function getAdminReports(filters = {}) {
  const searchParams = new URLSearchParams();
  if (filters.status && filters.status !== 'all') searchParams.set('status', filters.status);
  if (filters.priority && filters.priority !== 'all') searchParams.set('priority', filters.priority);
  if (filters.category && filters.category !== 'all') searchParams.set('category', filters.category);
  if (filters.search) searchParams.set('search', filters.search);

  const query = searchParams.toString();
  return apiClient(`/api/admin/reports${query ? `?${query}` : ''}`);
}

/**
 * Update report status, priority, resolution note, or internal note
 */
export async function updateAdminReport(reportId, updatePayload) {
  return apiClient(`/api/admin/reports/${encodeURIComponent(reportId)}`, {
    method: 'PATCH',
    body: JSON.stringify(updatePayload)
  });
}

/**
 * Merge duplicate report into a canonical primary report
 */
export async function mergeReport(sourceReportId, canonicalTargetId, reason = '') {
  return apiClient(`/api/admin/reports/${encodeURIComponent(sourceReportId)}/merge`, {
    method: 'POST',
    body: JSON.stringify({
      canonicalId: canonicalTargetId,
      reason
    })
  });
}
