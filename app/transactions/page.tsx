"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { Transaction, Product } from "@/types";
import { getTransaction, readProduct } from "../actions";

const page = () => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [transaction, setTransaction] = useState<Transaction[]>([]);
  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchData = async () => {
    try {
      if (email) {
        const products = await readProduct(email);
        const txs = await getTransaction(email);
        if (products) {
          setProducts(products);
        }
        if (txs) {
          setTransaction(txs);
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
      fetchData();
    }
  }, [email]);

  return (
    <Wrapper>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
        
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
