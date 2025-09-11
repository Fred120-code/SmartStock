"use client";
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
    categoryName:""
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
            categoryName: fetchedproduct.categoryName
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Charge les catégories de l'utilisateur connecté au chargement de la page ou changement d'email
  useEffect(() => {
    fetchProduct();
  }, [email]);

  // Gère le changement des champs du formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // Gère la sélection d'un fichier image et crée un aperçu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <Wrapper>
      <div>
        {product ? (
          <div>
            {/* Titre de la page */}
            <h1 className="font-bold text-2xl mb-4">modifier le produit</h1>
            <div className="flex md:flex-row flex-col md:items-center">
              <form className="space-y-2">
                <div className="text-sm font-semibold mb-2">Nom</div>
                {/* Champ nom */}
                <input
                  type="text"
                  name="name"
                  placeholder="Nom"
                  className="input input-bordered w-full"
                  value={formData.name}
                  onChange={handleChange}
                />
                {/* Champ description */}
                <div className="text-sm font-semibold mb-2">Description</div>

                <textarea
                  name="description"
                  placeholder="Description"
                  className="textarea textarea-bordered w-full"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>

                {/* Champ prix */}
                <div className="text-sm font-semibold mb-2">Prix</div>

                <input
                  type="number"
                  name="price"
                  placeholder="Prix"
                  className="input input-bordered w-full"
                  value={formData.price}
                  onChange={handleChange}
                />

                 {/* Champ categories */}
                <div className="text-sm font-semibold mb-2">Categorie</div>

                <input
                  type="text"
                  name="category"
                  placeholder="Selectionner une category"
                  className="input input-bordered w-full"
                  value={formData.categoryName}
                  onChange={handleChange}
                  disabled
                />

                {/* Sélecteur d'unité */}
                <div className="text-sm font-semibold mb-2">Unité</div>

                <select
                  className="select selec-bordered"
                  value={formData.unit}
                  onChange={handleChange}
                  name="unit"
                >
                  <option value="">Selectionner l'unité</option>
                  <option value="g">Gramme</option>
                  <option value="kg">Kilogramme</option>
                  <option value="l">Litre</option>
                  <option value="m">Metre</option>
                  <option value="h">Heure</option>
                  <option value="pcs">Piece</option>
                </select>

                {/* Champ pour uploader une image */}
                <div className="text-sm font-semibold mb-2">Image</div>

                <input
                  type="file"
                  accept="image/"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />
              </form>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <span className="loading loading-dots loading-xl"></span>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
