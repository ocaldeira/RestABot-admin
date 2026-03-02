import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
}: ConfirmModalProps) {
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
            <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl dark:bg-boxdark transform transition-all">
                <div className="flex flex-col items-center text-center">
                    {/* Warning icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10 mb-6">
                        <svg className="h-8 w-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-black dark:text-white mb-2">{title}</h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 mb-8">{message}</p>

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded px-6 py-3 font-medium text-black dark:text-white bg-gray-2 dark:bg-dark-2 hover:bg-opacity-80 transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 rounded px-6 py-3 font-medium text-white bg-red hover:bg-opacity-90 transition disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
