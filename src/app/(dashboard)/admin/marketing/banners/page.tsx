/**
 * Redirect from /admin/marketing/banners to /admin/campaigns/banners
 */
import { redirect } from 'next/navigation';

export default function MarketingBannersRedirect() {
  redirect('/admin/campaigns/banners');
}
