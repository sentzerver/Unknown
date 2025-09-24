import React, { useState, useCallback, useEffect } from 'react';
import { BookMarked } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SchemeGenerator, GeneratorFormValues } from '@/components/SchemeGenerator';
import { SchemeOutput } from '@/components/SchemeOutput';
import { SchemeSkeleton } from '@/components/SchemeSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { HistoryPanel } from '@/components/HistoryPanel';
import { SavedDesignsManager } from '@/components/SavedDesignsManager';
import { Toaster, toast } from '@/components/ui/sonner';
import { api } from '@/lib/api-client';
import { SchemeOfWorkEntry, Strand } from '@/lib/curriculum-types';
import { CurriculumParseRequest, CurriculumDesign } from '@shared/types';
import { useHistory, HistoryEntry } from '@/hooks/use-history';
interface CustomizationState {
  grade: string;
  subject: string;
  term: string;
  weeks: number;
}
export function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [schemeData, setSchemeData] = useState<SchemeOfWorkEntry[] | null>(null);
  const [customization, setCustomization] = useState<CustomizationState | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<CurriculumDesign[]>([]);
  const { history, addHistoryEntry, deleteHistoryEntry, clearHistory } = useHistory();
  const fetchSavedDesigns = useCallback(async () => {
    try {
      const designs = await api<CurriculumDesign[]>('/api/curriculums');
      setSavedDesigns(designs);
    } catch (error) {
      console.error('Failed to fetch saved designs:', error);
      toast.error('Could not load saved curriculum designs.');
    }
  }, []);
  useEffect(() => {
    fetchSavedDesigns();
  }, [fetchSavedDesigns]);
  const handleFinalizeGeneration = useCallback((strands: Strand[], formData: GeneratorFormValues) => {
    const generateSchemeAlgorithm = (strands: Strand[], weeks: number): SchemeOfWorkEntry[] => {
      const allSubStrands = strands.flatMap(strand =>
        strand.subStrands.map(subStrand => ({
          strand: strand.name,
          subStrand: subStrand.name,
          learningOutcomes: subStrand.learningOutcomes.map(lo => lo.outcome).join('; '),
        }))
      );
      if (allSubStrands.length === 0) {
        return [];
      }
      const scheme: SchemeOfWorkEntry[] = [];
      for (let i = 0; i < weeks; i++) {
        const subStrandIndex = i % allSubStrands.length;
        const currentSubStrand = allSubStrands[subStrandIndex];
        scheme.push({
          week: i + 1,
          strand: currentSubStrand.strand,
          subStrand: currentSubStrand.subStrand,
          learningOutcomes: currentSubStrand.learningOutcomes,
          activities: 'Group discussions, presentations, practicals.',
          resources: 'Textbooks, charts, digital content.',
          assessment: 'Quizzes, observation, portfolio.',
        });
      }
      return scheme;
    };
    const generatedScheme = generateSchemeAlgorithm(strands, formData.weeks);
    const newCustomization = {
      grade: formData.grade,
      subject: formData.subject,
      term: formData.term,
      weeks: formData.weeks,
    };
    setCustomization(newCustomization);
    setSchemeData(generatedScheme);
    addHistoryEntry({ schemeData: generatedScheme, customization: newCustomization });
    toast.success('Scheme of Work generated successfully!');
  }, [addHistoryEntry]);
  const handleGenerate = useCallback(async (formData: GeneratorFormValues) => {
    setIsLoading(true);
    setSchemeData(null);
    setCustomization(null);
    try {
      if (formData.sourceType === 'new') {
        if (!formData.googleDriveLink || !formData.designName) {
          throw new Error("Link and name are required for new designs.");
        }
        const requestPayload: CurriculumParseRequest = {
          url: formData.googleDriveLink,
          name: formData.designName,
        };
        const newDesign = await api<CurriculumDesign>('/api/parse-curriculum', {
          method: 'POST',
          body: JSON.stringify(requestPayload),
        });
        await fetchSavedDesigns(); // Refresh the list of saved designs
        handleFinalizeGeneration(newDesign.strands, formData);
      } else if (formData.sourceType === 'saved') {
        if (!formData.savedCurriculumId) {
          throw new Error("Please select a saved design.");
        }
        const selectedDesign = savedDesigns.find(d => d.id === formData.savedCurriculumId);
        if (!selectedDesign) {
          throw new Error("Selected design not found.");
        }
        handleFinalizeGeneration(selectedDesign.strands, formData);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to generate scheme: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [savedDesigns, fetchSavedDesigns, handleFinalizeGeneration]);
  const handleRestoreHistory = (entry: HistoryEntry) => {
    setSchemeData(entry.schemeData);
    setCustomization(entry.customization);
    toast.info('Scheme restored from history.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleDeleteDesign = async (id: string) => {
    try {
      await api(`/api/curriculums/${id}`, { method: 'DELETE' });
      setSavedDesigns(prev => prev.filter(d => d.id !== id));
      toast.success('Curriculum design deleted successfully.');
    } catch (error) {
      console.error('Failed to delete design:', error);
      toast.error('Could not delete the curriculum design.');
    }
  };
  const renderContent = () => {
    if (isLoading) {
      return <SchemeSkeleton />;
    }
    if (schemeData && customization) {
      return <SchemeOutput schemeData={schemeData} customization={customization} />;
    }
    return <EmptyState />;
  };
  return (
    <>
      <div className="min-h-screen w-full bg-background text-foreground font-sans antialiased">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_400px_at_50%_300px,#c7d2fe_0%,#f5f3ff_40%,transparent_100%)] dark:bg-[radial-gradient(circle_400px_at_50%_300px,#312e81_0%,#1e1b4b_40%,transparent_100%)] -z-10" />
        <ThemeToggle className="fixed top-4 right-4" />
        <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col items-center space-y-16 md:space-y-24">
            <header className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                <BookMarked className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground">
                ElimuPlan
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                An intelligent web application that generates Kenyan CBC Schemes of Work from Google Drive curriculum designs.
              </p>
            </header>
            <div className="w-full">
              <SchemeGenerator onSubmit={handleGenerate} isLoading={isLoading} savedDesigns={savedDesigns} />
            </div>
            <div className="w-full">
              {renderContent()}
            </div>
            <div className="w-full">
              <SavedDesignsManager designs={savedDesigns} onDelete={handleDeleteDesign} />
            </div>
            <div className="w-full">
              <HistoryPanel
                history={history}
                onRestore={handleRestoreHistory}
                onDelete={deleteHistoryEntry}
                onClear={clearHistory}
              />
            </div>
          </div>
        </main>
        <footer className="text-center py-8 text-muted-foreground">
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </div>
      <Toaster richColors closeButton />
    </>
  );
}