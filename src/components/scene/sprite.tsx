import type { SpriteState } from "@/sprites/sheet";

/**
 * The pixel sprite, served as a 4x strip and animated by CSS `steps()`.
 *
 * It is a background image rather than an `<img>` because the animation is a
 * background-position step. It is `aria-hidden` because the sprite is decoration:
 * whatever it means in the hero is also said in text next to it.
 *
 * One cell at 4x is 64x96, which is why the element is exactly that size and why the
 * strip widths in `globals.css` are the numbers they are.
 */
export function Sprite({
  state = "idle",
  className,
}: {
  state?: SpriteState;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`sprite-${state} inline-block h-24 w-16 [image-rendering:pixelated] ${className ?? ""}`}
      style={{
        backgroundImage: `url(/sprites/trainer-${state}@4x.png)`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}
