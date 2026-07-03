import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Award,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Layers3,
  Mail,
  Sparkles,
  TrendingUp
} from "lucide-react";

import {
  ProfessionalProfileSectionViewed,
  ProfessionalProfileTrackedLink,
  ProfessionalProfileViewed
} from "@/components/professional-profile-interactions";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Professional Profile | Saurabh Chawda",
  description:
    "Professional profile of Saurabh Chawda, Lead Product Manager specializing in AI products, platform strategy, experimentation, analytics and measurable business outcomes.",
  alternates: {
    canonical: "/profile"
  },
  openGraph: {
    title: "Professional Profile | Saurabh Chawda",
    description:
      "Explore Saurabh Chawda's professional profile, product capabilities, business outcomes, and Product OS evidence.",
    url: "https://saurabh-product-os.vercel.app/profile",
    type: "website",
    siteName: "Product Operating System",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Saurabh Chawda Product Operating System"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Profile | Saurabh Chawda",
    description:
      "Professional profile of Saurabh Chawda, Lead Product Manager specializing in AI products, platform strategy, experimentation, analytics and measurable business outcomes.",
    images: ["/og-image.png"]
  }
};

const positioningCards = [
  {
    title: "Current Focus",
    items: ["AI Product Management", "Platform Strategy", "Product Growth"]
  },
  {
    title: "Experience",
    items: ["8+ Years", "B2B + Consumer", "0→1 & Scale"]
  },
  {
    title: "Industries",
    items: ["SaaS", "FinTech", "EdTech", "Enterprise Platforms"]
  }
];

const buildAreas = [
  {
    title: "AI Products",
    description: "AI product decisions grounded in customer workflows, measurable outcomes, trust, and business value."
  },
  {
    title: "Platform Products",
    description: "Reusable platform capabilities that improve scale, reliability, release velocity, and long-term leverage."
  },
  {
    title: "Growth & Experimentation",
    description: "Growth systems shaped by funnel evidence, pricing signals, referral loops, and conversion learning."
  },
  {
    title: "Customer Discovery",
    description: "Discovery systems that separate stated requests from real workflow needs and adoption barriers."
  },
  {
    title: "Product Analytics",
    description: "Measurement models that connect customer behavior, product health, and business outcomes."
  },
  {
    title: "Cross-functional Leadership",
    description: "Clear product direction across engineering, design, data, sales, success, operations, and leadership."
  }
];

const careerJourney = [
  {
    role: "Data Analyst",
    company: "Analytics foundation",
    duration: "Early career",
    impact: "Built the analytical base for translating customer behavior and business signals into product decisions."
  },
  {
    role: "Product Manager",
    company: "Comviva",
    duration: "Payments platform",
    impact: "Worked on payment and wallet experiences where reliability, trust, and transaction success shaped customer value."
  },
  {
    role: "Senior Product Manager",
    company: "JoVE",
    duration: "Enterprise SaaS",
    impact: "Used discovery, roadmap strategy, and analytics to improve engagement and strengthen enterprise product adoption."
  },
  {
    role: "Head of Product",
    company: "Logix",
    duration: "Platform products",
    impact: "Sequenced modernization around customer value, release velocity, latency, and operational reliability."
  },
  {
    role: "Lead Product Manager",
    company: "Product OS",
    duration: "AI + platform strategy",
    impact: "Focuses on AI product judgment, platform strategy, experimentation, analytics, and measurable business outcomes."
  }
];

const capabilities = [
  {
    title: "Product Strategy",
    description: "Connect customer needs, business goals, technical constraints, and measurable product direction."
  },
  {
    title: "Platform Thinking",
    description: "Build durable capabilities that improve speed, reliability, reuse, and long-term product leverage."
  },
  {
    title: "AI Product Management",
    description: "Prioritize AI where customer value, business impact, data readiness, and trust intersect."
  },
  {
    title: "Customer Discovery",
    description: "Use evidence to identify which problems are worth solving before committing product investment."
  },
  {
    title: "Experimentation",
    description: "Reduce expensive uncertainty through clear hypotheses, success criteria, and decision-ready evidence."
  },
  {
    title: "Product Analytics",
    description: "Translate behavior, funnel movement, adoption, and reliability signals into product decisions."
  },
  {
    title: "Stakeholder Leadership",
    description: "Align teams through crisp trade-offs, written decisions, structured reviews, and constructive disagreement."
  },
  {
    title: "Execution Excellence",
    description: "Move from ambiguity to delivery while keeping scope, sequencing, risk, and outcomes visible."
  }
];

