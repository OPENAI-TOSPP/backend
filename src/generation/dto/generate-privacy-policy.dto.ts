import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsObject, IsOptional, IsEnum } from 'class-validator';

export class GeneratePrivacyPolicyDto {
  @ApiProperty()
  @IsObject()
  serviceInfo: {
    serviceName: string;
    companyName: string;
    serviceType: string;
    contactEmail: string;
    contactPhone: string;
    privacyOfficerName: string;
    privacyOfficerContact: string;
  };

  @ApiProperty()
  @IsArray()
  selectedItems: string[];

  @ApiProperty()
  @IsObject()
  detailInputs: Record<string, any>;
}
