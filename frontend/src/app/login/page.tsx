'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { login, isLoading } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        setError('');

        try {
            const success = await login(name, password);

            if (success) {
                router.push('/');
            } else {
                setError('Credenciais inválidas. Por favor, tente novamente.');
            }
        } catch (err) {
            console.error('Erro durante login:', err);
            setError('Ocorreu um erro durante o login. Por favor, tente novamente.');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-6">LoveLog</h2>
                <p className="text-center text-gray-600 mb-6">Entre para acessar seu espaço de casal</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Casal</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            placeholder="Digite o nome do casal"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 font-medium transition-colors 
                                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Não tem um espaço ainda?{' '}
                        <a href="/register" className="text-blue-500 hover:text-blue-700">
                            Crie seu espaço de casal
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}