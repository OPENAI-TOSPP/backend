import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray, IsObject, IsString, IsEmail,
  IsNotEmpty, IsIn, ValidateNested, IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_FEATURES = [
  'basic', 'paid_service', 'subscription', 'ecommerce',
  'community_ugc', 'ai_feature', 'location', 'global', 'minor',
] as const;

class TermsServiceInfoDto {
  @IsString() @IsNotEmpty() serviceName: string;
  @IsString() @IsNotEmpty() companyName: string;
  @IsEmail() contactEmail: string;
  @IsOptional() @IsString() serviceType?: string;
  @IsOptional() @IsString() companyAddress?: string;
  @IsOptional() @IsString() businessRegistration?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() representative?: string;
}

export class GenerateTermsDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => TermsServiceInfoDto)
  serviceInfo: TermsServiceInfoDto;

  @ApiProperty({ enum: ALLOWED_FEATURES, isArray: true })
  @IsArray()
  @IsIn(ALLOWED_FEATURES, { each: true })
  selectedFeatures: string[];

  @ApiProperty()
  @IsObject()
  featureInputs: Record<string, any>;
}
