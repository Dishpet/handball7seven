import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import logo from '@/assets/logo.png';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (user) return <Navigate to="/" replace />;

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
      const { error } = await signUp(email, password, fullName);
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
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
