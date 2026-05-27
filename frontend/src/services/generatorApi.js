const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export async function startGenerator(payload) {
  const res = await fetch(`${API_BASE_URL}/api/generator/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to start generator');
    err.payload = data;
    throw err;
  }
  return data;
}

export async function stopGenerator(payload) {
  const res = await fetch(`${API_BASE_URL}/api/generator/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to stop generator');
    err.payload = data;
    throw err;
  }
  return data;
}
