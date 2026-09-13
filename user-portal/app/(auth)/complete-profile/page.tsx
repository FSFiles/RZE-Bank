import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompleteProfileForm } from "./complete-profile-form";

export const metadata = { title: "Complete Your Profile — RZE Bank" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existingCustomer) redirect("/dashboard");

  const meta = user.user_metadata as Record<string, string | undefined>;
  const fullName = meta.full_name ?? meta.name ?? "";
  const [firstFromGoogle, ...restFromGoogle] = fullName.split(" ");

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">Complete your profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as <span className="font-medium">{user.email}</span>. We just need a few
          more details to open your account.
        </p>
      </div>
      <CompleteProfileForm
        defaultFirstName={meta.given_name ?? firstFromGoogle ?? ""}
        defaultLastName={meta.family_name ?? restFromGoogle.join(" ") ?? ""}
        email={user.email ?? ""}
      />
    </div>
  );
}
