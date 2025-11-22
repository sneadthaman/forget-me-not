import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password_hash: '' });

  useEffect(() => {
    getUsers().then(res => setUsers(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await createUser(form);
    setUsers([...users, res.data]);
    setForm({ name: '', email: '', password_hash: '' });
  };

  const handleDelete = async id => {
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
        <input name="password_hash" value={form.password_hash} onChange={handleChange} placeholder="Password Hash" required />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleDelete(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
