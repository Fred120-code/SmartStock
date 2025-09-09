// Composant d'habillage global pour toutes les pages (layout)
import React from "react";
import { ToastContainer } from "react-toastify"; // Pour afficher les notifications
import Navbar from "./NavBar"; // Barre de navigation principale

// Props attendues : les enfants à afficher dans le layout
type WrapperProps = {
  children: React.ReactNode;
};

// Composant principal
const Wrapper = ({ children }: WrapperProps) => {
  return (
    <div>
      {/* Barre de navigation en haut de page */}
      <Navbar />
      {/* Conteneur pour les notifications Toast */}
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      {/* Contenu principal de la page avec marges */}
      <div className="px-5 md:px-[10%] mt-8 mb-10">{children}</div>
    </div>
  );
};

export default Wrapper;
