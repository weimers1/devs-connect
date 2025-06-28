import { Icon } from '@iconify/react/dist/iconify.js';

interface TagConfig {
    icon: string;
    text: string;
    bgClass: string;
    textColor: string;
}

interface Tags {
    [key: string]: TagConfig;
}

const tagTypes: Tags = {
    trending: {
        icon: 'mdi:flame',
        text: 'Trending',
        bgClass: 'bg-gradient-to-r from-yellow-400 to-red-500',
        textColor: 'text-white',
    },
    new: {
        icon: 'mdi:alert-decagram',
        text: 'New',
        bgClass: 'bg-gradient-to-r from-lime-300 to-green-500',
        textColor: 'text-white',
    },
    premium: {
        icon: 'mdi:star-shooting',
        text: 'Exclusive',
        bgClass: 'bg-gradient-to-r from-blue-300 to-purple-500',
        textColor: 'text-white',
    },
};

interface TagProps {
    type: keyof typeof tagTypes; // Ensures type is a valid key
}

const Tag: React.FC<TagProps> = ({ type }) => (
    <span
        className={`${tagTypes[type].bgClass} ${tagTypes[type].textColor} text-xs ps-2 pe-2 lg:pe-4 py-1 rounded-full font-semibold whitespace-nowrap flex items-center justify-evenly lg:min-w-20`}
    >
        <Icon
            icon={tagTypes[type].icon}
            className="w-3 h-3 lg:w-5 lg:h-5 lg:ms-1"
        />{' '}
        <span className="hidden lg:block">{tagTypes[type].text}</span>
    </span>
);
export default Tag;
