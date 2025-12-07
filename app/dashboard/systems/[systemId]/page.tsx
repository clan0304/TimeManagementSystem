import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getEnabledSystems } from '@/lib/systems/queries';
import { getSystemById } from '@/lib/systems/registry';
import { EnableSystemButton } from './components/enable-system-button';

type PageProps = {
  params: Promise<{ systemId: string }>;
};

export default async function SystemDetailPage({ params }: PageProps) {
  const { systemId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/auth');
  }

  const system = getSystemById(systemId);

  if (!system) {
    notFound();
  }

  const client = await createServerSupabaseClient();
  const enabledSystems = await getEnabledSystems(client, userId);
  const isEnabled = enabledSystems[system.id] === true;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <span className="text-5xl">{system.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{system.name}</h1>
            <p className="text-slate-600 mt-1">{system.description}</p>
          </div>
        </div>
        <EnableSystemButton system={system} isEnabled={isEnabled} />
      </div>

      {/* Long Description */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            What is {system.name}?
          </h2>
          <p className="text-slate-600 leading-relaxed">
            {system.details.longDescription}
          </p>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Benefits
          </h2>
          <ul className="space-y-3">
            {system.details.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-slate-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            How to Use
          </h2>
          <div className="space-y-6">
            {system.details.steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-blue-600">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inspirations */}
      {system.details.inspirations &&
        system.details.inspirations.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Inspired By
              </h2>
              <div className="flex flex-wrap gap-2">
                {system.details.inspirations.map((inspiration, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                  >
                    {inspiration}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Bottom CTA */}
      <div className="flex justify-center pt-4">
        <EnableSystemButton system={system} isEnabled={isEnabled} size="lg" />
      </div>
    </div>
  );
}
