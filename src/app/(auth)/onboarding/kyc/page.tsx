import { Metadata } from 'next';
import { KycScreen } from '@/presentation/components/onboarding/KycScreen';

export const metadata: Metadata = {
  title: 'Verificación KYC - TIYUY',
  robots: { index: false, follow: false },
};

export default function KycPage() {
  return <KycScreen />;
}
