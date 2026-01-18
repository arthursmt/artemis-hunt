import { useProposalStore, ProposalWithData } from "@/lib/proposalStore";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Play, Calendar, Trash2, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { getProposalCompletionWithMinClients } from "@/lib/completionHelpers";

const getProposalCompletionPercent = (proposal: ProposalWithData): number => {
  const data = proposal.data || {};
  const group = data.group || { members: [], leaderId: 0, groupId: "" };
  const loanDetailsByMember = data.loanDetailsByMember || {};
  
  const result = getProposalCompletionWithMinClients(group, loanDetailsByMember);
  return result.percentage;
};

export default function OnGoingProposals() {
  const { proposals, deleteProposal } = useProposalStore();
  const [, setLocation] = useLocation();
  
  const ongoing = proposals
    .filter(p => p.status === 'on_going')
    .map(p => ({ ...p, completion: getProposalCompletionPercent(p) }))
    .sort((a, b) => {
      if (b.completion !== a.completion) {
        return b.completion - a.completion;
      }
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    });

  const handleDelete = (id: string) => {
    if (window.confirm("Delete proposal\n\nAre you sure you want to delete this proposal? This will remove all related data and cannot be undone.")) {
      deleteProposal(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200" data-testid="button-back">
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
                No ongoing proposals at the moment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Completion</TableHead>
                    <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Created Date</TableHead>
                    <TableHead className="text-center font-semibold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ongoing.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {proposal.leaderName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-[120px]">
                          <Progress value={proposal.completion} className="h-2 flex-1 bg-slate-200 [&>div]:bg-primary" />
                          <span className="text-sm font-semibold text-slate-700">{proposal.completion}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-slate-500">
                        <div className="flex items-center justify-end gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(proposal.dateCreated), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 rounded-lg shadow-sm px-4 whitespace-nowrap"
                            onClick={() => setLocation(`/product-config/${proposal.id}`)}
                            data-testid={`button-keep-filling-${proposal.id}`}
                          >
                            Keep filling <Play className="w-3 h-3 ml-2 fill-current" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-500 hover:text-primary h-9 w-9 p-0"
                            onClick={() => setLocation(`/ongoing/${proposal.id}/details`)}
                            data-testid={`button-view-details-${proposal.id}`}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 h-9 w-9 p-0"
                            onClick={() => handleDelete(String(proposal.id))}
                            data-testid={`button-delete-${proposal.id}`}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
