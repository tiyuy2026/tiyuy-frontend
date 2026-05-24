/**
 * Redirect from /admin/marketing/campaigns to /admin/campaigns/list
 */
import { redirect } from 'next/navigation';

export default function MarketingCampaignsRedirect() {
  redirect('/admin/campaigns/list');
}
