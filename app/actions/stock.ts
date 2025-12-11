"use server";

import { prisma } from "@/lib/prisma";
import { OrderItem, Transaction } from "@/types";
import { getAssociation } from "./associations";

/**
 * Ajoute du stock à un produit et enregistre cette opération comme une transaction d'entrée ("IN").
 * @param productId - L'identifiant du produit à réapprovisionner
 * @param quantity - La quantité à ajouter au stock (doit être > 0)
 * @param email - L'email de l'utilisateur/association (sert à vérifier l'appartenance)
 */
export async function replenishStockWithTransaction(
  productId: string,
  quantity: number,
  email: string
) {
  try {
    // Vérifie que la quantité à ajouter est strictement positive
    if (quantity <= 0) {
      throw new Error("la quantité à ajouter doit être > à 0");
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

    // Incrémente la quantité du produit dans la base de données
    await prisma.product.update({
      where: {
        id: productId, // ID du produit à mettre à jour
        associationId: association.id, // Sécurité : le produit doit appartenir à l'association
      },
      data: {
        quantity: {
          increment: quantity, // Ajoute la quantité spécifiée au stock existant
        },
      },
    });

    // Enregistre la transaction d'entrée dans l'historique
    await prisma.transaction.create({
      data: {
        type: "IN", // Type d'opération : entrée de stock
        quantity: quantity, // Quantité ajoutée
        productId: productId, // Produit concerné
        associationId: association.id, // Association concernée
      },
    });
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error("Error replenishing stock:", error);
  }
}

/**
 * Déduit du stock pour une liste de produits et enregistre les transactions correspondantes ("OUT").
 * @param orderItem - Liste des items avec productId et quantity
 * @param email - L'email de l'utilisateur/association
 * @returns Objet indiquant le succès ou l'erreur
 */
export async function deductStockWithTransaction(
  orderItem: OrderItem[],
  email: string
) {
  try {
    // --- Validation d'entrée ---
    // Vérifie la présence de l'email (nécessaire pour lier les opérations à une association)
    if (!email) {
      throw new Error("l'email est requis.");
    }

    // Récupère l'association liée à l'email (permet de vérifier la propriété des produits)
    const association = await getAssociation(email);

    // Si aucune association n'est trouvée, on arrête l'opération
    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    // --- Vérifications préalables sur chaque item ---
    // Pour chaque ligne de commande, on s'assure que :
    // 1) le produit existe, 2) la quantité demandée est > 0, 3) il y a assez de stock
    for (let item of orderItem) {
      // Recherche du produit par son id (sans filtrer sur l'association ici pour récupérer l'unité et le nom)
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      // Si le produit n'existe pas, on lève une erreur claire
      if (!product) {
        throw new Error(`Produit avec l'Id ${item.productId} est inexistant`);
      }

      // La quantité demandée pour une commande doit être strictement positive
      if (item.quantity <= 0) {
        throw new Error(`La quantité pour "${product.name}" doit être > 0`);
      }

      // Vérifie qu'il y a suffisamment de stock pour satisfaire la demande
      if (product.quantity < item.quantity) {
        throw new Error(
          `Le produit "${product.name}" est insuffisant. Demande : ${item.quantity} ${item.unit}, Disponible: ${product.quantity} ${product.unit}`
        );
      }
    }

    // --- Opération atomique ---
    // On utilise une transaction atomique Prisma ($transaction) pour s'assurer que
    // toutes les mises à jour de stock et l'enregistrement des transactions sont
    // appliquées ensemble. Si une opération échoue, tout sera rollback.
    await prisma.$transaction(async (tx) => {
      for (const item of orderItem) {
        // Décrémente la quantité du produit dans le contexte transactionnel (tx)
        await tx.product.update({
          where: {
            id: item.productId, // Produit ciblé
            associationId: association.id, // On s'assure que le produit appartient bien à l'association
          },
          data: {
            quantity: {
              decrement: item.quantity, // Retire la quantité demandée
            },
          },
        });

        // Enregistre une ligne de transaction de type OUT (sortie de stock).
        await tx.transaction.create({
          data: {
            type: "OUT", // Type d'opération : sortie de stock
            quantity: item.quantity, // Quantité retirée
            productId: item.productId, // Produit concerné
            associationId: association.id, // Association concernée
          },
        });
      }
    });

    // Retourne un objet simple signalant le succès
    return { success: true };
  } catch (error) {
    // Log l'erreur en cas d'échec
    console.error(error);
    return { success: false, message: error };
  }
}

/**
 * Récupère toutes les transactions d'une association
 * @param email - L'email de l'utilisateur/association
 * @param limit - Nombre limite de transactions à retourner (optionnel)
 * @returns Tableau de transactions enrichies
 */
export async function getTransaction(
  email: string,
  limit?: number
): Promise<Transaction[]> {
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
    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Retourne le produit enrichi du nom de la catégorie (categoryName)
    return transactions.map((tx) => ({
      ...tx,
      categoryName: tx.product.category.name,
      productName: tx.product.name,
      imageUrl: tx.product.imageUrl,
      price: tx.product.price,
      unit: tx.product.unit,
    }));
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error getting transactions:", error);
    return [];
  }
}
