"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { LogConsole } from "@/components/ui/LogConsole"
import { 
  ArrowLeft, Github, Terminal, CheckCircle2, 
  XCircle, Loader2, Sparkles, AlertTriangle,
  RotateCcw, ExternalLink
} from "lucide-react"
import { getDeployments, updateDeploymentStatus, type Deployment, type LogEntry } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function DeploymentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [isFixing, setIsFixing] = useState(false)

  useEffect(() => {
    const data = getDeployments().find(d => d.id === params.id)
    if (data) {
      setDeployment(data)
    }
  }, [params.id])

  if (!deployment) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary h-12 w-12" />
      </div>
    )
  }

  const handleFixAndRedeploy = async () => {
    setIsFixing(true)
    
    // Simulate "AI Debugging"
    toast.info("AI Analysis started...", {
      description: "Inspecting build logs and environment configuration."
    })

    await new Promise(r => setTimeout(r, 2000))

    const fixLogs: LogEntry[] = [
      ...deployment.logs,
      { id: "fix-1", timestamp: new Date().toLocaleTimeString(), level: "warning", message: "AI detected missing environment variable: NEXT_PUBLIC_ANALYTICS_ID" },
      { id: "fix-2", timestamp: new Date().toLocaleTimeString(), level: "info", message: "Applying automated patch to .env.production..." },
      { id: "fix-3", timestamp: new Date().toLocaleTimeString(), level: "success", message: "Hotfix applied. Triggering optimized redeploy..." },
      { id: "fix-4", timestamp: new Date().toLocaleTimeString(), level: "info", message: "Build restarted. Static generation in progress..." }
    ]

    setDeployment(prev => prev ? ({ ...prev, status: "running" as const, logs: fixLogs }) : null)
    updateDeploymentStatus(deployment.id, "running", fixLogs)

    // Simulate success after 5 seconds
    setTimeout(() => {
      const successLogs: LogEntry[] = [
        ...fixLogs,
        { id: "fix-5", timestamp: new Date().toLocaleTimeString(), level: "success", message: "Redeploy successful! Static pages generated." },
        { id: "fix-6", timestamp: new Date().toLocaleTimeString(), level: "info", message: "Live at: https://landing-v1-fixed.vercel.app" }
      ]
      setDeployment(prev => prev ? ({ 
        ...prev, 
        status: "success" as const, 
        logs: successLogs,
        url: "https://landing-v1-fixed.vercel.app" 
      }) : null)
      updateDeploymentStatus(deployment.id, "success", successLogs)
      setIsFixing(false)
      toast.success("Deployment Fixed!", {
        description: "Landing Page V1 is now live."
      })
    }, 5000)
  }

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto space-y-10 animate-fade-in relative z-10 text-[#1A1F36]">
      {/* Navigation */}
      <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground h-10 px-4 rounded-xl hover:bg-white transition-all">
        <Link href="/">
          <ArrowLeft size={18} />
          <span className="font-bold text-[14px]">Back to Dashboard</span>
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="border-[#E6EBF1] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_20px_40px_-5px_rgba(42,50,121,0.04)]">
        <CardContent className="p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-[#F6F9FC] border border-[#E6EBF1] shadow-inner">
                  <Github size={28} className="text-[#4F566B]" />
                </div>
                <div>
                  <h1 className="text-[28px] font-bold text-[#1A1F36] tracking-tight mb-1.5">{deployment.project}</h1>
                  <p className="text-[#4F566B] font-medium text-[15px] flex items-center gap-2.5">
                    {deployment.repo}
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E6EBF1]" />
                    Last release {deployment.updatedAt}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className={cn(
                  "px-3 py-1 rounded-lg text-[12px] font-bold border-transparent",
                  deployment.status === "running" ? "bg-[#F4F1FF] text-[#635BFF]" : deployment.status === "success" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#FEE2E2] text-[#991B1B]"
                )}>
                  {deployment.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-[#F6F9FC] border-[#E6EBF1] text-[#4F566B] px-3 py-1 rounded-lg text-[12px] font-bold">
                  {deployment.framework}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {deployment.url && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} />
                    Visit Site
                  </a>
                </Button>
              )}
              {deployment.status === "failed" && !isFixing && (
                <Button onClick={handleFixAndRedeploy} className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                  <Sparkles size={16} />
                  Fix & Redeploy
                </Button>
              )}
              {deployment.status === "running" && (
                <Button variant="secondary" disabled className="gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  Building...
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Insight (If Failed) */}
      <AnimatePresence>
        {deployment.status === "failed" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-red-500/20 bg-red-500/[0.02]">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-red-100 mb-1">Build Failure Detected</h3>
                  <p className="text-sm text-red-200/60 leading-relaxed">
                    The build failed during the static generation phase. The required environment variable `NEXT_PUBLIC_ANALYTICS_ID` is missing in the production environment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Logs Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">Deployment Timeline</h2>
            <Badge variant="outline" className="bg-gray-50 border-border text-muted-foreground">
              Live Stream
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <RotateCcw size={12} />
            Refresh Logs
          </Button>
        </div>

        <div className="h-[500px]">
          <LogConsole 
            logs={deployment.logs} 
            isDeploying={deployment.status === "running"} 
          />
        </div>
      </div>
    </div>
  )
}
