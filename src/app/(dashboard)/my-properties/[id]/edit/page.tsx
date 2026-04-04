import EditPropertyClient from './EditPropertyClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  return <EditPropertyClient id={Number(id)} />;
}
