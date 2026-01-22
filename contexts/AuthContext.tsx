import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import { auditLogService } from '../services/auditLogService';

interface AuthContextType {
    user: User | null;
    supabaseUser: SupabaseUser | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: Error | null }>;
    impersonateUser: (userId: string) => Promise<void>;
    previewPlan: string | null;
    setPreviewPlan: (plan: string | null) => void;
    isPreviewMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewPlan, setPreviewPlan] = useState<string | null>(null);

    useEffect(() => {
        // Verificar sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSupabaseUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Escutar mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSupabaseUser(session?.user ?? null);
            if (session?.user) {
                loadUserProfile(session.user.id);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        // Refresh automático do token a cada 50 minutos (antes de expirar em 60min)
        const refreshInterval = setInterval(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { error } = await supabase.auth.refreshSession();
                if (error) {
                    console.error('Erro ao renovar sessão:', error);
                    // Se falhar, fazer logout
                    await supabase.auth.signOut();
                } else {
                    console.log('✅ Sessão renovada automaticamente');
                }
            }
        }, 50 * 60 * 1000); // 50 minutos

        return () => {
            subscription.unsubscribe();
            clearInterval(refreshInterval);
        };
    }, []);

    const loadUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) throw error;

            setUser(data);
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // O perfil do usuário é criado automaticamente via database trigger
            // Ver: db/fix_auth_trigger.sql

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSupabaseUser(null);
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const impersonateUser = async (userId: string) => {
        try {
            // Salvar ID do admin atual antes de impersonar
            const currentAdminId = user?.id;

            // Carregar perfil do usuário alvo diretamente
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            // Log de auditoria
            if (currentAdminId) {
                await auditLogService.log(
                    currentAdminId,
                    'impersonate_user',
                    'user',
                    userId,
                    { user_email: data.email }
                );
            }

            // Atualizar estado do usuário
            setUser(data);
        } catch (error) {
            console.error('Error impersonating user:', error);
            throw error;
        }
    };

    // Apply preview plan if in preview mode
    const effectiveUser = user && previewPlan ? { ...user, plan: previewPlan as any } : user;

    return (
        <AuthContext.Provider
            value={{
                user: effectiveUser,
                supabaseUser,
                loading,
                signUp,
                signIn,
                signOut,
                resetPassword,
                impersonateUser,
                previewPlan,
                setPreviewPlan,
                isPreviewMode: !!previewPlan,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
