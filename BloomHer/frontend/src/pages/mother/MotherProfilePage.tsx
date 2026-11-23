import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { mothers } from '@/data/mock'

export function MotherProfilePage() {
  const { user } = useAuth()
  const mother = mothers[0]

  const fields = [
    ['Name', user?.name ?? mother.name],
    ['Email', user?.email ?? ''],
    ['Phone', mother.phone],
    ['Location', mother.village],
    ['Stage', mother.stageLabel],
    ['ASHA worker', mother.ashaName],
  ]

  return (
    <div>
      <PageHeader
        eyebrow="Profile"
        title="Your care profile"
        description="These details help your ASHA worker find you. They are not used to label a diagnosis."
      />
      <Card className="max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact and stage</CardTitle>
          <Badge tone="sage">Demo data</Badge>
        </CardHeader>
        <CardContent className="grid gap-3">
          {fields.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-canvas px-4 py-3">
              <span className="text-sm text-ink-muted">{label}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
