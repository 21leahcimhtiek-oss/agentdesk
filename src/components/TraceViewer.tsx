'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { formatLatency } from '@/lib/utils';
import type { ToolCall } from '@/types';

interface Props {
  toolCalls: ToolCall[];
}

function ToolCallItem({ call, index }: { call: ToolCall; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasError = !!call.error;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-xs text-gray-400 font-mono w-5">{index + 1}</span>
        {hasError ? <XCircle className="h-4 w-4 text-red-500 shrink-0" /> : <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />}
        <span className="font-mono text-sm font-medium text-gray-900 flex-1">{call.name}</span>
        {call.latency_ms != null && (
          <span className="text-xs text-gray-400 mr-2">{formatLatency(call.latency_ms)}</span>
        )}
        {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 py-3 space-y-3 border-t border-gray-200">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Input</div>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 text-gray-700">{JSON.stringify(call.input, null, 2)}</pre>
          </div>
          {call.output !== undefined && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Output</div>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40 text-gray-700">{JSON.stringify(call.output, null, 2)}</pre>
            </div>
          )}
          {call.error && (
            <div>
              <div className="text-xs font-semibold text-red-500 uppercase mb-1">Error</div>
              <pre className="text-xs bg-red-50 p-3 rounded text-red-700">{call.error}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TraceViewer({ toolCalls }: Props) {
  if (!toolCalls || toolCalls.length === 0) {
    return <p className="text-sm text-gray-500">No tool calls recorded</p>;
  }

  return (
    <div className="space-y-2">
      {toolCalls.map((call, i) => (
        <ToolCallItem key={i} call={call} index={i} />
      ))}
    </div>
  );
}