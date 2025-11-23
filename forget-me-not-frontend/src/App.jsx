
import Users from './components/Users';
import Contacts from './components/Contacts';
import Occasions from './components/Occasions';
import CardJobs from './components/CardJobs';
import { useEffect, useState } from 'react';
import { loadStoredToken, setAuthToken, login } from './api';

function App() {
  const [page, setPage] = useState('users');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = loadStoredToken();
    if (stored) setToken(stored);
  }, []);

  const handleSaveToken = () => {
    setAuthToken(token.trim());
  };

  const handleLogin = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await login(email, password);
      setToken(res.data.token);
      setAuthToken(res.data.token);
    } catch (err) {
      console.error(err);
      setError('Login failed. Check credentials and server.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 960, margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Forget Me Not Frontend</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Bearer token"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleSaveToken}>Save Token</button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          style={{ flex: 1, padding: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={handleLogin} disabled={busy}>Login</button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <small style={{ display: 'block', marginBottom: 16 }}>
        Use login to fetch a JWT (password matches stored password_hash). You can also paste an existing token.
      </small>
      <nav style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <button onClick={() => setPage('users')}>Users</button>
        <button onClick={() => setPage('contacts')}>Contacts</button>
        <button onClick={() => setPage('occasions')}>Occasions</button>
        <button onClick={() => setPage('cardJobs')}>Card Jobs</button>
      </nav>
      {page === 'users' && <Users />}
      {page === 'contacts' && <Contacts />}
      {page === 'occasions' && <Occasions />}
      {page === 'cardJobs' && <CardJobs />}
    </div>
  );
}

export default App;
