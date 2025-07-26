import { Icon } from '@iconify/react/dist/iconify.js';
import { useEffect, useState } from 'react';

interface ModalContent {
    children: React.ReactNode;
    title?: string;
    allowClose?: boolean;
    onClose?: () => void;
}

const Modal: React.FC<ModalContent> = ({
    children,
    title = 'Attention',
    allowClose = true,
    onClose,
}) => {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        setIsHidden(false);
    }, [title, children, allowClose]);

    return (
        <div
            className={`${
                isHidden ? 'hidden' : ''
            } absolute flex items-center justify-center w-9/10 h-full`}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full fixed left-0 top-0 bg-slate-900 opacity-50 z-1"></div>
            <div className="bg-white text-md text-blue-700 p-5 mb-80 rounded-lg w-100 lg:w-150 z-2">
                <div className="border-b w-full border-gray-200 flex items-center justify-between pb-4">
                    <div className="text-lg font-bold text-blue-700">
                        {title}
                    </div>
                    <div
                        className={`cursor-pointer ${
                            allowClose ? '' : 'hidden'
                        }`}
                        onClick={() => {
                            setIsHidden(true);
                            onClose?.();
                        }}
                    >
                        <Icon
                            icon="mdi-close"
                            className="w-5 h-5 lg:ms-1 text-gray-400"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-evenly pt-5 min-h-20">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal;
