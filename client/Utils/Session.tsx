import getCsrfToken from '../Components/Utils/Csrf';

export const validateSession = async (
    sessionToken: string
): Promise<boolean> => {
    try {
        const response = await fetch(
            `http://localhost:6969/session/status/get`,
            {
                method: 'GET',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                },
            }
        );

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Session validation failed:', error);
        return false;
    }
};

export const extendSession = async (sessionToken: string): Promise<boolean> => {
    try {
        const csrfToken = await getCsrfToken();

        const response = await fetch(`http://localhost:6969/session/extend`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionToken}`,
                'X-CSRF-Token': csrfToken,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Session extension failed:', error);
        return false;
    }
};
