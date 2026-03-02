"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";

// Email whitelist — only these emails can access the admin panel
const ALLOWED_EMAILS = [
    "oscarcaldeira@gmail.com",
];

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check whitelist
                const email = firebaseUser.email?.toLowerCase();
                if (email && ALLOWED_EMAILS.includes(email)) {
                    setUser(firebaseUser);
                } else {
                    // Not in whitelist — sign out immediately
                    await firebaseSignOut(auth);
                    setUser(null);
                    router.push("/auth/sign-in?error=access_denied");
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        if (loading) return;

        const isAuthRoute = pathname.startsWith("/auth");

        if (!user && !isAuthRoute) {
            router.push("/auth/sign-in");
        }

        if (user && isAuthRoute) {
            router.push("/");
        }
    }, [user, loading, pathname, router]);

    const handleSignOut = async () => {
        await firebaseSignOut(auth);
        router.push("/auth/sign-in");
    };

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
                    <p className="text-sm font-medium text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
}

