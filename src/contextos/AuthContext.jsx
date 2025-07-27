import React, { createContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../apiClient';
import { useAuthActions } from '../hooks/useAuthActions'; // Importar o hook

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);
    // As ações agora vêm do hook, mantendo este componente mais limpo
    const { login, registrar, logout } = useAuthActions(); 

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
    
    // O valor do contexto agora inclui setUsuario para o hook e as ações
    const valorDoContexto = {
        usuario,
        setUsuario, // Exportar o setUsuario para o hook usar
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