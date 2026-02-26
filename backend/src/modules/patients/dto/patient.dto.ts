import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsArray, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender, IdentificationType } from '@wellbank/shared';

class AddressDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lga?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  postalCode?: string;
}

class NextOfKinDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relationship?: string;
}

class EmergencyContactDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  relationship?: string;
}

class InsurancePolicyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  policyNumber?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cardPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreatePatientProfileDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lga?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;

  @ApiPropertyOptional({ enum: IdentificationType })
  @IsEnum(IdentificationType)
  @IsOptional()
  identificationType?: IdentificationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nin?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bvn?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional({ type: NextOfKinDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => NextOfKinDto)
  nextOfKin?: NextOfKinDto;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  chronicConditions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  currentMedications?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bloodType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  genotype?: string;

  @ApiPropertyOptional({ type: [EmergencyContactDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts?: EmergencyContactDto[];

  @ApiPropertyOptional({ type: InsurancePolicyDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => InsurancePolicyDto)
  insurance?: InsurancePolicyDto;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  ndprConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dataProcessingConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}

export class UpdatePatientProfileDto extends PartialType(CreatePatientProfileDto) {}
