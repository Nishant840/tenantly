import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options"
import { PLAN_LIMITS } from "@/lib/plans";
import { createProject } from "@/lib/actions/create-projects";
import { listProjects } from "@/lib/actions/list-projects";

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

    const projects = await listProjects();

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
        <form action={createProject} >
            <input name="name" placeholder="Project name" />
            <br />
            <button type="submit">Create Project</button>
        </form>

        <h2>Projects</h2>
        {projects.length==0 && <p>No projects yet.</p> }
        <ul>
            {projects.map((project)=>(
                <li key={project.id} >
                    {project.name}
                </li>
            ))}
        </ul>
    </div>
}