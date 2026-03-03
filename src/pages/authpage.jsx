import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate(); // ✅ For redirect

  const toggleForm = () => {
    setError('');
    setIsLogin(!isLogin);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Fetch user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log("No such document!");
        }

        alert('Login successful!');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✅ Store user info in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          fullName,
          username,
          email,
          createdAt: new Date().toISOString()
        });

        alert('Account created and profile saved!');
      }

      // ✅ Redirect to profile
      navigate('/profile');

      // Clear form
      setFullName('');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Display user info if logged in
  useEffect(() => {
    if (userData) {
      console.log('User data:', userData); // You can use this data to display it in your app
    }
  }, [userData]);

  return (
    <div style={styles.authContainer}>
      <nav style={styles.authNavbar}>
        <h1 style={styles.brand}>SignSpeakly</h1>
      </nav>

      <div style={styles.formBox}>
        <form style={styles.authForm} onSubmit={handleSubmit}>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </form>

        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span onClick={toggleForm} style={styles.toggleLink}>
            {isLogin ? ' Sign up' : ' Log in'}
          </span>
        </p>
      </div>

      {userData && (
        <div>
          <h3>User Info</h3>
          <p>Username: {userData.username}</p>
          <p>Email: {userData.email}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '60px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  authNavbar: {
    width: '100%',
    backgroundColor: '#272a2e',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '15px 30px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  brand: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
  },
  formBox: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '40px',
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#00d084',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  toggleText: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '14px',
  },
  toggleLink: {
    color: '#00d084',
    cursor: 'pointer',
    marginLeft: '5px',
  },
};

export default AuthPage;
