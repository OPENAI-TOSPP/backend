import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsArray, IsObject, IsEmail,
  IsNotEmpty, ArrayMinSize, IsIn, ValidateNested, IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_ITEMS = [
  'account_signup', 'auth_session', 'payment_onetime', 'payment_subscription',
  'marketing_email', 'marketing_push', 'support_inquiry', 'analytics_cookie',
  'auth_social', 'payment_refund', 'account_dormant', 'auth_phone',
  'delivery_shipping', 'location_gps', 'community_content', 'marketing_adpixel',
  'event_promotion', 'survey_feedback', 'admin_operator',
] as const;

class ServiceInfoDto {
  @IsString() @IsNotEmpty() serviceName: string;
  @IsString() @IsNotEmpty() companyName: string;
  @IsEmail() contactEmail: string;
  @IsOptional() @IsString() serviceType?: string;
  @IsOptional() @IsString() contactPhone?: string;
  @IsOptional() @IsString() privacyOfficerName?: string;
  @IsOptional() @IsString() privacyOfficerContact?: string;
}

export class GeneratePrivacyPolicyDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => ServiceInfoDto)
  serviceInfo: ServiceInfoDto;

  @ApiProperty({ enum: ALLOWED_ITEMS, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(ALLOWED_ITEMS, { each: true })
  selectedItems: string[];

  @ApiProperty()
  @IsObject()
  detailInputs: Record<string, any>;
}
