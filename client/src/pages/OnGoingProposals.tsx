import { useProposalStore } from "@/lib/proposalStore";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Play, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

export default function OnGoingProposals() {
  const { proposals } = useProposalStore();
  const [, setLocation] = useLocation();
  const ongoing = proposals.filter(p => p.status === 'on_going');

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">On Going Proposals</h1>
            <p className="text-slate-500">Active applications currently in progress.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="text-blue-900 flex items-center gap-2 text-lg">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Proposals List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ongoing.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No active proposals found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-900">Date Created</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ongoing.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {proposal.leaderName}
                      </TableCell>
                      <TableCell className="font-mono text-slate-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalAmount)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(proposal.dateCreated), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="on_going" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="hover:bg-blue-100 hover:text-blue-700"
                          onClick={() => setLocation(`/product-config/${proposal.id}`)}
                        >
                          Keep filling <Play className="w-3 h-3 ml-2 fill-current" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
