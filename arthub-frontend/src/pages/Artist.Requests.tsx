/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { ExhibitionRequest } from '../types';

export default function ArtistRequests() {
  const [requests, setRequests] = useState<ExhibitionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data);
    } catch {
      // молча
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRespond = async (id: number, action: 'accept' | 'reject') => {
    try {
      await api.post(`/requests/${id}/respond`, { action });
      await loadRequests();
    } catch {
      alert('Ошибка');
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="container">
      <h1>Входящие запросы</h1>
      
      {pendingRequests.length === 0 ? (
        <p>Нет новых запросов</p>
      ) : (
        <div className="card-grid">
          {pendingRequests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-content">
                <h3>{req.artwork?.title || 'Картина'}</h3>
                <p>Выставка: {req.exhibition?.title || 'Неизвестно'}</p>
                <p>Предлагаемая цена: {req.proposed_price?.toLocaleString()} ₽</p>
                {req.message && <p>Сообщение: {req.message}</p>}
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => handleRespond(req.id, 'accept')} className="btn btn-success">
                    Принять
                  </button>
                  <button onClick={() => handleRespond(req.id, 'reject')} className="btn btn-danger">
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '40px' }}>История запросов</h2>
      {requests.filter(r => r.status !== 'pending').map((req) => (
        <div key={req.id} className="card" style={{ marginBottom: '12px' }}>
          <div className="card-content">
            <p>{req.artwork?.title} — {req.exhibition?.title}</p>
            <p>Статус: {req.status === 'accepted' ? '✅ Принят' : '❌ Отклонён'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}