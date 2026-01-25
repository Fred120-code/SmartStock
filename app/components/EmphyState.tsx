import { icons, PackageSearch } from "lucide-react";
import React, { FC } from "react";

interface EmphyStateProps {
  IconComponent: keyof typeof icons; 
  message: string; 
}

const EmphyState: FC<EmphyStateProps> = ({ IconComponent, message }) => {
  const SelectedIcon = icons[IconComponent] || PackageSearch;
  return (
    <div className="w-full h-full  mt-10 flex justify-center items-center flex-col">
      <div>
        <SelectedIcon strokeWidth={1} className="w-30 h-30 text-primary" />
      </div>
      <p className="text-sm font-bold">{message}</p>
    </div>
  );
};

export default EmphyState;
