import type { Metadata } from "next";
import Image from "next/image";
import {
  Server,
  Cpu,
  HardDrive,
  GitBranch,
  ExternalLink,
  type LucideIcon,
  Shield,
  Home,
  Network,
  Box,
  Radio,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { BrandIcon } from "@/components/brand-icon";

export const metadata: Metadata = {
  title: "Homelab — Francesco Tenace",
  description:
    "Compose stacks and host services running on my Odroid HC4 homelab.",
};

type Service = {
  name: string;
  description: string;
  tags: string[];
  url?: string;
  iconSlug?: string;
  fallbackIcon: LucideIcon;
};

const REPO_URL = "https://github.com/10ax/docker";

const STACK = [
  { icon: Server, label: "Host", value: "Odroid HC4 · Arch Linux" },
  { icon: Cpu, label: "Container runtime", value: "Docker + Compose" },
  { icon: HardDrive, label: "Storage", value: "Unified /data volume" },
];

const SERVICES: Service[] = [
  {
    name: "AdGuard Home",
    description:
      "Network-wide DNS-level ad and tracker blocking. Recently migrated out of Docker to a native systemd service with health checks.",
    tags: ["dns", "native"],
    url: "https://adguard.com/adguard-home.html",
    iconSlug: "adguard",
    fallbackIcon: Shield,
  },
  {
    name: "Home Assistant",
    description:
      "Smart-home automation hub. Compose stack with core configuration tracked in Git.",
    tags: ["iot", "automation"],
    url: "https://www.home-assistant.io/",
    iconSlug: "homeassistant",
    fallbackIcon: Home,
  },
  {
    name: "Matter Bridge",
    description:
      "Matter server compose project bridging Matter devices into Home Assistant. Operational data kept on the host.",
    tags: ["iot", "matter"],
    fallbackIcon: Radio,
  },
  {
    name: "Nginx Proxy Manager",
    description:
      "Reverse proxy and TLS termination in front of the lab's web UIs.",
    tags: ["network", "tls"],
    url: "https://nginxproxymanager.com/",
    iconSlug: "nginx",
    fallbackIcon: Network,
  },
  {
    name: "Portainer CE",
    description: "Web UI for managing the Docker daemon and Compose projects.",
    tags: ["ops"],
    url: "https://www.portainer.io/",
    iconSlug: "portainer",
    fallbackIcon: Box,
  },
  {
    name: "arr-stack",
    description:
      "Prowlarr (indexer), Lidarr (music collection manager) and qBittorrent sharing a unified /data volume.",
    tags: ["media", "automation"],
    iconSlug: "qbittorrent",
    fallbackIcon: Download,
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
        description="An Odroid HC4 running Arch Linux with a small Docker Compose fleet for DNS, smart-home, reverse proxy, and media automation. Compose files and non-sensitive config live on GitHub."
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="mb-8">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-emerald-500/60 hover:text-emerald-300"
          >
            <GitBranch className="h-4 w-4" />
            10ax/docker
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>
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
            {SERVICES.map((s) => {
              const Fallback = s.fallbackIcon;
              return (
                <article
                  key={s.name}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition-colors hover:border-emerald-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950">
                        {s.iconSlug ? (
                          <BrandIcon slug={s.iconSlug} className="h-5 w-5" />
                        ) : (
                          <Fallback className="h-5 w-5 text-emerald-400" />
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-100">
                        {s.name}
                      </h3>
                    </div>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.name} homepage`}
                        className="text-slate-500 transition-colors hover:text-emerald-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
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
              );
            })}
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
