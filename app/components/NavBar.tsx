
import { Icon, ListTodo } from "lucide-react";
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
    </>;
  };
  return <div>Navbar</div>;
};

export default NavBar;
