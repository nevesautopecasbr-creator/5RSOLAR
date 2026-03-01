"use client";

import Image from "next/image";
import { useState } from "react";

interface Logo5RProps {
  className?: string;
  height?: number;
  width?: number;
  priority?: boolean;
  /** Versão compacta (só símbolo) para sidebar estreita */
  compact?: boolean;
}

/**
 * Logo oficial 5R Energias Renováveis.
 * Coloque o arquivo do logo em public/5r-logo.png.
 * Fallback: marca textual (5 em laranja, R em verde) conforme identidade.
 */
export function Logo5R({
  className = "",
  height = 40,
  width = 160,
  priority = false,
  compact = false,
}: Logo5RProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={`flex items-center gap-1.5 font-bold ${compact ? "text-lg" : "text-xl"} ${className}`}
        aria-label="5R Energias Renováveis"
      >
        <span className="text-5r-orange">5</span>
        <span className="text-5r-green">R</span>
        {!compact && (
          <span className="ml-1.5 text-sm font-semibold tracking-tight text-5r-text-muted">
            Energias Renováveis
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src="/5r-logo.png"
      alt="5R Energias Renováveis"
      width={compact ? 80 : width}
      height={compact ? 32 : height}
      priority={priority}
      className={`object-contain ${compact ? "h-8 w-auto" : "h-10 w-auto"} ${className}`}
      onError={() => setImgFailed(true)}
    />
  );
}
