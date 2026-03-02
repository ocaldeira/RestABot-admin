import { compactFormat } from "@/lib/format-number";
import { api } from "@/services/api";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const stats = await api.getStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Restaurants"
        data={{
          value: stats.total_restaurants.toString(),
        }}
        Icon={icons.Views} // Using Views icon for Restaurants count as a fallback
      />

      <OverviewCard
        label="Average Rating"
        data={{
          value: stats.average_rating?.toFixed(2),
        }}
        Icon={icons.Profit} // Using Profit icon for Rating as a fallback
      />

      <OverviewCard
        label="Total Reviews"
        data={{
          // @ts-ignore
          value: compactFormat(stats.total_reviews ?? 0),
        }}
        Icon={icons.Users} // Using Users for reviews
      />

      <OverviewCard
        label="Websites Generated"
        data={{
          value: stats.total_generated_websites.toString(),
        }}
        Icon={icons.Product} // Using Product icon
      />
    </div>
  );
}
