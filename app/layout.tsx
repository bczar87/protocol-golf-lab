import type { Metadata } from "next";
import { Footer, Header, Pageview, SponsorBar } from "@/components/chrome";
import { getDb, siteUrl } from "@/lib/db";
import { currentSponsor } from "@/lib/queries";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await siteUrl();
  const description =
    "Hitting mats and launch monitors with the spec the maker printed, the price we checked, and a 3-year cost. Lab scores are coming soon.";
  return {
    metadataBase: new URL(site),
    title: { default: "Protocol Golf Lab", template: "%s · Protocol Golf Lab" },
    description,
    openGraph: {
      title: "Protocol Golf Lab",
      description,
      siteName: "Protocol Golf Lab",
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb();
  const sponsor = db ? await currentSponsor(db) : null;
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <SponsorBar sponsor={sponsor} />
        <Pageview />
      </body>
    </html>
  );
}
