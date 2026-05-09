'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storage } from '@/lib/storage';
import { formatDate } from '@/lib/utils';
import type { Lead, SessionRecording } from '@/lib/types';

export default function SessionsPage() {
  const { client } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedSession, setSelectedSession] = useState<{ lead: Lead; session: SessionRecording } | null>(null);

  useEffect(() => { const _run = async () => { if (client) setLeads(await storage.getLeads(client.id)); }; _run(); }, [client]);

  const allSessions = leads.flatMap(l => l.sessionRecordings.map(s => ({ lead: l, session: s }))).sort((a, b) => new Date(b.session.timestamp).getTime() - new Date(a.session.timestamp).getTime());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Session Recordings</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b"><h2 className="font-semibold">Sessions ({allSessions.length})</h2></div>
          <div className="divide-y">
            {allSessions.map(({ lead, session }) => (
              <button key={session.recordingId} onClick={() => setSelectedSession({ lead, session })} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selectedSession?.session.recordingId === session.recordingId ? 'bg-blue-50' : ''}`}>
                <div className="flex justify-between"><span className="font-medium text-sm">{lead.name || lead.phone || 'Anonymous'}</span><span className="text-xs text-gray-400">{formatDate(session.timestamp)}</span></div>
                <div className="text-xs text-gray-500 mt-1">{Math.round(session.duration / 60)}min • {session.events.length} events • {lead.leadStatus === 'converted' ? '✅ Converted' : '❌ Not converted'}</div>
              </button>
            ))}
            {allSessions.length === 0 && <div className="p-8 text-center text-gray-400">No sessions recorded</div>}
          </div>
        </div>

        {/* Session Player */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {selectedSession ? (
            <div className="space-y-4">
              <h2 className="font-semibold">Session Player</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Duration</div><div className="font-medium">{Math.round(selectedSession.session.duration / 60)}min</div></div>
                <div className="p-2 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Events</div><div className="font-medium">{selectedSession.session.events.length}</div></div>
                <div className="p-2 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Status</div><div className="font-medium capitalize">{selectedSession.lead.leadStatus}</div></div>
              </div>
              <div><h3 className="text-sm font-medium mb-2">Event Timeline</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedSession.session.events.map((event, i) => {
                    const icons: Record<string, string> = { pageview: '📄', click: '👆', scroll: '📜', cart_add: '🛒', cart_remove: '❌' };
                    return (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-lg">{icons[event.type] || '•'}</span>
                        <div><div className="font-medium capitalize">{event.type.replace('_', ' ')}</div><div className="text-xs text-gray-400">{Object.entries(event.data).map(([k, v]) => `${k}: ${v}`).join(', ')}</div></div>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">Select a session to view</div>
          )}
        </div>
      </div>
    </div>
  );
}
