"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { api } from "@/services/api";
import { Payment } from "@/types/payment";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { createPortal } from "react-dom";
import { PreviewIcon, TrashIcon } from "@/components/Tables/icons";
import { usePageTitle } from "@/components/PageTitleContext";

function formatAmount(amount: number, currency: string): string {
    const value = (amount / 100).toFixed(2);
    const symbols: Record<string, string> = { eur: "€", usd: "$", gbp: "£" };
    const sym = symbols[currency.toLowerCase()] || currency.toUpperCase();
    return `${value} ${sym}`;
}

function formatDate(dateStr: string | number): string {
    if (typeof dateStr === "number") {
        return new Date(dateStr * 1000).toLocaleDateString("es-ES", {
            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
        });
    }
    return new Date(dateStr).toLocaleDateString("es-ES", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function StatusBadge({ status, type }: { status: string; type: "payment" | "session" }) {
    const colors: Record<string, string> = {
        paid: "bg-success bg-opacity-10 text-success",
        complete: "bg-success bg-opacity-10 text-success",
        unpaid: "bg-red bg-opacity-10 text-red",
        incomplete: "bg-red bg-opacity-10 text-red",
        no_payment_required: "bg-primary bg-opacity-10 text-primary",
        open: "bg-warning bg-opacity-10 text-warning",
        expired: "bg-gray-400 bg-opacity-10 text-gray-500",
    };
    const cls = colors[status] || "bg-gray-2 text-gray-500 dark:bg-dark-2 dark:text-gray-400";
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
            {type === "payment" ? "Pay: " : ""}{status}
        </span>
    );
}

export function PaymentsList() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", type: "info" });
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const limit = 20;

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Payments", "Manage payments & subscriptions");
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [page]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const data = await api.getPayments(skip, limit, searchQuery);
            setPayments(data.payments);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (page !== 1) {
                setPage(1);
            } else {
                fetchPayments();
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleDeleteConfirm = async () => {
        if (!deleteTargetId) return;
        setDeleting(true);
        try {
            await api.deletePayment(deleteTargetId);
            setPayments((prev) => prev.filter((p) => p.id !== deleteTargetId && p._id !== deleteTargetId));
            setTotal((prev) => prev - 1);
            if (selectedPayment?.id === deleteTargetId || selectedPayment?._id === deleteTargetId) {
                setSelectedPayment(null);
            }
            setDeleteTargetId(null);
            setModal({ isOpen: true, title: "Success", message: "Payment deleted successfully", type: "success" });
        } catch (error) {
            console.error("Failed to delete payment:", error);
            setModal({ isOpen: true, title: "Error", message: "Failed to delete payment", type: "error" });
        } finally {
            setDeleting(false);
        }
    };

    // Drawer Component
    const Drawer = ({ payment: initialPayment, onClose }: { payment: Payment; onClose: () => void }) => {
        const [payment, setPayment] = useState<Payment>(initialPayment);
        const [showRaw, setShowRaw] = useState(false);
        const [mounted, setMounted] = useState(false);
        const [loadingDetails, setLoadingDetails] = useState(false);

        useEffect(() => {
            setMounted(true);
            document.body.style.overflow = "hidden";

            const fetchDetails = async () => {
                const targetId = initialPayment.id || initialPayment._id;
                if (targetId) {
                    setLoadingDetails(true);
                    try {
                        const details = await api.getPayment(targetId);
                        setPayment((prev) => ({ ...prev, ...details }));
                    } catch (error) {
                        console.error("Failed to fetch payment details:", error);
                    } finally {
                        setLoadingDetails(false);
                    }
                }
            };
            fetchDetails();

            return () => {
                document.body.style.overflow = "unset";
            };
        }, [initialPayment.id, initialPayment._id]);

        if (!mounted) return null;

        return createPortal(
            <div className="fixed inset-0 z-[99999] flex justify-end">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer Panel */}
                <div className="relative w-full max-w-2xl bg-white p-6 shadow-xl dark:bg-gray-dark overflow-y-auto transform transition-transform duration-300 ease-in-out h-full border-l border-stroke dark:border-strokedark">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    >
                        ✕
                    </button>

                    <div className="mb-8 mt-2">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-black dark:text-white pr-8">
                                    {payment.customer_name || "N/A"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">{payment.customer_email}</p>
                                <div className="flex gap-2 mt-2">
                                    <StatusBadge status={payment.payment_status} type="payment" />
                                    <StatusBadge status={payment.status} type="session" />
                                    <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
                                        {payment.mode}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`/payments/${payment.id}`}
                                className="flex items-center justify-center p-2.5 rounded bg-primary text-white hover:bg-opacity-90 transition-colors"
                                title="Edit Payment"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                                <span className="ml-2">Edit</span>
                            </a>

                            <button
                                onClick={() => { onClose(); setDeleteTargetId(payment.id || payment._id || null); }}
                                disabled={deleting}
                                className="flex items-center justify-center p-2.5 rounded bg-red text-white hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                                title="Delete"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Amount */}
                        <div>
                            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Amount</h3>
                            <p className="text-3xl font-bold text-black dark:text-white">
                                {formatAmount(payment.amount_total, payment.currency)}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div>
                            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Customer Name</p>
                                    <p className="text-black dark:text-white">{payment.customer_name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                                    <p className="text-black dark:text-white">{payment.customer_email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                    <p className="text-black dark:text-white">{payment.customer_phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Customer ID</p>
                                    <p className="text-black dark:text-white font-mono text-xs break-all">{payment.customer_id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Subscription ID</p>
                                    <p className="text-black dark:text-white font-mono text-xs break-all">{payment.subscription_id || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Invoice ID</p>
                                    <p className="text-black dark:text-white font-mono text-xs break-all">{payment.invoice_id || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Stripe Created</p>
                                    <p className="text-black dark:text-white">{formatDate(payment.stripe_created)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                                    <p className="text-black dark:text-white">
                                        {payment.created_at ? formatDate(typeof payment.created_at === "object" ? (payment.created_at as any).$date : payment.created_at) : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        {payment.metadata && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Metadata</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm bg-gray-2 dark:bg-dark-2 p-4 rounded-lg">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                                        <p className="text-black dark:text-white capitalize font-medium">{payment.metadata.plan}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">Restaurant ID</p>
                                        <p className="text-black dark:text-white font-mono text-xs break-all">{payment.metadata.restaurant_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400 mb-1">Slug</p>
                                        <p className="text-black dark:text-white">{payment.metadata.slug}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {payment.description && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Description</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{payment.description}</p>
                            </div>
                        )}

                        {/* Raw Data */}
                        <div className="pt-4 border-t border-stroke dark:border-strokedark">
                            <button
                                onClick={() => setShowRaw(!showRaw)}
                                className="flex items-center justify-between w-full text-left font-semibold text-black dark:text-white hover:text-primary dark:hover:text-primary transition-colors"
                            >
                                <span>Raw Data</span>
                                <span className={`transform transition-transform ${showRaw ? "rotate-180" : ""}`}>▼</span>
                            </button>

                            {showRaw && (
                                <pre className="mt-4 w-full overflow-x-auto rounded-lg bg-gray-2 p-4 text-xs font-mono text-black dark:bg-black dark:text-gray-300 border border-stroke dark:border-strokedark shadow-inner">
                                    {JSON.stringify(payment, null, 2)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <>
            <Breadcrumb pageName="Payments" />

            <div className="rounded-[10px] bg-white text-black shadow-1 dark:bg-gray-dark dark:text-white dark:shadow-card">
                <div className="px-4 py-6 md:px-6 xl:px-9">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h4 className="text-xl font-bold">
                                All Payments ({total})
                            </h4>
                            <input
                                type="text"
                                placeholder="Search by email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 rounded-t-[10px] bg-gray-2 px-4 py-4.5 dark:bg-dark-2 md:px-6 2xl:px-7.5">
                                <div className="col-span-4 flex items-center">
                                    <p className="font-medium">Customer</p>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="font-medium">Amount</p>
                                </div>
                                <div className="col-span-2 hidden items-center sm:flex">
                                    <p className="font-medium">Status</p>
                                </div>
                                <div className="col-span-2 hidden items-center md:flex">
                                    <p className="font-medium">Mode / Date</p>
                                </div>
                                <div className="col-span-2 flex items-center justify-end">
                                    <p className="font-medium">Actions</p>
                                </div>
                            </div>

                            {payments?.map((item, key) => (
                                <div
                                    className={`grid grid-cols-12 border-t border-stroke px-4 py-4.5 dark:border-strokedark md:px-6 2xl:px-7.5 ${key === payments.length - 1 ? "" : "border-b"}`}
                                    key={item._id || key}
                                >
                                    {/* Customer */}
                                    <div className="col-span-4 flex items-center">
                                        <div className="flex flex-col gap-1 overflow-hidden">
                                            <p className="text-sm font-bold text-black dark:text-white truncate">
                                                {item.customer_name || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{item.customer_email}</p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-2 hidden items-center sm:flex">
                                        <p className="text-sm font-semibold text-black dark:text-white">
                                            {formatAmount(item.amount_total, item.currency)}
                                        </p>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 hidden items-center sm:flex gap-1 flex-wrap">
                                        <StatusBadge status={item.payment_status} type="payment" />
                                    </div>

                                    {/* Mode / Date */}
                                    <div className="col-span-2 hidden items-center md:flex">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-2 py-0.5 text-xs font-medium text-primary w-fit">
                                                {item.mode}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(item.stripe_created)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedPayment(item)}
                                            className="hover:text-primary transition-colors p-2"
                                            title="View Details"
                                        >
                                            <PreviewIcon />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTargetId(item.id || item._id || null)}
                                            disabled={deleting}
                                            className="hover:text-red transition-colors p-2 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="rounded px-3 py-1 bg-gray-2 dark:bg-dark-2 disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="self-center">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="rounded px-3 py-1 bg-gray-2 dark:bg-dark-2 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Render Drawer if payment selected */}
            {selectedPayment && (
                <Drawer
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Payment"
                message="Are you sure you want to delete this payment? This action will mark it as deleted."
                confirmText="Delete"
                loading={deleting}
            />

            {/* Notification Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                type={modal.type}
            >
                {modal.message}
            </Modal>
        </>
    );
}
