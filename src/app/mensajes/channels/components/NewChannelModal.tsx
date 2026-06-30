
'use client';

import { useState } from 'react';

export function NewChannelModal({ onClose, userRole }: { onClose: () => void; userRole?: string }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) return;
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="bg-brand p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white font-bold text-lg">Crear Canal</h2>
                            <p className="text-white/70 text-xs mt-0.5">Comparte información con muchos seguidores</p>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-xl leading-none">×</button>
                    </div>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre del canal</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                            placeholder="Ej: Inmobiliarias Lima Centro..."
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            rows={3} placeholder="¿De qué trata este canal?"
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Categoría</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all bg-white">
                            <option value="">Seleccionar...</option>
                            <option>Inmobiliarias</option>
                            <option>Alquileres</option>
                            <option>Ventas</option>
                            <option>Inversiones</option>
                            <option>Noticias</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <span className="text-amber-500"></span>
                        <p className="text-xs text-amber-700">Los canales son ideales para anuncios, noticias y comunicación unidireccional</p>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} disabled={!name.trim()}
                            className="flex-1 py-2.5 text-sm bg-brand text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
                            Crear Canal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}