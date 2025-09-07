"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategorieModal from "../components/CategorieModal";
import { useUser } from "@clerk/nextjs";
import { createCategory, deleteCategory, readCeategory, updateCategory } from "../actions";
import { toast } from "react-toastify";
import { Category } from "@prisma/client";
import EmphyState from "../components/EmphyState";
import { Pencil, Recycle, Trash } from "lucide-react";

const page = () => {
  //importation de l'email de l'utilisateur
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [categorie, setCategorie] = useState<Category[]>([]);

  //permet d'appeler une categorie
  const loadCategory = async () => {
    if (email) {
      const data = await readCeategory(email);
      if (data) {
        setCategorie(data);
      }
    }
  };

  useEffect(() => {
    loadCategory();
  }, [email]);

  //permet d'ouvrir le Modal
  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);

    (
      document.getElementById("Category_modal") as HTMLDialogElement
    )?.showModal();
  };

  //permet de fermer le Modal
  const closeCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);

    (document.getElementById("Category_modal") as HTMLDialogElement)?.close();
  };

  const handleCreateCategory = async () => {
    setLoading(true);
    if (email) {
      await createCategory(name, email, description);
    }
    
    await loadCategory();
    closeCreateModal();
    setLoading(false);
    toast.success("Categories creer avec succes");
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId) return;
    setLoading(true);
    if (email) {
      await updateCategory(editCategoryId, email, name, description);
    }

    await loadCategory();
    closeCreateModal();
    setLoading(false);
    toast.success("Categories mise à jour avec succes.");
  };

  //afficher le Modal de modification
  const openEditModal = (categorie: Category) => {
    setName(categorie.name);
    setDescription(categorie.description || ""); 
    setEditMode(true);
    setEditCategoryId(categorie.id);

    (
      document.getElementById("Category_modal") as HTMLDialogElement
    )?.showModal();
  };

  //supprimer une category
   const handleDeleteCategory = async (categorieId: string) => {
    const confirDelet = confirm( "si vous suprimez cette categorie, tout les produits associés seront egalement supprimés, etes-vous d'accord ?")
    if(!confirDelet) return;

    await deleteCategory(categorieId, email)
    await loadCategory();
    toast.success("Categories supprimée avec succes")
  };

  return (
    <Wrapper>
      <div>
        <div className="mb-4">
          <button
            className="btn btn-primary rounded-sm"
            onClick={openCreateModal}
          >
            Ajouter une categorie
          </button>
        </div>

        {categorie.length > 0 ? (
          <div>
            {categorie.map((categorie) => (
              <div
                key={categorie.id}
                className="flex mb-2 p-5 border-2 border-base-200 rounded-3xl justify-between items-center"
              >
                <div>
                  <strong>{categorie.name}</strong>
                  <div className="text-sm">{categorie.description}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm rounded-sm"
                    onClick={() => openEditModal(categorie)}
                  >
                    <Pencil className="w-4 h-4"/>
                  </button>
                  <button
                    className="btn btn-sm btn-error rounded-sm"
                    onClick={() => handleDeleteCategory(categorie.id)}
                  >
                    <Trash className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmphyState
            message={"Aucune categorie disponibe"}
            IconComponent="Group"
          />
        )}
      </div>
      <CategorieModal
        name={name}
        description={description}
        loading={loading}
        onclose={closeCreateModal}
        onChangeDescription={setDescription}
        onChangeName={setName}
        editMode={editMode}
        onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
      />
    </Wrapper>
  );
};

export default page;
