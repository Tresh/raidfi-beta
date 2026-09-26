import { useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ContributionComposer from "@/components/dashboard/ContributionComposer";

const ContributeFab = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Submit a contribution"
        className="fixed bottom-5 right-5 z-40 h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-md flex flex-col p-5 rounded-2xl overflow-hidden">
          <DialogHeader className="shrink-0 mb-3 text-left">
            <DialogTitle className="text-base font-bold">Track a contribution</DialogTitle>
            <DialogDescription className="text-xs">Paste your X post link to record it.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 flex-1">
            <ContributionComposer onSubmitted={() => setOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContributeFab;
