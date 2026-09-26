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
        className="fixed bottom-6 right-6 z-40 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/35 flex items-center justify-center p-3.5 hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
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
