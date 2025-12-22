const getCsrfToken = async () => {
    const baseUrl = import.meta.env.VITE_API_URL  
     'http://localhost:6969';
    //|| 'http://localhost:6969';
    try {
        const res = await fetch(`${baseUrl}/csrf-token`, {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        if (error instanceof Error) {
            throw new Error(`CSRF token fetch failed: ${error.message}`);
        }
        throw new Error('CSRF token fetch failed: Unknown error');
    }
};

export default getCsrfToken;
