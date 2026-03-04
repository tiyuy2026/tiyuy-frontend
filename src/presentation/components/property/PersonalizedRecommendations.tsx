interface RecommendationProps {
  title: string;
  properties: any[];
}

export function PersonalizedRecommendations({ title, properties }: RecommendationProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      
      {/* Placeholder - luego conectaremos con API real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          🔄 Cargando recomendaciones...
        </p>
      </div>
    </div>
  );
}
