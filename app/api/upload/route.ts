
import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server"; 
import  { join } from "path"; 
import { mkdir, unlink, writeFile } from "fs/promises"; 
/**
 * Route POST pour l'upload de fichiers
 * Cette fonction reçoit un fichier via un formulaire, le sauvegarde sur le disque, et retourne son chemin public
 * @param request - Requête HTTP de type NextRequest
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();

    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ succes: false });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaDir = join(process.cwd(), "public", "uploads");

    if (!existsSync(uploaDir)) {
      await mkdir(uploaDir, { recursive: true });
    }

    const ext = file.name.split(".").pop();
    const UniqueName = crypto.randomUUID() + "." + ext;
    const filePath = join(uploaDir, UniqueName);
    const publicPath = `/uploads/${UniqueName}`;

    await writeFile(filePath, buffer);

    return NextResponse.json({ succes: true, path: publicPath });
  } catch (error) {
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
    const {path} = await request.json();

    console.log("[DELETE /api/uploads] Chemin reçu :", path);

    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { succes: false, message: "chemin invalide (vide ou non string)" },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), "public", path);
    console.log("[DELETE /api/uploads] Chemin absolu utilisé :", filePath);

    if (!existsSync(filePath)) {
      return NextResponse.json(
        { succes: false, message: "fichier déjà supprimé ou inexistant" },
        { status: 404 }
      );
    }

    await unlink(filePath);

    return NextResponse.json(
      { succes: true, message: "fichier supprimé" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/uploads] Erreur :", error);
    return NextResponse.json(
      { succes: false, message: "Erreur serveur lors de la suppression" },
      { status: 500 }
    );
  }
}
