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
  const [imgLoaded, setImgLoaded] = useState(false);
  
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
    <div className="container fade-up">
      <Link to="/catalog" style={{ display: 'inline-block', marginBottom: '24px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
        ← Назад в каталог
      </Link>
      
      <div className="detail-header">
        <div 
          className="detail-image"
          style={{
            background: 'rgba(124, 58, 237, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            height: imgLoaded ? 'auto' : '400px',
            maxHeight: '600px',
          }}
        >
          {artwork.image_url ? (
            <img 
              src={artwork.image_url} 
              alt={artwork.title} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                maxHeight: '600px',
              }} 
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <span style={{ fontSize: '80px' }}>🖼️</span>
          )}
        </div>
        
        <div className="detail-info">
          <h1 className="detail-title">{artwork.title}</h1>
          <p className="detail-artist">{artwork.artist?.name || 'Неизвестный художник'}</p>
          <p className="detail-price">{artwork.current_price.toLocaleString()} ₽</p>
          
          <p style={{ marginBottom: '24px', fontSize: '16px', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            {artwork.description}
          </p>
          
          {userRole === 'collector' && artwork.status === 'published' && (
            <button 
              onClick={handleBuy} 
              className="btn btn-success btn-lg" 
              disabled={buyLoading}
            >
              {buyLoading ? 'Покупка...' : `Купить за ${artwork.current_price.toLocaleString()} ₽`}
            </button>
          )}
          
          {artwork.status === 'sold' && (
            <div className="alert alert-error">Эта картина уже продана</div>
          )}
          
          <div className="detail-meta">
            <p><strong>Техника:</strong> {artwork.technique}</p>
            <p><strong>Год:</strong> {artwork.year}</p>
            <p><strong>Размеры:</strong> {artwork.width} × {artwork.height} см</p>
            <p><strong>Базовая цена:</strong> {artwork.base_price.toLocaleString()} ₽</p>
            <p>
              <strong>Статус:</strong>{' '}
              <span className={`card-status ${artwork.status}`}>
                {artwork.status === 'published' ? 'Опубликовано' : 
                 artwork.status === 'draft' ? 'Черновик' : 'Продано'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}