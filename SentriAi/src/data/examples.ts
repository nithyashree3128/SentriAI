import type { ExampleQuery } from '../types'

export const EXAMPLE_QUERIES: ExampleQuery[] = [
  { label: 'Normal lookup', query: "SELECT * FROM products WHERE category = 'electronics';" },
  { label: 'Tautology', query: "SELECT * FROM users WHERE username = 'admin' OR '1'='1';" },
  { label: 'Comment truncation', query: "SELECT * FROM users WHERE username = 'admin'--' AND password = '';" },
  { label: 'Stacked query', query: "SELECT * FROM users WHERE id = 1; DROP TABLE users;" },
  { label: 'Union-based', query: 'SELECT name, price FROM products WHERE id = 4 UNION SELECT username, password FROM users;' },
]
