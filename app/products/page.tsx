"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/types";
import { readProduct } from "../actions";
import EmphyState from "../components/EmphyState";
import ProductImage from "../components/ProductImage";

const page = () => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);

  const fetchProduct = async () => {
    try {
      if (email) {
        const products = await readProduct(email);
        if (products) {
          setProducts(products);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  // Charge les catégories de l'utilisateur connecté au chargement de la page ou changement d'email
  useEffect(() => {
    if (email) {
      fetchProduct();
    }
  }, [email]);

  return (
    <div>
      <Wrapper>
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div>
              <EmphyState
                message="Aucun produit pour le moment"
                IconComponent="PackageSearch"
              />
            </div>
          ) : (
            <div className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Prix</th>
                  <th>Quantité</th>
                  <th>Actions</th>
                  <th>Categorie</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id}>
                    <th>{index + 1}</th>
                    <td>
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.imageUrl}
                        heightClass="h-12"
                        widhtClass="w-12"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
};

export default page;
