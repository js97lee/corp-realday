# Netlify 크레딧 최적화 가이드

## 🔍 크레딧 소모 원인 분석

### 현재 문제점

#### 1. **대시보드에서 과도한 API 호출** ⚠️
```javascript
// AdminDashboard.jsx - 문제 코드
useEffect(() => {
  if (user && activeMenu === 'dashboard') {
    loadDashboardData()  // 메뉴 전환할 때마다 실행
  }
}, [user, activeMenu])  // activeMenu 변경 시마다 재실행

const loadDashboardData = async () => {
  // 4개 API를 동시에 호출
  await Promise.allSettled([
    fetchContacts(),    // API 호출 1
    fetchProjects(),    // API 호출 2
    fetchMembers(),    // API 호출 3
    fetchFinances()     // API 호출 4
  ])
}
```

**문제:**
- 대시보드 메뉴로 돌아올 때마다 4개 API 동시 호출
- 페이지 새로고침할 때마다 4개 API 호출
- 메뉴 전환할 때마다 재실행

**크레딧 소모:**
- Functions 실행 시간 × 4
- DB 쿼리 실행 시간 × 4
- 네트워크 대역폭 × 4

#### 2. **각 페이지마다 개별 API 호출**
- AdminMembers: `fetchMembers()` 호출
- AdminProjects: `fetchProjects()` 호출
- AdminTasks: `fetchTasks()` 호출
- AdminFinance: `fetchFinances()` 호출
- AdminContacts: `fetchContacts()` 호출

**정상적인 사용이지만**, 사용자가 자주 페이지를 이동하면 크레딧 소모 증가

#### 3. **Netlify Functions 실행 시간**
각 Function이 실행될 때마다:
- Cold start 시간 (약 100-500ms)
- DB 연결 시간
- 쿼리 실행 시간
- 응답 반환 시간

**총 실행 시간이 길수록 크레딧 소모 증가**

---

## 💡 최적화 방안

### 방안 1: 캐싱 추가 (즉시 적용 가능) ⭐

#### 프론트엔드 캐싱
```javascript
// utils/cache.js
const cache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export function getCached(key) {
  const item = cache.get(key)
  if (!item) return null
  
  if (Date.now() - item.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }
  
  return item.data
}

export function setCached(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  })
}
```

#### API 호출에 캐싱 적용
```javascript
// utils/api.js
import { getCached, setCached } from './cache'

export const fetchContacts = async () => {
  const cacheKey = 'contacts'
  const cached = getCached(cacheKey)
  if (cached) return cached
  
  const response = await fetch(`${API_BASE_URL}/contacts`)
  const data = await response.json()
  
  setCached(cacheKey, data)
  return data
}
```

**효과:**
- 5분 내 재호출 시 API 호출 없음
- 크레딧 소모 80-90% 감소 가능

---

### 방안 2: 대시보드 API 호출 최적화

#### 문제: 메뉴 전환할 때마다 재호출
```javascript
// 개선 전
useEffect(() => {
  if (user && activeMenu === 'dashboard') {
    loadDashboardData()  // 매번 호출
  }
}, [user, activeMenu])
```

#### 개선: 한 번만 호출하거나 캐싱
```javascript
// 개선 후
const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false)

useEffect(() => {
  if (user && activeMenu === 'dashboard' && !dashboardDataLoaded) {
    loadDashboardData()
    setDashboardDataLoaded(true)
  }
}, [user, activeMenu, dashboardDataLoaded])
```

**효과:**
- 대시보드 진입 시 1회만 호출
- 메뉴 전환 시 재호출 방지

---

### 방안 3: API 응답 최적화

#### 불필요한 데이터 제거
```javascript
// netlify/functions/contacts.js
// 개선 전: 전체 데이터 반환
const contacts = await sqlFunc`SELECT * FROM contacts`

// 개선 후: 필요한 필드만 선택
const contacts = await sqlFunc`
  SELECT id, name, email, message, created_at 
  FROM contacts 
  ORDER BY created_at DESC 
  LIMIT 100
`
```

**효과:**
- 응답 크기 감소 → 대역폭 절약
- 쿼리 실행 시간 단축

---

### 방안 4: 배치 API 생성

#### 여러 API를 하나로 통합
```javascript
// netlify/functions/dashboard.js (새로 생성)
export const handler = async (event) => {
  const [contacts, projects, members, finances] = await Promise.all([
    sqlFunc`SELECT COUNT(*) as count FROM contacts`,
    sqlFunc`SELECT COUNT(*) as count FROM projects`,
    sqlFunc`SELECT COUNT(*) as count FROM users`,
    sqlFunc`SELECT SUM(amount) as total FROM finances WHERE type='income'`
  ])
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      contacts: contacts[0].count,
      projects: projects[0].count,
      members: members[0].count,
      finances: finances[0].total
    })
  }
}
```

**효과:**
- 4개 API 호출 → 1개 API 호출
- 크레딧 소모 75% 감소

---

### 방안 5: 조건부 데이터 로드

#### 필요한 데이터만 로드
```javascript
// AdminDashboard.jsx
const loadDashboardData = async () => {
  const userRole = getUserRole()
  
  // 최고관리자만 재무 데이터 로드
  const promises = [
    fetchContacts(),
    fetchProjects(),
    fetchMembers(),
  ]
  
  if (isSuperAdmin()) {
    promises.push(fetchFinances())
  }
  
  await Promise.allSettled(promises)
}
```

**효과:**
- 일반 사용자는 3개 API만 호출
- 크레딧 소모 25% 감소

---

## 📊 예상 효과

### 현재 상황 (추정)
- 대시보드 진입: 4개 API 호출
- 페이지당 평균: 1-2개 API 호출
- 일일 사용자: 10명, 각 10회 페이지 이동
- **일일 API 호출: 약 100-200회**

### 최적화 후
- 캐싱 적용: 80% 감소 → **20-40회/일**
- 배치 API: 75% 감소 → **5-10회/일**
- **총 크레딧 소모: 90% 감소 예상**

---

## 🚀 즉시 적용 가능한 최적화

### 1단계: 프론트엔드 캐싱 추가 (30분)
- `utils/cache.js` 생성
- 주요 API 함수에 캐싱 적용
- 캐시 시간: 5분

### 2단계: 대시보드 최적화 (15분)
- 메뉴 전환 시 재호출 방지
- 조건부 데이터 로드

### 3단계: API 응답 최적화 (1시간)
- 불필요한 필드 제거
- LIMIT 추가
- 배치 API 생성

---

## 💰 비용 절감 예상

### Netlify 크레딧 소모
- Functions 실행: 초당 크레딧 소모
- 현재: 약 1000 크레딧/월 사용
- 최적화 후: 약 100-200 크레딧/월 예상

### 대안: 다른 서비스로 전환
- **Vercel**: 무료 (100GB 대역폭)
- **Render**: 무료 (750시간/월)
- **Railway**: $5 크레딧/월

---

## ✅ 권장 사항

1. **즉시 적용**: 프론트엔드 캐싱 (가장 효과적)
2. **단기 적용**: 대시보드 최적화
3. **중기 적용**: 배치 API 생성
4. **장기 검토**: Vercel 또는 Render로 전환 고려

