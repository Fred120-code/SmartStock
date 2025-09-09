import { existsSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path, { join } from "path";
import { mkdir } from "fs/promises";

export async function POST(request:NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File
    if(!file){
        return NextResponse.json({succes: false})
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploaDir = join(process.cwd(), "public", "uploads")
    
    if(!existsSync(uploaDir)){
        await mkdir(uploaDir, {recursive: true})
    }

    const ext = file.name.split('.').pop()
    const UniqueName = crypto.randomUUID() + '.' + ext
    const filePath = join(uploaDir, UniqueName)
    const publicPath = `/uploads/${UniqueName}`

    return NextResponse.json({succes: true, path: publicPath})

}