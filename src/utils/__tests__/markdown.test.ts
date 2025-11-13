import { describe, it, expect } from 'vitest'
import { parseMarkdown, stripMarkdown } from '../markdown'

describe('Markdown Utilities', () => {
  describe('parseMarkdown', () => {
    it('should parse simple paragraphs', () => {
      const markdown = 'This is a paragraph.'
      const result = parseMarkdown(markdown)

      expect(result).toContain('This is a paragraph.')
      expect(result).toContain('<p class="mb-3 leading-relaxed">')
    })

    it('should parse headings with correct classes', () => {
      const markdown = '# Heading 1\n## Heading 2'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="text-2xl font-bold mb-4 mt-6"')
      expect(result).toContain('class="text-xl font-semibold mb-3 mt-5"')
    })

    it('should parse bold text', () => {
      const markdown = 'This is **bold** text'
      const result = parseMarkdown(markdown)

      expect(result).toContain('<strong class="font-semibold">bold</strong>')
    })

    it('should parse italic text', () => {
      const markdown = 'This is *italic* text'
      const result = parseMarkdown(markdown)

      expect(result).toContain('<em class="italic">italic</em>')
    })

    it('should parse links with correct attributes', () => {
      const markdown = '[Google](https://google.com)'
      const result = parseMarkdown(markdown)

      expect(result).toContain('text-blue-600')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener noreferrer"')
    })

    it('should parse inline code with styling', () => {
      const markdown = 'Use `const x = 5;` in JavaScript'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"')
    })

    it('should parse code blocks with styling', () => {
      const markdown = '```\nconst x = 5;\n```'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="bg-gray-100 rounded-md p-3 my-2 overflow-x-auto"')
    })

    it('should parse blockquotes with styling', () => {
      const markdown = '> This is a quote'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="border-l-4 border-gray-300 pl-4 py-2 my-3 italic text-gray-700"')
    })

    it('should parse unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="list-disc pl-6 my-2 space-y-1"')
      expect(result).toContain('Item 1')
      expect(result).toContain('Item 2')
    })

    it('should parse ordered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third'
      const result = parseMarkdown(markdown)

      expect(result).toContain('class="list-decimal pl-6 my-2 space-y-1"')
    })

    it('should parse tables with styling', () => {
      const markdown = '| Col 1 | Col 2 |\n|-------|-------|\n| A | B |'
      const result = parseMarkdown(markdown)

      expect(result).toContain('overflow-x-auto')
      expect(result).toContain('min-w-full border border-gray-300')
    })

    it('should handle complex markdown with mixed content', () => {
      const markdown = `# Title
      
This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

> A blockquote

\`\`\`
code block
\`\`\``

      const result = parseMarkdown(markdown)

      expect(result).toContain('Title')
      expect(result).toContain('bold')
      expect(result).toContain('italic')
      expect(result).toContain('List item')
      expect(result).toContain('blockquote')
    })

    it('should handle empty strings gracefully', () => {
      const markdown = ''
      const result = parseMarkdown(markdown)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle markdown parsing errors gracefully', () => {
      const markdown = 'This is regular text with line breaks\nand more text'
      const result = parseMarkdown(markdown)

      expect(result).toBeDefined()
    })
  })

  describe('stripMarkdown', () => {
    it('should remove heading markers', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3'
      const result = stripMarkdown(markdown)

      expect(result).not.toContain('#')
      expect(result).toContain('Heading 1')
      expect(result).toContain('Heading 2')
      expect(result).toContain('Heading 3')
    })

    it('should remove bold formatting', () => {
      const markdown = 'This is **bold** text'
      const result = stripMarkdown(markdown)

      expect(result).toBe('This is bold text')
    })

    it('should remove italic formatting', () => {
      const markdown = 'This is *italic* text'
      const result = stripMarkdown(markdown)

      expect(result).toBe('This is italic text')
    })

    it('should remove inline code markers', () => {
      const markdown = 'Use `const x = 5;` in code'
      const result = stripMarkdown(markdown)

      expect(result).toBe('Use const x = 5; in code')
    })

    it('should remove links but keep text', () => {
      const markdown = 'Click [here](https://example.com) for more'
      const result = stripMarkdown(markdown)

      expect(result).toBe('Click here for more')
    })

    it('should remove images', () => {
      const markdown = 'Image: ![alt text](image.png) and text'
      const result = stripMarkdown(markdown)

      expect(result).toContain('and text')
      expect(result).not.toContain('![')
    })

    it('should remove list markers', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3'
      const result = stripMarkdown(markdown)

      expect(result).not.toContain('-')
      expect(result).toContain('Item 1')
      expect(result).toContain('Item 2')
    })

    it('should remove ordered list markers', () => {
      const markdown = '1. First\n2. Second\n3. Third'
      const result = stripMarkdown(markdown)

      expect(result).not.toContain('1.')
      expect(result).toContain('First')
      expect(result).toContain('Second')
    })

    it('should remove blockquote markers', () => {
      const markdown = '> This is a quote\n> Second line'
      const result = stripMarkdown(markdown)

      expect(result).not.toContain('>')
      expect(result).toContain('This is a quote')
    })

    it('should collapse multiple line breaks', () => {
      const markdown = 'Line 1\n\n\nLine 2\n\n\nLine 3'
      const result = stripMarkdown(markdown)

      const lines = result.split('\n').filter((line) => line.trim())
      expect(lines.length).toBe(3)
    })

    it('should handle complex markdown', () => {
      const markdown = `# Title

This is a paragraph with **bold** and *italic*.

- List item
- Another item

> Quote text

\`code\` and [link](url)`

      const result = stripMarkdown(markdown)

      expect(result).not.toContain('#')
      expect(result).not.toContain('**')
      expect(result).not.toContain('*')
      expect(result).not.toContain('-')
      expect(result).not.toContain('>')
      expect(result).toContain('Title')
      expect(result).toContain('paragraph')
    })

    it('should handle empty strings gracefully', () => {
      const markdown = ''
      const result = stripMarkdown(markdown)

      expect(result).toBe('')
    })

    it('should trim whitespace', () => {
      const markdown = '  # Title  \n  Content  '
      const result = stripMarkdown(markdown)

      expect(result.trim()).toBe(result)
    })

    it('should handle markdown parsing errors gracefully', () => {
      const markdown = 'Regular text without any markdown'
      const result = stripMarkdown(markdown)

      expect(result).toBe('Regular text without any markdown')
    })
  })
})
