import OfficeDetailClient from "./OfficeDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ officeSlug: string }> }) {
  const { officeSlug } = await params;
  const title = `${decodeURIComponent(officeSlug)} | Companies`;
  return { title };
}

export default async function Page({ params }: { params: Promise<{ locale: string; officeSlug: string }> }) {
  const { locale, officeSlug } = await params;
  return <OfficeDetailClient locale={locale} officeSlug={officeSlug} />;
}
