/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import api from '../services/api';
import type { ExhibitionRequest, Artwork } from '../types';

export default function GalleryRequests() {
  const [requests, setRequests] = useState<ExhibitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null); // Для модалки

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await api.get('/gallery/requests');
        setRequests(response.data);
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const handleRespond = async (id: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/gallery/requests/${id}/respond`, { action });
      const response = await api.get('/gallery/requests');
      setRequests(response.data);
      setSelectedArtwork(null); // Закрываем модалку после ответа
    } catch {
      alert('Ошибка');
    }
  };

  const openArtworkDetail = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
  };

  if (loading) return <div className="container">Загрузка...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="container fade-up">
      <h1 style={{ marginBottom: '24px' }}>Заявки от художников</h1>
      
      {pendingRequests.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Нет новых заявок</p>
      ) : (
        <div className="card-grid">
          {pendingRequests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-image">
                {req.artwork?.image_url ? (
                  <img 
                    src={req.artwork.image_url} 
                    alt={req.artwork.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <span style={{ fontSize: '48px' }}>🖼️</span>
                )}
              </div>
              <div className="card-content">
                <h3 className="card-title">{req.artwork?.title || 'Без названия'}</h3>
                <p className="card-artist">{req.artwork?.artist?.name || 'Неизвестный художник'}</p>
                <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {req.artwork?.technique} | {req.artwork?.year} | {req.artwork?.width}×{req.artwork?.height} см
                </p>
                <p style={{ marginBottom: '8px' }}>Выставка: <strong>{req.exhibition?.title}</strong></p>
                <p style={{ marginBottom: '8px' }}>Предлагаемая цена: <strong>{req.proposed_price?.toLocaleString()} ₽</strong></p>
                {req.message && (
                  <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>
                    «{req.message}»
                  </p>
                )}
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => req.artwork && openArtworkDetail(req.artwork)} 
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    🔍 Рассмотреть
                  </button>
                  <button 
                    onClick={() => handleRespond(req.id, 'accept')} 
                    className="btn btn-success"
                    style={{ flex: 1 }}
                  >
                    ✅ Принять
                  </button>
                  <button 
                    onClick={() => handleRespond(req.id, 'reject')} 
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    ❌ Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДЛЯ ПРОСМОТРА КАРТИНЫ */}
      {selectedArtwork && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => setSelectedArtwork(null)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: 'var(--shadow-xl)',
              padding: '40px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 800 }}>{selectedArtwork.title}</h2>
              <button 
                onClick={() => setSelectedArtwork(null)} 
                className="btn btn-secondary"
                style={{ padding: '8px 16px' }}
              >
                ✕ Закрыть
              </button>
            </div>

            <div style={{ 
              width: '100%', 
              maxHeight: '400px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: 'rgba(124, 58, 237, 0.03)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              marginBottom: '24px'
            }}>
              {selectedArtwork.image_url ? (
                <img 
                  src={selectedArtwork.image_url} 
                  alt={selectedArtwork.title}
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: '80px', padding: '40px' }}>🖼️</span>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ marginBottom: '16px', fontSize: '16px', lineHeight: 1.7 }}>
                {selectedArtwork.description || 'Без описания'}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Техника</p>
                  <p style={{ fontWeight: 600 }}>{selectedArtwork.technique}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Год создания</p>
                  <p style={{ fontWeight: 600 }}>{selectedArtwork.year}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Размеры</p>
                  <p style={{ fontWeight: 600 }}>{selectedArtwork.width} × {selectedArtwork.height} см</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Базовая цена</p>
                  <p style={{ fontWeight: 600 }}>{selectedArtwork.base_price.toLocaleString()} ₽</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* История заявок */}
      {requests.filter(r => r.status !== 'pending').length > 0 && (
        <>
          <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>История заявок</h2>
          {requests.filter(r => r.status !== 'pending').map((req) => (
            <div key={req.id} className="card" style={{ marginBottom: '12px', padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600 }}>{req.artwork?.title} — {req.exhibition?.title}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    Художник: {req.artwork?.artist?.name}
                  </p>
                </div>
                <span className={`card-status ${req.status === 'accepted' ? 'published' : 'sold'}`}>
                  {req.status === 'accepted' ? '✅ Принята' : '❌ Отклонена'}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}