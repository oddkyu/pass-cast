import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import { useExamData } from './hooks/useExamData';

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
import AdminPage from './components/AdminPage';
import AdminUserManagementPage from './components/AdminUserManagementPage';

import PremiumPricingModal from './components/PremiumPricingModal';

const App = () => {
  const {
    isDarkMode, setIsDarkMode,
    user, setUser,
    isAuthLoading,
    isPremium,
    userStatus,
    currentPage,
    selectedExam,
    examResult,
    wrongAnswers,
    examHistory,
    routineTodayCount,
    showGatingModal, setShowGatingModal,
    appSettings,
    activePopups,
    navigate,
    handleFinishExam,
    handleRemoveHistory,
    handleRemoveWrongQuestion,
    handleReviewAttempt
  } = useExamData();

  const renderContent = () => {
    const commonProps = { isDarkMode, user, isAuthLoading, navigate, appSettings, activePopups, isPremium, userStatus, setShowGatingModal };

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
            enableMemo={appSettings.enable_memo}
          />
        );
      case 'exam_result':
        return (
          <ExamResultPage 
            {...commonProps} 
            result={examResult} 
            onHome={() => navigate('home')} 
            onRetry={() => navigate('full_exam', { 
              selectedExam: { 
                ...examResult, 
                reviewMode: false, 
                historyAnswers: {}, 
                initialQuestions: examResult.questions 
              } 
            })}
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
      case 'admin':
        return <AdminPage {...commonProps} />;
      case 'admin_users':
        return <AdminUserManagementPage {...commonProps} />;
      case 'login':
        return <LoginPage {...commonProps} onBack={() => navigate('home')} onLoginSuccess={() => navigate('home', {}, { replace: true })} />;
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
          <PremiumPricingModal 
            isDarkMode={isDarkMode} 
            onClose={() => setShowGatingModal(false)} 
            onLogin={() => { setShowGatingModal(false); navigate('login'); }}
          />
        )}
      </AnimatePresence>

      {appSettings.show_ads && !isPremium && (
        <div className="fixed bottom-0 w-full bg-gold/10 py-2 text-center text-[10px] font-bold text-gold uppercase tracking-widest border-t border-gold/20 backdrop-blur-md">
          Premium 회원이 되어 광고 없이 학습하세요
        </div>
      )}
    </div>
  );
};

export default App;
