import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full py-6 px-4 mt-12 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
           <p className="text-sm text-gray-500">
          Made with 💻 by{" "}
          <a
            href="https://dipakchaudhari.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Dipak Chaudhari
          </a>
        </p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a
            href="https://github.com/yourusername/rag-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            GitHub
          </a>
          <Link
            href="/docs"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Documentation
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 text-center mt-4">
       
      </div>
    </footer>
  );
}
