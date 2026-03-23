import { api } from "@/services/api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { WhatsAppIcon, PhoneIcon } from "@/components/Tables/icons";

interface WhatsAppPreviewModalProps {
    propertyId: string;
    phoneNumber?: string;
    onClose: (sent?: boolean) => void;
}

export function WhatsAppPreviewModal({ propertyId, phoneNumber, onClose }: WhatsAppPreviewModalProps) {
    const [draft, setDraft] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [editablePhoneNumber, setEditablePhoneNumber] = useState(phoneNumber || "");
    const [editableMessage, setEditableMessage] = useState("");

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const response = await api.generateWhatsApp(propertyId, true);
                if (response.draft) {
                    setDraft(response.draft);
                    const content = response.draft.content || response.draft.message || "";
                    setEditableMessage(content);
                    if (!editablePhoneNumber && response.draft.phone_number) {
                        setEditablePhoneNumber(response.draft.phone_number);
                    }
                } else if (response.message && (response.success || response.message.length > 50)) {
                    // Treat long messages or success messages as drafts
                    setDraft({ content: response.message });
                    setEditableMessage(response.message);
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

    // Update editable phone number if prop changes
    useEffect(() => {
        if (phoneNumber) setEditablePhoneNumber(phoneNumber);
    }, [phoneNumber]);

    const handleSend = async () => {
        if (!editableMessage || !editablePhoneNumber) {
            if (!editablePhoneNumber) {
                setError("Please provide a phone number.");
            }
            if (!editableMessage) {
                setError("Message content cannot be empty.");
            }
            return;
        }
        setSending(true);
        setError(""); // Clear any previous errors
        try {
            const payload = {
                propertyId,
                phone_number: editablePhoneNumber,
                message: editableMessage
            };
            const result = await api.sendDraftWhatsApp(payload);
            if (result.whatsapp_url) {
                // Open WhatsApp in a new tab
                window.open(result.whatsapp_url, '_blank');
                onClose(true);
            } else {
                throw new Error("Failed to get WhatsApp URL");
            }
        } catch (err: any) {
            setError(err.message || "Failed to process WhatsApp message");
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
            <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    <div className="flex items-center gap-2">
                        <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                        <h3 className="text-xl font-semibold text-black dark:text-white">
                            WhatsApp Preview
                        </h3>
                    </div>
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

                <div className="p-6 overflow-y-auto max-h-[60vh] bg-white dark:bg-gray-dark">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#25D366]"></div>
                            <p className="text-gray-500 font-medium">Drafting WhatsApp message using AI...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-500 text-center">
                            <p className="text-lg font-medium">Error preparing message</p>
                            <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">{error}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {/* Phone Number Input */}
                            <div className="flex flex-col gap-2 bg-gray-50 dark:bg-meta-4 p-4 rounded-lg border border-stroke dark:border-strokedark transition-all">
                                <label className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4 text-primary" />
                                    Recipient Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={editablePhoneNumber}
                                    onChange={(e) => setEditablePhoneNumber(e.target.value)}
                                    placeholder="e.g. +351912345678"
                                    className="w-full px-4 py-2 rounded border border-stroke dark:border-strokedark bg-white dark:bg-gray-dark focus:border-primary outline-none transition-all text-sm"
                                />
                                <p className="text-[10px] text-gray-400">
                                    * Required. Include country code (e.g., +351).
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                                    Message Preview
                                </label>
                                <div className="bg-[#E5DDD5] dark:bg-[#0B141A] p-6 rounded-lg border border-stroke dark:border-strokedark min-h-[150px] relative shadow-inner overflow-hidden">
                                    {/* WhatsApp Chat Style (Sent Message) - Now Editable */}
                                    <div className="bg-[#DCF8C6] dark:bg-[#005C4B] p-4 rounded-lg rounded-tl-none shadow-sm relative max-w-[95%] float-right mb-4 w-full">
                                        <textarea
                                            value={editableMessage}
                                            onChange={(e) => setEditableMessage(e.target.value)}
                                            rows={8}
                                            className="w-full text-[14px] text-black dark:text-gray-100 bg-transparent border-none outline-none resize-none whitespace-pre-wrap break-words leading-relaxed font-sans placeholder:text-gray-400 focus:ring-0"
                                            placeholder="Write your WhatsApp message here..."
                                        />
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1.5 flex items-center justify-end gap-1">
                                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12L7.5 17L17.5 7M10 17L21.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </div>
                                        {/* bubble tail (right side for sent) */}
                                        <div className="absolute right-[-8px] top-0 w-0 h-0 border-t-[10px] border-t-[#DCF8C6] dark:border-t-[#005C4B] border-r-[10px] border-r-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4 flex justify-end gap-3">
                    <button
                        onClick={() => onClose()}
                        disabled={sending}
                        className="px-6 py-2 rounded border border-stroke dark:border-strokedark text-black dark:text-white hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={sending || !draft}
                        className="px-6 py-2 rounded bg-[#25D366] text-white hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 min-w-[180px] font-medium"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <WhatsAppIcon className="w-4 h-4" />
                                <span>Open WhatsApp</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
