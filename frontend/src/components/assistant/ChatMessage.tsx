import clsx from 'clsx';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: Props) {
  return (
    <div className={clsx('flex', role === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={clsx(
          'max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap',
          role === 'user'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-900',
        )}
      >
        {content}
      </div>
    </div>
  );
}
