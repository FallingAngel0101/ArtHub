import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyArtworks, deleteArtwork, publishArtwork } from '../services/api';
import type { Artwork } from '../types';

export default function Dashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyArtworks = async () => {
      try {
        const data = await getMyArtworks();
        const token = localStorage.getItem('token');
        if (!token) return;
        const userId = JSON.parse(atob(token.split('.')[1])).user_id;
        const myWorks = data.filter(a => a.artist_id === userId);
        setArtworks(myWorks);
      } catch {
        // молча падаем
      } finally {
        setLoading(false);
      }
    };
    
    loadMyArtworks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить картину?')) return;
    try {
      await deleteArtwork(id);
      setArtworks(artworks.filter(a => a.id !== id));
    } catch {
      alert('Ошибка удаления');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishArtwork(id);
      // Перезагружаем список
      const data = await getMyArtworks();
      const token = localStorage.getItem('token');
      if (!token) return;
      const userId = JSON.parse(atob(token.split('.')[1])).user_id;
      const myWorks = data.filter(a => a.artist_id === userId);
      setArtworks(myWorks);
    } catch {
      alert('Ошибка публикации');
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Мои произведения</h1>
        <Link to="/create" className="btn btn-success">
          + Добавить картину
        </Link>
      </div>
      
      {artworks.length === 0 ? (
        <p>У вас пока нет произведений</p>
      ) : (
        <div className="card-grid">
          {artworks.map((artwork) => (
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
                <p className="card-price">{artwork.current_price.toLocaleString()} ₽</p>
                <p>Статус: <strong>{artwork.status}</strong></p>
                
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link to={`/artwork/${artwork.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Просмотр
                  </Link>
                  <Link to={`/edit/${artwork.id}`} className="btn" style={{ padding: '6px 12px', fontSize: '12px', background: '#ffc107' }}>
                    Изменить
                  </Link>
                  {artwork.status === 'draft' && (
                    <button onClick={() => handlePublish(artwork.id)} className="btn btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Опубликовать
                    </button>
                  )}
                  <button onClick={() => handleDelete(artwork.id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}