// ─── GRUPOS NAVIGATION COMPONENT ───────────────────────────────────────────────────────
function GruposNavigation({ user, gruposSection, setGruposSection, setShowNewGroupModal }: {
  user: any;
  gruposSection: 'mis-grupos' | 'descubrir';
  setGruposSection: (section: 'mis-grupos' | 'descubrir') => void;
  setShowNewGroupModal: (show: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: allGroups } = useGetGroups(0, 10);
  
  // Mis grupos (primeros 3 para mostrar en mini lista)
  const misGrupos = allGroups?.filter(g => g.isMember).slice(0, 3) || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Grupos</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <IC.Settings />
        </button>
      </div>

      {/* Buscador */}
      <div className="p-4">
        <div className="relative">
          <IC.Search />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Navegación principal */}
      <div className="px-4 space-y-1">
        <button
          onClick={() => setGruposSection('descubrir')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-colors ${
            gruposSection === 'descubrir'
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            gruposSection === 'descubrir' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            <IC.Search a={gruposSection === 'descubrir'} />
          </div>
          <span>Descubrir</span>
        </button>

        <button
          onClick={() => setGruposSection('mis-grupos')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-colors ${
            gruposSection === 'mis-grupos'
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
            gruposSection === 'mis-grupos' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}>
            <IC.Groups a={gruposSection === 'mis-grupos'} />
          </div>
          <span>Tus grupos</span>
        </button>

        <button
          onClick={() => setShowNewGroupModal(true)}
          className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 rounded-xl bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100 transition-colors"
        >
          <span className="text-lg">+</span>
          <span>Crear nuevo grupo</span>
        </button>
      </div>

      {/* Mini lista de grupos */}
      {misGrupos.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Grupos a los que te uniste</span>
            <button className="text-xs text-blue-600 hover:text-blue-700">Ver todo →</button>
          </div>
          <div className="space-y-2">
            {misGrupos.map((group: any) => (
              <div key={group.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {group.name?.charAt(0) || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                  <p className="text-xs text-gray-400">Activo hace 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
