import { Metadata } from "next";
import { RestaurantsList } from "./_components/restaurants-list";

export const metadata: Metadata = {
    title: "Restaurants | restAbot",
    description: "Manage your restaurants",
};

export default function RestaurantsPage() {
    return <RestaurantsList />;
}
