import { Icon } from '@iconify/react/dist/iconify.js';

interface TagProps {
    icon: string;
    text: string;
    bgClass: string;
    textColor: string;
    isFlashing: boolean;
}

const Tag: React.FC<TagProps> = ({
    icon,
    text,
    bgClass,
    textColor,
    isFlashing,
}) => (
    <span
        className={`${bgClass} ${textColor} text-xs ps-2 pe-4 py-1 rounded-full font-semibold whitespace-nowrap flex items-center justify-evenly min-w-20 ${
            isFlashing ? 'animate-pulse' : ''
        }`}
    >
        <Icon
            icon={icon}
            className="w-3 h-3 lg:w-5 lg:h-5"
        />{' '}
        <span>{text}</span>
    </span>
);
export default Tag;
