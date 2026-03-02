const getApiUrl = () => {
    // Vite uses import.meta.env instead of process.env for the frontend.
    // Railway will need to have VITE_API_URL configured to point to the backend.
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Fallback based on origin (assuming frontend & backend share domain like on Railway)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return window.location.origin;
    }

    // Local dev fallback
    return 'http://localhost:3000';
};

export const API_URL = getApiUrl();

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function apiRequest(endpoint: string, options: RequestOptions = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (options.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
    } else {
        // Check local storage for token
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
}
