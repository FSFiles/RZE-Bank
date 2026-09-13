import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

// Never statically cache anything under /dashboard: every page here
// is per-user, session-dependent data, and must always be rendered
// fresh from the current request's cookies.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 py-28">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
      <Footer />
    </>
  );
}
