import type { Metadata } from "next";
import { Code, Cpu, GlobeSimple, HardDrives, Translate } from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { PixelLabel } from "@/components/pixel-label";
import { Reveal } from "@/components/reveal";
import { ExperienceStack } from "@/components/cv/experience-stack";
import { CV_DATA, type Skill } from "@/lib/cv-data";

export const metadata: Metadata = {
  title: "CV | Francesco Tenace",
  description:
    "Senior Full-stack Developer with 5+ years of experience building scalable distributed systems. Java, .NET, Angular, Kubernetes.",
};

/** Icon per skill category, in the order the bento renders them. */
const CATEGORY_ICON = {
  Backend: HardDrives,
  Frontend: Code,
  DevOps: Cpu,
  Cloud: GlobeSimple,
  Tools: Cpu,
} as const;

export default function CvPage() {
  const { profile, skills, experiences, education, hobbies } = CV_DATA;

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    knowsLanguage: profile.languages.map((language) => language.name),
    knowsAbout: skills.map((skill) => skill.name),
    alumniOf: { "@type": "CollegeOrUniversity", name: education.institution },
    hasOccupation: experiences.map((experience) => ({
      "@type": "Occupation",
      name: experience.role,
      occupationLocation: { "@type": "Place", name: experience.location },
      hiringOrganization: { "@type": "Organization", name: experience.company },
      description: experience.description,
      skills: experience.tech.join(", "),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Safe: the object is fully controlled and JSON.stringify escapes it for JSON-LD.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <PageHeader
        eyebrow="the record"
        title="Full-stack developer, five years in"
        description={profile.summary}
      />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <section aria-labelledby="experience">
          <h2 id="experience" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Professional experience
          </h2>
          <div className="mt-8">
            <ExperienceStack experiences={experiences} />
          </div>
        </section>

        <section aria-labelledby="skills" className="mt-20">
          <h2 id="skills" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Skills
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {Object.entries(skillsByCategory).map(([category, items], index) => {
              const Icon = CATEGORY_ICON[category as keyof typeof CATEGORY_ICON] ?? Code;
              return (
                <Reveal
                  key={category}
                  delay={index * 0.05}
                  className={index === 0 ? "md:col-span-2" : undefined}
                >
                  <div className="border-line bg-panel h-full rounded-panel border p-6">
                    <div className="flex items-center gap-2">
                      <Icon size={18} weight="regular" aria-hidden className="text-accent" />
                      <h3 className="text-ink-muted font-mono text-xs tracking-wide uppercase">
                        {category}
                      </h3>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {items.map((skill) => (
                        <li key={skill.name} className="flex items-baseline gap-2">
                          <span className="text-ink text-sm font-medium">{skill.name}</span>
                          <span className="text-accent font-mono text-xs tabular">{skill.yrs}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="background" className="mt-20 grid gap-8 md:grid-cols-2">
          <Reveal>
            <div>
              <h2 id="background" className="font-display text-ink text-2xl font-semibold tracking-tight">
                Education
              </h2>
              <div className="border-line mt-4 border-l-2 pl-4">
                <h3 className="text-ink text-base font-semibold">{education.degree}</h3>
                <p className="text-accent mt-1 text-sm">{education.institution}</p>
                <p className="text-ink-muted tabular mt-1 font-mono text-xs">{education.period}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div>
              <h2 className="font-display text-ink text-2xl font-semibold tracking-tight">
                Languages
              </h2>
              <ul className="mt-4 flex flex-col gap-2">
                {profile.languages.map((language) => (
                  <li key={language.name} className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-ink inline-flex items-center gap-2">
                      <Translate size={14} weight="regular" aria-hidden className="text-ink-muted" />
                      {language.name}
                    </span>
                    <span className="text-accent font-mono text-xs">{language.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section aria-labelledby="outside" className="mt-20">
          <h2 id="outside" className="font-display text-ink text-2xl font-semibold tracking-tight">
            Outside work
          </h2>
          <p className="text-ink-muted mt-4 max-w-[65ch] text-sm leading-relaxed">{hobbies}</p>
          <p className="mt-6">
            <PixelLabel>contact</PixelLabel>
          </p>
          <ul className="mt-3 flex flex-wrap gap-3 text-sm">
            <li>
              <a href={`mailto:${profile.email}`} className="focus-ring text-accent">
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="focus-ring text-accent tabular"
              >
                {profile.phone}
              </a>
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
