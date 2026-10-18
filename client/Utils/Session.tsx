const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6969';

export const validateSession = async (): Promise<boolean> => {
    try {
        const response = await fetch(
            `${API_BASE}/session/status/get`,
            {
                method: 'GET',
                credentials: 'include',
            }
        );

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Session validation failed:', error);
        return false;
    }
};
