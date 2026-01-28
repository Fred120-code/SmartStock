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
    if (quantity <= 0) {
      throw new Error("la quantité à ajouter doit être > à 0");
    }

    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    await prisma.product.update({
      where: {
        id: productId, 
        associationId: association.id, 
      },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });

    await prisma.transaction.create({
      data: {
        type: "IN", 
        quantity: quantity, 
        productId: productId, 
        associationId: association.id, 
      },
    });
  } catch (error) {
    console.error("Error replenishing stock:", error);
  }
}

/**
 * Déduit du stock pour une liste de produits et enregistre les transactions correspondantes ("OUT").
 * @param orderItem 
 * @param email 
 * @returns 
 */
export async function deductStockWithTransaction(
  orderItem: OrderItem[],
  email: string
) {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    for (let item of orderItem) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Produit avec l'Id ${item.productId} est inexistant`);
      }

      if (item.quantity <= 0) {
        throw new Error(`La quantité pour "${product.name}" doit être > 0`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Le produit "${product.name}" est insuffisant. Demande : ${item.quantity} ${item.unit}, Disponible: ${product.quantity} ${product.unit}`
        );
      }
    }

    // --- Opération atomique ---
    await prisma.$transaction(async (tx) => {
      for (const item of orderItem) {
        await tx.product.update({
          where: {
            id: item.productId, 
            associationId: association.id,
          },
          data: {
            quantity: {
              decrement: item.quantity, 
            },
          },
        });

        await tx.transaction.create({
          data: {
            type: "OUT", 
            quantity: item.quantity, 
            productId: item.productId, 
            associationId: association.id, 
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: error };
  }
}

/**
 * Récupère toutes les transactions d'une association
 * @param email 
 * @param limit 
 * @returns 
 */
export async function getTransaction(
  email: string,
  limit?: number
): Promise<Transaction[]> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id, 
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
    console.error("Error getting transactions:", error);
    return [];
  }
}
