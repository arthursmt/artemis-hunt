import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface PipelineCardProps {
  title: string;
  count: number;
  href: string;
  color: "blue" | "yellow" | "green" | "red" | "indigo";
  icon: React.ReactNode;
  delay?: number;
}

const colorMap = {
  blue: "bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] hover:border-[#BFDBFE]",
  yellow: "bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7] hover:border-[#FDE68A]",
  green: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7] hover:border-[#BBF7D0]",
  red: "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2] hover:border-[#FECACA]",
  indigo: "bg-[#F5F3FF] text-[#7C3AED] border-[#EDE9FE] hover:border-[#DDD6FE]",
};

export function PipelineCard({ title, count, href, color, icon, delay = 0 }: PipelineCardProps) {
  return (
    <Link href={href}>
      <div 
        className="cursor-pointer group h-full"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={cn(
          "animate-in zoom-in-95 duration-500 h-full",
        )}>
          <Card className={cn(
            "h-full border-2 transition-all duration-300 flex flex-col justify-between hover:shadow-lg relative rounded-2xl",
            colorMap[color]
          )}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                  {icon}
                </div>
                <div className="text-4xl font-display font-bold tracking-tight">
                  {count}
                </div>
              </div>
              <h3 className="text-xl font-bold font-display text-slate-900">{title}</h3>
            </CardContent>
            
            <CardFooter className="p-5 pt-0 mt-auto">
              <div className="w-full flex items-center justify-between text-sm font-semibold transition-colors">
                <span className={cn(
                  color === "blue" ? "text-[#2563EB]" :
                  color === "yellow" ? "text-[#D97706]" :
                  color === "green" ? "text-[#16A34A]" :
                  color === "red" ? "text-[#DC2626]" :
                  "text-[#7C3AED]"
                )}>
                  View details
                </span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Link>
  );
}
