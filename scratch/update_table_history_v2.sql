-- user_exam_history 테이블 수정 (오답 번호 목록 추가)
ALTER TABLE public.user_exam_history ADD COLUMN IF NOT EXISTS wrong_question_numbers JSONB;

-- 기존 데이터가 있다면 null 처리되므로, 향후 로직에서 반영 예정.
