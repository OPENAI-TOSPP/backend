import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  PRIVACY_POLICY_SYSTEM_PROMPT,
  buildPrivacyPolicyUserPrompt,
} from './prompts/privacy-policy.prompt';
import {
  TERMS_SYSTEM_PROMPT,
  buildTermsUserPrompt,
} from './prompts/terms-of-service.prompt';
import type { GeneratedDocument, DocumentSection } from '../common/types/privacy-policy.types';
import type { GeneratedTerms, TermsChapter, TermsArticle } from '../common/types/terms.types';

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'your-openai-api-key') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generatePrivacyPolicy(data: {
    serviceInfo: any;
    selectedItems: string[];
    detailInputs: Record<string, any>;
  }): Promise<GeneratedDocument> {
    // Try OpenAI first
    if (this.openai) {
      try {
        const result = await this.callOpenAI(
          PRIVACY_POLICY_SYSTEM_PROMPT,
          buildPrivacyPolicyUserPrompt(data),
        );
        const parsed = JSON.parse(result);
        return {
          title: parsed.title,
          content: parsed.sections.map((s: any) => s.content).join('\n'),
          sections: parsed.sections,
          generatedAt: new Date(),
          version: 1,
        };
      } catch (error) {
        this.logger.warn('OpenAI failed, falling back to template generation', error);
      }
    }

    // Fallback: template-based generation
    return this.generatePrivacyPolicyFallback(data);
  }

  async generateTermsOfService(data: {
    serviceInfo: any;
    selectedFeatures: string[];
    featureInputs: Record<string, any>;
  }): Promise<GeneratedTerms> {
    if (this.openai) {
      try {
        const result = await this.callOpenAI(
          TERMS_SYSTEM_PROMPT,
          buildTermsUserPrompt(data),
        );
        const parsed = JSON.parse(result);
        const chapters = parsed.chapters as TermsChapter[];
        return {
          title: parsed.title,
          content: chapters
            .map((ch) =>
              `${ch.title}\n\n${ch.articles.map((a) => `${a.title}\n\n${a.content}`).join('\n\n')}`,
            )
            .join('\n\n'),
          chapters,
          generatedAt: new Date(),
          version: 1,
        };
      } catch (error) {
        this.logger.warn('OpenAI failed, falling back to template generation', error);
      }
    }

    return this.generateTermsFallback(data);
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o';
    const response = await this.openai!.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 8000,
    });
    return response.choices[0].message.content || '{}';
  }

  // ===== Privacy Policy Fallback (ported from frontend appStore.ts) =====

  private generatePrivacyPolicyFallback(data: {
    serviceInfo: any;
    selectedItems: string[];
    detailInputs: Record<string, any>;
  }): GeneratedDocument {
    const { serviceInfo, selectedItems, detailInputs } = data;
    const sections: DocumentSection[] = [];
    let order = 1;

    // Header
    sections.push({
      id: 'header',
      title: '',
      content: `<h1>개인정보처리방침</h1>
<p><strong>${serviceInfo.companyName}</strong>(이하 "회사")는 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>
<p>본 개인정보처리방침은 <strong>${serviceInfo.serviceName}</strong> 서비스(이하 "서비스")에 적용됩니다.</p>
<p class="meta-info">시행일: ${new Date().toLocaleDateString('ko-KR')}</p>`,
      order: order++,
    });

    // Article 1: Purpose
    sections.push({
      id: 'purpose',
      title: '제1조 (개인정보의 처리 목적)',
      content: `<p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
${selectedItems.map((itemId) => {
  const input = detailInputs[itemId];
  const itemName = this.getItemName(itemId);
  return `<div class="purpose-item">
    <h4>${itemName}</h4>
    <p>${input?.purpose || `${itemName} 관련 서비스 제공 및 관리`}</p>
  </div>`;
}).join('')}`,
      order: order++,
    });

    // Article 2: Collection & Retention
    sections.push({
      id: 'collection',
      title: '제2조 (개인정보의 처리 및 보유 기간)',
      content: `<p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
<h4>① 개인정보의 수집 항목 및 보유 기간</h4>
<table class="privacy-table">
  <thead><tr><th>구분</th><th>수집 항목</th><th>보유 기간</th></tr></thead>
  <tbody>
    ${selectedItems.map((itemId) => {
      const input = detailInputs[itemId];
      const itemName = this.getItemName(itemId);
      const items = input?.items?.join(', ') || input?.customItems || '해당 서비스 관련 정보';
      const retention = this.getRetentionLabel(input?.retentionPeriod, input?.customRetention);
      return `<tr><td>${itemName}</td><td>${items}</td><td>${retention}</td></tr>`;
    }).join('')}
  </tbody>
</table>`,
      order: order++,
    });

    // Outsourcing
    const hasOutsourcing = selectedItems.some((itemId) => {
      const input = detailInputs[itemId];
      return input?.hasOutsourcing && input?.outsourcingList?.length > 0;
    });
    if (hasOutsourcing) {
      sections.push({
        id: 'outsourcing',
        title: '제3조 (개인정보 처리 위탁)',
        content: `<p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
<table class="privacy-table">
  <thead><tr><th>수탁업체</th><th>위탁업무 내용</th><th>위탁 국가</th></tr></thead>
  <tbody>
    ${selectedItems.flatMap((itemId) => {
      const input = detailInputs[itemId];
      if (!input?.hasOutsourcing) return [];
      return input.outsourcingList.map((o: any) => `<tr><td>${o.companyName}</td><td>${o.task}</td><td>${o.country}</td></tr>`);
    }).join('')}
  </tbody>
</table>
<p>회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>`,
        order: order++,
      });
    }

    // Third party
    const hasThirdParty = selectedItems.some((itemId) => {
      const input = detailInputs[itemId];
      return input?.hasThirdParty && input?.thirdPartyList?.length > 0;
    });
    if (hasThirdParty) {
      sections.push({
        id: 'thirdparty',
        title: `제${hasOutsourcing ? '4' : '3'}조 (개인정보의 제3자 제공)`,
        content: `<p>회사는 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
<table class="privacy-table">
  <thead><tr><th>제공받는 자</th><th>제공 목적</th><th>제공 항목</th><th>보유·이용기간</th></tr></thead>
  <tbody>
    ${selectedItems.flatMap((itemId) => {
      const input = detailInputs[itemId];
      if (!input?.hasThirdParty) return [];
      return input.thirdPartyList.map((t: any) => `<tr><td>${t.recipient}</td><td>${t.purpose}</td><td>${t.items}</td><td>${t.retentionPeriod}</td></tr>`);
    }).join('')}
  </tbody>
</table>`,
        order: order++,
      });
    }

    // Overseas transfer
    const hasOverseas = selectedItems.some((itemId) => {
      const input = detailInputs[itemId];
      return input?.hasOverseasTransfer && input?.overseasInfo;
    });
    if (hasOverseas) {
      sections.push({
        id: 'overseas',
        title: `제${(hasOutsourcing ? 1 : 0) + (hasThirdParty ? 1 : 0) + 3}조 (개인정보의 국외 이전)`,
        content: `<p>회사는 이용자의 개인정보를 국외에 이전하고 있습니다.</p>
${selectedItems.filter((itemId) => {
  const input = detailInputs[itemId];
  return input?.hasOverseasTransfer && input?.overseasInfo;
}).map((itemId) => {
  const info = detailInputs[itemId].overseasInfo;
  return `<div class="overseas-item">
    <p><strong>이전받는 자:</strong> ${info.trustee}</p>
    <p><strong>이전 국가:</strong> ${info.country}</p>
    <p><strong>이전 일시:</strong> ${info.transferDate}</p>
    <p><strong>이전 방법:</strong> ${info.method}</p>
    <p><strong>연락처:</strong> ${info.contact}</p>
  </div>`;
}).join('')}
<p>회사는 국외 이전 시 개인정보 보호법에서 요구하는 안전성 확보 조치를 준수합니다.</p>`,
        order: order++,
      });
    }

    const baseArticle = (hasOutsourcing ? 1 : 0) + (hasThirdParty ? 1 : 0) + (hasOverseas ? 1 : 0) + 3;

    // Rights
    sections.push({
      id: 'rights',
      title: `제${baseArticle}조 (정보주체와 법정대리인의 권리·의무 및 그 행사방법)`,
      content: `<p>① 정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
<p>② 제1항에 따른 권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
<p>③ 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.</p>
<p>④ 개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한될 수 있습니다.</p>
<p>⑤ 개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</p>`,
      order: order++,
    });

    // Destruction
    sections.push({
      id: 'destruction',
      title: `제${baseArticle + 1}조 (개인정보의 파기)`,
      content: `<p>① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
<p>② 정보주체로부터 동의받은 개인정보 보유기간이 경과하거나 처리목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관장소를 달리하여 보존합니다.</p>
<p>③ 개인정보 파기의 절차 및 방법은 다음과 같습니다.</p>
<p><strong>1. 파기절차</strong><br>회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>
<p><strong>2. 파기방법</strong><br>전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</p>`,
      order: order++,
    });

    // Security
    sections.push({
      id: 'security',
      title: `제${baseArticle + 2}조 (개인정보의 안전성 확보 조치)`,
      content: `<p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
<p><strong>1. 관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육 등</p>
<p><strong>2. 기술적 조치</strong>: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치 등</p>
<p><strong>3. 물리적 조치</strong>: 전산실, 자료보관실 등의 접근통제 등</p>`,
      order: order++,
    });

    // Privacy officer
    sections.push({
      id: 'officer',
      title: `제${baseArticle + 3}조 (개인정보 보호책임자)`,
      content: `<p>① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
<div class="officer-info">
  <p><strong>▶ 개인정보 보호책임자</strong></p>
  <p>성명: ${serviceInfo.privacyOfficerName || '미지정'}</p>
  <p>연락처: ${serviceInfo.privacyOfficerContact || serviceInfo.contactEmail || '미지정'}</p>
</div>
<p>② 정보주체는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다.</p>`,
      order: order++,
    });

    // Remedies
    sections.push({
      id: 'remedies',
      title: `제${baseArticle + 4}조 (권익침해 구제방법)`,
      content: `<p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
<p><strong>1. 개인정보분쟁조정위원회</strong>: (국번없이) 1833-6972 (www.kopico.go.kr)</p>
<p><strong>2. 개인정보침해신고센터</strong>: (국번없이) 118 (privacy.kisa.or.kr)</p>
<p><strong>3. 대검찰청</strong>: (국번없이) 1301 (www.spo.go.kr)</p>
<p><strong>4. 경찰청</strong>: (국번없이) 182 (ecrm.cyber.go.kr)</p>`,
      order: order++,
    });

    // Footer
    sections.push({
      id: 'footer',
      title: '',
      content: `<div class="document-footer">
  <p>본 개인정보처리방침은 ${new Date().toLocaleDateString('ko-KR')}부터 적용됩니다.</p>
  <p class="disclaimer">※ 본 문서는 ${serviceInfo.serviceName} 서비스의 특성을 반영하여 생성되었으며, 법률 자문을 대체하지 않습니다. 최종 검토를 권장합니다.</p>
</div>`,
      order: order++,
    });

    return {
      title: `${serviceInfo.serviceName} 개인정보처리방침`,
      content: sections.map((s) => s.content).join('\n'),
      sections,
      generatedAt: new Date(),
      version: 1,
    };
  }

  // ===== Terms Fallback (ported from frontend termsStore.ts) =====

  private generateTermsFallback(data: {
    serviceInfo: any;
    selectedFeatures: string[];
    featureInputs: Record<string, any>;
  }): GeneratedTerms {
    const { serviceInfo, selectedFeatures } = data;
    const chapters: TermsChapter[] = [];
    let articleNumber = 1;

    const rv = (content: string) => this.replaceTemplateVars(content, serviceInfo);

    // Chapter 1: General
    chapters.push({
      id: 'chapter1', chapterNumber: 1, title: '제1장 총칙',
      articles: [
        { id: 'ch1-art1', articleNumber: articleNumber++, title: '제1조 (목적)',
          content: rv(`이 약관은 {companyName}(이하 "회사")가 제공하는 {serviceName}(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무, 책임사항 및 기타 필요한 사항을 규정함을 목적으로 합니다.`) },
        { id: 'ch1-art2', articleNumber: articleNumber++, title: '제2조 (정의)',
          content: rv(`이 약관에서 사용하는 용어의 정의는 다음과 같습니다.\n\n① "회사"란 {serviceName}을 운영하는 {companyName}을 의미합니다.\n② "회원"이란 회사와 이용계약을 체결하고 서비스를 이용하는 자를 의미합니다.\n③ "서비스"란 회사가 제공하는 모든 온라인 서비스 및 관련 제반 서비스를 의미합니다.\n④ "게시물"이란 회원이 서비스에 게시하는 모든 정보를 의미합니다.`) },
        { id: 'ch1-art3', articleNumber: articleNumber++, title: '제3조 (약관의 효력 및 변경)',
          content: rv(`① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.\n② 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.\n③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.\n④ 회원은 변경된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있습니다.`) },
      ],
    });

    // Chapter 2: Membership & Service
    chapters.push({
      id: 'chapter2', chapterNumber: 2, title: '제2장 회원 및 서비스 이용',
      articles: [
        { id: 'ch2-art4', articleNumber: articleNumber++, title: '제4조 (회원가입)',
          content: rv(`① 회원가입은 이용자가 약관의 내용에 대하여 동의를 한 다음 회원가입 신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.\n② 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙하지 않을 수 있습니다.\n  1. 실명이 아니거나 타인의 명의를 이용한 경우\n  2. 허위의 정보를 기재하거나 회사가 제시하는 내용을 기재하지 않은 경우\n  3. 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우`) },
        { id: 'ch2-art5', articleNumber: articleNumber++, title: '제5조 (회원정보의 변경)',
          content: rv(`① 회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다.\n② 회원은 회원가입 신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 기타 방법으로 회사에 대하여 그 변경사항을 알려야 합니다.\n③ 제2항의 변경사항을 회사에 알리지 않아 발생한 불이익에 대하여 회사는 책임지지 않습니다.`) },
        { id: 'ch2-art6', articleNumber: articleNumber++, title: '제6조 (계정 관리 책임)',
          content: rv(`① 회원은 자신의 계정 정보에 대한 관리 책임이 있으며, 제3자에게 이를 양도하거나 대여할 수 없습니다.\n② 회원은 자신의 계정 정보가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.\n③ 회사는 회원이 본 조를 위반하여 발생한 손해에 대하여 책임을 지지 않습니다.`) },
        { id: 'ch2-art7', articleNumber: articleNumber++, title: '제7조 (서비스의 제공)',
          content: rv(`① 회사는 다음과 같은 서비스를 제공합니다.\n  1. {serviceName} 관련 모든 서비스\n  2. 기타 회사가 정하는 서비스\n② 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.\n③ 회사는 서비스의 내용, 운영 방식 등을 변경할 수 있으며, 변경 시 사전에 공지합니다.`) },
        { id: 'ch2-art8', articleNumber: articleNumber++, title: '제8조 (서비스의 중단)',
          content: rv(`① 회사는 다음 각 호의 경우 서비스 제공을 일시적으로 중단할 수 있습니다.\n  1. 시스템 정기점검, 보수, 교체 등의 경우\n  2. 천재지변, 정전, 서비스 설비의 장애 등 불가항력적인 경우\n  3. 기타 회사가 서비스 제공을 할 수 없는 정당한 사유가 있는 경우\n② 회사는 서비스 중단으로 인한 손해에 대하여 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.`) },
      ],
    });

    // Chapter 3: User obligations
    chapters.push({
      id: 'chapter3', chapterNumber: 3, title: '제3장 이용자의 의무',
      articles: [
        { id: 'ch3-art9', articleNumber: articleNumber++, title: '제9조 (금지행위)',
          content: rv(`① 회원은 다음 각 호의 행위를 하여서는 안 됩니다.\n  1. 타인의 정보 도용\n  2. 회사가 게시한 정보의 변경\n  3. 회사가 정한 정보 이외의 정보 등의 송신 또는 게시\n  4. 회사와 기타 제3자의 저작권 등 지식재산권에 대한 침해\n  5. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위\n  6. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위\n  7. 기타 불법적이거나 부당한 행위\n② 회원은 관계 법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항을 준수하여야 합니다.`) },
      ],
    });

    // Chapter 4: Content & Rights
    const chapter4Articles: TermsArticle[] = [
      { id: 'ch4-art10', articleNumber: articleNumber++, title: '제10조 (게시물의 권리 및 책임)',
        content: rv(`① 회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.\n② 회원은 자신이 게시한 게시물이 제3자의 권리를 침해하지 않도록 주의 의무를 다해야 합니다.\n③ 회사는 회원이 게시한 게시물이 다음 각 호에 해당하는 경우 사전 통지 없이 삭제할 수 있습니다.\n  1. 타인의 권리를 침해하거나 명예를 훼손하는 내용\n  2. 공서양속에 위반되는 내용\n  3. 불법적이거나 범죄와 관련된 내용\n  4. 기타 관계 법령이나 회사 정책에 위반되는 내용`) },
    ];
    if (selectedFeatures.includes('community_ugc')) {
      chapter4Articles.push(
        { id: 'ch4-art-ugc', articleNumber: articleNumber++, title: '제10조의2 (게시물의 라이선스)',
          content: `① 회원은 서비스 내에 게시물을 게시함으로써 회사에게 다음과 같은 권리를 부여합니다.\n1. 게시물을 복제, 배포, 전시, 전송할 수 있는 권리\n2. 게시물을 검색 노출, 홍보, 마케팅에 활용할 수 있는 권리\n② 회사는 회원의 개별 동의 없이 게시물을 상업적으로 이용하지 않습니다.\n③ 회원이 게시물을 삭제하는 경우, 회사는 관련 법령에 따라 보관이 필요한 경우를 제외하고 해당 게시물을 삭제합니다.` },
        { id: 'ch4-art-report', articleNumber: articleNumber++, title: '제10조의3 (신고 및 삭제 정책)',
          content: `① 회원은 타인의 게시물이 권리를 침해하거나 부적절한 경우 신고할 수 있습니다.\n② 회사는 신고 접수 후 검토를 거쳐 해당 게시물을 삭제하거나 수정을 요청할 수 있습니다.\n③ 회사는 다음 각 호에 해당하는 회원의 계정을 제한하거나 삭제할 수 있습니다.\n1. 반복적으로 금지행위를 하는 경우\n2. 타인의 권리를 침해하는 게시물을 다수 게시한 경우\n3. 기타 서비스 운영을 방해하는 행위를 한 경우` },
      );
    }
    chapters.push({ id: 'chapter4', chapterNumber: 4, title: '제4장 게시물 및 권리', articles: chapter4Articles });

    // Chapter 5: Termination
    chapters.push({
      id: 'chapter5', chapterNumber: 5, title: '제5장 계약해지 및 이용제한',
      articles: [
        { id: 'ch5-art11', articleNumber: articleNumber++, title: '제11조 (계약 해지)',
          content: rv(`① 회원은 언제든지 서비스 초기화면의 회원탈퇴 메뉴를 통해 이용계약 해지 신청을 할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리하여야 합니다.\n② 회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전 통지 후 이용계약을 해지하거나 서비스 이용을 제한할 수 있습니다.\n③ 회사는 회원이 계속해서 1년 이상 로그인하지 않는 경우, 회원정보의 보호 및 운영의 효율성을 위해 이용을 제한할 수 있습니다.`) },
      ],
    });

    // Chapter 6: Liability
    const chapter6Articles: TermsArticle[] = [
      { id: 'ch6-art12', articleNumber: articleNumber++, title: '제12조 (면책조항)',
        content: rv(`① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.\n② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.\n③ 회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.\n④ 회사는 회원 간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.\n⑤ 회사는 물리적, 기술적 수단의 한계로 인해 발생할 수 있는 보안 사고에 대해 고의 또는 중과실이 없는 한 책임을 지지 않습니다.`) },
      { id: 'ch6-art13', articleNumber: articleNumber++, title: '제13조 (준거법 및 관할)',
        content: rv(`① 이 약관의 해석 및 회사와 회원 간의 분쟁에 대하여는 대한민국의 법을 적용합니다.\n② 서비스 이용으로 발생한 분쟁에 대해 소송이 제기될 경우, 회사의 본사 소재지를 관할하는 법원을 전속관할로 합니다.`) },
    ];
    if (selectedFeatures.includes('ai_feature')) {
      chapter6Articles.push(
        { id: 'ch6-art-ai', articleNumber: articleNumber++, title: '제12조의2 (AI 서비스 관련 특약)',
          content: `① 회사가 제공하는 AI 서비스는 참고용이며, AI가 생성한 결과물의 정확성, 적법성, 유용성 등을 보장하지 않습니다.\n② 회원은 AI 서비스를 이용하여 얻은 결과물을 자신의 판단과 책임 하에 사용하여야 합니다.\n③ 회사는 AI 서비스 이용 과정에서 수집된 데이터를 서비스 개선 및 학습 목적으로 활용할 수 있습니다.\n④ AI 서비스는 자동화된 시스템으로 운영되며, 특정 결과물에 대한 회사의 의도를 반영하지 않습니다.` },
      );
    }
    chapters.push({ id: 'chapter6', chapterNumber: 6, title: '제6장 책임 및 분쟁', articles: chapter6Articles });

    // Chapter 7: Paid services
    if (selectedFeatures.includes('paid_service') || selectedFeatures.includes('ecommerce')) {
      const paidArticles: TermsArticle[] = [
        { id: 'ch7-art1', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (유료서비스의 내용)`,
          content: `① 회사가 제공하는 유료서비스의 내용은 서비스 내 별도 안내 페이지에 게시합니다.\n② 유료서비스의 이용 요금, 결제 방식, 이용 기간 등은 서비스별로 다를 수 있습니다.` },
        { id: 'ch7-art2', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (결제)`,
          content: `① 회원은 회사가 정한 방법(신용카드, 계좌이체, 휴대전화 결제 등)을 통해 유료서비스 요금을 결제합니다.\n② 미성년자가 유료서비스를 이용하려는 경우 법정대리인의 동의를 받아야 합니다.\n③ 결제 과정에서 발생하는 오류로 인한 손해에 대해 회사는 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다.` },
        { id: 'ch7-art3', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (청약철회 및 환불)`,
          content: `① 회원은 유료서비스 구매일로부터 7일 이내에 청약을 철회할 수 있습니다. 다만, 다음 각 호의 경우는 예외로 합니다.\n1. 즉시 사용이 시작되는 서비스\n2. 추가 혜택이 제공되는 서비스에서 추가 혜택을 사용한 경우\n3. 개봉 또는 사용으로 인해 재판매가 곤란한 경우\n② 회사는 청약철회 요청을 접수한 날로부터 3영업일 이내에 환불을 처리합니다.` },
      ];
      if (selectedFeatures.includes('subscription')) {
        paidArticles.push(
          { id: 'ch7-art4', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (정기결제 및 자동 갱신)`,
            content: `① 구독 서비스는 매 결제 주기가 종료되는 시점에 자동으로 갱신됩니다.\n② 회원은 갱신일 전까지 서비스 내 설정에서 자동 갱신을 해지할 수 있습니다.\n③ 회사는 요금 변경 시 변경 적용일 30일 전에 회원에게 통지합니다.\n④ 회원이 요금 변경에 동의하지 않는 경우 변경 적용일 전까지 이용계약을 해지할 수 있습니다.` },
        );
      }
      if (selectedFeatures.includes('ecommerce')) {
        paidArticles.push(
          { id: 'ch7-art5', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (재화의 배송)`,
            content: `① 회사는 회원이 주문한 재화를 결제 완료일로부터 3~7일 이내에 배송합니다. 단, 천재지변 등 불가항력적인 사유가 있는 경우는 예외로 합니다.\n② 배송 지연 시 회사는 회원에게 지체 없이 통지하고 적절한 보상을 제공합니다.` },
          { id: 'ch7-art6', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (교환 및 반품)`,
            content: `① 회원은 재화를 수령한 날로부터 7일 이내에 교환 또는 반품을 신청할 수 있습니다.\n② 다음 각 호의 경우 교환 및 반품이 제한될 수 있습니다.\n1. 회원의 책임 있는 사유로 재화가 멸실 또는 훼손된 경우\n2. 포장을 개봉하여 재판매가 곤란한 경우\n3. 시간이 지나 다시 판매하기 곤란할 정도로 재화의 가치가 현저히 감소한 경우` },
        );
      }
      chapters.push({ id: 'chapter7', chapterNumber: 7, title: '제7장 유료서비스', articles: paidArticles });
    }

    // Chapter 8: Location
    if (selectedFeatures.includes('location')) {
      chapters.push({
        id: 'chapter8', chapterNumber: 8, title: '제8장 위치기반서비스',
        articles: [
          { id: 'ch8-art1', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (위치정보의 수집 및 이용)`,
            content: rv(`① 회사는 회원의 위치정보를 수집·이용하기 위하여 사전에 동의를 받습니다.\n② 위치정보는 서비스 제공 목적에만 사용되며, 회원이 동의를 철회하면 즉시 수집을 중단하고 관련 데이터를 삭제합니다.\n③ 회사는 위치정보의 보호를 위하여 위치정보관리책임자를 지정하고 있습니다.`) },
          { id: 'ch8-art2', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (위치정보관리책임자)`,
            content: rv(`① 회사의 위치정보관리책임자는 다음과 같습니다.\n- 성명: {representative}\n- 연락처: {contactEmail}\n② 회원은 위치정보와 관련된 문의사항을 위 연락처로 문의할 수 있습니다.`) },
        ],
      });
    }

    // Chapter 9: Misc
    if (selectedFeatures.includes('global') || selectedFeatures.includes('minor')) {
      const miscArticles: TermsArticle[] = [];
      if (selectedFeatures.includes('global')) {
        miscArticles.push(
          { id: 'ch9-art1', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (국제 분쟁)`,
            content: `① 이 약관은 대한민국 법에 따라 규율되고 해석됩니다.\n② 회사와 회원 간에 발생한 분쟁은 상호 협의하여 해결하며, 협의가 이루어지지 않는 경우 대한민국 법원의 관할에 따릅니다.\n③ 해외에 거주하는 회원의 경우, 회사는 해당 국가의 법률을 준수하여 서비스를 제공합니다.` },
        );
      }
      if (selectedFeatures.includes('minor')) {
        miscArticles.push(
          { id: 'ch9-art2', articleNumber: articleNumber++, title: `제${articleNumber - 1}조 (미성년자 이용)`,
            content: `① 만 14세 미만의 아동은 법정대리인의 동의를 받은 경우에만 서비스를 이용할 수 있습니다.\n② 법정대리인은 아동의 개인정보에 대한 열람, 정정, 삭제를 요청할 수 있습니다.\n③ 회사는 청소년 보호를 위하여 연령 확인 절차를 진행할 수 있습니다.` },
        );
      }
      if (miscArticles.length > 0) {
        chapters.push({ id: 'chapter9', chapterNumber: 9, title: '제9장 기타', articles: miscArticles });
      }
    }

    return {
      title: `${serviceInfo.serviceName} 서비스 이용약관`,
      content: chapters.map((ch) =>
        `${ch.title}\n\n${ch.articles.map((a) => `${a.title}\n\n${a.content}`).join('\n\n')}`,
      ).join('\n\n'),
      chapters,
      generatedAt: new Date(),
      version: 1,
    };
  }

  private replaceTemplateVars(content: string, serviceInfo: any): string {
    return content
      .replace(/{companyName}/g, serviceInfo.companyName || '회사')
      .replace(/{serviceName}/g, serviceInfo.serviceName || '서비스')
      .replace(/{representative}/g, serviceInfo.representative || '대표')
      .replace(/{contactEmail}/g, serviceInfo.contactEmail || 'contact@example.com');
  }

  private getItemName(itemId: string): string {
    const names: Record<string, string> = {
      account_signup: '회원가입(이메일)', auth_session: '로그인/인증(세션/JWT)',
      payment_onetime: '결제(단건)', payment_subscription: '구독(자동결제)',
      marketing_email: '마케팅(이메일)', marketing_push: '마케팅(푸시)',
      support_inquiry: '고객센터/문의', analytics_cookie: '분석/로그(쿠키/접속기록)',
      auth_social: '소셜 로그인', payment_refund: '환불/분쟁 처리',
      account_dormant: '휴면계정(비활성 관리)', auth_phone: '휴대전화 본인인증',
      delivery_shipping: '배송/물류', location_gps: '위치기반 서비스',
      community_content: '커뮤니티/게시물 업로드', marketing_adpixel: '광고/리타게팅 픽셀',
      event_promotion: '이벤트/경품 응모', survey_feedback: '설문조사/피드백 수집',
      admin_operator: '관리자/운영자 계정',
    };
    return names[itemId] || itemId;
  }

  private getRetentionLabel(value: string, custom: string): string {
    const labels: Record<string, string> = {
      withdrawal: '회원탈퇴 시까지', '1year': '1년', '3years': '3년', '5years': '5년',
      custom: custom || '직접 입력',
    };
    return labels[value] || value || '회원탈퇴 시까지';
  }
}
