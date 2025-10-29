"use client";
import { useUser } from "@clerk/nextjs";
import { FormDataType, Product } from "@/types";
import React, { useEffect, useState } from "react";
import { readProductById, updateProduct } from "@/app/actions";
import Wrapper from "@/app/components/Wrapper";
import ProductImage from "@/app/components/ProductImage";
import { FileImage } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
    categoryName: "",
    quantity: 0,
  });
  const router = useRouter();

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
            categoryName: fetchedproduct.categoryName,
            quantity: fetchedproduct.quantity,
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

  const handleSubmit = async (e: React.FormEvent) => {
    let imageUrl = formData?.imageUrl;
    e.preventDefault();
    try {
      if (file) {
        // Supprime l'ancienne image si elle existe
        const resDelete = await fetch("/api/upload", {
          method: "DELETE",
          body: JSON.stringify({ path: formData.imageUrl }),
          headers: { "content-type": "application/json" },
        });
        let dataDelete = { succes: true };
        try {
          dataDelete = await resDelete.json();
        } catch (err) {
          console.error(err)
          // Si la réponse n'est pas du JSON, on ignore (l'API est censée toujours renvoyer du JSON maintenant)
        }
        if (!dataDelete.succes) {
          throw new Error("Erreur lors de le suppression de l'image");
        }
        // Upload de la nouvelle image
        const imagedata = new FormData();
        imagedata.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: imagedata,
        });
        
        let data: { succes: boolean; path?: string } = { succes: false };
        try {
          data = await res.json();
        } catch (err) {
          // Si la réponse n'est pas du JSON, on lève une erreur
          throw new Error("Réponse inattendue lors de l'upload de l'image");
        }
        if (!data.succes) {
          throw new Error("Erreur lors de l'upload de l'image");
        }
        imageUrl = data.path || "";
        formData.imageUrl = imageUrl;
        await updateProduct(formData, email);
        toast.success("Product mis à jour avec succès");
        router.push("/products");
      } else {
        // Si pas de nouvelle image, on met à jour le produit avec les autres champs
        await updateProduct(formData, email);
        toast.success("Product mis à jour avec succès");
        router.push("/products");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
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
              <form className="space-y-2" onSubmit={handleSubmit}>
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

                {/* Champ quantité */}
                <div className="text-sm font-semibold mb-2">Quantité</div>

                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantité"
                  className="input input-bordered w-full"
                  value={formData.quantity}
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
                  <option value="G">Gramme</option>
                  <option value="Kg">Kilogramme</option>
                  <option value="L">Litre</option>
                  <option value="M">Metre</option>
                </select>

                {/* Champ pour uploader une image */}
                <div className="text-sm font-semibold mb-2">Image</div>

                <input
                  type="file"
                  accept="image/"
                  className="file-input file-input-bordered w-full"
                  onChange={handleFileChange}
                />

                {/* Bouton de soumission */}
                <button className="btn btn-primary mt-3" type="submit">
                  Modifier
                </button>
              </form>

              <div className="flex md:flex-col md:ml-4 mt-4 md:mt-0">
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
              </div>
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
