
import React from 'react';

const MarkdownPreview = ({ content, onWikiLinkClick }) => {
  const renderContent = () => {
    if (!content) {
      return (
        <p className="text-slate-400 dark:text-slate-500 italic">
          Start writing to see preview...
        </p>
      );
    }

    // Simple markdown parser
    let html = content;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-serif font-bold text-slate-800 dark:text-cream-50 mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-serif font-bold text-slate-800 dark:text-cream-50 mt-8 mb-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-serif font-bold text-slate-800 dark:text-cream-50 mt-10 mb-5">$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-cream-100">$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');

    // WikiLinks
    html = html.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      return `<button class="wikilink text-blue-600 dark:text-blue-400 hover:underline font-medium" data-link="${title}">${title}</button>`;
    });

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">');
    html = html.replace(/\n/g, '<br />');

    // Wrap in paragraph
    html = '<p class="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">' + html + '</p>';

    return html;
  };

  const handleClick = (e) => {
    if (e.target.classList.contains('wikilink')) {
      const linkedTitle = e.target.getAttribute('data-link');
      if (onWikiLinkClick) {
        onWikiLinkClick(linkedTitle);
      }
    }
  };

  return (
    <div
      className="prose prose-slate dark:prose-invert max-w-none"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: renderContent() }}
    />
  );
};

export default MarkdownPreview;
