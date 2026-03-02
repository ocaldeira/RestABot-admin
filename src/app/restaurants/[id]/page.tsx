import { Metadata } from "next";
import { RestaurantDetailView } from "./_components/restaurant-detail-view";

export const metadata: Metadata = {
    title: "Restaurant Details | restAbot",
    description: "View and edit restaurant details",
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RestaurantPage({ params }: Props) {
    const { id } = await params;
    return <RestaurantDetailView id={id} />;
}
