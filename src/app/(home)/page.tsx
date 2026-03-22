import { PriceDistributionChart } from "@/components/Charts/price-distribution-chart";
import { TopCuisinesChart } from "@/components/Charts/top-cuisines-chart";
import { api } from "@/services/api";
import { Suspense } from "react";
import { OverviewCardsGroup } from "./_components/overview-cards";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { DashboardTitle } from "./_components/dashboard-title";

export const dynamic = "force-dynamic";

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Home({ searchParams }: PropsType) {
  const stats = await api.getStats();

  return (
    <>
      <DashboardTitle />
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">

        {/* Charts Row */}
        <TopCuisinesChart data={stats.top_cuisines} />
        <PriceDistributionChart data={stats.price_distribution} />

        {/* Actionable Insights Row */}
        <div className="col-span-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Hidden Gems */}
          <div className="rounded-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow-1 dark:shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">💎 Hidden Gems</h3>
                <p className="mt-2 text-sm opacity-90">High rated restaurants with low reviews.</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{stats.hidden_gems_count}</span>
                  <span className="text-sm">candidates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fix Me */}
          <div className="rounded-[10px] bg-gradient-to-r from-red to-orange-500 p-6 text-white shadow-1 dark:shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">🔧 Fix Me</h3>
                <p className="mt-2 text-sm opacity-90">Restaurants with missing data or low ratings.</p>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{stats.fix_me_count}</span>
                  <span className="text-sm">items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
