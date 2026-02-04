import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
// import { useTheme } from '../../src/ThemeContext';
import { useAuth } from '../Auth/AuthContext';
import API from '../../Service/service';
import { assets } from '../../assets/assets';

function ProfileDropdown() {
    const [userProfile, setUserProfile] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    // const { resetTheme, theme } = useTheme();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        // resetTheme();
        navigate('/');
    };
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const response = API.getProfileInformation();
                const name = API.getProfileInformation();
                //First Name Of USER
                name.then((firstName) => {
                    setFirstName(firstName.firstName);
                });
                //LAST NAME OF USER
                name.then((lastName) => {
                    setLastName(lastName.lastName);
                });
                //EMAIL OF USER
                name.then((Email) => {
                    setEmail(Email.email);
                });
                //PROFILE PICTURE OF USER
                response.then((data) => {
                    setUserProfile(data.pfp);
                });
            } catch (error) {
                console.log('ERROR WITH GETTING PROF');
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, []);

    const menuItems = [
        {
            label: 'Your Profile',
            icon: 'mdi:account-circle',
            to: '/profile',
        },
        {
            label: 'Settings',
            icon: 'mdi:cog',
            to: '/settings',
        },
        {
            label: 'Help & Support',
            icon: 'mdi:help-circle',
            to: '/help',
        },
    ];
    if(loading) (
        <div>Loading...</div>
    )

    return (
        <div
            className={`absolute -right-1 bg-stone-200 top-20 ml-2 w-70 rounded-lg shadow-xl border z-50 
             
            `}
        >
            {/* User Info Section */}
            <div
                className={`px-4 py-3 border-b 
                 
                `}
            >
                <div className="flex items-center space-x-3">
                    {userProfile && (
                        <img
                            alt="Profile"
                            src={userProfile || assets.Profile}
                            className="w-10 h-10 rounded-3xl"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    {/* // : (
                    //     // <span className="text-purple font-medium">U</span>
                    // ) */}
                    <div className="flex-1 min-w-0">
                        <p
                            className={`text-me font-medium truncate 
                              
                            `}
                        >
                            {firstName} {lastName}
                        </p>
                        <p
                            className={`text-me truncate 
                               
                            `}
                        >
                            {email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={` hover:bg-gray-700 flex items-center px-4 py-2 text-me transition-colors 
                           
                        `}
                    >
                        <Icon
                            icon={item.icon}
                            className="w-4 h-4 mr-3"
                        />
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Divider */}
            <div
                className={`border-t 
                    // theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                `}
            />

            {/* Logout Button */}
            <div className="py-1">
                <button
                    onClick={handleLogout}
                    className={`w-full  hover:bg-gray-700 flex items-center px-4 py-2 text-me text-left transition-colors 
                        
                    `}
                >
                    <Icon
                        icon="mdi:logout"
                        className="w-4 h-4 mr-3"
                    />
                    Sign out
                </button>
            </div>
        </div>
    );
}

export default ProfileDropdown;
