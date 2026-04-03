// ─── GRUPOS CONTENT COMPONENT ───────────────────────────────────────────────────────
function GruposContent({ gruposSection, selectedGroup, setSelectedGroup, user }: {
  gruposSection: 'mis-grupos' | 'descubrir';
  selectedGroup: { id: number; name: string } | null;
  setSelectedGroup: (group: { id: number; name: string } | null) => void;
  user: any;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState<{ group: any } | null>(null);
  const { data: groups, isLoading } = useGetGroups(0, 50);
  const joinGroup = useJoinGroup();
  const leaveGroup = useLeaveGroup();

  // Filtrar grupos según la vista
  const filteredGroups = groups?.filter(group => {
    const matchesSearch = group.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (gruposSection === 'mis-grupos') {
      return group.isMember;
    }
    return true; // descubrir muestra todos
  }) || [];

  // Función para obtener emoji según nombre
  const getGroupEmoji = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('alquiler')) return '🏠';
    if (lowerName.includes('venta')) return '💰';
    if (lowerName.includes('terreno') || lowerName.includes('lote')) return '🌍';
    if (lowerName.includes('inversion')) return '📈';
    if (lowerName.includes('lima')) return '🏙️';
    return '🏘️';
  };

  // Función para unirse/salir de grupo
  const handleJoinLeave = async (groupId: number, isMember: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (isMember) {
        await leaveGroup.mutateAsync(groupId);
      } else {
        await joinGroup.mutateAsync(groupId);
      }
    } catch (error) {
      console.error('Error al unirse/salir del grupo:', error);
    }
  };

  if (selectedGroup && user) {
    return (
      <>
        {/* Botón volver en móvil */}
        <button 
          onClick={() => setSelectedGroup(null)}
          className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200 text-blue-600 text-sm font-medium"
        >
          <IC.ArrowBack /> 
          <span>Volver</span>
        </button>
        
        <GrupoPostsPanel 
          key={selectedGroup.id}
          groupId={selectedGroup.id} 
          groupName={selectedGroup.name} 
          currentUserId={user.id} 
          onCreatePost={() => {}} 
        />
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-[#f0f2f5]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <IC.Groups a={false} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {gruposSection === 'mis-grupos' ? 'No tienes grupos' : 'No se encontraron grupos'}
          </h3>
          <p className="text-gray-600">
            {gruposSection === 'mis-grupos' 
              ? 'Únete a grupos para empezar a participar'
              : 'Intenta con otra búsqueda'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f0f2f5] min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {gruposSection === 'mis-grupos' 
              ? `Todos los grupos a los que te uniste (${filteredGroups.length})`
              : 'Sugerencias para ti'
            }
          </h2>
          <button className="text-sm text-blue-600 hover:text-blue-700">Ver todos →</button>
        </div>
        {gruposSection === 'descubrir' && (
          <p className="text-sm text-gray-600 mt-1">Grupos que pueden interesarte.</p>
        )}
      </div>

      {/* Buscador para descubrir */}
      {gruposSection === 'descubrir' && (
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <IC.Search />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="p-6">
        {gruposSection === 'mis-grupos' ? (
          /* Tarjetas horizontales para "Tus grupos" */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredGroups.map((group: any) => (
              <div
                key={group.id}
                onClick={() => setSelectedGroup({ id: group.id, name: group.name })}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Imagen */}
                  <div className="w-20 h-20 rounded-xl flex-shrink-0 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                    <span className="text-3xl">{getGroupEmoji(group.name)}</span>
                  </div>
                  
                  {/* Información */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-2">{group.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Tu última visita: hace 30 semanas</p>
                    
                    {/* Botones */}
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100">
                        Ver grupo
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShareModal({ group });
                        }}
                        className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                      >
                        <IC.Share />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tarjetas verticales para "Descubrir" */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredGroups.slice(0, 6).map((group: any) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup({ id: group.id, name: group.name })}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md cursor-pointer transition-all"
                >
                  {/* Imagen superior */}
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                    <span className="text-5xl">{getGroupEmoji(group.name)}</span>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{group.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCompactNumber(group.memberCount || 0)} miembros · +{group.postCount || 0} publicaciones al día
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{group.description}</p>
                    
                    {/* Botón */}
                    <button
                      onClick={(e) => handleJoinLeave(group.id, group.isMember, e)}
                      disabled={joinGroup.isPending || leaveGroup.isPending}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors mt-3 ${
                        group.isMember
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {group.isMember ? '✓ Ya eres miembro' : 'Unirse al grupo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Más sugerencias */}
            {filteredGroups.length > 6 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Más sugerencias</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredGroups.slice(6).map((group: any) => (
                    <div
                      key={group.id}
                      onClick={() => setSelectedGroup({ id: group.id, name: group.name })}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="h-40 bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
                        <span className="text-5xl">{getGroupEmoji(group.name)}</span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{group.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatCompactNumber(group.memberCount || 0)} miembros
                        </p>
                        <button
                          onClick={(e) => handleJoinLeave(group.id, group.isMember, e)}
                          disabled={joinGroup.isPending || leaveGroup.isPending}
                          className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors mt-3 ${
                            group.isMember
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } disabled:opacity-50`}
                        >
                          {group.isMember ? '✓ Miembro' : 'Unirse'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          title={showShareModal.group.name}
          link={`${typeof window !== 'undefined' ? window.location.origin : ''}/grupos/${showShareModal.group.id}`}
          onClose={() => setShowShareModal(null)}
        />
      )}
    </div>
  );
}
