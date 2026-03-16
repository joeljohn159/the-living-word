import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { READING_PLANS, getPlanBySlug } from "@/lib/reading-plans-data";
import { PlanSchedule } from "./PlanSchedule";

interface PlanDetailPageProps {
  params: { slug: string };
}

/** Generate static params for all plans. */
export function generateStaticParams() {
  return READING_PLANS.map((plan) => ({ slug: plan.slug }));
}

/** Dynamic metadata per plan. */
export function generateMetadata({ params }: PlanDetailPageProps): Metadata {
  const plan = getPlanBySlug(params.slug);
  if (!plan) return { title: "Plan Not Found" };

  return {
    title: plan.name,
    description: plan.description,
  };
}

export default function PlanDetailPage({ params }: PlanDetailPageProps) {
  const plan = getPlanBySlug(params.slug);
  if (!plan) notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 animate-fade-in">
      {/* Back link */}
      <Link
        href="/reading-plans"
        className="inline-flex items-center gap-1.5 font-source-sans text-sm text-muted-foreground hover:text-gold transition-colors mb-6"
        aria-label="Back to reading plans"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All Plans
      </Link>

      {/* Plan header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="heading text-2xl sm:text-3xl md:text-4xl text-gold mb-2">
          {plan.name}
        </h1>
        <p className="font-source-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
          {plan.description}
        </p>
      </div>

      {/* Schedule — client component for progress tracking */}
      <PlanSchedule
        planSlug={plan.slug}
        planName={plan.name}
        durationDays={plan.durationDays}
        schedule={plan.schedule}
      />
    </section>
  );
}
