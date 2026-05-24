/**
 * Redirect from /admin/marketing/festive to /admin/campaigns/festive
 */
import { redirect } from 'next/navigation';

export default function MarketingFestiveRedirect() {
  redirect('/admin/campaigns/festive');
}
