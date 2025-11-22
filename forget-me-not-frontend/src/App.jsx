
import Users from './components/Users';
import Contacts from './components/Contacts';
import Occasions from './components/Occasions';
import { useState } from 'react';

function App() {
  const [page, setPage] = useState('users');

  return (
    <div style={{ padding: 20 }}>
      <h1>Forget Me Not Frontend</h1>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setPage('users')}>Users</button>
        <button onClick={() => setPage('contacts')}>Contacts</button>
        <button onClick={() => setPage('occasions')}>Occasions</button>
      </nav>
      {page === 'users' && <Users />}
      {page === 'contacts' && <Contacts />}
      {page === 'occasions' && <Occasions />}
    </div>
  );
}

export default App;
