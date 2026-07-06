'use client';

import { useState } from 'react';
import { useCreateGroup, useGetGroups } from '@/presentation/hooks/useContacts';
import { InfoDialog } from '@/presentation/components/ui';
import { toast } from '@/presentation/store/toastStore';

export function NewGroupModal({ onClose }: { onClose: () => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isRestricted, setIsRestricted] = useState(false);
    const [infoDialog, setInfoDialog] = useState<{ isOpen: boolean; title: string; message: string; variant: 'warning' | 'error' }>({ isOpen: false, title: '', message: '', variant: 'warning' });
    const createGroup = useCreateGroup();
    const { data: groups } = useGetGroups(0, 50);

    const userGroups = groups?.filter((g: any) => g.isMember && g.isOwner) ?? [];
    const hasGroup = userGroups.length > 0;

    const handleSubmit = async () => {
        if (!name.trim()) return;
        try {
            await createGroup.mutateAsync({ name, description, isRestrictedByEmail: isRestricted });
            onClose();
        } catch (error: any) {
            if (error?.code === 'GROUP_LIMIT_EXCEEDED') {
                setInfoDialog({ isOpen: true, title: 'Límite de grupos alcanzado', message: `Ya tienes un grupo creado y no puedes crear más.\n\nTu grupo actual: "${userGroups[0]?.name || 'Tu grupo'}"\n\nSolo puedes tener UN (1) grupo activo en Tiyuy.\n\nVe a la sección "Mis Grupos" para gestionarlo.`, variant: 'warning' });
                onClose();
            } else {
                toast.error(error?.message || 'Error al crear el grupo');
            }
        }
    };

    if (hasGroup) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
                        <div className="text-center"><h2 className="text-white font-bold text-lg">LÍMITE ALCANZADO</h2></div>
                    </div>
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">⚠️</span></div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">No puedes crear más grupos</h3>
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                            <p className="text-red-800 dark:text-red-300 text-sm font-medium">Ya alcanzaste el límite de 1 grupo activo</p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Tu grupo actual: <strong>"{userGroups[0]?.name}"</strong></p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">En Tiyuy cada usuario puede tener únicamente un (1) grupo activo.</p>
                        <button onClick={onClose} className="w-full py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">Entendido</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <InfoDialog isOpen={infoDialog.isOpen} onClose={() => setInfoDialog(prev => ({ ...prev, isOpen: false }))} title={infoDialog.title} message={infoDialog.message} variant={infoDialog.variant} />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-white font-bold text-lg">Crear Grupo</h2>
                                <p className="text-white/70 text-xs mt-0.5">Solo puedes crear 1 grupo en Tiyuy</p>
                            </div>
                            <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">×</button>
                        </div>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Nombre del grupo</label>
                            <input value={name} onChange={e => setName(e.target.value)}
                                placeholder="Ej: Alquiler Miraflores, Venta Casas Lima Norte..."
                                className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Descripción</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)}
                                rows={2} placeholder="¿De qué trata este grupo?"
                                className="w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all" />
                        </div>
                        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Restringir por correo</p>
                                <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">Solo emails aprobados pueden unirse</p>
                            </div>
                            <button onClick={() => setIsRestricted(!isRestricted)}
                                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${isRestricted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white dark:bg-gray-200 rounded-full shadow-sm transition-all ${isRestricted ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-200">
                            <p className="text-xs text-green-800">Podrás compartir el link del grupo en WhatsApp, Telegram y otras redes para atraer miembros</p>
                        </div>
                        <div className="flex gap-3 pt-1">
                            <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium">Cancelar</button>
                            <button onClick={handleSubmit} disabled={!name.trim() || createGroup.isPending}
                                className="flex-1 py-2.5 text-sm bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-40">
                                {createGroup.isPending ? 'Creando...' : 'Crear Grupo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}