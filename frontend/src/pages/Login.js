
import React, { useState } from 'react';
import { supabase } from '../supabase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailAuth = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '36px', fontWeight: '800',
            background: 'linear-gradient(135deg, #D4A843, #F8D97A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-1.6px', marginBottom: '8px'
          }}>ReelForge</div>
          <div style={{ color: '#666', fontSize: '14px' }}>AI Creator Studio</div>
        </div>

        <div style={{
          background: '#0e0e0e', border: '1px solid #1a1a1a',
          borderRadius: '20px', padding: '32px'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '22px' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div style={{
              background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)',
              borderRadius: '10px', padding: '12px', color: '#ff6b6b',
              fontSize: '13px', marginBottom: '16px'
            }}>{error}</div>
          )}

          {message && (
            <div style={{
              background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '10px', padding: '12px', color: '#4ade80',
              fontSize: '13px', marginBottom: '16px'
            }}>{message}</div>
          )}

          <input
            type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
            style={{ marginBottom: '12px' }}
          />
          <input
            type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: '20px' }}
          />

          <button className="btn"
            style={{ width: '100%', marginBottom: '12px', padding: '14px' }}
            onClick={handleEmailAuth} disabled={loading}>
            {loading ? 'Loading...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>

          <div style={{ textAlign: 'center', color: '#444', fontSize: '13px', marginBottom: '12px' }}>
            or
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', padding: '14px', borderRadius: '10px',
            border: '1px solid #2a2a2a', background: '#1a1a1a',
            color: '#fff', cursor: 'pointer', fontSize: '14px',
            fontFamily: 'Space Grotesk, sans-serif', marginBottom: '20px'
          }}>
            🔵 Continue with Google
          </button>

          <div style={{ textAlign: 'center', color: '#666', fontSize: '13px' }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span style={{ color: '#D4A843', cursor: 'pointer' }}
              onClick={() => { setIsSignup(!isSignup); setError(''); setMessage(''); }}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;








