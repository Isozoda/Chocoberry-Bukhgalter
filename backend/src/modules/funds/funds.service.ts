import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { FundOpDto } from './dto/fund-op.dto';
import { toDecimal } from '../../common/utils/decimal.util';
import { resolveBusinessForUser } from '../../common/utils/business-resolver.util';

@Injectable()
export class FundsService {
  constructor(private prisma: PrismaService) {}

  private async getBusiness(userId: string) {
    const b = await resolveBusinessForUser(this.prisma, userId);
    if (!b) throw new NotFoundException('Business not found');
    return b;
  }

  async findAll(userId: string) {
    const b = await this.getBusiness(userId);
    return this.prisma.fund.findMany({ where: { businessId: b.id }, orderBy: { type: 'asc' } });
  }

  async findOne(userId: string, id: string) {
    const b = await this.getBusiness(userId);
    const f = await this.prisma.fund.findFirst({ where: { id, businessId: b.id } });
    if (!f) throw new NotFoundException('Fund not found');
    return f;
  }

  async create(userId: string, dto: CreateFundDto) {
    const b = await this.getBusiness(userId);
    try {
      return await this.prisma.fund.create({
        data: { businessId: b.id, type: dto.type, name: dto.name, notes: dto.notes },
      });
    } catch {
      throw new ConflictException('Fund with this type already exists');
    }
  }

  async deposit(userId: string, fundId: string, dto: FundOpDto) {
    const b = await this.getBusiness(userId);
    const fund = await this.prisma.fund.findFirst({ where: { id: fundId, businessId: b.id } });
    if (!fund) throw new NotFoundException('Fund not found');
    const amount = toDecimal(dto.amount);

    return this.prisma.$transaction(async (tx) => {
      const newBalance = toDecimal(fund.balance).plus(amount);
      await tx.fund.update({ where: { id: fundId }, data: { balance: newBalance } });
      return tx.fundTransaction.create({
        data: {
          businessId: b.id,
          fundId,
          type: 'INCOME',
          amount,
          notes: dto.notes,
        },
      });
    });
  }

  async withdraw(userId: string, fundId: string, dto: FundOpDto) {
    const b = await this.getBusiness(userId);
    const fund = await this.prisma.fund.findFirst({ where: { id: fundId, businessId: b.id } });
    if (!fund) throw new NotFoundException('Fund not found');
    const amount = toDecimal(dto.amount);
    if (toDecimal(fund.balance).lessThan(amount)) {
      throw new ConflictException(`Insufficient fund balance: ${fund.balance}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const newBalance = toDecimal(fund.balance).minus(amount);
      await tx.fund.update({ where: { id: fundId }, data: { balance: newBalance } });
      return tx.fundTransaction.create({
        data: {
          businessId: b.id,
          fundId,
          type: 'EXPENSE',
          amount,
          notes: dto.notes,
        },
      });
    });
  }

  async getTransactions(userId: string, fundId: string) {
    const b = await this.getBusiness(userId);
    const f = await this.prisma.fund.findFirst({ where: { id: fundId, businessId: b.id } });
    if (!f) throw new NotFoundException('Fund not found');
    return this.prisma.fundTransaction.findMany({ where: { fundId }, orderBy: { date: 'desc' } });
  }
}
