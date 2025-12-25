# 실행 가이드

## 문제 해결 체크리스트

### 1. 의존성 설치 확인
터미널에서 다음 명령어로 확인:
```bash
cd /Users/jisulee/A.홈페이지
ls -la node_modules
```

만약 `node_modules` 폴더가 없다면:
```bash
npm install
```

### 2. npm 권한 문제 해결
만약 권한 오류가 발생하면:
```bash
sudo chown -R 501:20 "/Users/jisulee/.npm"
npm cache clean --force
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

성공하면 다음과 같은 메시지가 표시됩니다:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. 브라우저 접속
- 자동으로 브라우저가 열리거나
- 수동으로 `http://localhost:3000` 접속

### 5. 포트가 이미 사용 중인 경우
포트 3000이 이미 사용 중이면 다른 포트로 실행:
```bash
npm run dev -- --port 3001
```

### 6. 일반적인 오류 해결

**오류: "Cannot find module"**
→ `npm install` 다시 실행

**오류: "Port 3000 is already in use"**
→ 다른 포트 사용하거나 기존 프로세스 종료:
```bash
lsof -ti:3000 | xargs kill -9
```

**오류: "ERR_CONNECTION_REFUSED"**
→ 개발 서버가 실행되지 않음. `npm run dev` 실행 확인


