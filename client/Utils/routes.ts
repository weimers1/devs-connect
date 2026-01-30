import Login from '../Components/Login';
import Home from '../Components/Home';
import Profile from '../Components/Profile/Profile';
import Messages from '../Components/Messages/Messages';
import Communities from '../Components/Communities/Communities';
import Settings from '../Components/Settings/Settings';
import Create from '../Components/Create';

export interface RouteConfig {
    path: string;
    component: React.ComponentType;
    title: string;
    icon: string;
    alt: string;
    showInNav: boolean;
}

export const defaultRoutes: RouteConfig[] = [
    {
        path: '/',
        component: Home,
        title: 'Home',
        icon: 'mdi:home',
        alt: 'home',
        showInNav: true,
    },
    {
        path: '/communities',
        component: Communities,
        title: 'Communities',
        icon: 'mdi:account-group',
        alt: 'Communities',
        showInNav: true,
    },
    {
        path: '/courses',
        component: Home, // Placeholder until Courses component is created
        title: 'Courses',
        icon: 'streamline-freehand:learning-programming-book',
        alt: 'Courses',
        showInNav: false, // REMOVED: Hide courses from navbar as requested
    },

];

export const protectedRoutes: RouteConfig[] = [
    {
        path: '/messages',
        component: Messages,
        title: 'Messages',
        icon: 'mdi:message-reply-text-outline',
        alt: 'Messages',
        showInNav: true,
    },
     {
        path: '/messages/:userId',
        component: Messages,
        title: 'Messages',
        icon: 'mdi:message-reply-text-outline',
        alt: 'Messages',
        showInNav: false,
    },
    {
        path: '/Create',
        component: Create,
        title: 'Create',
        icon: 'oui:ml-create-single-metric-job',
        alt: 'Create',
        showInNav: true,
    },
    {   //Viewing other peoples profiles 
        path: '/profile/:userId',
        component: Profile,
        title: '',
        icon: '',
        alt: '',
        showInNav: false,
    },
    { //Person User Profile
        path: '/profile',
        component: Profile,
        title: 'Profile',
        icon: 'mdi:account-circle-outline',
        alt: 'Profile',
        showInNav: true,
    },
    {
        path: '/settings',
        component: Settings,
        title: 'Settings',
        icon: 'mdi:cog-outline',
        alt: 'Settings',
        showInNav: false,
    },
];

export const publicRoutes: RouteConfig[] = [
    {
        path: '/login',
        component: Login,
        title: 'Login',
        icon: 'mdi:login',
        alt: 'Login',
        showInNav: false,
    },
];
