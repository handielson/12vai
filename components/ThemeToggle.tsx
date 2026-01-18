import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const themes = [
        { value: 'light' as const, label: 'Claro', icon: Sun },
        { value: 'dark' as const, label: 'Escuro', icon: Moon },
        { value: 'auto' as const, label: 'Automático', icon: Monitor },
    ];

    const currentTheme = themes.find(t => t.value === theme) || themes[2];
    const Icon = currentTheme.icon;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Tema: ${currentTheme.label}`}
                aria-label="Alternar tema"
            >
                <Icon size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                    {themes.map((t) => {
                        const ThemeIcon = t.icon;
                        const isActive = theme === t.value;

                        return (
                            <button
                                key={t.value}
                                onClick={() => {
                                    setTheme(t.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full px-4 py-2 text-left flex items-center gap-3
                                    hover:bg-slate-100 dark:hover:bg-slate-700
                                    transition-colors
                                    ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}
                                `}
                            >
                                <ThemeIcon size={18} />
                                <span className="text-sm font-medium">{t.label}</span>
                                {isActive && (
                                    <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
