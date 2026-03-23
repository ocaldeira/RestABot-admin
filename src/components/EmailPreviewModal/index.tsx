import { api } from "@/services/api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface EmailPreviewModalProps {
    propertyId: string;
    onClose: (sent?: boolean) => void;
}

export function EmailPreviewModal({ propertyId, onClose }: EmailPreviewModalProps) {
    const [draft, setDraft] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await api.generateEmail(propertyId, true);
                if (response.draft) {
                    setDraft(response.draft);
                } else {
                    setError(response.message || "Failed to generate preview");
                }
            } catch (err: any) {
                setError(err.message || "Error generating preview");
            } finally {
                setLoading(false);
            }
        };

        if (propertyId) {
            fetchPreview();
        }
    }, [propertyId]);

    const handleSend = async () => {
        if (!draft) return;
        setSending(true);
        try {
            await api.sendDraftEmail(draft);
            onClose(true); // Close and indicate it was sent successfully
        } catch (err: any) {
            setError(err.message || "Failed to send email");
            setSending(false);
        }
    };

    // Prevent scrolling when open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    return createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => !sending && onClose()}
            />
            <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    <h3 className="text-xl font-semibold text-black dark:text-white truncate pr-4">
                        Email Preview
                    </h3>
                    <button
                        onClick={() => !sending && onClose()}
                        disabled={sending}
                        className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-gray-dark">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="text-gray-500 font-medium">Drafting email using AI...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500 p-6 text-center">
                            <div>
                                <p className="text-lg font-medium">Error preparing email preview</p>
                                <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                                <button
                                    onClick={() => onClose()}
                                    className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : draft ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 bg-gray-50 dark:bg-meta-4 p-4 overflow-hidden">
                                <div className="w-full h-full bg-white rounded-md border border-stroke dark:border-strokedark overflow-hidden shadow-sm">
                                    <iframe
                                        srcDoc={draft.html_content}
                                        className="w-full h-full border-0"
                                        title="Email Preview Content"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 border-t border-stroke dark:border-strokedark bg-white dark:bg-gray-dark flex justify-end gap-3">
                                <button
                                    onClick={() => onClose()}
                                    disabled={sending}
                                    className="px-6 py-2 rounded border border-stroke dark:border-strokedark text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={sending}
                                    className="px-6 py-2 rounded bg-primary text-white hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:opacity-70 min-w-[140px]"
                                >
                                    {sending ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Approve & Send</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No preview available.
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
