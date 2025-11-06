# SmartStock

Application Next.js (App Router) pour la gestion de stock d'associations : produits, catégories, transactions, upload d'images, et génération de rapports IA.

## Résumé

SmartStock permet de :

- gérer des associations, catégories et produits (création, modification, suppression),
- gérer les mouvements de stock (IN / OUT) avec génération de transactions,
- uploader et supprimer des images produit (dossier `public/uploads`),
- générer un rapport intelligent via une API utilisant un service IA (Gemini),
- thèmes UI (fantasy / night) avec adaptation des couleurs (placeholders, h3, inputs, selects, etc.),
- affichage responsive avec NavBar optimisée pour mobile (icônes seules + bouton bascule).

## Tech & libs

- Next.js (App Router)
- React
- Tailwind CSS + DaisyUI (thèmes)
- Prisma (ORM) + base de données (config via `DATABASE_URL`)
- Recharts (charting)
- API serverless routes dans `app/api/*`
- (Optionnel) SDK IA (Gemini) via `GEMINI_API_KEY`

## Prérequis

- Node.js (>=16/18 recommandé)
- pnpm / npm / yarn
- Base de données (SQLite/Postgres/MySQL) selon `DATABASE_URL`
- Variables d'environnement (voir section suivante)

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec au minimum :

- DATABASE_URL="postgresql://user:pass@host:port/dbname" (ou sqlite)
- GEMINI_API_KEY="votre_cle_gemini" (si vous utilisez la génération IA)
- NEXTAUTH\_... (si authentification utilisée)
  Redémarrez le serveur Next après modification.

## Installation & lancement

1. Installer les dépendances :
   ```bash
   npm install
   # ou
   pnpm install
   ```
2. Générer Prisma & migrations (si schéma présent) :
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   # ou si sqlite, vérifier le fichier de db et lancer migrate
   ```
3. Démarrer le serveur en dev :
   ```bash
   npm run dev
   ```
4. Construction / production :
   ```bash
   npm run build
   npm run start
   ```

## Structure du projet (dossier `app`)

- `actions.ts`  
  Fonctions serveur réutilisables (CRUD produits, catégories, transactions, génération de rapport IA, upload/delete images, helpers d'association). Contient la logique Prisma.

- `ChangeMode.tsx`  
  Composant pour basculer entre les thèmes DaisyUI (`fantasy` / `night`). Modifie `html[data-theme]`.

- `globals.css`  
  Styles globaux, overrides Tailwind/DaisyUI (placeholders, h3, couleurs selon thème).

- `layout.tsx`  
  Layout principal (Wrapper, NavBar, etc.).

- `page.tsx`  
  Page principale / dashboard.

- `api/`
  - `report/route.ts` : endpoint serveur pour générer le rapport IA (`/api/report`).

  - `upload/route.ts` : endpoint pour upload d'image (`POST /api/upload`).

  - `uploads/route.ts` : endpoint pour suppression d'image (`DELETE /api/uploads`).

- `category/page.tsx`  
  Gestion des catégories (liste, modal création/édition).
- `components/`
  - `AnalyseIA.tsx` : fetch `/api/report` et affiche le rapport (affiche spinner, gère l'état).
  - `CategorieModal.tsx` : modal de création/édition de catégorie.
  - `CategoryChart.tsx` : chart (Recharts) avec gradient bleu→violet appliqué aux barres.
  - `EmphyState.tsx` : composant affichage état vide (icone + message).
  - `NavBar.tsx` : barre de navigation (responsive : cache titre/labels en mobile, affiche icônes, bouton "→" pour basculer labels).
  - `ProductComponent.tsx`, `ProductImage.tsx`, `ProductOverview.tsx` : UI produits.
  - `Stock.tsx`, `StockSummaryTable.tsx` : résumé et tableau de stock.
  - `TransactionComponent.tsx` : ligne d'affichage d'une transaction.
  - `Wrapper.tsx` : wrapper global (nav, notifications).
- `new_product/page.tsx`  
  Formulaire de création produit (upload d'image, quantité, catégorie, unité).
- `products/page.tsx`  
  Liste des produits.
- `retrait/page.tsx`  
  Gestion sorties de stock.
- `transactions/page.tsx`  
  Liste des transactions.
- `update-product/[productId]/page.tsx`  
  Page édition produit (upload nouvelle image, suppression ancienne, mise à jour de tous les champs).

## API importantes

- POST `/api/upload`  
  Attache un fichier, sauvegarde dans `public/uploads`, retourne `{ succes: true, path: "/uploads/xxx.jpg" }`.
- DELETE `/api/uploads`  
  Reçoit `{ path: "/uploads/xxx.jpg" }`, supprime le fichier côté serveur; retourne toujours du JSON en cas d'erreur ou succès.
- GET `/api/report?email=...`  
  Génère un rapport IA (nécessite `GEMINI_API_KEY`), renvoie `{ report: "..." }` ou `{ error: "..." }`.

## Comportements & règles métier notables

- Les actions (create/update/delete) vérifient l'association via l'email : `getAssociation(email)` pour sécurité.
- `createProduct` / `updateProduct` doivent inclure le champ `quantity` pour que la valeur soit bien enregistrée en base.
- Upload d'image : le front POSTe vers `/api/upload`. Pour remplacer une image, on DELETE l'ancienne via `/api/uploads` puis POST la nouvelle.
- Suppression d'image : l'API attend un chemin relatif commençant par `/uploads/` et construit le chemin absolu vers `public/uploads`.
- Transactions stock : fonctions `replenishStockWithTransaction` et `deductStockWithTransaction` incrémentent/décrémentent `product.quantity` et créent une ligne dans `transaction`. Préférer l'usage d'une transaction Prisma (`prisma.$transaction`) pour atomicité complète.

## Styling & Thèmes

- DaisyUI fournit les thèmes `fantasy` et `night`. Les overrides dans `globals.css` forcent certaines couleurs (ex. h3 en noir pour les deux thèmes).
- Placeholders, inputs number/file, selects et options sont réglés pour être lisibles en mode `night` (texte noir).
- `NavBar.tsx` : responsive — sur mobile seuls les icônes sont visibles ; un bouton "→" bascule l'affichage des labels.

## Charts

- `CategoryChart.tsx` utilise Recharts et applique un dégradé SVG bleu→violet (id `gradBlueViolet`) sur les barres :
  - stops : `#2563EB` → `#5B63F6` → `#7C3AED`
