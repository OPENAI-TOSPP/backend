# PolicyGen

> 한국 법률 기준에 맞는 **개인정보처리방침**과 **서비스 이용약관**을 AI로 5분 만에 생성하는 법률 문서 자동화 서비스

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)

---

## 소개

PolicyGen은 스타트업과 개인 개발자가 서비스 출시 전 반드시 준비해야 하는 법률 문서를, 법률 전문 지식 없이도 빠르게 완성할 수 있도록 돕는 서비스입니다.

체크박스 방식으로 서비스에 해당하는 항목을 선택하면, OpenAI GPT-4o가 개인정보 보호법·전자상거래법 등 한국 법령을 반영한 전문적인 문서를 자동으로 생성합니다. 생성된 문서는 실시간으로 미리보기하고, PDF 또는 HTML 파일로 즉시 다운로드할 수 있습니다.

---

## 주요 기능

### 개인정보처리방침 생성기

19개의 개인정보 처리 항목(회원가입, 결제, 마케팅, 위치정보 등) 중 서비스에 해당하는 항목을 선택하고 세부 정보를 입력하면, 법령 기준에 맞는 개인정보처리방침이 자동으로 생성됩니다.

- **5단계 위저드**: 서비스 정보 → 항목 선택 → 세부 입력 → 미리보기 → 내보내기
- **동적 조항 생성**: 처리 위탁, 제3자 제공, 국외 이전 항목 선택 시 해당 조항 자동 삽입
- **19개 처리 항목**: 회원가입, 소셜 로그인, 결제(단건/구독), 마케팅(이메일/푸시/광고픽셀), 고객센터, 분석/로그, 배송, 위치기반, 커뮤니티, 이벤트/경품, 설문조사, 관리자 계정 등
- **실시간 미리보기**: 데스크톱에서 입력 중에도 문서 구성 현황을 사이드바로 확인

### 서비스 이용약관 생성기

서비스 유형에 따른 기본 구조에, 제공하는 기능별 추가 조항을 선택하여 맞춤형 이용약관을 생성합니다.

- **서비스 유형 템플릿**: SaaS, 쇼핑몰, 커뮤니티, 앱, 콘텐츠, 플랫폼 등 유형별 기본 항목 자동 세팅
- **선택형 추가 조항**: 유료 서비스, 구독 모델, 전자상거래, 커뮤니티/UGC, AI 기능, 위치기반 서비스, 해외 사용자, 미성년자 대상 등 8종
- **법령 연계**: 각 조항별 관련 법령(전자상거래법, 정보통신망법, 위치정보보호법, 청소년보호법 등) 표시
- **장(章) 구조**: 총칙 → 회원 및 서비스 이용 → 이용자 의무 → 게시물 및 권리 → 계약해지 → 책임 및 분쟁 → (선택) 유료서비스 / 위치기반 / 기타

### 문서 관리

생성한 문서를 계정에 저장하고, 언제든지 다시 불러와 수정하거나 재다운로드할 수 있습니다.

- 문서 저장 및 목록 조회 (페이지네이션)
- 임시저장(draft) / 게시(published) 상태 관리
- 저장 문서 직접 PDF/HTML 다운로드

### 내보내기

- **서버사이드 PDF**: Puppeteer로 A4 포맷, 한글 폰트, 페이지 번호가 정확하게 반영된 고품질 PDF 생성
- **HTML 다운로드**: 웹사이트에 바로 삽입 가능한 완성형 HTML 파일
- 로그인 없이도 즉시 내보내기 가능

### 인증

- Google, Kakao 소셜 로그인 (OAuth 2.0)
- JWT Access Token(15분) + Refresh Token(7일) 기반 인증
- Refresh Token bcrypt 해시 저장

---

## 기술 스택

### Frontend

| 구분 | 기술 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v3 + shadcn/ui (Radix UI 기반) |
| State | Zustand |
| Form | React Hook Form + Zod |
| Routing | React Router DOM v7 |
| PDF (클라이언트) | jsPDF + html2canvas |

### Backend

| 구분 | 기술 |
|------|------|
| Framework | NestJS 11 + TypeScript |
| Database | PostgreSQL 15 + TypeORM |
| 인증 | Passport (Google, Kakao OAuth) + JWT |
| AI | OpenAI SDK (GPT-4o, 미설정 시 템플릿 폴백) |
| PDF (서버사이드) | Puppeteer |
| API 문서 | Swagger (`/api/docs`) |
| 유효성 검사 | class-validator |

---

## 프로젝트 구조

```
policygen/
├── frontend/               # React SPA
│   └── src/
│       ├── pages/          # PrivacyPolicyGenerator, TermsOfServiceGenerator, Home
│       ├── components/     # UI 컴포넌트 (forms, stepper, preview, export)
│       ├── store/          # Zustand (appStore, termsStore)
│       ├── data/           # 처리 항목 목록, 약관 기능 목록
│       └── types/          # 공유 타입 정의
│
└── backend/                # NestJS API 서버
    └── src/
        ├── auth/           # OAuth, JWT, 토큰 관리
        ├── users/          # 사용자 CRUD
        ├── generation/     # OpenAI 문서 생성 + 템플릿 폴백
        ├── documents/      # 문서 저장/조회/수정/삭제
        ├── export/         # Puppeteer PDF, HTML 생성
        └── common/         # 전역 필터, 인터셉터, 타입
```

---

## 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL 15+

### Backend 설정

```bash
cd backend
npm install
cp .env.example .env
```

`.env` 최소 필수 설정:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=policygen

JWT_SECRET=your-jwt-secret

# AI 생성 (없으면 템플릿 폴백으로 동작)
OPENAI_API_KEY=sk-...

# OAuth (소셜 로그인 사용 시)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

KAKAO_CLIENT_ID=...
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback
```

```bash
psql -U your_db_user -c "CREATE DATABASE policygen;"
npm run start:dev
```

서버: `http://localhost:3000`  
Swagger: `http://localhost:3000/api/docs`

### Frontend 설정

```bash
cd frontend
npm install
npm run dev
```

앱: `http://localhost:5173`

---

## API 개요

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/auth/google` | - | Google 로그인 |
| GET | `/api/auth/kakao` | - | Kakao 로그인 |
| POST | `/api/auth/refresh` | - | 토큰 갱신 |
| POST | `/api/auth/logout` | JWT | 로그아웃 |
| GET | `/api/users/me` | JWT | 내 프로필 |
| POST | `/api/generate/privacy-policy` | - | 개인정보처리방침 생성 |
| POST | `/api/generate/terms-of-service` | - | 서비스 이용약관 생성 |
| POST | `/api/documents` | JWT | 문서 저장 |
| GET | `/api/documents` | JWT | 문서 목록 |
| PATCH | `/api/documents/:id` | JWT | 문서 수정 |
| DELETE | `/api/documents/:id` | JWT | 문서 삭제 |
| POST | `/api/export/pdf` | - | PDF 다운로드 (비로그인) |
| POST | `/api/export/html` | - | HTML 다운로드 (비로그인) |
| GET | `/api/documents/:id/export/pdf` | JWT | 저장 문서 PDF |
| GET | `/api/documents/:id/export/html` | JWT | 저장 문서 HTML |

전체 API 명세는 Swagger UI에서 확인 및 테스트할 수 있습니다.

---

## 법률 고지

본 서비스는 법률 자문을 제공하지 않습니다. 생성된 문서는 참고용이며, 실제 서비스 배포 전 반드시 법무 전문가의 검토를 받으시기 바랍니다.

---

## 라이선스

ISC
