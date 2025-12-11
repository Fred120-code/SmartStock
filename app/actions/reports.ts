"use server";

import { prisma } from "@/lib/prisma";
import { ProductOverviewStat, StockSummary } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAssociation } from "./associations";

/**
 * Récupère les statistiques globales d'une association
 * @param email - L'email de l'utilisateur/association
 * @returns Objet avec nombre de produits, catégories, transactions et valeur du stock
 */
export async function getProductOverviewStats(
  email: string
): Promise<ProductOverviewStat> {
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

    // Recherche tous les produits liés à l'association
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    // Récupère toutes les transactions liées à l'association
    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
    });

    // Liste les catégories et supprime les doublons
    const categorieSet = new Set(
      products.map((product) => product.category.name)
    );

    const totalProducts = products.length; // Calcul le nombre de produits
    const totalCategories = categorieSet.size; // Calcul le nombre de catégories
    const totalTransaction = transactions.length; // Calcul le nombre de transactions
    const stockValue = products.reduce((acc, product) => {
      return acc + product.price * product.quantity;
    }, 0); // Permet de trouver la valeur du stock

    return {
      totalProducts,
      totalCategories,
      totalTransaction,
      stockValue,
    };
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error getting product overview stats:", error);
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalTransaction: 0,
      stockValue: 0,
    };
  }
}

/**
 * Récupère la distribution des produits par catégorie (top 5)
 * @param email - L'email de l'utilisateur/association
 * @returns Tableau de catégories avec nombre de produits (top 5)
 */
export async function getProductCategoryDistribution(email: string) {
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

    const R = 5; // Limite des résultats à 5

    // Recherche les catégories avec le nombre de produits pour chaque
    const categoryWithProductCount = await prisma.category.findMany({
      where: {
        associationId: association.id, // Sécurité : doit appartenir à l'association
      },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transforme les données pour affichage dans un chart
    const data = categoryWithProductCount
      .map((category) => ({
        name: category.name,
        value: category.products.length,
      }))
      .sort((a, b) => b.value - a.value) // Tri décroissant
      .slice(0, R); // Limite aux R premiers

    return data;
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error getting product category distribution:", error);
  }
}

/**
 * Récupère un résumé du stock (en stock, stock faible, rupture, produits critiques)
 * @param email - L'email de l'utilisateur/association
 * @returns Objet avec comptes et liste des produits critiques
 */
export async function getStockSummary(email: string): Promise<StockSummary> {
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

    // Récupère tous les produits de l'association
    const allProducts = await prisma.product.findMany({
      where: {
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });

    // Catégorise les produits selon leur quantité en stock
    const inStock = allProducts.filter((p) => p.quantity > 100);
    const lowStock = allProducts.filter(
      (p) => p.quantity > 0 && p.quantity <= 100
    );
    const outOfStock = allProducts.filter((p) => p.quantity === 0);
    const criticalProducts = [...lowStock, ...outOfStock];

    return {
      inStockCount: inStock.length,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      criticalProducts: criticalProducts.map((p) => ({
        ...p,
        categoryName: p.category.name,
      })),
    };
  } catch (error) {
    // Log l'erreur en cas d'échec de la récupération
    console.error("Error getting stock summary:", error);
    return {
      inStockCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      criticalProducts: [],
    };
  }
}

/**
 * Génère un rapport intelligent sur le stock via l'API Gemini
 * @param email - L'email de l'utilisateur/association
 * @returns Texte du rapport ou message d'erreur
 */
export async function generateStockReport(email: string) {
  try {
    // Récupérer les stats depuis la BDD
    const stats = await getStockSummary(email);

    // Vérifier qu'on a une clé API
    if (!process.env.GEMINI_API_KEY) {
      // Retourne un message lisible au front plutôt qu'une exception brute
      return `Clé API Gemini manquante (GEMINI_API_KEY). Impossible de générer le rapport.`;
    }

    // Initialiser le client Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Appeler Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

    const prompt = `
    Tu es un expert en gestion de stock. 
    Analyse ces données et écris un rapport clair et synthétique pour un gestionnaire non technique.
    n'ajoute pas de style au texte(pas de gras ou autre) juste du texte

    Données:
    ${JSON.stringify(stats)}

    Format attendu:
    - Résumé global
    - Points positifs
    - Risques ou alertes
    - Recommandations
    `;

    const result = await model.generateContent(prompt);

    // Extraction du texte depuis la réponse
    if (result?.response?.text) return result.response.text();
    if (typeof result === "string") return result;
    return JSON.stringify(result);
  } catch (err) {
    console.error("generateStockReport error:", err);
    return `Erreur lors de la génération du rapport: ${String(err)}`;
  }
}
