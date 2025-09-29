// Page d'affichage de la liste des produits pour l'utilisateur connecté
"use client";

// Import des hooks et composants nécessaires
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper"; // Habillage global (navbar, notifications...)
import { useUser } from "@clerk/nextjs"; // Récupération de l'utilisateur connecté
import { Product } from "@/types"; // Type du produit (doit contenir id, name, ...)
import { deleteProduct, readProduct } from "../actions"; // Fonctions pour lire et supprimer les produits
import EmphyState from "../components/EmphyState"; // Affichage d'un état vide
import ProductImage from "../components/ProductImage"; // Affichage stylisé de l'image produit
import Link from "next/link"; // Pour la navigation vers la page de modification
import { Trash } from "lucide-react"; // Icône de poubelle
import { toast } from "react-toastify"; // Notifications toast

const page = () => {
  // Récupère l'utilisateur connecté via Clerk et son email principal
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  // State pour stocker la liste des produits récupérés
  const [products, setProducts] = useState<Product[]>([]);

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

  /**
   * Fonction pour supprimer un produit (et son image associée)
   * - Demande confirmation à l'utilisateur
   * - Supprime d'abord l'image via l'API DELETE
   * - Puis supprime le produit en base
   * - Recharge la liste et affiche une notification
   */
  const handleDeletProduct = async (product: Product) => {
    // Demande confirmation à l'utilisateur
    const confirmDelet = confirm("Voulez-vous supprimer ce produit ????????");
    if (!confirmDelet) return;

    try {
      // Si le produit a une image, on la supprime côté serveur
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
          // Si l'image est bien supprimée, on supprime le produit en base
          if (email) {
            await deleteProduct(product.id, email);
            await fetchProduct(); // Recharge la liste
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
                    {/* Numéro de ligne */}
                    <th>{index + 1}</th>
                    {/* Image du produit */}
                    <td>
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.imageUrl}
                        heightClass="h-12"
                        widhtClass="w-12"
                      />
                    </td>
                    {/* Nom du produit */}
                    <td>{product.name}</td>
                    {/* Description */}
                    <td>{product.description}</td>
                    {/* Prix */}
                    <td>{product.price} FCFA</td>
                    {/* Quantité et unité */}
                    <td>
                      {product.quantity} {product.unit}
                    </td>
                    {/* Catégorie */}
                    <td>{product.categoryName}</td>
                    {/* Actions : modifier ou supprimer */}
                    <td className="felx flex-col gap-4">
                      <Link
                        className="btn btn-xs w-fit btn-primary"
                        href={`/update-product/${product.id}`}
                      >
                        Modifier
                      </Link>
                      <button
                        className="btn btn-xs w-fit"
                        onClick={() => handleDeletProduct(product)}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
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

export default page;
