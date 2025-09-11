// Page de création d'un nouveau produit
"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper"; // Composant d'habillage général
import { useUser } from "@clerk/nextjs"; // Hook pour récupérer l'utilisateur connecté
import { Category } from "@prisma/client"; // Type de catégorie
import { FormDataType } from "@/types"; // Type pour les données du formulaire produit
import { createProduct, readCeategory } from "../actions"; // Actions pour créer un produit et lire les catégories
import { FileImage } from "lucide-react"; // Icône pour l'image par défaut
import ProductImage from "../components/ProductImage"; // Composant d'affichage de l'image du produit
import { toast } from "react-toastify"; // Pour afficher des notifications
import { useRouter } from "next/navigation"; // Pour la navigation après création

const page = () => {
  // Récupère l'utilisateur connecté et son email
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  // Pour la navigation après création du produit
  const router = useRouter();

  // États pour gérer le fichier image, l'aperçu, les catégories et les champs du formulaire
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

  // Gère le changement des champs du formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Charge les catégories de l'utilisateur connecté au chargement de la page ou changement d'email
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

  // Gère la sélection d'un fichier image et crée un aperçu
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Gère la soumission du formulaire pour créer un produit
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Veuillez selectionner une image");
      return;
    }
    try {
      // Upload de l'image
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
        // Ajoute le chemin de l'image au formData puis crée le produit
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
  
  // Rendu du composant principal
  return (
    <Wrapper>
      <div className="flex justify-between items-center">
        <div>
          {/* Titre de la page */}
          <h1 className="font-bold text-2xl mb-4">Créer un produit</h1>

          <section className="flex md:flex-row flex-col">
            {/* Formulaire de création de produit */}
            <div className="space-y-4 md:w-[450px]">
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
              <textarea
                name="description"
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
              ></textarea>

              {/* Champ prix */}
              <input
                type="number"
                name="price"
                placeholder="Prix"
                className="input input-bordered w-full"
                value={formData.price}
                onChange={handleChange}
              />

              {/* Sélecteur de catégorie */}
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

              {/* Sélecteur d'unité */}
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
              <input
                type="file"
                accept="image/"
                className="file-input file-input-bordered w-full"
                onChange={handleFileChange}
              />

              {/* Bouton de soumission */}
              <button className="btn btn-primary" onClick={handleSubmit}>
                Creer le produit
              </button>
            </div>

            {/* Aperçu de l'image sélectionnée ou icône par défaut */}
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
