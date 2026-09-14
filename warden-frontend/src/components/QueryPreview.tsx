interface QueryPreviewProps {
  query: string
}

export default function QueryPreview({ query }: QueryPreviewProps) {
  return (
    <div className="preview">
      <span className="preview__label">Submitted query</span>
      <pre className="preview__code">
        <code>{query}</code>
      </pre>
    </div>
  )
}
