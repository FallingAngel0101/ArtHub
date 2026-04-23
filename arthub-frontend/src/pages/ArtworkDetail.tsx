import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getArtwork, buyArtwork } from '../services/api';
import type { Artwork } from '../types';

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const loadArtwork = async () => {
      try {
        const data = await getArtwork(Number(id));
        setArtwork(data);
      } catch (err) {
        console.error('Failed to load artwork:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadArtwork();
  }, [id]);

  const handleBuy = async () => {
    if (!artwork) return;
    setBuyLoading(true);
    try {
      const result = await buyArtwork(artwork.id);
      alert(`Покупка успешна! ID документа: ${result.document_id}\nИтоговая цена: ${result.final_price.toLocaleString()} ₽`);
      navigate('/catalog');
    } catch {
      alert('Ошибка покупки. Возможно, картина уже продана или вы не коллекционер.');
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;
  if (!artwork) return <div className="container error">Произведение не найдено</div>;

  return (
    <div className="container">
      <Link to="/catalog" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Назад в каталог
      </Link>
      
      <div className="detail-header">
        <div className="detail-image">
          {artwork.image_url ? (
            <img src={artwork.image_url} alt={artwork.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '🖼️ Изображение отсутствует'
          )}
        </div>
        
        <div className="detail-info">
          <h1 className="detail-title">{artwork.title}</h1>
          <p className="detail-artist">{artwork.artist?.name || 'Неизвестный художник'}</p>
          <p className="detail-price">{artwork.current_price.toLocaleString()} ₽</p>
          
          <p style={{ marginBottom: '20px' }}>{artwork.description}</p>
          
          {/* Кнопка "Купить" показывается только коллекционерам и только для опубликованных картин */}
          {userRole === 'collector' && artwork.status === 'published' && (
            <button 
              onClick={handleBuy} 
              className="btn btn-success" 
              style={{ marginRight: '10px' }}
              disabled={buyLoading}
            >
              {buyLoading ? 'Покупка...' : `Купить за ${artwork.current_price.toLocaleString()} ₽`}
            </button>
          )}
          
          {/* Кнопка "В избранное" (заглушка) */}
          <button className="btn btn-secondary">
            В избранное
          </button>
          
          {/* Статус картины */}
          {artwork.status === 'sold' && (
            <p style={{ marginTop: '16px', color: '#dc3545', fontWeight: 'bold' }}>Продано</p>
          )}
          {artwork.status === 'draft' && (
            <p style={{ marginTop: '16px', color: '#ffc107', fontWeight: 'bold' }}>Черновик (не опубликовано)</p>
          )}
          
          <div className="detail-meta">
            <p><strong>Техника:</strong> {artwork.technique}</p>
            <p><strong>Год:</strong> {artwork.year}</p>
            <p><strong>Размеры:</strong> {artwork.width} × {artwork.height} см</p>
            <p><strong>Базовая цена:</strong> {artwork.base_price.toLocaleString()} ₽</p>
            <p><strong>Статус:</strong> {
              artwork.status === 'published' ? '✅ Опубликовано' : 
              artwork.status === 'draft' ? '📝 Черновик' : 
              '💰 Продано'
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
}