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

## 기술 스택

- React 18
- React Router DOM
- Vite
- Tailwind CSS

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


