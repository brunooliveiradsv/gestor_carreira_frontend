// src/contextos/FanAuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from './NotificationContext';
import { jwtDecode } from 'jwt-decode';

export const FanAuthContext = createContext({});

// --- CORREÇÃO AQUI ---
// Criamos e exportamos o custom hook para consumir o contexto
export const useFanAuth = () => useContext(FanAuthContext);

export const FanAuthProvider = ({ children }) => {
    const [fa, setFa] = useState(null);
    const [tokenFa, setTokenFa] = useState(() => localStorage.getItem('fan_token'));
    const { mostrarNotificacao } = useNotificacao();

    const logoutFa = useCallback(() => {
        localStorage.removeItem('fan_token');
        setTokenFa(null);
        setFa(null);
        // Garante que o cabeçalho de autorização do fã é removido
        delete apiClient.defaults.headers.common['Authorization-Fan'];
    }, []);

    const carregarFaPeloToken = useCallback(() => {
        const token = localStorage.getItem('fan_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setFa(decoded);
                    // Adiciona um cabeçalho diferente para o token do fã para não conflitar com o do artista
                    apiClient.defaults.headers.common['Authorization-Fan'] = `Bearer ${token}`;
                } else {
                    logoutFa(); // Token expirado
                }
            } catch (error) {
                console.error("Token de fã inválido", error);
                logoutFa();
            }
        }
    }, [logoutFa]);

    useEffect(() => {
        carregarFaPeloToken();
    }, [carregarFaPeloToken]);
    
    const loginFa = useCallback(async (googleCredential) => {
        try {
            const { data } = await apiClient.post('/api/auth/google/callback', { credential: googleCredential });
            
            localStorage.setItem('fan_token', data.token);
            setTokenFa(data.token);
            
            const decoded = jwtDecode(data.token);
            setFa(decoded);
            apiClient.defaults.headers.common['Authorization-Fan'] = `Bearer ${data.token}`;
            
            mostrarNotificacao(`Bem-vindo, ${decoded.nome.split(' ')[0]}!`, 'success');
        } catch (error) {
            mostrarNotificacao('Falha no login de fã.', 'error');
        }
    }, [mostrarNotificacao]);

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