import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import { useExamData } from './hooks/useExamData';
import settings from './configs/settings.json';

// Components
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import LandingPage from './components/LandingPage';
import ExamSelectionPage from './components/ExamSelectionPage';
import FullExamPage from './components/FullExamPage';
import ExamResultPage from './components/ExamResultPage';
import WrongAnswerNotePage from './components/WrongAnswerNotePage';
import PremiumPage from './components/PremiumPage';
import LoginPage from './components/LoginPage';
import TestPreviewPage from './components/TestPreviewPage';
import RoutineSelectionPage from './components/RoutineSelectionPage';

const AuthGatingModal = ({ isDarkMode, onClose, onLogin }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 md:p-12">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-midnight/90 backdrop-blur-2xl" />
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className={`relative w-full max-w-lg rounded-[3rem] p-10 md:p-14 text-center space-y-8 overflow-hidden ${isDarkMode ? 'bg-midnight border border-white/10 text-white' : 'bg-white text-midnight'}`}
    >
      <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl" style={{ backgroundColor: '#FEE500' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#191919">
          <path d="M12 3C6.48 3 2 6.58 2 11c0 2.83 1.72 5.3 4.33 6.82l-.9 3.35 3.87-2.55C10.04 18.87 11 19 12 19c5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
        </svg>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-tight break-keep">합격자의 90%가 활용하는 오답노트!</h3>
        <p className="text-base font-bold opacity-50 break-keep">1초 가입하고 나만의 오답 저장하기</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => alert('준비 중입니다')}
          className="w-full py-5 rounded-2xl font-black text-[17px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          카카오로 시작하기
        </button>
        <button onClick={onClose} className="text-sm font-black opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest">나중에 하기</button>
      </div>
    </motion.div>
  </div>
);

const App = () => {
  const {
    isDarkMode, setIsDarkMode,
    user, setUser,
    isPremium,
    currentPage,
    selectedExam,
    examResult,
    wrongAnswers,
    examHistory,
    routineTodayCount,
    showGatingModal, setShowGatingModal,
    navigate,
    handleFinishExam,
    handleRemoveHistory,
    handleRemoveWrongQuestion,
    handleReviewAttempt
  } = useExamData();

  const renderContent = () => {
    const commonProps = { isDarkMode, user, navigate };

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            {...commonProps}
            isPremium={isPremium}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            onGoToLanding={() => navigate('home')}
            onGoToExamSelection={() => navigate('exam_selection')}
            onGoToWrongNote={() => navigate('wrong_note')}
            onGoToPremium={() => navigate('premium')}
            onGoToQuiz={() => navigate('routine_selection')}
            onLogout={async () => { await supabase.auth.signOut(); setUser(null); }}
            onLogin={() => navigate('login')}
            wrongCount={(() => {
              return wrongAnswers.filter(q => 
                examHistory.some(h => 
                  h.subject === q.subject && h.year === q.year && h.wrong_question_numbers?.includes(q.number)
                )
              ).length;
            })()}
            routineCount={routineTodayCount}
          />
        );
      case 'routine_selection':
        return (
          <RoutineSelectionPage 
            {...commonProps} 
            onBack={() => navigate('home')} 
            onStartRoutine={(year, subject, setIndex) => 
              navigate('full_exam', { 
                selectedExam: { year, subject, isRoutine: true, setIndex } 
              })
            } 
          />
        );
      case 'quiz':
        return <QuizPage {...commonProps} onBack={() => navigate('home')} />;
      case 'exam_selection':
        return (
          <ExamSelectionPage 
            {...commonProps} 
            onBack={() => navigate('home')} 
            onSelectExam={(year, subject) => 
              navigate('test_preview', { 
                selectedExam: { year, subject, isRoutine: false, setIndex: null } 
              })
            } 
          />
        );
      case 'test_preview':
        return (
          <TestPreviewPage 
            {...commonProps} 
            selectedExam={selectedExam} 
            onBack={() => navigate('exam_selection')} 
            onStart={() => navigate('full_exam')} 
          />
        );
      case 'full_exam':
        return (
          <FullExamPage 
            {...commonProps} 
            year={selectedExam.year}
            subject={selectedExam.subject}
            isRoutine={selectedExam.isRoutine}
            setIndex={selectedExam.setIndex}
            mode={selectedExam.reviewMode ? 'review' : 'practice'}
            userAnswers={selectedExam.historyAnswers}
            savedMemo={selectedExam.memo}
            onlyMistakes={selectedExam.onlyMistakes}
            initialQuestions={selectedExam.initialQuestions}
            onBack={() => {
              if (selectedExam.reviewMode) {
                navigate('home');
              } else {
                navigate(selectedExam.isRoutine ? 'routine_selection' : 'exam_selection');
              }
            }} 
            onFinish={handleFinishExam} 
            enableMemo={settings.feature_flags.enable_memo}
          />
        );
      case 'exam_result':
        return (
          <ExamResultPage 
            {...commonProps} 
            result={examResult} 
            onHome={() => navigate('home')} 
            onReview={() => navigate('full_exam', { 
              selectedExam: { 
                ...examResult, 
                reviewMode: true, 
                historyAnswers: examResult.answers,
                initialQuestions: examResult.questions
              } 
            })} 
          />
        );
      case 'wrong_note':
        return <WrongAnswerNotePage 
                  {...commonProps}
                  wrongAnswers={wrongAnswers} 
                  examHistory={examHistory}
                  isPremium={isPremium}
                  onBack={() => navigate('home')} 
                  onRemove={handleRemoveWrongQuestion}
                  onReviewAttempt={handleReviewAttempt}
                  onRemoveHistory={handleRemoveHistory}
                />;
      case 'premium':
        return <PremiumPage {...commonProps} onBack={() => navigate('home')} />;
      case 'login':
        return <LoginPage {...commonProps} onBack={() => navigate('home')} />;
      default:
        return (
          <HomePage 
            {...commonProps} 
            onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
            onGoToExamSelection={() => navigate('exam_selection')}
            onGoToQuiz={() => navigate('routine_selection')} 
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-midnight text-white' : 'bg-offwhite text-midnight'}`}>
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <AnimatePresence>
        {showGatingModal && (
          <AuthGatingModal 
            isDarkMode={isDarkMode} 
            onClose={() => setShowGatingModal(false)} 
            onLogin={() => { setShowGatingModal(false); navigate('login'); }}
          />
        )}
      </AnimatePresence>

      {settings.feature_flags.show_ads && (
        <div className="fixed bottom-0 w-full bg-gold/10 py-2 text-center text-[10px] font-bold text-gold uppercase tracking-widest border-t border-gold/20 backdrop-blur-md">
          Premium 회원이 되어 광고 없이 학습하세요
        </div>
      )}
    </div>
  );
};

export default App;
