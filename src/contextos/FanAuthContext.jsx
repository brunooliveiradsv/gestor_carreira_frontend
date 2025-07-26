// src/contextos/FanAuthContext.jsx
import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from './NotificationContext';

export const FanAuthContext = createContext();

export const FanAuthProvider = ({ children }) => {
    const [fa, setFa] = useState(null);
    const [tokenFa, setTokenFa] = useState(() => localStorage.getItem('fan_token'));
    const { mostrarNotificacao } = useNotificacao();

    const loginFa = useCallback(async (googleToken) => {
        try {
            // Envia o token do Google para o seu backend
            const { data } = await apiClient.post('/api/auth/google/callback', { token: googleToken });
            localStorage.setItem('fan_token', data.token);
            setTokenFa(data.token);
            setFa(data.fa);
            mostrarNotificacao('Login como fã realizado com sucesso!', 'success');
        } catch (error) {
            mostrarNotificacao('Falha no login de fã.', 'error');
        }
    }, [mostrarNotificacao]);

    const logoutFa = () => {
        localStorage.removeItem('fan_token');
        setTokenFa(null);
        setFa(null);
    };

    const valorDoContexto = {
        fa,
        tokenFa,
        logado: !!fa,
        loginFa,
        logoutFa,
    };

    return (
        <FanAuthContext.Provider value={valorDoContexto}>
            {children}
        </FanAuthContext.Provider>
    );
};