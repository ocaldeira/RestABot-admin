"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface PageTitleContextType {
    title: string;
    subtitle: string;
    setPageTitle: (title: string, subtitle?: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
    undefined
);

export const usePageTitle = () => {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error("usePageTitle must be used within a PageTitleProvider");
    }
    return context;
};

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
    const [title, setTitle] = useState("Dashboard");
    const [subtitle, setSubtitle] = useState("RestABot Admin");

    const setPageTitle = (newTitle: string, newSubtitle: string = "") => {
        setTitle(newTitle);
        setSubtitle(newSubtitle);
    };

    return (
        <PageTitleContext.Provider value={{ title, subtitle, setPageTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
};
