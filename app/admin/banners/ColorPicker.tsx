'use client';

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  isError?: boolean;
}

export default function ColorPicker({ label, value, onChange, isError }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-10 rounded cursor-pointer ${
              isError ? 'border-2 border-red-500' : 'border border-gray-300'
            }`}
          />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(val) || val === '') {
              onChange(val);
            }
          }}
          placeholder="#000000"
          maxLength={7}
          className="w-24"
        />
      </div>
    </div>
  );
}
