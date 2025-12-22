import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { PASSWORD, STORAGE_KEY } from './PasswordGate';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the password gate by default', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Enter password to continue/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders the KPI dashboard heading after unlock', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/password/i), PASSWORD);
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    expect(
      screen.getByRole('heading', { name: /Active Focus & Key Performance Indicators/i })
    ).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  it('shows an error for the wrong password', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/password/i), 'nope');
    await user.click(screen.getByRole('button', { name: /unlock/i }));

    expect(screen.getByText(/Wrong password/i)).toBeInTheDocument();
  });

  it('skips the gate when already unlocked', () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /Active Focus & Key Performance Indicators/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });
});
