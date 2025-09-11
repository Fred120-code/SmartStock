"use client"
import { useUser } from "@clerk/nextjs";
import { FormDataType, Product } from "@/types";
import React, { useEffect, useState } from "react";
import { readProductById } from "@/app/actions";
import Wrapper from "@/app/components/Wrapper";

const page = ({ params }: { params: Promise<{ productId: string }> }) => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [product, setproduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    imageUrl: "",
  });

  const fetchProduct = async () => {
    try {
      const { productId } = await params;
      if (email) {
        const fetchedproduct = await readProductById(productId, email);
        if (fetchedproduct) {
          setproduct(fetchedproduct);
          setFormData({
            id: fetchedproduct.id,
            name: fetchedproduct.name,
            description: fetchedproduct.description,
            price: fetchedproduct.price,
            categoryId: fetchedproduct.categoryId,
            imageUrl: fetchedproduct.imageUrl,
          });
        }
      }
    } catch (error) {
        console.error(error)
    }
  };

  // Charge les catégories de l'utilisateur connecté au chargement de la page ou changement d'email
    useEffect(() => {
        fetchProduct();
    }, [email]);
  
  return (
    <Wrapper>
        <div>
            
        </div>
    </Wrapper>
  );
};

export default page;
