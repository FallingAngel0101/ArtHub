import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Artwork } from '../types';

interface Props {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: Props) {
  const [aspectRatio, setAspectRatio] = useState<string>('4 / 3');

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
  };

  return (
    <Link to={`/artwork/${artwork.id}`} style={{ textDecoration: 'none' }}>
      <div className="card">
        <div 
          className="card-image" 
          style={{ 
            aspectRatio,
            height: 'auto',
            minHeight: '200px',
            maxHeight: '350px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {artwork.image_url ? (
            <img 
              src={artwork.image_url} 
              alt={artwork.title} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onLoad={handleImageLoad}
            />
          ) : (
            <span style={{ fontSize: '48px' }}>🖼️</span>
          )}
        </div>
        <div className="card-content">
          <h3 className="card-title">{artwork.title}</h3>
          <p className="card-artist">{artwork.artist?.name || 'Неизвестный художник'}</p>
          <p className="card-price">{artwork.current_price.toLocaleString()} ₽</p>
          <span className={`card-status ${artwork.status}`}>
            {artwork.status === 'published' ? 'Опубликовано' : 
             artwork.status === 'draft' ? 'Черновик' : 'Продано'}
          </span>
        </div>
      </div>
    </Link>
  );
}