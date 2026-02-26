import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/bank-account.dto';
import { BankAccountVerificationStatus } from '@wellbank/shared';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
  ) {}

  async create(userId: string, dto: CreateBankAccountDto): Promise<BankAccount> {
    if (dto.isPrimary) {
      await this.bankAccountRepo.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const bankAccount = this.bankAccountRepo.create({
      ...dto,
      userId,
      verificationStatus: BankAccountVerificationStatus.PENDING,
    });

    return this.bankAccountRepo.save(bankAccount);
  }

  async findAll(userId: string): Promise<BankAccount[]> {
    return this.bankAccountRepo.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<BankAccount> {
    const account = await this.bankAccountRepo.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }

  async delete(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.bankAccountRepo.remove(account);
  }

  async setPrimary(id: string, userId: string): Promise<BankAccount> {
    const account = await this.findOne(id, userId);

    await this.bankAccountRepo.update(
      { userId, isPrimary: true },
      { isPrimary: false },
    );

    account.isPrimary = true;
    return this.bankAccountRepo.save(account);
  }
}
