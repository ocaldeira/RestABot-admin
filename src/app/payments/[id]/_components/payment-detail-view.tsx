"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { api } from "@/services/api";
import { Payment } from "@/types/payment";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useRouter } from "next/navigation";
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

export function PaymentDetailView({ id }: { id: string }) {
    const router = useRouter();
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Editable fields
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");

    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", type: "info" });

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Payment Detail", "View and edit payment");
    }, []);

    useEffect(() => {
        const fetchPayment = async () => {
            setLoading(true);
            try {
                const data = await api.getPayment(id);
                setPayment(data);
                setDescription(data.description || "");
                setStatus(data.status || "");
            } catch (error) {
                console.error("Failed to fetch payment:", error);
                setModal({ isOpen: true, title: "Error", message: "Failed to load payment details", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchPayment();
    }, [id]);

    const handleSave = async () => {
        if (!payment) return;
        setSaving(true);
        try {
            const updated = await api.updatePayment(payment.id || payment._id, {
                description,
                status,
            });
            setPayment((prev) => (prev ? { ...prev, ...updated } : prev));
            setModal({ isOpen: true, title: "Success", message: "Payment updated successfully", type: "success" });
        } catch (error) {
            console.error("Failed to update payment:", error);
            setModal({ isOpen: true, title: "Error", message: "Failed to update payment", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!payment) return;
        setDeleting(true);
        try {
            await api.deletePayment(payment.id || payment._id);
            setShowDeleteConfirm(false);
            setModal({ isOpen: true, title: "Success", message: "Payment deleted successfully", type: "success" });
            setTimeout(() => router.push("/payments"), 1500);
        } catch (error) {
            console.error("Failed to delete payment:", error);
            setModal({ isOpen: true, title: "Error", message: "Failed to delete payment", type: "error" });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Breadcrumb pageName="Payment Detail" />
                <div className="rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <p className="text-black dark:text-white">Loading...</p>
                </div>
            </>
        );
    }

    if (!payment) {
        return (
            <>
                <Breadcrumb pageName="Payment Detail" />
                <div className="rounded-[10px] bg-white p-8 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <p className="text-black dark:text-white">Payment not found.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Breadcrumb pageName="Payment Detail" />

            <div className="grid grid-cols-1 gap-6">
                {/* Header Card */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-black dark:text-white">
                                {payment.customer_name || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{payment.customer_email}</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${payment.payment_status === "paid" ? "bg-success bg-opacity-10 text-success" : "bg-red bg-opacity-10 text-red"}`}>
                                    {payment.payment_status}
                                </span>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${payment.status === "complete" ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"}`}>
                                    {payment.status}
                                </span>
                                <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
                                    {payment.mode}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-black dark:text-white">
                                {formatAmount(payment.amount_total, payment.currency)}
                            </p>
                        </div>
                    </div>

                    {/* Action bar */}
                    <div className="flex gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                        <button
                            onClick={() => router.push("/payments")}
                            className="flex items-center px-4 py-2.5 rounded border border-stroke text-black dark:text-white dark:border-strokedark hover:bg-gray-2 dark:hover:bg-dark-2 transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleting}
                            className="flex items-center px-4 py-2.5 rounded bg-red text-white hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>

                {/* Details Card */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h3 className="mb-6 text-lg font-semibold text-black dark:text-white">Payment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Session ID</p>
                            <p className="text-black dark:text-white font-mono text-xs break-all">{payment.id}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Slug</p>
                            <p className="text-black dark:text-white">{payment.slug}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Customer ID</p>
                            <p className="text-black dark:text-white font-mono text-xs break-all">{payment.customer_id}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                            <p className="text-black dark:text-white">{payment.customer_phone || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Subscription ID</p>
                            <p className="text-black dark:text-white font-mono text-xs break-all">{payment.subscription_id || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 mb-1">Payment Intent ID</p>
                            <p className="text-black dark:text-white font-mono text-xs break-all">{payment.payment_intent_id || "N/A"}</p>
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
                        {payment.deleted_at && (
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Deleted At</p>
                                <p className="text-red">{formatDate(typeof payment.deleted_at === "object" ? (payment.deleted_at as any).$date : payment.deleted_at)}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Card */}
                {payment.metadata && (
                    <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
                        <h3 className="mb-6 text-lg font-semibold text-black dark:text-white">Metadata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                                <p className="text-black dark:text-white capitalize font-medium text-lg">{payment.metadata.plan}</p>
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

                {/* Editable Section */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
                    <h3 className="mb-6 text-lg font-semibold text-black dark:text-white">Edit Payment</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            >
                                <option value="complete">complete</option>
                                <option value="open">open</option>
                                <option value="expired">expired</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                placeholder="Add a description..."
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-3 px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded bg-primary px-8 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
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
