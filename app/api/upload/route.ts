import { existsSync } from "fs"; // Pour vérifier l'existence d'un fichier ou dossier
import { NextRequest, NextResponse } from "next/server"; // Pour gérer les requêtes/réponses Next.js API
import { join } from "path"; // Pour manipuler les chemins de fichiers
import { unlink } from "fs/promises"; // Pour supprimer des fichiers de façon asynchrone
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ succes: false });
    }

    const filename = crypto.randomUUID() + "." + file.name.split(".").pop();

    //uplod de l'image dans le bucket "uploads-images"
    const { data: uploadData, error } = await supabase.storage
      .from("uploads-images")
      .upload(filename, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    //recuperation de l'url public
    const { data: { publicUrl } } = supabase.storage
      .from("uploads-images")
      .getPublicUrl(filename);

    return NextResponse.json({ succes: true, path: publicUrl });
  } catch (error) {
    return NextResponse.json({succes: false})
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
    const { path } = await request.json();

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
