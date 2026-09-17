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
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:max-w-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>Track a contribution</DialogTitle>
            <DialogDescription>Paste the link, classify the post, and send it for review.</DialogDescription>
          </DialogHeader>
          <ContributionComposer onSubmitted={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContributeFab;
