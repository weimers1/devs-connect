import { Icon } from '@iconify/react/dist/iconify.js';
import { useState } from 'react';

interface ModalContent {
    children: React.ReactNode;
    title?: string;
}

const Modal: React.FC<ModalContent> = ({ children, title = 'Attention' }) => {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <div
            className={`${
                isHidden ? 'hidden' : ''
            } flex items-center justify-center h-screen`}
        >
            <div className="h-screen w-screen fixed left-0 top-0 bg-slate-900 opacity-50 z-1"></div>
            <div className="bg-white text-md text-blue-700 p-5 mb-50 rounded-lg w-100 lg:w-150 z-2">
                <div className="border-b w-full border-gray-200 flex items-center justify-between pb-4">
                    <div className="text-lg font-bold text-blue-700">
                        {title}
                    </div>
                    <div
                        className="cursor-pointer"
                        onClick={() => {
                            setIsHidden(true);
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
