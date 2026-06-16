import { PrismaService } from '../../prisma/prisma.service';

// Resolves which business a logged-in user belongs to.
//
// IMPORTANT: this intentionally does NOT filter the Employee lookup by
// `isActive`. Employee.isActive reflects payroll/attendance roster status
// (e.g. "removed" via the Employees page does a soft-delete by flipping this
// flag) — it is NOT an access-control flag. Business membership must stay
// stable even after an employee record is deactivated, otherwise removing
// any staff member with a linked login silently locks that login out of the
// whole app ("Business not found" everywhere). The actual access on/off
// switch for a login is User.isActive, which is already enforced separately
// in AuthService.login() and JwtStrategy.
export async function resolveBusinessForUser(prisma: PrismaService, userId: string) {
  const owned = await prisma.business.findUnique({ where: { userId } });
  if (owned) return owned;

  const employee = await prisma.employee.findFirst({
    where: { userId },
  });
  if (!employee) return null;

  return prisma.business.findUnique({ where: { id: employee.businessId } });
}
