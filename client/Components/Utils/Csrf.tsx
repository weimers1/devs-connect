const getCsrfToken = async () => {
    const res = await fetch('http://localhost:6969/csrf-token', {
        method: 'GET',
        credentials: 'include', // To access cookies
    });
    const data = await res.json();
    return data.csrfToken;
};

export default getCsrfToken;