- Fallback couleur solide : `#5B63F6`.

## Débogage / erreurs courantes

- Erreur `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` : signifie que le front attend du JSON mais reçoit du HTML (404 / page d'erreur). Vérifier :
  - que la route API appelée existe (ex : `/api/report` en App Router est `app/api/report/route.ts`),
  - que l'API retourne toujours du JSON même sur erreur (403/500).
- Problèmes de suppression d'image : vérifier que le `path` envoyé côté front est du type `/uploads/xxx.jpg`, et que le fichier existe dans `public/uploads`.
- Si la quantité d'un produit reste à 0 après création/édition : vérifier que `quantity` est inclus et transformé en Number dans `createProduct` / `updateProduct` dans `actions.ts`.
- Erreurs liées à Gemini : vérifier `GEMINI_API_KEY` et logs côté serveur.

## Tests / vérifications rapides

- Vérifier l’API report :
  ```bash
  curl "http://localhost:3000/api/report?email=admin@example.com"
  ```
- Vérifier upload :
  - Ouvrir le formulaire new_product, uploader une image ; vérifier `public/uploads` contient le fichier et la réponse JSON contient le chemin.
- Vérifier suppression :
  - Appeler DELETE `/api/uploads` avec `{ "path": "/uploads/nom.jpg" }` via Postman/curl et vérifier réponse JSON et suppression physique du fichier.

## Améliorations possibles

- Utiliser Prisma transactions partout pour garantir atomicité (mise à jour stock + création transaction).
- Ajout d'une UI d'erreur côté front pour afficher les erreurs API lisiblement (au lieu de console.log).
- Tests unitaires pour actions Prisma et routes API.
- Mise en cache / rate-limit pour les appels à l'IA (coûts).
