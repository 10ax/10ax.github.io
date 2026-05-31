import * as si from "simple-icons";

type SimpleIcon = { title: string; hex: string; path: string };

function getIcon(slug: string): SimpleIcon | undefined {
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}`;
  return (si as unknown as Record<string, SimpleIcon | undefined>)[key];
}

export function BrandIcon({
  slug,
  className,
  useBrandColor = true,
}: {
  slug: string;
  className?: string;
  useBrandColor?: boolean;
}) {
  const icon = getIcon(slug);
  if (!icon) return null;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={icon.title}
      className={className}
      fill={useBrandColor ? `#${icon.hex}` : "currentColor"}
    >
      <path d={icon.path} />
    </svg>
  );
}
