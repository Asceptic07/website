import { useEffect, useState } from 'react';
import { getAuth, applyActionCode } from 'firebase/auth';
import { app } from '../../lib/firebase';

export default function EmailAction() {
  const [status, setStatus] = useState('Working...');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oobCode = params.get('oobCode');
    const auth = getAuth(app);

    if (mode === 'verifyEmail' && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => setStatus('Email verified! You can return to the app.'))
        .catch(() => setStatus('Link invalid or expired. Try resending.'));
    } else {
      setStatus('Invalid action.');
    }
  }, []);
  return <div>{status}</div>;
}