"use server"

import { getServerSession } from "next-auth"
import authOptions from "../auth-options"
import { prisma } from "@/lib/prisma"

export async function listProjects(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        include:{
            projectMemberships:{
                include:{
                    project: true
                },
            },
        },
    });

    if(!user){
        throw new Error("User not found");
    }

    return user.projectMemberships.map((pm)=>pm.project);
}