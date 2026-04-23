import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type {User} from '../types';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const responce = await api.get('/me');
                setUser(responce.data);
            } catch {
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        navigate('/login');
    };
    if (loading) return <div className='container'>Загрузка</div>
    if (!user) return <div className='container error'>Не авторизован</div>

    const roleName: Record<string, string> = {
        artist: 'Художник',
        gallery: 'Галерея',
        collector: 'Коллекционер',
        visitor: 'Посетитель'
    };

    return (
        <div className='container' style={{maxWidth: '500px'}}>
            <h1 style={{marginBottom: '24px'}}>Профиль</h1>

            <div className='card' style={{padding: '24px'}}>
                <div style={{marginBottom: '20px'}}>
                    <div style = {{fontSize: '14px', color:'#666', marginBottom:'4px'}}>Имя</div>
                    <div style={{fontSize: '20px', fontWeight: '600'}}>{user.name}</div>
                </div>
                <div style={{marginBottom: '20px'}}>
                    <div style={{fontSize: '14px', color:'#666', marginBottom:'4px'}}>Email</div>
                    <div style={{fontSize: '16px'}}>{user.email}</div>
                </div>
                <div style={{marginBottom: '24px'}}>
                    <div style={{fontSize: '14px', color: '#666', marginBottom: '4px'}}>Роль</div>
                    <div style={{fontSize: '16px'}}>{roleName[user.role] || user.role}</div>
                </div>
                <button onClick={handleLogout} className='btn btn-danger' style={{width: '100%'}}>
                    Выйти из аккаунта
                </button>
            </div>
        </div>
    );
}