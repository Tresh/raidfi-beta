import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle2, Users, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Referrals = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/waitlist?ref=${profile.referral_code}`
    : "";

  const handleCopy = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Invite friends and grow the community. Share your unique link.
        </p>
      </div>

      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profile?.referral_count ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Link className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-mono text-foreground">{profile?.referral_code ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Your Code</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Your Referral Link</h3>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="h-10 text-sm font-mono bg-muted/50"
              />
              <Button onClick={handleCopy} variant="outline" className="h-10 px-4 shrink-0">
                {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Share this link with friends. When they complete the waitlist, your referral count increases.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
