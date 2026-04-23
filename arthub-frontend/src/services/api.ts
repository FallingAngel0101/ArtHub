import axios from 'axios';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  Artwork, 
  Exhibition,
  Document,
  BuyResponse,
  SignDocumentResponse 
} from '../types';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data: RegisterRequest): Promise<AuthResponse> =>
  api.post('/register', data).then(res => res.data);

export const login = (data: LoginRequest): Promise<AuthResponse> =>
  api.post('/login', data).then(res => res.data);

// Artworks
export const getArtworks = (): Promise<Artwork[]> =>
  api.get('/artworks').then(res => res.data);

export const getArtwork = (id: number): Promise<Artwork> =>
  api.get(`/artworks/${id}`).then(res => res.data);

export const getMyArtworks = (): Promise<Artwork[]> =>
  api.get('/my-artworks').then(res => res.data);

export const createArtwork = (data: Partial<Artwork>): Promise<Artwork> =>
  api.post('/artworks', data).then(res => res.data);

export const updateArtwork = (id: number, data: Partial<Artwork>): Promise<Artwork> =>
  api.put(`/artworks/${id}`, data).then(res => res.data);

export const deleteArtwork = (id: number): Promise<void> =>
  api.delete(`/artworks/${id}`);

export const publishArtwork = (id: number): Promise<Artwork> =>
  api.post(`/artworks/${id}/publish`).then(res => res.data);

// Exhibitions
export const getExhibitions = (): Promise<Exhibition[]> =>
  api.get('/exhibitions').then(res => res.data);

export const getExhibition = (id: number): Promise<{ exhibition: Exhibition; artworks: Artwork[] }> =>
  api.get(`/exhibitions/${id}`).then(res => res.data);

export const createExhibition = (data: Partial<Exhibition>): Promise<Exhibition> =>
  api.post('/exhibitions', data).then(res => res.data);

export const addArtworkToExhibition = (exhibitionId: number, artworkId: number): Promise<void> =>
  api.post(`/exhibitions/${exhibitionId}/artworks`, { artwork_id: artworkId });

// Sales
export const buyArtwork = (artworkId: number): Promise<BuyResponse> =>
  api.post('/buy', { artwork_id: artworkId }).then(res => res.data);

export const getMyPurchases = (): Promise<Document[]> =>
  api.get('/purchases').then(res => res.data);

export const signDocument = (documentId: number): Promise<SignDocumentResponse> =>
  api.post(`/documents/${documentId}/sign`).then(res => res.data);

export default api;