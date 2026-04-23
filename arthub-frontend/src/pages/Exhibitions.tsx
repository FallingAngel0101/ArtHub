import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExhibitions } from '../services/api';
import type { Exhibition } from '../types';

export default function Exhibitions() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExhibitions = async () => {
      try {
        const data = await getExhibitions();
        setExhibitions(data);
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadExhibitions();
  }, []);

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Выставки</h1>
      
      {exhibitions.length === 0 ? (
        <p>Пока нет выставок</p>
      ) : (
        <div className="card-grid">
          {exhibitions.map((ex) => (
            <div key={ex.id} className="card">
              <div className="card-content">
                <h3 className="card-title">{ex.title}</h3>
                <p style={{ color: '#666', marginBottom: '8px' }}>
                  {ex.gallery?.name || 'Галерея'}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  {new Date(ex.start_date).toLocaleDateString()} — {new Date(ex.end_date).toLocaleDateString()}
                </p>
                <p style={{ marginBottom: '12px' }}>{ex.location}</p>
                <span style={{ 
                  padding: '4px 8px', 
                  background: ex.status === 'active' ? '#28a745' : ex.status === 'finished' ? '#6c757d' : '#ffc107',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  {ex.status === 'active' ? 'Активна' : ex.status === 'finished' ? 'Завершена' : 'Планируется'}
                </span>
                <Link to={`/exhibition/${ex.id}`} className="btn" style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}