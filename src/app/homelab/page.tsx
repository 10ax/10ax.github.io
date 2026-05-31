import type { Metadata } from "next";
import Image from "next/image";
import { Server, Cpu, HardDrive } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Homelab — Francesco Tenace",
  description: "What's running on my Proxmox/Docker home server.",
};

type Service = {
  name: string;
  description: string;
  tags: string[];
  image?: string;
};

const STACK = [
  { icon: Server, label: "Hypervisor", value: "Proxmox VE" },
  { icon: Cpu, label: "Container runtime", value: "Docker + Compose" },
  { icon: HardDrive, label: "Storage", value: "ZFS mirror" },
];

const SERVICES: Service[] = [
  {
    name: "Gitea",
    description: "Self-hosted Git with private repos and a tiny CI runner.",
    tags: ["dev", "git"],
  },
  {
    name: "Jellyfin",
    description: "Personal media server for movies, shows and music.",
    tags: ["media"],
  },
  {
    name: "Home Assistant",
    description: "Smart-home automation hub running on a dedicated VM.",
    tags: ["iot"],
  },
  {
    name: "Nextcloud",
    description: "File sync, calendars, and contacts replacing the usual SaaS suspects.",
    tags: ["files"],
  },
];

// Place screenshots/rack photos under /public/homelab/ and reference here.
const PHOTOS: { src: string; alt: string }[] = [
  { src: "/next.svg", alt: "Placeholder homelab photo" },
  { src: "/vercel.svg", alt: "Placeholder homelab photo" },
];

export default function HomelabPage() {
  return (
    <>
      <PageHeader
        eyebrow="ssh homelab"
        title="Homelab"
        description="A Proxmox/Docker box that hosts personal services and doubles as a CI/CD playground."
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STACK.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
            >
              <Icon className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="text-sm font-medium text-slate-100">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-100">
            Services
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <article
                key={s.name}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-emerald-500/50"
              >
                <h3 className="text-base font-semibold text-slate-100">{s.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-300">
                  {s.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5 font-mono text-xs text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-100">
            Rack photos
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PHOTOS.map((photo, i) => (
              <div
                key={`${photo.src}-${i}`}
                className="relative aspect-video overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-contain p-10"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
