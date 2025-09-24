import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CurriculumDesign } from '@shared/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface SavedDesignsManagerProps {
  designs: CurriculumDesign[];
  onDelete: (id: string) => void;
}
export function SavedDesignsManager({ designs, onDelete }: SavedDesignsManagerProps) {
  if (designs.length === 0) {
    return null;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full"
    >
      <Card className="w-full shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold font-display text-primary flex items-center">
            <FileText className="mr-3 h-6 w-6" />
            Saved Curriculum Designs
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground mt-1">
            Manage your saved curriculum designs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72 pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {designs.map((design) => (
                  <motion.div
                    key={design.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate text-foreground">
                        {design.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Saved on: {new Date(design.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Delete Design" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Curriculum Design?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{design.name}". This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(design.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}