"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  variant = "primary",
  children,
  href,
  onClick,
  className = "",
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer";

  const variantStyles =
    variant === "primary"
      ? "bg-accent text-white px-6 py-3 rounded-lg hover:brightness-95 shadow-sm text-base font-semibold"
      : "bg-transparent text-text-muted hover:text-text-primary underline-offset-4 hover:underline text-base px-3 py-2 font-medium";

  const combinedClassName = `${baseStyles} ${variantStyles} ${className}`.trim();

  const motionProps =
    variant === "primary"
      ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.97 },
        }
      : {};

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} onClick={onClick} className={combinedClassName}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={combinedClassName}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
