export default function ComingSoonCard({ title, description }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  )
}
