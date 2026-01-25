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
    default: "#5B63F6",
  };

  const fetchProduct = async () => {
    try {
      if (email) {
        const data = await getProductCategoryDistribution(email);
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
            fill: "#FFFFFF",
            fontWeight: "bold",
          }}
          tickLine
        />
        <YAxis hide />
        <Legend iconType="line" />
        <Tooltip />

        <defs>
          <linearGradient id="gradBlueViolet" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="20%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>

        <Bar
          dataKey="value"
          radius={[8, 8, 0, 0]}
          barSize={widthOverride ? 200 : undefined}
          stroke="#6D0076"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell=${index}`}
              cursor="default"
              fill={`url(#gradBlueViolet)`}
              aria-label={`${entry.name}: ${entry.value}`}
            />
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
    <div className="w-full border-2 border-base-200 mt-4 p-4 bg-primary/20 rounded-3xl">
      <h1 className="text-primary text-xl font-semibold mt-4 mb-4">
        Les meilleurs produits
      </h1>
      <h2 className="">{renderChart()}</h2>
    </div>
  );
};

export default CategoryChart;
