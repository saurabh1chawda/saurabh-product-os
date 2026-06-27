import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "inline";
};

const variants = {
  primary: "bg-accent text-white hover:bg-ink",
  secondary: "border border-line bg-panel text-ink hover:border-accent",
  inline: "p-0 text-accent hover:text-ink"
};

export function ButtonLink({ children, className, variant = "primary", ...props }: ButtonLinkProps) {
  const isInline = variant === "inline";

  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 text-sm font-semibold transition",
        isInline ? variants.inline : `min-h-11 rounded-md px-4 ${variants[variant]}`,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
