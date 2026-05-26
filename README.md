# SmartStock

**SmartStock** est une application web moderne de gestion de stock conçue pour les associations et petits commerces. Elle permet de gérer efficacement les produits, catégories, mouvements de stock et générer des rapports intelligents avec l'aide de l'IA.

---

## Fonctionnalités principales

### Gestion des Produits

-Créer, modifier et supprimer des produits
-Gérer les quantités en stock
-Définir des prix et des unités
-Upload et gestion des images produit
-Configuration des seuils d'alerte de stock minimum

### Gestion des Catégories

-Organiser les produits par catégories
-Créer, modifier et supprimer des catégories
-Visualisation graphique de la distribution des produits

### Mouvements de Stock

-Enregistrer les entrées (réapprovisionnement)
-Enregistrer les sorties (ventes/utilisation)
-Historique complet des transactions
 Génération automatique de transactions

### Gestion des Alertes

- Alertes automatiques quand le stock atteint le minimum
- Gestion des alertes (actives/résolues)
- Suivi en temps réel de l'état du stock

### Tableau de Bord

- Vue d'ensemble des produits et statistiques
- Graphiques de distribution par catégorie
- Résumé du stock
- Rapport IA généré avec Google Gemini

### Authentification

- Gestion des associations (multi-tenant)
- Authentification sécurisée avec Clerk

### Autres Features

- Interface responsive (mobile-first)
- Thèmes UI (DaisyUI : fantasy, night)
- Navigation optimisée pour mobile
- Rapports intelligents générés par IA

---

## 🛠 Stack Technologique

### Frontend

- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **TailwindCSS 4** + **DaisyUI** - Styling et thèmes

### Backend & Base de Données

- **Prisma ORM** - Gestion de la base de données
- **SQLite** - Base de données légère (développement)
- **Next.js API Routes** - Endpoints serverless

### Authentification & Services

- **Clerk** - Gestion d'authentification
- **Google Generative AI (Gemini)** - Génération de rapports IA

### Visualisation

- **Recharts** - Graphiques et statistiques
- **Lucide React** - Icônes





## Modèle de Données

### Association

Représente une organisation (entreprise, association, etc.)

- Propriétaire de produits, catégories, transactions et alertes
- Authentification via email

### Product

Produit du stock

- Lié à une catégorie et une association
- Avec image, prix, quantité, seuil d'alerte
- Génère des alertes quand le stock est faible

### Category

Catégorie de produits

- Organise les produits
- Peut avoir une description

### Transaction

Mouvement de stock (entrée/sortie)

- Type : "IN" (réapprovisionnement) ou "OUT" (vente/utilisation)
- Quantité changée
- Date de création

### StockAlert

Alerte de stock faible

- Créée automatiquement quand quantité ≤ minQuantity
- Statut : "active" ou "resolved"
- Message descriptif

---
