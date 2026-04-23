import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import type { RegisterRequest } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>({
    email: '',
    password: '',
    name: '',
    role: 'artist'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await register(form);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('userName', response.user.name);
      navigate('/catalog');
    } catch (err) {
      // Проверяем, является ли err ошибкой axios
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: string } };
        setError(axiosError.response?.data || 'Ошибка регистрации');
      } else {
        setError('Ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <h1 style={{ marginBottom: '24px' }}>Регистрация</h1>
      
      {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Иван Петров"
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            placeholder="artist@example.com"
          />
        </div>
        
        <div className="form-group">
          <label>Пароль</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            placeholder="Минимум 6 символов"
          />
        </div>
        
        <div className="form-group">
          <label>Роль</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as RegisterRequest['role'] })}
          >
            <option value="artist">Художник</option>
            <option value="gallery">Галерея</option>
            <option value="collector">Коллекционер</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <p style={{ marginTop: '16px', textAlign: 'center' }}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}