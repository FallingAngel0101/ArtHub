import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExhibitions } from "../services/api";
import type { Exhibition } from "../types";

export default function GalleryDashboard() {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExhibitions = async () => {
      try {
        const data = await getExhibitions();
        const token = localStorage.getItem("token");
        if (!token) return;
        const userId = JSON.parse(atob(token.split(".")[1])).user_id;
        const myExhibitions = data.filter((e) => e.gallery_id === userId);
        setExhibitions(myExhibitions);
      } catch {
        // молча
      } finally {
        setLoading(false);
      }
    };
    loadExhibitions();
  }, []);

  if (loading) return <div className="container">Загрузка...</div>;

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Мои выставки</h1>
        <Link to="/exhibitions/create" className="btn btn-success">
          + Создать выставку
        </Link>
      </div>

      {exhibitions.length === 0 ? (
        <p>У вас пока нет выставок</p>
      ) : (
        <div className="card-grid">
          {exhibitions.map((ex) => (
            <div key={ex.id} className="card">
              <div className="card-content">
                <h3 className="card-title">{ex.title}</h3>
                <p style={{ marginBottom: "8px" }}>
                  {new Date(ex.start_date).toLocaleDateString()} —{" "}
                  {new Date(ex.end_date).toLocaleDateString()}
                </p>
                <p style={{ marginBottom: "8px" }}>{ex.location}</p>
                <span
                  style={{
                    padding: "4px 8px",
                    background:
                      ex.status === "active"
                        ? "#28a745"
                        : ex.status === "finished"
                          ? "#6c757d"
                          : "#ffc107",
                    color: "white",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {ex.status === "active"
                    ? "Активна"
                    : ex.status === "finished"
                      ? "Завершена"
                      : "Планируется"}
                </span>
                <Link to={`/gallery/exhibitions/${ex.id}`}>Управление</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
