'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Mic,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Download,
  Share2,
  Plus,
  TrendingUp,
  ShieldCheck,
  Edit3,
  X,
  ExternalLink,
  Calendar,
  MoreVertical,
  Check,
  Send,
  UserCheck,
  Award,
  Archive,
  Copy,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { ScorecardModifierModal } from '@/components/ScorecardModifierModal';
import { InviteCandidateModal } from '@/components/InviteCandidateModal';
import { CandidateItem, INITIAL_CANDIDATE_DATA } from '@/lib/recruiter-data';

export default function RecruiterPortalPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>(INITIAL_CANDIDATE_DATA);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [activeCandidateSubTab, setActiveCandidateSubTab] = useState<
    'evaluation' | 'ats' | 'followups' | 'integrity'
  >('evaluation');

  // Modals
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'INVITED' | 'COMPLETED' | 'SHORTLISTED'>('ALL');
  const [roleFilter, setRoleFilter] = useState('All');

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCandidateId, setCopiedCandidateId] = useState<string | null>(null);

  // Load candidates from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('intra_recruiter_candidates');
      if (saved) {
        setCandidates(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not load candidates from storage', e);
    }
  }, []);

  // Save candidates on change
  const persistCandidates = (updatedList: CandidateItem[]) => {
    setCandidates(updatedList);
    try {
      localStorage.setItem('intra_recruiter_candidates', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Could not persist candidates', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Candidate handler from Modal
  const handleCandidateAdded = (newCand: CandidateItem) => {
    const updated = [newCand, ...candidates];
    persistCandidates(updated);
    showToast(`Invitation sent to ${newCand.name}. Added to active pipeline.`);
  };

  // Shortlist toggle
  const handleToggleShortlist = (candidateId: string) => {
    const updated = candidates.map((c) => {
      if (c.id === candidateId) {
        const newStatus = c.status === 'SHORTLISTED' ? 'COMPLETED' : 'SHORTLISTED';
        showToast(
          newStatus === 'SHORTLISTED'
            ? `${c.name} shortlisted for Onsite final round!`
            : `${c.name} moved back to completed review.`
        );
        return { ...c, status: newStatus as any };
      }
      return c;
    });
    persistCandidates(updated);
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate((prev) =>
        prev ? { ...prev, status: prev.status === 'SHORTLISTED' ? 'COMPLETED' : 'SHORTLISTED' } : null
      );
    }
  };

  // Archive / Reject candidate
  const handleArchiveCandidate = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId);
    const updated = candidates.filter((c) => c.id !== candidateId);
    persistCandidates(updated);
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(null);
    }
    showToast(`Archived application for ${candidate?.name || 'candidate'}.`);
  };

  // Score calibration override
  const handleSaveModifiedScore = (newScore: number, reason: string) => {
    if (!selectedCandidate) return;
    const updated = candidates.map((c) => {
      if (c.id === selectedCandidate.id) {
        const updatedQuestions = [...c.questions];
        if (updatedQuestions[selectedQuestionIndex]) {
          updatedQuestions[selectedQuestionIndex] = {
            ...updatedQuestions[selectedQuestionIndex],
            score: newScore,
            aiReasoning: `${updatedQuestions[selectedQuestionIndex].aiReasoning} [Calibrated by Recruiter: Adjusted to ${newScore.toFixed(1)}/4.0. Note: ${reason}]`,
          };
        }
        return {
          ...c,
          aiVoiceScore: newScore,
          recruiterNotes: reason || c.recruiterNotes,
          questions: updatedQuestions,
        };
      }
      return c;
    });
    persistCandidates(updated);
    setSelectedCandidate((prev) => (prev ? { ...prev, aiVoiceScore: newScore } : null));
    showToast(`Score calibrated to ${newScore.toFixed(1)}/4.0 with your feedback note.`);
  };

  // Copy candidate interview link
  const handleCopyLink = (candidateId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/candidate/interview/${candidateId}`;
    navigator.clipboard.writeText(url);
    setCopiedCandidateId(candidateId);
    setTimeout(() => setCopiedCandidateId(null), 2500);
    showToast('Interview access link copied to clipboard.');
  };

  // Reset to sample data
  const handleResetSampleData = () => {
    persistCandidates(INITIAL_CANDIDATE_DATA);
    setSelectedCandidate(null);
    showToast('Reset pipeline to default candidate dataset.');
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'INVITED'
        ? c.status === 'INVITED'
        : statusFilter === 'COMPLETED'
        ? c.status === 'COMPLETED'
        : c.status === 'SHORTLISTED';

    const matchesRole = roleFilter === 'All' || c.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate live pipeline metrics
  const completedCount = candidates.filter((c) => c.status === 'COMPLETED' || c.status === 'SHORTLISTED').length;
  const invitedCount = candidates.filter((c) => c.status === 'INVITED').length;
  const shortlistedCount = candidates.filter((c) => c.status === 'SHORTLISTED').length;
  const avgAtsMatch = Math.round(
    candidates.reduce((acc, curr) => acc + curr.atsMatchScore, 0) / (candidates.length || 1)
  );

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-slate-800 font-sora">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between hidden md:flex">
        <div className="p-5 space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-brand text-white font-serif font-bold text-lg shadow-xs">
              i
            </span>
            <div>
              <div className="text-base font-bold text-slate-900 tracking-tight flex items-baseline">
                <span>intra</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-brand ml-0.5" />
              </div>
              <div className="text-[10px] text-slate-400 font-normal">Recruiter Portal</div>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setSelectedCandidate(null)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${
                !selectedCandidate
                  ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-emerald-600" />
              <span>Pipeline & Candidates</span>
              <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">
                {candidates.length}
              </span>
            </button>

            <div className="pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3.5">
              Actions
            </div>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100 transition-colors text-left font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4 text-emerald-600" />
              <span>+ Invite Candidate</span>
            </button>

            <Link
              href="/recruiter/interviews/new"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>Configure Role Rubrics</span>
            </Link>

            <div className="pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3.5">
              Candidate Testing
            </div>

            <Link
              href="/candidate/interview/INT-101"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Mic className="h-4 w-4 text-emerald-600" />
              <span>Test Candidate Voice Room &rarr;</span>
            </Link>

            <Link
              href="/latest"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Share2 className="h-4 w-4 text-slate-400" />
              <span>View Automated Demo</span>
            </Link>
          </nav>
        </div>

        {/* Recruiter Profile Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-forest-900 text-white font-bold text-xs flex items-center justify-center">
              EG
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-slate-800">Erica Gjervold</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                Lead Talent Partner
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetSampleData}
            title="Reset to sample data"
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* MAIN BODY AREA */}
      <main className="flex-1 overflow-y-auto">
        {/* Floating Toast Alert */}
        {toastMessage && (
          <div className="sticky top-0 z-30 bg-emerald-800 text-white text-xs py-2 px-6 text-center font-medium shadow-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-2 duration-150">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-serif font-bold text-slate-900">
              {selectedCandidate ? (
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="hover:underline flex items-center gap-2 text-left cursor-pointer"
                >
                  <span className="text-slate-400 font-normal">&larr; Candidate Pipeline /</span>
                  <span>{selectedCandidate.name}</span>
                </button>
              ) : (
                'Recruiting Pipeline Dashboard'
              )}
            </h1>

            {selectedCandidate && (
              <span
                className={`rounded-full text-xs font-bold px-3 py-0.5 border ${
                  selectedCandidate.status === 'SHORTLISTED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : selectedCandidate.status === 'COMPLETED'
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {selectedCandidate.status === 'SHORTLISTED'
                  ? '✓ Shortlisted for Final Round'
                  : selectedCandidate.status === 'COMPLETED'
                  ? 'Ready for Review'
                  : '48h Window Active'}
              </span>
            )}
          </div>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-brand hover:bg-emerald-hover text-white px-4 py-2 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Invite Candidate</span>
            </button>
          </div>
        </header>

        {/* SCREEN A: PIPELINE OVERVIEW (When no candidate drawer is open) */}
        {!selectedCandidate && (
          <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-150">
            {/* 4 Real Metric Cards for HR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active in 48h Window
                </div>
                <div className="text-3xl font-serif font-bold text-amber-800">{invitedCount}</div>
                <p className="text-[11px] text-slate-500">Invitations sent, pending interview</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Completed Voice Screens
                </div>
                <div className="text-3xl font-serif font-bold text-slate-900">{completedCount}</div>
                <p className="text-[11px] text-slate-500">Evaluated with audio & 1-4 rubrics</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Shortlisted for Final Round
                </div>
                <div className="text-3xl font-serif font-bold text-emerald-700">{shortlistedCount}</div>
                <p className="text-[11px] text-slate-500">Advanced to hiring manager onsite</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Average ATS Match
                </div>
                <div className="text-3xl font-serif font-bold text-blue-700">{avgAtsMatch}%</div>
                <p className="text-[11px] text-slate-500">Pre-qualification threshold rate</p>
              </div>
            </div>

            {/* Pipeline Stage Tabs & Search Filter */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Stage Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl text-xs font-semibold">
                  {[
                    { key: 'ALL', label: 'All Applicants', count: candidates.length },
                    { key: 'SHORTLISTED', label: 'Shortlisted', count: shortlistedCount },
                    { key: 'COMPLETED', label: 'Ready for Review', count: completedCount },
                    { key: 'INVITED', label: 'Awaiting Candidate', count: invitedCount },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setStatusFilter(tab.key as any)}
                      className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === tab.key
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Bar & Role Filter */}
                <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by candidate, skill, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-800 outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 shadow-2xs"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-hidden shadow-2xs"
                  >
                    <option value="All">All Roles</option>
                    <option value="Senior Distributed Systems Engineer">Distributed Systems</option>
                    <option value="Senior Product Marketing Manager">Product Marketing</option>
                    <option value="Enterprise Account Executive">Account Executive</option>
                    <option value="Staff Infrastructure Lead">Infrastructure Lead</option>
                  </select>
                </div>
              </div>

              {/* Real Candidates Table */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Candidate</th>
                      <th className="py-3 px-4 font-semibold">Source</th>
                      <th className="py-3 px-4 font-semibold">ATS Match</th>
                      <th className="py-3 px-4 font-semibold">Voice AI Score</th>
                      <th className="py-3 px-4 font-semibold">Status / Deadline</th>
                      <th className="py-3 px-4 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                          No candidates matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((cand) => (
                        <tr
                          key={cand.id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          {/* Candidate Name & Role */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 text-sm">{cand.name}</div>
                            <div className="text-[11px] text-slate-400">{cand.role}</div>
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-semibold border border-slate-200">
                              {cand.source}
                            </span>
                          </td>

                          {/* ATS Match */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-800 text-xs">
                                {cand.atsMatchScore}%
                              </span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${cand.atsMatchScore}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Voice AI Score */}
                          <td className="py-3.5 px-4">
                            {cand.aiVoiceScore !== null ? (
                              <span
                                className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full border text-xs ${
                                  cand.aiVoiceScore >= 4
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : cand.aiVoiceScore >= 3.5
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}
                              >
                                {cand.aiVoiceScore.toFixed(1)} / 4.0
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                                In 48h Window
                              </span>
                            )}
                          </td>

                          {/* Status & Deadline */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                                  cand.status === 'SHORTLISTED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : cand.status === 'COMPLETED'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    cand.status === 'SHORTLISTED'
                                      ? 'bg-emerald-500'
                                      : cand.status === 'COMPLETED'
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                <span>{cand.status}</span>
                              </span>

                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{cand.status === 'INVITED' ? 'Window active (48h)' : 'Submitted'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Quick Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Copy Link button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyLink(cand.id);
                                }}
                                title="Copy Candidate Magic Link"
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                {copiedCandidateId === cand.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Shortlist button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleShortlist(cand.id);
                                }}
                                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                                  cand.status === 'SHORTLISTED'
                                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                                    : 'border border-slate-300 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'
                                }`}
                              >
                                {cand.status === 'SHORTLISTED' ? '✓ Shortlisted' : 'Shortlist'}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCandidate(cand);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN B: CANDIDATE COMPREHENSIVE DOSSIER (When clicking on any candidate) */}
        {selectedCandidate && (
          <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
            {/* Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-serif font-bold text-slate-900">
                      {selectedCandidate.name}
                    </h2>
                    <span
                      className={`rounded-full text-xs font-bold px-3 py-0.5 border ${
                        selectedCandidate.status === 'SHORTLISTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : selectedCandidate.status === 'COMPLETED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedCandidate.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    Role: <strong className="text-slate-700">{selectedCandidate.role}</strong> &bull; Source:{' '}
                    <span className="font-semibold text-slate-700">{selectedCandidate.source}</span> &bull;{' '}
                    {selectedCandidate.email}
                  </p>
                </div>

                {/* Primary HR Action Bar */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleToggleShortlist(selectedCandidate.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      selectedCandidate.status === 'SHORTLISTED'
                        ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                        : 'bg-forest-900 hover:bg-forest-800 text-white shadow-xs'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>
                      {selectedCandidate.status === 'SHORTLISTED'
                        ? 'Shortlisted (Click to Revoke)'
                        : 'Shortlist Candidate'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestionIndex(0);
                      setIsModifierModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Calibrate Score</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(selectedCandidate.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedCandidateId === selectedCandidate.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>Copy Magic Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleArchiveCandidate(selectedCandidate.id)}
                    className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                    title="Archive Candidate"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    ATS Skill Match
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-800">
                    {selectedCandidate.atsMatchScore}%
                  </div>
                  <p className="text-[11px] text-slate-500">Requirements qualification score</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Voice AI Score
                  </div>
                  <div className="text-2xl font-serif font-bold text-slate-900">
                    {selectedCandidate.aiVoiceScore !== null ? (
                      <>
                        {selectedCandidate.aiVoiceScore.toFixed(1)}{' '}
                        <span className="text-sm font-sans text-slate-400">/ 4.0</span>
                      </>
                    ) : (
                      <span className="text-sm font-sans text-amber-700 font-semibold">Pending Interview</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selectedCandidate.aiVoiceScore !== null && selectedCandidate.aiVoiceScore >= 4
                      ? 'Excellent Mastery'
                      : selectedCandidate.aiVoiceScore !== null
                      ? 'Solid Fit'
                      : 'Candidate has 48h active window'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Anti-Cheat & Biometrics
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-base pt-1">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span>Verified ({selectedCandidate.integrity.voiceprintMatch}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selectedCandidate.integrity.browserFocusLostCount} tab switch events
                  </p>
                </div>
              </div>

              {/* Recruiter Notes if any */}
              {selectedCandidate.recruiterNotes && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Recruiter Note:</span>
                  </div>
                  <p className="leading-relaxed">{selectedCandidate.recruiterNotes}</p>
                </div>
              )}
            </div>

            {/* Dossier Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCandidateSubTab('evaluation')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeCandidateSubTab === 'evaluation'
                    ? 'bg-forest-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Voice AI Interview Questions ({selectedCandidate.questions.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCandidateSubTab('ats')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeCandidateSubTab === 'ats'
                    ? 'bg-forest-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resume & ATS Skill Qualification
              </button>

              <button
                type="button"
                onClick={() => setActiveCandidateSubTab('followups')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeCandidateSubTab === 'followups'
                    ? 'bg-forest-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Recommended Onsite Questions ({selectedCandidate.followUps.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveCandidateSubTab('integrity')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeCandidateSubTab === 'integrity'
                    ? 'bg-forest-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Anti-Cheat Telemetry
              </button>
            </div>

            {/* TAB 1: Voice AI Interview Questions */}
            {activeCandidateSubTab === 'evaluation' && (
              <div className="space-y-4">
                {selectedCandidate.questions.length === 0 ? (
                  <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center space-y-3">
                    <Clock className="h-8 w-8 text-amber-600 mx-auto" />
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      Interview In Progress
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Candidate has not started their voice session yet. Their invitation was delivered with an active 48-hour completion window.
                    </p>
                    <div className="pt-2">
                      <a
                        href={`/candidate/interview/${selectedCandidate.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-forest-900 text-white px-5 py-2 text-xs font-semibold"
                      >
                        <span>Launch Candidate Screen to Simulate</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  selectedCandidate.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-4 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0">
                            Q{idx + 1}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                            {q.question}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="rounded-full bg-emerald-50 text-emerald-800 px-3 py-0.5 text-xs font-bold border border-emerald-200">
                            {q.score.toFixed(1)} / 4.0
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuestionIndex(idx);
                              setIsModifierModalOpen(true);
                            }}
                            className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                          >
                            ✎ Calibrate
                          </button>
                        </div>
                      </div>

                      {/* Evidence & Quote */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Extracted Behavioral Evidence
                          </div>
                          <ul className="space-y-2 text-xs text-slate-700">
                            {q.evidence.map((ev, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold mt-0.5">&bull;</span>
                                <span>{ev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-2xl bg-slate-50/80 p-4 border border-slate-100 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Candidate Spoken Response
                          </div>
                          <p className="text-xs italic text-slate-700 font-mono leading-relaxed">
                            &ldquo;{q.spokenQuote}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* AI Evaluation */}
                      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Intra AI Rubric Reasoning
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{q.aiReasoning}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: Resume & ATS Skill Qualification */}
            {activeCandidateSubTab === 'ats' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Candidate Resume & Skill Ingestion
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ingested CV knowledge extracted to compare against role criteria
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Parsed Experience Summary
                  </div>
                  <p className="text-xs text-slate-700 font-mono leading-relaxed">
                    {selectedCandidate.cvSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Matched Skills */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Verified Competencies ({selectedCandidate.matchedSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.matchedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      <span>Unverified / Missing Prerequisites ({selectedCandidate.missingSkills.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.missingSkills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-xl bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 text-xs font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Recommended Onsite Questions */}
            {activeCandidateSubTab === 'followups' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-4 shadow-2xs">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-serif font-bold text-slate-900">
                    Suggested Hiring Manager Questions for Onsite
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generated by Voice AI based on edge cases or gaps observed in the initial screen
                  </p>
                </div>

                {selectedCandidate.followUps.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No follow-up questions generated yet.</p>
                ) : (
                  <ul className="space-y-3 text-xs text-slate-700">
                    {selectedCandidate.followUps.map((fu, i) => (
                      <li
                        key={i}
                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-start gap-3"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{fu}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* TAB 4: Anti-Cheat Telemetry */}
            {activeCandidateSubTab === 'integrity' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-2xs">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      Anti-Cheat & Audio Biometrics Telemetry
                    </h3>
                    <p className="text-xs text-slate-500">
                      Continuously evaluated during live Agora RTC voice session
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Voiceprint Match</span>
                    <div className="text-xl font-serif font-bold text-emerald-800">
                      {selectedCandidate.integrity.voiceprintMatch}%
                    </div>
                    <p className="text-slate-500 text-[11px]">Single continuous speaker verified</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Browser Window Focus</span>
                    <div className="text-xl font-serif font-bold text-slate-900">
                      {selectedCandidate.integrity.browserFocusLostCount} unfocus events
                    </div>
                    <p className="text-slate-500 text-[11px]">Zero tab switches or background searches</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Average Response Latency</span>
                    <div className="text-xl font-serif font-bold text-slate-900">
                      {selectedCandidate.integrity.averageResponseLatencySec}s
                    </div>
                    <p className="text-slate-500 text-[11px]">Natural conversational turnaround</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: Invite Candidate Modal */}
      <InviteCandidateModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onCandidateAdded={handleCandidateAdded}
      />

      {/* MODAL 2: Scorecard Modifier Modal */}
      {selectedCandidate && (
        <ScorecardModifierModal
          isOpen={isModifierModalOpen}
          onClose={() => setIsModifierModalOpen(false)}
          candidateName={selectedCandidate.name}
          questionTitle={
            selectedCandidate.questions[selectedQuestionIndex]?.question ||
            'Core Competency Evaluation'
          }
          currentScore={selectedCandidate.aiVoiceScore || 3.0}
          candidateAnswerText={
            selectedCandidate.questions[selectedQuestionIndex]?.spokenQuote ||
            'Candidate discussed architecture and operational trade-offs.'
          }
          initialReasoning={
            selectedCandidate.questions[selectedQuestionIndex]?.aiReasoning ||
            'Candidate demonstrated solid technical grounding with good articulation.'
          }
          onSave={handleSaveModifiedScore}
        />
      )}
    </div>
  );
}
