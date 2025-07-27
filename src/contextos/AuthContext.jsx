import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from './NotificationContext';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const { mostrarNotificacao } = useNotificacao();
    const navigate = useNavigate();

    const carregarUsuarioPeloToken = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            try {
                const { data } = await apiClient.get('/api/usuarios/perfil');
                setUsuario(data);
            } catch (error) {
                console.error("Token inválido ou expirado, limpando...");
                localStorage.removeItem('token');
                delete apiClient.defaults.headers.common['Authorization'];
                setUsuario(null);
            }
        }
        setCarregando(false);
    }, []);

    useEffect(() => {
        carregarUsuarioPeloToken();
    }, [carregarUsuarioPeloToken]);

    // A lógica de login, registrar e logout foi movida para aqui,
    // resolvendo a dependência circular.
    const login = async (email, senha) => {
        try {
            const { data } = await apiClient.post('/api/usuarios/login', { email, senha });
            localStorage.setItem('token', data.token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            setUsuario(data.usuario);
            mostrarNotificacao(data.mensagem || 'Login bem-sucedido!', 'success');

            const user = data.usuario;
            if (user.plano === 'padrao' || user.plano === 'premium') {
                navigate('/');
            } else {
                navigate('/assinatura');
            }
            
            return true;
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Falha no login.', 'error');
            return false;
        }
    };
    
    const registrar = async (nome, email, senha) => {
        try {
            const { data } = await apiClient.post('/api/usuarios/registrar', { nome, email, senha });
            localStorage.setItem('token', data.token);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            
            setUsuario(data.usuario);
            mostrarNotificacao(data.mensagem || 'Cadastro realizado com sucesso!', 'success');
            navigate('/assinatura'); 
            
            return true;
        } catch (error) {
            mostrarNotificacao(error.response?.data?.mensagem || 'Falha no cadastro.', 'error');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete apiClient.defaults.headers.common['Authorization'];
        setUsuario(null);
        navigate('/login');
    };

    const valorDoContexto = {
        usuario,
        setUsuario,
        logado: !!usuario,
        carregando,
        login,
        registrar,
        logout,
    };

    return (
        <AuthContext.Provider value={valorDoContexto}>
            {!carregando && children}
        </AuthContext.Provider>
    );
};