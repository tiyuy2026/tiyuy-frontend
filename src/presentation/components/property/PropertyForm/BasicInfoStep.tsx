'use client';

interface BasicInfoStepProps {
  formData: any;
  onChange: (field: string, value: any) => void;
  propertyId?: number;
}

export function BasicInfoStep({ formData, onChange }: BasicInfoStepProps) {
  const isActive = (field: string, value: string) => formData[field] === value;

  const PROPERTY_TYPES = [
    { value: 'APARTMENT', label: 'Departamento', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>) },
    { value: 'HOUSE', label: 'Casa', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { value: 'LAND', label: 'Terreno', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>) },
    { value: 'OFFICE', label: 'Oficina', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>) },
    { value: 'COMMERCIAL', label: 'Local Comercial', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>) },
    { value: 'ROOM', label: 'Habitacion', icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
  ];

  const TRANSACTION_LABELS: Record<string, string> = {
    SALE: 'Venta',
    RENT: 'Alquiler',
  };

  return (
    <div className="space-y-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .bis-wrap { font-family: 'Plus Jakarta Sans', sans-serif; }

        .transaction-btn {
          flex: 1;
          padding: 14px 20px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .transaction-btn:hover {
          border-color: #22c55e;
          color: #22c55e;
          background: #f0fdf4;
        }
        .transaction-btn.active {
          border-color: #22c55e;
          background: #22c55e;
          color: #fff;
          box-shadow: 0 4px 14px rgba(34,197,94,0.25);
        }

        .type-btn {
          padding: 16px 12px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #fff;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          width: 100%;
        }
        .type-btn:hover {
          border-color: #22c55e;
          color: #22c55e;
          background: #f0fdf4;
        }
        .type-btn:hover svg { color: #22c55e; }
        .type-btn.active {
          border-color: #22c55e;
          background: #f0fdf4;
          color: #16a34a;
        }
        .type-btn.active svg { color: #22c55e; }

        .field-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #94a3b8;
          margin-bottom: 10px;
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .form-input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #fafffe;
          transition: all 0.2s ease;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .form-input::placeholder { color: #94a3b8; }
        .form-input:focus {
          border-color: #22c55e;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
        }

        .form-select {
          padding: 13px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #1e293b;
          background: #fafffe;
          transition: all 0.2s ease;
          outline: none;
          cursor: pointer;
          appearance: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .form-select:focus {
          border-color: #22c55e;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
        }

        .section-divider {
          width: 28px;
          height: 2.5px;
          background: #22c55e;
          border-radius: 2px;
          margin-bottom: 14px;
        }
      `}</style>

      <div className="bis-wrap space-y-8">

        {/* ── TRANSACCIÓN ── */}
        <div>
          <div className="section-divider" />
          <label className="field-label">¿Que deseas hacer?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onChange('transactionType', 'SALE')}
              className={`transaction-btn ${isActive('transactionType', 'SALE') ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Vender
            </button>
            <button
              type="button"
              onClick={() => onChange('transactionType', 'RENT')}
              className={`transaction-btn ${isActive('transactionType', 'RENT') ? 'active' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Alquilar
            </button>
          </div>
        </div>

        {/* ── TIPO DE PROPIEDAD ── */}
        <div>
          <div className="section-divider" />
          <label className="field-label">Tipo de propiedad</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onChange('type', type.value)}
                className={`type-btn ${isActive('type', type.value) ? 'active' : ''}`}
              >
                <span style={{ color: isActive('type', type.value) ? '#22c55e' : '#94a3b8', transition: 'color 0.2s' }}>
                  {type.icon}
                </span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── PRECIO ── */}
        <div>
          <div className="section-divider" />
          <label className="field-label">Precio</label>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={formData.currency}
                onChange={(e) => onChange('currency', e.target.value)}
                className="form-select pr-8"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', backgroundSize: '14px' }}
              >
                <option value="PEN">S/ PEN</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
            <input
              type="number"
              value={formData.price || ''}
              onChange={(e) => onChange('price', Number(e.target.value))}
              required
              className="form-input flex-1"
              placeholder="Ingresa el precio"
            />
          </div>
        </div>

        {/* ── DESCRIPCIÓN ── */}
        <div>
          <div className="section-divider" />
          <label className="field-label">Descripcion</label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={5}
            className="form-input resize-none"
            placeholder="Describe tu propiedad..."
          />
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Una buena descripcion ayuda a vender mas rapido
          </p>
        </div>

      </div>
    </div>
  );
}