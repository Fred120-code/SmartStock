
// Importation des modules nécessaires
import { existsSync } from "fs"; // Pour vérifier l'existence d'un fichier ou dossier
import { NextRequest, NextResponse } from "next/server"; // Pour gérer les requêtes/réponses Next.js API
import  { join } from "path"; // Pour manipuler les chemins de fichiers
import { mkdir, unlink, writeFile } from "fs/promises"; // Pour créer des dossiers, supprimer et écrire des fichiers de façon asynchrone

/**
 * Route POST pour l'upload de fichiers
 * Cette fonction reçoit un fichier via un formulaire, le sauvegarde sur le disque, et retourne son chemin public
 * @param request - Requête HTTP de type NextRequest
 */
export async function POST(request: NextRequest) {
  try {
    // Récupère les données du formulaire envoyé (multipart/form-data)
    const data = await request.formData();

    // Récupère le fichier envoyé sous le nom "file" (clé du champ dans le formulaire)
    const file: File | null = data.get("file") as unknown as File;

    // Vérifie si un fichier a bien été envoyé
    if (!file) {
      // Si aucun fichier n'est envoyé, retourne une réponse JSON indiquant l'échec
      return NextResponse.json({ succes: false });
    }

    // Convertit le fichier reçu en buffer (pour pouvoir l'écrire sur le disque)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Détermine le dossier de destination pour l'upload (public/uploads à la racine du projet)
    const uploaDir = join(process.cwd(), "public", "uploads");

    // Si le dossier n'existe pas, on le crée récursivement
    if (!existsSync(uploaDir)) {
      await mkdir(uploaDir, { recursive: true });
    }

    // Récupère l'extension du fichier d'origine (ex: jpg, png, pdf...)
    const ext = file.name.split(".").pop();
    // Génère un nom de fichier unique pour éviter les collisions (UUID + extension)
    const UniqueName = crypto.randomUUID() + "." + ext;
    // Chemin absolu où sera stocké le fichier sur le disque
    const filePath = join(uploaDir, UniqueName);
    // Chemin public (URL) pour accéder au fichier depuis le front
    const publicPath = `/uploads/${UniqueName}`;

    // Écrit le buffer sur le disque à l'emplacement filePath
    await writeFile(filePath, buffer);

    // Retourne une réponse JSON avec le chemin public du fichier uploadé
    return NextResponse.json({ succes: true, path: publicPath });
  } catch (error) {
    // En cas d'erreur, affiche l'erreur dans la console
    console.error(error);
  }
}


/**
 * Route DELETE pour supprimer un fichier uploadé
 * Cette fonction reçoit le chemin du fichier à supprimer, le supprime du disque, et retourne un statut
 * @param request - Requête HTTP de type NextRequest
 */
export async function DELETE(request: NextRequest) {
  try {
    // Récupère le corps de la requête (doit contenir { path: string })
    const {path} = await request.json();

    // Log du chemin reçu pour debug
    console.log("[DELETE /api/uploads] Chemin reçu :", path);

    // Vérifie que le chemin a bien été fourni
    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { succes: false, message: "chemin invalide (vide ou non string)" },
        { status: 400 }
      );
    }

    // Construit le chemin absolu du fichier à supprimer
    const filePath = join(process.cwd(), "public", path);
    console.log("[DELETE /api/uploads] Chemin absolu utilisé :", filePath);

    // Vérifie que le fichier existe bien sur le disque
    if (!existsSync(filePath)) {
      // On retourne succes: true pour éviter l'erreur front si le fichier a déjà été supprimé
      return NextResponse.json(
        { succes: false, message: "fichier déjà supprimé ou inexistant" },
        { status: 404 }
      );
    }

    // Supprime le fichier du disque
    await unlink(filePath);

    // Retourne une réponse JSON indiquant le succès
    return NextResponse.json(
      { succes: true, message: "fichier supprimé" },
      { status: 200 }
    );
  } catch (error) {
    // En cas d'erreur, affiche l'erreur dans la console
    console.error("[DELETE /api/uploads] Erreur :", error);
    // Toujours retourner du JSON même en cas d'erreur serveur
    return NextResponse.json(
      { succes: false, message: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
}
