"use client"
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

  // Récupère l'utilisateur connecté
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string[]>([]);

  /**
   * Fonction pour charger les produits de l'utilisateur connecté
   * Appelle l'action readProduct côté serveur, puis met à jour le state
   */
  const fetchProduct = async () => {
    try {
      if (email) {
        const products = await readProduct(
          email,
          searchQuery,
          selectedProductId,
        );
        if (products) {
          setProducts(products);
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
      // Affiche l'erreur en cas d'échec
      console.error(error);
    }
  };

  // Rendu du composant principal
  return (
    <div>
      <Wrapper>
        <div className="overflow-x-auto">
          <div className="flex gap-2 m-4 items-center">
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

          {/* Si aucun produit, affiche un état vide */}
          {products.length === 0 ? (
            <div>
              <EmphyState
                message="Aucun produit pour le moment"
                IconComponent="PackageSearch"
              />
            </div>
          ) : (

            // Sinon, affiche le tableau des produits
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
                        className="btn btn-xs w-fit btn-warning"
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
      </Wrapper>
    </div>
  );
};

export default ProductsPage;
