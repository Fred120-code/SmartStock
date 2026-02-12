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
