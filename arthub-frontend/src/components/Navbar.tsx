import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link
          to="/"
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginLeft: 0,
            textDecoration: "none",
          }}
        >
          🎨 ArtHub
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Публичные ссылки */}
          <Link to="/catalog" className="nav-link">
            Каталог
          </Link>
          <Link to="/exhibitions" className="nav-link">
            Выставки
          </Link>

          {token ? (
            <>
              {/* Художник */}
              {userRole === "artist" && (
                <>
                  <Link to="/dashboard" className="nav-link">
                    🎨 Мои картины
                  </Link>
                  <Link to="/requests" className="nav-link">
                    📩 Запросы
                  </Link>
                </>
              )}

              {/* Галерея */}
              {userRole === "gallery" && (
                <>
                  <Link to="/gallery" className="nav-link">
                    🏛️ Мои выставки
                  </Link>
                  <Link to="/gallery/requests" className="nav-link">
                    📩 Заявки
                  </Link>
                </>
              )}

              {/* Коллекционер */}
              {userRole === "collector" && (
                <Link to="/purchases" className="nav-link">
                  💎 Мои покупки
                </Link>
              )}

              {/* Разделитель */}
              <span style={{ color: "#666", margin: "0 8px" }}>|</span>

              {/* Профиль с именем */}
              <Link
                to="/profile"
                className="nav-link"
                style={{ fontWeight: "500" }}
              >
                👤 {userName || "Профиль"}
              </Link>

              {/* Роль (бейдж) */}
              <span
                style={{
                  padding: "4px 10px",
                  background:
                    userRole === "artist"
                      ? "#007bff"
                      : userRole === "gallery"
                        ? "#6f42c1"
                        : userRole === "collector"
                          ? "#28a745"
                          : "#6c757d",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "12px",
                  marginLeft: "4px",
                }}
              >
                {userRole === "artist"
                  ? "Художник"
                  : userRole === "gallery"
                    ? "Галерея"
                    : userRole === "collector"
                      ? "Коллекционер"
                      : "Гость"}
              </span>

              {/* Выход */}
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ marginLeft: "16px", padding: "8px 16px" }}
              >
                🚪 Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Войти
              </Link>
              <Link
                to="/register"
                className="btn btn-success"
                style={{ marginLeft: "12px", padding: "8px 16px" }}
              >
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Стили для навбара */}
      <style>{`
        .nav-link {
          color: white;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.2s;
          font-size: 15px;
        }
        
        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .navbar {
          background: #1a1a1a;
          padding: 12px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      `}</style>
    </nav>
  );
}
