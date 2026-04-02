export interface Deployment {
  id: string
  project: string
  repo: string
  status: "success" | "running" | "failed"
  framework: string
  url?: string | null
  updatedAt: string
  logs: LogEntry[]
}

export interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "success" | "error" | "warning"
  message: string
}

const STORAGE_KEY = "keshav_deployments"

// Initial mock data to ensure the dashboard isn't empty
const MOCK_DATA: Deployment[] = [
  {
    id: "dep-1",
    project: "Antigravity Dashboard",
    repo: "antigravity/dashboard",
    status: "success",
    framework: "Next.js",
    url: "https://antigravity-dash.vercel.app",
    updatedAt: "2 min ago",
    logs: [
      { id: "1", timestamp: "14:20:01", level: "info", message: "Initializing deployment..." },
      { id: "2", timestamp: "14:20:15", level: "success", message: "Build completed successfully." }
    ]
  },
  {
    id: "dep-2",
    project: "E-commerce Engine",
    repo: "company/store",
    status: "running",
    framework: "Next.js",
    updatedAt: "Now",
    logs: [
      { id: "1", timestamp: "16:40:01", level: "info", message: "Fetching source from company/store..." },
      { id: "2", timestamp: "16:40:45", level: "info", message: "Installing dependencies..." },
      { id: "3", timestamp: "16:42:10", level: "info", message: "Running production build..." }
    ]
  },
  {
    id: "dep-3",
    project: "Landing Page V1",
    repo: "marketing/lp-v1",
    status: "failed",
    framework: "React",
    updatedAt: "1 hour ago",
    logs: [
      { id: "1", timestamp: "15:10:01", level: "info", message: "Starting build for marketing/lp-v1..." },
      { id: "2", timestamp: "15:11:20", level: "error", message: "Error: 'process.env.NEXT_PUBLIC_ANALYTICS_ID' is undefined during static generation." },
      { id: "3", timestamp: "15:11:21", level: "error", message: "Build failed: Exit code 1" }
    ]
  }
]

export const getDeployments = (): Deployment[] => {
  if (typeof window === "undefined") return MOCK_DATA
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA))
    return MOCK_DATA
  }
  return JSON.parse(stored)
}

export const addDeployment = (deployment: Deployment) => {
  const current = getDeployments()
  const updated = [deployment, ...current]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const updateDeploymentStatus = (id: string, status: Deployment["status"], logs?: LogEntry[]) => {
  const current = getDeployments()
  const updated = current.map(d => 
    d.id === id ? { ...d, status, logs: logs || d.logs } : d
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
