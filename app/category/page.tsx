"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategorieModal from "../components/CategorieModal";
import { useUser } from "@clerk/nextjs";
import { createCategory, readCeategory, updateCategory } from "../actions";
import { toast } from "react-toastify";
import { Category } from "@prisma/client";
import EmphyState from "../components/EmphyState";

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
    setLoading(false);
    if (email) {
      await createCategory(name, email, description);
    }
    closeCreateModal();
    setLoading(false);
    toast.success("Categories creer avec succes");
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId) return;
    setLoading(false);
    if (email) {
      await updateCategory(editCategoryId, email, name, description);
    }
    closeCreateModal();
    setLoading(false);
    toast.success("Categories miseà jour avec succes.");
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

        {categorie.length > 0 ? <div>d</div> : <EmphyState
          message={"Aucune categorie disponibe"}
          IconComponent="Group"
        />}
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
