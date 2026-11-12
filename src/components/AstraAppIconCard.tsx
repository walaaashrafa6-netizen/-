import React from 'react';
import { AstraLogo } from './AstraLogo';
import { Sparkles, X, Orbit } from 'lucide-react';

interface AstraAppIconCardProps {
  onClose?: () => void;
  lang?: 'ar' | 'en';
}

/**
 * Recreating the App Icon Showcase Card as shown on the left half of the reference image:
 * Squircle app icon + ASTRA brand typography + "Monitor · Stay Healthy · Go Further" + Space Station
 */
export const AstraAppIconCard: React.FC<AstraAppIconCardProps> = ({ onClose, lang = 'ar' }) => {
  return (
    <div className="relative w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b from-[#0C1B2B] to-[#07111F] border border-[#42C8F5]/30 shadow-[0_0_40px_rgba(7,17,31,0.8)] text-center flex flex-col items-center overflow-hidden group">
      {/* Background stars and Earth limb */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#42C8F5]/20 blur-3xl" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#8B7CFF]/15 blur-3xl" />
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#11263A] text-slate-400 hover:text-white border border-[#1E2D4A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* The Rounded Squircle App Icon matching reference image */}
      <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-[32px] p-1 bg-gradient-to-b from-[#42C8F5]/50 via-[#11263A] to-[#07111F] shadow-[0_10px_35px_rgba(66,200,245,0.25)] flex items-center justify-center my-4 group-hover:scale-105 transition-transform duration-500">
        <div className="w-full h-full rounded-[28px] bg-[#07111F] flex flex-col items-center justify-center border border-[#42C8F5]/30 relative overflow-hidden">
          {/* Subtle starfield in app icon */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#11263A] via-[#07111F] to-[#050B14]" />
          
          {/* Large Geometric A with Orbit */}
          <AstraLogo size="xl" showText={false} className="relative z-10" />

          {/* ASTRA Wordmark below icon */}
          <span className="relative z-10 font-display font-extrabold tracking-[0.25em] text-[#F2F6FA] text-lg mt-2">
            ASTRA
          </span>
        </div>
      </div>

      {/* Brand Subtitle */}
      <h3 className="font-display font-bold tracking-[0.18em] text-[#F2F6FA] text-sm uppercase mt-2">
        ASTRONAUT
      </h3>
      <h4 className="font-display font-semibold tracking-[0.18em] text-[#A9B8C8] text-xs uppercase">
        HEALTH COMPANION
      </h4>

      {/* Divider */}
      <div className="w-16 h-0.5 bg-[#42C8F5]/30 my-4" />

      {/* Tagline matching reference */}
      <p className="text-xs font-mono text-[#A9B8C8] tracking-wider">
        Monitor · Stay Healthy · Go Further
      </p>

      {/* Space Station / ISS Silhouette in bottom */}
      <div className="mt-6 pt-4 border-t border-[#11263A] w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span className="text-[#35C98A] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#35C98A] animate-pulse" />
          {lang === 'ar' ? 'أيقونة التطبيق الرسمية' : 'Official Application Icon'}
        </span>
        <span className="text-[#42C8F5]">v2.4 Flight Ready</span>
      </div>
    </div>
  );
};
