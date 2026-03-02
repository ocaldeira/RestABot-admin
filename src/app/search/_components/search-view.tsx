"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { api } from "@/services/api";
import { SearchResult } from "@/types/restaurant";
import { useState } from "react";

export function SearchView() {
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");
    const [limit, setLimit] = useState(20);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [nextPageToken, setNextPageToken] = useState<string | undefined>(
        undefined
    );

    const handleSearch = async (e: React.FormEvent, token?: string) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.searchRestaurants(
                query,
                location,
                limit,
                token
            );
            if (token) {
                setResults((prev) => [...prev, ...response.results]);
            } else {
                setResults(response.results);
            }
            setNextPageToken(response.next_page_token);
        } catch (error) {
            console.error("Search failed:", error);
            alert("Search failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (item: SearchResult) => {
        setGeneratingId(item.id);
        try {
            await api.createWebConfig(item.id);
            alert(`Web config generated for ${item.name}!`);
        } catch (error) {
            console.error("Generation failed:", error);
            alert("Generation failed. Check console.");
        } finally {
            setGeneratingId(null);
        }
    };

    const loadMore = (e: React.MouseEvent) => {
        e.preventDefault();
        if (nextPageToken) {
            handleSearch(e as any, nextPageToken);
        }
    };

    return (
        <>
            <Breadcrumb pageName="Search Restaurants" />

            <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
                <form onSubmit={(e) => handleSearch(e)}>
                    <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                        <div className="w-full sm:w-1/3">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="query"
                            >
                                Query
                            </label>
                            <input
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                type="text"
                                id="query"
                                placeholder="e.g. sushi"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                required
                            />
                        </div>

                        <div className="w-full sm:w-1/3">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="location"
                            >
                                Location
                            </label>
                            <input
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                type="text"
                                id="location"
                                placeholder="e.g. Lisboa"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </div>

                        <div className="w-full sm:w-1/3">
                            <label
                                className="mb-3 block text-sm font-medium text-black dark:text-white"
                                htmlFor="limit"
                            >
                                Limit
                            </label>
                            <input
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                type="number"
                                id="limit"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                min={1}
                                max={60}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4.5">
                        <button
                            className="flex justify-center rounded bg-primary px-6 py-2.5 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Searching..." : "Search Google"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card"
                    >
                        {item.photos && item.photos.length > 0 && (
                            <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
                                <img
                                    src={item.photos[0]}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}
                        <h3 className="mb-1 text-lg font-semibold text-black dark:text-white">
                            {item.name}
                        </h3>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            {item.address}
                        </p>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                ★ {item.rating}
                            </span>
                            <span className="text-xs text-gray-500">
                                ({item.user_ratings_total} reviews)
                            </span>
                        </div>
                        <button
                            onClick={() => handleGenerate(item)}
                            disabled={generatingId === item.id}
                            className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-70"
                        >
                            {generatingId === item.id ? "Generating..." : "Generate Web"}
                        </button>
                    </div>
                ))}
            </div>

            {nextPageToken && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="rounded border border-stroke bg-gray px-6 py-2.5 font-medium text-black hover:shadow-1 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:shadow-none"
                    >
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </>
    );
}
