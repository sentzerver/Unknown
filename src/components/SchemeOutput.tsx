import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SchemeOfWorkEntry } from '@/lib/curriculum-types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
interface SchemeOutputProps {
  schemeData: SchemeOfWorkEntry[];
  customization: {
    grade: string;
    subject: string;
    term: string;
  };
}
export function SchemeOutput({ schemeData, customization }: SchemeOutputProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const handlePrint = () => {
    window.print();
  };
  const handleDownload = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Scheme_of_Work_${customization.grade}_${customization.subject}_Term_${customization.term}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Sorry, there was an error generating the PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button onClick={handlePrint} variant="outline" className="transition-all hover:bg-accent">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownload} disabled={isDownloading} className="transition-all hover:shadow-lg hover:-translate-y-0.5 w-40">
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <Card ref={printRef} className="w-full overflow-hidden shadow-lg border-border/50" id="scheme-output">
        <CardHeader className="bg-muted/30 p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-2xl font-bold font-display text-primary">
                Generated Scheme of Work
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                {customization.grade} | {customization.subject} | Term {customization.term}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-6 md:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[60px] font-semibold text-foreground">Week</TableHead>
                  <TableHead className="font-semibold text-foreground">Strand</TableHead>
                  <TableHead className="font-semibold text-foreground">Sub-Strand</TableHead>
                  <TableHead className="font-semibold text-foreground">Learning Outcomes</TableHead>
                  <TableHead className="font-semibold text-foreground">Activities</TableHead>
                  <TableHead className="font-semibold text-foreground">Resources</TableHead>
                  <TableHead className="font-semibold text-foreground">Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schemeData.map((entry) => (
                  <TableRow key={entry.week} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-center">{entry.week}</TableCell>
                    <TableCell>{entry.strand}</TableCell>
                    <TableCell>{entry.subStrand}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.learningOutcomes}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.activities}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.resources}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.assessment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}