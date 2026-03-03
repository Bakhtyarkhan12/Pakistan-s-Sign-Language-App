import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../appcontext';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const EditableField = ({ label, value }) => (
  <div style={styles.formGroup}>
    <label>{label}</label>
    <div style={styles.inlineView}>
      <span>{value || <em>Not set</em>}</span>
    </div>
  </div>
);

const ProfilePage = () => {
  const {
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    fontSize,
    setFontSize,
    notifications,
    setNotifications,
  } = useContext(AppContext);

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [progress, setProgress] = useState(0); // % completed

  const learningLevel = progress === 100
    ? 'Professional'
    : progress >= 90
    ? 'High-level'
    : progress >= 50
    ? 'Intermediate'
    : 'Beginner';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.fullName || '');
          setEmail(data.email || '');
          setUsername(data.username || '');
          // Simulate progress for now
          setProgress(0); // You can link this to actual lesson tracking
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    fetchUserData();
  }, []);

  const computedFontSize =
    fontSize === 'Large' ? '18px' : fontSize === 'Small' ? '14px' : '16px';

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '40px',
        backgroundColor: darkMode ? '#121212' : '#f9f9f9',
        color: darkMode ? '#f0f0f0' : '#222',
        fontSize: computedFontSize,
        fontFamily: 'Segoe UI, sans-serif',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h2>My Profile</h2>

        <div style={styles.profileBox}>
          <div style={styles.imageWrapper}>
            <img
              src={profileImage || 'https://via.placeholder.com/100'}
              alt="User"
              style={styles.profileImage}
            />
            <div>
              <input
                type="file"
                id="profileUploader"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="profileUploader" style={styles.uploadButton}>
                Upload Photo
              </label>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <EditableField label="Name" value={name} />
            <EditableField label="Email" value={email} />
            <EditableField label="Username" value={username} />
            <EditableField label="Learning Level" value={learningLevel} />
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h4>Learning Progress</h4>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
          </div>
          <p>{progress}% Completed</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h4>Actions</h4>
          <button onClick={() => navigate('/learn')} style={styles.primaryButton}>
            Continue Learning
          </button>
          <button onClick={() => navigate('/translation')} style={styles.secondaryButton}>
            Start Translation
          </button>
        </div>

        <div>
          <h4>Settings</h4>

          <div style={styles.settingRow}>
            <label><strong>Dark Mode</strong></label>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </div>

          <div style={styles.settingRow}>
            <label><strong>Font Size</strong></label>
            <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>

          <div style={styles.settingRow}>
            <label><strong>Language</strong></label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Urdu</option>
            </select>
          </div>

          <div style={styles.settingRow}>
            <label><strong>Notifications</strong></label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  profileBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '30px',
    marginBottom: '40px',
  },
  imageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  profileImage: {
    borderRadius: '50%',
    height: '100px',
    width: '100px',
    objectFit: 'cover',
    border: '2px solid #ccc',
  },
  uploadButton: {
    marginTop: '5px',
    backgroundColor: '#00d084',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '5px',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'center',
    display: 'inline-block',
  },
  formGroup: {
    marginBottom: '20px',
    position: 'relative',
  },
  inlineView: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    fontSize: '14px',
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#ccc',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#00d084',
    height: '100%',
    transition: 'width 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#00d084',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    marginRight: '15px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: '#f1f1f1',
    color: '#222',
    border: 'none',
    padding: '12px 20px',
    fontSize: '16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  settingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #ddd',
  },
};

export default ProfilePage;
