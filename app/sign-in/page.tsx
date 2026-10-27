import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      <AuthForm mode="sign-in" />
    </main>
  );
}