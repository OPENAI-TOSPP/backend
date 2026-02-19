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
  @ApiProperty({ example: '마이서비스', description: '서비스 이름' })
  @IsString() @IsNotEmpty() serviceName: string;

  @ApiProperty({ example: '(주)마이컴퍼니', description: '회사명' })
  @IsString() @IsNotEmpty() companyName: string;

  @ApiProperty({ example: 'privacy@myservice.com', description: '개인정보 담당자 이메일' })
  @IsEmail() contactEmail: string;

  @ApiProperty({ example: 'saas', required: false, description: '서비스 유형' })
  @IsOptional() @IsString() serviceType?: string;

  @ApiProperty({ example: '02-1234-5678', required: false })
  @IsOptional() @IsString() contactPhone?: string;

  @ApiProperty({ example: '홍길동', required: false, description: '개인정보 보호책임자 이름' })
  @IsOptional() @IsString() privacyOfficerName?: string;

  @ApiProperty({ example: '02-1234-5678', required: false, description: '개인정보 보호책임자 연락처' })
  @IsOptional() @IsString() privacyOfficerContact?: string;
}

export class GeneratePrivacyPolicyDto {
  @ApiProperty({ type: ServiceInfoDto, description: '서비스 기본 정보' })
  @ValidateNested()
  @Type(() => ServiceInfoDto)
  serviceInfo: ServiceInfoDto;

  @ApiProperty({
    enum: ALLOWED_ITEMS,
    isArray: true,
    example: ['account_signup', 'payment_onetime'],
    description: '수집·이용 항목 ID 목록 (1개 이상)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(ALLOWED_ITEMS, { each: true })
  selectedItems: string[];

  @ApiProperty({
    description: '각 항목별 상세 입력값 (key: 항목 ID)',
    example: { account_signup: { purpose: '서비스 가입 및 관리', items: ['이메일', '비밀번호'], retentionPeriod: 'withdrawal' } },
  })
  @IsObject()
  detailInputs: Record<string, any>;
}
