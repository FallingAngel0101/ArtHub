import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtwork } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function CreateArtwork() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    technique: '',
    year: new Date().getFullYear(),
    width: 0,
    height: 0,
    base_price: 0,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createArtwork(form);
      navigate('/dashboard');
    } catch {
      alert('Ошибка создания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '24px' }}>Добавить произведение</h1>
      
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
          <label>Техника</label>
          <input
            type="text"
            value={form.technique}
            onChange={(e) => setForm({ ...form, technique: e.target.value })}
            placeholder="Масло, акрил, акварель..."
          />
        </div>
        
        <div className="form-group">
          <label>Год создания</label>
          <input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Ширина (см)</label>
            <input
              type="number"
              step="0.1"
              value={form.width}
              onChange={(e) => setForm({ ...form, width: Number(e.target.value) })}
            />
          </div>
          
          <div className="form-group">
            <label>Высота (см)</label>
            <input
              type="number"
              step="0.1"
              value={form.height}
              onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Базовая цена (₽) *</label>
          <input
            type="number"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
            required
            min="0"
          />
        </div>
        
        {/* Заменили URL на загрузку изображений */}
        <div className="form-group">
          <label>Изображение</label>
          <ImageUploader
            currentImage={form.image_url}
            onUpload={(url) => setForm({ ...form, image_url: url })}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Создание...' : 'Создать'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}