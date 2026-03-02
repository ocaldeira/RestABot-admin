import { Metadata } from "next";
import { SearchView } from "./_components/search-view";

export const metadata: Metadata = {
    title: "Search Restaurants | restAbot",
    description: "Search and import restaurants from Google",
};

export default function SearchPage() {
    return <SearchView />;
}
