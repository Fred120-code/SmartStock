"use server";

import { prisma } from "@/lib/prisma";

/**
 * Vérifie si une association existe pour l'email donné, sinon la crée
 * @param email
 * @param name
 */
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

/**
 * Récupère une association par email
 * @param email
 * @returns
 */
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
