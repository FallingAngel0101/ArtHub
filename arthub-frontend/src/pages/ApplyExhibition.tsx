import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyArtworks } from "../services/api";
import api from "../services/api";
import type { Artwork } from "../types";

export default function ApplyExhibition() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyArtworks();
        setArtworks(data.filter((a) => a.status === "published"));
      } catch {
        //тиха
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    try {
      await api.post(`/exhibitions/${id}/apply`, {
        artwork_id: selected,
        message,
        proposed_price: Number(price),
      });
      alert("Заявка отправлена!");
      navigate("/exhibitions");
    } catch {
      alert("Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <div className="form-card">
        <h1 style={{ marginBottom: "24px" }}>Подать заявку на выставку</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Выберите картину</label>
            <select
              value={selected || ""}
              onChange={(e) => setSelected(Number(e.target.value))}
              required
            >
              <option value="">— Выберите —</option>
              {artworks.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Предлагаемая цена (₽)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="50000"
            />
          </div>

          <div className="form-group">
            <label>Сопроводительное письмо</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Опишите почему ваша картина достойна участия..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-block"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Отправить заявку"}
          </button>
        </form>
      </div>
    </div>
  );
}
