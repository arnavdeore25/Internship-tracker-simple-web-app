// Small wrapper around fetch for the REST API.
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const listApplications = (status) =>
  request(`/applications${status ? `?status=${status}` : ''}`);
export const createApplication = (body) =>
  request('/applications', { method: 'POST', body: JSON.stringify(body) });
export const updateApplication = (id, body) =>
  request(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteApplication = (id) => request(`/applications/${id}`, { method: 'DELETE' });
