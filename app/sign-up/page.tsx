import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Create an account</h1>
      <AuthForm mode="sign-up" />
    </main>
  );
}