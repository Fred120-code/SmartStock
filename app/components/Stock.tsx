import { Product } from "@/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { readProduct } from "../actions";

const Stock = () => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  // State pour stocker la liste des produits récupérés
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  return (
    <div>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      
      <dialog id="my_modal_stock" className="modal">
        <div className="modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">Gestion des stock!</h3>
          <p className="py-4">Ajouter des quantité aux produits dans votres stock</p>
          <form className="space-y-2">
            <label className="block">Selectionner un produit</label>
            <select value={selectedProductId}
                    className="select select-bordered w-full"
                    required
            >
                <option value="">Selectionner un produit</option>
                {
                    products.map((product) => (
                        <option value={product.id}
                                key={product.id}
                        >
                                {product.name} - {product.categoryName}
                        </option>
                    ))
                }
            </select>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Stock;
