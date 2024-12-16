/**
 * SSML (Speech Synthesis Markup Language) is a subset of XML specifically
 * designed for controlling synthesis. You can see examples of how the SSML
 * should be parsed in `ssml.test.ts`.
 *
 * DO NOT USE CHATGPT, COPILOT, OR ANY AI CODING ASSISTANTS.
 * Conventional auto-complete and Intellisense are allowed.
 *
 * DO NOT USE ANY PRE-EXISTING XML PARSERS FOR THIS TASK.
 * You may use online references to understand the SSML specification, but DO NOT read
 * online references for implementing an XML/SSML parser.
 */

/** Parses SSML to a SSMLNode, throwing on invalid SSML */
export function parseSSML(ssml: string): SSMLNode {
  try {
    const rootNode: SSMLNode = { name: 'root', attributes: [], children: [] }
    const stack: Array<SSMLNode> = [rootNode]
    let position = 0

    while (position < ssml.length) {
      if (ssml[position] === '<') {
        // Possibly an opening/closing tag
        if (ssml[position + 1] === '/') {
          const closingTagIndex = ssml.indexOf('>', position + 2)
          stack.pop()
          position = closingTagIndex + 1
        } else {
          const startingTagIndex = position + 1
          const endingTagIndex = ssml.indexOf('>', startingTagIndex)
          const spaceIndex = ssml.indexOf(' ', startingTagIndex)
          const tagEnd =
            spaceIndex > -1 && spaceIndex < endingTagIndex ? spaceIndex : endingTagIndex
          const tag = ssml.substring(startingTagIndex, tagEnd)
          const node: SSMLNode = { name: tag, attributes: [], children: [] }

          // Add the attributes
          if (spaceIndex > -1 && spaceIndex < endingTagIndex) {
            const attributeString = ssml.substring(spaceIndex + 1, endingTagIndex)
            node.attributes = parseAttributes(unescapeXMLChars(attributeString))
          }

          ;(stack[stack.length - 1] as SSMLTag).children.push(node)
          stack.push(node)

          if (ssml[endingTagIndex - 1] === '/') {
            // Self-closing tag
            stack.pop()
          }

          position = endingTagIndex + 1
        }
      } else {
        const textStart = position
        const textEnd = ssml.indexOf('<', position)
        const text = ssml.substring(textStart, textEnd === -1 ? ssml.length : textEnd).trim()
        if (text) {
          ;(stack[stack.length - 1] as SSMLTag).children.push(unescapeXMLChars(text))
        }
        position = textEnd === -1 ? ssml.length : textEnd
      }
    }

    // NOTE: Don't forget to run unescapeXMLChars on the SSMLText
    return rootNode
  } catch (error) {
    throw new Error('Invalid SSML input')
  }
}

/** Recursively converts SSML node to string and unescapes XML chars */
export function ssmlNodeToText(node: SSMLNode): string {
  return ''
}

const parseAttributes = (attributeString: string): SSMLAttribute[] => {
  const attributes: SSMLAttribute[] = []
  const attRegex = /(\w+)\s*=\s*(['"])(.*?)\2/g
  let match
  while ((match = attRegex.exec(attributeString)) !== null) {
    attributes.push({ name: match[1], value: match[3] })
  }
  return attributes
}

// Already done for you
const unescapeXMLChars = (text: string) =>
  text.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&')

type SSMLNode = SSMLTag | SSMLText
type SSMLTag = {
  name: string
  attributes: SSMLAttribute[]
  children: SSMLNode[]
}
type SSMLText = string
type SSMLAttribute = { name: string; value: string }
