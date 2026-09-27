import { EXAMPLE_QUERIES } from '../data/examples'
export { EXAMPLE_QUERIES as exampleQueries }

interface ExampleQueriesProps {
  onSelect: (query: string) => void
  disabled: boolean
}

export default function ExampleQueries({ onSelect, disabled }: ExampleQueriesProps) {
  return (
    <div className="examples">
      <span className="examples__label">Try an example</span>
      <div className="examples__list">
        {EXAMPLE_QUERIES.map((example) => (
          <button
            key={example.label}
            type="button"
            className="chip"
            onClick={() => onSelect(example.query)}
            disabled={disabled}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  )
}
