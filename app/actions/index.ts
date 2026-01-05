// Fichier d'export centralisé pour compatibilité avec les imports existants
// Tous les imports du projet qui utilisaient `import { ... } from "../actions"`
// continueront de fonctionner grâce à ce fichier.

// === Exports depuis associations.ts ===
export { checkAndAddAssociation, getAssociation } from "./associations";

// === Exports depuis categories.ts ===
export {
  createCategory,
  updateCategory,
  deleteCategory,
  readCategory,
} from "./categories";

// Alias pour compatibilité avec la typo existante (readCeategory → readCategory)
export { readCategory as readCeategory } from "./categories";

// === Exports depuis products.ts ===
export {
  createProduct,
  updateProduct,
  deleteProduct,
  readProduct,
  readProductById,
} from "./products";

// === Exports depuis stock.ts ===
export {
  replenishStockWithTransaction,
  deductStockWithTransaction,
  getTransaction,
} from "./stock";

// === Exports depuis reports.ts ===
export {
  getProductOverviewStats,
  getProductCategoryDistribution,
  getStockSummary,
  generateStockReport,
} from "./reports";

// === Exports depuis alerts.ts ===
export {
  checkAndCreateStockAlerts,
  getActiveAlerts,
  resolveAlert,
  updateProductAlertSettings,
  getAlertCount,
} from "./alerts";
