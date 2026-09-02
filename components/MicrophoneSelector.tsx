'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Check } from 'lucide-react';

interface MicrophoneSelectorProps {
  selectedDeviceId?: string;
  onDeviceSelect: (deviceId: string) => void;
}

export function MicrophoneSelector({
  selectedDeviceId,
  onDeviceSelect,
}: MicrophoneSelectorProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadAudioDevices() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter((d) => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedDeviceId) {
          onDeviceSelect(audioInputs[0].deviceId);
        }
      } catch (err) {
        console.warn('Could not enumerate audio devices:', err);
      }
    }
    loadAudioDevices();
  }, [selectedDeviceId, onDeviceSelect]);

  const currentDevice = devices.find((d) => d.deviceId === selectedDeviceId);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700/80 focus:outline-none"
      >
        <Mic className="h-3.5 w-3.5 text-cyan-400" />
        <span className="max-w-[140px] truncate">
          {currentDevice?.label || 'Default Microphone'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-64 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl z-50">
          <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
            Select Microphone
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {devices.map((device, index) => (
              <button
                key={device.deviceId || index}
                onClick={() => {
                  onDeviceSelect(device.deviceId);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${
                  selectedDeviceId === device.deviceId
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="truncate">{device.label || `Microphone ${index + 1}`}</span>
                {selectedDeviceId === device.deviceId && (
                  <Check className="h-3.5 w-3.5 text-cyan-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
