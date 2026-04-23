import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtwork, updateArtwork } from '../services/api';
import ImageUploader from '../components/ImageUploader';

export default function EditArtwork() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    technique: '',
    year: 0,
    width: 0,
    height: 0,
    base_price: 0,
    image_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        const data = await getArtwork(Number(id));
        setForm({
          title: data.title,
          description: data.description,
          technique: data.technique,
          year: data.year,
          width: data.width,
          height: data.height,
          base_price: data.base_price,
          image_url: data.image_url || ''
        });
      } catch {
        alert('Ошибка загрузки');
        navigate('/dashboard');
      } finally {
        setFetchLoading(false);
      }
    };
    loadArtwork();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateArtwork(Number(id), form);
      navigate('/dashboard');
    } catch {
      alert('Ошибка обновления');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '24px' }}>Редактировать произведение</h1>
      
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
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}