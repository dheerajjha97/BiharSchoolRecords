"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type FormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription className="pt-1">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}
