"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  AlertCircle,
  ArrowLeftRight,
  Blocks,
  CircleGauge,
  ListTodo,
  Menu,
  Package,
  PackageMinus,
  PackagePlus,
  ShoppingCart,
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

  const [isOpen, setIsOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
      checkAndAddAssociation(
        user?.primaryEmailAddress?.emailAddress,
        user.fullName,
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
          error,
        );
      }
    };

    fetchAlertCount();
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
      label: "Produits",
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

  const renderLinks = () => {
    return navLinks.map(({ href, label, icon: Icon, badge }) => {
      const isActive = pathname === href;

      return (
        <Link
          href={href}
          key={href}
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
            isActive
              ? "bg-primary text-white shadow-md"
              : "text-base-content hover:bg-base-200 dark:hover:bg-base-200"
          }`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">{label}</span>
          {badge && (
            <span className="ml-auto badge badge-sm badge-error text-white">
              {badge}
            </span>
          )}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-base-100 border-r border-base-300 shadow-lg p-6 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary rounded-lg">
            <Blocks className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-base-content">SmartStock</h1>
            <p className="text-xs text-base-content/50">Gestion intelligente</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
          {renderLinks()}
        </nav>

        {/* Bouton Alimenter */}
        <button
          className="btn btn-primary w-full gap-2 mb-4"
          onClick={() =>
            (
              document.getElementById("my_modal_stock") as HTMLDialogElement
            ).showModal()
          }
        >
          <PackagePlus className="w-5 h-5" />
          Alimenter le stock
        </button>

        {/* User */}
        <div className="border-t border-base-300 pt-4">
          <UserButton />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-base-100 border-b border-base-300 z-40 flex items-center justify-between px-4 py-4 shadow-md h-16">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Blocks className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg">SmartStock</h1>
        </div>

        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-base-100 z-30 flex flex-col p-4 overflow-y-auto">
          <nav className="flex flex-col gap-2 mb-4">{renderLinks()}</nav>

          <button
            className="btn btn-primary w-full gap-2 mb-4"
            onClick={() => {
              (
                document.getElementById("my_modal_stock") as HTMLDialogElement
              ).showModal();
              setIsOpen(false);
            }}
          >
            <PackagePlus className="w-5 h-5" />
            Alimenter le stock
          </button>

          <div className="border-t border-base-300 pt-4">
            <UserButton />
          </div>
        </div>
      )}

      <Stock />
    </>
  );
};

export default NavBar;
