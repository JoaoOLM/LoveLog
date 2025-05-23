'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/hooks/api';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [coupleCode, setCoupleCode] = useState<string | null>(null);
    const router = useRouter();

    // Função para verificar se o usuário está autenticado
    const checkAuth = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        const storedCode = localStorage.getItem('coupleCode');
        
        if (!storedCode) {
            setIsAuthenticated(false);
            setCoupleCode(null);
            setIsLoading(false);
            return false;
        }

        try {
            // Verifica se o token é válido fazendo uma chamada para a API
            const res = await fetch(`${API_URL}/couples/login/`, {
                method: 'GET',
                headers: {
                    'Authorization': `LoveLog ${storedCode}`,
                },
            });

            if (res.ok) {
                setIsAuthenticated(true);
                setCoupleCode(storedCode);
                setIsLoading(false);
                return true;
            } else {
                // Se o token não for válido, limpa o localStorage
                localStorage.removeItem('coupleCode');
                setIsAuthenticated(false);
                setCoupleCode(null);
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            setIsAuthenticated(false);
            setCoupleCode(null);
            setIsLoading(false);
            return false;
        }
    }, []);

    // Helper function to get the couple code
    const getCoupleCode = useCallback(async (): Promise<string | null> => {
        // If we already have the code and are authenticated, return it
        if (coupleCode && isAuthenticated) {
            return coupleCode;
        }

        // Otherwise, check auth and return the code if successful
        const isAuth = await checkAuth();
        return isAuth ? localStorage.getItem('coupleCode') : null;
    }, [coupleCode, isAuthenticated, checkAuth]);

    // Verificar autenticação ao iniciar
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Função de login
    const login = async (name: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/couples/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    password: password,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Armazenar o código do casal
                localStorage.setItem('coupleCode', data.code);
                setIsAuthenticated(true);
                setCoupleCode(data.code);
                setIsLoading(false);
                return true;
            } else {
                setIsAuthenticated(false);
                setCoupleCode(null);
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Erro durante login:', error);
            setIsAuthenticated(false);
            setCoupleCode(null);
            setIsLoading(false);
            return false;
        }
    };

    // Função de logout
    const logout = () => {
        localStorage.removeItem('coupleCode');
        setIsAuthenticated(false);
        setCoupleCode(null);
        router.push('/login');
    };

    return {
        isAuthenticated,
        isLoading,
        coupleCode,
        checkAuth,
        getCoupleCode,
        login,
        logout
    };
}