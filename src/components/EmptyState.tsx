import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-border rounded-lg bg-muted/30">
        <div className="p-4 bg-primary/10 rounded-full mb-4">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold font-display text-foreground">
          Your Scheme of Work Awaits
        </h3>
        <p className="mt-2 text-lg text-muted-foreground max-w-md">
          Fill out the form above to generate your customized scheme. The results will appear here once completed.
        </p>
      </div>
    </motion.div>
  );
}