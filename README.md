# PolicyGen Backend

개인정보처리방침 및 서비스 이용약관을 AI로 생성하는 NestJS 백엔드 서버입니다.

## 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | NestJS |
| Database | PostgreSQL + TypeORM |
| 인증 | OAuth 2.0 (Google, Kakao) + JWT |
| AI | OpenAI GPT-4o |
| PDF | Puppeteer (서버사이드 렌더링) |
| API 문서 | Swagger |

## 디렉토리 구조

```
src/
├── main.ts                     # 엔트리포인트 (CORS, Swagger, ValidationPipe)
├── app.module.ts               # 루트 모듈
├── config/
│   └── database.config.ts      # PostgreSQL 연결 설정
├── auth/                       # 인증 모듈
│   ├── strategies/             # Passport 전략 (JWT, Google, Kakao)
│   ├── guards/                 # 인증 가드
│   ├── decorators/             # @CurrentUser() 데코레이터
│   └── dto/                    # 요청 DTO
├── users/                      # 사용자 모듈
│   └── entities/               # User 엔티티
├── generation/                 # AI 문서 생성 모듈
│   ├── prompts/                # OpenAI 시스템/유저 프롬프트
│   └── dto/                    # 생성 요청 DTO
├── documents/                  # 문서 CRUD 모듈
│   ├── entities/               # Document 엔티티
│   └── dto/                    # 문서 요청 DTO
├── export/                     # PDF/HTML 내보내기 모듈
│   └── templates/              # HTML 템플릿
└── common/
    ├── filters/                # 글로벌 예외 필터
    ├── interceptors/           # 응답 변환 인터셉터
    └── types/                  # 프론트엔드 타입 미러링
```

## 설치 및 실행

### 사전 요구사항

- Node.js 18+
- PostgreSQL 15+

### 설치

```bash
npm install
```

### 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 항목을 설정합니다:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=policygen

# JWT
JWT_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth
KAKAO_CLIENT_ID=your-kakao-rest-api-key
KAKAO_CLIENT_SECRET=your-kakao-client-secret

# OpenAI (선택 - 없으면 템플릿 폴백)
OPENAI_API_KEY=your-openai-api-key
```

### 데이터베이스 생성

```bash
psql -U your_db_user -c "CREATE DATABASE policygen;"
```

### 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 문서

서버 실행 후 Swagger UI에서 전체 API를 확인할 수 있습니다:

```
http://localhost:3000/api/docs
```

## API 엔드포인트

### 인증 (Auth)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/auth/google` | - | Google OAuth 리다이렉트 |
| GET | `/api/auth/google/callback` | - | Google 콜백 처리 |
| GET | `/api/auth/kakao` | - | Kakao OAuth 리다이렉트 |
| GET | `/api/auth/kakao/callback` | - | Kakao 콜백 처리 |
| POST | `/api/auth/refresh` | - | 토큰 갱신 |
| POST | `/api/auth/logout` | JWT | 로그아웃 |

### 사용자 (Users)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/users/me` | JWT | 내 정보 조회 |

### AI 문서 생성 (Generation)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/generate/privacy-policy` | - | 개인정보처리방침 생성 |
| POST | `/api/generate/terms-of-service` | - | 이용약관 생성 |

OpenAI API 키가 설정된 경우 GPT-4o로 생성하고, 실패 시 템플릿 기반으로 폴백합니다.

### 문서 CRUD (Documents)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| POST | `/api/documents` | JWT | 문서 저장 |
| GET | `/api/documents` | JWT | 내 문서 목록 |
| GET | `/api/documents/:id` | JWT | 문서 상세 |
| PATCH | `/api/documents/:id` | JWT | 문서 수정 |
| DELETE | `/api/documents/:id` | JWT | 문서 삭제 |

### 내보내기 (Export)

| Method | Path | Auth | 설명 |
|--------|------|------|------|
| GET | `/api/documents/:id/export/pdf` | JWT | 저장된 문서 PDF |
| GET | `/api/documents/:id/export/html` | JWT | 저장된 문서 HTML |
| POST | `/api/export/pdf` | - | 비로그인 PDF 생성 |
| POST | `/api/export/html` | - | 비로그인 HTML 생성 |

## DB 스키마

### users

| Column | Type | Note |
|--------|------|------|
| id | UUID (PK) | |
| email | VARCHAR (unique) | |
| name | VARCHAR | |
| provider | ENUM('google','kakao') | |
| providerId | VARCHAR | |
| profileImage | VARCHAR (nullable) | |
| refreshToken | VARCHAR (nullable) | bcrypt 해시 저장 |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

### documents

| Column | Type | Note |
|--------|------|------|
| id | UUID (PK) | |
| userId | UUID (FK → users) | CASCADE delete |
| type | ENUM('privacy-policy','terms-of-service') | |
| title | VARCHAR | |
| content | JSONB | 생성된 문서 전체 |
| serviceInfo | JSONB | 서비스 기본 정보 |
| selections | JSONB | 사용자 선택 항목 |
| status | ENUM('draft','published') | default: 'draft' |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

## OAuth 설정 가이드

### Google

1. [Google Cloud Console](https://console.cloud.google.com/) → 프로젝트 생성
2. API 및 서비스 → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/google/callback`

### Kakao

1. [Kakao Developers](https://developers.kakao.com/) → 애플리케이션 생성
2. 앱 설정 → 앱 키 → REST API 키 확인
3. 카카오 로그인 활성화 → Redirect URI: `http://localhost:3000/api/auth/kakao/callback`
4. 동의항목 → 닉네임, 이메일 필수/선택 동의 설정

## 프론트엔드 연동

프론트엔드 개발 서버(`localhost:5173`)에서 Vite proxy로 `/api` 요청을 백엔드로 전달합니다:

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 라이선스

ISC
