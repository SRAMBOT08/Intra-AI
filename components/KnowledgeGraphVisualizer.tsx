'use client';

import React, { useEffect, useState } from 'react';
import { Database, Network, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { GraphVisualizationData } from '@/types/echosphere';
import { getGraphVisualization } from '@/lib/m1-client';

interface KnowledgeGraphVisualizerProps {
  candidateId?: string;
}

export function KnowledgeGraphVisualizer({
  candidateId = 'CAND-505',
}: KnowledgeGraphVisualizerProps) {
  const [data, setData] = useState<GraphVisualizationData>({ nodes: [], links: [] });
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadGraph() {
      try {
        const result = await getGraphVisualization(candidateId);
        if (isMounted && result?.nodes) {
          setData(result);
        }
      } catch (e) {
        // Safe visualizer fallback
      }
    }
    loadGraph();
    const interval = setInterval(loadGraph, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [candidateId]);

  const filteredNodes =
    filter === 'ALL'
      ? data.nodes
      : data.nodes.filter((n) => n.type.toUpperCase() === filter);

  const getNodeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CANDIDATE':
        return 'bg-deep-indigo text-pure-white border-deep-indigo';
      case 'TECHNOLOGY':
      case 'TECH':
        return 'bg-electric-blue/15 text-deep-indigo border-electric-blue/40';
      case 'CONCEPT':
        return 'bg-teal-accent/20 text-teal-accent-dark border-teal-accent/50';
      case 'PROJECT':
      case 'EXPERIENCE':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'EVIDENCE':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'COMPETENCY':
        return 'bg-yellow-accent/25 text-deep-indigo border-yellow-accent';
      default:
        return 'bg-light-surface text-deep-indigo border-pale-indigo';
    }
  };

  return (
    <div className="rounded-[20px] border border-pale-indigo/40 bg-pure-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-pale-indigo/30 pb-2.5">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-electric-blue" />
          <span className="text-xs font-semibold text-deep-indigo uppercase tracking-wider">
            Candidate Knowledge Graph (Neo4j V1)
          </span>
        </div>
        <span className="rounded-full bg-light-surface px-2 py-0.5 text-[10px] font-mono text-muted-indigo">
          {data.nodes.length} Nodes • {data.links.length} Edges
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-1.5 text-[10px]">
        {['ALL', 'CANDIDATE', 'TECHNOLOGY', 'CONCEPT', 'PROJECT', 'EVIDENCE'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-full px-2.5 py-0.5 font-medium transition-all ${
              filter === type
                ? 'bg-deep-indigo text-pure-white shadow-xs'
                : 'bg-light-surface text-muted-indigo hover:bg-pale-indigo/20'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Node Cloud / Graph Entity Cards */}
      <div className="max-h-48 overflow-y-auto rounded-[12px] bg-light-surface/40 p-2.5 space-y-1.5">
        {filteredNodes.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-indigo">
            Knowledge graph synchronizing...
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-2xs ${getNodeColor(
                  node.type
                )}`}
              >
                <span className="text-[9px] uppercase opacity-70">[{node.type}]</span>
                <span>{node.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provenance note */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-indigo pt-1">
        <ShieldCheck className="h-3 w-3 text-emerald-600" />
        <span>Strict Provenance: Every graph fact is grounded in candidate utterance or CV.</span>
      </div>
    </div>
  );
}
