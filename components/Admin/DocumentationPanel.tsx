import React, { useState, useEffect } from 'react';
import { Check, Plus, X, FileText, Rocket, CheckCircle2 } from 'lucide-react';
import { documentationService, DocumentationItem } from '../../services/documentationService';

export const DocumentationPanel: React.FC = () => {
    const [features, setFeatures] = useState<DocumentationItem[]>([]);
    const [roadmap, setRoadmap] = useState<DocumentationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [featuresData, roadmapData] = await Promise.all([
                documentationService.getFeatures(),
                documentationService.getRoadmap()
            ]);
            setFeatures(featuresData);
            setRoadmap(roadmapData);
        } catch (error) {
            console.error('Erro ao carregar documentação:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = async (id: string) => {
        try {
            await documentationService.toggleFeature(id);
            await loadData();
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message);
        }
    };

    const toggleRoadmapItem = async (id: string) => {
        try {
            await documentationService.toggleRoadmapItem(id);
            await loadData();
        } catch (error: any) {
            alert('Erro ao atualizar: ' + error.message);
        }
    };

    const addRoadmapItem = async () => {
        if (!newItemTitle.trim()) return;

        try {
            await documentationService.addRoadmapItem(newItemTitle);
            setNewItemTitle('');
            setShowAddForm(false);
            await loadData();
        } catch (error: any) {
            alert('Erro ao adicionar: ' + error.message);
        }
    };

    const removeRoadmapItem = async (id: string) => {
        if (!confirm('Remover este item do roadmap?')) return;

        try {
            await documentationService.removeRoadmapItem(id);
            await loadData();
        } catch (error: any) {
            alert('Erro ao remover: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-slate-500">Carregando documentação...</div>
            </div>
        );
    }

    const completedFeatures = features.filter(f => f.done).length;
    const completedRoadmap = roadmap.filter(r => r.done).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="text-indigo-600" />
                    Documentação do Projeto
                </h2>
                <p className="text-slate-600 mt-1">Acompanhe o progresso e planeje próximos passos</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-green-700">Features Implementadas</div>
                            <div className="text-2xl font-bold text-green-900 mt-1">
                                {completedFeatures} / {features.length}
                            </div>
                        </div>
                        <CheckCircle2 className="text-green-600" size={40} />
                    </div>
                    <div className="mt-2 bg-green-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${(completedFeatures / features.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-indigo-700">Roadmap Completo</div>
                            <div className="text-2xl font-bold text-indigo-900 mt-1">
                                {completedRoadmap} / {roadmap.length}
                            </div>
                        </div>
                        <Rocket className="text-indigo-600" size={40} />
                    </div>
                    <div className="mt-2 bg-indigo-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${(completedRoadmap / roadmap.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Features Implementadas */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-green-600" size={20} />
                    Features Implementadas
                </h3>
                <div className="space-y-2">
                    {features.map(feature => (
                        <label
                            key={feature.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group"
                        >
                            <input
                                type="checkbox"
                                checked={feature.done}
                                onChange={() => toggleFeature(feature.id)}
                                className="w-5 h-5 text-green-600 rounded mt-0.5 cursor-pointer"
                            />
                            <div className="flex-1">
                                <div className={`font-medium ${feature.done ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                    {feature.title}
                                </div>
                                {feature.description && (
                                    <div className="text-sm text-slate-500 mt-1">{feature.description}</div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Roadmap */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Rocket className="text-indigo-600" size={20} />
                        Próximos Passos
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Adicionar
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <input
                            type="text"
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            placeholder="Título do novo item..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            onKeyPress={(e) => e.key === 'Enter' && addRoadmapItem()}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={addRoadmapItem}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                            >
                                Adicionar
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewItemTitle('');
                                }}
                                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Roadmap Items */}
                <div className="space-y-2">
                    {roadmap.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                                    {index + 1}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={item.done}
                                    onChange={() => toggleRoadmapItem(item.id)}
                                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                                />
                            </div>
                            <div className="flex-1">
                                <div className={`font-medium ${item.done ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                    {item.title}
                                </div>
                                {item.description && (
                                    <div className="text-sm text-slate-500 mt-1">{item.description}</div>
                                )}
                            </div>
                            <button
                                onClick={() => removeRoadmapItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-opacity"
                                title="Remover item"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {roadmap.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        Nenhum item no roadmap. Clique em "Adicionar" para criar um.
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <FileText className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-900">
                        <strong>Dica:</strong> Use esta seção para acompanhar o progresso do projeto e planejar próximas implementações.
                        Marque features como completas e adicione novos itens ao roadmap conforme necessário.
                    </div>
                </div>
            </div>
        </div>
    );
};
