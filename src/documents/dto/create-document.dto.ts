import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ enum: ['privacy-policy', 'terms-of-service'] })
  @IsEnum(['privacy-policy', 'terms-of-service'])
  type: 'privacy-policy' | 'terms-of-service';

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsObject()
  content: any;

  @ApiProperty()
  @IsObject()
  serviceInfo: any;

  @ApiProperty()
  @IsObject()
  selections: any;

  @ApiProperty({ enum: ['draft', 'published'], required: false })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';
}
