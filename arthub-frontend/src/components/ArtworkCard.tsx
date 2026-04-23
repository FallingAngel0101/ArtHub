import { Link } from "react-router-dom";
import type { Artwork } from "../types";

interface Props {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: Props) {
  return (
    <div className="card">
      <div className="card-image">
        {artwork.image_url ? (
          <img
            src={artwork.image_url}
            alt={artwork.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "Изображенте"
        )}
      </div>
      <div className="card-content">
        <h3 className="card-title">{artwork.title}</h3>
        <p className="card-artist">
          {artwork.artist?.name || "Неизвестный художник"}
        </p>
        <p className="card-price">
          {artwork.current_price.toLocaleString()}Рублей
        </p>
        <Link
          to={`/artwork/${artwork.id}`}
          className="btn"
          style={{ width: "100%", textAlign: "center" }}
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
}
