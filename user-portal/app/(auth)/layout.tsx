import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-6 py-32">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <Footer />
    </>
  );
}
