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
    const { name, description, price, imageUrl, categoryId, unit, quantity } =
      formData;

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
        quantity: Number(quantity),
      },
    });
  } catch (error) {
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
        quantity: Number(quantity), 
        categoryId, 
        unit: unit || "", 
      },
    });
  } catch (error) {
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
      categoryName: product.category?.name,
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

    // Retourne le produit enrichi du nom de la catégorie (categoryName)
    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    console.error("Error reading product by id:", error);
  }
}
