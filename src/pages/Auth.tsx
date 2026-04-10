import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { lovable } from '@/integrations/lovable/index';
import logo from '@/assets/logo.png';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (user) return <Navigate to="/" replace />;

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) setError(error.message || "Google sign-in failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate('/');
    } else {
      const { error } = await signUp(email, password, fullName, phone);
      if (error) setError(error.message);
      else setMessage('Check your email to confirm your account.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-[100svh] bg-background flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img src={logo} alt="Handball Seven" className="h-10 sm:h-12 mx-auto mb-6" />
          <h1 className="text-xl sm:text-2xl font-display uppercase tracking-widest">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
        </div>

        {/* Google Sign In - temporarily disabled
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 border border-border bg-card text-foreground font-body text-sm py-3 px-4 hover:bg-muted transition-colors min-h-[48px]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs font-display uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        */}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-muted-foreground text-xs font-display uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-card border border-border text-foreground p-3 focus:outline-none focus:border-primary transition-colors font-body min-h-[48px]"
                  required
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-xs font-display uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+385..."
                  className="w-full bg-card border border-border text-foreground p-3 focus:outline-none focus:border-primary transition-colors font-body min-h-[48px]"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-muted-foreground text-xs font-display uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-card border border-border text-foreground p-3 focus:outline-none focus:border-primary transition-colors font-body min-h-[48px]"
              required
            />
          </div>
          <div>
            <label className="block text-muted-foreground text-xs font-display uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-card border border-border text-foreground p-3 focus:outline-none focus:border-primary transition-colors font-body min-h-[48px]"
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-destructive text-sm font-body">{error}</p>}
          {message && <p className="text-primary text-sm font-body">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50 min-h-[48px]"
          >
            {submitting ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-muted-foreground text-sm font-body">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }} className="text-primary hover:underline py-1">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
