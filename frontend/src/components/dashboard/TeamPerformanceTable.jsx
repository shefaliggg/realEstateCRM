// Generic per-person performance table. `columns` is [{ key, label }], `rows` is
// [{ id, name, [column.key]: value }]. Used for both the sales/CRM manager team
// views and the partner-admin team view.
export default function TeamPerformanceTable({ columns, rows, emptyText = 'No team activity yet.' }) {
  if (!rows?.length) {
    return <div className="text-center py-6 text-gray-400 text-sm">{emptyText}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b border-gray-100">
            <th className="py-2 pr-4 font-medium">Name</th>
            {columns.map((col) => (
              <th key={col.key} className="py-2 pr-4 font-medium text-right">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="py-2 pr-4 text-gray-900 font-medium">{row.name}</td>
              {columns.map((col) => (
                <td key={col.key} className="py-2 pr-4 text-right text-gray-700">{row[col.key] ?? 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
