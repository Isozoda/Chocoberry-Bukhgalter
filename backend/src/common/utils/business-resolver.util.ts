import { PrismaService } from '../../prisma/prisma.service';

export async function resolveBusinessForUser(prisma: PrismaService, userId: string) {
  const owned = await prisma.business.findUnique({ where: { userId } });
  if (owned) return owned;

  const employee = await prisma.employee.findFirst({
    where: { userId, isActive: true },
  });
  if (!employee) return null;

  return prisma.business.findUnique({ where: { id: employee.businessId } });
}
