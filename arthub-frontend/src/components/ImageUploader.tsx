import { useState, useRef, useEffect } from 'react';

interface Props {
  onUpload: (url: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onUpload, currentImage }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // При загрузке existing URL — определяем пропорции
  useEffect(() => {
    if (currentImage) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = currentImage;
    }
  }, [currentImage]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, GIF');
      return;
    }

    // Показываем превью и определяем размеры
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      
      // Узнаём реальные размеры
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);

    // Загружаем на сервер
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      onUpload(data.url);
    } catch {
      alert('Ошибка загрузки изображения');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setImageSize(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Рассчитываем пропорции контейнера
  const containerStyle: React.CSSProperties = preview && imageSize
    ? {
        width: '100%',
        maxWidth: '600px',
        aspectRatio: `${imageSize.width} / ${imageSize.height}`,
        maxHeight: '400px',
      }
    : {
        width: '100%',
        height: '240px',
      };

  return (
    <div>
      <div
        className={`upload-zone ${preview ? 'has-image' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        style={containerStyle}
      >
        {uploading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <p>Загрузка...</p>
          </div>
        ) : preview ? (
          <img
            ref={imgRef}
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',  // ← было 'cover', стало 'contain'
              borderRadius: 'var(--radius)',
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🖼️</p>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Нажмите для загрузки</p>
            <p style={{ fontSize: '12px' }}>JPG, PNG, WEBP, GIF до 10MB</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="btn btn-danger"
          style={{ marginTop: '12px', width: '100%' }}
        >
          Удалить изображение
        </button>
      )}
    </div>
  );
}