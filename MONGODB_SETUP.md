# Configuration MongoDB pour SmartStock

Ce guide explique comment configurer MongoDB pour le projet SmartStock.

## 1. Créer un cluster MongoDB gratuit

### Étapes :

1. Va sur https://www.mongodb.com/cloud/atlas
2. Crée un compte gratuit (ou connecte-toi si tu as déjà un compte)
3. Clique sur "Create a Project"
4. Nomme ton projet (ex: `SmartStock`)
5. Clique sur "Create Project"

### Créer un cluster :

1. Clique sur "Build a Database"
2. Sélectionne le plan **M0 (gratuit)**
3. Choisis une région (recommandé : AWS + région proche de toi)
4. Clique "Create Cluster"
5. Attends 2-3 minutes que le cluster soit créé

## 2. Créer un utilisateur et configurer l'accès

### Créer un utilisateur de base de données :

1. Dans MongoDB Atlas, va à "Security" → "Database Access"
2. Clique "+ Add New Database User"
3. Remplis les infos :
   - **Username** : `smartstock_user`
   - **Password** : Génère un mot de passe fort (sauvegarde-le !)
   - **Authentication Method** : "Password (SCRAM)"
4. Clique "Add User"

### Autoriser les connexions réseau :

1. Va à "Security" → "Network Access"
2. Clique "+ Add IP Address"
3. Sélectionne "Allow Access from Anywhere" (ajoute `0.0.0.0/0`)
4. Clique "Confirm"

> ⚠️ **Note** : En production, restricte à tes adresses IP réelles.

## 3. Récupérer la chaîne de connexion

1. Va à "Databases" → ton cluster
2. Clique sur "Connect"
3. Sélectionne "Drivers"
4. Copie l'URI (ressemble à) :
   ```
   mongodb+srv://smartstock_user:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## 4. Configurer ton projet SmartStock

### a) Ajouter la variable d'environnement

Crée un fichier `.env.local` à la racine du projet :

```bash
DATABASE_URL="mongodb+srv://smartstock_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smartstock?retryWrites=true&w=majority"
```

> Remplace `YOUR_PASSWORD` par ton mot de passe MongoDB et `cluster0.xxxxx` par ton vrai cluster.

### b) Générer Prisma & créer la DB

```bash
npx prisma generate
npx prisma db push
```

La première commande génère le client Prisma.
La deuxième crée les collections dans MongoDB.

### c) Vérifier dans MongoDB Atlas

1. Va dans "Database" → "Collections"
2. Tu dois voir tes collections : `associations`, `categories`, `products`, `transactions`

## 5. Lancer le projet

```bash
npm run dev
```

Tout devrait fonctionner sans modification du code (Prisma gère la compatibilité).

## 6. Commandes Prisma utiles

```bash
# Régénérer le client Prisma après modification du schema
npx prisma generate

# Pousser les changements du schema vers MongoDB
npx prisma db push

# Ouvrir Prisma Studio (UI pour gérer les données)
npx prisma studio

# Réinitialiser la base (attention : supprime tout !)
npx prisma migrate reset
```

## 7. Déploiement en production

Quand tu déploies sur Vercel/Firebase :

1. Dans les paramètres du projet, ajoute la variable `DATABASE_URL`
2. Assure-toi que MongoDB Atlas autorise les connexions depuis ton domaine
3. Redéploie

## Avantages de MongoDB pour SmartStock

✅ **Gratuit** : M0 Cluster gratuit (512 MB)
✅ **Scalable** : Montée en charge facile
✅ **Flexible** : Pas de migration de schéma rigide
✅ **Prisma Support** : Prisma supporte nativement MongoDB
✅ **Cloud** : Pas besoin d'héberger une base localement

## Limitations

⚠️ **M0 Gratuit** :

- 512 MB de stockage
- Partage avec d'autres utilisateurs
- Pas de backups automatiques
- Pas de support 24/7

Pour la production, considère M2 ou plus (environ $0.06/jour).

## Troubleshooting

### Erreur : "Authentication failed"

- Vérifier le mot de passe MongoDB Atlas
- Vérifier que l'IP est autorisée dans "Network Access"

### Erreur : "Database does not exist"

- Lancer `npx prisma db push` pour créer les collections

### Connexion lente

- Vérifier la région MongoDB (choisir proche de ton serveur)
- Vérifier la limite de connexions (M0 = 500 connexions max)

---

**Questions ?** Regarde la doc officielle : https://docs.mongodb.com/atlas/
