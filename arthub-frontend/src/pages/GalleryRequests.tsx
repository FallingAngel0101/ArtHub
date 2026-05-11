/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import api from '../services/api';
import type { ExhibitionRequest, Artwork } from '../types';
import type { Message } from '../types';

export default function GalleryRequests() {
  const [requests, setRequests] = useState<ExhibitionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  
  // Чат
  const [chatRequest, setChatRequest] = useState<ExhibitionRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Модалка ответа
  const [respondModal, setRespondModal] = useState<{ request: ExhibitionRequest; action: 'accept' | 'reject' } | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Автообновление чата
  useEffect(() => {
    if (!chatRequest) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/requests/${chatRequest.id}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch {
        //молча
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chatRequest]);

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

  const openArtworkDetail = (artwork: Artwork) => setSelectedArtwork(artwork);

  const openChat = async (req: ExhibitionRequest) => {
    setChatRequest(req);
    try {
      const res = await api.get(`/requests/${req.id}/messages`);
      setMessages(res.data);
    } catch { setMessages([]); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRequest) return;
    try {
      await api.post(`/requests/${chatRequest.id}/messages`, { text: newMessage });
      const res = await api.get(`/requests/${chatRequest.id}/messages`);
      setMessages(res.data);
      setNewMessage('');
    } catch { alert('Ошибка отправки'); }
  };

  const openRespondModal = (request: ExhibitionRequest, action: 'accept' | 'reject') => {
    setRespondModal({ request, action });
    setFeedbackText('');
    setRejectReason('');
  };

  const submitResponse = async () => {
    if (!respondModal) return;
    const { request, action } = respondModal;
    try {
      await api.post(`/gallery/requests/${request.id}/respond`, {
        action,
        reject_reason: action === 'reject' ? rejectReason : '',
        feedback: feedbackText
      });
      setRespondModal(null);
      const response = await api.get('/gallery/requests');
      setRequests(response.data);
    } catch { alert('Ошибка'); }
  };

  // Генерация договора аренды
  const handleGenerateRentContract = async (requestId: number) => {
    try {
      const res = await api.post(`/documents/rent/${requestId}`);
      window.open(res.data.url, '_blank');
    } catch { alert('Ошибка генерации договора'); }
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
                  <button onClick={() => req.artwork && openArtworkDetail(req.artwork)} className="btn btn-outline" style={{ flex: 1 }}>
                    🔍 Рассмотреть
                  </button>
                  <button onClick={() => openChat(req)} className="btn btn-outline" style={{ flex: 1 }}>
                    💬 Чат
                  </button>
                  <button onClick={() => openRespondModal(req, 'accept')} className="btn btn-success" style={{ flex: 1 }}>
                    ✅ Принять
                  </button>
                  <button onClick={() => openRespondModal(req, 'reject')} className="btn btn-danger" style={{ flex: 1 }}>
                    ❌ Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛКА ПРОСМОТРА КАРТИНЫ */}
      {selectedArtwork && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setSelectedArtwork(null)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: 'var(--shadow-xl)', padding: '40px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{selectedArtwork.title}</h2>
              <button onClick={() => setSelectedArtwork(null)} className="btn btn-secondary">✕ Закрыть</button>
            </div>
            <div style={{ width: '100%', maxHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124, 58, 237, 0.03)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '24px' }}>
              {selectedArtwork.image_url ? <img src={selectedArtwork.image_url} alt={selectedArtwork.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} /> : <span style={{ fontSize: '80px', padding: '40px' }}>🖼️</span>}
            </div>
            <div>
              <p>{selectedArtwork.description || 'Без описания'}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><p>Техника</p><p>{selectedArtwork.technique}</p></div>
                <div><p>Год</p><p>{selectedArtwork.year}</p></div>
                <div><p>Размеры</p><p>{selectedArtwork.width} × {selectedArtwork.height} см</p></div>
                <div><p>Базовая цена</p><p>{selectedArtwork.base_price.toLocaleString()} ₽</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ОТВЕТА (Принять/Отклонить) */}
      {respondModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setRespondModal(null)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '100%', padding: '40px' }} onClick={e => e.stopPropagation()}>
            <h2>{respondModal.action === 'accept' ? 'Принять заявку' : 'Отклонить заявку'}</h2>
            <p>Картина: {respondModal.request.artwork?.title}</p>
            <p>Художник: {respondModal.request.artwork?.artist?.name}</p>

            {respondModal.action === 'reject' && (
              <div className="form-group">
                <label>Причина отказа</label>
                <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} required>
                  <option value="">— Выберите —</option>
                  <option value="content">Неприемлемый контент</option>
                  <option value="style">Не подходит по стилю</option>
                  <option value="price">Не сошлись в цене</option>
                  <option value="quality">Недостаточное качество</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>{respondModal.action === 'accept' ? 'Комментарий' : 'Подробный фидбек'}</label>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={submitResponse} className={`btn ${respondModal.action === 'accept' ? 'btn-success' : 'btn-danger'}`}>
                {respondModal.action === 'accept' ? '✅ Принять' : '❌ Отклонить'}
              </button>
              <button onClick={() => setRespondModal(null)} className="btn btn-secondary">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА ЧАТА */}
      {chatRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }} onClick={() => setChatRequest(null)}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', maxWidth: '600px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h2>Чат по заявке</h2>
            <p>Картина: {chatRequest.artwork?.title}</p>
            
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-sm)', padding: '12px', margin: '12px 0', minHeight: '250px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ marginBottom: '8px', textAlign: m.sender_id === chatRequest.gallery_id ? 'right' : 'left' }}>
                  <strong>{m.sender_id === chatRequest.gallery_id ? 'Галерея' : 'Художник'}:</strong> {m.text}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Введите сообщение..." className="form-group" style={{ flex: 1, marginBottom: 0 }} />
              <button onClick={sendMessage} className="btn btn-primary">Отправить</button>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {req.status === 'accepted' && (
                    <button 
                      onClick={() => handleGenerateRentContract(req.id)} 
                      className="btn btn-outline"
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                    >
                      📄 Договор
                    </button>
                  )}
                  <span className={`card-status ${req.status === 'accepted' ? 'published' : 'sold'}`}>
                    {req.status === 'accepted' ? '✅ Принята' : '❌ Отклонена'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}