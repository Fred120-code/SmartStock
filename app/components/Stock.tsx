import { Product } from "@/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { readProduct } from "../actions";
import ProductComponent from "./ProductComponent";

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

  const handleProductChange = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
    setSelectedProductId(productId);
  };

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
          <p className="py-4">
            Ajouter des quantité aux produits dans votres stock
          </p>
          <form className="space-y-2">
            <label className="block">Selectionner un produit</label>
            <select
              value={selectedProductId}
              className="select select-bordered w-full"
              required
              onChange={(e) => handleProductChange(e.target.value)}
            >
              <option value="">Selectionner un produit</option>
              {products.map((product) => (
                <option value={product.id} key={product.id}>
                  {product.name} - {product.categoryName}
                </option>
              ))}
            </select>

            {selectedProduct && <ProductComponent product={selectedProduct} />}

            <label className="block">Quantité à ajouter</label>
            <input type="number"
            placeholder="Quantité"
            value={quantity}
            required
            onChange={(e)=> setQuantity(Number(e.target.value))}
            className="input input-bordered" />

            <button
                type="submit"
                className="btn btn-primary w-fit"
            >
                Ajouter au stock
            </button>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default Stock;
