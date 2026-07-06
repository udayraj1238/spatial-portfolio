"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";

export const TextGenerateEffect = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration: 0.8, delay: stagger(0.15), ease: [0.22, 1, 0.36, 1] }
    );
  }, [animate]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
};
