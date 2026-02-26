import { IsString, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SettlementFrequency } from '@wellbank/shared';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'GTBank' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: 'JOHN DOE' })
  @IsString()
  accountName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  accountNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bvn?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: SettlementFrequency })
  @IsEnum(SettlementFrequency)
  @IsOptional()
  settlementFrequency?: SettlementFrequency;
}
