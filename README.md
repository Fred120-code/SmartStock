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
- Prisma (ORM) + **MongoDB** (base de données NoSQL)
- Recharts (charting)
- API serverless routes dans `app/api/*`
- (Optionnel) SDK IA (Gemini) via `GEMINI_API_KEY`
- (Optionnel) Supabase Storage pour stockage d'images

## Prérequis

- Node.js (>=16/18 recommandé)
- npm / pnpm / yarn
- **MongoDB Atlas** (gratuit, https://mongodb.com/cloud/atlas)
- Variables d'environnement (voir section suivante)

## Configuration MongoDB

SmartStock utilise **MongoDB Atlas** (gratuit jusqu'à 512 MB) comme base de données.

### Étapes rapides :

1. Crée un cluster M0 gratuit sur https://mongodb.com/cloud/atlas
2. Crée un utilisateur de base de données
3. Autorise les connexions réseau (`0.0.0.0/0` pour développement)
4. Copie la chaîne de connexion (URI)

**Voir le guide complet** : [MONGODB_SETUP.md](./MONGODB_SETUP.md)

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec au minimum :

- DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/smartstock?retryWrites=true&w=majority"
- GEMINI_API_KEY="votre_cle_gemini" (si vous utilisez la génération IA)
- NEXT_PUBLIC_SUPABASE_URL="..." (optionnel, pour images)
- NEXT_PUBLIC_SUPABASE_ANON_KEY="..." (optionnel, pour images)

Redémarrez le serveur Next après modification.

Voir aussi [.env.example](./.env.example) pour un template complet.

## Installation & lancement

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Configurer MongoDB (voir [MONGODB_SETUP.md](./MONGODB_SETUP.md)) :

   - Créer un cluster M0 gratuit
   - Créer un utilisateur et récupérer l'URI
   - Ajouter l'URI dans `.env.local` sous `DATABASE_URL`

3. Générer Prisma & créer les collections :

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Démarrer le serveur en dev :

   ```bash
   npm run dev
   ```

   Ouvre http://localhost:3000

5. Construction / production :
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

- **Erreur MongoDB "Authentication failed"** : Vérifier le mot de passe et l'URI dans `.env.local`. Vérifier que l'IP est autorisée dans MongoDB Atlas "Network Access".
- **Erreur "Cannot find module 'mongodb'"** : Lancer `npm install` pour installer les dépendances Prisma+MongoDB.
- **Erreur "Database does not exist"** : Lancer `npx prisma db push` pour créer les collections.
- **Erreur `Unexpected token '<'`** : Le front attend du JSON mais reçoit du HTML (404 / page d'erreur). Vérifier que la route API existe et renvoie du JSON même en erreur.
- **Problèmes suppression d'image** : Vérifier que le `path` envoyé est `/uploads/...` et que le fichier existe physiquement.
- **Quantité produit reste 0** : Vérifier que `quantity` est inclus et transformé en Number dans `createProduct` / `updateProduct`.
- **Erreurs liées à Gemini** : Vérifier `GEMINI_API_KEY` et les logs côté serveur.

## Tests / vérifications rapides

- Vérifier l’API report :
  ```bash
  curl "http://localhost:3000/api/report?email=admin@example.com"
  ```
- Vérifier upload :
  - Ouvrir le formulaire new_product, uploader une image ; vérifier `public/uploads` contient le fichier et la réponse JSON contient le chemin.
- Vérifier suppression :
  - Appeler DELETE `/api/uploads` avec `{ "path": "/uploads/nom.jpg" }` via Postman/curl et vérifier réponse JSON et suppression physique du fichier.
