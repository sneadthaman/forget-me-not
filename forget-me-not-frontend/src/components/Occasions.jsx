import { useEffect, useState } from 'react';
import { getOccasions, createOccasion, deleteOccasion } from '../api';

export default function Occasions() {
  const [occasions, setOccasions] = useState([]);
  const [form, setForm] = useState({
    user_id: '', contact_id: '', occasion_type: '', custom_label: '', date: '', lead_time_days: '', tone_preference: ''
  });

  useEffect(() => {
    getOccasions().then(res => setOccasions(res.data));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await createOccasion(form);
    setOccasions([...occasions, res.data]);
    setForm({ user_id: '', contact_id: '', occasion_type: '', custom_label: '', date: '', lead_time_days: '', tone_preference: '' });
  };

  const handleDelete = async id => {
    await deleteOccasion(id);
    setOccasions(occasions.filter(o => o.id !== id));
  };

  return (
    <div>
      <h2>Occasions</h2>
      <form onSubmit={handleSubmit}>
        <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="User ID" required />
        <input name="contact_id" value={form.contact_id} onChange={handleChange} placeholder="Contact ID" required />
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
