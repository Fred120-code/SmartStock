"use server";

import { prisma } from "@/lib/prisma";

/**
 * Fonction pour vérifier et créer des alertes de stock faible
 * Parcourt tous les produits d'une association et crée une alerte si:
 * - Le produit est en-dessous du minimum défini
 * - L'alerte est activée pour ce produit
 * - Une alerte active n'existe pas déjà
 *
 * @param email - Email de l'association
 * @returns Tableau d'alertes créées
 */
export async function checkAndCreateStockAlerts(email: string) {
  try {
    const association = await prisma.association.findUnique({
      where: { email },
    });

    if (!association) {
      throw new Error("Association non trouvée");
    }

    const products = await prisma.product.findMany({
      where: {
        associationId: association.id,
        alertEnabled: true, 
      },
    });

    const createdAlerts = [];

    for (const product of products) {
      if (product.quantity < product.minQuantity) {
        const existingAlert = await prisma.stockAlert.findFirst({
          where: {
            productId: product.id,
            status: "active",
          },
        });

        if (!existingAlert) {
          const alert = await prisma.stockAlert.create({
            data: {
              message: `Stock faible: ${product.name} (${product.quantity}${product.unit} / min: ${product.minQuantity}${product.unit})`,
              productId: product.id,
              associationId: association.id,
              status: "active",
            },
            include: {
              product: true,
            },
          });
          createdAlerts.push(alert);
        }
      } else {
        await prisma.stockAlert.updateMany({
          where: {
            productId: product.id,
            status: "active",
          },
          data: {
            status: "resolved",
            resolvedAt: new Date(),
          },
        });
      }
    }

    return createdAlerts;
  } catch (error) {
    console.error("Erreur lors de la vérification des alertes:", error);
    throw error;
  }
}

/**
 * Récupère toutes les alertes actives pour une association
 *
 * @param email - Email de l'association
 * @returns Tableau des alertes actives avec infos produit
 */
export async function getActiveAlerts(email: string) {
  try {
    const association = await prisma.association.findUnique({
      where: { email },
    });

    if (!association) {
      throw new Error("Association non trouvée");
    }

    const alerts = await prisma.stockAlert.findMany({
      where: {
        associationId: association.id,
        status: "active",
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return alerts;
  } catch (error) {
    console.error("Erreur lors de la récupération des alertes:", error);
    throw error;
  }
}


/**
 * Met à jour les paramètres d'alerte d'un produit
 *
 * @param productId - ID du produit
 * @param minQuantity - Quantité minimale
 * @param alertEnabled - Alerte activée ou non
 * @returns Le produit mis à jour
 */
export async function updateProductAlertSettings(
  productId: string,
  minQuantity: number,
  alertEnabled: boolean
) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        minQuantity,
        alertEnabled,
      },
    });

    return product;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des paramètres d'alerte:",
      error
    );
    throw error;
  }
}

/**
 * Compte le nombre d'alertes actives pour une association
 * @param email - Email de l'association
 * @returns Nombre d'alertes actives
 */
export async function getAlertCount(email: string) {
  try {
    const association = await prisma.association.findUnique({
      where: { email },
    });

    if (!association) {
      return 0;
    }

    const count = await prisma.stockAlert.count({
      where: {
        associationId: association.id,
        status: "active",
      },
    });

    return count;
  } catch (error) {
    console.error("Erreur lors du comptage des alertes:", error);
    return 0;
  }
}
