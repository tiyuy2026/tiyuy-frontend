'use client';

import { Suspense } from 'react';

function MisContactosPageContent() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500 text-sm">Página de contactos en construcción</p>
        </div>
    );
}

export default function MisContactosPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" /></div>}>
            <MisContactosPageContent />
        </Suspense>
    );
}
