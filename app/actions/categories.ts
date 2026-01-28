"use server";

import { prisma } from "@/lib/prisma";
import { Category } from "@prisma/client";
import { getAssociation } from "./associations";

/**
 * Crée une nouvelle catégorie pour une association donnée
 * @param name - Le nom de la catégorie à créer
 * @param email - L'email de l'utilisateur/association
 * @param description - (optionnel) Description de la catégorie
 */
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

/**
 * Met à jour une catégorie existante
 * @param id
 * @param email 
 * @param name
 * @param description 
 */
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

/**
 * Supprime une catégorie pour une association donnée
 * @param id 
 * @param email
 */
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
    console.error("Error deleting category:", error);
  }
}

/**
 * Récupère toutes les catégories d'une association
 * @param email 
 * @returns 
 */
export async function readCategory(
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
    console.error("Error reading categories:", error);
  }
}
