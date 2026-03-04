import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectRepository } from '@/infrastructure/repositories/ProjectRepository';
import { 
  Project, 
  ProjectFull, 
  ProjectUnit 
} from '@/core/domain/entities/Project';
// ✅ ELIMINADO: SearchFilters (no existe)
// ✅ INLINE type en su lugar

const projectRepo = new ProjectRepository();

const PROJECT_KEYS = {
  all: ['projects'] as const,
  lists: () => [...PROJECT_KEYS.all, 'list'] as const,
  // ✅ INLINE type (igual que IProjectRepository)
  list: (filters: {
    district?: string;
    province?: string;
    region?: string;
    type?: 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED';
    phase?: 'PRE_SALE' | 'SALE' | 'DELIVERY';
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    isVerified?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }) => [...PROJECT_KEYS.lists(), filters] as const,
  details: () => [...PROJECT_KEYS.all, 'detail'] as const,
  detailId: (id: number) => [...PROJECT_KEYS.details(), id] as const,
  detailSlug: (slug: string) => [...PROJECT_KEYS.details(), 'slug', slug] as const,
  myProjects: (page: number, size: number) => [...PROJECT_KEYS.lists(), 'my', page, size] as const,
  units: (projectId: number) => [...PROJECT_KEYS.all, 'units', projectId] as const,
  stats: (projectId: number) => [...PROJECT_KEYS.all, 'stats', projectId] as const,
};

export const useProjects = () => {
  const queryClient = useQueryClient();

  // 🔍 QUERIES
  
  // ✅ INLINE type para searchProjects
  const useSearchProjects = (
    filters: Parameters<typeof projectRepo.searchProjects>[0],
    options?: { enabled?: boolean }
  ) => {
    return useQuery({
      queryKey: PROJECT_KEYS.list(filters),
      queryFn: () => projectRepo.searchProjects(filters),
      ...options,
    });
  };

  const useMyProjects = (page = 0, size = 20, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: PROJECT_KEYS.myProjects(page, size),
      queryFn: () => projectRepo.getMyProjects(page, size),
      ...options,
    });
  };

  const useProjectById = (projectId: number, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: PROJECT_KEYS.detailId(projectId),
      queryFn: () => projectRepo.getById(projectId),
      enabled: !!projectId,
      ...options,
    });
  };

  const useProjectBySlug = (slug: string, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: PROJECT_KEYS.detailSlug(slug),
      queryFn: () => projectRepo.getBySlug(slug),
      enabled: !!slug,
      ...options,
    });
  };

  const useProjectFull = (projectId: number, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: [...PROJECT_KEYS.detailId(projectId), 'full'],
      queryFn: () => projectRepo.getProjectFull(projectId),
      enabled: !!projectId,
      ...options,
    });
  };

  const useProjectUnits = (projectId: number, page = 0, size = 20, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: PROJECT_KEYS.units(projectId),
      queryFn: () => projectRepo.getProjectUnits(projectId, page, size),
      enabled: !!projectId,
      ...options,
    });
  };

  const useProjectStats = (projectId: number, options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: PROJECT_KEYS.stats(projectId),
      queryFn: () => projectRepo.getProjectStats(projectId),
      enabled: !!projectId,
      ...options,
    });
  };

  // 🚀 MUTATIONS (resto igual...)
  const useCreateProject = () => {
    return useMutation({
      mutationFn: (projectData: Parameters<typeof projectRepo.createProject>[0]) => 
        projectRepo.createProject(projectData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      },
    });
  };

  // ... resto de mutations IGUALES

  return {
    // Queries
    searchProjects: useSearchProjects,
    myProjects: useMyProjects,
    projectById: useProjectById,
    projectBySlug: useProjectBySlug,
    projectFull: useProjectFull,
    projectUnits: useProjectUnits,
    projectStats: useProjectStats,
    
    // Mutations
    createProject: useCreateProject,
    // ... resto
  };
};
