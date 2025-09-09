// Composant d'affichage d'une image de produit dans un cadre stylisé
import React from "react";
import Image from "next/image";

// Props attendues : source, texte alternatif, classes de hauteur et largeur optionnelles
interface ProductImageProps {
  src: string; // URL de l'image
  alt: string; // Texte alternatif pour l'image
  heightClass?: string; // Classe CSS pour la hauteur
  widhtClass?: string; // Classe CSS pour la largeur
}

// Composant principal
const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  heightClass,
  widhtClass,
}) => {
  return (
    <div className="avatar">
      {/* Cadre stylisé (squircle) pour l'image */}
      <div className={`mask mask-squircle ${heightClass} ${widhtClass}`}>
        <Image
          src={src}
          alt={alt}
          quality={100}
          className="object-cover"
          height={500}
          width={500}
        />
      </div>
    </div>
  );
};

export default ProductImage;
