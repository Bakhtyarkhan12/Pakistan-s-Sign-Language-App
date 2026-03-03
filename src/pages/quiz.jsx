import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import '../styles/quiz.css';

const QuizPage = () => {
  const [currentSection, setCurrentSection] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const alphabetQuiz = [
    {
      question: "Which image shows the sign for 'Jeem' (ج)?",
      options: [
        { id: 1, correct: true, image: '/images/jeem.png' },
        { id: 2, correct: false, image: '/images/hah.png' }
      ]
    },
    {
      question: "Identify the correct sign for 'Ray' (ر)?",
      options: [
        { id: 1, correct: false, image: '/images/zay.png' },
        { id: 2, correct: true, image: '/images/ray.png' }
      ]
    },
    {
      question: "Which image corresponds to 'Seen' (س)?",
      options: [
        { id: 1, correct: true, image: '/images/seen.png' },
        { id: 2, correct: false, image: '/images/alif.jpeg' }
      ]
    },
    {
      question: "Select the sign for 'Bay' (ب)?",
      options: [
        { id: 1, correct: false, image: '/images/pay.png' },
        { id: 2, correct: true, image: '/images/bay.jpeg' }
      ]
    },
    {
      question: "Which sign represents 'Alif' (ا)?",
      options: [
        { id: 1, correct: true, image: '/images/alif.jpeg' },
        { id: 2, correct: false, image: '/images/cay.png' }
      ]
    },
    {
      question: "Identify the correct sign for 'Noon' (ن)?",
      options: [
        { id: 1, correct: false, image: '/images/dhaal.png' },
        { id: 2, correct: true, image: '/images/noon.png' }
      ]
    },
    {
      question: "Which image shows the sign for 'Kha' (خ)?",
      options: [
        { id: 1, correct: true, image: '/images/kheh.png' },
        { id: 2, correct: false, image: '/images/daal.png' }
      ]
    },
    {
      question: "Select the sign for 'Daal' (د)?",
      options: [
        { id: 1, correct: true, image: '/images/daal.png' },
        { id: 2, correct: false, image: '/images/zaal.png' }
      ]
    },
    {
      question: "Which image corresponds to 'Tay' (ت)?",
      options: [
        { id: 1, correct: false, image: '/images/cay.png' },
        { id: 2, correct: true, image: '/images/tay.png' }
      ]
    },
    {
      question: "Identify the correct sign for 'Fe' (ف)?",
      options: [
        { id: 1, correct: true, image: '/images/fe.png' },
        { id: 2, correct: false, image: '/images/zay.png' }
      ]
    }
  ];

  // New quiz sections (empty for now)
  const fruitsQuiz = [
    {
      question: "Which image shows the sign for 'Apple'?",
      options: [
        { id: 1, correct: false, image: '/images/apple1.png' },
        { id: 2, correct: true, image: '/images/apple2.png' }
      ]
    }
  ];

  const birdsQuiz = [
    {
      question: "Which image corresponds to the sign for 'Eagle'?",
      options: [
        { id: 1, correct: false, image: '/images/eagle1.png' },
        { id: 2, correct: true, image: '/images/eagle2.png' }
      ]
    }
  ];

  const sections = {
    alphabet: {
      title: 'Urdu Alphabet Quiz',
      data: alphabetQuiz,
      grading: {
        A: { min: 9, message: "Excellent! You've mastered the alphabet signs!" },
        B: { min: 8, message: 'Good job! Keep practicing!' },
        C: { min: 6, message: 'Keep learning!' },
        F: { min: 0, message:'Try again!' }
      }
    },
    fruits: {
      title: 'Fruits Quiz',
      data: fruitsQuiz, // Empty for now
      grading: {
        A: { min: 9, message: "Excellent! You've completed the quiz!" },
        B: { min: 8, message: 'Good effort! Keep it up!' },
        C: { min: 6, message: 'You can do better!' },
        F: { min: 0, message:'Try again!' }
      }
    },
    birds: {
      title: 'Birds Quiz',
      data: birdsQuiz, // Empty for now
      grading: {
        A: { min: 9, message: "Excellent! You've completed the quiz!" },
        B: { min: 8, message: 'Good effort! Keep it up!' },
        C: { min: 6, message: 'You can do better!' },
        F: { min: 0, message:'Try again!' }
      }
    }
  };

  const currentQuizData = sections[currentSection]?.data || [];
  const currentQuestion = currentQuizData[currentQuestionIndex] || {};

  const getGrade = (score) => {
    const grading = sections[currentSection].grading;
    if (score >= grading.A.min) return 'A';
    if (score >= grading.B.min) return 'B';
    if (score >= grading.C.min) return 'C';
    return 'F';
  };

  const handleOptionSelect = (option) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    setShowResult(true);
    if (selectedOption.correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setQuizCompleted(false);
  };

  if (!currentSection) {
    return (
      <div className="quiz-container">
        <h1 className="quiz-title">Pakistan Sign Language Quiz</h1>
        {Object.keys(sections).map((section) => (
          <button className="quiz-section-button" key={section} onClick={() => setCurrentSection(section)}>
            {sections[section].title}
          </button>
        ))}
      </div>
    );
  }

  if (quizCompleted) {
    const grade = getGrade(score);
    return (
      <div className="quiz-container">
        <h1 className="quiz-title">Quiz Completed!</h1>
        <p className="quiz-score">Your Score: {score}/{currentQuizData.length}</p>
        <p className="quiz-grade">Grade: {grade}</p>
        <p className="quiz-message">{sections[currentSection].grading[grade].message}</p>
        <button onClick={restartQuiz} className="quiz-button">Restart Quiz</button>
        <button onClick={() => setCurrentSection(null)} className="quiz-button">Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2 className="quiz-question">{currentQuestion.question}</h2>
      <div className="quiz-options">
        {currentQuestion.options.map(option => (
          <div
            key={option.id}
            className={`quiz-option ${selectedOption?.id === option.id ? 'selected' : ''} ${showResult && option.correct ? 'correct' : ''} ${showResult && !option.correct && selectedOption?.id === option.id ? 'wrong' : ''}`}
            onClick={() => handleOptionSelect(option)}
          >
            {option.image && <img src={option.image} alt="option" className="quiz-image" />}
            {option.video && <ReactPlayer url={option.video} controls className="quiz-video" />}
          </div>
        ))}
      </div>
      {!showResult ? (
        <button onClick={checkAnswer} className="quiz-button">Check Answer</button>
      ) : (
        <button onClick={handleNext} className="quiz-button">{currentQuestionIndex < currentQuizData.length - 1 ? 'Next Question' : 'Finish Quiz'}</button>
      )}
    </div>
  );
};

export default QuizPage;
