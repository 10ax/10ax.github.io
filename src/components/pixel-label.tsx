/**
 * The 8-bit micro-label. Allowed at most once per three sections, so this component
 * exists to make the count greppable: `grep -r "<PixelLabel" src/app`.
 */
export function PixelLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-pixel text-accent text-[10px] tracking-[0.14em] uppercase">
      {children}
    </span>
  );
}
