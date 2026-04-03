import { redirect } from 'next/navigation';

// This catches all routes and redirects appropriately
export default function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  // If we have 2 segments, it's type/location
  // If we have 1 segment, it's a project slug
  redirect('/proyectos');
}
