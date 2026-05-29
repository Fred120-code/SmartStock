"use client";
import React, { useEffect, useState } from "react";
import { Trash, Settings } from "lucide-react";
import { toast } from "react-toastify";

import Wrapper from "../components/Wrapper";
import EmphyState from "../components/EmphyState";
import ProductImage from "../components/ProductImage";
import AlertSettingsModal from "../components/AlertSettingsModal";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

import { Product } from "@/types";

import { deleteProduct, readProduct } from "@/app/actions/index";

const ProductsPage = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   */
  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      if (email) {
        const products = await readProduct(
          email,
          searchQuery,
          selectedProductId,
        );
        if (products) {
          setProducts(products);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchProduct();
    }
  }, [email]);

  // Declenche la recherche quand searchQuery ou selectedProductId change
  useEffect(() => {
    if (email && (searchQuery || selectedProductId.length > 0)) {
      fetchProduct();
    }
  }, [searchQuery, selectedProductId, email]);

  /**
   * Fonction pour supprimer un produit (et son image associée)
   */

  const handleDeletProduct = async (product: Product) => {
    const confirmDelet = confirm("Voulez-vous supprimer ce produit ????????");
    if (!confirmDelet) return;

    try {
      if (product.imageUrl) {
        const resDelete = await fetch("/api/upload", {
          method: "DELETE",
          body: JSON.stringify({ path: product.imageUrl }),
          headers: { "content-type": "application/json" },
        });

        const dataDelete = await resDelete.json();
        if (!dataDelete.succes) {
          throw new Error("Erreur lors de le suppression de l'image");
        } else {
          if (email) {
            await deleteProduct(product.id, email);
            await fetchProduct();
            toast.success("produit supprimé avec succes");
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Wrapper>
        <div className="overflow-x-auto">
          <div className="flex gap-2 m-4 mb-20 items-center justify-between">
            <input
              type="text"
              placeholder="rechercher un produit"
              className="input w-[50%]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="btn btn-primary rounded-lg"
              onClick={() => {
                setSelectedProductId([]);
                setSearchQuery("");
                fetchProduct();
              }}
            >
              Liste Complète
            </button>
          </div>

          {isLoading ? (
            <div>
              <div className="flex justify-center items-center w-full h-screen">
                <span className="loading loading-dots loading-xl"></span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center w-full mt-20">
              {products.length === 0 ? (
                <div className="flex justify-center items-center w-full h-screen">
                  <EmphyState
                    message="Aucun produit pour le moment"
                    IconComponent="PackageSearch"
                  />
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Image</th>
                      <th>Nom</th>
                      <th>Description</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Categorie</th>
                      <th>Actions</th>
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

                        <td>{product.name}</td>

                        <td>{product.description}</td>

                        <td>{product.price} FCFA</td>

                        <td>
                          {product.quantity} {product.unit}
                        </td>

                        <td>{product.categoryName}</td>

                        <td className="felx flex-col gap-4">
                          <Link
                            className="btn btn-xs w-fit btn-primary"
                            href={`/update-product/${product.id}`}
                          >
                            Modifier
                          </Link>
                          <button
                            className="btn btn-xs w-fit btn-warning m-2"
                            onClick={() => {
                              const modal = document.getElementById(
                                `alert_modal_${product.id}`,
                              ) as HTMLDialogElement;
                              modal?.showModal();
                            }}
                            title="Configurer les alertes"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-xs w-fit"
                            onClick={() => handleDeletProduct(product)}
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                          <AlertSettingsModal
                            productId={product.id}
                            productName={product.name}
                            currentMinQuantity={product.minQuantity}
                            currentAlertEnabled={product.alertEnabled}
                            onSave={fetchProduct}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
};

export default ProductsPage;
