import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api_auth";

interface AuthenticatedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
}

export const AuthenticatedImage = ({ src, alt = "", ...props }: AuthenticatedImageProps) => {
  const [objectUrl, setObjectUrl] = useState<string>();

  useEffect(() => {
    let active = true;
    let url: string | undefined;
    apiRequest(src)
      .then((response) => {
        if (!response.ok) throw new Error("Снимката не може да бъде заредена.");
        return response.blob();
      })
      .then((blob) => {
        url = URL.createObjectURL(blob);
        if (active) setObjectUrl(url);
      })
      .catch(() => active && setObjectUrl(undefined));

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  if (!objectUrl) return <div className="h-48 animate-pulse rounded-lg bg-muted" aria-label="Зареждане на снимка" />;
  return <img src={objectUrl} alt={alt} {...props} />;
};
