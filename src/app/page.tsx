import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Calendar,
  Code,
  Server,
  Music,
  Languages,
  GraduationCap,
  Download,
  GitBranch,
  Briefcase,
} from "lucide-react";

type Skill = { name: string; yrs: string; category: string };
type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tech: string[];
};

const CV_DATA = {
  profile: {
    name: "Francesco Tenace",
    title: "Full-stack Developer",
    location: "Avellino area, Italy",
    email: "ftenace98@gmail.com",
    phone: "+39 3886526207",
    summary:
      "Senior Full-stack Developer with 5+ years of experience in building scalable distributed systems. Specialist in Java/.NET ecosystems and DevOps automation.",
    languages: [
      { name: "Italian", level: "Native" },
      { name: "English", level: "C1 Level" },
    ],
  },
  skills: [
    { name: "Java", yrs: "4+ yrs", category: "Backend" },
    { name: ".NET", yrs: "3+ yrs", category: "Backend" },
    { name: "JavaScript", yrs: "3+ yrs", category: "Frontend" },
    { name: "TypeScript", yrs: "2+ yrs", category: "Frontend" },
    { name: "Angular", yrs: "3+ yrs", category: "Frontend" },
    { name: "Html/CSS", yrs: "3+ yrs", category: "Frontend" },
    { name: "Docker/Kubernetes", yrs: "3+ yrs", category: "DevOps" },
    { name: "GCP", yrs: "2+ yrs", category: "Cloud" },
    { name: "AWS", yrs: "1+ yrs", category: "Cloud" },
    { name: "Git", yrs: "4+ yrs", category: "Tools" },
    { name: "GNU+Linux", yrs: "4+ yrs", category: "Tools" },
  ] as Skill[],
  experiences: [
    {
      role: "Full-stack developer - freelance",
      company: "SystemCeramics",
      location: "remote (Italy)",
      period: "Jul 2024 - Now",
      description:
        "Developing a distributed system to handle industrial machinery orchestration.",
      tech: [".NET 9", "Microsoft Orleans", "Kafka", "OpenAPI", "Angular", "Syncfusion"],
    },
    {
      role: "Back-end developer",
      company: "Ease2pay group",
      location: "Rotterdam",
      period: "May 2023 - Oct 2023",
      description:
        "Developing a distributed platform, integrated with several consumer applications for energy services.",
      tech: [
        "Java/Spring",
        "Node.js",
        "AWS Lambda",
        "JUnit5/Jest",
        "Cucumber",
        "Docker",
        "Kubernetes (Amazon EKS)",
        "Buckaroo",
      ],
    },
    {
      role: "Full-stack developer",
      company: "Moongy Consultant at Dedagroup spa",
      location: "remote (Italy)",
      period: "Oct 2022 - Apr 2023",
      description:
        "Developing a production microservices-based application OMS for luxury purchases, integrated with external systems and payment platforms.",
      tech: [
        "Java",
        "Hibernate",
        "Spring",
        "Kafka",
        "React",
        "TypeScript",
        "Material UI",
        "JUnit5/Jest",
        "Cucumber",
        "Docker",
        "Kubernetes (EKS)",
        "Adyen",
        "Paypal",
      ],
    },
    {
      role: "Full-stack developer",
      company: "Kineton Consultant",
      location: "Naples",
      period: "Sept 2020 - Oct 2022",
      description:
        "Worked on production applications for several multimedia companies such as Sky and Warner Bros Discovery.",
      tech: [
        "Java",
        "Hibernate",
        "Spring Boot",
        "MySQL",
        "Redis",
        "Vaadin",
        "JavaScript",
        "Docker",
        "Kubernetes (GKE, EKS)",
        "HBBTV",
      ],
    },
  ] as Experience[],
  education: {
    degree: "Bachelor’s Degree in Computer and Automation Engineering",
    institution: "Polytechnic University of Bari",
    period: "2017 - 2020",
  },
  hobbies:
    "Playing guitar and composing music. Retro-gaming, Sci-fi literature, and cooking. Self-hosting a Proxmox/Docker home lab for personal services and CI/CD testing.",
};

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Backend: Server,
  Frontend: Code,
  DevOps: Server,
  Cloud: Server,
  Tools: Code,
};

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm transition-colors hover:border-slate-700">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-emerald-400" />
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function ContactLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-emerald-400 hover:text-emerald-300"
    >
      <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
      <span>{label}</span>
    </a>
  );
}

