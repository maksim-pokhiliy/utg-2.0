"use client";

import { Spinner } from "flowbite-react";
import { motion, AnimatePresence } from "framer-motion";

interface ILoadingContainerProps {
  isLoading: boolean;
  children: Readonly<React.ReactNode>;
}

export default function LoadingContainer({
  isLoading,
  children,
}: ILoadingContainerProps) {
  return (
    <AnimatePresence>
      {isLoading ? (
        <div className="w-full flex items-center justify-center py-10">
          <Spinner className="fill-zinc-900" size="lg" />
        </div>
      ) : (
        <motion.div
          key="content"
          className="w-full"
          initial={{ opacity: 0, translateY: 5 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 5 }}
          transition={{ duration: 0.1 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
