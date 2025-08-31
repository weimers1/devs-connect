import { assets } from '../assets/assets';
import Login from '../Components/Login';
import Home from '../Components/Home';
import Profile from '../Components/Profile';
import Messages from '../Components/Messages';
import Communities from '../Components/Communities/Communities';

export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    title: string;
    icon: string;
    showInNav: boolean;
}

export const defaultRoutes: RouteConfig[] = [
    {
        path: '/',
        component: Home,
        title: 'Home',
        icon: 'mdi:home-outline',
        showInNav: true,
    },
    {
        path: '/communities',
        component: Communities,
        title: 'Communities',
        icon: 'mdi:account-group-outline',
        showInNav: true,
    },
    {
        path: '/login',
        component: Login,
        title: 'Login',
        icon: 'mdi:login',
        showInNav: true,
    },
];

export const protectedRoutes: RouteConfig[] = [
    {
        path: '/profile',
        component: Profile,
        title: 'Profile',
        icon: 'mdi:account-circle-outline',
        showInNav: true,
    },
    {
        path: '/messages',
        component: Messages,
        title: 'Messages',
        icon: 'mdi:message-reply-text-outline',
        showInNav: true,
    },
];

export const publicRoutes: RouteConfig[] = [
    {
        path: '/login',
        component: Login,
        title: 'Login',
        icon: 'mdi:login',
        showInNav: true,
    },
];