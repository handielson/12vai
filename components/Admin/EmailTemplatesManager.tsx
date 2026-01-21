import React, { useState } from 'react';
import { EmailTemplates } from './EmailTemplates';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface EmailTemplate {
    id: string;
    type: string;
    name: string;
    description: string;
    subject: string;
    html_content: string;
    text_content: string | null;
    active: boolean;
    variables: string[];
    updated_at: string;
}

export const EmailTemplatesManager: React.FC = () => {
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
    };

    const handleClose = () => {
        setEditingTemplate(null);
    };

    const handleSaved = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div>
            <EmailTemplates key={refreshKey} onEdit={handleEdit} />

            {editingTemplate && (
                <EmailTemplateEditor
                    template={editingTemplate}
                    onClose={handleClose}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
};

export default EmailTemplatesManager;
