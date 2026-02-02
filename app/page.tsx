import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"
import authOptions from "@/lib/auth-options";


export default async function Home(){
    const session = await getServerSession(authOptions);

    if(!session?.user?.email){
        redirect("/api/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: {email: session.user.email},
        include: {orgMemberships:true}
    });

    if(!user || user.orgMemberships.length == 0){
        redirect("/onboarding")
    }

    redirect("/dashboard")
}