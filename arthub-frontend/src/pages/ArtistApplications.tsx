import { useState, useEffect } from "react";
import api from "../services/api";
import type { ExhibitionRequest, Message } from "../types";

export default function ArtistApplications() {
  const [requests, setRequests] = useState<ExhibitionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Чат
  const [chatRequest, setChatRequest] = useState<ExhibitionRequest | null>(
    null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!chatRequest) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/requests/${chatRequest.id}/messages`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch {
        // молча
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [chatRequest]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/my-applications");
        setRequests(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openChat = async (req: ExhibitionRequest) => {
    setChatRequest(req);
    setMessages([]);
    try {
      const res = await api.get(`/requests/${req.id}/messages`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch {
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatRequest) return;
    try {
      await api.post(`/requests/${chatRequest.id}/messages`, {
        text: newMessage,
      });
      const res = await api.get(`/requests/${chatRequest.id}/messages`);
      setMessages(res.data);
      setNewMessage("");
    } catch {
      alert("Ошибка отправки");
    }
  };

  if (loading) return <div className="container">Загрузка...</div>;

  const reasonLabels: Record<string, string> = {
    content: "Неприемлемый контент",
    style: "Не подходит по стилю",
    price: "Не сошлись в цене",
    quality: "Недостаточное качество",
    other: "Другая причина",
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "accepted":
        return "✅ Принято";
      case "rejected":
        return "❌ Отклонено";
      default:
        return "⏳ На рассмотрении";
    }
  };

  return (
    <div className="container fade-up">
      <h1>Мои заявки</h1>
      {requests.length === 0 ? (
        <p>Вы ещё не подавали заявки</p>
      ) : (
        <div className="card-grid">
          {requests.map((req) => (
            <div key={req.id} className="card">
              <div className="card-content">
                <h3>{req.artwork?.title}</h3>
                <p>Выставка: {req.exhibition?.title}</p>
                <span
                  className={`card-status ${req.status === "accepted" ? "published" : req.status === "rejected" ? "sold" : "draft"}`}
                >
                  {statusLabel(req.status)}
                </span>
                {req.reject_reason && (
                  <p style={{ marginTop: "8px", color: "var(--danger)" }}>
                    Причина:{" "}
                    {reasonLabels[req.reject_reason] || req.reject_reason}
                  </p>
                )}
                {req.feedback && (
                  <p style={{ marginTop: "4px", fontStyle: "italic" }}>
                    «{req.feedback}»
                  </p>
                )}
                <button
                  onClick={() => openChat(req)}
                  className="btn btn-outline"
                  style={{ marginTop: "12px", width: "100%" }}
                >
                  💬 Чат
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* МОДАЛКА ЧАТА */}
      {chatRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px",
          }}
          onClick={() => setChatRequest(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-lg)",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Чат по заявке</h2>
            <p>Картина: {chatRequest.artwork?.title}</p>
            <p>Выставка: {chatRequest.exhibition?.title}</p>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid var(--gray-200)",
                borderRadius: "var(--radius-sm)",
                padding: "12px",
                margin: "12px 0",
                minHeight: "250px",
              }}
            >
              {(messages || []).map((m) => (
                <div
                  key={m.id}
                  style={{
                    marginBottom: "8px",
                    textAlign:
                      m.sender_id === chatRequest.artist_id ? "right" : "left",
                  }}
                >
                  <strong>
                    {m.sender_id === chatRequest.artist_id ? "Вы" : "Галерея"}:
                  </strong>{" "}
                  {m.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button onClick={sendMessage} className="btn btn-primary">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
