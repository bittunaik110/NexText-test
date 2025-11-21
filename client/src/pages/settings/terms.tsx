
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-border bg-card/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/settings")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Legal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="terms">
          <TabsList className="w-full">
            <TabsTrigger value="terms" className="flex-1">Terms of Service</TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">Privacy Policy</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="mt-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Terms of Service</h2>
              <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
              
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                  <p className="text-sm text-muted-foreground">
                    By accessing and using NexText, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">2. Use License</h3>
                  <p className="text-sm text-muted-foreground">
                    Permission is granted to temporarily use NexText for personal, non-commercial transitory viewing only.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">3. User Accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">4. Prohibited Uses</h3>
                  <p className="text-sm text-muted-foreground">
                    You may not use NexText for any illegal or unauthorized purpose. You must not transmit any worms or viruses or any code of a destructive nature.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">5. Termination</h3>
                  <p className="text-sm text-muted-foreground">
                    We may terminate or suspend your account and bar access to NexText immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="mt-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-xl font-bold">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
              
              <div className="space-y-4">
                <section>
                  <h3 className="font-semibold mb-2">1. Information We Collect</h3>
                  <p className="text-sm text-muted-foreground">
                    We collect information you provide directly to us, including your name, email address, and any messages you send through NexText.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
                  <p className="text-sm text-muted-foreground">
                    We use the information we collect to provide, maintain, and improve our services, to develop new ones, and to protect NexText and our users.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">3. Information Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    We do not share your personal information with companies, organizations, or individuals outside of NexText except in the following cases: with your consent, for legal reasons.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">4. Data Security</h3>
                  <p className="text-sm text-muted-foreground">
                    We work hard to protect NexText and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. All messages are encrypted end-to-end.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">5. Your Rights</h3>
                  <p className="text-sm text-muted-foreground">
                    You have the right to access, update, or delete your personal information at any time. You can also request a copy of your data.
                  </p>
                </section>

                <section>
                  <h3 className="font-semibold mb-2">6. Contact Us</h3>
                  <p className="text-sm text-muted-foreground">
                    If you have any questions about this Privacy Policy, please contact us at privacy@nextext.com
                  </p>
                </section>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
