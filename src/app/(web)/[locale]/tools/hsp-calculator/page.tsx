import { redirect } from "next/navigation";

export default async function RedirectToNew({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/tools/hsp-points`);
}
