import { Blocks, Icon, ListTodo, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const NavBar = () => {
  const navLinks = [
    {
      href: "/category",
      label: "Catégories",
      icon: ListTodo,
    },
  ];

  //gerer le menu
  const [menuOpen, setMenuOpen] = useState(false);

  //nous permet de recuperer le chemin de la page dans la quell nous sommes
  const pathname = usePathname();

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
  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4 relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2">
            <Blocks className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl">SmartStock</span>
        </div>

        <button
          className="btn w-fit sm:hidden btn-sm rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="hidden space-x-2 sm:flex items-center">
          {renderLinks()}
        </div>
      </div>

      <div
        className={`absolute top-0 w-full bg-gray-700 h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden z-50
                ${menuOpen ? "left-0" : "left-full"}
        `}
      >
        <div className="flex w-fit sm:hidden btn-sm">
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
