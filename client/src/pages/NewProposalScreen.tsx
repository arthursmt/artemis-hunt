import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProposalSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProposal } from "@/hooks/use-proposals";
import { useToast } from "@/hooks/use-toast";

// Extend the schema for the form
const formSchema = insertProposalSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProposalScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProposal = useCreateProposal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      amount: "",
      status: "on_going",
    },
  });

  const onSubmit = (data: FormValues) => {
    createProposal.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "New proposal created successfully.",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create proposal",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">New Proposal</h1>
            <p className="text-slate-500">Originate a new credit application.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Maria Silva" className="h-12 text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 font-semibold">Requested Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="h-12 text-lg font-mono" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex gap-3">
                  <Link href="/" className="w-full">
                    <Button variant="outline" className="w-full h-12">Cancel</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                    disabled={createProposal.isPending}
                  >
                    {createProposal.isPending ? "Creating..." : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Create Proposal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
