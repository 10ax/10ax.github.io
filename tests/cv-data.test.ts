/**
 * Characterisation tests for the CV facts.
 *
 * The redesign moves this content to a new route and rewrites every headline around it.
 * The facts themselves are frozen: titles, employers, dates, contact details and the
 * counts. A reformatting that quietly drops a role or changes a date fails here.
 */
import { describe, expect, it } from "vitest";
import { CV_DATA } from "@/lib/cv-data";

describe("CV_DATA", () => {
  it("keeps the identity and contact facts byte-identical", () => {
    expect(CV_DATA.profile.name).toBe("Francesco Tenace");
    expect(CV_DATA.profile.title).toBe("Full-stack Developer");
    expect(CV_DATA.profile.location).toBe("Avellino area, Italy");
    expect(CV_DATA.profile.email).toBe("ftenace98@gmail.com");
    expect(CV_DATA.profile.phone).toBe("+39 3886526207");
  });

  it("keeps all four roles, in order, with their exact companies and periods", () => {
    expect(CV_DATA.experiences.map((e) => e.company)).toEqual([
      "SystemCeramics",
      "Ease2pay group",
      "Moongy Consultant at Dedagroup spa",
      "Kineton Consultant",
    ]);
    expect(CV_DATA.experiences.map((e) => e.period)).toEqual([
      "Jul 2024 - Now",
      "May 2023 - Oct 2023",
      "Oct 2022 - Apr 2023",
      "Sept 2020 - Oct 2022",
    ]);
  });

  it("keeps all eleven skills and their categories", () => {
    expect(CV_DATA.skills).toHaveLength(11);
    expect(CV_DATA.skills.map((s) => s.name)).toEqual([
      "Java",
      ".NET",
      "JavaScript",
      "TypeScript",
      "Angular",
      "Html/CSS",
      "Docker/Kubernetes",
      "GCP",
      "AWS",
      "Git",
      "GNU+Linux",
    ]);
    expect(new Set(CV_DATA.skills.map((s) => s.category))).toEqual(
      new Set(["Backend", "Frontend", "DevOps", "Cloud", "Tools"]),
    );
  });

  it("keeps the education and language facts", () => {
    expect(CV_DATA.education.degree).toBe(
      "Bachelor’s Degree in Computer and Automation Engineering",
    );
    expect(CV_DATA.education.institution).toBe("Polytechnic University of Bari");
    expect(CV_DATA.education.period).toBe("2017 - 2020");
    expect(CV_DATA.profile.languages).toEqual([
      { name: "Italian", level: "Native" },
      { name: "English", level: "C1 Level" },
    ]);
  });

  it("keeps the hobbies sentence", () => {
    expect(CV_DATA.hobbies).toBe(
      "Playing guitar and composing music. Retro-gaming, Sci-fi literature, and cooking. Self-hosting a Proxmox/Docker home lab for personal services and CI/CD testing.",
    );
  });

  it("contains no em-dashes, which are banned from user-visible strings", () => {
    const visible = JSON.stringify(CV_DATA);
    expect(visible).not.toContain("—");
    expect(visible).not.toContain("–");
  });
});
