"use server"

import { prisma } from "@/lib/prisma";

export async function checkAndAddAssociation(email: string, name: string){
    if(!email) return;
    try{
        const existingAssociation = await prisma.association.findUnique({
            where: { email }
        });
        if(!existingAssociation && name){
            await prisma.association.create({
                data: { email, name }
            });
        }
    }catch(error){
        console.error("Error checking or adding association:", error);
    }
}