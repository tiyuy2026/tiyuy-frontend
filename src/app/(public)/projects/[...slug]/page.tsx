import { redirect } from 'next/navigation';

export default function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  redirect('/projects');
}
