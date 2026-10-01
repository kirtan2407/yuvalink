const API_URL = import.meta.env.VITE_API_URL || '';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  
  return response;
}

export async function apiCall(endpoint, options = {}, retries = 1) {
  const token = sessionStorage.getItem('token');
  
  const headers = {
    ...options.headers,
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }


  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'omit'
    });

    if (response.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    // Some responses might be empty (e.g., 204 No Content)
    if (response.status === 204) return null;
    
    return await response.json();
  } catch (error) {
    if (retries > 0 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
      // Retry once for network errors or timeouts
      return apiCall(endpoint, options, retries - 1);
    }
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.', { cause: error });
    }
    
    throw error;
  }
}

export default apiCall;
