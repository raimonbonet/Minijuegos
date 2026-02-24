const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:3000`;
    }
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
