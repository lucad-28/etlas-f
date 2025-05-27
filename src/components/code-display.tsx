"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

type CodeDisplayProps = {
  code: string
  language: string
}

export function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-2 px-4 bg-muted flex flex-row items-center justify-between">
        <div className="text-sm font-medium">{language}</div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyToClipboard}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <pre className="p-4 overflow-x-auto text-sm">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
