"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronDown, ClipboardCheck, Gauge, Layers3, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type {
  AIProductStudioData,
  AutomationLadderItem,
  StudioCriterion,
  StudioField,
  StudioRelatedEvidence,
  StudioStep,
  TrustChecklistItem
} from "@/data/ai-product-playbook/types";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type AIProductStudioProps = {
  studio: AIProductStudioData;
};

export function AIProductStudio({ studio }: AIProductStudioProps) {
  const [activeFit, setActiveFit] = useState("AI-assisted fit");
  const [activeAutomation, setActiveAutomation] = useState(
    studio.automationLadder.find((item) => item.isDefault)?.id ?? studio.automationLadder[0]?.id ?? ""
  );
  const [selectedTrustItems, setSelectedTrustItems] = useState<Set<string>>(
    () => new Set(["Explainability", "User control", "Fallback path", "Auditability"])
  );

  function toggleTrustItem(item: TrustChecklistItem) {
    setSelectedTrustItems((currentItems) => {
      const nextItems = new Set(currentItems);

      if (nextItems.has(item.title)) {
        nextItems.delete(item.title);
      } else {
        nextItems.add(item.title);
      }

      return nextItems;
    });

    trackAnalyticsEvent("trust_checklist_item_clicked", {
      scorecard_item: item.title
    });
  }

  return (
    <section id="ai-product-studio" className="border-b border-line bg-panel" aria-labelledby="ai-product-studio-title">
      <StudioViewedSentinel title={studio.title} />
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Guided Review</p>
            <h2 id="ai-product-studio-title" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {studio.title}
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted">{studio.subtitle}</p>
          </div>
          <a
            href="#studio-step-customer-problem"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
          >
            Start the Studio
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4">
            {studio.steps.map((step, index) => (
              <StudioStep
                key={step.id}
                activeAutomation={activeAutomation}
                activeFit={activeFit}
                automationLadder={studio.automationLadder}
                index={index}
                selectedTrustItems={selectedTrustItems}
                setActiveAutomation={setActiveAutomation}
                setActiveFit={setActiveFit}
                step={step}
                toggleTrustItem={toggleTrustItem}
                totalSteps={studio.steps.length}
                trustChecklist={studio.trustChecklist}
              />
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="AI Product Studio summary">
            <RecommendationPanel studio={studio} />
          </aside>
        </div>

        <section className="mt-12" aria-labelledby="studio-related-title">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Related Evidence</p>
            <h3 id="studio-related-title" className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Where this thinking shows up in Product OS
            </h3>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {studio.relatedEvidence.map((item) => (
              <RelatedEvidenceCard key={item.title} item={item} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function StudioStep({
  activeAutomation,
  activeFit,
  automationLadder,
  index,
  selectedTrustItems,
  setActiveAutomation,
  setActiveFit,
  step,
  toggleTrustItem,
  totalSteps,
  trustChecklist
}: {
  activeAutomation: string;
  activeFit: string;
  automationLadder: AutomationLadderItem[];
  index: number;
  selectedTrustItems: Set<string>;
  setActiveAutomation: (id: string) => void;
  setActiveFit: (fit: string) => void;
  step: StudioStep;
  toggleTrustItem: (item: TrustChecklistItem) => void;
  totalSteps: number;
  trustChecklist: TrustChecklistItem[];
}) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("studio_step_viewed", {
            section_name: step.title
          });
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [step.title]);

  function toggleOpen() {
    const nextOpen = !isOpen;

    setIsOpen(nextOpen);

    if (nextOpen) {
      trackAnalyticsEvent("studio_step_expanded", {
        section_name: step.title
      });
    }
  }

  return (
    <section
      ref={sectionRef}
      id={`studio-step-${step.id}`}
      className="scroll-mt-24 rounded-md border border-line bg-paper shadow-soft"
      aria-labelledby={`studio-step-${step.id}-title`}
    >
      <button
        type="button"
        className="flex min-h-14 w-full items-start justify-between gap-4 px-5 py-5 text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper"
        aria-expanded={isOpen}
        aria-controls={`studio-step-${step.id}-content`}
        onClick={toggleOpen}
      >
        <span className="flex min-w-0 gap-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-line bg-panel text-sm font-semibold text-accent">
            {index + 1}
          </span>
          <span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{step.step}</span>
            <span
              id={`studio-step-${step.id}-title`}
              role="heading"
              aria-level={3}
              className="mt-1 block text-xl font-semibold leading-tight text-ink"
            >
              {step.title}
            </span>
            <span className="mt-2 block leading-7 text-muted">{step.purpose}</span>
          </span>
        </span>
        <span className="flex flex-none items-center gap-3">
          <StudioBadge>{step.status}</StudioBadge>
          <ChevronDown className={cn("h-5 w-5 text-accent transition", isOpen ? "rotate-180" : "")} aria-hidden="true" />
        </span>
      </button>

      {isOpen ? (
        <div id={`studio-step-${step.id}-content`} className="border-t border-line px-5 py-5">
          <StepBody
            activeAutomation={activeAutomation}
            activeFit={activeFit}
            automationLadder={automationLadder}
            selectedTrustItems={selectedTrustItems}
            setActiveAutomation={setActiveAutomation}
            setActiveFit={setActiveFit}
            step={step}
            toggleTrustItem={toggleTrustItem}
            trustChecklist={trustChecklist}
          />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-sm font-semibold text-muted">
              Review step {index + 1} of {totalSteps}
            </p>
            <p className="rounded-full border border-line bg-panel px-3 py-1 text-sm font-semibold text-ink">Output: {step.output}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StepBody({
  activeAutomation,
  activeFit,
  automationLadder,
  selectedTrustItems,
  setActiveAutomation,
  setActiveFit,
  step,
  toggleTrustItem,
  trustChecklist
}: {
  activeAutomation: string;
  activeFit: string;
  automationLadder: AutomationLadderItem[];
  selectedTrustItems: Set<string>;
  setActiveAutomation: (id: string) => void;
  setActiveFit: (fit: string) => void;
  step: StudioStep;
  toggleTrustItem: (item: TrustChecklistItem) => void;
  trustChecklist: TrustChecklistItem[];
}) {
  if (step.id === "customer-problem" && step.fields) {
    return (
      <div className="grid gap-5">
        <div className="rounded-md border border-line bg-panel p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Question</p>
          <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">{step.question}</h3>
          <p className="mt-3 leading-7 text-muted">{step.guidance}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {step.fields.map((field) => (
            <FieldCard key={field.title} field={field} />
          ))}
        </div>
      </div>
    );
  }

  if (step.id === "ai-opportunity" && step.criteria && step.outputExamples) {
    return (
      <div className="grid gap-5">
        <FrameworkHeader step={step} />
        <div className="grid gap-3 sm:grid-cols-2">
          {step.criteria.map((criterion) => (
            <CriteriaCard key={criterion.title} criterion={criterion} />
          ))}
        </div>
        <div className="rounded-md border border-line bg-panel p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Example States</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {step.outputExamples.map((example) => (
              <button
                key={example}
                type="button"
                className={cn(
                  "min-h-11 rounded-md border p-4 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel",
                  activeFit === example ? "border-accent bg-accent/10 text-ink" : "border-line bg-paper text-muted hover:border-accent"
                )}
                aria-pressed={activeFit === example}
                onClick={() => setActiveFit(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step.id === "automation-depth") {
    return (
      <div className="grid gap-5">
        <FrameworkHeader step={step} />
        {step.decisionFactors ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {step.decisionFactors.map((factor) => (
              <div key={factor} className="rounded-md border border-line bg-panel p-4">
                <p className="text-sm font-semibold text-ink">{factor}</p>
              </div>
            ))}
          </div>
        ) : null}
        <AutomationLadder activeAutomation={activeAutomation} items={automationLadder} setActiveAutomation={setActiveAutomation} />
      </div>
    );
  }

  if (step.id === "trust") {
    return (
      <div className="grid gap-5">
        <FrameworkHeader step={step} />
        <TrustChecklist items={trustChecklist} selectedItems={selectedTrustItems} toggleItem={toggleTrustItem} />
        {step.outputExamples ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {step.outputExamples.map((status) => (
              <div key={status} className="rounded-md border border-line bg-panel p-4 text-sm font-semibold text-ink">
                {status}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-line bg-panel p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Synthesis</p>
      <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">{step.output}</h3>
      <p className="mt-3 leading-7 text-muted">{step.purpose}</p>
    </div>
  );
}

export function CriteriaCard({ criterion }: { criterion: StudioCriterion }) {
  return (
    <article className="rounded-md border border-line bg-panel p-4">
      <Gauge className="h-5 w-5 text-accent" aria-hidden="true" />
      <h4 className="mt-4 font-semibold leading-6 text-ink">{criterion.title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted">{criterion.description}</p>
    </article>
  );
}

function FieldCard({ field }: { field: StudioField }) {
  return (
    <article className="rounded-md border border-line bg-panel p-4">
      <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden="true" />
      <h4 className="mt-4 font-semibold leading-6 text-ink">{field.title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted">{field.description}</p>
    </article>
  );
}

export function AutomationLadder({
  activeAutomation,
  items,
  setActiveAutomation
}: {
  activeAutomation: string;
  items: AutomationLadderItem[];
  setActiveAutomation: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-line bg-panel p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Automation Ladder</p>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn(
              "grid min-h-11 gap-3 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel sm:grid-cols-[44px_1fr]",
              activeAutomation === item.id ? "border-accent bg-accent/10" : "border-line bg-paper hover:border-accent"
            )}
            aria-pressed={activeAutomation === item.id}
            onClick={() => {
              setActiveAutomation(item.id);
              trackAnalyticsEvent("automation_ladder_clicked", {
                recommendation: item.title
              });
            }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-sm font-semibold text-accent">
              {item.level}
            </span>
            <span>
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{item.title}</span>
                {item.isDefault ? <StudioBadge>Balanced default</StudioBadge> : null}
              </span>
              <span className="mt-2 block text-sm leading-6 text-muted">{item.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TrustChecklist({
  items,
  selectedItems,
  toggleItem
}: {
  items: TrustChecklistItem[];
  selectedItems: Set<string>;
  toggleItem: (item: TrustChecklistItem) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const isSelected = selectedItems.has(item.title);

        return (
          <button
            key={item.title}
            type="button"
            className={cn(
              "min-h-11 rounded-md border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-paper",
              isSelected ? "border-accent bg-accent/10" : "border-line bg-panel hover:border-accent"
            )}
            aria-pressed={isSelected}
            onClick={() => toggleItem(item)}
          >
            <span className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">{item.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted">{item.description}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RecommendationPanel({ studio }: { studio: AIProductStudioData }) {
  const recommendationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = recommendationRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          trackAnalyticsEvent("studio_recommendation_viewed", {
            recommendation: studio.recommendation.architecture
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [studio.recommendation.architecture]);

  return (
    <div ref={recommendationRef} className="rounded-md border border-line bg-paper p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <CheckCircle2 className="h-6 w-6 text-accent" aria-hidden="true" />
        <StudioBadge>Static v1 output</StudioBadge>
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">Recommended AI Product Strategy</p>
      <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">{studio.recommendation.architecture}</h3>
      <dl className="mt-5 grid gap-3">
        <SummaryItem label="AI Fit" value={studio.recommendation.aiFit} />
        <SummaryItem label="Trust Model" value={studio.recommendation.trustModel} />
      </dl>
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Primary Risks</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {studio.recommendation.primaryRisks.map((risk) => (
            <span key={risk} className="rounded-full border border-line bg-panel px-3 py-1 text-sm font-semibold text-ink">
              {risk}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Success Metrics</p>
        <ul className="mt-3 grid gap-2">
          {studio.recommendation.successMetrics.map((metric) => (
            <li key={metric} className="flex gap-2 text-sm leading-6 text-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
              {metric}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 rounded-md border border-line bg-panel p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">Recommended Next Step</p>
        <p className="mt-2 leading-7 text-ink">{studio.recommendation.nextStep}</p>
      </div>
    </div>
  );
}

export function RelatedEvidenceCard({ item }: { item: StudioRelatedEvidence }) {
  return (
    <Link
      href={item.href}
      className="rounded-md border border-line bg-paper p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
      onClick={() => {
        trackAnalyticsEvent("studio_related_evidence_clicked", {
          module_name: item.title,
          link_text: item.cta,
          link_url: item.href
        });
      }}
    >
      <Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />
      <h4 className="mt-5 text-xl font-semibold leading-tight text-ink">{item.title}</h4>
      <p className="mt-3 leading-7 text-muted">{item.description}</p>
      <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">
        {item.cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </p>
    </Link>
  );
}

function FrameworkHeader({ step }: { step: StudioStep }) {
  return (
    <div className="rounded-md border border-line bg-panel p-5">
      {step.framework ? (
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{step.framework}</p>
      ) : null}
      <h3 className="mt-2 text-2xl font-semibold leading-tight text-ink">{step.output}</h3>
      <p className="mt-3 leading-7 text-muted">{step.purpose}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">{label}</dt>
      <dd className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</dd>
    </div>
  );
}

function StudioBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-panel px-2.5 text-xs font-semibold text-muted">
      {children}
    </span>
  );
}

function StudioViewedSentinel({ title }: { title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  const observerOptions = useMemo(() => ({ threshold: 0.3 }), []);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !hasTracked.current) {
        hasTracked.current = true;
        trackAnalyticsEvent("ai_product_studio_viewed", {
          section_name: title
        });
        observer.disconnect();
      }
    }, observerOptions);

    observer.observe(element);

    return () => observer.disconnect();
  }, [observerOptions, title]);

  return <div ref={ref} aria-hidden="true" className="sr-only" />;
}
