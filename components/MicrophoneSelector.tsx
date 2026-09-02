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
        className="inline-flex items-center gap-2 rounded-full border border-pale-indigo/50 bg-pure-white px-4 py-2 text-xs font-medium text-deep-indigo hover:border-deep-indigo/40 shadow-sm transition-all focus:outline-none"
      >
        <Mic className="h-3.5 w-3.5 text-deep-indigo" />
        <span className="max-w-[140px] truncate">
          {currentDevice?.label || 'Default Microphone'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-72 rounded-[20px] border border-pale-indigo/50 bg-pure-white p-2 shadow-card-elevated z-50">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-tight text-muted-indigo">
            Select Microphone
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {devices.map((device, index) => (
              <button
                key={device.deviceId || index}
                onClick={() => {
                  onDeviceSelect(device.deviceId);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-full px-3.5 py-2 text-left text-xs font-medium transition-colors ${
                  selectedDeviceId === device.deviceId
                    ? 'bg-deep-indigo text-pure-white'
                    : 'text-deep-indigo hover:bg-light-surface'
                }`}
              >
                <span className="truncate">{device.label || `Microphone ${index + 1}`}</span>
                {selectedDeviceId === device.deviceId && (
                  <Check className="h-3.5 w-3.5 text-yellow-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
