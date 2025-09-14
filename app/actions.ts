"use server";

import { prisma } from "@/lib/prisma";
import { FormDataType, Product } from "@/types";
import { PricingTable } from "@clerk/nextjs";
import { Category } from "@prisma/client";

// fonctions de traitement des associations

/**
 * Vérifie si une association existe pour l'email donné, sinon la crée
 * @param email - L'email de l'utilisateur/association
 * @param name - Le nom de l'association à créer si elle n'existe pas
 */
export async function checkAndAddAssociation(email: string, name: string) {
  // Si l'email n'est pas fourni, on ne fait rien
  if (!email) return;
  try {
    // Recherche une association existante par email
    const existingAssociation = await prisma.association.findUnique({
      where: { email },
    });
    // Si aucune association trouvée, on la crée avec le nom fourni
    if (!existingAssociation && name) {
      await prisma.association.create({
        data: { email, name },
      });
    }
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error checking or adding association:", error);
  }
}

/**
 * Récupère une association par email
 * @param email - L'email de l'utilisateur/association
 * @returns L'objet association trouvé ou undefined
 */
export async function getAssociation(email: string) {
  // Si l'email n'est pas fourni, on ne fait rien
  if (!email) return;
  try {
    // Recherche une association existante par email
    const existingAssociation = await prisma.association.findUnique({
      where: { email },
    });
    // Retourne l'association trouvée ou undefined
    return existingAssociation;
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error getting associations:", error);
  }
}

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
    console.error("Error creating category:", error);
  }
}

/**
 * Récupère toutes les catégories d'une association
 * @param email - L'email de l'utilisateur/association
 * @returns Un tableau de catégories ou undefined
 */
export async function readCeategory(
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
    console.error("Error creating category:", error);
  }
}

// fonctions de traitement des produits

/**
 * Crée un nouveau produit pour une association donnée dans la base de données.
 * @param formData - Les données du formulaire du produit (nom, description, prix, image, catégorie, unité, quantité)
 * @param email - L'email de l'utilisateur/association
 * @returns void (ou log l'erreur en cas d'échec)
 */
export async function createProduct(formData: FormDataType, email: string) {
  try {
    // Déstructure les champs nécessaires depuis le formulaire
    const { name, description, price, imageUrl, categoryId, unit, quantity } = formData;

    // Vérifie la présence des champs obligatoires
    if (!email || !price || !categoryId) {
      throw new Error("l'email, le nom, le prix et la category sont requis.");
    }

    // Définit des valeurs par défaut pour les champs optionnels
    const safeImageUrl = imageUrl || ""; // Si aucune image n'est fournie, chaîne vide
    const safeUnit = unit || ""; // Si aucune unité n'est fournie, chaîne vide

    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on lève une erreur
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Création du produit dans la base de données avec toutes les informations
    await prisma.product.create({
      data: {
        name, // Nom du produit
        description, // Description du produit
        price: Number(price), // Prix converti en nombre
        imageUrl: safeImageUrl, // URL de l'image (ou vide)
        categoryId, // ID de la catégorie associée
        unit: safeUnit, // Unité de mesure (ou vide)
        associationId: association.id, // ID de l'association propriétaire
        quantity: Number(quantity), // Quantité initiale convertie en nombre
      },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec de la création
    console.error("Error creating category:", error);
  }
}

/**
 * Met à jour un produit existant pour une association donnée dans la base de données.
 * @param formData - Les données du formulaire du produit (id, nom, description, prix, image)
 * @param email - L'email de l'utilisateur/association
 * @returns void (ou log l'erreur en cas d'échec)
 */
export async function updateProduct(formData: FormDataType, email: string) {
  try {
    // Déstructure tous les champs nécessaires depuis le formulaire
    const { id, name, description, price, imageUrl, quantity, categoryId, unit } = formData;

    // Vérifie la présence des champs obligatoires
    if (!email || !price || !id) {
      throw new Error("l'email, le nom, le prix et la category sont requis.");
    }

    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on lève une erreur
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }
    // Met à jour le produit dans la base de données avec toutes les nouvelles informations
    await prisma.product.update({
      where: {
        id: id, // ID du produit à mettre à jour
        associationId: association.id, // ID de l'association propriétaire (sécurité)
      },
      data: {
        name, // Nouveau nom du produit
        description, // Nouvelle description
        price: Number(price), // Nouveau prix converti en nombre
        imageUrl: imageUrl, // Nouvelle image (ou inchangée)
        quantity: Number(quantity), // Nouvelle quantité
        categoryId, // Nouvelle catégorie
        unit: unit || "", // Nouvelle unité (ou vide)
      },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec de la mise à jour
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

/**
 * Récupère tous les produits d'une association donnée.
 * @param email - L'email de l'utilisateur/association
 * @returns Un tableau de produits enrichis du nom de leur catégorie, ou undefined en cas d'erreur
 */
export async function readProduct(
  email: string
): Promise<Product[] | undefined> {
  try {
    // Vérifie la présence de l'email fourni en paramètre
    if (!email) {
      throw new Error("l'email est requis.");
    }

    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on lève une erreur explicite
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Récupère tous les produits liés à cette association, en incluant la catégorie associée à chaque produit
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id, // On filtre sur l'association courante
      },
      include: {
        category: true, // On inclut les informations de la catégorie liée
      },
    });

    // Pour chaque produit, on ajoute le nom de la catégorie (categoryName) pour simplifier l'affichage côté front
    return products.map((product) => ({
      ...product,
      categoryName: product.category?.name, // Ajoute le nom de la catégorie si elle existe
    }));
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error creating category:", error);
  }
}

/**
 * Récupère un produit précis par son identifiant pour une association donnée.
 * @param productId - L'identifiant du produit à récupérer
 * @param email - L'email de l'utilisateur/association
 * @returns Le produit trouvé enrichi du nom de la catégorie, ou undefined en cas d'erreur ou si non trouvé
 */
export async function readProductById(
  productId: string,
  email: string
): Promise<Product | undefined> {
  try {
    // Vérifie la présence de l'email
    if (!email) {
      throw new Error("l'email est requis.");
    }

    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on lève une erreur
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Recherche le produit par son ID et l'association, inclut la catégorie associée
    const product = await prisma.product.findUnique({
      where: {
        id: productId, // ID du produit recherché
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
      include: {
        category: true, // Inclut les infos de la catégorie liée
      },
    });

    // Si aucun produit n'est trouvé, retourne undefined
    if (!product) {
      return undefined;
    }

    // Retourne le produit enrichi du nom de la catégorie (categoryName)
    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error creating category:", error);
  }
}

export async function replenishStockWithTransaction(productId:string, quantity:number, email:string) {
  try {
     if (quantity <= 0) {
      throw new Error("la quantité à ajouter doit etre > à 0");
    }

    // Vérifie la présence de l'email
    if (!email) {
      throw new Error("l'email est requis.");
    }

    // Récupère l'association liée à l'email
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on lève une erreur
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Recherche le produit par son ID et l'association, inclut la catégorie associée
    await prisma.product.update({
      where: {
        id: productId, // ID du produit recherché
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
     data: {
      quantity :{
        increment: quantity
      }
     }
    });

    await prisma.transaction.create({
      data: {
        type: "IN",
        quantity: quantity,
        productId: productId,
        associationId: association.id
      }
    })
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error creating category:", error);
  }
}