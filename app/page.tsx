"use client"
import { useUser } from "@clerk/nextjs";
import Wrapper from "./components/Wrapper";
import ProductOverview from "./components/ProductOverview";
import CategoryChart from "./components/CategoryChart";
import StockSummaryTable from "./components/StockSummaryTable";
import AiStockReport from "./components/AnalyseIA";

export default function Home() {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  return (
    <Wrapper>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
          <ProductOverview email={email} />
          <CategoryChart email={email} />
        </div>
        <div className="md:ml-9 md:mt-0 mt-4 md:w-1/4">
          <StockSummaryTable email={email} />
          <AiStockReport email={email} />
        </div>
      </div>
    </Wrapper>
  );
}
 