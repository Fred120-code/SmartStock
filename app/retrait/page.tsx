"use client";
import { OrderItem, Product } from "@/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { deductStockWithTransaction, readProduct } from "../actions";
import Wrapper from "../components/Wrapper";
import ProductComponent from "../components/ProductComponent";
import EmphyState from "../components/EmphyState";
import ProductImage from "../components/ProductImage";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

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

  //permet de rechercher un produit specifique en flitrant la liste de produit
  const filteredProduct = products
    .filter((product) =>
      product.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())
    )
    .filter((product) => !selectedProductId.includes(product.id))
    .slice(0, 10);

  //Ajouter un produit au panier
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
        prevSelected.includes(product.id)
          ? prevSelected
          : [...prevSelected, product.id]
      );

      return updateOrder;
    });
  };

  //Changer la quantité d’un produit
  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrder((preOrder) =>
      preOrder.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  //cette fonction permet de retirer un produit du panier
  const handleRemoveFronCard = (productId: string) => {
    setOrder((preOrder) => {
      const updatedOrder = preOrder.filter(
        (item) => item.productId !== productId
      );
      setSelectedProductId((prevSelectedProductIds) =>
        prevSelectedProductIds.filter((id) => id !== productId)
      );

      return updatedOrder;
    });
  };

  //Soumettre la commande
  const handleSUbmit = async () => {
    try {
      if (order.length == 0) {
        toast.error("Veuillez ajouter un produit à la commande");
        return;
      }

      const response = await deductStockWithTransaction(order, email);
      if (response?.success) {
        toast.success("Retrait effectuer avec succes");
        setOrder([]);
        setSelectedProductId([]);
        fetchProduct();
      } else {
        toast.error(`${response?.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="w-1/2">
          <input
            type="text"
            placeholder="rechercher un produit"
            className="input input-bordered w-full mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-4 w-full ">
            {filteredProduct.length > 0 ? (
              filteredProduct.map((product, index) => (
                <ProductComponent
                  product={product}
                  key={index}
                  add={true}
                  handleAddToCard={handleAddToCard}
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
        <div className="md:w-2/3 p-3 md:mb-0 md:ml-4 mb-4 h-fit border-2 border-base-200 rounded-3xl overflow-x-auto">
          {order.length > 0 ? (
            <div>
              <table className="table w-full scroll-auto">
                <thead>
                  <tr>
                    <th>Images</th>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.imageUrl}
                          heightClass="h-12"
                          widhtClass="w-12"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          min={1}
                          max={item.availableQuantity}
                          className="input input-bordered w-full mb-4"
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productId,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleRemoveFronCard(item.productId)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-primary mt-4 w-fit"
                onClick={() => handleSUbmit()}
              >
                Confirmer
              </button>
            </div>
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
    </Wrapper>
  );
};

export default page;
