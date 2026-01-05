"use server";

/**
 * Fichier contenant les actions pour la gestion des alertes de stock
 * Permet de vérifier, créer et gérer les alertes de stock faible
 */

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
    // Vérifie que l'association existe
    const association = await prisma.association.findUnique({
      where: { email },
    });

    if (!association) {
      throw new Error("Association non trouvée");
    }

    // Récupère tous les produits de l'association
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id,
        alertEnabled: true, // Alerte activée
      },
    });

    const createdAlerts = [];

    // Vérifie chaque produit
    for (const product of products) {
      // Si la quantité est inférieure au minimum
      if (product.quantity < product.minQuantity) {
        // Vérifie s'il y a déjà une alerte active pour ce produit
        const existingAlert = await prisma.stockAlert.findFirst({
          where: {
            productId: product.id,
            status: "active",
          },
        });

        // Si pas d'alerte existante, on la crée
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
        // Si la quantité est maintenant OK, on résout les alertes existantes
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
 * Résout une alerte (marque comme résolue)
 *
 * @param alertId - ID de l'alerte à résoudre
 * @returns L'alerte résolue
 */
export async function resolveAlert(alertId: string) {
  try {
    const alert = await prisma.stockAlert.update({
      where: { id: alertId },
      data: {
        status: "resolved",
        resolvedAt: new Date(),
      },
      include: {
        product: true,
      },
    });

    return alert;
  } catch (error) {
    console.error("Erreur lors de la résolution de l'alerte:", error);
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
 *
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
