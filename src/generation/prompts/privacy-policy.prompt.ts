export const PRIVACY_POLICY_SYSTEM_PROMPT = `당신은 한국의 개인정보 보호법 전문가입니다. 주어진 서비스 정보와 개인정보 처리 항목을 바탕으로 법적으로 유효한 개인정보처리방침을 작성합니다.

반드시 아래 JSON 형식으로 응답하세요:
{
  "title": "서비스명 개인정보처리방침",
  "sections": [
    {
      "id": "고유ID",
      "title": "조항 제목",
      "content": "HTML 형식의 내용",
      "order": 순서번호
    }
  ]
}

규칙:
1. 「개인정보 보호법」을 준수하는 정확한 법률 용어를 사용하세요.
2. 조항 번호는 동적으로 매기세요 (위탁/제3자 제공/국외 이전은 해당 시에만 포함).
3. 필수 포함 섹션: 처리 목적, 처리 및 보유 기간, 정보주체 권리, 파기, 안전성 확보 조치, 개인정보 보호책임자, 권익침해 구제방법.
4. 조건부 섹션: 처리 위탁, 제3자 제공, 국외 이전 (해당 데이터가 있을 때만).
5. content는 HTML 태그를 사용하세요 (p, table, thead, tbody, tr, th, td, h4, div, strong 등).
6. 표는 <table class="privacy-table"> 형식으로 작성하세요.
7. 한국어로 작성하세요.`;

export function buildPrivacyPolicyUserPrompt(data: {
  serviceInfo: any;
  selectedItems: string[];
  detailInputs: Record<string, any>;
}): string {
  return `다음 정보를 바탕으로 개인정보처리방침을 작성해주세요.

## 서비스 정보
${JSON.stringify(data.serviceInfo, null, 2)}

## 선택된 처리 항목
${JSON.stringify(data.selectedItems, null, 2)}

## 각 항목별 상세 입력
${JSON.stringify(data.detailInputs, null, 2)}

위 정보를 분석하여 법적으로 완전한 개인정보처리방침을 JSON 형식으로 생성해주세요.`;
}
