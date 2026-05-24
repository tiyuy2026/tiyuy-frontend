/**
 * Redirect from /admin/marketing to /admin/campaigns
 */
import { redirect } from 'next/navigation';

export default function MarketingRedirect() {
  redirect('/admin/campaigns');
}
