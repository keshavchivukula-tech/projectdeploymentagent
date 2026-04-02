"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Terminal, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"

export interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "success" | "error" | "warning"
  message: string
}

interface LogConsoleProps {
  logs: LogEntry[]
  isDeploying?: boolean
  className?: string
}

export function LogConsole({ logs, isDeploying, className }: LogConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className={cn("flex flex-col h-full bg-[#030712] border border-white/10 rounded-xl overflow-hidden font-mono text-sm", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Deployment Logs</span>
        </div>
        {isDeploying && (
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-primary" />
            <span className="text-[10px] font-medium text-primary animate-pulse">Running...</span>
          </div>
        )}
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 italic">
            Waiting for deployment to start...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-3 group">
              <span className="text-gray-700 shrink-0 select-none">{log.timestamp}</span>
              <div className="flex gap-2 min-w-0">
                {log.level === "success" ? (
                  <ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : log.level === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                ) : null}
                <span className={cn(
                  "break-all",
                  log.level === "success" && "text-green-400",
                  log.level === "error" && "text-red-400",
                  log.level === "warning" && "text-yellow-400",
                  log.level === "info" && "text-gray-300"
                )}>
                  {log.message}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
