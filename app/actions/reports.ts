"use server";

import { prisma } from "@/lib/prisma";
import { ProductOverviewStat, StockSummary } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAssociation } from "./associations";

/**
 * Récupère les statistiques globales d'une association
 * @param email 
 * @returns 
 */
export async function getProductOverviewStats(
  email: string
): Promise<ProductOverviewStat> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    const products = await prisma.product.findMany({
      where: {
        associationId: association.id, 
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        associationId: association.id,
      },
    });

    const categorieSet = new Set(
      products.map((product) => product.category.name)
    );

    const totalProducts = products.length; 
    const totalCategories = categorieSet.size;
    const totalTransaction = transactions.length; 
    const stockValue = products.reduce((acc, product) => {
      return acc + product.price * product.quantity;
    }, 0); 

    return {
      totalProducts,
      totalCategories,
      totalTransaction,
      stockValue,
    };
  } catch (error) {
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
 * @param email 
 * @returns 
 */
export async function getProductCategoryDistribution(email: string) {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

    const R = 5; 

    const categoryWithProductCount = await prisma.category.findMany({
      where: {
        associationId: association.id,
      },
      include: {
        products: {
          select: {
            id: true,
          },
        },
      },
    });

    const data = categoryWithProductCount
      .map((category) => ({
        name: category.name,
        value: category.products.length,
      }))
      .sort((a, b) => b.value - a.value) 
      .slice(0, R); 

    return data;
  } catch (error) {
    console.error("Error getting product category distribution:", error);
  }
}

/**
 * Récupère un résumé du stock (en stock, stock faible, rupture, produits critiques)
 * @param email 
 * @returns 
 */
export async function getStockSummary(email: string): Promise<StockSummary> {
  try {
    if (!email) {
      throw new Error("l'email est requis.");
    }

    const association = await getAssociation(email);

    if (!association) {
      throw new Error("Aucune association trouvée avec cet email.");
    }

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
 * @param email 
 * @returns 
 */
export async function generateStockReport(email: string) {
  try {
    const stats = await getStockSummary(email);

    if (!process.env.GEMINI_API_KEY) {
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
