import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '개인정보처리방침 생성',
    description: 'GPT-4o로 개인정보처리방침을 생성합니다. API 키 미설정 시 템플릿 폴백으로 동작합니다. (분당 5회 제한)',
  })
  @ApiBody({ type: GeneratePrivacyPolicyDto })
  @ApiResponse({
    status: 201,
    description: '문서 생성 성공',
    schema: {
      example: {
        data: {
          title: '마이서비스 개인정보처리방침',
          sections: [{ id: 'purpose', title: '제1조 (개인정보의 처리 목적)', content: '<p>...</p>', order: 1 }],
          generatedAt: '2026-02-20T00:00:00.000Z',
          version: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (필수 필드 누락, 허용되지 않는 항목 ID 등)' })
  @ApiResponse({ status: 429, description: '요청 한도 초과 (분당 5회)' })
  async generatePrivacyPolicy(@Body() dto: GeneratePrivacyPolicyDto) {
    return this.generationService.generatePrivacyPolicy(dto);
  }

  @Post('terms-of-service')
  @ApiOperation({
    summary: '서비스 이용약관 생성',
    description: 'GPT-4o로 서비스 이용약관을 생성합니다. API 키 미설정 시 템플릿 폴백으로 동작합니다. (분당 5회 제한)',
  })
  @ApiBody({ type: GenerateTermsDto })
  @ApiResponse({
    status: 201,
    description: '문서 생성 성공',
    schema: {
      example: {
        data: {
          title: '마이서비스 서비스 이용약관',
          chapters: [{ id: 'chapter1', chapterNumber: 1, title: '제1장 총칙', articles: [{ id: 'ch1-art1', articleNumber: 1, title: '제1조 (목적)', content: '...' }] }],
          generatedAt: '2026-02-20T00:00:00.000Z',
          version: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 (필수 필드 누락, 허용되지 않는 기능 ID 등)' })
  @ApiResponse({ status: 429, description: '요청 한도 초과 (분당 5회)' })
  async generateTermsOfService(@Body() dto: GenerateTermsDto) {
    return this.generationService.generateTermsOfService(dto);
  }
}
