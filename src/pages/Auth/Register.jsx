import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function Register() {
  const { signUp } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validations, setValidations] = useState({
    password: {
      length: false,
      match: false,
    },
  });

  const from = location.state?.from?.pathname || '/category';

  // Handle Caps Lock detection
  // Handle Caps Lock detection
  useEffect(() => {
  const handleKeyDown = (e) => {
      if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockOn(true);
      }
  };

  const handleKeyUp = (e) => {
      if (e.getModifierState && !e.getModifierState('CapsLock')) {
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

  // Live password validation
  useEffect(() => {
    setValidations({
      password: {
        length: form.password.length >= 8,
        match: form.password === form.confirmPassword,
      },
    });
  }, [form.password, form.confirmPassword]);

  const mapFirebaseError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

  // Validate
  if (!validations.password.length) {
    setError('Password must be at least 8 characters');
    return;
  }
  if (!validations.password.match) {
    setError('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    await signUp(form.email, form.password);
    setError('Check your inbox for a verification email, then log in.');
    setTimeout(() => navigate('/login', { replace: true }), 1200);
  } catch (err) {
    console.error('Registration error:', err);
    setError(mapFirebaseError(err.code));
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="mt-2 text-slate-600">Join us for a better shopping experience</p>
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
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="input"
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className="input pr-10"
                placeholder="••••••••"
                aria-describedby="password-requirements"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div
              id="password-requirements"
              className="mt-1 text-sm space-y-1"
            >
              <p
                className={
                  validations.password.length
                    ? 'text-green-600'
                    : 'text-slate-500'
                }
              >
                {validations.password.length ? '✓' : '○'} At least 8 characters
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              aria-describedby="confirm-password-status"
            />
            {form.confirmPassword && (
              <p
                id="confirm-password-status"
                className={`mt-1 text-sm ${
                  validations.password.match
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {validations.password.match
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {capsLockOn && (
            <p className="text-amber-600 text-sm">Caps Lock is on</p>
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
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-red-600 hover:text-red-700"
          >
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}