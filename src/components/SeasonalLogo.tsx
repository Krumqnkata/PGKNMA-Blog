import { useState } from "react";
import logoDark from "/logo-dark.png";
import { useAccessibility } from "@/hooks/use-accessibility";
import type { HeaderLogo } from "@/lib/api";

const logoSize = "w-[clamp(2.25rem,2rem+0.5vw,2.5rem)]";

interface SeasonalLogoProps {
  logo: HeaderLogo | null;
}

// Header brand: the seasonal/holiday logo from the admin, or the default one.
const SeasonalLogo = ({ logo }: SeasonalLogoProps) => {
  const { reduceMotion } = useAccessibility();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Browsers keep animating GIFs even with reduced motion, so swap in the still frame.
  const customSrc = logo ? (reduceMotion && logo.static_image_url) || logo.image_url : null;
  const showCustom = Boolean(customSrc) && customSrc !== failedSrc;
  const greeting = showCustom ? logo?.greeting : "";

  return (
    <>
      {showCustom ? (
        <img
          src={customSrc!}
          onError={() => setFailedSrc(customSrc)}
          className={`aspect-square h-auto ${logoSize} object-contain`}
          alt=""
          decoding="async"
        />
      ) : (
        <img src={logoDark} className={`h-auto ${logoSize}`} alt="" />
      )}
      <span className="hidden min-w-0 flex-col sm:flex lg:hidden xl:flex">
        <span className="text-[clamp(0.875rem,0.75rem+0.2vw,1rem)] font-bold uppercase tracking-widest">ПГКНМА Блог</span>
        {greeting && (
          <span className="hidden max-w-[16rem] truncate text-xs font-medium text-white/80 xl:block">{greeting}</span>
        )}
      </span>
    </>
  );
};

export default SeasonalLogo;
