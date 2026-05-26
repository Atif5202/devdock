/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  const codeBlockLines: string[] = [];
  let codeBlockLanguage = '';

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let isOrderedList = false;

  let inTable = false;
  let tableRows: string[][] = [];

  const parseInlineStyles = (text: string): React.ReactNode => {
    const parseFormatted = (txt: string): React.ReactNode[] => {
      const result: React.ReactNode[] = [];
      let lastIdx = 0;
      const combinedRegex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|`([^`]+)`/g;
      let match;

      while ((match = combinedRegex.exec(txt)) !== null) {
        if (match.index > lastIdx) {
          result.push(txt.substring(lastIdx, match.index));
        }

        if (match[1]) { // Bold
          result.push(<strong key={match.index} className="font-bold text-gray-900">{match[2]}</strong>);
        } else if (match[3]) { // Italic
          result.push(<em key={match.index} className="italic text-gray-700">{match[4]}</em>);
        } else if (match[5]) { // Inline Code
          result.push(<code key={match.index} className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-xs text-indigo-600">{match[5]}</code>);
        }

        lastIdx = combinedRegex.lastIndex;
      }

      if (lastIdx < txt.length) {
        result.push(txt.substring(lastIdx));
      }

      return result.length > 0 ? result : [txt];
    };

    return <>{parseFormatted(text)}</>;
  };

  const flushList = (key: string | number) => {
    if (listItems.length === 0) return;
    if (isOrderedList) {
      renderedElements.push(
        <ol key={`ol-${key}`} className="list-decimal pl-6 my-3 space-y-1 text-gray-700 font-sans text-sm list-inside">
          {listItems}
        </ol>
      );
    } else {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 my-3 space-y-1 text-gray-700 font-sans text-sm list-inside">
          {listItems}
        </ul>
      );
    }
    listItems = [];
    inList = false;
  };

  const flushTable = (key: string | number) => {
    if (tableRows.length === 0) return;

    const headerRow = tableRows[0];
    let bodyRows = tableRows.slice(1);
    const alignments: ('left' | 'center' | 'right' | '')[] = [];

    // Detect if second row is a Markdown separator row (e.g. |:---|:---:|---:|)
    const hasSeparator = tableRows.length > 1 && tableRows[1].every(cell => /^:?-+:?$/.test(cell.trim()));
    if (hasSeparator) {
      const separatorRow = tableRows[1];
      separatorRow.forEach(cell => {
        const trimmedCell = cell.trim();
        if (trimmedCell.startsWith(':') && trimmedCell.endsWith(':')) {
          alignments.push('center');
        } else if (trimmedCell.endsWith(':')) {
          alignments.push('right');
        } else if (trimmedCell.startsWith(':')) {
          alignments.push('left');
        } else {
          alignments.push('left');
        }
      });
      bodyRows = tableRows.slice(2);
    }

    const getAlignClass = (index: number) => {
      const align = alignments[index];
      if (align === 'center') return 'text-center';
      if (align === 'right') return 'text-right';
      return 'text-left';
    };

    renderedElements.push(
      <div key={`table-wrapper-${key}`} className="overflow-x-auto my-5 rounded-xl border border-gray-200 bg-white select-text">
        <table className="w-full border-collapse text-xs font-sans text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              {headerRow.map((cell, colIndex) => (
                <th 
                  key={`th-${colIndex}`} 
                  className={`px-4 py-3 font-semibold text-gray-900 tracking-wider text-[10px] uppercase border-r border-gray-200 last:border-r-0 ${getAlignClass(colIndex)}`}
                >
                  {parseInlineStyles(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bodyRows.map((row, rowIndex) => (
              <tr 
                key={`tr-${rowIndex}`} 
                className="even:bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {headerRow.map((_, colIndex) => {
                  const cell = row[colIndex] || '';
                  return (
                    <td 
                      key={`td-${rowIndex}-${colIndex}`} 
                      className={`px-4 py-2.5 border-r border-gray-200 last:border-r-0 text-gray-700 ${getAlignClass(colIndex)}`}
                    >
                      {parseInlineStyles(cell)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code block handling
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        renderedElements.push(
          <div key={`code-${i}`} className="my-4 rounded-xl border border-gray-200 bg-gray-100 overflow-hidden font-mono text-xs">
            <div className="bg-gray-100 px-4 py-1.5 border-b border-gray-200 flex justify-between items-center text-gray-500 text-[10px] select-none">
              <span>{codeBlockLanguage || 'code'}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(codeBlockLines.join('\n'));
                }}
                className="text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-indigo-700 leading-relaxed text-left">
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockLines.length = 0;
        codeBlockLanguage = '';
      } else {
        if (inList) flushList(i);
        if (inTable) flushTable(i);
        inCodeBlock = true;
        codeBlockLanguage = line.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Table Row Capturing & Parsing
    const isTable = (): boolean => {
      const trimmed = line.trim();
      if (!trimmed.includes('|')) return false;
      if (trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('```')) return false;
      if (/^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) return false;

      if (inTable) return true;

      const nextLine = lines[i + 1];
      const pipeCount = (trimmed.match(/\|/g) || []).length;
      const isNextSeparator = nextLine && /^[\s|:-]+$/.test(nextLine.trim()) && nextLine.includes('-') && nextLine.includes('|');
      
      return trimmed.startsWith('|') || trimmed.endsWith('|') || pipeCount >= 2 || !!isNextSeparator;
    };

    if (isTable()) {
      if (inList) {
        flushList(i);
      }
      if (!inTable) {
        inTable = true;
      }
      const hasLeadingPipe = line.trim().startsWith('|');
      const hasTrailingPipe = line.trim().endsWith('|');
      const cells = line.split('|').map(s => s.trim());
      if (hasLeadingPipe) {
        cells.shift();
      }
      if (hasTrailingPipe) {
        cells.pop();
      }
      tableRows.push(cells);
      continue;
    } else {
      if (inTable) {
        flushTable(i);
      }
    }

    // 2. List handling
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)/);
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)/);

    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        inList = true;
        isOrderedList = !!orderedMatch;
      }
      const itemContent = unorderedMatch ? unorderedMatch[2] : orderedMatch![2];
      
      const checklistMatch = itemContent.match(/^\[([ xX])\]\s+(.*)/);
      if (checklistMatch) {
        const checked = checklistMatch[1].toLowerCase() === 'x';
        const checkboxText = checklistMatch[2];
        listItems.push(
          <li key={`li-${i}`} className="flex items-center gap-2 text-sm my-1 list-none text-left">
            <input 
              type="checkbox" 
              checked={checked} 
              readOnly 
              className="accent-indigo-500 rounded border-gray-300" 
            />
            <span className={checked ? "line-through text-gray-500 font-sans" : "text-gray-700 font-sans"}>
              {parseInlineStyles(checkboxText)}
            </span>
          </li>
        );
      } else {
        listItems.push(
          <li key={`li-${i}`} className="text-gray-700 text-sm font-sans text-left">
            {parseInlineStyles(itemContent)}
          </li>
        );
      }
      continue;
    } else {
      if (inList) {
        flushList(i);
      }
    }

    // 3. Blockquotes
    if (line.trim().startsWith('>')) {
      const quoteText = line.trim().substring(1).trim();
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-indigo-500 bg-indigo-50 px-4 py-2.5 my-4 text-gray-500 text-sm font-sans italic rounded-r-xl text-left">
          {parseInlineStyles(quoteText)}
        </blockquote>
      );
      continue;
    }

    // 4. Headers
    if (line.trim().startsWith('#')) {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];

        if (level === 1) {
          renderedElements.push(
            <h1 key={`h1-${i}`} className="text-2xl font-bold text-gray-900 font-sans mt-6 mb-3 border-b border-gray-200 pb-2 text-left">
              {parseInlineStyles(headerText)}
            </h1>
          );
        } else if (level === 2) {
          renderedElements.push(
            <h2 key={`h2-${i}`} className="text-xl font-bold text-gray-900 font-sans mt-5 mb-2.5 border-b border-gray-200 pb-1 text-left">
              {parseInlineStyles(headerText)}
            </h2>
          );
        } else if (level === 3) {
          renderedElements.push(
            <h3 key={`h3-${i}`} className="text-md font-bold text-gray-900 font-sans mt-4 mb-2 text-left">
              {parseInlineStyles(headerText)}
            </h3>
          );
        } else {
          renderedElements.push(
            <h4 key={`h4-${i}`} className="text-sm font-bold text-gray-800 font-sans mt-3 mb-1.5 text-left">
              {parseInlineStyles(headerText)}
            </h4>
          );
        }
        continue;
      }
    }

    // Empty lines
    if (line.trim() === '') {
      renderedElements.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Standard paragraph element
    renderedElements.push(
      <p key={`p-${i}`} className="text-gray-700 font-sans leading-relaxed text-sm my-2 text-left">
        {parseInlineStyles(line)}
      </p>
    );
  }

  if (inList) {
    flushList('final');
  }
  if (inTable) {
    flushTable('final');
  }

  return <div className="space-y-1">{renderedElements}</div>;
}
