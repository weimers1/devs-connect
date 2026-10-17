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
