"use server";

import { prisma } from "@/lib/prisma";
import { FormDataType, Product } from "@/types";
import { PricingTable } from "@clerk/nextjs";
import { Category } from "@prisma/client";

// fonctions de traitement des associations

export async function checkAndAddAssociation(email: string, name: string) {
  if (!email) return;
  try {
    const existingAssociation = await prisma.association.findUnique({
      where: { email },
    });
    if (!existingAssociation && name) {
      await prisma.association.create({
        data: { email, name },
      });
    }
  } catch (error) {
    console.error("Error checking or adding association:", error);
  }
}

export async function getAssociation(email: string) {
  if (!email) return;
  try {
    const existingAssociation = await prisma.association.findUnique({
      where: { email },
    });
    return existingAssociation;
  } catch (error) {
    console.error("Error getting associations:", error);
  }
}

export async function createCategory(
  name: string,
  email: string,
  description?: string
) {
  if (!email || !name) return;
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.category.create({
      data: {
        name,
        description: description || "",
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function updateCategory(
  id: string,
  email: string,
  name: string,
  description?: string
) {
  if (!email || !name || !id) {
    throw new Error("Tout les champs sont obligatoires.");
  }
  try {
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.category.update({
      where: { id: id },
      data: {
        name,
        description: description || "",
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error("Error updating category:", error);
  }
}

export async function deleteCategory(id: string, email: string) {
  if (!email || !id) {
    throw new Error("Tout les champs sont obligatoires.");
  }
  try {
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.category.delete({
      where: { id: id, associationId: association.id },
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function readCeategory(
  email: string
): Promise<Category[] | undefined> {
  if (!email) {
    throw new Error("l'email est requis.");
  }
  try {
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    const categories = await prisma.category.findMany({
      where: { associationId: association.id },
    });
    return categories;
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

// fonctions de traitement des produits

export async function createProduct(formData: FormDataType, email: string) {
  try {
    const { name, description, price, imageUrl, categoryId, unit } = formData;

    if (!email || !price || !categoryId) {
      throw new Error("l'email, le nom, le prix et la category sont requis.");
    }

    const safeImageUrl = imageUrl || "";
    const safeUnit = unit || "";

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: safeImageUrl,
        categoryId,
        unit: safeUnit,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function updateProduct(formData: FormDataType, email: string) {
  try {
    const { id, name, description, price, imageUrl } = formData;

    if (!email || !price || !id) {
      throw new Error("l'email, le nom, le prix et la category sont requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.product.update({
      where: {
        id: id,
        associationId: association.id,
      },
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function deleteProduct(id: string, email: string) {
  try {
    if (!id) {
      throw new Error("l'id est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    await prisma.product.delete({
      where: {
        id: id,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function readProduct(
  email: string
): Promise<Product[] | undefined> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });

    return products.map((product) => ({
      ...product,
      categoryName: product.category?.name,
    }));
  } catch (error) {
    console.error("Error creating category:", error);
  }
}

export async function readProductById(
  productId: string,
  email: string
): Promise<Product | undefined> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return undefined;
    }

    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    console.error("Error creating category:", error);
  }
}
