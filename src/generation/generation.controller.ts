import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { GenerationService } from './generation.service';
import { GeneratePrivacyPolicyDto } from './dto/generate-privacy-policy.dto';
import { GenerateTermsDto } from './dto/generate-terms.dto';

@ApiTags('generate')
@Controller('generate')
// 생성 API: 분당 5회, 시간당 30회로 강화 (OpenAI 비용 방어)
@Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 30, ttl: 3_600_000 } })
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
