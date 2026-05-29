import { ProductOverviewStat } from "@/types";
import React, { useEffect, useState } from "react";
import { getProductOverviewStats } from "../actions";
import { ArrowLeftRight, Box, Landmark, Tag } from "lucide-react";

const ProductOverview = ({ email }: { email: string }) => {
  const [stats, setStats] = useState<ProductOverviewStat>({
    totalProducts: 0,
    totalCategories: 0,
    totalTransaction: 0,
    stockValue: 0,
  });
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      if (email) {
        const result = await getProductOverviewStats(email);
        if (result) {
          setStats(result);
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false)
    }
  };

  //permet de formater les prix
  function formatNumber(value: number): string {
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";

    return value.toFixed(1);
  }

  useEffect(() => {
    if (email) {
      fetchProduct();
    }
  }, [email]);

  const data = [
    {
      label: "Nombre de Produit",
      number: stats?.totalProducts,
    },
    {
      label: "Nombre de Categorie",
      number: stats?.totalCategories,
    },
    {
      label: "Prix Total",
      number: formatNumber(stats?.stockValue),
    },
    {
      label: "Nombre de Transaction",
      number: stats?.totalTransaction,
    },
  ];
  return (
    <div>
      {!isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {data.map((dt) => (
            <div className="border-2 p-4 border-base-200 rounded-3xl cursor-pointer">
              <p className="stat-title text-primary">{dt.label}</p>
              <div className="flex justify-between items-center">
                <div className="stat-value">{dt.number}</div>
                <div className="bg-primary/25 p-3 rounded-full">
                  <Box className="w-5 h-5 text-primary text-3xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <span className="loading loading-dots loading-xl"></span>
        </div>
      )}
    </div>
  );
};

export default ProductOverview;
