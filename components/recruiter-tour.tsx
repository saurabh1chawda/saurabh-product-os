"use client";

import { ArrowDown, ArrowRight, CheckCircle2, FileText, GitBranch, Mail, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { trackAnalyticsEvent } from "@/lib/analytics";

const steps = [
  {
    title: "Welcome",
    eyebrow: "Step 1",
    timeRemaining: "5 min remaining"
  },
  {
    title: "Product Philosophy",
    eyebrow: "Step 2",
    timeRemaining: "4 min remaining"
  },
  {
    title: "Decision System Preview",
    eyebrow: "Step 3",
    timeRemaining: "3 min remaining"
  },
  {
    title: "Decision Journal Preview",
    eyebrow: "Step 4",
    timeRemaining: "2 min remaining"
  },
  {
    title: "Career Impact",
    eyebrow: "Step 5",
    timeRemaining: "90 sec remaining"
  },
  {
    title: "Why Work With Me",
    eyebrow: "Step 6",
    timeRemaining: "45 sec remaining"
  },
  {
    title: "Continue Exploring",
    eyebrow: "Step 7",
    timeRemaining: "Tour complete"
  }
];

const decisionStages = ["Customer Problem", "Current Behaviour", "Root Cause", "AI Suitability", "Decision"];
const journalStages = ["Problem", "Discovery", "Decision", "Outcome"];

const metrics = [
  { metric: "10×", label: "Revenue Growth" },
  { metric: "10M+", label: "Monthly Transactions" },
  { metric: "40%", label: "Latency Reduction" },
  { metric: "15+", label: "Enterprise Deployments" }
];

const workCards = [
  {
    title: "Product Strategy",
    description: "I clarify the product problem, trade-offs, and sequence before teams commit capacity."
  },
  {
    title: "AI Product Management",
    description: "I evaluate whether AI improves the workflow, not whether it sounds impressive."
  },
  {
    title: "Execution Excellence",
    description: "I connect decisions to metrics, alignment, and delivery rhythm."
  }
];

const finalLinks = [
  {
    label: "Decision Systems",
    href: "/decision-systems/customer-discovery",
    eventName: "decision_system_clicked" as const,
    icon: <GitBranch className="h-4 w-4" aria-hidden="true" />
  },
  {
    label: "Decision Journals",
    href: "/stories/product-discovery-jove",
    eventName: "decision_journal_clicked" as const,
    icon: <FileText className="h-4 w-4" aria-hidden="true" />
  },
  {
    label: "Professional Profile",
    href: "/profile",
    eventName: "contact_click" as const,
    icon: <FileText className="h-4 w-4" aria-hidden="true" />
  },
  {
    label: "For Recruiters",
    href: "/for-recruiters",
    eventName: "for_recruiters_clicked" as const,
    icon: <UserRound className="h-4 w-4" aria-hidden="true" />
  },
  {
    label: "LinkedIn",
    href: "/contact",
    eventName: "linkedin_click" as const,
    icon: <UserRound className="h-4 w-4" aria-hidden="true" />
  },
  {
    label: "Email",
    href: "/contact",
    eventName: "email_click" as const,
    icon: <Mail className="h-4 w-4" aria-hidden="true" />
  }
];

export function RecruiterTour() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const progress = useMemo(() => ((currentStepIndex + 1) / steps.length) * 100, [currentStepIndex]);

  useEffect(() => {
    trackAnalyticsEvent("tour_started", {
      module_name: "Recruiter Guided Tour"
    });
  }, []);

  useEffect(() => {
    trackAnalyticsEvent("tour_step_viewed", {
      tour_step: currentStepIndex + 1,
      tour_step_name: currentStep.title
    });

    if (currentStepIndex === steps.length - 1) {
      trackAnalyticsEvent("tour_completed", {
        module_name: "Recruiter Guided Tour"
      });
    }
  }, [currentStep.title, currentStepIndex]);

  function continueTour() {
    setCurrentStepIndex((stepIndex) => Math.min(stepIndex + 1, steps.length - 1));
  }

  function trackFinalLink(eventName: (typeof finalLinks)[number]["eventName"], label: string, href: string) {
    trackAnalyticsEvent(eventName, {
      ...(eventName === "decision_system_clicked" ? { decision_system_name: label } : {}),
      ...(eventName === "decision_journal_clicked" ? { decision_journal_name: label } : {}),
      link_text: label,
      link_url: href
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[260px_1fr] lg:px-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-md border border-line bg-panel p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-label="Tour progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">{currentStep.timeRemaining}</p>
          <nav aria-label="Tour steps" className="mt-6 grid gap-2 text-sm">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                className={`min-h-11 rounded-md px-3 text-left transition ${index === currentStepIndex ? "bg-paper font-semibold text-ink" : "text-muted hover:bg-paper hover:text-ink"}`}
                onClick={() => setCurrentStepIndex(index)}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <section className="min-w-0 rounded-md border border-line bg-panel p-5 sm:p-6" aria-labelledby="tour-step-title">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{currentStep.eyebrow}</p>
        <h1 id="tour-step-title" className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          {currentStep.title}
        </h1>
        <div className="mt-8">{renderStep(currentStepIndex, continueTour, trackFinalLink)}</div>
      </section>
    </div>
  );
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-ink"
      onClick={onClick}
    >
      Continue
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function renderStep(
  stepIndex: number,
  continueTour: () => void,
  trackFinalLink: (eventName: (typeof finalLinks)[number]["eventName"], label: string, href: string) => void
) {
  if (stepIndex === 0) {
    return (
      <>
        <p className="max-w-3xl text-xl leading-8 text-ink">
          If you&apos;re evaluating me for a Senior or Lead Product Manager role, this guided tour will show how I think, make product decisions and lead complex product initiatives.
        </p>
        <ContinueButton onClick={continueTour} />
      </>
    );
  }

  if (stepIndex === 1) {
    return (
      <>
        <div className="grid gap-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
          <p>Technology changes.</p>
          <p>Customer problems persist.</p>
          <p>Decision quality compounds.</p>
        </div>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
          Everything in this Product Operating System is built around improving the quality of product decisions.
        </p>
        <ContinueButton onClick={continueTour} />
      </>
    );
  }

  if (stepIndex === 2) {
    return (
      <>
        <div className="rounded-md border border-line bg-paper p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Customer Discovery</p>
          <div className="mt-5 grid gap-3">
            {decisionStages.map((stage, index) => (
              <div key={stage}>
                <div className="rounded-md border border-line bg-panel p-4 font-semibold text-ink">{stage}</div>
                {index < decisionStages.length - 1 ? (
                  <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-5 leading-7 text-muted">
            Key insight: successful AI product work starts with customer behavior, not model selection.
          </p>
          <blockquote className="mt-5 border-l-2 border-accent pl-4 font-semibold leading-7 text-ink">
            Start with the customer. Let evidence determine whether AI belongs in the solution.
          </blockquote>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/decision-systems/customer-discovery" variant="secondary" onClick={() => trackAnalyticsEvent("decision_system_clicked", { decision_system_name: "Customer Discovery", link_url: "/decision-systems/customer-discovery" })}>
            Read Full Decision System
          </ButtonLink>
          <ContinueButton onClick={continueTour} />
        </div>
      </>
    );
  }

  if (stepIndex === 3) {
    return (
      <>
        <div className="rounded-md border border-line bg-paper p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">JoVE</p>
          <h2 className="mt-3 text-2xl font-semibold text-ink">Workflow adoption</h2>
          <div className="mt-6 grid gap-3">
            {journalStages.map((stage, index) => (
              <div key={stage}>
                <div className="rounded-md border border-line bg-panel p-4 font-semibold text-ink">{stage}</div>
                {index < journalStages.length - 1 ? (
                  <div className="flex justify-center py-2 text-accent" aria-hidden="true">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/stories/product-discovery-jove" variant="secondary" onClick={() => trackAnalyticsEvent("decision_journal_clicked", { decision_journal_name: "JoVE Workflow Adoption", link_url: "/stories/product-discovery-jove" })}>
            Read Full Journal
          </ButtonLink>
          <ContinueButton onClick={continueTour} />
        </div>
      </>
    );
  }

  if (stepIndex === 4) {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.metric} className="rounded-md border border-line bg-paper p-5">
              <p className="text-4xl font-semibold leading-none text-ink">{metric.metric}</p>
              <p className="mt-4 font-semibold text-ink">{metric.label}</p>
            </div>
          ))}
        </div>
        <ContinueButton onClick={continueTour} />
      </>
    );
  }

  if (stepIndex === 5) {
    return (
      <>
        <div className="grid gap-4 lg:grid-cols-3">
          {workCards.map((card) => (
            <article key={card.title} className="rounded-md border border-line bg-paper p-5">
              <CheckCircle2 className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold text-ink">{card.title}</h2>
              <p className="mt-3 leading-7 text-muted">{card.description}</p>
            </article>
          ))}
        </div>
        <ContinueButton onClick={continueTour} />
      </>
    );
  }

  return (
    <div>
      <p className="text-xl leading-8 text-ink">Where would you like to go next?</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {finalLinks.map((link) => (
          <ButtonLink
            key={link.label}
            href={link.href}
            variant="secondary"
            onClick={() => trackFinalLink(link.eventName, link.label, link.href)}
          >
            {link.icon}
            {link.label}
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}
