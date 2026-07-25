# Real Day 로컬 개발 실행기

프로덕션과 로컬 개발 모두 `netlify/functions/`를 단일 백엔드로 사용합니다.
이 디렉터리는 기존 Express 중복 구현을 제거한 뒤, 이전 실행 명령과의 호환성을 위해 Netlify Dev를 실행하는 얇은 래퍼만 제공합니다.

## 권장 실행 방법

```bash
npm install
npm run netlify:dev
```

기존 명령도 사용할 수 있습니다.

```bash
cd server
npm run dev
```

두 명령 모두 루트의 `netlify.toml` 설정을 사용해 프론트엔드와 Functions를 함께 실행합니다.
