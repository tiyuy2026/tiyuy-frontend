'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Building2, MapPin, Users, Home, FolderGit, ArrowLeft, ChevronRight, Mail, Phone, Send, Loader2, CheckCircle2, MessageCircle, AlertCircle, Star, LogIn, UserPlus, X } from 'lucide-react';
import { publicApiClient, apiClient } from '@/infrastructure/api/axios-client';
import { useAuthStore } from '@/presentation/store/authStore';

interface AgencyDetail {
  id: number; slug: string; name: string; logoUrl: string | null; email: string; phone: string;
  city: string; description: string; agentsCount: number; activeProjectsCount: number;
  activePropertiesCount: number; projectsUrl: string; propertiesUrl: string;
}

export default function AgencyDetailPage() {
  const params = useParams(); const router = useRouter(); const { user } = useAuthStore();
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState(''); const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [ratings, setRatings] = useState({ averageRating: 0, totalRatings: 0 });
  const [userRating, setUserRating] = useState(0); const [hoverRating, setHoverRating] = useState(0);
  const [sendingRating, setSendingRating] = useState(false); const [ratingMsg, setRatingMsg] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await publicApiClient.get<AgencyDetail>(`/public/agencies/${params.slug}`);
        setAgency(res.data);
        // Fetch rating summary (público)
        try { const r = await publicApiClient.get(`/interactions/ratings/user/${res.data.id}/summary`); setRatings(r.data); } catch {}
        // Fetch current user's existing rating (requires auth)
        if (user) {
          try { const my = await apiClient.get(`/interactions/ratings/my-rating/${res.data.id}`); if (my.data.score > 0) setUserRating(my.data.score); } catch {}
        }
      } catch { /* empty */ } finally { setLoading(false); }
    })();
  }, [params.slug, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) { setFormError('Completa tu nombre y mensaje'); return; }
    setSending(true); setFormError('');
    try {
      await publicApiClient.post('/interactions/leads', {
        name: formData.name.trim(), email: formData.email.trim() || undefined, phone: formData.phone.trim() || undefined,
        message: formData.message.trim(), toAgency: agency?.name, toAgencyId: agency?.id, source: 'agencia_perfil', recipientUserId: agency?.id,
      });
      setFormSent(true);
    } catch { setFormError('Error al enviar'); } finally { setSending(false); }
  };

  const handleRate = async (score: number) => {
    if (!agency) return;
    if (!user) { setShowAuthModal(true); return; }
    setSendingRating(true); setRatingMsg('');
    // Optimistic: paint stars immediately
    setUserRating(score);
    try {
      await apiClient.post('/interactions/ratings', { ratedUserId: agency.id, score, comment: '' });
      setRatingMsg('¡Calificación guardada!');
      const r = await publicApiClient.get(`/interactions/ratings/user/${agency.id}/summary`);
      setRatings(r.data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Error';
      if (status === 409) {
        // Already rated — keep stars painted, show message
        setRatingMsg('Ya has calificado a este usuario');
        // Still refresh summary
        try { const r = await publicApiClient.get(`/interactions/ratings/user/${agency.id}/summary`); setRatings(r.data); } catch {}
      } else {
        setRatingMsg(msg);
        setUserRating(0);
      }
    } finally { setSendingRating(false); }
  };

  const waNumber = agency?.phone?.replace(/[^0-9]/g, '') || '';
  const waMessage = encodeURIComponent(`Hola ${agency?.name || ''}, vi tu perfil en Tiyuy.`);

  const handleWhatsApp = (e: React.MouseEvent) => {
    if (!user) { e.preventDefault(); setShowAuthModal(true); }
  };
  const handleOpenForm = () => {
    if (!user) { setShowAuthModal(true); return; }
    setShowForm(true);
  };

  if (loading) return <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#2d5a3d] border-t-transparent rounded-full animate-spin" /></div>;
  if (!agency) return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="text-center"><Building2 className="w-12 h-12 text-[#d4d0ca] mx-auto mb-3" /><p className="text-sm font-medium text-[#a0988c]">Inmobiliaria no encontrada</p><Link href="/agencies" className="text-sm text-[#2d5a3d] hover:underline mt-2 inline-block">Volver al directorio</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="relative bg-gradient-to-br from-[#3f9800]/90 via-[#3f9800]/85 to-[#2d6e00]/90 text-white overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: `url('https://nexoinmobiliario.pe/blog/wp-content/uploads/2022/06/decorar-departamento-bajo-presupuesto-nexo-inmobiliario.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <Link href="/agencies" className="inline-flex items-center gap-1 text-sm text-[#cbd5c6] hover:text-white mb-6"><ArrowLeft className="w-4 h-4" /> Volver al directorio</Link>
          <div className="flex items-start gap-6">
            {agency.logoUrl ? <img src={agency.logoUrl} alt={agency.name} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 border border-white/10" />
            : <div className="w-20 h-20 rounded-2xl bg-[#f5f1eb] flex items-center justify-center text-[#2d5a3d] font-bold text-3xl flex-shrink-0">{agency.name?.[0] || 'I'}</div>}
            <div className="flex-1"><h1 className="text-3xl sm:text-4xl font-bold">{agency.name}</h1><div className="flex flex-wrap items-center gap-4 mt-2 text-[#cbd5c6] text-sm">{agency.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{agency.city}</span>}</div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href={agency.projectsUrl || '#'} className={`bg-white rounded-2xl border-2 border-[#e8e3dd] p-5 hover:shadow-[0_12px_40px_rgba(100,204,57,0.08)] hover:border-[#64cc39] transition-all ${agency.activeProjectsCount > 0 ? '' : 'pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-[#f5f1eb] flex items-center justify-center text-[#2d5a3d]"><FolderGit className="w-5 h-5" /></div><div><p className="text-2xl font-bold text-[#2d2a24]">{agency.activeProjectsCount}</p><p className="text-xs text-[#a0988c]">Proyectos activos</p></div></div>
            {agency.activeProjectsCount > 0 && <span className="text-xs font-medium text-[#2d5a3d] flex items-center gap-1 mt-2">Ver proyectos <ChevronRight className="w-3 h-3" /></span>}
          </Link>
          <Link href={agency.propertiesUrl || '#'} className={`bg-white rounded-2xl border-2 border-[#e8e3dd] p-5 hover:shadow-[0_12px_40px_rgba(100,204,57,0.08)] hover:border-[#64cc39] transition-all ${agency.activePropertiesCount > 0 ? '' : 'pointer-events-none'}`}>
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-[#f5f1eb] flex items-center justify-center text-[#2d5a3d]"><Home className="w-5 h-5" /></div><div><p className="text-2xl font-bold text-[#2d2a24]">{agency.activePropertiesCount}</p><p className="text-xs text-[#a0988c]">Propiedades activas</p></div></div>
            {agency.activePropertiesCount > 0 && <span className="text-xs font-medium text-[#2d5a3d] flex items-center gap-1 mt-2">Ver propiedades <ChevronRight className="w-3 h-3" /></span>}
          </Link>
          <div className="bg-white rounded-2xl border-2 border-[#e8e3dd] p-5 hover:shadow-[0_12px_40px_rgba(100,204,57,0.08)] hover:border-[#64cc39] transition-all">
            <div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 rounded-xl bg-[#f5f1eb] flex items-center justify-center text-[#2d5a3d]"><Users className="w-5 h-5" /></div><div><p className="text-2xl font-bold text-[#2d2a24]">{agency.agentsCount}</p><p className="text-xs text-[#a0988c]">Agentes asociados</p></div></div>
          </div>
        </div>

        {agency.description && <div className="bg-white rounded-3xl border border-[#e8e3dd] p-7"><h2 className="text-lg font-semibold text-[#2d2a24] mb-3">Acerca de</h2><p className="text-sm text-[#8a8275] leading-relaxed">{agency.description}</p></div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-[#e8e3dd] p-7">
            <h2 className="text-lg font-semibold text-[#2d2a24] mb-4">Contacto</h2>
            <div className="space-y-3 mb-6">
              {agency.email && <a href={`mailto:${agency.email}`} className="flex items-center gap-3 text-sm text-[#8a8275] hover:text-[#2d5a3d]"><Mail className="w-4 h-4 text-[#a0988c]" />{agency.email}</a>}
              {agency.phone && <a href={`tel:${agency.phone}`} className="flex items-center gap-3 text-sm text-[#8a8275] hover:text-[#2d5a3d]"><Phone className="w-4 h-4 text-[#a0988c]" />{agency.phone}</a>}
              {agency.city && <div className="flex items-center gap-3 text-sm text-[#8a8275]"><MapPin className="w-4 h-4 text-[#a0988c]" />{agency.city}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {waNumber && <a href={user ? `https://wa.me/51${waNumber}?text=${waMessage}` : '#'} onClick={handleWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold rounded-xl shadow-sm"><MessageCircle className="w-4 h-4" /> WhatsApp</a>}
              {!showForm && !formSent && <button onClick={handleOpenForm} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2d5a3d] hover:bg-[#1a3a2a] text-white text-sm font-semibold rounded-xl shadow-sm"><Send className="w-4 h-4" /> Enviar mensaje</button>}
            </div>
            {showForm && !formSent && (
              <form onSubmit={handleSubmit} className="border-t border-[#f0ece6] pt-5 mt-4 space-y-4">
                <div><label className="block text-xs font-medium text-[#8a8275] mb-1">Nombre *</label><input type="text" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2.5 border border-[#e8e3dd] rounded-xl text-sm outline-none bg-[#faf9f7]" placeholder="Tu nombre" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium">Email</label><input type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="w-full px-4 py-2.5 border border-[#e8e3dd] rounded-xl text-sm outline-none bg-[#faf9f7]" placeholder="tucorreo@ejemplo.com" /></div>
                  <div><label className="block text-xs font-medium">Teléfono</label><input type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-2.5 border border-[#e8e3dd] rounded-xl text-sm outline-none bg-[#faf9f7]" placeholder="+51 999 999 999" /></div>
                </div>
                <div><label className="block text-xs font-medium">Mensaje *</label><textarea value={formData.message} onChange={e => setFormData(p => ({...p, message: e.target.value}))} rows={3} className="w-full px-4 py-2.5 border border-[#e8e3dd] rounded-xl text-sm outline-none bg-[#faf9f7] resize-none" placeholder={`Hola ${agency.name}...`} /></div>
                {formError && <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2"><AlertCircle className="w-4 h-4" />{formError}</div>}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-[#8a8275]">Cancelar</button>
                  <button type="submit" disabled={sending} className="px-5 py-2.5 bg-[#2d5a3d] hover:bg-[#1a3a2a] disabled:bg-[#c4beb6] text-white text-sm font-semibold rounded-xl flex items-center gap-2">
                    {sending ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar</>}
                  </button>
                </div>
              </form>
            )}
            {formSent && <div className="flex items-center gap-3 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-5 py-3 border border-emerald-100 mt-4"><CheckCircle2 className="w-5 h-5" /> Mensaje enviado.</div>}
          </div>

          <div className="bg-white rounded-3xl border border-[#e8e3dd] p-7">
            <h2 className="text-lg font-semibold text-[#2d2a24] mb-4">Calificar inmobiliaria</h2>
            <div className="flex items-center gap-3 mb-5">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-5 h-5 ${i <= Math.round(ratings.averageRating) ? 'text-amber-400 fill-amber-400' : 'text-[#e0e0de]'}`} />)}
              <span className="text-xl font-bold text-[#2d2a24]">{ratings.averageRating > 0 ? ratings.averageRating.toFixed(1) : '—'}</span>
              <span className="text-sm text-[#8a8275]">· {ratings.totalRatings} {ratings.totalRatings === 1 ? 'calificación' : 'calificaciones'}</span>
            </div>
            <div className="border-t border-[#f0ece6] pt-5">
              <p className="text-sm font-medium text-[#2d2a24] mb-3">Tu calificación</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => handleRate(i)} onMouseEnter={() => setHoverRating(i)} onMouseLeave={() => setHoverRating(0)}
                    disabled={sendingRating || userRating > 0} className="transition-transform hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed">
                    <Star className={`w-8 h-8 ${i <= (hoverRating || userRating) ? 'text-amber-400 fill-amber-400' : 'text-[#d4d0ca] hover:text-amber-300'}`} />
                  </button>
                ))}
                {sendingRating && <Loader2 className="w-4 h-4 animate-spin text-[#2d5a3d] ml-2" />}
              </div>
              {ratingMsg && <p className={`text-xs ${ratingMsg.includes('Error') || ratingMsg.includes('Ya has calificado') ? 'text-amber-600' : 'text-emerald-600'} mt-1`}>{ratingMsg}</p>}
              {userRating === 0 && !ratingMsg && <p className="text-xs text-[#a0988c]">Inicia sesión para calificar</p>}
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowAuthModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"><Star className="w-8 h-8 text-amber-500" /></div></div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Calificar inmobiliaria</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Para calificar, primero debes iniciar sesión o crear una cuenta.</p>
            <div className="space-y-3">
              <button onClick={() => { setShowAuthModal(false); router.push('/profile-selector'); }} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-teal-700"><LogIn className="w-4 h-4" /> Iniciar sesión</button>
              <button onClick={() => { setShowAuthModal(false); router.push('/profile-selector'); }} className="w-full flex items-center justify-center gap-2 bg-white text-teal-600 font-semibold py-3 px-4 rounded-xl border-2 border-teal-600 hover:bg-teal-50"><UserPlus className="w-4 h-4" /> Crear cuenta gratis</button>
              <button onClick={() => setShowAuthModal(false)} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2">Ahora no</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}