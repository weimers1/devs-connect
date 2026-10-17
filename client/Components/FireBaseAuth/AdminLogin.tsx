// src/components/LoginForm.jsx
import React, { useState } from 'react';
// import { signInWithEmailAndPassword } from 'firebase/auth';
// import { auth } from '../FireBaseAuth/Firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // const [sessionToken, setSessionToken] = useState('');
    // const original_Token = localStorage.getItem('session_token');
            // useEffect(() => {
            // //    const token  =  localStorage.getItem('session_token');
                
            //     // if(token == '' || token == null || token != original_Token) {
            //     //     navigate('/login')
            //     // } else  {
            //     //     setSessionToken(token);
            //     // }
            // },);
 
            // 
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        //   const token  =  localStorage.getItem('session_token');
        //         if(token == '' || token == null) {
        //             navigate('/login')
        //         } else  {
        //             setSessionToken(token);
        //         }
            // const userCredential = await signInWithEmailAndPassword(
            //     auth,
            //     email,
            //     password,
            // );    
            // console.log('Logged in successfully:', userCredential.user);
            console.log('Firebase disabled');
            navigate('/admin');
            // Route user to dashboard or home page here
        } catch (err) {
            // Maps technical Firebase error codes to readable strings
            console.log('Error');
            navigate('/admin-login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="admin-auth-wrapper"
            style={{ flexDirection: 'column', gap: '20px' }}
        >
            <div
                className="admin-card"
                style={{
                    maxWidth: '600px',
                }}
            >
                <h2 className="text-center text-2xl text-white hover:text-black">
                    Login
                </h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label
                            htmlFor="email"
                            className="text-white text-md"
                        >
                            Email
                        </label>
                        <input
                            className="border-0 rounded-md text-center text-black"
                            id="email"
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                marginTop: '5px',
                                backgroundColor: 'white',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label
                            htmlFor="password"
                            className="text-white hover:bg-blue text-md"
                        >
                            Password
                        </label>
                        <input
                            className="border-0 rounded-md text-center text-md text-black"
                            id="password"
                            placeholder="Enter your password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                backgroundColor: 'white',
                                padding: '8px',
                                marginTop: '5px',
                            }}
                        />
                    </div>

                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '10px' }}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
