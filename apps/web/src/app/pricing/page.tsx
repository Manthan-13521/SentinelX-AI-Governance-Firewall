import { Suspense } from "react"
import PricingClient from "./pricing-client"

export default async function PricingPage({ searchParams }: { searchParams: Promise<URLSearchParams> }) {
  const params = await searchParams
  const showSignupWelcome = params.get("signup") === "true"

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" /></div>}>
      <PricingClient showSignupWelcome={showSignupWelcome} />
    </Suspense>
  )
}