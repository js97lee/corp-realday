# Real Day 백엔드 서버

## 설치 및 실행

```bash
cd server
npm install
npm run dev
```

서버는 기본적으로 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 1. Admin 로그인
- **POST** `/api/admin/login`
- Body: `{ email: string, password: string }`
- Response: `{ success: boolean, message: string, user: object, token: string }`

### 2. Contact 폼 제출
- **POST** `/api/contact`
- Body: `{ name: string, email: string, message: string }`
- Response: `{ success: boolean, message: string, contact: object }`

### 3. Contact 목록 조회 (관리자용)
- **GET** `/api/contacts`
- Response: `{ success: boolean, contacts: array }`

## 환경 변수

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```
PORT=5000
JWT_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@real-day.com
ADMIN_PASSWORD=admin123
```

## 실제 프로덕션 배포 시

1. 데이터베이스 연결 (MongoDB, PostgreSQL 등)
2. 비밀번호 해싱 (bcrypt)
3. JWT 토큰 인증
4. 환경 변수 관리
5. 에러 핸들링 강화
6. 로깅 시스템
7. 보안 강화 (rate limiting, helmet 등)


