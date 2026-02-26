import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@wellbank/shared';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.NIN })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fileMimeType?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  organizationId?: string;
}
