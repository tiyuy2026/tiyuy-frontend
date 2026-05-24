/**
 * Redirect from /admin/marketing/pricing to /admin/campaigns/pricing
 */
import { redirect } from 'next/navigation';

export default function MarketingPricingRedirect() {
  redirect('/admin/campaigns/pricing');
}
