import { StockSummary } from "@/types";
import React, { useEffect, useState } from "react";
import { getStockSummary } from "../actions";

const StockSummaryTable = ({ email }: { email: string }) => {
  const [data, setData] = useState<StockSummary | null>(null);

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchSumary = async () => {
    try {
      if (email) {
        const data = await getStockSummary(email);
        if (data) {
          setData(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchSumary();
    }
  }, [email]);


  
  if (!data) {
    return (
      <div className="flex justify-center items-center w-full">
        <span className="loading loading-dots loading-xl"></span>
      </div>
    );
  }


  return (
    <div className="w-full">
      <ul className="list bg-primary/20 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xl  font-semibold tracking-wide text-primary">
          Statistiques des stocks
        </li>

        <li className="list-row">
          <div className="text-4xl font-thin  tabular-nums">
            {data.inStockCount}
          </div>
          <div className="list-col-grow">
            <div className=" text-sm  tracking-wide">
              Stock normal
            </div>
            <div className="badge badge-soft badge-primary font-bold">
              Correct
            </div>
          </div>
        </li>

        <li className="list-row">
          <div className="text-4xl font-thin  tabular-nums">
            {data.lowStockCount}
          </div>
          <div className="list-col-grow">
            <div className=" text-sm tracking-wide">
              Stock faible
            </div>
            <div className="badge badge-warning badge-soft font-bold">
              à commander
            </div>
          </div>
        </li>

        <li className="list-row">
          <div className="text-4xl font-thin  tabular-nums">
            {data.outOfStockCount}
          </div>
          <div className="list-col-grow">
            <div className=" text-sm  tracking-wide">
              Stock ecoullé
            </div>
            <div className="badge badge-error badge-soft font-bold">urgent</div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default StockSummaryTable;
