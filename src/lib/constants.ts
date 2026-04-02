export const FRAMEWORK_PRESETS: Record<string, { name: string; envVars: string[] }> = {
  nextjs: {
    name: "Next.js",
    envVars: [
      "NEXT_PUBLIC_APP_URL",
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    ]
  },
  react: {
    name: "React (Vite)",
    envVars: [
      "VITE_API_URL",
      "VITE_APP_TITLE",
      "VITE_FIREBASE_API_KEY",
      "VITE_AUTH_DOMAIN"
    ]
  },
  nodejs: {
    name: "Node.js",
    envVars: [
      "PORT",
      "NODE_ENV",
      "MONGODB_URI",
      "REDIS_URL",
      "JWT_SECRET"
    ]
  },
  static: {
    name: "Static HTML",
    envVars: [
      "SITE_URL",
      "UMAMI_WEBSITE_ID"
    ]
  }
}
