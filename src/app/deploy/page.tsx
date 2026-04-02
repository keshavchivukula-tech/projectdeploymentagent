"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card"
import { Stepper } from "@/components/ui/Stepper"
import { Badge } from "@/components/ui/Badge"
import { LogConsole } from "@/components/ui/LogConsole"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft, ArrowRight, Github, Rocket, Lock, 
  Settings, Key, Plus, Trash2, CheckCircle2, 
  Terminal, Server, Layout, ChevronRight,
  ShieldCheck, Loader2, ExternalLink, Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { addDeployment, updateDeploymentStatus, type Deployment, type LogEntry } from "@/lib/storage"
import { FRAMEWORK_PRESETS } from "@/lib/constants"

const STEPS = ["Project Source", "GitHub Setup", "Vercel Config", "Env Vars", "Review & Deploy"]

export default function DeployPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentLogs, setDeploymentLogs] = useState<LogEntry[]>([])
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    projectName: "",
    projectId: "",
    githubToken: "",
    repoName: "",
    isPublic: false,
    vercelToken: "",
    vercelProject: "",
    framework: "nextjs", // Default to nextjs as seen in internal keys
    envVars: [{ key: "", value: "" }]
  })

  const handleAutoSuggest = () => {
    const preset = FRAMEWORK_PRESETS[formData.framework] || FRAMEWORK_PRESETS.nextjs
    const suggestions = preset.envVars.map(key => ({ key, value: "" }))
    
    // Append to current list, filter out existing keys
    const existingKeys = new Set(formData.envVars.map(v => v.key))
    const uniqueSuggestions = suggestions.filter(s => !existingKeys.has(s.key))
    
    if (uniqueSuggestions.length === 0) {
      toast.info("All common variables already added.")
      return
    }

    setFormData(prev => ({
      ...prev,
      envVars: [...prev.envVars, ...uniqueSuggestions].filter(v => v.key || v.value) // Clean up empty first row if needed
    }))
    
    toast.success(`Added ${uniqueSuggestions.length} suggestions for ${preset.name}`)
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.push("/")
    }
  }

  const addEnvVar = () => {
    setFormData(prev => ({
      ...prev,
      envVars: [...prev.envVars, { key: "", value: "" }]
    }))
  }

  const removeEnvVar = (index: number) => {
    setFormData(prev => ({
      ...prev,
      envVars: prev.envVars.filter((_, i) => i !== index)
    }))
  }

  const updateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const nextEnvVars = [...formData.envVars]
    nextEnvVars[index][field] = value
    setFormData(prev => ({ ...prev, envVars: nextEnvVars }))
  }

  const startDeployment = async () => {
    setIsDeploying(true)
    setDeploymentLogs([])
    
    const deploymentId = `dep_${Math.random().toString(36).substr(2, 9)}`
    
    // Save to persistence
    addDeployment({
      id: deploymentId,
      project: formData.projectName,
      repo: formData.repoName,
      status: "running",
      framework: formData.framework,
      updatedAt: "Now",
      logs: []
    })

    const addLog = (message: string, level: LogEntry["level"] = "info") => {
      const newLog = { 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: new Date().toLocaleTimeString([], { hour12: false }), 
        level, 
        message 
      }
      setDeploymentLogs(prev => {
        const next = [...prev, newLog]
        updateDeploymentStatus(deploymentId, "running", next)
        return next
      })
    }

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        addLog(`❌ Deployment rejected: ${error.error || "Unknown Error"}`, "error")
        setIsDeploying(false)
        return
      }

      const { deploymentId } = await response.json()
      addLog(`🚀 Initialization complete. Deployment ID: ${deploymentId}`, "success")

      // Start SSE log stream
      const eventSource = new EventSource(`/api/deploy?id=${deploymentId}`)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)
        addLog(data.message, data.level)
        
        if (data.done) {
          eventSource.close()
          setIsDeploying(false)
          if (data.url) {
            setDeployedUrl(data.url)
            updateDeploymentStatus(deploymentId, "success", [
              ...deploymentLogs,
              { id: "final", timestamp: new Date().toLocaleTimeString(), level: "success", message: `Deployment live at ${data.url}` }
            ])
          } else {
            updateDeploymentStatus(deploymentId, "success")
          }
          toast.success("Deployment Successful!", {
            description: "Your project is now live on Vercel."
          })
        }
      }

      eventSource.onerror = (error) => {
        addLog("🚨 Connection lost. Reconnecting or failed.", "error")
        updateDeploymentStatus(deploymentId, "failed")
        eventSource.close()
        setIsDeploying(false)
      }

    } catch (error) {
      addLog(`❌ Fatal error: ${error instanceof Error ? error.message : "Network failure"}`, "error")
      updateDeploymentStatus(deploymentId, "failed")
      setIsDeploying(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Server size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Project Source</h2>
                <p className="text-sm text-gray-400">Fetch the code from your Antigravity environment.</p>
              </div>
            </div>
            <Input 
              label="Antigravity Project Name" 
              placeholder="my-awesome-app"
              value={formData.projectName}
              onChange={(e) => updateFormData("projectName", e.target.value)}
            />
            <Input 
              label="Project ID (Optional)" 
              placeholder="ag_1e2d3c..."
              value={formData.projectId}
              onChange={(e) => updateFormData("projectId", e.target.value)}
            />
            <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
              <ShieldCheck className="text-indigo-400 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                Antigravity will automatically bundle your current workspace and prepare it for transmission. Ensure all your changes are saved before deploying.
              </p>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6 text-gray-50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-50 text-gray-900 rounded-lg">
                <Github size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">GitHub Setup</h2>
                <p className="text-sm text-gray-400">Configure where your code will be pushed.</p>
              </div>
            </div>
            <Input 
              label="GitHub Personal Access Token" 
              type="password"
              placeholder="ghp_••••••••••••••••••••••••"
              value={formData.githubToken}
              onChange={(e) => updateFormData("githubToken", e.target.value)}
            />
            <Input 
              label="Repository Name" 
              placeholder="username/repo-name"
              value={formData.repoName}
              onChange={(e) => updateFormData("repoName", e.target.value)}
            />
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <Layout size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Vercel Config</h2>
                <p className="text-sm text-gray-400">Configure your production deployment platform.</p>
              </div>
            </div>
            <Input 
              label="Vercel Access Token" 
              type="password"
              placeholder="••••••••••••••••••••••••"
              value={formData.vercelToken}
              onChange={(e) => updateFormData("vercelToken", e.target.value)}
            />
            <Input 
              label="Vercel Project Name" 
              placeholder="my-project-production"
              value={formData.vercelProject}
              onChange={(e) => updateFormData("vercelProject", e.target.value)}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Framework Preset</label>
              <div className="grid grid-cols-2 gap-3">
                {["Next.js", "React", "Node.js", "Static"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateFormData("framework", preset.toLowerCase())}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-sm font-bold transition-all",
                      formData.framework === preset.toLowerCase()
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/5 bg-white/5 text-gray-500 hover:border-white/10"
                    )}
                  >
                    {preset}
                    {formData.framework === preset.toLowerCase() && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
                  <Settings size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Env Vars</h2>
                  <p className="text-sm text-gray-400">Key-value pairs for your application.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={handleAutoSuggest} className="gap-2 font-bold h-9 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/10">
                  <Sparkles size={14} /> Suggestions
                </Button>
                <Button variant="secondary" size="sm" onClick={addEnvVar} className="gap-2 font-bold h-9">
                  <Plus size={16} /> Add Var
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {formData.envVars.map((env, idx) => (
                <div key={idx} className="flex gap-2 items-end group animate-fade-in text-gray-50">
                  <div className="flex-1">
                    <Input 
                      placeholder="KEY" 
                      value={env.key} 
                      onChange={(e) => updateEnvVar(idx, "key", e.target.value)} 
                    />
                  </div>
                  <div className="flex-[1.5]">
                    <Input 
                      placeholder="VALUE" 
                      value={env.value} 
                      onChange={(e) => updateEnvVar(idx, "value", e.target.value)} 
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeEnvVar(idx)}
                    className="shrink-0 text-gray-600 hover:text-red-400 hover:bg-red-400/10 h-11 w-11"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Review & Deploy</h2>
                <p className="text-sm text-gray-400">Confirm your settings and trigger the pipeline.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Server size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Antigravity</span>
                </div>
                <p className="text-sm font-bold text-gray-200">{formData.projectName || "Unnamed Project"}</p>
                <div className="flex items-center gap-2 text-gray-500">
                  <Github size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">GitHub Repo</span>
                </div>
                <p className="text-sm font-bold text-gray-200">{formData.repoName || "Not Set"}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-gray-500">
                  <Layout size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Vercel Target</span>
                </div>
                <p className="text-sm font-bold text-gray-200">{formData.vercelProject || "Not Set"}</p>
                 <div className="flex items-center gap-2 text-gray-500">
                  <Settings size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Framework</span>
                </div>
                <p className="text-sm font-bold text-gray-200 uppercase">{formData.framework}</p>
              </div>
            </div>

            {isDeploying && (
              <LogConsole logs={deploymentLogs} isDeploying={isDeploying} className="h-64 mt-6" />
            )}

            {deployedUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mt-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-green-500" />
                  <div>
                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest">Deployment Live</h4>
                    <p className="text-xs text-gray-300 font-medium">{deployedUrl}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                    Open URL
                  </a>
                </Button>
              </motion.div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12 animate-fade-in relative z-10 text-[#1A1F36]">
      {/* Header */}
      <div className="flex items-center gap-5">
        <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground rounded-xl hover:bg-secondary">
          <ArrowLeft size={22} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1F36]">Release Pipeline</h1>
          <p className="text-[14px] text-[#4F566B] font-medium leading-relaxed">Design and deploy your production-grade infrastructure.</p>
        </div>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <Card className="relative overflow-hidden border-[#E6EBF1] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_30px_60px_-15px_rgba(42,50,121,0.05)]">
        {/* Subtle decorative elements for Stripe mode */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#635BFF]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <CardContent className="p-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="p-8 pt-0 flex justify-between gap-4">
          <Button 
            variant="secondary" 
            onClick={handleBack}
            disabled={isDeploying}
            className="font-bold h-11 px-8"
          >
            {currentStep === 0 ? "Dashboard" : "Back"}
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
             <Button 
              onClick={startDeployment}
              disabled={isDeploying || !formData.repoName || !formData.vercelToken}
              className="font-bold h-11 px-10 gap-2 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
            >
              {isDeploying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket size={18} />
                  Trigger Deployment
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="font-bold h-11 px-10 gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
