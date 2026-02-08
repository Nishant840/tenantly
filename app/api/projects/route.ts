import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options";
import { PLAN_LIMITS } from "@/lib/plans";

export async function POST(req: Request){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        return NextResponse.json({error: "Unauthorized"},{status:401});
    }

    const { name } = await req.json();

    if(!name){
        return NextResponse.json({error:"Project name required"},{status:400});
    }

    const user = await prisma.user.findUnique({
        where: {email:session.user.email},
        include: {
            orgMemberships:{
                include:{
                    organization:{
                        include:{projects: true},
                    },
                },
            },
        },
    });

    if(!user || user.orgMemberships.length==0){
        return NextResponse.json({error: "No Organization"},{status:400});
    }

    const activeOrg = user.orgMemberships[0].organization;
    const projectCount = activeOrg.projects.length;
    const limit = PLAN_LIMITS[activeOrg.plan].projects;

    if(projectCount >= limit){
        return NextResponse.json(
            {error: "Project limit reached, Upgrade plan"},
            {status: 403}
        )
    }

    const project = await prisma.$transaction(async (tx)=>{
        const project = await tx.project.create({
            data: {
                name,
                organizationId: activeOrg.id,
            },
        });

        await tx.projectMembership.create({
            data: {
                userId: user.id,
                projectId: project.id,
                role: "PROJECT_ADMIN",
            },
        });

        return project;
    });

    return NextResponse.json(project);
}