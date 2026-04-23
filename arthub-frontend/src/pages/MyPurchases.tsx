import { useState, useEffect } from 'react';
import { getMyPurchases } from '../services/api';
import type { Document } from '../types';

export default function MyPurchases() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      try {
        const data = await getMyPurchases();
        setDocuments(data);
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadPurchases();
  }, []);

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <h1>Мои покупки</h1>
      {documents.length === 0 ? (
        <p>У вас пока нет покупок</p>
      ) : (
        <div className="card-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="card">
              <div className="card-content">
                <h3>Документ #{doc.id}</h3>
                <p>Тип: {doc.type}</p>
                <p>Статус: {doc.status === 'signed' ? '✅ Подписан' : '📝 Черновик'}</p>
                <p>Подписан художником: {doc.signed_by_artist ? '✅' : '❌'}</p>
                <p>Подписан галереей: {doc.signed_by_gallery ? '✅' : '❌'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}