import type { CSSProperties, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FittedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Fill the empty space around the picture with a blurred copy of it. */
  backdrop?: boolean;
  /** Which part of the picture the blurred copy keeps, e.g. "50% 30%". */
  backdropPosition?: CSSProperties["objectPosition"];
};

/**
 * Shows the whole picture in a box of any shape, without cutting it off or
 * zooming in. The space left around it (for example on top and below a wide
 * photo in a square box) is filled with a blurred, darker copy of the same
 * picture, so there are no empty stripes.
 *
 * The box (the parent element) sets the size and needs `relative` and
 * `overflow-hidden`; this fills it.
 */
export function FittedImage({
  backdrop = true,
  backdropPosition,
  className,
  src,
  loading,
  ...props
}: FittedImageProps) {
  return (
    <>
      {backdrop && src && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          loading={loading}
          decoding="async"
          style={{ objectPosition: backdropPosition }}
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 select-none object-cover blur-xl brightness-75"
        />
      )}
      <img
        src={src}
        loading={loading}
        {...props}
        className={cn("relative h-full w-full object-contain", className)}
      />
    </>
  );
}
