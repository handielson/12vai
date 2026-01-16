import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
    onSwitchToRegister: () => void;
    onSwitchToForgot: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgot }) => {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Bora vender?</h2>
                <p className="text-slate-500 mt-2">Acesse seu painel e faça o link "ir".</p>
            </div>

            {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="email"
                        placeholder="E-mail profissional"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="password"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Entrando...' : 'Acessar Minha Loja'}
                </button>
            </form>

            <div className="mt-6 text-center space-y-3">
                <button
                    onClick={onSwitchToForgot}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Esqueci minha senha
                </button>

                <div className="text-sm text-slate-500">
                    Não tem conta?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                        Criar conta grátis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
