export function generateTermsHTML(doc: any, serviceInfo: any): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>서비스 이용약관 - ${serviceInfo.serviceName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    h2 { font-size: 1.3em; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
    h3 { font-size: 1.1em; margin-top: 20px; margin-bottom: 10px; color: #333; }
    p { margin-bottom: 10px; white-space: pre-line; }
    .meta-info { text-align: center; color: #666; font-size: 0.9em; margin-top: 10px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>서비스 이용약관</h1>
  <p class="meta-info">${serviceInfo.companyName} | 시행일: ${new Date().toLocaleDateString('ko-KR')}</p>

  ${doc.chapters.map((ch: any) => `
    <h2>${ch.title}</h2>
    ${ch.articles.map((art: any) => `
      <h3>${art.title}</h3>
      <p>${art.content}</p>
    `).join('')}
  `).join('')}
</body>
</html>`;
}
