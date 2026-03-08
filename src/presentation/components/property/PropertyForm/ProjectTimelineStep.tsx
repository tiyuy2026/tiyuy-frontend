'use client';

import React, { useState } from 'react';

interface ProjectTimelineStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

export function ProjectTimelineStep({ formData, onChange }: ProjectTimelineStepProps) {
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState({
    phase: '',
    date: '',
    description: '',
  });

  const addMilestone = () => {
    const timeline = formData.timeline || [];
    onChange('timeline', [...timeline, { ...currentMilestone, id: Date.now() }]);
    setCurrentMilestone({ phase: '', date: '', description: '' });
    setShowMilestoneForm(false);
  };

  const removeMilestone = (milestoneId: number) => {
    const timeline = formData.timeline || [];
    onChange('timeline', timeline.filter((m: any) => m.id !== milestoneId));
  };

  const updateMilestone = (milestoneId: number, field: string, value: any) => {
    const timeline = formData.timeline || [];
    onChange('timeline', timeline.map((m: any) => 
      m.id === milestoneId ? { ...m, [field]: value } : m
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline del Proyecto</h3>
        <p className="text-sm text-gray-600 mb-6">
          Define las fechas importantes y hitos de construcción
        </p>
      </div>

      {/* Fechas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Inicio de Construcción
          </label>
          <input
            type="date"
            value={formData.startDate || formData.constructionStartDate || ''}
            onChange={(e) => onChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entrega Estimada *
          </label>
          <input
            type="date"
            value={formData.estimatedDelivery || ''}
            onChange={(e) => onChange('estimatedDelivery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Información importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• La fecha de entrega estimada es obligatoria</li>
          <li>• Puedes agregar hitos importantes del proyecto</li>
          <li>• Estas fechas serán visibles para los compradores</li>
        </ul>
      </div>

      {/* Timeline existente */}
      {formData.timeline && formData.timeline.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Hitos del Proyecto</h4>
          <div className="space-y-3">
            {formData.timeline
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((milestone: any) => (
                <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="font-medium text-gray-900">{milestone.phase}</span>
                        <span className="text-sm text-gray-500">{new Date(milestone.date).toLocaleDateString('es-PE')}</span>
                      </div>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                    </div>
                    <button
                      onClick={() => removeMilestone(milestone.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Formulario para agregar hito */}
      {showMilestoneForm && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Nuevo Hito</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fase o Hito *
              </label>
              <input
                type="text"
                value={currentMilestone.phase}
                onChange={(e) => setCurrentMilestone({ ...currentMilestone, phase: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Inicio de cimentación"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={currentMilestone.date}
                onChange={(e) => setCurrentMilestone({...currentMilestone, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={currentMilestone.description}
                onChange={(e) => setCurrentMilestone({...currentMilestone, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Detalles importantes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowMilestoneForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={addMilestone}
              disabled={!currentMilestone.phase || !currentMilestone.date}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Agregar Hito
            </button>
          </div>
        </div>
      )}

      {/* Certificaciones */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Certificaciones y Sellos de Calidad</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            'Sello de Calidad', 'Certificación LEED', 'ISO 9001', 
            'Certificado de Seguridad', 'Sustentable', 'Edificio Inteligente',
            'Certificado Sismorresistente', 'Material Premium', 'Garantía Estructural'
          ].map((cert) => (
            <label key={cert} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.certifications?.includes(cert) || false}
                onChange={(e) => {
                  const current = formData.certifications || [];
                  if (e.target.checked) {
                    onChange('certifications', [...current, cert]);
                  } else {
                    onChange('certifications', current.filter((c: string) => c !== cert));
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Resumen del timeline */}
      {formData.timeline && formData.timeline.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Resumen del Timeline</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Total Hitos:</span>
              <span className="font-semibold text-purple-900">{formData.timeline.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Inicio:</span>
              <span className="font-semibold text-purple-900">
                {formData.timeline.length > 0 ? 
                  new Date(Math.min(...formData.timeline.map((m: any) => new Date(m.date).getTime()))).toLocaleDateString('es-PE') : 
                  'No definido'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Fin:</span>
              <span className="font-semibold text-purple-900">
                {formData.timeline.length > 0 ? 
                  new Date(Math.max(...formData.timeline.map((m: any) => new Date(m.date).getTime()))).toLocaleDateString('es-PE') : 
                  'No definido'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