const businessOutcomes = [
  {
    value: "₹1M+",
    title: "ARR",
    description: "Revenue foundation connected to product-led growth and portfolio performance.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    value: "20%",
    title: "MRR Growth",
    description: "Subscription growth influenced by product strategy, discovery, and adoption quality.",
    href: "/stories/product-discovery-jove"
  },
  {
    value: "10×",
    title: "Revenue Growth",
    description: "Growth from ₹1M to ₹10M through funnel, pricing, referral, and conversion decisions.",
    href: "/stories/simplilearn-job-guarantee-growth"
  },
  {
    value: "40%",
    title: "Session Time Increase",
    description: "Engagement improvement connected to workflow fit and better product usage loops.",
    href: "/stories/product-discovery-jove"
  },
  {
    value: "25%",
    title: "Engagement Increase",
    description: "Product adoption lift through clearer customer problem framing and roadmap choices.",
    href: "/stories/product-discovery-jove"
  },
  {
    value: "10M+",
    title: "Monthly Transactions",
    description: "Transaction-scale payment product experience shaped by reliability and trust.",
    href: "/stories/payments-reliability-comviva"
  },
  {
    value: "15+",
    title: "Enterprise Deployments",
    description: "B2B delivery across complex product, customer, and implementation environments.",
    href: "/stories/payments-reliability-comviva"
  }
];

const education = [
  {
    title: "NIT Surat",
    detail: "Computer Science"
  },
  {
    title: "IIM Indore",
    detail: "MBA"
  },
  {
    title: "Continuous Learning",
    detail: "Generative AI, AI Product Management, Agentic Systems"
  }
];

const awards = ["Game Changer", "Best Performer", "Credo Cap", "Best Contributor"];

const contactLinks = [
  {
    label: "Email",
    value: "saurabh1chawda@gmail.com",
    href: "mailto:saurabh1chawda@gmail.com"
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/saurabhchawda5",
    href: "https://www.linkedin.com/in/saurabhchawda5"
  },
  {
    label: "GitHub",
    value: "github.com/saurabh1chawda",
    href: "https://github.com/saurabh1chawda"
  }
];

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Saurabh Chawda",
  jobTitle: "Lead Product Manager",
  url: "https://saurabh-product-os.vercel.app/profile",
  email: "mailto:saurabh1chawda@gmail.com",
  sameAs: ["https://www.linkedin.com/in/saurabhchawda5", "https://github.com/saurabh1chawda"],
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "NIT Surat"
    },
    {
      "@type": "CollegeOrUniversity",
      name: "IIM Indore"
    }
  ],
  knowsAbout: [
    "AI Product Management",
    "Platform Strategy",
    "Product Growth",
    "Customer Discovery",
    "Experimentation",
    "Product Analytics",
    "Payments",
    "Enterprise SaaS"
  ]
};

