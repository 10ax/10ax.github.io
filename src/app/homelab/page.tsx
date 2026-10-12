import type { Metadata } from "next";
import Image from "next/image";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowSquareOut,
  Broadcast,
  Cpu,
  Cube,
  Database,
  DownloadSimple,
  GitBranch,
  GlobeSimple,
  HardDrives,
  House,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/page-header";
import { BrandIcon } from "@/components/brand-icon";
import { Reveal } from "@/components/reveal";
import { SpotlightCard } from "@/components/spotlight-card";

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
  fallbackIcon: Icon;
};

const REPO_URL = "https://github.com/10ax/docker";

/*
 * Brand hexes whose contrast against the light theme's `bg-sunken` chip (`#eaeae4`)
 * falls below the 3:1 an icon needs: adguard `#68BC71` (1.93:1), homeassistant
 * `#18BCF2` (1.83:1), portainer `#13BEF9` (1.78:1). Those glyphs fall back to
 * `currentColor` so the caller's `text-ink` token drives them; the two that pass
 * (nginx 3.21:1, qbittorrent 4.61:1) keep their brand colour.
 */
const LOW_CONTRAST_BRAND_SLUGS = new Set(["adguard", "homeassistant", "portainer"]);

const STACK = [
  { icon: HardDrives, label: "Host", value: "Odroid HC4 · Arch Linux" },
  { icon: Cpu, label: "Container runtime", value: "Docker + Compose" },
  { icon: Database, label: "Storage", value: "Unified /data volume" },
];

const SERVICES: Service[] = [
  {
    name: "AdGuard Home",
    description:
      "Network-wide DNS-level ad and tracker blocking. Recently migrated out of Docker to a native systemd service with health checks.",
    tags: ["dns", "native"],
    url: "https://adguard.com/adguard-home.html",
    iconSlug: "adguard",
    fallbackIcon: ShieldCheck,
  },
  {
    name: "Home Assistant",
    description:
      "Smart-home automation hub. Compose stack with core configuration tracked in Git.",
    tags: ["iot", "automation"],
    url: "https://www.home-assistant.io/",
    iconSlug: "homeassistant",
    fallbackIcon: House,
  },
  {
    name: "Matter Bridge",
    description:
      "Matter server compose project bridging Matter devices into Home Assistant. Operational data kept on the host.",
    tags: ["iot", "matter"],
    fallbackIcon: Broadcast,
  },
  {
    name: "Nginx Proxy Manager",
    description:
      "Reverse proxy and TLS termination in front of the lab's web UIs.",
    tags: ["network", "tls"],
    url: "https://nginxproxymanager.com/",
    iconSlug: "nginx",
    fallbackIcon: GlobeSimple,
  },
  {
    name: "Portainer CE",
    description: "Web UI for managing the Docker daemon and Compose projects.",
    tags: ["ops"],
    url: "https://www.portainer.io/",
    iconSlug: "portainer",
    fallbackIcon: Cube,
  },
  {
    name: "arr-stack",
    description:
      "Prowlarr (indexer), Lidarr (music collection manager) and qBittorrent sharing a unified /data volume.",
    tags: ["media", "automation"],
    iconSlug: "qbittorrent",
    fallbackIcon: DownloadSimple,
  },
];

// Place screenshots/rack photos under /public/homelab/ and reference here.
const PHOTOS: { src: string; alt: string; width: number; height: number }[] = [
  {
    src: "https://picsum.photos/seed/ft-homelab-rack/1600/1200",
    alt: "Placeholder rack photograph",
    width: 1600,
    height: 1200,
  },
  {
    src: "https://picsum.photos/seed/ft-homelab-shelf/1400/1750",
    alt: "Placeholder shelf photograph",
    width: 1400,
    height: 1750,
  },
];

export default function HomelabPage() {
  return (
    <>
      <PageHeader
        eyebrow="ssh homelab"
        title="The rack in the corner"
        description="An Odroid HC4 running Arch Linux with a small Docker Compose fleet for DNS, smart home, reverse proxy and media automation. The compose files and non-sensitive config live on GitHub."
      />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] flex-1 px-5 py-16 md:px-8">
        <Reveal>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring border-line hover:border-line-strong inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors"
          >
            <GitBranch size={16} weight="regular" aria-hidden />
            10ax/docker
            <ArrowSquareOut size={14} weight="regular" aria-hidden className="text-ink-muted" />
          </a>
        </Reveal>

        <dl className="mt-10 grid gap-4 md:grid-cols-3">
          {STACK.map(({ icon: Icon, label, value }, index) => (
            <Reveal
              key={label}
              delay={index * 0.05}
              className={index === 0 ? undefined : "border-line md:border-l md:pl-4"}
            >
              <dt className="text-ink-muted flex items-center gap-2 font-mono text-xs tracking-wide uppercase">
                <Icon size={20} weight="regular" aria-hidden className="text-accent shrink-0" />
                {label}
              </dt>
              <dd className="text-ink mt-1 text-sm font-medium">{value}</dd>
            </Reveal>
          ))}
        </dl>

        <section aria-labelledby="services" className="mt-20">
          <h2 id="services" className="font-display text-ink text-2xl font-semibold tracking-tight">
            What runs on it
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, index) => {
              const Fallback = service.fallbackIcon;
              return (
                <Reveal key={service.name} delay={index * 0.04}>
                  <SpotlightCard className="h-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="border-line bg-sunken flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border">
                          {service.iconSlug ? (
                            <BrandIcon
                              slug={service.iconSlug}
                              useBrandColor={!LOW_CONTRAST_BRAND_SLUGS.has(service.iconSlug)}
                              className="text-ink h-5 w-5"
                            />
                          ) : (
                            <Fallback size={18} weight="regular" aria-hidden className="text-accent" />
                          )}
                        </span>
                        <h3 className="font-display text-ink text-base font-semibold tracking-tight">
                          {service.name}
                        </h3>
                      </div>
                      {service.url && (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${service.name} homepage`}
                          className="focus-ring text-ink-muted hover:text-accent transition-colors"
                        >
                          <ArrowSquareOut size={16} weight="regular" aria-hidden />
                        </a>
                      )}
                    </div>
                    <p className="text-ink-muted mt-3 text-sm leading-relaxed">{service.description}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <li
                          key={tag}
                          className="border-line text-ink-muted rounded-chip border px-2 py-0.5 font-mono text-xs"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="photos" className="mt-20">
          <h2 id="photos" className="font-display text-ink text-2xl font-semibold tracking-tight">
            The hardware, photographed
          </h2>
          <ul className="mt-8 columns-1 gap-4 sm:columns-2">
            {PHOTOS.map((photo, index) => (
              <li key={photo.src} className="mb-4 break-inside-avoid">
                <Reveal delay={index * 0.05}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="border-line h-auto w-full rounded-panel border"
                  />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
