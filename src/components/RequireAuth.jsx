// src/components/RequireAuth.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { resendVerificationEmail, refreshVerificationStatus } from '../services/auth';

export default function RequireAuth({ children }) {
  const { isAuthenticated, authLoading, user: ctxUser } = useUser();
  const user = useMemo(() => ctxUser ?? null, [ctxUser]);
  const location = useLocation();
  const navigate = useNavigate();
  const [msg, setMsg] = useState('');
  const refreshTried = useRef(false);

  const from = useMemo(
    () => location.state?.from?.pathname || '/profile',
    [location.state]
  );

  useEffect(() => {
    if (user?.emailVerified) {
      navigate(from, { replace: true });
    }
  }, [user?.emailVerified, from, navigate]); // programmatic redirect when verified [web:178][web:188]

  useEffect(() => {
    const run = async () => {
      if (user && !user.emailVerified && !refreshTried.current) {
        refreshTried.current = true;
        const ok = await refreshVerificationStatus(); // reload + force ID token [web:3][web:27]
        if (ok) {
          setMsg('Verified! Redirecting...');
          navigate(from, { replace: true }); // avoid staying stuck on the gate [web:178][web:188]
        }
      }
    };
    run();
  }, [user, from, navigate]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />; // standard guard [web:206]
  }

  if (user && !user.emailVerified) {
    const handleResend = async () => {
      try {
        await resendVerificationEmail(); // queues verification email [web:3]
        setMsg('Verification email sent. Check your inbox/spam.');
      } catch (e) {
        setMsg(e.message || 'Could not resend. Try again.');
      }
    };

    const handleRefresh = async () => {
      const ok = await refreshVerificationStatus(); // reload + getIdToken(true) [web:27]
      if (ok) {
        setMsg('Verified! Redirecting...');
        navigate(from, { replace: true }); // go to intended page [web:178][web:188]
      } else {
        setMsg('Not verified yet. Click the email link, then try again.');
      }
    };

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Please verify your email</h2>
          <p className="text-sm text-slate-600 mb-4">
            A verification link was sent to your email, click it, then press “I’ve verified” to continue.
          </p>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={handleResend}>Resend verification email</button>
            <button className="btn" onClick={handleRefresh}>I’ve verified</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn" onClick={() => navigate('/profile', { replace: true })}>Go to Profile</button>
          </div>
          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </div>
      </div>
    );
  }

  return children;
}