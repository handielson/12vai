import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: number;
    format?: 'number' | 'decimal';
}

export default function StatCard({ title, value, icon, trend, format = 'number' }: StatCardProps) {
    const formattedValue = typeof value === 'number'
        ? format === 'decimal'
            ? value.toFixed(1)
            : value.toLocaleString('pt-BR')
        : value;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm text-slate-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-slate-900">{formattedValue}</p>
            </div>
        </div>
    );
}
