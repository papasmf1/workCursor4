# 할일 관리 앱 - Supabase 연동 가이드

## 📋 개요

이 할일 관리 웹 애플리케이션은 Supabase를 사용하여 데이터를 클라우드 데이터베이스에 저장합니다. Supabase 설정이 없으면 자동으로 로컬 스토리지로 폴백됩니다.

## 🚀 Supabase 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하여 계정을 생성하거나 로그인
2. "New Project" 버튼 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 프로젝트 생성 완료까지 대기 (약 2-3분)

### 2. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 "SQL Editor" 메뉴 선택
2. `supabase-schema.sql` 파일의 내용을 복사하여 실행
3. 테이블 생성 완료 확인

### 3. API 키 설정

1. Supabase 대시보드에서 "Settings" > "API" 메뉴 선택
2. Project URL과 anon public key 복사
3. `supabase-config.js` 파일에서 다음 값들을 수정:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Project URL로 변경
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // anon public key로 변경
```

### 4. 애플리케이션 실행

1. 웹 서버를 통해 `index.html` 파일 실행
2. 브라우저 개발자 도구 콘솔에서 "Supabase에서 할일을 로드했습니다." 메시지 확인

## 🔧 기능

### Supabase 연동 기능
- ✅ 할일 추가 (Supabase에 저장)
- ✅ 할일 조회 (Supabase에서 로드)
- ✅ 할일 완료 상태 변경 (Supabase 업데이트)
- ✅ 할일 삭제 (Supabase에서 삭제)
- ✅ 실시간 동기화

### 폴백 기능
- Supabase 설정이 없으면 자동으로 로컬 스토리지 사용
- 네트워크 오류 시 로컬 스토리지로 폴백

## 📁 파일 구조

```
todolist/
├── index.html              # 메인 HTML 파일
├── styles.css              # 스타일시트
├── script.js               # 메인 JavaScript (Supabase 연동)
├── supabase-config.js      # Supabase 설정 파일
├── supabase-schema.sql     # 데이터베이스 스키마
└── README-SUPABASE.md      # 이 파일
```

## 🛠️ 개발자 도구

브라우저 콘솔에서 다음 명령어 사용 가능:

```javascript
// 앱 인스턴스 접근
window.todoApp.app

// 할일 목록 조회
window.todoApp.getTodos()

// 할일 추가
window.todoApp.addTodo('새로운 할일')

// 완료된 할일 삭제
window.todoApp.clearCompleted()

// 모든 할일 삭제
window.todoApp.clearAll()
```

## 🔒 보안 고려사항

- 현재 설정은 개발용으로 모든 사용자가 모든 데이터에 접근 가능
- 프로덕션 환경에서는 RLS 정책을 더 엄격하게 설정 필요
- API 키는 공개되어도 되지만, 서비스 키는 절대 공개하지 말 것

## 🐛 문제 해결

### Supabase 연결 실패
- API 키와 URL이 올바른지 확인
- 네트워크 연결 상태 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 데이터가 표시되지 않음
- 브라우저 콘솔에서 오류 메시지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 데이터베이스 테이블이 생성되었는지 확인

## 📞 지원

문제가 발생하면 브라우저 개발자 도구의 콘솔 로그를 확인하거나, 이슈를 등록해주세요.
