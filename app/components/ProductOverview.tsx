import { ProductOverviewStat } from '@/types'
import React, { useEffect, useState } from 'react'
import { getProductOverviewStats } from '../actions';
import { ArrowLeftRight, Box, Landmark, Tag } from 'lucide-react';

const ProductOverview = ({email}: {email:string}) => {
    
    const [stats, setStats] = useState<ProductOverviewStat | null>(null)
    /**
       * Fonction pour charger les produits de l'utilisateur connecté
       * Appelle l'action readProduct côté serveur, puis met à jour le state
       */
      const fetchProduct = async () => {
        try {
          if (email) {
            const result = await getProductOverviewStats(email);
            if (result) {
              setStats(result);
            }
          }
        } catch (error) {
          // Affiche l'erreur en cas d'échec
          console.error(error);
        }
      };
    
      //permet de formater les prix
      function formatNumber(value: number):string {
        if(value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M"
        if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";

        return value.toFixed(1);
      }

      // Charge les produits au chargement de la page ou lors d'un changement d'email utilisateur
      useEffect(() => {
        if (email) {
          fetchProduct();
        }
      }, [email]);
  return (
    <div>
      {stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 p-4 border-base-200 rounded-3xl">
            <p className="stat-title text-primary">Nombre de Produit</p>
            <div className="flex justify-between items-center">
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="bg-primary/25 p-3 rounded-full">
                <Box className="w-5 h-5 text-primary text-3xl" />
              </div>
            </div>
          </div>

          <div className="border-2 p-4 border-base-200 rounded-3xl">
            <p className="stat-title text-primary">Nombre de Categorie</p>
            <div className="flex justify-between items-center">
              <div className="stat-value">{stats.totalCategories}</div>
              <div className="bg-primary/25 p-3 rounded-full">
                <Tag className="w-5 h-5 text-primary text-3xl" />
              </div>
            </div>
          </div>

          <div className="border-2 p-4 border-base-200 rounded-3xl">
            <p className="stat-title text-primary">Prix Total</p>
            <div className="flex justify-between items-center">
              <div className="stat-value">
                {formatNumber(stats.stockValue)} F
              </div>
              <div className="bg-primary/25 p-3 rounded-full">
                <Landmark className="w-5 h-5 text-primary text-3xl" />
              </div>
            </div>
          </div>

          <div className="border-2 p-4 border-base-200 rounded-3xl">
            <p className="stat-title text-primary">Nombre de Transaction</p>
            <div className="flex justify-between items-center">
              <div className="stat-value">{stats.totalTransaction}</div>
              <div className="bg-primary/25 p-3 rounded-full">
                <ArrowLeftRight className="w-5 h-5 text-primary text-3xl" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <span className="loading loading-dots loading-xl"></span>
        </div>
      )}
    </div>
  );
}

export default ProductOverview