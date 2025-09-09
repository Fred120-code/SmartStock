// API route pour gérer l'upload de fichiers (POST)
import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path, { join } from "path";
import { mkdir, writeFile } from "fs/promises";

export async function POST(request: NextRequest) {

    // Récupère les données du formulaire envoyé
    const data = await request.formData();

    // Récupère le fichier envoyé sous le nom "file"
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
        // Si aucun fichier n'est envoyé, retourne une erreur
        return NextResponse.json({ succes: false });
    }
    
    // Convertit le fichier en buffer (pour l'enregistrement sur le disque)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Détermine le dossier de destination pour l'upload
    const uploaDir = join(process.cwd(), "public", "uploads");

    // Crée le dossier s'il n'existe pas
    if (!existsSync(uploaDir)) {
        await mkdir(uploaDir, { recursive: true });
    }

    // Génère un nom de fichier unique avec l'extension d'origine
    const ext = file.name.split('.').pop();
    const UniqueName = crypto.randomUUID() + '.' + ext;
    const filePath = join(uploaDir, UniqueName);
    const publicPath = `/uploads/${UniqueName}`;

    // Enregistre le buffer sur le disque à l'emplacement filePath
    await writeFile(filePath, buffer);

    // Retourne le chemin public du fichier uploadé
    return NextResponse.json({ succes: true, path: publicPath });
}