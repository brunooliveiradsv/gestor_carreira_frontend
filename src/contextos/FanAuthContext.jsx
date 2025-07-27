// src/contextos/FanAuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import apiClient from '../apiClient';
import { useNotificacao } from './NotificationContext';
import { jwtDecode } from 'jwt-decode';

export const FanAuthContext = createContext({});

export const useFanAuth = () => useContext(FanAuthContext);

export const FanAuthProvider = ({ children }) => {
    const [fa, setFa] = useState(null);
    const [musicasCurtidas, setMusicasCurtidas] = useState(new Set()); // 1. O estado das músicas curtidas agora vive aqui
    const { mostrarNotificacao } = useNotificacao();

    const logoutFa = useCallback(() => {
        localStorage.removeItem('fan_token');
        setFa(null);
        setMusicasCurtidas(new Set()); // Limpa as curtidas ao fazer logout
        delete apiClient.defaults.headers.common['Authorization-Fan'];
    }, []);

    // 2. A função agora é assíncrona para buscar os likes
    const carregarFaPeloToken = useCallback(async () => {
        const token = localStorage.getItem('fan_token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setFa(decoded);
                    apiClient.defaults.headers.common['Authorization-Fan'] = `Bearer ${token}`;

                    // 3. Busca as músicas curtidas logo após autenticar o fã
                    const resposta = await apiClient.get('/api/vitrine/meus-likes');
                    setMusicasCurtidas(new Set(resposta.data));
                } else {
                    logoutFa();
                }
            } catch (error) {
                console.error("Token de fã inválido ou erro ao buscar likes", error);
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
            const decoded = jwtDecode(data.token);
            setFa(decoded);
            apiClient.defaults.headers.common['Authorization-Fan'] = `Bearer ${data.token}`;
            
            // 4. Também busca as curtidas após o login
            const resposta = await apiClient.get('/api/vitrine/meus-likes');
            setMusicasCurtidas(new Set(resposta.data));
            
            mostrarNotificacao(`Bem-vindo, ${decoded.nome.split(' ')[0]}!`, 'success');
        } catch (error) {
            mostrarNotificacao('Falha no login de fã.', 'error');
        }
    }, [mostrarNotificacao]);

    // 5. Cria uma função para manipular o "like" que atualiza o estado centralizado
    const handleLikeMusicaContext = async (musicaId) => {
        const jaCurtiu = musicasCurtidas.has(musicaId);
        
        // Atualização otimista da UI
        setMusicasCurtidas(prev => {
            const novoSet = new Set(prev);
            jaCurtiu ? novoSet.delete(musicaId) : novoSet.add(musicaId);
            return novoSet;
        });

        try {
            await apiClient.post(`/api/vitrine/musicas/${musicaId}/like`);
        } catch (error) {
            mostrarNotificacao('Erro ao registar o seu gosto.', 'error');
            // Reverte a alteração em caso de erro
            setMusicasCurtidas(prev => {
                const novoSet = new Set(prev);
                jaCurtiu ? novoSet.add(musicaId) : novoSet.delete(musicaId);
                return novoSet;
            });
        }
    };

    const valorDoContexto = {
        fa,
        logado: !!fa,
        musicasCurtidas, // Fornece o estado das curtidas
        handleLikeMusica: handleLikeMusicaContext, // Fornece a função para curtir
        loginFa,
        logoutFa,
    };

    return (
        <FanAuthContext.Provider value={valorDoContexto}>
            {children}
        </FanAuthContext.Provider>
    );
};