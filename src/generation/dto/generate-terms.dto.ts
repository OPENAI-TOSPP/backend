import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject } from 'class-validator';

export class GenerateTermsDto {
  @ApiProperty()
  @IsObject()
  serviceInfo: {
    serviceName: string;
    companyName: string;
    serviceType: string;
    companyAddress: string;
    businessRegistration: string;
    contactEmail: string;
    contactPhone: string;
    representative: string;
  };

  @ApiProperty()
  @IsArray()
  selectedFeatures: string[];

  @ApiProperty()
  @IsObject()
  featureInputs: Record<string, any>;
}
