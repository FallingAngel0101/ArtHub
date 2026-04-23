export interface User {
  id: number;
  email: string;
  name: string;
  role: "artist" | "gallery" | "collector" | "visitor";
}

export interface Artwork {
  id: number;
  created_at: string;
  updated_at: string;
  artist_id: number;
  artist?: User;
  title: string;
  description: string;
  technique: string;
  year: number;
  width: number;
  height: number;
  base_price: number;
  current_price: number;
  status: "draft" | "published" | "sold" | "rented";
  image_url: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "artist" | "gallery" | "collector";
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface ExhibitionRequest {
  id: number;
  exhibition_id: number;
  artwork_id: number;
  artist_id: number;
  gallery_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  proposed_price: number;
  exhibition?: Exhibition;
  artwork?: Artwork;
}

export interface Exhibition {
  id: number;
  gallery_id: number;
  gallery?: User;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'planned' | 'active' | 'finished';
  created_at: string;
}

export interface Document {
  id: number;
  type: string;
  data: string;
  signed_by_artist: boolean;
  signed_by_gallery: boolean;
  signed_by_collector: boolean;
  status: 'draft' | 'signed' | 'archived';
}

export interface BuyResponse {
  message: string;
  artwork: Artwork;
  document_id: number;
  final_price: number;
}

export interface SignDocumentResponse {
  message: string;
  document: Document;
}