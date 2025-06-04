const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/rest';

const headers = {
  'Content-Type': 'application/json',
};

async function apiRequest<T, D = Record<string, unknown>>(
  endpoint: string,
  method: string = 'GET',
  data?: D
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers,
    credentials: 'omit',
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return await response.json() as T;
}

export default apiRequest;
