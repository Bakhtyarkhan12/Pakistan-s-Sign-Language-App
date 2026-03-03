import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import '../styles/learn.css'; // adjust the path if needed

const LearnScreen = () => {
  const videoRef = useRef(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [learnedItems, setLearnedItems] = useState({});

 const alphabetContent = [
  { id: 1, name: 'Alif (ا)', video: '/videos/Learning/alphabets/alif.mp4' },
  { id: 2, name: 'Bay (ب)', video: '/videos/Learning/alphabets/bay.mp4' },
  { id: 3, name: 'Pay (پ)', video: '/videos/Learning/alphabets/pay.mp4' },
  { id: 4, name: 'Tay (ت)', video: '/videos/Learning/alphabets/tay.mp4' },
  { id: 5, name: 'Say (ث)', video: '/videos/Learning/alphabets/say.mp4' },
  { id: 6, name: 'Seen (س)', video: '/videos/Learning/alphabets/seen.mp4' },
  { id: 7, name: 'Jeem (ج)', video: '/videos/Learning/alphabets/jeem.mp4' },
  { id: 8, name: 'Hah (ح)', video: '/videos/Learning/alphabets/hah.mp4' },
  { id: 9, name: 'Khah (خ)', video: '/videos/Learning/alphabets/khah.mp4' },
  { id: 10, name: 'Daal (د)', video: '/videos/Learning/alphabets/daal.mp4' },
  { id: 11, name: 'Zaal (ذ)', video: '/videos/Learning/alphabets/zaal.mp4' },
];

const fruitsContent = [
  { id: 1, name: 'Apple (سیب)', video: '/videos/Learning/fruits/seb.mp4' },
  { id: 2, name: 'Banana (کیلا)', video: '/videos/Learning/fruits/kela.mp4' },
  { id: 3, name: 'Mango (آم)', video: '/videos/Learning/fruits/aam.mp4' },
  { id: 4, name: 'Orange (مالٹا)', video: '/videos/Learning/fruits/santra.mp4' },
  { id: 5, name: 'Grapes (انگور)', video: '/videos/Learning/fruits/angoor.mp4' },
  { id: 6, name: 'Pineapple (انناس)', video: '/videos/Learning/fruits/ananaas.mp4' },
  { id: 7, name: 'Watermelon (تربوز)', video: '/videos/Learning/fruits/tarbooz.mp4' },
  { id: 8, name: 'Strawberry (اسٹرابیری)', video: '/videos/Learning/fruits/strawberry.mp4' },
];

const birdsContent = [
  { id: 1, name: 'Bird (پرندہ)', video: '/videos/Learning/birds/bird.mp4' },
  { id: 2, name: 'Parrot (طوطا)', video: '/videos/Learning/birds/parrot.mp4' },
  { id: 3, name: 'Peacock (مور)', video: '/videos/Learning/birds/peacock.mp4' },
  { id: 4, name: 'Eagle (عقاب)', video: '/videos/Learning/birds/eagle.mp4' },
  { id: 5, name: 'Sparrow (چڑیا)', video: '/videos/Learning/birds/sparrow.mp4' },
  { id: 6, name: 'Pigeon (کبوتر)', video: '/videos/Learning/birds/pigeon.mp4' },
  { id: 7, name: 'Owl (الو)', video: '/videos/Learning/birds/owl.mp4' },
];
  const sections = {
    alphabet: { title: 'Urdu Alphabet', icon: '🔤', data: alphabetContent },
    fruits: { title: 'Fruits Signs', icon: '🍎', data: fruitsContent },
    birds: { title: 'Birds Signs', icon: '🕊️', data: birdsContent },
  };

  const currentSectionData = currentSection && sections[currentSection]?.data || [];
  const currentItem = currentSectionData[currentItemIndex] || {};
  const isLearned = currentItem.id && learnedItems[currentSection]?.includes(currentItem.id);

  const markAsLearned = () => {
    if (!currentSection || !currentItem.id) return;
    setLearnedItems(prev => {
      const sectionItems = prev[currentSection] || [];
      const updatedItems = sectionItems.includes(currentItem.id)
        ? sectionItems.filter(id => id !== currentItem.id)
        : [...sectionItems, currentItem.id];
      return { ...prev, [currentSection]: updatedItems };
    });
  };

  const handleSectionSelect = (section) => {
    setCurrentSection(section);
    setCurrentItemIndex(0);
  };

  const handleNext = () => {
    if (currentItemIndex < currentSectionData.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex(prev => prev - 1);
    }
  };

  const returnToMenu = () => {
    setCurrentSection(null);
  };

  if (!currentSection) {
    return (
      <div className="learn-screen">
        <h1 className="title">Pakistan Sign Language Learning</h1>
        <div className="card-grid">
          {Object.keys(sections).map((key) => (
            <div key={key} className="card" onClick={() => handleSectionSelect(key)}>
              <div className="card-icon">{sections[key].icon}</div>
              <div className="card-title">{sections[key].title}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="learn-screen">
      <h2 className="item-name">{currentItem.name}</h2>
      <div className="video-player">
        <ReactPlayer
          url={currentItem.video}
          playing
          controls
          width="100%"
          height="360px"
          onStart={() => setLoadingVideo(false)}
          onBuffer={() => setLoadingVideo(true)}
        />
      </div>
      <div className="controls">
        <p>{`${currentItemIndex + 1} / ${currentSectionData.length}`} {isLearned && '✓ Learned'}</p>
        <button onClick={markAsLearned} className="learned-btn">
          {isLearned ? 'Mark as Unlearned' : 'Mark as Learned'}
        </button>
        <div className="nav-buttons">
          <button onClick={handlePrevious} disabled={currentItemIndex === 0}>Previous</button>
          <button onClick={handleNext} disabled={currentItemIndex === currentSectionData.length - 1}>Next</button>
        </div>
        <button onClick={returnToMenu} className="menu-btn">Back to Menu</button>
      </div>
    </div>
  );
};

export default LearnScreen;
