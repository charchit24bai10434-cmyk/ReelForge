import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! You are now logged in 🎉');
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
      options: { redirectTo: 'https://reel-forge-beta.vercel.app' }
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Animated background glow */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.12) 0%, transparent 70%)',
          animation: 'float1 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)',
          animation: 'float2 10s ease-in-out infinite',
        }} />

        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: '#D4A843',
            opacity: 0.3,
            animation: `particle ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.05); }
        }
        @keyframes particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          50% { transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px); opacity: 0.6; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 14px !important;
          padding: 16px 18px !important;
          color: #fff !important;
          font-size: 15px !important;
          outline: none !important;
          font-family: 'Space Grotesk', sans-serif !important;
          margin-bottom: 12px !important;
          transition: all 0.3s ease !important;
          box-sizing: border-box !important;
        }
        .login-input:focus {
          border-color: rgba(212,168,67,0.5) !important;
          background: rgba(212,168,67,0.04) !important;
          box-shadow: 0 0 0 3px rgba(212,168,67,0.1) !important;
        }
        .login-input::placeholder { color: #444 !important; }
        .login-btn {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #D4A843, #F8D97A, #D4A843);
          background-size: 200% auto;
          color: #000;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          margin-bottom: 12px;
          transition: all 0.3s ease;
          animation: shimmer 3s linear infinite;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,168,67,0.4);
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .google-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          margin-bottom: 20px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-2px);
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '440px', padding: '20px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
        position: 'relative', zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '42px', fontWeight: '800',
            background: 'linear-gradient(135deg, #D4A843, #F8D97A, #D4A843)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-2px', marginBottom: '8px',
            animation: 'shimmer 3s linear infinite',
          }}>ReelForge</div>
          <div style={{
            color: '#555', fontSize: '12px',
            letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '600'
          }}>AI Creator Studio</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14,14,14,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '24px', padding: '36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,67,0.05)',
        }}>

          {/* Tab switcher */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px', padding: '4px', marginBottom: '28px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button key={tab} onClick={() => { setIsSignup(i === 1); setError(''); setMessage(''); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: isSignup === (i === 1) ? 'linear-gradient(135deg, #D4A843, #F8D97A)' : 'transparent',
                  color: isSignup === (i === 1) ? '#000' : '#666',
                  fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'all 0.3s ease',
                }}>
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,50,50,0.08)', border: '1px solid rgba(255,50,50,0.2)',
              borderRadius: '12px', padding: '14px', color: '#ff6b6b',
              fontSize: '13px', marginBottom: '16px', textAlign: 'center'
            }}>⚠️ {error}</div>
          )}

          {message && (
            <div style={{
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '12px', padding: '14px', color: '#4ade80',
              fontSize: '13px', marginBottom: '16px', textAlign: 'center'
            }}>✅ {message}</div>
          )}

          <input className="login-input" type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />

          <input className="login-input" type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />

          <button className="login-btn" onClick={handleEmailAuth} disabled={loading}>
            {loading ? '⏳ Please wait...' : (isSignup ? '🚀 Create Account' : '⚡ Sign In')}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#333', fontSize: '12px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <button className="google-btn" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', color: '#444', fontSize: '12px' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <span style={{ color: '#D4A843', cursor: 'pointer', fontWeight: '600' }}
              onClick={() => { setIsSignup(!isSignup); setError(''); setMessage(''); }}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#2a2a2a', fontSize: '11px' }}>
          By continuing you agree to our Terms of Service
        </div>
      </div>
    </div>
  );
}

export default Login;
