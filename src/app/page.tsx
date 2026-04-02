"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { 
  Plus, Github, ExternalLink, Clock, 
  CheckCircle2, Loader2, ChevronRight, Rocket 
} from "lucide-react"
import { getDeployments, type Deployment } from "@/lib/storage"

export default function DashboardPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])

  useEffect(() => {
    setDeployments(getDeployments())
  }, [])

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-12 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#1A1F36] mb-1.5 line-height-tight">Keshav Deployment tool</h1>
          <p className="text-[15px] text-[#4F566B] font-medium leading-relaxed max-w-xl">
            Automate your release cycle with enterprise-grade deployment orchestration and real-time monitoring.
          </p>
        </div>
        <Link href="/deploy">
          <Button className="font-bold gap-2.5 h-11 px-8 rounded-xl bg-[#635BFF] shadow-[0_1px_1px_rgba(0,0,0,0.1),0_8px_16px_rgba(99,91,255,0.2)] hover:bg-[#5850EC] transition-all hover:-translate-y-0.5 active:translate-y-0">
            <Plus size={18} />
            New Deployment
          </Button>
        </Link>
      </div>

      {/* Deployment List */}
      <div className="space-y-6">
        {deployments.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 bg-transparent shadow-none">
            <Rocket className="mx-auto h-12 w-12 text-[#AAB7C4] mb-4" />
            <h3 className="text-lg font-bold text-[#1A1F36]">No deployments yet</h3>
            <p className="text-[#697386] mb-6">Start by connecting your first repository.</p>
            <Link href="/deploy">
              <Button variant="outline">Create your first release</Button>
            </Link>
          </Card>
        ) : (
          deployments.map((dep) => (
            <Card key={dep.id} className="group transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-7 gap-6">
                {/* Status & Project Info */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={cn(
                    "flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105",
                    dep.status === "running" ? "bg-[#F4F1FF] text-[#635BFF]" : 
                    dep.status === "failed" ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#F0FDF4] text-[#166534]"
                  )}>
                    {dep.status === "running" ? (
                      <div className="relative">
                        <Loader2 className="animate-spin" size={24} />
                        <div className="absolute inset-0 animate-ping opacity-20 bg-current rounded-full" />
                      </div>
                    ) : (
                      <CheckCircle2 size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="text-[17px] font-bold text-[#1A1F36] truncate">{dep.project}</h3>
                      <Badge variant="outline" className={cn(
                        "px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider border-transparent",
                        dep.status === "running" ? "bg-[#F4F1FF] text-[#635BFF]" : 
                        dep.status === "failed" ? "bg-[#FFF1F2] text-[#E11D48]" : "bg-[#DCFCE7] text-[#166534]"
                      )}>
                        {dep.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-[13px] text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Github size={14} className="opacity-60" />
                        <span className="truncate">{dep.repo}</span>
                      </div>
                      <span className="w-1 h-1 rounded-full bg-[#E6EBF1]" />
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="opacity-60" />
                        <span>{dep.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework & Actions */}
                <div className="flex items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-[#E6EBF1] pt-6 md:pt-0 md:pl-10">
                  <div className="hidden lg:block text-right pr-6 mini-divider">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4F566B] mb-1">Tech Stack</p>
                    <p className="text-[13px] font-bold text-[#1A1F36] opacity-80">{dep.framework}</p>
                  </div>
                  <div className="flex gap-3 flex-1 md:flex-initial">
                    {dep.url && (
                      <Button variant="outline" size="sm" asChild className="gap-2 h-9 px-4 font-bold border-[#E6EBF1]">
                        <a href={dep.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} />
                          Visit
                        </a>
                      </Button>
                    )}
                    <Link href={`/deployments/${dep.id}`} className="flex-1 md:flex-initial">
                      <Button variant="secondary" size="sm" className="w-full gap-2 h-9 px-4 font-bold bg-[#F6F9FC] text-[#4F566B] hover:bg-[#EFF2F5]">
                        Details
                        <ChevronRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
