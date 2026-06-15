import { useAuthStore } from '../store/authStore'

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Default to application/json if not form data
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'API request failed';
    try {
      const errorData = await response.json();
      // Handle express-validator style errors: { errors: [{ msg: "..." }] }
      if (errorData?.errors?.length) {
        errorMessage = errorData.errors.map((e: any) => e.msg).join(', ');
      } else {
        errorMessage = errorData?.error || errorData?.msg || errorData?.message || errorMessage;
      }
    } catch {
      // Response was plain text, not JSON
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // ignore
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
};
