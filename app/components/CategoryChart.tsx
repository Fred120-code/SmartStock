import { ChartData } from "@/types";
import React, { useEffect, useState } from "react";
import { getProductCategoryDistribution } from "../actions";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmphyState from "./EmphyState";

const CategoryChart = ({ email }: { email: string }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const COLOR = {
    default: "#6D0076",
  };

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchProduct = async () => {
    try {
      if (email) {
        const data = await getProductCategoryDistribution(email);
        if (data) {
          setData(data);
        }
      }
    } catch (error) {
      // Affiche l'erreur en cas d'échec
      console.error(error);
    }
  };

  // Charge les produits au chargement de la page ou lors d'un changement d'email utilisateur
  useEffect(() => {
    if (email) {
      fetchProduct();
    }
  }, [email]);

  const renderChart = (widthOverride?: string) => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        barCategoryGap={widthOverride ? 0 : "10"}
      >
        <XAxis
          axisLine
          dataKey="name"
          tick={{
            fontSize: 15,
            fill: "#6D0076",
            fontWeight: "bold",
          }}
          tickLine
        />
        <YAxis hide />
        <Legend iconType="line" />
        <Tooltip />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={ widthOverride ? 200: undefined}>
          {data.map((entry, index) => (
            <Cell key={`cell=${index}`} fill={COLOR.default} cursor="default" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  if (data.length == 0) {
    return (
      <div className="w-full border-2 border-base-200 m-4 p-4 rounded-3xl">
        <h2 className="">
          <EmphyState
            message="Aucun produit pour le moment"
            IconComponent="PackageSearch"
          />{" "}
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full border-2 border-base-200 m-4 p-4 rounded-3xl">
      <h1 className="text-primary text-xl font-semibold mt-4 mb-4">Les meilleurs produits</h1>
      <h2 className="">{renderChart()}</h2>
    </div>
  );
};

export default CategoryChart;
