"use client";

import { usePageTitle } from "@/components/PageTitleContext";
import { useEffect } from "react";

export function DashboardTitle() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Dashboard", "RestABot Admin");
    }, []);

    return null;
}
