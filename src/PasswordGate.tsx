import { useState } from 'react';

export const STORAGE_KEY = 'kpi-app:unlocked';
export const PASSWORD = 'flour';

type PasswordGateProps = {
  children: React.ReactNode;
};

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isUnlocked, setIsUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsUnlocked(true);
      setError('');
      setPassword('');
      return;
    }

    setError('Wrong password. Please try again.');
  };

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="kpi-password-gate">
      <h1>Enter password to continue</h1>
      <p>This page is protected. Please enter the password to unlock.</p>
      <form onSubmit={handleSubmit} className="kpi-password-form">
        <label className="kpi-password-label" htmlFor="kpi-password-input">
          Password
        </label>
        <input
          id="kpi-password-input"
          className="kpi-password-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          autoFocus
        />
        {error ? <div className="kpi-password-error">{error}</div> : null}
        <button className="kpi-password-submit" type="submit">
          Unlock
        </button>
      </form>
    </div>
  );
};

export default PasswordGate;
