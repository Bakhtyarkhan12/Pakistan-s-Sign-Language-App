import React from 'react';
import '../App.css';

const Home = () => {
  const recentLessons = [
    { title: 'Alphabets', progress: 0 },
    { title: 'Mangoes', progress: 0 },
    { title: 'Birds', progress: 0 },
  ];

  return (
    <div className="home-page">
      {/* Introduction Section */}
      <section className="intro-section">
        <div className="pak-flag">🇵🇰</div>
        <h1 className="intro-title">Welcome to SignSpeakly</h1>
        <h2 className="intro-subtitle">خوش آمديد</h2>
        <p className="intro-description">
          SignSpeakly is an interactive web app designed to help you learn, translate, and practice Pakistan Sign Language (PSL). Our goal is to bridge communication gaps, empower the deaf community, and make PSL learning accessible to everyone in a simple, engaging, and fun way.
        </p>
        <p className="intro-highlight">
          Start your journey with features like <strong>interactive lessons</strong>, <strong>live translation</strong>, <strong>quizzes</strong>, and <strong>progress tracking</strong>.
        </p>
      </section>

      {/* Recent Lessons Section */}
      <section>
        <h3 className="section-title">Recent Lessons</h3>
        <div className="lesson-cards">
          {recentLessons.map((lesson, index) => (
            <div key={index} className="lesson-card">
              <p className="lesson-title">{lesson.title}</p>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${lesson.progress}%` }}></div>
              </div>
              <p className="progress-text">{lesson.progress}% complete</p>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information Section */}
      <section className="additional-info">
        <div className="footer-content">
          <p>Thank you for visiting <strong>SignSpeakly</strong>! We hope you enjoy your learning journey.</p>
          <p>For more information or inquiries, feel free to <a href="mailto:contact@signspeakly.com">contact us</a>.</p>
          <p><strong>Developed by:</strong> Bakhtiyar Saeed</p>
          <p className="footer-highlight">Making communication accessible for all. Together, we break the barriers!</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
