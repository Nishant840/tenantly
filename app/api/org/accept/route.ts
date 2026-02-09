import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }
    
    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
    });

    if(!user){
        return NextResponse.json({error:"User not found"},{status: 404});
    }

    const invite = await prisma.orgInvite.findFirst({
        where:{
            email: user.email,
            status: "PENDING",
        },
    });

    if(!invite){
        return NextResponse.json({error: "No pending invite Found"}, {status: 404});
    };

    await prisma.$transaction(async (tx)=>{
        await tx.orgMembership.create({
            data: {
                userId: user.id,
                organizationId: invite.organizationId,
                role: invite.role,
            },
        });

        await tx.orgInvite.update({
            where: {id: invite.id},
            data: {status:"ACCEPTED"},
        });

        return NextResponse.json({success: true});
    })

    return NextResponse.json({ success: true });
}