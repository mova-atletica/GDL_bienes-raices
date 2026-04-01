import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/projectStore';
import { assistantApi } from '../../api/assistant';
import ChatMessage from './ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPanel() {
  const { t, i18n } = useTranslation();
  const { id: projectId } = useParams();
  const { assistantOpen, assistantContext, toggleAssistant } = useProjectStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !projectId || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const result = await assistantApi.chat(projectId, {
        message: userMessage,
        context: assistantContext,
        language: i18n.language,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('assistant.error') }]);
    } finally {
      setLoading(false);
    }
  };

  if (!assistantOpen) return null;

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">{t('assistant.title')}</h2>
        <button onClick={toggleAssistant} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            {t('assistant.welcome')}
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="text-sm text-gray-500 italic">{t('assistant.thinking')}</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        {!projectId ? (
          <p className="text-sm text-gray-500 text-center">
            {i18n.language === 'es' ? 'Abre un proyecto para usar el asistente' : 'Open a project to use the assistant'}
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('assistant.placeholder')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
