import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options"

export default async function DashboardPage(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        include: {
            orgMemberships: {
                include: {
                    organization: true
                },
            },
        },
    });

    if(!user || user.orgMemberships.length == 0){
        redirect("/onboarding");
    }

    const activeOrg = user.orgMemberships[0].organization;
    return <div>
        <h1>Dashboard</h1>
        <p>
            <strong>Organization:</strong>{activeOrg.name}
        </p>
        <p>
            <strong>Plan:</strong> {activeOrg.plan}
        </p>
        <p>
            <strong>Slug:</strong> {activeOrg.slug}
        </p>
    </div>
}