import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuth';
import { fetchAdminStats } from '../../Utils/AdminAPis';
// import { getAuth, signOut } from 'firebase/auth';
import { useDropdown } from '../DropDown/DropDownContext';

// const auth = null;
// const user = null;
interface SystemStats {
    status: string;
    systemLoad: string;
    activeDatabaseContext: string;
    authorizedOperator: string;
}

export function AdminDashboardInfo() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const {togglemetrics, toggleAdminSidebar } = useDropdown();
    //  const { isNavSideBarSidebarOpen, toggleAdminSidebar } = useDropdown();
   
    const [uiError, setUiError] = useState<string>('');
    const [fetching, setFetching] = useState<boolean>(true);
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();
//   const [sessionToken, setSessionToken] = useState('');
 
    useEffect(() => {
    
        const getDashboardMetrics = async () => {
            try {
             
                const data = await fetchAdminStats();
                setStats(data);
            } catch (err: any) {
                setUiError(err.message);
                navigate('/admin-login');
            } finally {
                setFetching(false);
            }
            // if (user) {
            //     user.getIdToken(true)
            //         .then((idToken) => {
            //             console.log('Auth Token', idToken);
            //         })
            //         .catch((error) => {
            //             console.error('Error fetching ID token:', error);
            //             navigate('/admin-login');
            //         });
            // }
        };
        toggleAdminSidebar();
        getDashboardMetrics();
        // If The User Leaves The Page The Token IS Destroyed Locally
        const handleBeforeUnload = () => {
            // signOut(auth)
            //     .then(() => {
            //         console.log('Token destroyed locally');
            //     })
            //     .catch((error) => {
            //         console.log('Error signing out', error);
            //     });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // return () => {
        //     // Component unmounted (user left this URL)
        //     signOut(auth)
        //         .then(() => {
        //             console.log('Token destroyed locally');
        //         })
        //         .catch((error) => {
        //             console.log('Error signing out', error);
        //         });
        // };
    }, []);

    if (fetching)
        return (
            <div className="admin-auth-wrapper">
                <p style={{ color: '#fff' }}>Querying control data matrix...</p>
            </div>
        );

    return (
      
        <div
            className="admin-auth-wrapper"
            style={{ flexDirection: 'column', gap: '20px' }}
        >
           
            <div
                className="admin-card"
                style={{ maxWidth: '600px' }}
            >
                <div className="admin-card-header">
                    <div className="admin-badge">LIVE METRICS</div>
                    <h2>Control Terminal</h2>
                    <p>Cryptographically secured by Firebase token claims</p>
                </div>

                {uiError ? (
                    <div
                        className="admin-alert-error"
                        style={{ marginBottom: '20px' }}
                    >
                        <strong>Security Halt:</strong> {uiError}
                    </div>
                ) : (
                    <div
                        style={{
                            color: '#d1d5db',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            marginBottom: '24px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #1f2937',
                                paddingBottom: '8px',
                            }}
                        >
                            <span>Core Operational Status:</span>
                            <span
                                style={{ color: '#10b981', fontWeight: 'bold' }}
                            >
                                {stats?.status.toUpperCase()}
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #1f2937',
                                paddingBottom: '8px',
                            }}
                        >
                            <span>Server Processor Load:</span>
                            <span style={{ color: '#f59e0b' }}>
                                {stats?.systemLoad}
                            </span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #1f2937',
                                paddingBottom: '8px',
                            }}
                        >
                            <span>Active Storage Context:</span>
                            <code style={{ color: '#60a5fa' }}>
                                {stats?.activeDatabaseContext}
                            </code>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingBottom: '8px',
                            }}
                        >
                            <span>Authenticated Operator:</span>
                            <span style={{ color: '#f9fafb' }}>
                                {stats?.authorizedOperator}
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={adminLogout}
                    className="admin-btn"
                    style={{
                        backgroundColor: '#1f2937',
                        color: '#f9fafb',
                        border: '1px solid #374151',
                    }}
                >
                    Terminate Console Session
                </button>
            </div>
           
        </div>
        
    );
}
