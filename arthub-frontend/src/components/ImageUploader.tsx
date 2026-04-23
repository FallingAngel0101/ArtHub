import { useState, useRef } from 'react';

interface Props {
  onUpload: (url: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onUpload, currentImage }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем размер (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 10MB');
      return;
    }

    // Проверяем тип
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Неподдерживаемый формат. Разрешены: JPG, PNG, WEBP, GIF');
      return;
    }

    // Превью
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Загружаем на сервер
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/upload', {
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
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          height: '200px',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
          background: '#f9f9f9',
          transition: 'border-color 0.2s',
          position: 'relative'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#007bff')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ddd')}
      >
        {uploading ? (
          <p>Загрузка...</p>
        ) : preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#999' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>🖼️</p>
            <p>Нажмите для загрузки изображения</p>
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
          style={{ marginTop: '8px', width: '100%' }}
        >
          Удалить изображение
        </button>
      )}
    </div>
  );
}