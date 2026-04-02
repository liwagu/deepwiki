'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Markdown from '@/components/Markdown';

interface SessionMessage {
  role: string;
  content: string;
  timestamp?: number;
}

interface Session {
  id: string;
  slug: string;
  question: string;
  repo_url: string;
  owner: string;
  repo: string;
  provider: string;
  model: string;
  language: string;
  messages: SessionMessage[];
  created_at: number;
}

export default function SearchSessionPage() {
  const params = useParams();
  const slugParts = Array.isArray(params.slug) ? params.slug : [params.slug];
  const slug = slugParts.join('/');

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/sessions/by-slug/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Session not found');
        return res.json();
      })
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex items-center space-x-2 text-[var(--foreground)]/60">
          <div className="animate-pulse flex space-x-1">
            <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
            <div className="h-2 w-2 bg-purple-600 rounded-full"></div>
          </div>
          <span className="text-sm">Loading session…</span>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] gap-4">
        <p className="text-[var(--foreground)]/70 text-sm">Session not found or has expired.</p>
        <Link href="/" className="text-sm text-purple-600 hover:underline">
          ← Back to home
        </Link>
      </div>
    );
  }

  const repoLink = `/${session.owner}/${session.repo}?type=github&repo_url=${encodeURIComponent(session.repo_url)}&provider=${encodeURIComponent(session.provider)}&model=${encodeURIComponent(session.model)}&language=${session.language}`;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[var(--foreground)]/50 hover:text-[var(--foreground)] text-sm">
            DeepWiki
          </Link>
          <span className="text-[var(--foreground)]/30">/</span>
          <Link href={repoLink} className="text-sm text-purple-600 hover:underline font-medium">
            {session.owner}/{session.repo}
          </Link>
        </div>
        <span className="text-xs text-[var(--foreground)]/40">
          {session.provider}/{session.model}
        </span>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Original question */}
        <div>
          <h1 className="text-xl font-semibold leading-snug mb-1">{session.question}</h1>
          <p className="text-xs text-[var(--foreground)]/40">
            {new Date(session.created_at).toLocaleString()} · via{' '}
            <Link href={repoLink} className="hover:underline text-purple-600">
              {session.owner}/{session.repo}
            </Link>
          </p>
        </div>

        {/* Messages */}
        {session.messages.length > 0 ? (
          <div className="space-y-6">
            {session.messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'pl-0' : 'pl-0'}>
                <div className={`text-xs font-semibold mb-1 uppercase tracking-wider ${
                  msg.role === 'user'
                    ? 'text-purple-600'
                    : 'text-[var(--foreground)]/50'
                }`}>
                  {msg.role === 'user' ? 'You' : 'DeepWiki'}
                </div>
                <div className={`rounded-lg px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40'
                    : 'bg-[var(--background)] border border-[var(--border-color)]'
                }`}>
                  {msg.role === 'assistant' ? (
                    <Markdown content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--foreground)]/50 italic">
            No messages recorded in this session yet.
          </p>
        )}

        {/* CTA */}
        <div className="pt-6 border-t border-[var(--border-color)]">
          <Link
            href={repoLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Continue this conversation
          </Link>
        </div>
      </div>
    </div>
  );
}
