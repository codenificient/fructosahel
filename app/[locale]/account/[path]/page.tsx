// Account settings page.
// Previously used Neon Auth's <AccountView> component; after migration to
// CodeniServer proxy-auth, account management is handled via
// auth.afrotomation.com directly. Redirect users there.

import { redirect } from "next/navigation";

export const dynamicParams = false;

export default async function AccountPage({
  params,
}: {
  params: Promise<{ path: string; locale: string }>;
}) {
  const { path } = await params;

  // Redirect to CodeniServer account management.
  redirect(`https://auth.afrotomation.com/account/${path}`);
}
