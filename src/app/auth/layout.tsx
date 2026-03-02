export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-2 dark:bg-[#020d1a]">
            {children}
        </div>
    );
}
