import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GenerationService } from './generation.service';
import { GeneratePrivacyPolicyDto } from './dto/generate-privacy-policy.dto';
import { GenerateTermsDto } from './dto/generate-terms.dto';

@ApiTags('generate')
@Controller('generate')
export class GenerationController {
  constructor(private generationService: GenerationService) {}

  @Post('privacy-policy')
  async generatePrivacyPolicy(@Body() dto: GeneratePrivacyPolicyDto) {
    return this.generationService.generatePrivacyPolicy(dto);
  }

  @Post('terms-of-service')
  async generateTermsOfService(@Body() dto: GenerateTermsDto) {
    return this.generationService.generateTermsOfService(dto);
  }
}
