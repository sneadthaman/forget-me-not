import { useEffect, useState } from 'react';
import { getOccasions, createOccasion, deleteOccasion, getContacts } from '../api';

export default function Occasions() {
  const [occasions, setOccasions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({
    contact_id: '', occasion_type: '', custom_label: '', date: '', lead_time_days: '', tone_preference: ''
  });

  useEffect(() => {
    getOccasions()
      .then(res => setOccasions(res.data))
      .catch(err => {
        console.error(err);
        alert('Failed to load occasions. Ensure token is set and backend is running.');
      });
    getContacts()
      .then(res => setContacts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await createOccasion(form);
    setOccasions([...occasions, res.data]);
    setForm({ contact_id: '', occasion_type: '', custom_label: '', date: '', lead_time_days: '', tone_preference: '' });
  };

  const handleDelete = async id => {
    await deleteOccasion(id);
    setOccasions(occasions.filter(o => o.id !== id));
  };

  return (
    <div>
      <h2>Occasions</h2>
      <form onSubmit={handleSubmit}>
        <select name="contact_id" value={form.contact_id} onChange={handleChange} required>
          <option value="">Select contact</option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input name="occasion_type" value={form.occasion_type} onChange={handleChange} placeholder="Occasion Type" required />
        <input name="custom_label" value={form.custom_label} onChange={handleChange} placeholder="Custom Label" />
        <input name="date" value={form.date} onChange={handleChange} placeholder="Date (YYYY-MM-DD)" required />
        <input name="lead_time_days" value={form.lead_time_days} onChange={handleChange} placeholder="Lead Time Days" />
        <input name="tone_preference" value={form.tone_preference} onChange={handleChange} placeholder="Tone Preference" />
        <button type="submit">Add Occasion</button>
      </form>
      <ul>
        {occasions.map(occasion => (
          <li key={occasion.id}>
            {occasion.occasion_type} ({occasion.date})
            <button onClick={() => handleDelete(occasion.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
