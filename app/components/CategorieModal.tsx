
// Composant modal pour créer ou modifier une catégorie
import { Value } from "@prisma/client/runtime/library";
import React from "react";

// Définition des props attendues
interface Props {
  name: string; // Nom de la catégorie
  description: string; // Description de la catégorie
  loading: boolean; // Indique si une action est en cours (création/modification)
  onclose: () => void; // Fonction pour fermer la modal
  onChangeName: (Value: string) => void; // Fonction appelée lors de la modification du nom
  onChangeDescription: (Value: string) => void; // Fonction appelée lors de la modification de la description
  onSubmit: () => void; // Fonction appelée lors de la soumission du formulaire
  editMode?: boolean; // true si on est en mode édition, false pour création
}

// Composant principal
const CategorieModal: React.FC<Props> = ({
  name,
  description,
  onclose,
  loading,
  onChangeName,
  onChangeDescription,
  onSubmit,
  editMode,
}) => {
  return (
    <dialog id="Category_modal" className="modal">
      <div className="modal-box">
        {/* Bouton de fermeture de la modal */}
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onclose}
          >
            X
          </button>
        </form>
        {/* Titre de la modal selon le mode */}
        <h3 className="font-bold text-lg mb-4">
          {editMode ? "Modifier la categorie" : "Nouvelle categorie"}
        </h3>
        {/* Champ pour le nom de la catégorie */}
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        {/* Champ pour la description de la catégorie */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        {/* Bouton de validation (ajout ou modification) */}
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading
            ? editMode
              ? "Modifcation..."
              : "Ajout.."
            : editMode
            ? "Modifier"
            : "Ajouter"}
        </button>
      </div>
    </dialog>
  );
};

export default CategorieModal;
