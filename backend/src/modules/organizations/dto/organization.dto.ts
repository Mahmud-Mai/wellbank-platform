import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, IsNumber, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrganizationType, OrganizationMemberRole } from '@wellbank/shared';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Lagos General Hospital' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tradingName?: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.HOSPITAL })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPersonPosition?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    lga?: string;
    country?: string;
    postalCode?: string;
    coordinates?: { lat: number; lng: number };
    landmark?: string;
  };

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cacNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tin?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  yearEstablished?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ownershipType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  facilityType?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  bedCapacity?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  consultingRooms?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasOperatingTheatre?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasICU?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  departments?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  services?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasAmbulance?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasPharmacy?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasLaboratory?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasEmergencyRoom?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is24Hours?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  operatingHours?: Record<string, { open: string; close: string }>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  acceptsInsurance?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  hmosAccepted?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  medicalDirectorName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  medicalDirectorMdcn?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasDelivery?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  ndprConsent?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: OrganizationMemberRole })
  @IsEnum(OrganizationMemberRole)
  roleInOrg: OrganizationMemberRole;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  department?: string;
}

export class OrganizationQueryDto {
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
  status?: string;
}
