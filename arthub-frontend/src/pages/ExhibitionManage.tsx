import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExhibition } from '../services/api';
import type { Exhibition, Artwork } from '../types';

export default function ExhibitionManage() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [exhibitionArtworks, setExhibitionArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const exhData = await getExhibition(Number(id));
        setExhibition(exhData.exhibition);
        setExhibitionArtworks(exhData.artworks);
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

  return (
    <div className="container">
      <Link to="/gallery" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Назад в галерею
      </Link>
      
      <h1>{exhibition.title}</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        {new Date(exhibition.start_date).toLocaleDateString()} — {new Date(exhibition.end_date).toLocaleDateString()} | {exhibition.location}
      </p>
      
      <h2 style={{ marginBottom: '16px' }}>Картины на выставке ({exhibitionArtworks.length})</h2>
      
      {exhibitionArtworks.length === 0 ? (
        <p>На выставке пока нет картин. Ожидайте заявки от художников.</p>
      ) : (
        <div className="card-grid">
          {exhibitionArtworks.map((artwork) => (
            <div key={artwork.id} className="card">
              <div className="card-image">
                {artwork.image_url ? (
                  <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  '🖼️'
                )}
              </div>
              <div className="card-content">
                <h3 className="card-title">{artwork.title}</h3>
                <p className="card-artist">{artwork.artist?.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}