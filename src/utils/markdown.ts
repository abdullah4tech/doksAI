import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  breaks: true, // Convert line breaks to <br>
  gfm: true, // Enable GitHub Flavored Markdown
})

/**
 * Parse markdown text to HTML with custom styling
 */
export function parseMarkdown(markdown: string): string {
  try {
    let html = marked(markdown) as string

    // Add custom CSS classes to HTML elements
    html = html
      // Style paragraphs
      .replace(/<p>/g, '<p class="mb-3 leading-relaxed">')
      // Style headings
      .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4 mt-6">')
      .replace(/<h2>/g, '<h2 class="text-xl font-semibold mb-3 mt-5">')
      .replace(/<h3>/g, '<h3 class="text-lg font-semibold mb-2 mt-4">')
      .replace(/<h4>/g, '<h4 class="text-base font-semibold mb-2 mt-3">')
      .replace(/<h5>/g, '<h5 class="text-sm font-semibold mb-1 mt-2">')
      .replace(/<h6>/g, '<h6 class="text-xs font-semibold mb-1 mt-2">')
      // Style links
      .replace(/<a href="/g, '<a href="')
      .replace(
        /<a /g,
        '<a class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" ',
      )
      // Style code blocks
      .replace(
        /<pre><code>/g,
        '<pre class="bg-gray-100 rounded-md p-3 my-2 overflow-x-auto"><code class="text-sm font-mono">',
      )
      // Style inline code
      .replace(/<code>/g, '<code class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono">')
      // Style blockquotes
      .replace(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-3 italic text-gray-700">',
      )
      // Style lists
      .replace(/<ul>/g, '<ul class="list-disc pl-6 my-2 space-y-1">')
      .replace(/<ol>/g, '<ol class="list-decimal pl-6 my-2 space-y-1">')
      // Style tables
      .replace(
        /<table>/g,
        '<div class="overflow-x-auto my-4"><table class="min-w-full border border-gray-300">',
      )
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<thead>/g, '<thead class="bg-gray-50">')
      .replace(/<tr>/g, '<tr class="border-b border-gray-200">')
      .replace(/<th>/g, '<th class="px-4 py-2 text-left font-semibold text-gray-900">')
      .replace(/<td>/g, '<td class="px-4 py-2 text-gray-700">')
      // Style strong/bold text
      .replace(/<strong>/g, '<strong class="font-semibold">')
      // Style emphasis/italic text
      .replace(/<em>/g, '<em class="italic">')

    return html
  } catch (error) {
    console.error('Markdown parsing error:', error)
    // Fallback to plain text with line breaks
    return markdown.replace(/\n/g, '<br>')
  }
}

/**
 * Strip markdown and return plain text (useful for previews)
 */
export function stripMarkdown(markdown: string): string {
  try {
    // Remove markdown syntax and return plain text
    return markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/^\s*[-*+]\s/gm, '') // Remove list markers
      .replace(/^\s*\d+\.\s/gm, '') // Remove ordered list markers
      .replace(/^\s*>\s/gm, '') // Remove blockquotes
      .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
      .trim()
  } catch (error) {
    console.error('Markdown stripping error:', error)
    return markdown
  }
}

export default { parseMarkdown, stripMarkdown }
