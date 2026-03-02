import { createPortal } from "react-dom";
import { useEffect, useState, ReactNode } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    type?: "success" | "error" | "info";
}

export function Modal({ isOpen, onClose, title, children, type = "info" }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg rounded-lg bg-white p-8 shadow-2xl dark:bg-boxdark transform transition-all scale-100 opacity-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex flex-col items-center text-center">
                    {type === 'success' && (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}

                    {type === 'error' && (
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}

                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">{title}</h3>
                    <div className="text-base text-gray-500 dark:text-gray-400">
                        {children}
                    </div>

                    <button
                        onClick={onClose}
                        className={`mt-8 w-full rounded px-6 py-3 font-medium text-white transition hover:opacity-90 
                    ${type === 'success' ? 'bg-success' : type === 'error' ? 'bg-red' : 'bg-primary'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
