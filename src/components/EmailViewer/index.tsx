import { api } from "@/services/api";
import { EmailDetail } from "@/types/restaurant";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface EmailViewerProps {
    emailId: string;
    onClose: () => void;
}

const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cre4tiva Newsletter</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        table {
            border-spacing: 0;
            border-collapse: collapse;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        .bg-brand {
            background: linear-gradient(135deg, #111111 0%, #434343 100%);
        }

        .text-accent {
            color: #2E86DE;
        }

        .btn-primary {
            background-color: #2E86DE;
            color: #ffffff;
        }

        @media screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }

            .content-padding {
                padding: 20px !important;
            }

            .mobile-title {
                font-size: 24px !important;
            }
        }
    </style>
</head>

<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
        style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding-top: 40px; padding-bottom: 40px;">
                <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0"
                    style="background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
                    <tr>
                        <td class="bg-brand" align="center" style="padding: 40px 20px; background-color: #111111;">
                            <a href="https://www.cre4tiva.com" target="_blank">
                                <img src="https://cre4tiva.com/assets/img/logo_white.png" alt="Cre4tiva"
                                    width="180" style="display: block; max-width: 100%; height: auto;">
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td class="content-padding" style="padding: 40px 50px 20px 50px; text-align: center;">
                            <h1 class="mobile-title"
                                style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 32px; font-weight: 700; color: #333333; line-height: 1.2;">
                                {title}
                            </h1>
                            <div
                                style="height: 4px; width: 60px; background-color: #2E86DE; margin: 20px auto 0 auto; border-radius: 2px;">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td class="content-padding"
                            style="padding: 0 50px 40px 50px; font-size: 16px; line-height: 1.6; color: #555555; text-align: left;">

                            {body_html}

                            <table role="presentation" border="0" cellspacing="0" cellpadding="0"
                                style="margin-top: 30px; margin-bottom: 30px; width: 100%;">
                                <tr>
                                    <td align="center">
                                        <a href="{link}" target="_blank"
                                            style="background-color: #2E86DE; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 10px rgba(46, 134, 222, 0.3);">
                                            Descubra o seu novo site
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td
                            style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; font-size: 12px; color: #aaaaaa; line-height: 1.5;">
                                © 2026 Cre4tiva. Todos os direitos reservados.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="bg-brand" height="10" style="background-color: #111111;"></td>
                    </tr>
                </table>
                <p style="margin-top: 20px; font-size: 12px; color: #999999;">
                    Sent with ❤️ by Cre4tiva
                </p>
            </td>
        </tr>
    </table>
</body>

</html>`;

export function EmailViewer({ emailId, onClose }: EmailViewerProps) {
    const [email, setEmail] = useState<EmailDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [renderedContent, setRenderedContent] = useState("");

    useEffect(() => {
        const fetchEmailContent = async () => {
            try {
                // @ts-ignore - type mismatch workaround if EmailDetail not yet updated in type definition file used by TS logic in ide
                const data = await api.getEmailContent(emailId);
                setEmail(data as unknown as EmailDetail);

                // Construct HTML with template
                const fullHtml = EMAIL_TEMPLATE
                    .replace("{title}", data.subject || "No Subject")
                    .replace("{body_html}", data.body || "")
                    .replace("{link}", "https://cre4tiva.com"); // Hard text for now or passed link

                setRenderedContent(fullHtml);

            } catch (err: any) {
                setError(err.message || "Error loading email");
            } finally {
                setLoading(false);
            }
        };

        if (emailId) {
            fetchEmailContent();
        }
    }, [emailId]);

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
                onClick={onClose}
            />
            <div className="relative w-full max-w-4xl h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden dark:bg-gray-dark border border-stroke dark:border-strokedark">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stroke dark:border-strokedark bg-gray-50 dark:bg-meta-4">
                    <h3 className="text-xl font-semibold text-black dark:text-white truncate pr-4">
                        {email?.subject || "Email Preview"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors flex-shrink-0"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col relative bg-white dark:bg-gray-dark">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-500 p-6 text-center">
                            <p className="text-lg font-medium">Failed to load email</p>
                            <p className="text-sm mt-2">{error}</p>
                        </div>
                    ) : email ? (
                        <div className="flex flex-col h-full">
                            {/* Metadata Header */}
                            <div className="px-6 py-4 border-b border-stroke dark:border-strokedark bg-white dark:bg-gray-dark space-y-3">
                                <div className="flex flex-wrap text-sm gap-x-6 gap-y-2 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">To:</span>
                                        <span className="text-black dark:text-white">{email.recipient}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">Date:</span>
                                        <span>{new Date(email.sent_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${email.status === 'sent' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                            {email.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Email Body Content */}
                            <div className="flex-1 bg-gray-50 dark:bg-meta-4 p-4 overflow-hidden">
                                <div className="w-full h-full bg-white rounded-md border border-stroke dark:border-strokedark overflow-hidden shadow-sm">
                                    <iframe
                                        srcDoc={renderedContent}
                                        className="w-full h-full border-0"
                                        title="Email Content"
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No content available.
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
