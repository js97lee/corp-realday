# Real Day 웹사이트

real-day.com을 위한 React 기반 웹사이트입니다.

## 기능

- **메인 사이트 (real-day.com)**
  - HOME: 랜딩 페이지
  - About: 소개 페이지
  - Projects: 프로젝트 포트폴리오
  - Contact: 연락처 및 문의 폼

- **관리자 페이지 (real-day.com/admin)**
  - 이메일(ID)과 비밀번호를 통한 로그인
  - 프로젝트 관리 (추가, 수정, 삭제, 노출 설정)
  - 문의하기 관리
  - 멤버 관리 (최고관리자 전용)
  - 재무 관리 (최고관리자 전용)
  - 업무 진행상황 관리 (Jira 스타일)

## 기술 스택

- **Frontend**: React 18, React Router DOM, Vite, Tailwind CSS
- **Backend**: Netlify Functions (Serverless)
- **Database**: Neon PostgreSQL

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 프로덕션 빌드:
```bash
npm run build
```

4. 빌드 미리보기:
```bash
npm run preview
```

## 프로젝트 구조

```
src/
├── components/      # 재사용 가능한 컴포넌트
│   ├── Layout.jsx
│   └── Navigation.jsx
├── pages/          # 페이지 컴포넌트
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Projects.jsx
│   ├── Contact.jsx
│   └── AdminLogin.jsx
├── App.jsx         # 라우터 설정
├── main.jsx        # 엔트리 포인트
└── index.css       # 전역 스타일
```

## 반응형 디자인

모든 페이지는 모바일, 태블릿, 데스크톱에서 최적화된 반응형 디자인으로 구성되어 있습니다.

## 배포 (Netlify)

### 배포 전 체크리스트

1. **환경 변수 설정 (Netlify 대시보드)**
   - Netlify 사이트 설정 → Environment variables에서 다음 변수 추가:
   - `DATABASE_URL`: Neon PostgreSQL 연결 URL (필수)
   - `NETLIFY_DATABASE_URL`: DATABASE_URL과 동일한 값 (선택, 백업용)
   - `INITIAL_ADMIN_EMAIL`: 신규 DB의 초기 관리자 이메일 (선택)
   - `INITIAL_ADMIN_PASSWORD`: 신규 DB의 초기 관리자 비밀번호 (신규 DB만 필수)

2. **GitHub 연동**
   - Netlify 사이트 설정 → Build & deploy → Connect to Git
   - GitHub 저장소 연결

3. **빌드 설정 확인**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 배포 후 확인 사항

1. **데이터베이스 연결 확인**
   - `/api/test-db` 엔드포인트로 DB 연결 테스트
   - Netlify Functions 로그에서 에러 확인

2. **관리자 계정**
   - 기존 관리자는 DB에 등록된 계정을 사용합니다.
   - 신규 DB에서는 `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` 환경 변수로 생성합니다.
   - 비밀번호는 bcrypt 해시로만 저장되며 API 응답에 포함되지 않습니다.

### API 엔드포인트

- `POST /api/admin-login` - 관리자 로그인
- `POST /api/contact` - 문의 폼 제출
- `GET /api/contacts` - 문의 목록 조회
- `GET /api/members` - 멤버 목록 조회
- `POST /api/members` - 멤버 추가
- `PUT /api/members/:id` - 멤버 수정
- `DELETE /api/members/:id` - 멤버 삭제
- `GET /api/test-db` - 데이터베이스 연결 테스트

## 로컬 개발

프론트엔드와 Netlify Functions를 동일한 환경에서 실행합니다.

```bash
npm install
npm run netlify:dev
```

`server/`의 기존 Express 중복 구현은 제거되었으며, 이전 `cd server && npm run dev` 명령도 동일하게 Netlify Dev를 실행합니다.
