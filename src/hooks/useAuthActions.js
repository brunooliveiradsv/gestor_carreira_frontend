// src/hooks/useAuthActions.js
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import { useNotificacao } from '../contextos/NotificationContext';
import { AuthContext } from '../contextos/AuthContext';

/**
 * Hook customizado que encapsula as ações de autenticação (login, registo, logout).
 * @returns {{login: Function, registrar: Function, logout: Function}}
 */
export const useAuthActions = () => {
    const { setUsuario } = useContext(AuthContext);
    const { mostrarNotificacao } = useNotificacao();
    const navigate = useNavigate();

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

    return { login, registrar, logout };
};