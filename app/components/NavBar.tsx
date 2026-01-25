"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowLeftRight,
  Blocks,
  ChevronRight,
  CircleGauge,
  ListTodo,
  Menu,
  Package,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
  Warehouse,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { checkAndAddAssociation, getAlertCount } from "../actions";
import Stock from "./Stock";

const NavBar = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [showMobileLabels, setShowMobileLabels] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
      checkAndAddAssociation(
        user?.primaryEmailAddress?.emailAddress,
        user.fullName
      );
    }
  }, [user]);

  // Récupère le nombre d'alertes actives
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        if (email) {
          const count = await getAlertCount(email);
          setAlertCount(count);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du nombre d'alertes:",
          error
        );
      }
    };

    fetchAlertCount();
    // Actualise le nombre d'alertes toutes les 30 secondes
    const interval = setInterval(fetchAlertCount, 30000);

    return () => clearInterval(interval);
  }, [email]);

  const navLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: CircleGauge,
    },
    {
      href: "/category",
      label: "Catégories",
      icon: ListTodo,
    },
    {
      href: "/new_product",
      label: "Nouveau produit",
      icon: Package,
    },
    {
      href: "/products",
      label: "Produit",
      icon: ShoppingCart,
    },
    {
      href: "/retrait",
      label: "Retrait",
      icon: PackageMinus,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: ArrowLeftRight,
    },
    {
      href: "/alerts",
      label: "Alertes",
      icon: AlertCircle,
      badge: alertCount > 0 ? alertCount : null,
    },
  ];

  const pathname = usePathname();

  // Fonction pour afficher dynamiquement les liens de navigation
  const renderLinks = () => {
    return (
      <div className="flex flex-col justify-center gap-9 items-start">
        {navLinks.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;
          const activeClass = isActive ? "btn-primary" : "btn-ghost";

          return (
            <Link
              href={href}
              key={href}
              className={`btn ${activeClass} btn-sm flex gap-2 items-center rounded-lg relative`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && (
                <span className="badge badge-warning badge-sm absolute -top-2 -right-2">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          className="btn btn-sm"
          onClick={() =>
            (
              document.getElementById("my_modal_stock") as HTMLDialogElement
            ).showModal()
          }
        >
          <PackagePlus className="h-4 w-4" />
          Alimenter
        </button>
      </div>
    );
  };

  // Rendu du composant NavBar
  return (
    <div className="border-2 bg-primary/25 mt-7 ml-7 rounded-2xl border-base-100 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center flex-col gap-10">
        {/* Logo et nom de l'application */}
        <div className="flex items-center">
          <div className="p-2">
            <Blocks className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl hidden md:inline-block">
            SmartStock
          </span>
        </div>
  

        {/* Liens de navigation (desktop) + bouton utilisateur */}
        <div className="hidden space-x-2 sm:flex items-center flex-col justify-between gap-10">
          {renderLinks()}
          <UserButton />
        </div>

        {/* Mobile: icônes seulement avec option d'afficher les labels via le bouton '->' */}
        <div className="flex flex-col items-center gap-6 sm:hidden">
          {navLinks.map(({ href, label, icon: Icon, badge }) => {
            const isActive = pathname === href;
            const activeClass = isActive ? "btn-primary" : "btn-ghost";
            return (
              <div
                className=" tooltip tooltip-primary"
                data-tip={label}
                key={label}
              >
                <Link
                  href={href}
                  key={href}
                  className={`btn ${activeClass} btn-sm flex flex-col items-center justify-center rounded-lg p-2 relative`}
                >
                  <Icon className="w-5 h-5" />
                  {badge && (
                    <span className="badge badge-warning badge-xs absolute -top-1 -right-1">
                      {badge}
                    </span>
                  )}
                  {/* Label masqué par défaut sur mobile, visible si showMobileLabels=true */}
                  <span
                    className={`ml-2 transition-all text-center duration-300 text-[11px] ${
                      showMobileLabels ? "inline-block" : "hidden"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </div>
            );
          })}
          {/* Bouton pour ouvrir le modal d'alimentation (mobile) */}
          <button
            className="btn btn-sm p-2"
            onClick={() =>
              (
                document.getElementById("my_modal_stock") as HTMLDialogElement
              ).showModal()
            }
          >
            <PackagePlus className="h-4 w-4" />
            <span
              className={`ml-2 text-[10px] sm:text-xl ${
                showMobileLabels ? "inline-block" : "hidden"
              }`}
            >
              Alimenter
            </span>
          </button>
          {/* Bouton '->' pour basculer l'affichage des labels sur mobile */}
          <button
            aria-label="Afficher les labels"
            className="btn btn-ghost btn-sm ml-2"
            onClick={() => setShowMobileLabels((s) => !s)}
          >
            {/* Utilisation d'une flèche simple pour indiquer le toggle */}
            <span className="text-lg">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
      <Stock />
    </div>
  );
};

export default NavBar;
