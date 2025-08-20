export const validateSession = (sessionToken: string) => {
    // call to backend's api endpoint /session/status/get
    fetch(`http://localhost:6969/session/status/get`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
    })
        .then((response) => response.json())
        .then((data) => {
            // @TODO: verify Amazon Q dev got this right
            if (data.status !== 200) {
                console.error('Session validation failed:', data.message);
                return false;
            }
            return true;
        })
        .catch((error) => {
            console.error('Session validation failed:', error);
            return false;
        });
};
