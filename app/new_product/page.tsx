"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/types";
import { createProduct, readCeategory } from "../actions";
import { FileImage } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const page = () => {
  //importation de l'email de l'utilisateur
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  //pour le nivagation
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
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
      try {
        if (email) {
          const data = await readCeategory(email);
          if (data) {
            setCategories(data);
          }
        }
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

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Veuillez selectionner une image");
      return;
    }
    try {
      const imagedata = new FormData();
      imagedata.append("file", file);
      const res = await fetch("api/uploads", {
        method: "POST",
        body: imagedata,
      });

      const data = await res.json();
      if (!data.succes) {
        throw new Error("Erreur lors de l'upload de l'image");
      } else {
        formData.imageUrl = data.path;
        await createProduct(formData, email);
        toast.success("Produit creer avec succes");
        router.push("/products");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur");
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

              <button className="btn btn-primary" onClick={handleSubmit}>
                Creer le produit
              </button>
            </div>

            <div className="md:ml-10 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] p-5 flex justify-center items-center rounded-3xl">
              {previewUrl && previewUrl !== "" ? (
                <div>
                  <ProductImage
                    src={previewUrl}
                    alt="preview"
                    heightClass="h-40"
                    widhtClass="w-40"
                  />
                </div>
              ) : (
                <div>
                  <FileImage
                    strokeWidth={1}
                    className="h-10 w-10 text-primary"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
