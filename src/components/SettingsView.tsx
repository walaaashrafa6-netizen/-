import React, { useEffect, useState } from 'react';
import { AstronautProfile, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { ASTRONAUT_PROFILE_EVENT, announceAstronautIdentity, getAstronautIdentity } from '../utils/astronautIdentity';
import { Check, Mail, Rocket, Save, Settings, ShieldCheck, UserRound } from 'lucide-react';

interface SettingsViewProps {
  profile: AstronautProfile;
  onUpdateProfile: (profile: AstronautProfile) => void;
  onResetData: () => void;
  lang: Language;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, onUpdateProfile, onResetData, lang }) => {
  const isAr = lang === 'ar';
  const t = TRANSLATIONS[lang];
  const identity = getAstronautIdentity();
  const [displayName, setDisplayName] = useState(identity.displayName);
  const [email, setEmail] = useState(identity.email);
  const [rank, setRank] = useState(profile.rank || 'Commander');
  const [missionName, setMissionName] = useState(profile.missionName);
  const [targetSleepHours, setTargetSleepHours] = useState(profile.targetSleepMinutes / 60);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const refresh = (event: Event) => {
      const updated = (event as CustomEvent<typeof identity>).detail;
      if (!updated) return;
      setDisplayName(updated.displayName);
      setEmail(updated.email);
    };
    window.addEventListener(ASTRONAUT_PROFILE_EVENT, refresh);
    return () => window.removeEventListener(ASTRONAUT_PROFILE_EVENT, refresh);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = displayName.trim();
    const cleanEmail = email.trim();
    const updatedProfile = {
      ...profile,
      callsign: cleanName || profile.callsign,
      displayName: cleanName || profile.callsign,
      email: cleanEmail,
      rank,
      missionName,
      targetSleepMinutes: targetSleepHours * 60,
    };
    onUpdateProfile(updatedProfile);
    announceAstronautIdentity({
      displayName: updatedProfile.displayName,
      callsign: updatedProfile.callsign,
      email: updatedProfile.email,
      rank: updatedProfile.rank,
      missionName: updatedProfile.missionName,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#07101d] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/10';

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-[28px] border border-cyan-100/10 bg-[#0a1423]/90 p-6 shadow-2xl sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-cyan-100/10"><div className="absolute inset-[18%] rounded-full border border-cyan-100/10"/><div className="absolute inset-[32%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#57b8d2,#234a80_55%,#10162d)]"/></div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100/15 bg-cyan-100/[0.08]"><UserRound className="h-7 w-7 text-cyan-100"/></div>
          <div><p className="text-[10px] font-semibold tracking-[.22em] text-cyan-100/70">ASTRA · CREW PROFILE</p><h1 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">{t.settingsTitle}</h1><p className="mt-1 text-xs text-slate-400">{isAr ? 'خصّص اسم النداء وبيانات المهمة وتفضيلاتك؛ تبقى محفوظة على هذا الجهاز.' : 'Personalize your callsign, mission details, and preferences. They stay saved on this device.'}</p></div>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/[0.08] bg-[#0b1322]/95 p-5 shadow-xl sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saved && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200/20 bg-emerald-200/[0.06] p-3 text-xs text-emerald-100"><Check className="h-4 w-4"/>{isAr ? 'تم حفظ الملف الشخصي، وسيستخدمه أسترا لمناداتك.' : 'Profile saved. Astra will use your name when addressing you.'}</div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 text-xs text-slate-300"><span className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-cyan-200"/>{isAr ? 'اسم رائد الفضاء / الاسم المفضل' : 'Astronaut name / preferred name'}</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className={fieldClass} placeholder={isAr ? 'اكتب الاسم الذي تحب أن يناديك به أسترا' : 'The name you want Astra to use'} autoComplete="name" required/><span className="block text-[10px] text-slate-500">{isAr ? 'سيظهر هذا الاسم في الترحيب والواجهة.' : 'Used for greetings and the app interface.'}</span></label>
            <label className="space-y-2 text-xs text-slate-300"><span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-cyan-200"/>{isAr ? 'البريد الإلكتروني (اختياري)' : 'Email address (optional)'}</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={fieldClass} placeholder="name@example.com" autoComplete="email"/><span className="block text-[10px] text-slate-500">{isAr ? 'للتعريف داخل الملف فقط؛ التطبيق لا يرسل بريداً ولا يتصل بناسا.' : 'Profile information only. The app does not send email or contact NASA.'}</span></label>
            <label className="space-y-2 text-xs text-slate-300"><span>{isAr ? 'الرتبة / النداء' : 'Rank / title'}</span><input value={rank} onChange={(event) => setRank(event.target.value)} className={fieldClass} placeholder={isAr ? 'قائد / رائد فضاء' : 'Commander / Astronaut'}/></label>
            <label className="space-y-2 text-xs text-slate-300"><span className="flex items-center gap-2"><Rocket className="h-3.5 w-3.5 text-cyan-200"/>{isAr ? 'اسم المهمة' : 'Mission name'}</span><input value={missionName} onChange={(event) => setMissionName(event.target.value)} className={fieldClass} placeholder="ISS Expedition"/></label>
          </div>
          <label className="block space-y-3 rounded-2xl border border-white/[0.07] bg-[#070d18] p-4 text-xs text-slate-300"><span className="flex items-center justify-between">{isAr ? 'هدف النوم اليومي' : 'Daily sleep goal'}<strong className="text-cyan-100">{targetSleepHours} {isAr ? 'ساعة' : 'hours'}</strong></span><input type="range" min="6" max="10" step="0.5" value={targetSleepHours} onChange={(event) => setTargetSleepHours(Number(event.target.value))} className="w-full accent-cyan-300"/></label>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 to-sky-400 px-5 py-3.5 text-sm font-bold text-[#07111f] shadow-lg transition hover:brightness-110"><Save className="h-4 w-4"/>{isAr ? 'حفظ الملف الشخصي' : 'Save crew profile'}</button>
        </form>
      </section>

      <section className="rounded-[26px] border border-rose-200/20 bg-[#0b1322]/95 p-5 sm:p-7"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-200"/><div><h2 className="text-sm font-semibold text-rose-100">{isAr ? 'إعادة تعيين البيانات' : 'Reset app data'}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{isAr ? 'يمسح سجلات هذا الجهاز ويعيد بيانات العرض الافتراضية.' : 'Clears this device’s saved logs and restores the demo baseline.'}</p><button type="button" onClick={onResetData} className="mt-4 rounded-xl border border-rose-200/20 bg-rose-200/[0.06] px-4 py-2 text-xs text-rose-100 transition hover:bg-rose-200/[0.12]">{t.resetData}</button></div></div></section>
    </div>
  );
};
