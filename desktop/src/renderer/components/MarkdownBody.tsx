import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from '../stores/toast';

interface Props {
  children: string;
  className?: string;
}

/** Markdown body shared by NoteView and the Capture detail panel.
 *
 * The custom `a` component routes external links through the Electron main
 * process so http(s) URLs open in the user's browser instead of trying to
 * navigate the renderer window (which Electron silently blocks).
 */
export function MarkdownBody({ children, className }: Props) {
  return (
    <article className={`gb-prose ${className ?? ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...rest }) => {
            const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault();
              if (!href) return;
              const result = await window.gb.shell.openExternal(href);
              if (!result.ok) toast.error(result.error);
            };
            return (
              <a {...rest} href={href} onClick={onClick}>
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </article>
  );
}
