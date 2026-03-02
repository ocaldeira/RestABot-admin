"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useAuth } from "@/components/AuthContext";
import Image from "next/image";
import { useState } from "react";

export default function SettingsPage() {
    const { user, signOut } = useAuth();
    const [showCopied, setShowCopied] = useState(false);

    const copyUID = () => {
        if (user?.uid) {
            navigator.clipboard.writeText(user.uid);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[970px]">
            <Breadcrumb pageName="Settings" />

            <div className="grid grid-cols-1 gap-6">
                {/* Account Info */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-8">
                    <h3 className="mb-6 text-lg font-bold text-dark dark:text-white">
                        Account Information
                    </h3>

                    <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                        <div className="relative">
                            <Image
                                src={user?.photoURL || "/images/user/user-03.png"}
                                alt="Profile photo"
                                width={80}
                                height={80}
                                className="size-20 rounded-full object-cover ring-4 ring-primary/20"
                            />
                            <div className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-green-500 dark:border-gray-dark" />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Name
                                </label>
                                <p className="text-base font-semibold text-dark dark:text-white">
                                    {user?.displayName || "—"}
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Email
                                </label>
                                <p className="text-base font-medium text-dark dark:text-white">
                                    {user?.email || "—"}
                                </p>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Provider
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                        {user?.providerData?.[0]?.providerId === "google.com"
                                            ? "Google"
                                            : user?.providerData?.[0]?.providerId === "password"
                                                ? "Email/Password"
                                                : user?.providerData?.[0]?.providerId || "Unknown"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="my-6 border-stroke dark:border-dark-3" />

                    <div className="flex items-center justify-between">
                        <div>
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                User ID
                            </label>
                            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                                {user?.uid || "—"}
                            </p>
                        </div>
                        <button
                            onClick={copyUID}
                            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-gray-2 dark:border-dark-3 dark:text-white dark:hover:bg-dark-3"
                        >
                            {showCopied ? "✓ Copied" : "Copy UID"}
                        </button>
                    </div>
                </div>

                {/* Authorized Users */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-dark dark:text-white">
                                Authorized Users
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Only these emails can access the admin panel
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    OC
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-dark dark:text-white">
                                        oscarcaldeira@gmail.com
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Owner
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                        To add or remove authorized users, update the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-dark-3">ALLOWED_EMAILS</code> array in{" "}
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-dark-3">AuthContext.tsx</code>
                    </p>
                </div>

                {/* App Info */}
                <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-8">
                    <h3 className="mb-6 text-lg font-bold text-dark dark:text-white">
                        Application
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                App Name
                            </label>
                            <p className="text-sm font-semibold text-dark dark:text-white">
                                RestABot Admin
                            </p>
                        </div>
                        <div className="rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Firebase Project
                            </label>
                            <p className="text-sm font-semibold text-dark dark:text-white">
                                restaobot
                            </p>
                        </div>
                        <div className="rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Framework
                            </label>
                            <p className="text-sm font-semibold text-dark dark:text-white">
                                Next.js 15
                            </p>
                        </div>
                        <div className="rounded-lg border border-stroke px-4 py-3 dark:border-dark-3">
                            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Theme
                            </label>
                            <p className="text-sm font-semibold text-dark dark:text-white">
                                Light / Dark (System)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-[10px] border border-red/20 bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-8">
                    <h3 className="mb-2 text-lg font-bold text-red">
                        Danger Zone
                    </h3>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Log out of the admin panel and return to the sign-in page.
                    </p>
                    <button
                        onClick={signOut}
                        className="rounded-lg bg-red px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red/90"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
