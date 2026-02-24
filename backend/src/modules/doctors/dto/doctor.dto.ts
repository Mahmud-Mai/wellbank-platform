import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, ValidateNested, IsObject, Min, Max, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Gender, ConsultationType, ProviderStatus } from '@wellbank/shared';

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

class QualificationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  degree?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  year?: number;
}

class AvailabilityDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  dayOfWeek?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

class HospitalAffiliationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hospitalName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  endDate?: string;
}

export class CreateDoctorProfileDto {
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

  @ApiPropertyOptional({ type: AddressDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subSpecialty?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  yearsExperience?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  consultationTypes?: ConsultationType[];

  @ApiPropertyOptional({ type: [HospitalAffiliationDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HospitalAffiliationDto)
  hospitalAffiliations?: HospitalAffiliationDto[];

  @ApiPropertyOptional({ type: [AvailabilityDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityDto)
  availabilitySchedule?: AvailabilityDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  consultationFee?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mdcnLicenseNumber?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  mdcnExpiryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  practicingLicenseNumber?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  practicingLicenseExpiry?: string;

  @ApiPropertyOptional({ type: [QualificationDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  qualifications?: QualificationDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  languages?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  acceptsInsurance?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  governmentIdNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  selfiePhotoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  governmentIdPhotoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankAccountName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bvn?: string;
}

export class UpdateDoctorProfileDto extends PartialType(CreateDoctorProfileDto) {}

export class DoctorSearchQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialty?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxFee?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