function SkillPill({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 transition-colors hover:border-emerald-500/60">
      <span className="text-sm font-medium text-slate-200">{skill.name}</span>
      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-mono text-emerald-300">
        {skill.yrs}
      </span>
    </div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <article className="group relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {exp.period}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {exp.location}
        </span>
      </div>
      <h3 className="text-base font-semibold text-slate-100">{exp.role}</h3>
      <p className="mt-0.5 text-sm font-medium text-emerald-400">{exp.company}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{exp.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {exp.tech.map((t) => (
          <span
            key={t}
            className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5 font-mono text-xs text-slate-300"
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  const { profile, skills, experiences, education, hobbies } = CV_DATA;

  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.summary,
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Avellino",
      addressRegion: "Campania",
      addressCountry: "IT",
    },
    knowsLanguage: profile.languages.map((l) => l.name),
    knowsAbout: skills.map((s) => s.name),
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: education.institution,
    },
    hasOccupation: experiences.map((e) => ({
      "@type": "Occupation",
      name: e.role,
      occupationLocation: { "@type": "Place", name: e.location },
      hiringOrganization: { "@type": "Organization", name: e.company },
      description: e.description,
      skills: e.tech.join(", "),
    })),
  };

  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-slate-200">
      <script
        type="application/ld+json"
        // Safe: object is fully controlled, JSON.stringify escapes properly for JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero */}
      <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 font-mono text-sm text-emerald-400">
                $ whoami
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-2 text-xl text-slate-300">{profile.title}</p>
            </div>

            <p className="max-w-2xl text-base leading-relaxed text-slate-400">
              {profile.summary}
            </p>

            <div className="flex flex-wrap gap-2">
              <ContactLink
                href={`mailto:${profile.email}`}
                icon={Mail}
                label={profile.email}
              />
              <ContactLink
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                icon={Phone}
                label={profile.phone}
              />
              <ContactLink href="#" icon={MapPin} label={profile.location} />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-slate-500 hover:bg-slate-800"
              >
                <GitBranch className="h-4 w-4" />
                GitHub
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <aside className="flex flex-col gap-6 lg:col-span-1">
            <SectionCard icon={Code} title="Skills">
              <div className="flex flex-col gap-4">
                {Object.entries(skillsByCategory).map(([category, items]) => {
                  const Icon = CATEGORY_ICON[category] ?? Code;
                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                        {category}
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
                        {items.map((s) => (
                          <SkillPill key={s.name} skill={s} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard icon={Languages} title="Languages">
              <ul className="flex flex-col gap-2">
                {profile.languages.map((l) => (
                  <li
                    key={l.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-slate-200">{l.name}</span>
                    <span className="font-mono text-xs text-emerald-300">
                      {l.level}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard icon={GraduationCap} title="Education">
              <h3 className="text-sm font-semibold text-slate-100">
                {education.degree}
              </h3>
              <p className="mt-1 text-sm text-emerald-400">
                {education.institution}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {education.period}
              </p>
            </SectionCard>

            <SectionCard icon={Music} title="Hobbies & Home Lab">
              <p className="text-sm leading-relaxed text-slate-300">{hobbies}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-300">
                <Server className="h-3.5 w-3.5" />
                Proxmox · Docker · CI/CD
              </div>
            </SectionCard>
          </aside>

          {/* Right column */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold tracking-tight text-slate-100">
                Professional Experience
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {experiences.map((exp) => (
                <ExperienceCard key={`${exp.company}-${exp.period}`} exp={exp} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
    </div>
  );
}
