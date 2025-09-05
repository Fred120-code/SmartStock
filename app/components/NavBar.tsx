import { Blocks, Icon, ListTodo, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavBar = () => {
  const navLinks = [
    {
      href: "/category",
      label: "Catégories",
      icon: ListTodo,
    },
  ];

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
              className={`btn ${activeClass} btn-sm flex gap-2 items-center`}
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

        <button className="btn w-fit sm:hidden btn-sm">
            <Menu className="w-4 h-4"/>
        </button>

        <div className="hidden space-x-2 sm:flex items-center">
            {renderLinks()}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
