-- user_exam_history 테이블 생성
-- 사용자의 모든 시험 응시 기록(정답, 점수, 메모 등)을 저장합니다.

CREATE TABLE IF NOT EXISTS public.user_exam_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    year INT NOT NULL,
    subject TEXT NOT NULL,
    is_routine BOOLEAN DEFAULT false,
    set_index INT,
    answers JSONB NOT NULL, -- { questionIndex: chosenOption }
    memo TEXT,
    score INT,
    total_questions INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE public.user_exam_history ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 데이터만 조회할 수 있도록 정책 설정
CREATE POLICY "Users can view their own history" 
    ON public.user_exam_history FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" 
    ON public.user_exam_history FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_user_exam_history_user_id ON public.user_exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exam_history_created_at ON public.user_exam_history(created_at DESC);
