/**
 * Help Window Styles
 * Dark theme CSS for help popup windows
 */

export const HELP_WINDOW_STYLES = `
  body {
    background: #1a1a1a;
    color: #e5e5e5;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    padding: 32px;
    margin: 0;
    line-height: 1.6;
    font-size: 14px;
  }

  h1 {
    color: #ffffff;
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  h2 {
    color: #e5e5e5;
    font-size: 18px;
    font-weight: 600;
    margin: 24px 0 12px 0;
  }

  h3 {
    color: #d4d4d4;
    font-size: 16px;
    font-weight: 500;
    margin: 16px 0 8px 0;
  }

  p {
    margin: 0 0 12px 0;
    color: #d4d4d4;
  }

  ul, ol {
    margin: 0 0 12px 0;
    padding-left: 24px;
  }

  li {
    margin: 4px 0;
    color: #d4d4d4;
  }

  code {
    background: #2d2d2d;
    color: #60a5fa;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 13px;
  }

  pre {
    background: #2d2d2d;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
  }

  pre code {
    background: none;
    padding: 0;
  }

  .example {
    background: #262626;
    border-left: 3px solid #3b82f6;
    padding: 12px 16px;
    margin: 12px 0;
    border-radius: 4px;
  }

  .example-label {
    color: #3b82f6;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .related-topics {
    background: #262626;
    padding: 16px;
    border-radius: 6px;
    margin-top: 24px;
  }

  .related-topics h3 {
    margin-top: 0;
  }

  a {
    color: #60a5fa;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
`
