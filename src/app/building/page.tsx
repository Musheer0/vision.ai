"use client"

import { useEffect, useState } from "react"
import { Brain, Sparkles, Zap } from "lucide-react"

export default function Page() {
  const [dots, setDots] = useState("")
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    "Analyzing market trends",
    "Processing AI algorithms",
    "Generating creative names",
    "Refining suggestions",
  ]

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => {
      clearInterval(dotsInterval)
      clearInterval(stepInterval)
    }
  }, [steps.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 flex items-center justify-center p-6">
      <div className="text-center space-y-8 max-w-md">
        {/* Vision.ai Logo */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-orange-500 tracking-tight">Vision.ai</h1>
          <div className="w-16 h-0.5 bg-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Animated Icons */}
        <div className="relative flex justify-center items-center space-x-4 py-8">
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-32 h-32 border border-orange-500/20 rounded-full animate-spin-slow"></div>
            <div className="absolute w-24 h-24 border-2 border-orange-500/40 rounded-full animate-pulse"></div>
          </div>

          <div className="relative z-10 flex space-x-6">
            <div className="p-3 bg-orange-500/10 rounded-full animate-bounce delay-0">
              <Brain className="w-6 h-6 text-orange-500" />
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full animate-bounce delay-150">
              <Zap className="w-6 h-6 text-orange-500" />
            </div>
            <div className="p-3 bg-orange-500/10 rounded-full animate-bounce delay-300">
              <Sparkles className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Generating Website</h2>
          <p className="text-zinc-300/80 text-lg">Our AI is crafting the perfect website for your vision{dots}</p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-zinc-400/80 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>

          <div className="w-full bg-zinc-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-2000 ease-out"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          <p className="text-zinc-400/90 text-sm font-medium min-h-[20px]">{steps[currentStep]}</p>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full animate-float"
              style={{
                left: `${20 + i * 15}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
