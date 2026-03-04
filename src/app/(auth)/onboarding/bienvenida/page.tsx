import { Metadata } from 'next';
import { BienvenidaScreen } from '@/presentation/components/onboarding/BienvenidaScreen';

export const metadata: Metadata = {
  title: 'Bienvenida - TIYUY',
  robots: { index: false, follow: false },
};

export default function BienvenidaPage() {
  return <BienvenidaScreen />;
}
