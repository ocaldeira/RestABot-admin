"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { api } from "@/services/api";
import { Restaurant } from "@/types/restaurant";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { EmailViewer } from "@/components/EmailViewer";
import { createPortal } from "react-dom";
import { PreviewIcon, GlobeIcon, MailIcon, TrashIcon, EyeIcon } from "@/components/Tables/icons";
import { usePageTitle } from "@/components/PageTitleContext";


export function RestaurantsList() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generatingPreview, setGeneratingPreview] = useState(false);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "success" | "error" | "info";
    }>({ isOpen: false, title: "", message: "", type: "info" });

    const [filterWebsite, setFilterWebsite] = useState<boolean | null>(null); // null = all, true = generated, false = not
    const [filterEmail, setFilterEmail] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [viewingEmailId, setViewingEmailId] = useState<string | null>(null);

    const limit = 20;

    useEffect(() => {
        fetchRestaurants();
    }, [page, filterWebsite, filterEmail]); // Added filter dependencies

    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Restaurants", "Manage and generate websites");
    }, []);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const skip = (page - 1) * limit;
            const data = await api.getRestaurants(skip, limit, searchQuery, filterWebsite, filterEmail); // Pass searchQuery and filters
            setRestaurants(data.restaurants);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch restaurants:", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            // When search query changes, reset to page 1
            if (page !== 1) {
                setPage(1);
            } else {
                // If already on page 1, just refetch with the new query
                fetchRestaurants();
            }
        }, 500); // 500ms debounce

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);


    const handleDelete = async (id: string | undefined) => {
        if (!id || !confirm("Are you sure you want to delete this restaurant?"))
            return;

        setDeleting(true);
        try {
            await api.deleteRestaurant(id);
            setRestaurants((prev) => prev.filter((r) => r._id !== id));
            setTotal((prev) => prev - 1);
            if (selectedRestaurant?._id === id) {
                setSelectedRestaurant(null);
            }
            setModal({ isOpen: true, title: "Success", message: "Restaurant deleted successfully", type: "success" });
        } catch (error) {
            console.error("Failed to delete restaurant:", error);
            setModal({ isOpen: true, title: "Error", message: "Failed to delete restaurant", type: "error" });
        } finally {
            setDeleting(false);
        }
    };

    const handleGenerateWeb = async (restaurant: Restaurant) => {
        if (!restaurant.id) return;
        setGenerating(true);
        try {
            await api.createWebConfig(restaurant.id);
            setModal({ isOpen: true, title: "Success", message: "Web config generated successfully!", type: "success" });

            // Refetch list
            fetchRestaurants();

            // Refetch specific restaurant to update Drawer buttons immediately
            const updatedRestaurant = await api.getRestaurant(restaurant.id);
            setSelectedRestaurant(updatedRestaurant);
        } catch (error) {
            console.error("Failed to generate web config:", error);
            setModal({ isOpen: true, title: "Error", message: "Failed to generate web config", type: "error" });
        } finally {
            setGenerating(false);
        }
    };

    const handleSendCommunication = async () => {
        if (!selectedRestaurant?.id) return;

        setSending(true);
        try {
            // Using restaurant.id which corresponds to propertyId/Google Place ID
            await api.generateEmail(selectedRestaurant.id);
            setModal({ isOpen: true, title: "Success", message: "Email sent successfully!", type: "success" });
        } catch (error: any) {
            console.error("Error sending email:", error);
            setModal({ isOpen: true, title: "Error", message: error.message || "Failed to send email.", type: "error" });
        } finally {
            setSending(false);
        }
    };

    const handleGeneratePreview = async (restaurant?: Restaurant) => {
        // Use restaurant from argument (priority) or selectedRestaurant
        const targetRestaurant = restaurant || selectedRestaurant;
        if (!targetRestaurant) return;

        const targetSlug = targetRestaurant.websiteSlug; // Only use websiteSlug

        if (!targetSlug) {
            setModal({ isOpen: true, title: "Error", message: "Missing websiteSlug for preview generation.", type: "error" });
            return;
        }

        setGeneratingPreview(true);
        try {
            await api.generateThumbnail(targetSlug);
            setModal({ isOpen: true, title: "Success", message: "Preview generation started!", type: "success" });
        } catch (error: any) {
            console.error("Error generating preview:", error);
            setModal({ isOpen: true, title: "Error", message: error.message || "Failed to generate preview.", type: "error" });
        } finally {
            setGeneratingPreview(false);
        }
    };


    // Drawer Component
    const Drawer = ({ restaurant: initialRestaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) => {
        const [restaurant, setRestaurant] = useState<Restaurant>(initialRestaurant);
        const [showRaw, setShowRaw] = useState(false);
        const [mounted, setMounted] = useState(false);
        const [loadingDetails, setLoadingDetails] = useState(false);

        useEffect(() => {
            setMounted(true);
            // Prevent scrolling on body when drawer is open
            document.body.style.overflow = 'hidden';

            // Fetch full details
            const fetchDetails = async () => {
                // User requested to use Google Place ID (id) instead of MongoDB ID (_id)
                const targetId = initialRestaurant.id || initialRestaurant._id;

                if (targetId) {
                    setLoadingDetails(true);
                    try {
                        const details = await api.getRestaurant(targetId);
                        setRestaurant(prev => ({ ...prev, ...details }));
                    } catch (error) {
                        console.error("Failed to fetch details:", error);
                    } finally {
                        setLoadingDetails(false);
                    }
                }
            };
            fetchDetails();

            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [initialRestaurant.id, initialRestaurant._id]);

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
                                    {restaurant.name}
                                </h2>
                                <div className="flex gap-2 mt-2">
                                    {restaurant.websiteGenerated && (
                                        <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                                            Website Generated
                                        </span>
                                    )}
                                    {restaurant.emailSent && (
                                        <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-3 py-1 text-sm font-medium text-primary">
                                            Email Sent
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Horizontal */}
                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`/restaurants/${restaurant.id}`}
                                className="flex items-center justify-center p-2.5 rounded bg-meta-3 bg-primary text-white hover:bg-opacity-90 transition-colors"
                                title="Edit Restaurant"
                            >
                                <svg
                                    className="w-5 h-5 fill-current"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                                <span className="ml-2">Edit</span>
                            </a>

                            <button
                                onClick={() => handleGenerateWeb(restaurant)}
                                disabled={generating}
                                className="flex items-center justify-center p-2.5 rounded bg-primary text-white hover:bg-opacity-90 disabled:opacity-70"
                                title="Generate AI Website"
                            >
                                <GlobeIcon className="w-5 h-5" />
                                <span className="ml-2">Generate Website</span>
                            </button>

                            {restaurant.websiteSlug && (
                                <>
                                    <button
                                        onClick={() => handleGeneratePreview(restaurant)}
                                        disabled={generatingPreview}
                                        className="flex items-center justify-center p-2.5 rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-70"
                                        title="Generate Preview"
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSendCommunication}
                                        disabled={sending}
                                        className="flex items-center justify-center p-2.5 rounded border border-meta-5 text-meta-5 hover:bg-meta-5 hover:text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                        title="Send Communication"
                                    >
                                        <MailIcon className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => handleDelete(restaurant._id)}
                                disabled={deleting}
                                className="flex items-center justify-center p-2.5 rounded bg-red text-white hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
                                title="Delete"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Photos */}
                        {restaurant.photos && restaurant.photos.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Photos</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 snap-x text-black dark:text-white">
                                    {restaurant.photos.slice(0, 10).map((photo, i) => (
                                        <div key={i} className="flex-none w-48 h-32 rounded-lg overflow-hidden snap-center border border-stroke dark:border-strokedark">
                                            <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Details Grid */}
                        <div>
                            <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Address</p>
                                    <p className="text-black dark:text-white">{restaurant.address}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                                    <p className="text-black dark:text-white">{restaurant.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Website</p>
                                    {restaurant.website ? (
                                        <a href={restaurant.website} target="_blank" className="text-primary hover:underline break-all">
                                            {restaurant.website}
                                        </a>
                                    ) : (
                                        <span className="text-black dark:text-white">N/A</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Google Maps</p>
                                    {/* @ts-ignore */}
                                    {restaurant.google_maps_url ? (
                                        /* @ts-ignore */
                                        <a href={restaurant.google_maps_url} target="_blank" className="text-primary hover:underline">
                                            View on Maps ↗
                                        </a>
                                    ) : (
                                        <span className="text-black dark:text-white">N/A</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Coordinates</p>
                                    <p className="text-black dark:text-white">
                                        {/* @ts-ignore */}
                                        {restaurant.latitude && restaurant.longitude ? (
                                            /* @ts-ignore */
                                            <>{restaurant.latitude.toFixed(6)}, {restaurant.longitude.toFixed(6)}</>
                                        ) : restaurant.location && typeof restaurant.location === 'object' && 'lat' in restaurant.location ? (
                                            /* @ts-ignore */
                                            <>{restaurant.location.lat?.toFixed(6)}, {restaurant.location.lng?.toFixed(6)}</>
                                        ) : (
                                            "N/A"
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">Rating</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-black dark:text-white font-medium">{restaurant.rating}</span>
                                        <span className="text-gray-400">/ 5</span>
                                        <span className="text-xs text-gray-500">({restaurant.user_ratings_total} reviews)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Opening Hours */}
                        {/* @ts-ignore */}
                        {restaurant.opening_hours && restaurant.opening_hours.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Opening Hours</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-2 dark:bg-dark-2 p-4 rounded-lg">
                                    {/* @ts-ignore */}
                                    {restaurant.opening_hours.map((hour: string, i: number) => (
                                        <li key={i}>{hour}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Reviews Preview */}
                        {restaurant.reviews && restaurant.reviews.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Latest Reviews</h3>
                                <div className="space-y-4">
                                    {restaurant.reviews.slice(0, 3).map((review, i) => (
                                        <div key={i} className="border-b border-stroke dark:border-strokedark pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-black dark:text-white">{review.author_name}</span>
                                                <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                                            </div>
                                            <div className="flex items-center mb-2">
                                                {Array.from({ length: 5 }).map((_, starI) => (
                                                    <span key={starI} className={`text-sm ${starI < review.rating ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Email History */}
                        {restaurant.emailSent && restaurant.emails && restaurant.emails.length > 0 && (
                            <div>
                                <h3 className="mb-3 text-lg font-semibold text-black dark:text-white">Email History</h3>
                                <div className="space-y-2">
                                    {restaurant.emails.map((email: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-2 dark:bg-dark-2 rounded-lg border border-stroke dark:border-strokedark">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-black dark:text-white">{email.subject}</span>
                                                <span className="text-xs text-gray-500">{new Date(email.sent_at || email.sentAt).toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={() => setViewingEmailId(email.id)}
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                View
                                            </button>
                                        </div>
                                    ))}
                                </div>
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
                                    {JSON.stringify(restaurant, null, 2)}
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
            <Breadcrumb pageName="Restaurants" />

            <div className="rounded-[10px] bg-white text-black shadow-1 dark:bg-gray-dark dark:text-white dark:shadow-card">
                <div className="px-4 py-6 md:px-6 xl:px-9">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h4 className="text-xl font-bold">
                                All Restaurants ({total})
                            </h4>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterWebsite(filterWebsite === true ? null : true)}
                                className={`px-3 py-1 text-sm rounded-full border ${filterWebsite === true
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-500 border-stroke dark:bg-gray-dark dark:text-gray-400 dark:border-strokedark"
                                    }`}
                            >
                                Has Website
                            </button>
                            <button
                                onClick={() => setFilterEmail(filterEmail === true ? null : true)}
                                className={`px-3 py-1 text-sm rounded-full border ${filterEmail === true
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-500 border-stroke dark:bg-gray-dark dark:text-gray-400 dark:border-strokedark"
                                    }`}
                            >
                                Email Sent
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="flex flex-col">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 rounded-t-[10px] bg-gray-2 px-4 py-4.5 dark:bg-dark-2 md:px-6 2xl:px-7.5">
                                <div className="col-span-6 flex items-center">
                                    <p className="font-medium">Restaurant Info</p>
                                </div>
                                <div className="col-span-3 hidden items-center sm:flex">
                                    <p className="font-medium">Status</p>
                                </div>
                                <div className="col-span-2 flex items-center">
                                    <p className="font-medium">Rating</p>
                                </div>
                                <div className="col-span-1 flex items-center justify-end">
                                    <p className="font-medium">View</p>
                                </div>
                            </div>

                            {restaurants
                                ?.map((item, key) => (
                                    <div
                                        className={`grid grid-cols-12 border-t border-stroke px-4 py-4.5 dark:border-strokedark md:px-6 2xl:px-7.5 ${key === restaurants.length - 1 ? "" : "border-b"
                                            }`}
                                        key={item._id || key}
                                    >
                                        <div className="col-span-6 flex items-center gap-4">
                                            {item.photos && item.photos.length > 0 && (
                                                <div className="h-16 w-16 rounded-md min-w-[64px] overflow-hidden">
                                                    <img
                                                        src={item.photos[0]}
                                                        alt="Restaurant"
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                <p className="text-lg font-bold text-black dark:text-white truncate">
                                                    {item.name}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                                    {item.address && (
                                                        <span className="truncate max-w-[200px]" title={item.address}>
                                                            {item.address}
                                                        </span>
                                                    )}
                                                    {item.address && item.phone && <span>•</span>}
                                                    {item.phone && <span>{item.phone}</span>}
                                                </div>
                                                {item.website && (
                                                    <a
                                                        href={item.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary hover:underline truncate w-fit"
                                                    >
                                                        {item.website}
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        <div className="col-span-3 hidden items-center sm:flex gap-2">
                                            {item.websiteGenerated && (
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_GENERATED_WEB_URL}/${item.websiteSlug || item._id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success hover:bg-opacity-20 transition-all cursor-pointer"
                                                >
                                                    Web
                                                </a>
                                            )}
                                            {item.emailSent && (
                                                <span className="inline-flex rounded-full bg-primary bg-opacity-10 px-3 py-1 text-sm font-medium text-primary">
                                                    Email
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-span-2 flex items-center">
                                            <p className="text-sm text-black dark:text-white">
                                                {item.rating} ({item.user_ratings_total})
                                            </p>
                                        </div>

                                        <div className="col-span-1 flex items-center justify-end">
                                            <button
                                                onClick={() => setSelectedRestaurant(item)}
                                                className="hover:text-primary transition-colors p-2"
                                                title="View Details"
                                            >
                                                <PreviewIcon />
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

            {/* Render Drawer if restaurant selected */}
            {selectedRestaurant && (
                <Drawer
                    restaurant={selectedRestaurant}
                    onClose={() => setSelectedRestaurant(null)}
                />
            )}

            {/* Notification Modal */}
            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                type={modal.type}
            >
                {modal.message}
            </Modal>

            {/* Email Viewer Modal */}
            {viewingEmailId && (
                <EmailViewer
                    emailId={viewingEmailId}
                    onClose={() => setViewingEmailId(null)}
                />
            )}
        </>
    );
}
