"use client";
import { OrderItem, Product } from "@/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { readProduct } from "../actions";
import Wrapper from "../components/Wrapper";
import ProductComponent from "../components/ProductComponent";
import EmphyState from "../components/EmphyState";

const page = () => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  // State pour stocker la liste des produits récupérés
  const [products, setProducts] = useState<Product[]>([]);

  const [order, setOrder] = useState<OrderItem[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string[]>([]);

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchProduct = async () => {
    try {
      if (email) {
        const products = await readProduct(email);
        if (products) {
          setProducts(products);
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

  const filteredProduct = products
    .filter((product) =>
      product.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
    )
    .filter((product) => !selectedProductId.includes(product.id))
    .slice(0, 10);

  const handleAddToCard = (product: Product) => {
    setOrder((preOrder) => {
      const existingProduct = preOrder.find(
        (item) => item.productId === product.id
      );
      let updateOrder;

      if (existingProduct) {
        updateOrder = preOrder.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.quantity),
              }
            : item
        );
      } else {
        updateOrder = [
          ...preOrder,
          {
            productId: product.id,
            quantity: product.quantity,
            unit: product.unit,
            imageUrl: product.imageUrl,
            name: product.name,
            availableQuantity: product.quantity,
          },
        ];
      }

      setSelectedProductId((prevSelected) => 
        prevSelected.includes(product.id) ? prevSelected 
      :  [...prevSelected,product.id]
      )

      return updateOrder
    });
  };

  return (
    <Wrapper>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="md:w-1/3">
          <input
            type="text"
            placeholder="rechercher un produit"
            className="input input-bordered w-full mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-4">
            {filteredProduct.length > 0 ? (
              filteredProduct.map((product, index) => (
                <ProductComponent
                  product={product}
                  key={index}
                  add={true}
                  handleAddToCard= {handleAddToCard}
                />
              ))
            ) : (
              <div>
                <EmphyState
                  message="Aucun produit pour le moment"
                  IconComponent="PackageSearch"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
