import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import AssistantPanel from '../assistant/AssistantPanel';

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
      <AssistantPanel />
    </div>
  );
}
