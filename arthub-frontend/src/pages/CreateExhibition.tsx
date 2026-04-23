import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExhibition } from '../services/api';

export default function CreateExhibition() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Добавляем ебучие секунды и таймзону
      const data = {
        ...form,
        start_date: form.start_date + ':00Z',
        end_date: form.end_date + ':00Z'
      };
      
      await createExhibition(data);
      navigate('/gallery');
    } catch (err) {
      console.error('Ошибка создания выставки:', err);
      alert('Ошибка создания выставки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '24px' }}>Создать выставку</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label>Дата начала *</label>
          <input
            type="datetime-local"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Дата окончания *</label>
          <input
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Место проведения *</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Создание...' : 'Создать'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/gallery')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}