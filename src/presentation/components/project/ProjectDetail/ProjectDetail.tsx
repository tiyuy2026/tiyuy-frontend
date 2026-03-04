import Image from 'next/image';
import { Project } from '@/core/domain/entities/Project';

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-screen bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
        {/* ... resto del HTML del archivo anterior ... */}
      </section>
    </main>
  );
}
