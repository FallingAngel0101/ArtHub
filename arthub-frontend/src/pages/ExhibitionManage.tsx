import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getExhibition, getArtworks } from '../services/api';
import api from '../services/api';
import type { Exhibition, Artwork } from '../types';

export default function ExhibitionManage() {
  const { id } = useParams<{ id: string }>();
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [exhibitionArtworks, setExhibitionArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const exhData = await getExhibition(Number(id));
        setExhibition(exhData.exhibition);
        setExhibitionArtworks(exhData.artworks);
        
        const all = await getArtworks();
        setAllArtworks(all.filter(a => a.status === 'published'));
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Вместо прямого добавления — отправляем запрос художнику
  const handleRequestArtwork = async (artworkId: number) => {
    const price = prompt('Предлагаемая цена аренды (₽):', '10000');
    if (!price) return;
    
    const message = prompt('Сообщение художнику:', 'Приглашаем вашу картину на выставку!');
    if (!message) return;

    try {
      await api.post(`/exhibitions/${id}/request`, {
        artwork_id: artworkId,
        proposed_price: Number(price),
        message: message
      });
      alert('Запрос отправлен художнику! Ожидайте ответа.');
    } catch {
      alert('Ошибка отправки запроса');
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;
  if (!exhibition) return <div className="container error">Выставка не найдена</div>;

  const availableArtworks = allArtworks.filter(
    a => !exhibitionArtworks.some(ea => ea.id === a.id)
  );

  return (
    <div className="container">
      <Link to="/gallery" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Назад в галерею
      </Link>
      
      <h1>{exhibition.title}</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        {new Date(exhibition.start_date).toLocaleDateString()} — {new Date(exhibition.end_date).toLocaleDateString()} | {exhibition.location}
      </p>
      
      <h2 style={{ marginBottom: '16px' }}>Картины на выставке</h2>
      
      {exhibitionArtworks.length === 0 ? (
        <p>На выставке пока нет картин</p>
      ) : (
        <div className="card-grid">
          {exhibitionArtworks.map((artwork) => (
            <div key={artwork.id} className="card">
              <div className="card-image">
                {artwork.image_url ? (
                  <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
      
      <h2 style={{ marginTop: '40px', marginBottom: '16px' }}>Запросить картину на выставку</h2>
      
      {availableArtworks.length === 0 ? (
        <p>Нет доступных картин для запроса</p>
      ) : (
        <div className="card-grid">
          {availableArtworks.map((artwork) => (
            <div key={artwork.id} className="card">
              <div className="card-image">
                {artwork.image_url ? (
                  <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '🖼️'
                )}
              </div>
              <div className="card-content">
                <h3 className="card-title">{artwork.title}</h3>
                <p className="card-artist">{artwork.artist?.name}</p>
                <button 
                  onClick={() => handleRequestArtwork(artwork.id)} 
                  className="btn btn-success"
                  style={{ marginTop: '12px', width: '100%' }}
                >
                  Запросить на выставку
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}