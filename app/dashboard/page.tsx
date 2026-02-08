import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options"
import { PLAN_LIMITS } from "@/lib/plans";

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

        <br /><br />
        <form
            action={async (formData) => {
                "use server";

                const name = formData.get("name") as string;
                if (!name) return;

                const session = await getServerSession(authOptions);
                if (!session?.user?.email) {
                throw new Error("Unauthorized");
                }

                const user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: {
                    orgMemberships: {
                    include: {
                        organization: {
                        include: { projects: true },
                        },
                    },
                    },
                },
                });

                if (!user || user.orgMemberships.length === 0) {
                throw new Error("No organization");
                }

                const activeOrg = user.orgMemberships[0].organization;
                const limit = PLAN_LIMITS[activeOrg.plan].projects;

                if (activeOrg.projects.length >= limit) {
                throw new Error("Project limit reached");
                }

                await prisma.$transaction(async (tx) => {
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
                });
            }}
        >
            <input name="name" placeholder="Project name" />
            <br />
            <button type="submit">Create Project</button>
        </form>

    </div>
}