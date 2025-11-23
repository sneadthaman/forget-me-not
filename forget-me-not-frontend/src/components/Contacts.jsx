import { useEffect, useState } from 'react';
import { getContacts, createContact, deleteContact } from '../api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    name: '', relationship: '', address_line1: '', city: '', state: '', postal_code: '', country: '', email: ''
  });

  useEffect(() => {
    getContacts()
      .then(res => setContacts(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load contacts. Ensure token is set and backend is running.');
      });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await createContact(form);
    setContacts([...contacts, res.data]);
    setForm({ name: '', relationship: '', address_line1: '', city: '', state: '', postal_code: '', country: '', email: '' });
  };

  const handleDelete = async id => {
    await deleteContact(id);
    setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div>
      <h2>Contacts</h2>
      <form onSubmit={handleSubmit}>
        <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="User ID" required />
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="relationship" value={form.relationship} onChange={handleChange} placeholder="Relationship" required />
        <input name="address_line1" value={form.address_line1} onChange={handleChange} placeholder="Address Line 1" required />
        <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State" required />
        <input name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="Postal Code" required />
        <input name="country" value={form.country} onChange={handleChange} placeholder="Country" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <button type="submit">Add Contact</button>
      </form>
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>
            {contact.name} ({contact.relationship})
            <button onClick={() => handleDelete(contact.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
