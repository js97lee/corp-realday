# GitHub Pages 전환 가이드

## 현재 아키텍처
- **프론트엔드**: React (Vite)
- **백엔드**: Netlify Functions (서버리스)
- **데이터베이스**: Neon DB (PostgreSQL)

## GitHub Pages 전환 시 아키텍처 옵션

### 옵션 1: Vercel (추천) ⭐
**가장 Netlify와 유사하고 무료 플랜이 좋음**

#### 장점
- ✅ Netlify Functions와 거의 동일한 구조 (서버리스 함수)
- ✅ 무료 플랜: 100GB 대역폭, 무제한 요청
- ✅ GitHub 연동 자동 배포
- ✅ 환경 변수 관리 쉬움
- ✅ Edge Functions 지원

#### 설정 방법
```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 루트에 vercel.json 생성
```

**vercel.json 예시:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**API 구조:**
```
api/
  members.js
  contacts.js
  tasks.js
  finances.js
```

**비용**: 무료 (개인 프로젝트)

---

### 옵션 2: Render (추천) ⭐
**Express 서버를 그대로 호스팅 가능**

#### 장점
- ✅ 기존 Express 서버 (server/server.js) 그대로 사용 가능
- ✅ 무료 플랜: 750시간/월 (항상 켜져있으면 약 1개월)
- ✅ PostgreSQL DB도 함께 호스팅 가능
- ✅ 환경 변수 관리 쉬움

#### 설정 방법
1. Render.com 가입
2. New → Web Service
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`
   - Environment: `DATABASE_URL` 설정

**비용**: 
- 무료: 750시간/월 (약 1개월)
- 유료: $7/월 (무제한)

---

### 옵션 3: Railway (추천) ⭐
**가장 간단하고 빠른 설정**

#### 장점
- ✅ GitHub 연동 자동 배포
- ✅ PostgreSQL DB 자동 프로비저닝
- ✅ 무료 크레딧: $5/월
- ✅ Express 서버 그대로 사용

#### 설정 방법
1. Railway.app 가입
2. New Project → Deploy from GitHub
3. 저장소 선택
4. PostgreSQL 추가 (자동 생성)
5. 환경 변수: `DATABASE_URL` 자동 설정

**비용**: $5/월 무료 크레딧 (초과 시 유료)

---

### 옵션 4: Cloudflare Workers + Pages
**가장 빠르고 저렴**

#### 장점
- ✅ 무료 플랜: 무제한 요청
- ✅ 전 세계 엣지 네트워크
- ✅ Workers로 서버리스 API 구현

#### 단점
- ⚠️ 코드 구조 변경 필요 (Workers API)
- ⚠️ Neon DB는 그대로 사용 가능

**비용**: 무료 (개인 프로젝트)

---

### 옵션 5: Supabase (통합 솔루션)
**백엔드 + DB 통합**

#### 장점
- ✅ PostgreSQL DB + 자동 REST API 생성
- ✅ 인증 시스템 내장
- ✅ 실시간 기능
- ✅ 무료 플랜: 500MB DB, 2GB 대역폭

#### 단점
- ⚠️ 기존 코드 구조 변경 필요
- ⚠️ Supabase SDK 사용 필요

**비용**: 무료 (개인 프로젝트)

---

## 추천 아키텍처

### 추천 1: GitHub Pages + Vercel (가장 간단)
```
프론트엔드: GitHub Pages
백엔드 API: Vercel Functions
데이터베이스: Neon DB (현재 그대로 사용)
```

**장점:**
- Netlify와 거의 동일한 구조
- 코드 변경 최소화
- 무료

**단점:**
- 두 개의 서비스 관리 필요

---

### 추천 2: GitHub Pages + Render (가장 실용적)
```
프론트엔드: GitHub Pages
백엔드 API: Render (Express 서버)
데이터베이스: Neon DB 또는 Render PostgreSQL
```

**장점:**
- 기존 Express 서버 그대로 사용
- 한 곳에서 관리 가능
- 무료 (제한적)

**단점:**
- 무료 플랜은 750시간/월 제한

---

### 추천 3: Railway (통합 솔루션)
```
프론트엔드: Railway Static Site
백엔드 API: Railway (Express 서버)
데이터베이스: Railway PostgreSQL
```

**장점:**
- 모든 것을 한 곳에서 관리
- 자동 배포
- $5/월 무료 크레딧

**단점:**
- 초과 시 유료

---

## 마이그레이션 체크리스트

### 1. 프론트엔드 설정 (GitHub Pages)
```bash
# vite.config.js 수정
export default {
  base: '/corp-realday/', // GitHub 저장소 이름
  // ...
}

# package.json에 배포 스크립트 추가
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```

### 2. API URL 변경
```javascript
// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://your-backend-url.com/api'  // 백엔드 URL
    : 'http://localhost:5001/api')
```

### 3. CORS 설정
백엔드에서 GitHub Pages 도메인 허용:
```javascript
// server/server.js 또는 API 함수
app.use(cors({
  origin: [
    'https://js97lee.github.io',
    'http://localhost:5173'
  ]
}))
```

---

## 각 옵션별 상세 가이드

### Vercel 사용 시
1. `vercel.json` 생성
2. `api/` 폴더에 함수 이동
3. 환경 변수 설정
4. 자동 배포

### Render 사용 시
1. `server/` 폴더 그대로 사용
2. Render에서 Web Service 생성
3. 환경 변수 설정
4. 자동 배포

### Railway 사용 시
1. `server/` 폴더 그대로 사용
2. Railway에서 프로젝트 생성
3. PostgreSQL 추가
4. 환경 변수 자동 설정
5. 자동 배포

---

## 비용 비교

| 서비스 | 무료 플랜 | 유료 플랜 |
|--------|----------|----------|
| **Vercel** | 무제한 요청, 100GB 대역폭 | $20/월 |
| **Render** | 750시간/월 | $7/월 |
| **Railway** | $5 크레딧/월 | 사용량 기반 |
| **Cloudflare** | 무제한 | $5/월 |
| **Supabase** | 500MB DB, 2GB 대역폭 | $25/월 |

---

## 최종 추천

**현재 상황에 가장 적합한 옵션: Vercel**

이유:
1. Netlify Functions와 거의 동일한 구조
2. 코드 변경 최소화
3. 무료 플랜이 충분함
4. GitHub Pages와 함께 사용하기 쉬움

**대안: Railway**
- Express 서버를 그대로 사용하고 싶다면
- 모든 것을 한 곳에서 관리하고 싶다면


