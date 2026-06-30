'use client';

import { useCreateStatusPost } from '@/presentation/hooks/useContacts';
import StatusInput from '@/presentation/components/contacts/StatusInput';
import { X } from 'lucide-react';

export default function NewStatusModal({ onClose, userRole }: { onClose: () => void; userRole?: string }) {
    const createStatus = useCreateStatusPost();

    const handleSendStatus = (content: string, textStyle?: string, customColor?: string, location?: string, propertyType?: string) => {
        createStatus.mutate({
            content,
            location: location || undefined,
            propertyType: propertyType || undefined,
            isPromoted: false
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crear nuevo estado</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6">
                    <StatusInput
                        onSendStatus={handleSendStatus}
                        placeholder="¿Qué estás pensando?"
                        disabled={createStatus.isPending}
                        maxLength={500}
                    />
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