export default function ProfessionalProfilePage() {
  return (
    <>
      <ProfessionalProfileViewed />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <SiteHeader />
      <main>
        <section className="border-b border-line bg-panel" aria-labelledby="profile-title">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
            <div className="max-w-4xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-sm font-semibold text-muted">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden="true" />
                Professional Profile
              </p>
              <h1 id="profile-title" className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
                Lead Product Manager | AI Products, Platform Strategy & Business Growth
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
                I am Saurabh Chawda, a Lead Product Manager with 8+ years of experience building AI products, platform capabilities, growth initiatives, experimentation systems, analytics-driven products, and customer-centric experiences across B2B SaaS, enterprise platforms, fintech, and digital products. Product OS shows the product judgment behind that work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/decision-operating-system">
                  Explore Product OS
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>
                <span
                  aria-disabled="true"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-paper px-4 text-sm font-semibold text-muted"
                >
                  View Case Studies: Coming Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        <ProfileSection eyebrow="Current Positioning" id="current-positioning" title="Where I create product leverage today">
          <div className="grid gap-4 lg:grid-cols-3">
            {positioningCards.map((card) => (
              <article key={card.title} className="rounded-md border border-line bg-panel p-5">
                <h3 className="text-xl font-semibold leading-tight text-ink">{card.title}</h3>
                <ul className="mt-5 space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-muted">
                      <CheckCircle2 className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                      <span className="font-medium text-ink">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="What I Build" id="what-i-build" title="Products, systems, and decisions I am built to own" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {buildAreas.map((area) => (
              <EvidenceCard key={area.title} icon={<Layers3 className="h-5 w-5 text-accent" aria-hidden="true" />} title={area.title}>
                <p className="leading-7 text-muted">{area.description}</p>
                <p className="mt-4 text-sm font-semibold text-accent">Evidence coming in upcoming case studies.</p>
              </EvidenceCard>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Career Journey" id="career-journey" title="A path from analytics to product ownership">
          <ProfessionalProfileSectionViewed eventName="career_timeline_viewed" sectionName="Career Journey" />
          <div className="grid gap-4">
            {careerJourney.map((item, index) => (
              <div key={item.role}>
                <article className="rounded-md border border-line bg-panel p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">{item.role}</p>
                      <h3 className="mt-3 text-xl font-semibold leading-tight text-ink">{item.company}</h3>
                    </div>
                    <span className="inline-flex min-h-11 items-center rounded-full border border-line bg-paper px-3 text-sm font-semibold text-muted">
                      {item.duration}
                    </span>
                  </div>
                  <p className="mt-4 leading-7 text-muted">{item.impact}</p>
                  <p className="mt-4 text-sm font-semibold text-accent">Detailed case study coming soon.</p>
                </article>
                {index < careerJourney.length - 1 ? (
                  <div className="flex justify-center py-3">
                    <ArrowDown className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Core Capabilities" id="core-capabilities" title="Evidence-oriented capability areas" background="panel">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((capability) => (
              <EvidenceCard key={capability.title} icon={<BriefcaseBusiness className="h-5 w-5 text-accent" aria-hidden="true" />} title={capability.title}>
                <p className="leading-7 text-muted">{capability.description}</p>
                <p className="mt-4 text-sm font-semibold text-accent">Supporting evidence will be linked through Product OS.</p>
              </EvidenceCard>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Signature Business Outcomes" id="business-outcomes" title="Representative outcomes across product systems">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessOutcomes.map((outcome) => (
              <article key={`${outcome.value}-${outcome.title}`} className="rounded-md border border-line bg-panel p-5">
                <p className="text-4xl font-semibold leading-none text-ink">{outcome.value}</p>
                <h3 className="mt-4 text-lg font-semibold leading-tight text-ink">{outcome.title}</h3>
                <p className="mt-3 leading-7 text-muted">{outcome.description}</p>
                <ProfessionalProfileTrackedLink
                  destination={outcome.href}
                  eventName="business_outcome_clicked"
                  label={`View evidence for ${outcome.title}`}
                  outcomeName={outcome.title}
                  variant="inline"
                  className="mt-5"
                >
                  View evidence
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ProfessionalProfileTrackedLink>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Education" id="education" title="Technical foundation, business training, continuous learning" background="panel">
          <div className="grid gap-4 lg:grid-cols-3">
            {education.map((item, index) => (
              <article key={item.title} className="rounded-md border border-line bg-paper p-5">
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-1 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl font-semibold leading-tight text-ink">{item.title}</h3>
                    <p className="mt-3 leading-7 text-muted">{item.detail}</p>
                  </div>
                </div>
                {index < education.length - 1 ? <p className="mt-5 text-sm font-semibold text-accent">Continued into the next stage</p> : null}
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Awards & Recognition" id="awards" title="Recognition for contribution, ownership, and impact">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {awards.map((award) => (
              <article key={award} className="rounded-md border border-line bg-panel p-5">
                <Award className="h-5 w-5 text-accent" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{award}</h3>
              </article>
            ))}
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Why Product OS Exists" id="why-product-os-exists" title="The evidence behind the profile" background="panel">
          <ProfessionalProfileSectionViewed eventName="product_os_journey_viewed" sectionName="Why Product OS Exists" />
          <div className="rounded-md border border-line bg-paper p-6">
            <TrendingUp className="h-6 w-6 text-accent" aria-hidden="true" />
            <p className="mt-5 max-w-4xl text-lg leading-8 text-muted">
              Traditional professional profiles summarize outcomes. Product OS complements those outcomes by documenting the thinking, product decisions, customer discovery, experimentation, trade-offs, and execution approaches behind them. Think of Product OS as the evidence behind the Professional Profile rather than a replacement for tailored application materials.
            </p>
            <ButtonLink href="/decision-operating-system" variant="inline" className="mt-5">
              Continue into Product OS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </ProfileSection>

        <ProfileSection eyebrow="Contact" id="contact" title="The fastest way to start a conversation">
          <div className="grid gap-4 lg:grid-cols-3">
            {contactLinks.map((link) => (
              <article key={link.label} className="rounded-md border border-line bg-panel p-5">
                {link.label === "Email" ? (
                  <Mail className="h-5 w-5 text-accent" aria-hidden="true" />
                ) : link.label === "GitHub" ? (
                  <Building2 className="h-5 w-5 text-accent" aria-hidden="true" />
                ) : (
                  <ExternalLink className="h-5 w-5 text-accent" aria-hidden="true" />
                )}
                <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{link.label}</h3>
                <p className="mt-3 break-words leading-7 text-muted">{link.value}</p>
                <ProfessionalProfileTrackedLink
                  destination={link.href}
                  eventName="contact_clicked"
                  label={link.label}
                  variant="inline"
                  className="mt-5"
                >
                  Open {link.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ProfessionalProfileTrackedLink>
              </article>
            ))}
          </div>
        </ProfileSection>
      </main>
    </>
  );
}

function ProfileSection({
  background,
  children,
  eyebrow,
  id,
  title
}: {
  background?: "panel";
  children: ReactNode;
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <section className={`border-b border-line ${background === "panel" ? "bg-panel" : ""}`} aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function EvidenceCard({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <article className="rounded-md border border-line bg-paper p-5">
      {icon}
      <h3 className="mt-5 text-xl font-semibold leading-tight text-ink">{title}</h3>
      <div className="mt-3">{children}</div>
    </article>
  );
}
