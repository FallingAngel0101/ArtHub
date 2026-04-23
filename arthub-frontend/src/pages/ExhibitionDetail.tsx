import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExhibition } from '../services/api';
import type { Exhibition, Artwork } from '../types';

export default function ExhibitionDetail() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getExhibition(Number(id));
        setExhibition(data.exhibition);
        setArtworks(data.artworks);
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="container">Загрузка...</div>;
  if (!exhibition) return <div className="container error">Выставка не найдена</div>;

  const statusLabel = exhibition.status === 'active' ? '🟢 Активна' :
                      exhibition.status === 'finished' ? '⚫ Завершена' :
                      '🟡 Планируется';

  return (
    <div className="container">
      <Link to="/exhibitions" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Все выставки
      </Link>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{exhibition.title}</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '12px' }}>
          {exhibition.gallery?.name || 'Галерея'}
        </p>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          📅 {new Date(exhibition.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })} 
          — {new Date(exhibition.end_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>
          📍 {exhibition.location}
        </p>
        <span style={{
          padding: '6px 12px',
          background: exhibition.status === 'active' ? '#28a745' : exhibition.status === 'finished' ? '#6c757d' : '#ffc107',
          color: 'white',
          borderRadius: '20px',
          fontSize: '14px'
        }}>
          {statusLabel}
        </span>
      </div>
      
      {exhibition.description && (
        <p style={{ marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>
          {exhibition.description}
        </p>
      )}
      
      {exhibition.status === 'active' && (
        <button className="btn btn-success" style={{ marginBottom: '30px' }}>
          🎫 Купить билет (заглушка)
        </button>
      )}
      
      <h2 style={{ marginBottom: '20px' }}>
        Картины на выставке ({artworks.length})
      </h2>
      
      {artworks.length === 0 ? (
        <p style={{ color: '#666' }}>На этой выставке пока нет картин</p>
      ) : (
        <div className="card-grid">
          {artworks.map((artwork) => (
            <Link 
              to={`/artwork/${artwork.id}`} 
              key={artwork.id} 
              style={{ textDecoration: 'none' }}
            >
              <div className="card">
                <div className="card-image">
                  {artwork.image_url ? (
                    <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    '🖼️'
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{artwork.title}</h3>
                  <p className="card-artist">{artwork.artist?.name || 'Неизвестный художник'}</p>
                  <p className="card-price">{artwork.current_price.toLocaleString()} ₽</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}