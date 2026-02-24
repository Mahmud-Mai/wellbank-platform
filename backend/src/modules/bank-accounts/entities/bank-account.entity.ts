import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankAccountVerificationStatus, SettlementFrequency } from '@wellbank/shared';
import { User } from '../../auth/entities/user.entity';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  organizationId: string;

  @Column()
  bankName: string;

  @Column()
  accountName: string;

  @Column()
  accountNumber: string;

  @Column({ nullable: true })
  bvn: string;

  @Column({
    type: 'enum',
    enum: BankAccountVerificationStatus,
    default: BankAccountVerificationStatus.PENDING
  })
  verificationStatus: BankAccountVerificationStatus;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({
    type: 'enum',
    enum: SettlementFrequency,
    nullable: true
  })
  settlementFrequency: SettlementFrequency;

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  verificationFailureReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
