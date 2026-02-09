-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "org_invites" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "inviteById" TEXT NOT NULL,

    CONSTRAINT "org_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "org_invites_email_organizationId_key" ON "org_invites"("email", "organizationId");

-- AddForeignKey
ALTER TABLE "org_invites" ADD CONSTRAINT "org_invites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_invites" ADD CONSTRAINT "org_invites_inviteById_fkey" FOREIGN KEY ("inviteById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
