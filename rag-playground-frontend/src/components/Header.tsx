export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              RAG Playground
            </span>
            <span className="hidden md:inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              Beta
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/dchaudhari7177/Cognitive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
