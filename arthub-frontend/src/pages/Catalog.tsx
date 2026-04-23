import { useState, useEffect } from 'react';
import { getArtworks } from '../services/api';
import ArtworkCard from '../components/ArtworkCard';
import type { Artwork } from '../types';

export default function Catalog() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const data = await getArtworks();
        setArtworks(data);
      } catch {
        setError('Не удалось загрузить каталог');
      } finally {
        setLoading(false);
      }
    };
    
    loadArtworks();
  }, []); 

  if (loading) return <div className="container">Загрузка...</div>;
  if (error) return <div className="container error">{error}</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Каталог произведений</h1>
      
      {artworks.length === 0 ? (
        <p>Пока нет опубликованных работ</p>
      ) : (
        <div className="card-grid">
          {artworks.map((artwork) => (
            <ArtworkCard key={artwork.id} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}