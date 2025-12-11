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
  // Vérifie la présence des champs obligatoires
  if (!email || !name) return;
  try {
    // Récupère l'association liée à l'email
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Crée la catégorie en base de données
    await prisma.category.create({
      data: {
        name,
        description: description || "", // Si pas de description, chaîne vide
        associationId: association.id, // Lien avec l'association
      },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error creating category:", error);
  }
}

/**
 * Met à jour une catégorie existante
 * @param id - L'identifiant de la catégorie à modifier
 * @param email - L'email de l'utilisateur/association
 * @param name - Le nouveau nom de la catégorie
 * @param description - (optionnel) Nouvelle description
 */
export async function updateCategory(
  id: string,
  email: string,
  name: string,
  description?: string
) {
  // Vérifie la présence des champs obligatoires
  if (!email || !name || !id) {
    throw new Error("Tout les champs sont obligatoires.");
  }
  try {
    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Met à jour la catégorie en base de données
    await prisma.category.update({
      where: { id: id }, // On cible la catégorie par son id
      data: {
        name,
        description: description || "", // Si pas de description, chaîne vide
        associationId: association.id, // Lien avec l'association
      },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error updating category:", error);
  }
}

/**
 * Supprime une catégorie pour une association donnée
 * @param id - L'identifiant de la catégorie à supprimer
 * @param email - L'email de l'utilisateur/association
 */
export async function deleteCategory(id: string, email: string) {
  // Vérifie la présence des champs obligatoires
  if (!email || !id) {
    throw new Error("Tout les champs sont obligatoires.");
  }
  try {
    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Supprime la catégorie en base de données (en s'assurant qu'elle appartient bien à l'association)
    await prisma.category.delete({
      where: { id: id, associationId: association.id },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error deleting category:", error);
  }
}

/**
 * Récupère toutes les catégories d'une association
 * @param email - L'email de l'utilisateur/association
 * @returns Un tableau de catégories ou undefined
 */
export async function readCategory(
  email: string
): Promise<Category[] | undefined> {
  // Vérifie la présence de l'email
  if (!email) {
    throw new Error("l'email est requis.");
  }
  try {
    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Récupère toutes les catégories liées à cette association
    const categories = await prisma.category.findMany({
      where: { associationId: association.id },
    });
    return categories;
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error reading categories:", error);
  }
}
