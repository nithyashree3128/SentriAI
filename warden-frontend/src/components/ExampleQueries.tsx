import type { ExampleQuery } from '../types'

// These populate the input field for convenience only. The result shown
// for any of them always comes from the live backend response — nothing
// here is used as, or stands in for, detection logic.
export const exampleQueries: ExampleQuery[] = [
  { label: 'Normal lookup', query: "SELECT * FROM products WHERE category = 'electronics';" },
  { label: 'Tautology', query: "SELECT * FROM users WHERE username = 'admin' OR '1'='1';" },
  { label: 'Comment truncation', query: "SELECT * FROM users WHERE username = 'admin'--' AND password = '';" },
  { label: 'Stacked query', query: "SELECT * FROM users WHERE id = 1; DROP TABLE users;" },
  { label: 'Union-based', query: 'SELECT name, price FROM products WHERE id = 4 UNION SELECT username, password FROM users;' },
]

interface ExampleQueriesProps {
  onSelect: (query: string) => void
  disabled: boolean
}

export default function ExampleQueries({ onSelect, disabled }: ExampleQueriesProps) {
  return (
    <div className="examples">
      <span className="examples__label">Try an example</span>
      <div className="examples__list">
        {exampleQueries.map((example) => (
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
