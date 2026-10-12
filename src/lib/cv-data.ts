export type Skill = { name: string; yrs: string; category: string };
export type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  description: string;
  tech: string[];
};
export type Language = { name: string; level: string };
export type Education = { degree: string; institution: string; period: string };

export type CvData = {
  profile: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    summary: string;
    languages: Language[];
  };
  skills: Skill[];
  experiences: Experience[];
  education: Education;
  hobbies: string;
};

/** The CV as published. Frozen: `tests/cv-data.test.ts` pins every fact in here. */
export const CV_DATA: CvData = {
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
