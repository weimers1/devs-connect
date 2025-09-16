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

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center p-4 z-50 ${
                isHidden ? 'hidden' : ''
            }`}
        >
            <div className="absolute inset-0 bg-slate-900 opacity-50"></div>
            <div className="relative bg-white text-md text-blue-700 p-5 rounded-lg w-full lg:max-w-xl mx-auto z-10">
                <div className="border-b w-full border-gray-200 flex items-center justify-between pb-4">
                    <div className="text-lg font-bold text-blue-700">
                        {title}
                    </div>
                    {allowClose && (
                        <div
                            className="cursor-pointer"
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
                    )}
                </div>
                <div className="flex items-center justify-evenly pt-5 min-h-20">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default Modal;
