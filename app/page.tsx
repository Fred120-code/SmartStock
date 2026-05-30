"use client";
import { useUser } from "@clerk/nextjs";
import Wrapper from "./components/Wrapper";
import ProductOverview from "./components/ProductOverview";
import CategoryChart from "./components/CategoryChart";
import StockSummaryTable from "./components/StockSummaryTable";
import AiStockReport from "./components/AnalyseIA";
import Stock from "./components/Stock";

export default function Home() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            Dashboard
          </h1>
          <p className="text-base-content/60">
            Bienvenue, {user?.firstName || "utilisateur"}
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
              <ProductOverview email={email} />
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
              <CategoryChart email={email} />
            </div>
          </div>

          {/* Right Column*/}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
              <StockSummaryTable email={email} />
            </div>
            <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
              <AiStockReport email={email} />
            </div>
          </div>
        </div>
      </div>

      <Stock />
    </Wrapper>
  );
}
