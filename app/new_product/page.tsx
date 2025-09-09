"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/types";
import { readCeategory } from "../actions";

const page = () => {
  //importation de l'email de l'utilisateur
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const fetchCateogories = async () => {
      if (email) {
        const data = await readCeategory(email);
        if (data) {
          setCategories(data);
        }
      }
      try {
      } catch (error) {
        console.error("Erreur lors du chargement des categories");
      }
    };
    fetchCateogories();
  }, [email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  return (
    <Wrapper>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl mb-4">Creer un produit</h1>

          <section className="flex md:flex-row flex-col">
            <div className="space-y-4 md:w-[450px]">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              <input
                type="number"
                name="price"
                placeholder="Prix"
                className="input input-bordered w-full"
                value={formData.price}
                onChange={handleChange}
              />

              <select
                className="select selec-bordered"
                value={formData.categoryId}
                onChange={handleChange}
                name="categoryId"
              >
                <option value="">Selectionner une categorie</option>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

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

              <input
                type="file"
                accept="image/"
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
              />
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
