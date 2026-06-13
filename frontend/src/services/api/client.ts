/**
 * API client for Floodlight backend.
 *
 * Centralized HTTP client configuration. All API calls
 * go through this module — no hardcoded endpoints elsewhere.
 */

const API_BASE_URL = '/api/v1'

/**
 * Typed fetch wrapper for the Floodlight API.
 *
 * Handles JSON serialization, error responses, and base URL prefixing.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `API error: ${response.status}`)
  }

  return response.json()
}

/** API client methods organized by resource. */
export const api = {
  health: {
    check: () => apiFetch<{ status: string }>('/health'),
  },

  reports: {
    create: (data: { text: string; latitude: number; longitude: number }) =>
      apiFetch<{ success: boolean; report_id: string }>('/reports', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: () => apiFetch<unknown[]>('/reports'),
  },

  incidents: {
    list: () => apiFetch<unknown[]>('/incidents'),
    get: (id: string) => apiFetch<unknown>(`/incidents/${id}`),
  },

  resources: {
    list: () => apiFetch<unknown[]>('/resources'),
    assign: (resourceId: string, incidentId: string) =>
      apiFetch<{ success: boolean }>('/resources/assign', {
        method: 'POST',
        body: JSON.stringify({
          resource_id: resourceId,
          incident_id: incidentId,
        }),
      }),
  },

  shelters: {
    list: () => apiFetch<unknown[]>('/shelters'),
    risks: () => apiFetch<unknown[]>('/shelters/risk'),
  },

  optimization: {
    run: () =>
      apiFetch<{ success: boolean; run_id: string }>('/optimization/run', {
        method: 'POST',
      }),
    getResult: (runId: string) => apiFetch<unknown>(`/optimization/${runId}`),
  },

  command: {
    query: (query: string) =>
      apiFetch<{ answer: string }>('/command/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
  },
}
