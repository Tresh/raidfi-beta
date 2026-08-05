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
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Track a contribution</DialogTitle>
            <DialogDescription>Submit an X post from your verified account.</DialogDescription>
          </DialogHeader>
          <ContributionComposer onSubmitted={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContributeFab;
