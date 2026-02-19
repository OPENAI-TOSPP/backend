export function generatePrivacyPolicyHTML(doc: any, serviceInfo: any): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>개인정보처리방침 - ${serviceInfo.serviceName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    h2 { font-size: 1.2em; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a; }
    p { margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: 600; }
    .meta-info { text-align: center; color: #666; font-size: 0.9em; margin-top: 10px; }
    .officer-info, .overseas-item, .purpose-item { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .document-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.9em; }
    .disclaimer { color: #999; font-size: 0.85em; margin-top: 10px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>개인정보처리방침</h1>
  <p class="meta-info">${serviceInfo.companyName} | 시행일: ${new Date().toLocaleDateString('ko-KR')}</p>

  ${doc.sections.map((s: any) => `
    ${s.title ? `<h2>${s.title}</h2>` : ''}
    ${s.content}
  `).join('')}
</body>
</html>`;
}
