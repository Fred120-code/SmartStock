import { Product } from "@/types";
import React from "react";
import ProductImage from "./ProductImage";
import { Plus } from "lucide-react";

interface ProductComponentProps {
  product?: Product | null;
  add?: boolean;
  handleAddToCard?: (product: Product) => void;
}

const ProductComponent: React.FC<ProductComponentProps> = ({
  product,
  add,
  handleAddToCard,
}) => {
  if (!product) {
    return (
      <div className="border-2 border-base p-4 rounded-3xl w-full flex items-center">
        Selectionner un produit pour voir ses details
      </div>
    );
  }

  return (
    <div className="border-2 border-base p-4 rounded-3xl w-full flex items-center">
      <div>
        <ProductImage
          src={product.imageUrl}
          alt={product.imageUrl}
          heightClass="h-30"
          widhtClass="w-30"
        />
      </div>
      <div className="flex flex-col ml-4 space-y-2">
        <h2 className="text-lg font-bold">{product.name}</h2>
        <div className=" badge badge-warning badge-soft">
            {product.categoryName}
        </div>
        <div className=" badge badge-warning badge-soft">
            {product.quantity}{product.unit}
        </div>

        {
            add && handleAddToCard && (
                <button
                    onClick={()=> handleAddToCard(product)}
                    className="btn btn-sm btn-circle btn-primary"
                >
                    <Plus className="h-4 w-4"/>
                </button>
            )
        }
      </div>
    </div>
  );
};

export default ProductComponent;
