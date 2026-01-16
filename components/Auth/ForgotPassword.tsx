import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
    onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Voltar</span>
            </button>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Recuperar Senha</h2>
                <p className="text-slate-500 mt-2">Enviaremos um link para redefinir sua senha.</p>
            </div>

            {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800">
                        <p className="font-bold">E-mail enviado!</p>
                        <p className="mt-1">Verifique sua caixa de entrada e spam.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="email"
                        placeholder="Seu e-mail cadastrado"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Enviando...' : success ? 'E-mail enviado!' : 'Enviar Link de Recuperação'}
                </button>
            </form>
        </div>
    );
};

export default ForgotPassword;
