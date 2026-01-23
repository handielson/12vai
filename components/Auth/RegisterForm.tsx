import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle2, User, CreditCard } from 'lucide-react';
import { validateCPF, formatCPF, normalizeCPF } from '../../utils/cpfValidation';

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cpf, setCpf] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Remove caracteres não numéricos
        value = value.replace(/[^\d]/g, '');

        // Limita a 11 dígitos
        value = value.substring(0, 11);

        // Formata enquanto digita
        const formatted = formatCPF(value);
        setCpf(formatted);

        // Valida quando completo
        if (value.length === 11) {
            if (!validateCPF(value)) {
                setCpfError('CPF inválido');
            } else {
                setCpfError('');
            }
        } else {
            setCpfError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCpfError('');
        setSuccess(false);

        // Validar CPF
        const normalizedCPF = normalizeCPF(cpf);
        if (normalizedCPF.length !== 11) {
            setCpfError('CPF é obrigatório');
            return;
        }

        if (!validateCPF(normalizedCPF)) {
            setCpfError('CPF inválido');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            // Validar CPF no backend
            const cpfResponse = await fetch('http://localhost:3002/api/validate-cpf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cpf: normalizedCPF }),
            });

            const cpfData = await cpfResponse.json();

            if (!cpfResponse.ok || !cpfData.canCreateFree) {
                setCpfError(cpfData.error || 'Este CPF já possui uma conta gratuita');
                setLoading(false);
                return;
            }

            // Criar conta
            const { error } = await signUp(email, password);

            if (error) {
                setError(error.message);
            } else {
                // Atualizar CPF do usuário
                // Isso será feito via trigger ou função do Supabase
                setSuccess(true);
                setTimeout(() => {
                    onSwitchToLogin();
                }, 2000);
            }
        } catch (err) {
            setError('Erro ao validar CPF. Tente novamente.');
        }

        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl p-10 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900">Criar Conta</h2>
                <p className="text-slate-500 mt-2">Comece grátis. Sem cartão de crédito.</p>
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
                        <p className="font-bold">Conta criada com sucesso!</p>
                        <p className="mt-1">Verifique seu e-mail para confirmar.</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="email"
                        placeholder="Seu melhor e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <div className="relative">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="text"
                        placeholder="CPF (000.000.000-00)"
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={14}
                        className={`w-full pl-14 pr-5 py-4 bg-slate-50 border rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all ${cpfError ? 'border-red-300 focus:ring-red-500/10' : 'border-slate-200'
                            }`}
                    />
                    {cpfError && (
                        <p className="text-sm text-red-600 mt-1 ml-1">{cpfError}</p>
                    )}
                </div>

                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="password"
                        placeholder="Crie uma senha (mín. 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        required
                        type="password"
                        placeholder="Confirme sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-14 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Criando conta...' : success ? 'Conta criada!' : 'Criar Conta Grátis'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <div className="text-sm text-slate-500">
                    Já tem conta?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-indigo-600 hover:text-indigo-700 font-bold"
                    >
                        Fazer login
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-400 text-center">
                    Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;
