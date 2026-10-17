// import { auth } from '../Components/FireBaseAuth/Firebase';
// import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:6969/api';

export const fetchAdminStats = async () => {
    // Commented out: relies on Firebase admin auth
    // const currentUser = auth.currentUser;
    // console.log('Current Firebase user:', currentUser);
    // if (!currentUser) {
    //     throw new Error('No admin user is currently logged into this session.');
    // }
    // const token = await currentUser.getIdToken(true);
    // const response = await fetch(`${BASE_URL}/admin/system-stats`, {
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: `Bearer ${token}`,
    //     },
    // });
    // console.log('Response from server:', response);
    // if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(
    //         errorData.error || 'Server error fetching administration metrics.',
    //     );
    // }
    // return response.json();
    return { status: 'offline', message: 'Firebase admin disabled' };
};
