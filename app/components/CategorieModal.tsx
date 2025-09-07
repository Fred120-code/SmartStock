import { Value } from "@prisma/client/runtime/library";
import React from "react";
interface Props {
  name: string;
  description: string;
  loading: boolean;
  onclose: () => void;
  onChangeName: (Value: string) => void;
  onChangeDescription: (Value: string) => void;
  onSubmit: () => void;
  editMode?: boolean;
}
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
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onclose}
          >
            X
          </button>
        </form>
        <h3 className="font-bold text-lg mb-4">
          {editMode ? "Modifier la categorie" : "Nouvelle categorie"}
        </h3>
        <input
          type="text"
          placeholder="Nom"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <button className="btn btn-primary" onClick={onSubmit}>
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
