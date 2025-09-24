import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Link, BookOpen, Calendar, Hash, Loader2, FileText, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { CBC_GRADES, CBC_SUBJECTS } from '@/lib/constants';
import { CurriculumDesign } from '@shared/types';
const generatorSchema = z.object({
  sourceType: z.enum(['new', 'saved']),
  googleDriveLink: z.string().optional(),
  designName: z.string().optional(),
  savedCurriculumId: z.string().optional(),
  grade: z.string().min(1, { message: "Please select a grade." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  term: z.string().min(1, { message: "Please select a term." }),
  weeks: z.coerce.number().min(1, "Must be at least 1 week.").max(14, "Cannot exceed 14 weeks."),
}).superRefine((data, ctx) => {
  if (data.sourceType === 'new') {
    if (!data.googleDriveLink || !z.string().url().safeParse(data.googleDriveLink).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A valid Google Drive link is required.",
        path: ['googleDriveLink'],
      });
    }
    if (!data.designName || data.designName.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A name with at least 3 characters is required.",
        path: ['designName'],
      });
    }
  }
  if (data.sourceType === 'saved' && !data.savedCurriculumId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select a saved curriculum design.",
      path: ['savedCurriculumId'],
    });
  }
});
export type GeneratorFormValues = z.infer<typeof generatorSchema>;
interface SchemeGeneratorProps {
  onSubmit: (data: GeneratorFormValues) => void;
  isLoading: boolean;
  savedDesigns: CurriculumDesign[];
}
export function SchemeGenerator({ onSubmit, isLoading, savedDesigns }: SchemeGeneratorProps) {
  const form = useForm<GeneratorFormValues>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      sourceType: 'new',
      googleDriveLink: '',
      designName: '',
      savedCurriculumId: '',
      grade: 'Grade 7',
      subject: 'Mathematics',
      term: '1',
      weeks: 12,
    },
  });
  const sourceType = form.watch('sourceType');
  useEffect(() => {
    form.resetField('googleDriveLink');
    form.resetField('designName');
    form.resetField('savedCurriculumId');
  }, [sourceType, form]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="w-full shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-display text-primary">Create Your Scheme of Work</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Enter a curriculum link or select a saved design, then customize your parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Curriculum Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new"><PlusCircle className="inline-block mr-2 h-4 w-4" />Add New Curriculum from Link</SelectItem>
                        <SelectItem value="saved" disabled={savedDesigns.length === 0}><FileText className="inline-block mr-2 h-4 w-4" />Use a Saved Design</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {sourceType === 'new' && (
                <div className="space-y-6 p-4 border rounded-md bg-muted/20 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="designName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Curriculum Design Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Grade 7 Mathematics Design" {...field} className="h-12 text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="googleDriveLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Google Drive Link</FormLabel>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <FormControl>
                            <Input placeholder="https://docs.google.com/document/d/..." {...field} className="pl-10 h-12 text-base" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {sourceType === 'saved' && (
                <div className="p-4 border rounded-md bg-muted/20 animate-fade-in">
                  <FormField
                    control={form.control}
                    name="savedCurriculumId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Saved Curriculum Design</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 text-base">
                              <SelectValue placeholder="Select a saved design" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {savedDesigns.map(design => (
                              <SelectItem key={design.id} value={design.id}>{design.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Grade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CBC_GRADES.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CBC_SUBJECTS.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Term</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select a term" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Term 1</SelectItem>
                          <SelectItem value="2">Term 2</SelectItem>
                          <SelectItem value="3">Term 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="weeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Number of Weeks</FormLabel>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 12" {...field} className="pl-10 h-12 text-base" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full h-14 text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Scheme of Work'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}