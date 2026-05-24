'use client';

export default function FormContact() {
    return (
        <section className="mt-12 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 sm:p-10 border-b border-gray-100 bg-gray-50 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-brand mb-2">
                    Asesoría
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    ¿Necesitas Asesoría Legal?
                </h2>
                <p className="mt-2 text-gray-600 text-base max-w-xl mx-auto font-medium">
                    Contáctanos para orientación en trámites inmobiliarios. Nuestro equipo se pondrá en contacto contigo.
                </p>
            </div>

            <div className="p-6 sm:p-10 max-w-3xl mx-auto">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="full-name" className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                                Nombre Completo
                            </label>
                            <input
                                id="full-name"
                                type="text"
                                placeholder="Tu nombre completo"
                                className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none px-4 py-3 rounded-xl text-gray-900 text-sm transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                                Correo Electrónico
                            </label>
                            <input
                                id="email-address"
                                type="email"
                                placeholder="tu@email.com"
                                className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none px-4 py-3 rounded-xl text-gray-900 text-sm transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="procedure-type" className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                            Tipo de Trámite
                        </label>
                        <div className="relative">
                            <select
                                id="procedure-type"
                                className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none px-4 py-3 rounded-xl text-gray-700 text-sm appearance-none cursor-pointer transition-colors"
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="compra">Compra de propiedad</option>
                                <option value="venta">Venta de propiedad</option>
                                <option value="registro">Registro de propiedad</option>
                                <option value="hipoteca">Crédito hipotecario</option>
                            </select>
                            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message-text" className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                            Tu Mensaje o Consulta
                        </label>
                        <textarea
                            id="message-text"
                            rows={4}
                            placeholder="Describe detalladamente tu caso..."
                            className="w-full bg-gray-50 border border-gray-300 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 focus:outline-none px-4 py-3 rounded-xl text-gray-900 text-sm resize-none transition-colors"
                        />
                    </div>

                    <div className="flex justify-center pt-2">
                        <button
                            type="submit"
                            className="w-full sm:w-2/3 bg-brand hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-base transition-opacity shadow-sm flex items-center justify-center gap-2"
                        >
                            Enviar mi Consulta
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}