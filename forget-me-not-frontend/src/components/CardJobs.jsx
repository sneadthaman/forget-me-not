import { useEffect, useState } from 'react';
import { getCardJobs, getCardJob, triggerCardJobAction, updateCardJob } from '../api';

export default function CardJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCardJobs();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load card jobs. Check token/backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statuses = Array.from(new Set(jobs.map(j => j.status).filter(Boolean)));
  const filtered = statusFilter === 'all' ? jobs : jobs.filter(j => j.status === statusFilter);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetailError('');
    setDetailLoading(true);
    try {
      const res = await getCardJob(id);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
      setDetailError('Failed to load card job detail.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelected(null);
    setDetailError('');
  };

  const doAction = async (action) => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetailError('');
    try {
      await triggerCardJobAction(selectedId, action);
      const res = await getCardJob(selectedId);
      setSelected(res.data);
    } catch (err) {
      console.error(err);
      setDetailError('Action failed. Check backend logs.');
    } finally {
      setDetailLoading(false);
    }
  };

  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (selected?.message_text !== undefined) {
      setEditText(selected.message_text);
    }
  }, [selected?.message_text]);

  const saveText = async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetailError('');
    try {
      const res = await updateCardJob(selectedId, { message_text: editText });
      setSelected(res.data);
    } catch (err) {
      console.error(err);
      setDetailError('Failed to save text.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <h2>Card Jobs</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={load} disabled={loading}>Refresh</button>
        </div>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {loading && <div>Loading...</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map(job => (
          <div
            key={job.id}
            onClick={() => openDetail(job.id)}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, background: '#fff', cursor: 'pointer' }}
          >
            <div style={{ fontWeight: 600 }}>{job.status || 'unknown'}</div>
            <div style={{ fontSize: 12, color: '#666', margin: '4px 0' }}>{job.id}</div>
            {job.message_text && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600 }}>Message</div>
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{job.message_text}</p>
              </div>
            )}
            {job.front_art_url && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600 }}>Front Art</div>
                <img src={job.front_art_url} alt="Front art" style={{ width: '100%', borderRadius: 6 }} />
              </div>
            )}
            {job.pdf_url && (
              <div style={{ marginTop: 8 }}>
                <a href={job.pdf_url} target="_blank" rel="noreferrer">View PDF</a>
              </div>
            )}
          </div>
        ))}
      </div>
      {!loading && !filtered.length && <div>No card jobs match this filter.</div>}
      {selectedId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', color: '#000', padding: 20, borderRadius: 8, width: 'min(90vw, 640px)', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Card Job Detail</h3>
              <button onClick={closeDetail}>Close</button>
            </div>
            {detailLoading && <div>Loading...</div>}
            {detailError && <div style={{ color: 'red' }}>{detailError}</div>}
            {selected && (
              <div style={{ display: 'grid', gap: 8 }}>
                <div><strong>ID:</strong> {selected.id}</div>
                <div><strong>Status:</strong> {selected.status}</div>
                <div>
                  <strong>Message:</strong><br />
                  <textarea
                    value={editText ?? ''}
                    onChange={e => setEditText(e.target.value)}
                    rows={4}
                    style={{ width: '100%', padding: 8 }}
                  />
                  <button onClick={saveText} disabled={detailLoading} style={{ marginTop: 6 }}>Save Text</button>
                </div>
                <div><strong>Front Art:</strong><br />{selected.front_art_url ? <img src={selected.front_art_url} alt="Front art" style={{ width: '100%', borderRadius: 6 }} /> : '—'}</div>
                <div><strong>PDF:</strong><br />{selected.pdf_url ? <a href={selected.pdf_url} target="_blank" rel="noreferrer">View PDF</a> : '—'}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button onClick={() => doAction('generate_text')} disabled={detailLoading}>Re-run Text</button>
                  <button onClick={() => doAction('generate_front_art')} disabled={detailLoading}>Re-run Art</button>
                  <button onClick={() => doAction('assemble_card_pdf')} disabled={detailLoading}>Rebuild PDF</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
