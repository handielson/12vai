import { supabase } from '../lib/supabase';

export interface DocumentationItem {
    id: string;
    title: string;
    done: boolean;
    description?: string;
}

export interface DocumentationNotes {
    text: string;
}

export const documentationService = {
    async getFeatures(): Promise<DocumentationItem[]> {
        const { data, error } = await supabase
            .from('project_documentation')
            .select('content')
            .eq('section', 'features')
            .single();

        if (error) {
            console.error('Error fetching features:', error);
            return [];
        }
        return (data?.content as DocumentationItem[]) || [];
    },

    async getRoadmap(): Promise<DocumentationItem[]> {
        const { data, error } = await supabase
            .from('project_documentation')
            .select('content')
            .eq('section', 'roadmap')
            .single();

        if (error) {
            console.error('Error fetching roadmap:', error);
            return [];
        }
        return (data?.content as DocumentationItem[]) || [];
    },

    async getNotes(): Promise<string> {
        const { data, error } = await supabase
            .from('project_documentation')
            .select('content')
            .eq('section', 'notes')
            .single();

        if (error) {
            console.error('Error fetching notes:', error);
            return '';
        }
        return (data?.content as DocumentationNotes)?.text || '';
    },

    async updateSection(section: string, content: any): Promise<void> {
        const { error } = await supabase
            .from('project_documentation')
            .update({
                content,
                updated_at: new Date().toISOString()
            })
            .eq('section', section);

        if (error) throw error;
    },

    async toggleFeature(featureId: string): Promise<void> {
        const features = await this.getFeatures();
        const updated = features.map(f =>
            f.id === featureId ? { ...f, done: !f.done } : f
        );
        await this.updateSection('features', updated);
    },

    async toggleRoadmapItem(itemId: string): Promise<void> {
        const roadmap = await this.getRoadmap();
        const updated = roadmap.map(item =>
            item.id === itemId ? { ...item, done: !item.done } : item
        );
        await this.updateSection('roadmap', updated);
    },

    async addRoadmapItem(title: string, description?: string): Promise<void> {
        const roadmap = await this.getRoadmap();
        const newItem: DocumentationItem = {
            id: `item-${Date.now()}`,
            title,
            done: false,
            description
        };
        await this.updateSection('roadmap', [...roadmap, newItem]);
    },

    async removeRoadmapItem(itemId: string): Promise<void> {
        const roadmap = await this.getRoadmap();
        const updated = roadmap.filter(item => item.id !== itemId);
        await this.updateSection('roadmap', updated);
    }
};
