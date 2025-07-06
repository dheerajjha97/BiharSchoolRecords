"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "./ui/separator"

type FormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card className="overflow-hidden shadow-none border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription className="pt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}
