"use server";

import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";

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
 