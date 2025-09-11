"use client"

// Composant de barre de navigation principal de l'application
import { UserButton, useUser } from "@clerk/nextjs";
import { Blocks, ListTodo, Menu, PackagePlus, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddAssociation } from "../actions";

const NavBar = () => {
  // Récupération de l'utilisateur connecté
  const { user } = useUser();

  // Ajoute l'utilisateur à l'association s'il est connecté
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
      checkAndAddAssociation(
        user?.primaryEmailAddress?.emailAddress,
        user.fullName
      );
    }
  }, [user]);

  // Tableau contenant les liens de navigation de la navbar
  const navLinks = [
    {
      href: "/category",
      label: "Catégories",
      icon: ListTodo,
    },
    {
      href: "/new_product",
      label: "Nouveau produit",
      icon: PackagePlus,
    },  
    {
      href: "/products",
      label: "produit",
      icon: ShoppingCart,
    },
  ];

  // État pour gérer l'ouverture du menu mobile
  const [menuOpen, setMenuOpen] = useState(false);

  // Permet de récupérer le chemin de la page courante
  const pathname = usePathname();

  // Fonction pour afficher dynamiquement les liens de navigation
  const renderLinks = () => {
    return (
      <>
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          const activeClass = isActive ? "btn-primary" : "btn-ghost";

          return (
            <Link
              href={href}
              key={href}
              className={`btn ${activeClass} btn-sm flex gap-2 items-center rounded-lg`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </>
    );
  };

  // Rendu du composant NavBar
  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        {/* Logo et nom de l'application */}
        <div className="flex items-center">
          <div className="p-2">
            <Blocks className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">SmartStock</span>
        </div>

        {/* Bouton menu mobile */}
        <button
          className="btn w-fit sm:hidden btn-sm rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Liens de navigation (desktop) + bouton utilisateur */}
        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks()}
          <UserButton />
        </div>
      </div>

      {/* Menu mobile latéral */}
      <div
        className={`absolute top-0 w-full bg-gray-700 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50
                ${menuOpen ? "left-0" : "left-full"}
        `}
      >
        <div className="flex justify-between">
          <UserButton />
          {/* Bouton pour fermer le menu mobile */}
          <button
            className="btn w-fit sm:hidden btn-sm rounded-md"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {renderLinks()}
      </div>
    </div>
  );
};

export default NavBar;
