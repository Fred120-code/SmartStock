"use server";

import { prisma } from "@/lib/prisma";
import { FormDataType, Product } from "@/types";
import { getAssociation } from "./associations";

/**
 * Crée un nouveau produit pour une association donnée dans la base de données.
 * @param formData - Les données du formulaire du produit (nom, description, prix, image, catégorie, unité, quantité)
 * @param email - L'email de l'utilisateur/association
 * @returns void (ou log l'erreur en cas d'échec)
 */
export async function createProduct(formData: FormDataType, email: string) {
  try {
    // Déstructure les champs nécessaires depuis le formulaire
    const { name, description, price, imageUrl, categoryId, unit, quantity } =
      formData;

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
    console.error("Error creating product:", error);
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
    const {
      id,
      name,
      description,
      price,
      imageUrl,
      quantity,
      categoryId,
      unit,
    } = formData;

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
    console.error("Error updating product:", error);
  }
}

/**
 * Supprime un produit pour une association donnée
 * @param id - L'identifiant du produit à supprimer
 * @param email - L'email de l'utilisateur/association
 */
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
    console.error("Error deleting product:", error);
  }
}

/**
 * Récupère tous les produits d'une association donnée.
 * @param email - L'email de l'utilisateur/association
 * @returns Un tableau de produits enrichis du nom de leur catégorie, ou undefined en cas d'erreur
 */
export async function readProduct(
  email: string,
  searchQuery?: string,
  selectedProductId: string[] = []
): Promise<Product[] | undefined> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }
    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // Constructeur de filtre dynamique
    const where: any = {
      associationId: association.id,
    };

    // Ajoute le filtre pour exclure les produits selectionnés
    if (selectedProductId && selectedProductId.length > 0) {
      where.id = {
        notIn: selectedProductId,
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
    });

    // Filtre les résultats côté client (case-insensitive) si searchQuery est fourni
    const filteredProducts =
      searchQuery && searchQuery.trim() !== ""
        ? products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : products;

    // Pour chaque produit, on ajoute le nom de la catégorie (categoryName) pour simplifier l'affichage côté front
    return filteredProducts.map((product) => ({
      ...product,
      categoryName: product.category?.name, // Ajoute le nom de la catégorie si elle existe
    }));
  } catch (error) {
    console.error("Error reading products:", error);
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
    console.error("Error reading product by id:", error);
  }
}
