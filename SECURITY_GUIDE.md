# 🛡️ Pass-Cast & 공통 플랫폼 보안 가이드

본 문서는 Pass-Cast 플랫폼 및 향후 복제될 템플릿(예: 한국사 시험 앱 등)에서 공통으로 적용해야 하는 Supabase 보안 표준 정책을 정의합니다. 
새로운 프로젝트 데이터베이스 세팅 시 반드시 이 문서의 정책을 적용하여 사용자 데이터의 안전성을 보장해야 합니다.

## 1. 보안 핵심 원칙 (RLS - Row Level Security)

*   **기본 차단 원칙**: 모든 테이블은 기본적으로 RLS를 활성화하여, 정책(Policy)이 명시되지 않은 모든 접근(해킹, 임의 수정 등)을 원천 차단합니다.
*   **소유자 권한 한정**: 프로필, 오답노트 등 개인화된 데이터는 데이터를 생성한 '본인(`auth.uid()`)'만 조회, 수정, 삭제할 수 있도록 엄격히 제한합니다.
*   **공용 데이터 읽기 전용**: 기출문제 등 공통으로 제공되는 문제 데이터는 누구나 조회할 수 있지만, 일반 유저의 추가/수정/삭제 권한은 부여하지 않습니다.

---

## 2. 테이블별 접근 권한 명세

| 테이블명 | 조회 (SELECT) | 추가 (INSERT) | 수정 (UPDATE) | 삭제 (DELETE) |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` (프로필) | **본인만** (`auth.uid() = id`) | **본인만** | **본인만** | **본인만** |
| `wrong_answers` (오답노트) | **본인만** (`auth.uid() = user_id`) | **본인만** | **본인만** | **본인만** |
| `questions` (기출문제) | **누구나** (`true`) | **불가** (관리자 전용) | **불가** | **불가** |

---

## 3. 통합 보안 적용 스크립트 (복사 & 붙여넣기 용)

새로운 프로젝트(예: 한국사 템플릿)의 Supabase 세팅 시, **SQL Editor**에 아래 코드를 복사하여 한 번만 실행하면 테이블 생성 및 모든 RLS 보안 정책이 즉시 적용됩니다.

```sql
-- ==============================================================================
-- 공통 플랫폼 데이터베이스 초기화 및 RLS(Row Level Security) 설정 스크립트
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. profiles 테이블 (유저 프로필)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING ( auth.uid() = id );
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK ( auth.uid() = id );
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING ( auth.uid() = id );
CREATE POLICY "Users can delete own profile" ON profiles FOR DELETE USING ( auth.uid() = id );

-- ------------------------------------------------------------------------------
-- 2. questions 테이블 (기출문제 공용 데이터)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER,
    subject TEXT,
    question_text TEXT,
    options JSONB,
    answer INTEGER,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING ( true );

-- ------------------------------------------------------------------------------
-- 3. wrong_answers 테이블 (개인 오답노트)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wrong_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT,
    year INTEGER,
    question_text TEXT,
    options JSONB,
    answer INTEGER,
    explanation TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wrong answers" ON wrong_answers FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert own wrong answers" ON wrong_answers FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update own wrong answers" ON wrong_answers FOR UPDATE USING ( auth.uid() = user_id );
CREATE POLICY "Users can delete own wrong answers" ON wrong_answers FOR DELETE USING ( auth.uid() = user_id );
```

---

## 4. 검증 체크리스트
- [ ] Supabase 프로젝트 생성 후 위 통합 SQL 스크립트를 SQL Editor에서 실행했는가?
- [ ] 실행 후 에러 없이 "Success" 메시지를 확인했는가?
- [ ] (향후) 새로운 테이블을 추가할 때 반드시 `ALTER TABLE [테이블명] ENABLE ROW LEVEL SECURITY;`를 적용했는가?
