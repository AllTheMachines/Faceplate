interface PropertySectionProps {
  title: string
  children: React.ReactNode
}

export function PropertySection({ title, children }: PropertySectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-300 mb-3">{title}</h3>
      <div>{children}</div>
    </div>
  )
}
