// Composant d'affichage d'un état vide (ex : aucune donnée à afficher)
import { icons } from "lucide-react";
import React, { FC } from "react";

// Props attendues : une icône (par nom) et un message à afficher
interface EmphyStateProps {
  IconComponent: keyof typeof icons; // Nom de l'icône à afficher
  message: string; // Message à afficher
}

// Composant principal
const EmphyState: FC<EmphyStateProps> = ({ IconComponent, message }) => {
  // Sélection dynamique de l'icône à partir de lucide-react
  const SelectedIcon = icons[IconComponent];
  return (
    <div className="w-full h-full my-20 flex justify-center items-center flex-col">
      {/* Affichage de l'icône */}
      <div>
        <SelectedIcon strokeWidth={1} className="w-30 h-30 text-primary" />
      </div>
      {/* Affichage du message */}
      <p className="text-sm ">{message}</p>
    </div>
  );
};

export default EmphyState;
