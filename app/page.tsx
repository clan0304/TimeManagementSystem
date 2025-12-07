import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">
          Time Management App
        </h1>
        <p className="text-lg text-slate-600 max-w-md">
          Take control of your time and boost your productivity.
        </p>
        <Link href="/auth">
          <Button size="lg" className="mt-4">
            Get Started
          </Button>
        </Link>
      </div>
    </main>
  );
}
