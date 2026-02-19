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
  @ApiProperty({ example: '마이서비스', description: '서비스 이름' })
  @IsString() @IsNotEmpty() serviceName: string;

  @ApiProperty({ example: '(주)마이컴퍼니', description: '회사명' })
  @IsString() @IsNotEmpty() companyName: string;

  @ApiProperty({ example: 'legal@myservice.com', description: '담당자 이메일' })
  @IsEmail() contactEmail: string;

  @ApiProperty({ example: 'saas', required: false, description: '서비스 유형' })
  @IsOptional() @IsString() serviceType?: string;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', required: false })
  @IsOptional() @IsString() companyAddress?: string;

  @ApiProperty({ example: '123-45-67890', required: false, description: '사업자등록번호' })
  @IsOptional() @IsString() businessRegistration?: string;

  @ApiProperty({ example: '02-1234-5678', required: false })
  @IsOptional() @IsString() contactPhone?: string;

  @ApiProperty({ example: '홍길동', required: false, description: '대표자명' })
  @IsOptional() @IsString() representative?: string;
}

export class GenerateTermsDto {
  @ApiProperty({ type: TermsServiceInfoDto, description: '서비스 기본 정보' })
  @ValidateNested()
  @Type(() => TermsServiceInfoDto)
  serviceInfo: TermsServiceInfoDto;

  @ApiProperty({
    enum: ALLOWED_FEATURES,
    isArray: true,
    example: ['basic', 'paid_service'],
    description: '포함할 기능 ID 목록',
  })
  @IsArray()
  @IsIn(ALLOWED_FEATURES, { each: true })
  selectedFeatures: string[];

  @ApiProperty({
    description: '각 기능별 상세 입력값 (key: 기능 ID)',
    example: { paid_service: { enabled: true, details: { paymentMethods: ['card', 'transfer'] } } },
  })
  @IsObject()
  featureInputs: Record<string, any>;
}
