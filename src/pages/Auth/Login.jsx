import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function Login() {
  const { signIn, sendPasswordReset } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);

  const from = location.state?.from?.pathname || '/category';

  // Handle Caps Lock detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.getModifierState('CapsLock')) {
        setCapsLockOn(true);
      }
    };

    const handleKeyUp = (e) => {
      if (!e.getModifierState('CapsLock')) {
        setCapsLockOn(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const mapFirebaseError = (code) => {
    switch (code) {
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/user-not-found':
        return 'No account found with that email.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (forgotMode) {
        await sendPasswordReset(email);
        // Show a success message
        alert('Password reset email sent. Please check your inbox.');
        setForgotMode(false);
      } else {
        await signIn(email, password);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            {forgotMode ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="mt-2 text-slate-600">
            {forgotMode
              ? 'Enter your email to receive a reset link'
              : "Let's get you signed in"}
          </p>
        </div>

        {error && (
          <div
            className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              aria-describedby={error ? 'error-message' : undefined}
              autoFocus
            />
          </div>

          {!forgotMode && (
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  aria-describedby={
                    capsLockOn ? 'caps-lock-warning' : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {capsLockOn && (
                <p
                  id="caps-lock-warning"
                  className="mt-1 text-amber-600 text-sm"
                >
                  Caps Lock is on
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⌛</span>
                Please wait...
              </>
            ) : forgotMode ? (
              'Send Reset Link'
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          {!forgotMode ? (
            <>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                className="text-red-600 hover:text-red-700"
              >
                Forgot password?
              </button>
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Create one now
                </Link>
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="text-red-600 hover:text-red-700"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}