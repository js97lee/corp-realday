# Gmail 메일 전송 환경변수 설정 가이드

이 가이드는 Netlify에서 Gmail SMTP를 통해 메일을 전송하기 위한 환경변수 설정 방법을 단계별로 안내합니다.

## 1단계: Gmail 2단계 인증 활성화

1. **Google 계정에 로그인**
   - https://myaccount.google.com/ 접속
   - Gmail 계정으로 로그인 (studio.realday@gmail.com)

2. **보안 설정으로 이동**
   - 왼쪽 메뉴에서 "보안" 클릭
   - 또는 직접 https://myaccount.google.com/security 접속

3. **2단계 인증 활성화**
   - "Google에 로그인" 섹션에서 "2단계 인증" 찾기
   - "2단계 인증 사용" 클릭
   - 화면 안내에 따라 설정 완료
   - **중요**: 앱 비밀번호를 생성하려면 2단계 인증이 반드시 필요합니다

## 2단계: Gmail 앱 비밀번호 생성

1. **앱 비밀번호 페이지로 이동**
   - 보안 페이지에서 "앱 비밀번호" 찾기
   - 또는 직접 https://myaccount.google.com/apppasswords 접속
   - 2단계 인증이 활성화되어 있어야 이 페이지에 접근 가능합니다

2. **앱 비밀번호 생성**
   - "앱 선택" 드롭다운에서 "기타(맞춤 이름)" 선택
   - 이름 입력: "Netlify Email Service" (또는 원하는 이름)
   - "생성" 버튼 클릭

3. **앱 비밀번호 복사**
   - 16자리 비밀번호가 생성됩니다 (예: `abcd efgh ijkl mnop`)
   - **중요**: 이 비밀번호는 한 번만 표시되므로 반드시 복사해두세요
   - 공백 없이 복사하거나, 공백을 제거한 형태로 저장하세요

## 3단계: Netlify 환경변수 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/ 접속
   - 프로젝트 사이트 선택

2. **환경변수 설정 페이지로 이동**
   - 사이트 설정 → "Environment variables" 메뉴 클릭
   - 또는 Site settings → Build & deploy → Environment variables

3. **환경변수 추가**
   
   **변수 1: GMAIL_APP_PASSWORD**
   - "Add a variable" 클릭
   - Key: `GMAIL_APP_PASSWORD`
   - Value: 2단계에서 생성한 앱 비밀번호 (16자리, 공백 없이)
   - 예: `abcdefghijklmnop`
   - **중요**: "Contains secret values" 체크박스를 반드시 체크하세요 (보안을 위해)
   - "Add variable" 또는 "Create variable" 클릭

   **변수 2: GMAIL_USER (선택사항)**
   - 기본값이 `studio.realday@gmail.com`으로 설정되어 있어 생략 가능
   - 다른 Gmail 계정을 사용하려면 추가:
     - Key: `GMAIL_USER`
     - Value: `studio.realday@gmail.com` (또는 사용할 Gmail 주소)

4. **환경변수 확인**
   - 추가한 환경변수가 목록에 표시되는지 확인
   - Key와 Value가 올바르게 설정되었는지 확인

## 4단계: 배포 및 테스트

1. **변경사항 배포**
   - 환경변수는 즉시 적용되지만, 함수가 재배포되어야 할 수 있습니다
   - 필요시 "Trigger deploy" 또는 코드를 다시 배포

2. **메일 전송 테스트**
   - 어드민 대시보드에 최고관리자로 로그인
   - 헤더의 "메일 쓰기" 버튼 클릭
   - 테스트 메일 작성 및 전송
   - `studio.realday@gmail.com`으로 메일이 도착하는지 확인

## 문제 해결

### 메일이 전송되지 않는 경우

1. **환경변수 확인**
   - Netlify 대시보드에서 환경변수가 올바르게 설정되었는지 확인
   - `GMAIL_APP_PASSWORD`가 정확한지 확인 (공백 없이)

2. **앱 비밀번호 확인**
   - Gmail 앱 비밀번호가 올바르게 생성되었는지 확인
   - 앱 비밀번호를 다시 생성하여 새로운 값으로 업데이트

3. **로그 확인**
   - Netlify Functions 로그 확인
   - Site settings → Functions → View logs
   - 에러 메시지 확인

4. **2단계 인증 확인**
   - Gmail 계정의 2단계 인증이 활성화되어 있는지 확인
   - 2단계 인증이 없으면 앱 비밀번호를 생성할 수 없습니다

### 일반적인 에러 메시지

- **"Gmail 앱 비밀번호가 설정되지 않았습니다"**
  → `GMAIL_APP_PASSWORD` 환경변수가 설정되지 않았습니다

- **"Invalid login" 또는 "Authentication failed"**
  → 앱 비밀번호가 잘못되었거나, 2단계 인증이 비활성화되어 있습니다

- **"Less secure app access" 관련 에러**
  → 앱 비밀번호를 사용하면 이 문제가 해결됩니다

## 보안 주의사항

- **앱 비밀번호는 절대 코드에 하드코딩하지 마세요**
- **환경변수는 Netlify 대시보드에서만 관리하세요**
- **앱 비밀번호를 공유하지 마세요**
- **정기적으로 앱 비밀번호를 재생성하는 것을 권장합니다**

## 추가 리소스

- [Google 앱 비밀번호 가이드](https://support.google.com/accounts/answer/185833)
- [Netlify 환경변수 문서](https://docs.netlify.com/environment-variables/overview/)

