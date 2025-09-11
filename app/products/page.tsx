"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/types";
import { deleteProduct, readProduct } from "../actions";
import EmphyState from "../components/EmphyState";
import ProductImage from "../components/ProductImage";
import Link from "next/link";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

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

  const handleDeletProduct = async (product: Product)=>{
    const confirmDelet = confirm("Voulez-vous supprimer ce produit ????????")
    if(!confirmDelet) return;

    try {
        if(product.imageUrl){
            const resDelete = await fetch ("/api/uploads", {
                method: "DELETE",
                body: JSON.stringify({path: product.imageUrl}),
                headers: {'content-type': 'application/json'}
            })

            const dataDelete = await resDelete.json()
            if(!dataDelete.succes){
                throw new Error("Erreur lors de le suppression de l'image")
            }else{
                if (email) {
                    await deleteProduct(product.id, email)
                    await fetchProduct()
                    toast.success("produit supprimé avec succes")
                }
            }
        }
        
    } catch (error) {
        console.error(error);
    }
  }

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
                    </td>{" "}
                    <td>{product.categoryName}</td>
                    <td className="felx flex-col gap-4">
                        <Link className="btn btn-xs w-fit btn-primary" href={`/update-product/${product.id}`}>
                        Modifier
                        </Link>
                        <button className="btn btn-xs w-fit" onClick={()=>handleDeletProduct(product)}>
                            <Trash className="w-4 h-4"/>
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
