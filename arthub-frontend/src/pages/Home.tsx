import { Link } from "react-router-dom";

export default function Home() {
  const token = localStorage.getItem("token");

  return (
    <div>
      <div
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "white",
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <div className="hero">
          <div
            style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px" }}
          >
            <h1>🎨 ArtHub</h1>
            <p>
              Первая цифровая экосистема для художников, галерей и
              коллекционеров с электронным документооборотом и динамическим
              ценообразованием
            </p>

            {token ? (
              <div className="hero-buttons">
                <Link to="/catalog" className="btn btn-success btn-lg">
                  Смотреть каталог
                </Link>
                <Link
                  to="/exhibitions"
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: "white", color: "white" }}
                >
                  Выставки
                </Link>
              </div>
            ) : (
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-success btn-lg">
                  Начать бесплатно
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: "white", color: "white" }}
                >
                  Войти
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container" style={{ padding: "60px 0" }}>
        <h2
          style={{
            textAlign: "center",
            marginBottom: "40px",
            fontSize: "32px",
          }}
        >
          Возможности платформы
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "24px",
            marginTop: "20px",
          }}
        >
          <div
            className="card fade-up"
            style={{ textAlign: "center", padding: "40px 24px" }}
          >
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🎨</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Для художников
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Загружайте картины, отслеживайте историю, получайте запросы от
              галерей
            </p>
          </div>

          <div
            className="card fade-up"
            style={{
              textAlign: "center",
              padding: "40px 24px",
              animationDelay: "0.1s",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🏛️</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Для галерей
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Создавайте выставки, запрашивайте картины, управляйте продажами
            </p>
          </div>

          <div
            className="card fade-up"
            style={{
              textAlign: "center",
              padding: "40px 24px",
              animationDelay: "0.2s",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>💎</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Для коллекционеров
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Покупайте картины с полной историей и динамической ценой
            </p>
          </div>

          <div
            className="card fade-up"
            style={{
              textAlign: "center",
              padding: "40px 24px",
              animationDelay: "0.3s",
            }}
          >
            <div style={{ fontSize: "56px", marginBottom: "20px" }}>🎫</div>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              Для посетителей
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Покупайте билеты на выставки, открывайте новых художников
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: "#f8f9fa", padding: "60px 0" }}>
        <div className="container">
          <h2
            style={{
              textAlign: "center",
              marginBottom: "40px",
              fontSize: "32px",
            }}
          >
            Как это работает
          </h2>

          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#007bff",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "16px",
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <p>Художник загружает картину и публикует её в каталоге</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#6f42c1",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "16px",
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <p>Галерея создаёт выставку и запрашивает картину у художника</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#28a745",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "16px",
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <p>Художник принимает запрос — картина добавляется на выставку</p>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#dc3545",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  marginRight: "16px",
                  flexShrink: 0,
                }}
              >
                4
              </div>
              <p>
                Коллекционер покупает картину, а её цена растёт с каждой
                выставкой
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#1a1a1a",
          color: "white",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p>
            🎨 ArtHub © 2026 | Ивановский государственный химико-технологический
            университет
          </p>
        </div>
      </div>
    </div>
  );
}
