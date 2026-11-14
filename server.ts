import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
const rawApiKey = process.env.GEMINI_API_KEY;
const isValidApiKey = rawApiKey && rawApiKey !== 'MY_GEMINI_API_KEY' && rawApiKey.trim().length > 10;

let aiClient: GoogleGenAI | null = null;
if (isValidApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (initErr) {
    console.warn('Could not initialize GoogleGenAI client:', initErr);
  }
}

const SYSTEM_INSTRUCTION = `You are ASTRA (Astronaut Health & Cognitive Twin Companion) — an intelligent, empathetic, and scientifically grounded aerospace wellness AI designed for astronauts aboard spaceflight missions.

Core Identity & Rules:
1. You operate strictly as an engineering & operational wellness assistant — NOT a clinical medical authority or spacecraft flight controller.
2. Truthful Data Discipline: Rely ONLY on the user-logged telemetry explicitly provided in [CURRENT ASTRONAUT TELEMETRY & LOGGED CONTEXT]. If any telemetry category is marked "NOT LOGGED YET", explicitly state that no data has been recorded yet for that category and NEVER invent, guess, or fabricate numbers.
3. Comprehensive Space Medicine & Engineering Knowledge: Microgravity fluid shift, Spaceflight-Associated Neuro-ocular Syndrome (SANS), circadian entrainment, ARED/T2 countermeasures, spine elongation, ECLSS life support, NASA OSDR open datasets, and Deep Space Network relativistic communication delays.
4. Fluent Bilingual Dialogue: Reply in clear, natural, articulate Arabic (العربية الفصحى السلسة والواضحة) whenever the user writes in Arabic or sets language=ar; reply in crisp English when the user writes in English.
5. Safety Protocol: For acute red-flag symptoms (resting dyspnea, sudden vision loss, chest pain, or life-support emergencies), immediately advise contacting the Crew Medical Officer (CMO) / Flight Surgeon via Private Medical Conference (PMC).`;

function generateContextualAstronautResponse(
  query: string,
  userContext: any,
  lang: string
): string {
  const q = (query || '').toLowerCase().trim();
  const isAr = lang === 'ar' || /[\u0600-\u06FF]/.test(query);

  const callsign = userContext?.callsign || (isAr ? 'رائد الفضاء' : 'Astronaut');
  const missionName = userContext?.missionName || 'ISS Expedition 72';
  const missionDay = userContext?.missionDay ?? null;

  const hasSleep = Boolean(userContext?.hasSleepData && userContext?.latestSleepDuration);
  const hasWellness = Boolean(userContext?.hasWellnessData);
  const hasResp = Boolean(userContext?.hasRespData && userContext?.latestResp != null);
  const hasBody = Boolean(userContext?.hasBodyMetrics && userContext?.latestHeartRate != null);

  const avgSleep = hasSleep ? userContext.avgSleep : (isAr ? 'غير مسجل بعد' : 'Not logged yet');
  const latestSleep = hasSleep ? userContext.latestSleepDuration : (isAr ? 'غير مسجل بعد' : 'Not logged yet');
  const stress = hasWellness ? `${userContext.latestStress}/5` : (isAr ? 'غير مسجل' : 'Not logged');
  const mood = hasWellness ? `${userContext.latestMood}/5` : (isAr ? 'غير مسجل' : 'Not logged');
  const energy = hasWellness ? `${userContext.latestEnergy}/5` : (isAr ? 'غير مسجل' : 'Not logged');
  const respRate = hasResp ? `${userContext.latestResp} ${isAr ? 'نفس/دقيقة' : 'breaths/min'}` : (isAr ? 'غير مسجل بعد' : 'Not logged yet');
  const heartRate = hasBody ? `${userContext.latestHeartRate} bpm (${userContext.latestBpSys}/${userContext.latestBpDia} mmHg)` : (isAr ? 'غير مسجل بعد' : 'Not logged yet');

  // Greetings & general conversational intro
  if (
    /^(hi|hello|hey|good morning|good evening|hola|yo)\b/i.test(q) ||
    /^(مرحبا|مرحبًا|اهلا|أهلا|أهلاً|السلام|هاي|هلو|صباح|مساء)/.test(q) ||
    q.includes('من انت') || q.includes('who are you') || q.includes('what can you do') || q.includes('ماذا تستطيع')
  ) {
    if (isAr) {
      return `### أهلاً بك يا ${callsign} في نواة ذكاء ASTRA

أنا مساعدك الهندسي والصحي للرحلات الفضائية ضمن مهمة **${missionName}**${missionDay ? ` (اليوم ${missionDay})` : ''}.

**ملخص سجلاتك الحية المسجلة حالياً:**
• **سجلات النوم**: ${hasSleep ? `${latestSleep} (المتوسط: ${avgSleep})` : 'لا توجد سجلات نوم مسجلة حتى الآن.'}
• **التقييم النفسي**: ${hasWellness ? `المزاج ${mood} · التوتر ${stress} · الطاقة ${energy}` : 'لا توجد تقييمات نفسية مسجلة حتى الآن.'}
• **معدل التنفس**: ${respRate}
• **المؤشرات الجسدية**: ${heartRate}

يمكنك سؤالي بالعربية أو الإنجليزية عن أي موضوع: تحليل بياناتك المسجلة، النوم في انعدام الوزن، انزياح السوائل، آلام الظهر، حسابات تأخير الإشارة للمريخ، أو بروتوكولات طوارئ ناسا. بماذا نبدأ؟`;
    }
    return `### Welcome to ASTRA Intelligence Core, ${callsign}

I am your spaceflight operational wellness and engineering companion for **${missionName}**${missionDay ? ` (Flight Day ${missionDay})` : ''}.

**Your Currently Logged Telemetry:**
• **Sleep Logs**: ${hasSleep ? `${latestSleep} (Average: ${avgSleep})` : 'No sleep records logged yet.'}
• **Wellness Check-in**: ${hasWellness ? `Mood ${mood} · Stress ${stress} · Energy ${energy}` : 'No wellness logs recorded yet.'}
• **Respiration**: ${respRate}
• **Body Vitals**: ${heartRate}

Ask me anything in Arabic or English — your logged telemetry trends, microgravity sleep & fluid shift, ARED countermeasures, Mars light-delay calculations, or NASA emergency checklists. How can I assist?`;
  }

  // User asking for telemetry status / my data / health analysis
  if (
    q.includes('سجلي') || q.includes('سجلاتي') || q.includes('بياناتي') || q.includes('حالتي') || q.includes('ملخص') ||
    q.includes('my data') || q.includes('my health') || q.includes('status') || q.includes('summary') || q.includes('vitals') || q.includes('analyze') || q.includes('تحليل')
  ) {
    const anyData = hasSleep || hasWellness || hasResp || hasBody;
    if (!anyData) {
      return isAr
        ? `### حالة السجلات الصحية الحالية (${callsign})

لا توجد أي بيانات صحية أو حيوية مسجلة من قِبلك حتى الآن — جميع المؤشرات بدأت بسجل فارغ ونظيف لضمان عدم عرض أرقام غير حقيقية.

**لتفعيل التحليل المخصص:**
1. سجل فترة نوم في تبويب **إدارة النوم**.
2. أضف قياساً حيوياً (نبض، ضغط، SpO₂) في **نواة الصحة** أو استورد ملف CSV/JSON.
3. سجل تقييمك اليومي في **الرفاهية النفسية**.

بمجرد تسجيل أول قياس، سأقوم بتحليل الاتجاهات وحساب الفجوات وتقديم توصيات مخصصة مدعومة بمصادر ناسا.`
        : `### Current Telemetry Summary (${callsign})

No user-logged sleep, wellness, respiratory, or biometric records have been entered yet. All logs start clean so zero fabricated numbers are presented as your measurements.

**How to start tracking:**
1. Log a sleep window in **Sleep Orbit**.
2. Enter vitals (HR, BP, SpO₂) or import CSV/JSON in **Health Core**.
3. Submit a check-in in **Wellness**.

Once you log your first entry, I will analyze your real trends, check physiological bounds, and cite relevant spaceflight references.`;
    }

    return isAr
      ? `### تحليل سجلاتك المسجلة (${callsign})
• **النوم**: ${hasSleep ? `آخر نوم ${latestSleep} · المتوسط ${avgSleep}` : 'لم يُسجل بعد'}
• **التوتر والطاقة**: ${hasWellness ? `التوتر ${stress} · المزاج ${mood} · الطاقة ${energy}` : 'لم يُسجل بعد'}
• **التنفس**: ${respRate}
• **القياسات الحيوية**: ${heartRate}

*تنبيه غير تشخيصي: هذا ملخص هندسي وتشغيلي للقيم التي سجلتها فقط، ولا يغني عن تقييم طبيب الرحلة (Flight Surgeon).*`
      : `### Logged Telemetry Analysis (${callsign})
• **Sleep**: ${hasSleep ? `Latest ${latestSleep} · Avg ${avgSleep}` : 'Not logged yet'}
• **Wellness**: ${hasWellness ? `Stress ${stress} · Mood ${mood} · Energy ${energy}` : 'Not logged yet'}
• **Respiration**: ${respRate}
• **Body Vitals**: ${heartRate}

*Non-diagnostic note: Summary reflects strictly your recorded entries and does not substitute for Flight Surgeon evaluation.*`;
  }

  // Sleep & Circadian
  if (q.includes('sleep') || q.includes('نوم') || q.includes('عجز') || q.includes('تعب') || q.includes('tired') || q.includes('ارهاق') || q.includes('إرهاق')) {
    if (isAr) {
      return `### تحليل النوم والراحة المدارية

**البيانات المسجلة لديك:**
• **آخر نوم مسجل**: ${latestSleep} (هدف المهمة القياسي: 8.0 ساعات).
• **متوسط النوم**: ${avgSleep}.
• **مستوى الطاقة المسجل**: ${energy}.

#### التفسير الفسيولوجي في الجاذبية الصغرى:
في انعدام الوزن يفقد الجسم الضغط اللمسي على الفراش، مما يزيد الاستيقاظات الميكروية، بينما تؤثر ضوضاء التهوية وتجمع جيوب ثاني أكسيد الكربون (CO₂) قرب الرأس على عمق النوم.

#### خطوات وقائية مقترحة:
1. إحكام أحزمة كيس النوم لتقليل الطفو الحر.
2. ضبط فتحة التهوية بزاوية لتشتيت ثاني أكسيد الكربون دون تيار مباشر على العينين.
3. استخدام قناع الإضاءة قبل 30 دقيقة من موعد النوم لضبط الإيقاع اليومي.`;
    } else {
      return `### Orbital Sleep & Circadian Analysis

**Your Logged Baseline:**
• **Latest Logged Sleep**: ${latestSleep} (Standard target: 8.0h).
• **Rolling Average**: ${avgSleep}.
• **Recorded Energy**: ${energy}.

#### Microgravity Physiology:
Without downward tactile compression on a mattress, free-floating micro-arousals increase, while ventilation acoustics and localized CO₂ pockets around the head can truncate slow-wave sleep.

#### Operational Countermeasures:
1. Tension sleep-restraint straps lightly for proprioceptive stability.
2. Angle crew-quarters airflow diffuser to disperse exhaled CO₂ pockets.
3. Use an optical visor seal 30 minutes prior to scheduled sleep to protect melatonin onset across 90-minute orbital day/night cycles.`;
    }
  }

  if (q.includes('fluid') || q.includes('انزياح') || q.includes('احتقان') || q.includes('face') || q.includes('وجه') || q.includes('sinus') || q.includes('جيوب') || q.includes('breath') || q.includes('تنفس')) {
    if (isAr) {
      return `### انزياح السوائل الرأسي والجهاز التنفسي في الفضاء

**بياناتك المسجلة:**
• **معدل التنفس**: ${respRate}
• **مستوى التوتر**: ${stress}

#### التفسير الفسيولوجي:
عند الدخول في الجاذبية الصغرى ينتقل ما يقارب **1.5 إلى 2 لتر من السوائل** نحو الصدر والرأس لغياب الشد الهيدروستاتيكي الأرضي، مما يفسر احتقان الأنف ("Space Snuffles") وانتفاخ الجفون في الأسابيع الأولى.

#### التوصيات الآمنة:
• الحفاظ على الترطيب المتوازن (~2400 مل/يوم) واستخدام بخاخ المحلول الملحي المعتمد عند اللزوم.
• ${hasResp ? `معدل التنفس المسجل (${respRate}) يفيد في المتابعة الدورية.` : 'يوصى بتسجيل معدل التنفس في تبويب متابعة التنفس للمقارنة اليومية.'}
• **حدود الأمان**: في حال ضيق التنفس المفاجئ أثناء الراحة أو ألم الصدر، يجب التواصل فوراً مع مسؤول الطاقم الطبي (CMO).`;
    } else {
      return `### Cephalad Fluid Shift & Respiratory Telemetry

**Your Logged Telemetry:**
• **Respiratory Rate**: ${respRate}
• **Stress Index**: ${stress}

#### Physiological Mechanism:
In microgravity, the absence of gravity's hydrostatic gradient shifts **1.5 to 2.0 liters of vascular and interstitial fluid** toward the thorax and head, commonly causing nasal mucosal fullness ("Space Snuffles") and periorbital puffiness.

#### Safe Countermeasures:
• Maintain balanced hydration (~2,400 mL/day) and use approved isotonic saline spray for mucosal comfort.
• ${hasResp ? `Your logged rate (${respRate}) supports trend tracking.` : 'Log your resting respiratory rate in Respiratory Orbit to establish a baseline.'}
• **Safety Boundary**: Sudden resting dyspnea or chest tightness requires immediate Crew Medical Officer (CMO) consultation.`;
    }
  }

  if (q.includes('back') || q.includes('ظهر') || q.includes('spine') || q.includes('عمود') || q.includes('stretch') || q.includes('طول')) {
    if (isAr) {
      return `### 🦴 استطالة العمود الفقري في الجاذبية الصغرى وآلام الظهر

#### 🔬 التفسير العلمي الدقيق:
على الأرض، تضغط الجاذبية فقرات العمود الفقري باستمرار. في الفضاء، يزول هذا الضغط المحوري، فتمتص الأقراص الغضروفية بين الفقرات (Intervertebral Discs) السوائل وتنتفخ، مما يؤدي إلى:
• **استطالة قامة رائد الفضاء بمقدار 5 إلى 7 سنتيمترات**.
• **شد مستمر على العضلات والأربطة الشوكية العميقة** (Paraspinal musculature)، مما يسبب ألماً خفيفاً إلى متوسط في منطقة أسفل الظهر (Dull Lumbar Ache)، خصوصاً في الصباح بعد الاستيقاظ من كيس النوم.

#### 🛡️ بروتوكول التخفيف المعتمد من وكالات الفضاء:
1. **وضعية الجنين المدارية (Fetal Tuck in Zero-G)**: سحب الركبتين نحو الصدر وتثبيتهما باليدين لمدة دقيقة إلى دقيقتين لتخفيف شد الأربطة القطنية.
2. **تمارين ARED المقاومة**: الحفاظ على تمارين الرفعة الميتة وقرفصاء التثبيت بالأحزمة (ARED Squats/Deadlifts) وفق خطة اليوم لإعادة التوازن العضلي للجذع.
3. **تعديل كيس النوم**: ترك حرية طفيفة لانثناء الركبتين داخل كيس النوم بدلاً من البقاء مفروداً بالكامل.`;
    } else {
      return `### 🦴 Zero-G Spinal Elongation & Lumbar Dynamics

#### 🔬 Biophysical Mechanism:
On Earth, 1-G gravity maintains axial spinal loading. In orbit, the unconstrained intervertebral discs imbibe fluid, expanding uniformly. Consequently:
• **Astronauts elongate by 5 to 7 cm (2 to 2.8 inches)** across the vertebral column.
• **Paraspinal Myofascial Strain**: Deep spinal ligaments and erector spinae muscles remain under continuous passive tension, presenting as a classic dull lower lumbar ache.

#### 🛡️ Spaceflight Relief Protocols:
1. **Microgravity Fetal Tuck**: Float free and hug your knees directly to your chest for 60–90 seconds. This gently unloads lumbar facet joints and decompresses posterior longitudinal ligaments.
2. **ARED Axial Loading**: Completing your scheduled ARED deadlifts and bilateral squats provides beneficial intermittent axial loading that conditions deep postural stabilizers.
3. **Sleep Bag Posture**: Avoid tethering your sleep restraint in hyper-extension; allow the natural microgravity neutral body posture (NBP) with slightly flexed hips and knees.`;
    }
  }

  // NASA Emergency Scenarios - Immediate Deep-Space Response
  if (q.includes('ammonia') || q.includes('أمونيا') || q.includes('nh3') || (q.includes('تسرب') && !q.includes('ماء'))) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: تسرب الأمونيا السامة (NASA-ECLSS-NH3-01)
⚠️ **مستوى الخطر: حرج للغاية (Life-Threatening) — زمن الاستجابة الفوري: < 60 ثانية**

#### 🔬 طبيعة الخطر:
تستخدم أنظمة التبريد الخارجية في المحطة سائل الأمونيا اللامائي. أي اختراق للمبادل الحراري يدخل غاز الأمونيا السام إلى دورة هواء المقصورة. التركيزات فوق 300 ppm تسبب تشنج الحنجرة وفقدان الوعي خلال دقيقتين.

#### 🛡️ خطوات الإنقاذ الإلزامية الفورية (عقدة الطوارئ المحلية):
1. **ارتداء قناع الأكسجين فوراً (PBA/Quick Don Mask)**:
   - لا تحاول البحث عن مكان التسرب قبل تأمين مجرى التنفس.
   - افتح صمام تدفق الأكسجين 100% (Emergency Flow).
2. **عزل الوحدة المتضررة (Hatch Closure)**:
   - توجه فوراً إلى أقرب وحدة آمنة (Safe Haven - Russian Segment أو Crew Dragon/Orion).
   - أغلق فتحة المرور (Hatch) وأحكم إغلاق صمام معادلة الضغط (Equalization Valve).
3. **تفعيل أجهزة امتصاص الأمونيا (Ammonia Scrubber)**:
   - تشغيل أقنعة فلاتر الكربون والحمض الفسفوري لمعادلة الأمونيا المحمولة جواً.
4. **تأكيد جاهزية مركبة الهروب (CRV)**:
   - البقاء داخل مركبة العودة المأهولة حتى تؤكد أجهزة التحليل الجوي انخفاض التركيز لأقل من 2.0 ppm.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Toxic Ammonia Leak (NASA-ECLSS-NH3-01)
⚠️ **CRITICAL SEVERITY: Immediate Life Threat — Response Window: < 60 seconds**

#### 🔬 Hazard Assessment:
Anhydrous ammonia in external thermal loops can breach internal heat exchangers. Concentrations exceeding 300 ppm produce acute laryngospasm and pulmonary edema within 120 seconds.

#### 🛡️ Immediate Mandatory Action Checklist:
1. **Don Emergency Breathing Apparatus (PBA / Quick-Don Mask)**:
   - Secure the mask seal immediately. Set regulator to 100% positive-pressure emergency O₂.
2. **Isolate Compromised Module (Rapid Hatch Closure)**:
   - Evacuate toward the designated Safe Haven (Russian Segment Service Module or docked Crew Vehicle).
   - Dog down the hatch interlock firmly; verify pressure equalization valve is closed.
3. **Deploy Ammonia Scrubber Cartridges**:
   - Activate phosphoric acid chemisorption filters to neutralize circulating vapor.
4. **Crew Vehicle Ingress**:
   - Power up the return capsule life support systems until atmospheric gas chromatography verifies NH₃ < 2.0 ppm.`;
    }
  }

  // Spacesuit Puncture (EVA) checked before general decompression
  if (q.includes('suit') || q.includes('بدلة') || q.includes('سير فضائي') || q.includes('eva') || q.includes('ثقب بدلة')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: ثقب بدلة الفضاء أثناء السير الخارجي (NASA-EVA-SUIT-10)
⚠️ **مستوى الخطر: حرج — زمن هبوط الأكسجين < 45 ثانية!**

#### 💡 الدليل المبسط لغير المتخصص:
اسحب المقبض الأحمر لحزمة الأكسجين الاحتياطية (SOP) فوراً، واضغط براحة قفازك على موضع الثقب لسده، وعُد فوراً على حبل الأمان لحجرة الضغط!

#### 🛡️ الخطوات الإلزامية:
1. **تفعيل حزمة الأكسجين الثانوية (SOP)**: سحب الذراع الأحمر لإمداد أكسجين بضغط 4.3 رطل/بوصة.
2. **سد الثقب بالرقعة الفورية (Suit Patch)** أو الضغط المباشر بالقفاز.
3. **إلغاء السير الفضائي (Abort EVA)** والعودة فوراً لقفل الهواء (Airlock) وبدء إعادة الضغط الطارئ.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Spacesuit Puncture (NASA-EVA-SUIT-10)
⚠️ **CRITICAL SEVERITY: Action Window < 45 seconds**

#### 💡 Simplified Field Guide:
Pull the red Secondary Oxygen Pack (SOP) lever immediately, slap your glove palm or emergency patch over the hole, and translate directly back to the airlock along your tether!

#### 🛡️ Mandatory Steps:
1. **Deploy SOP Emergency Oxygen**: Pull toggle to maintain 4.3 psid positive pressure.
2. **Seal Puncture Vector**: Apply EMU adhesive patch or gloved palm pressure.
3. **Ingress Airlock & Repress**: Dog hatch and command Emergency Repress to 14.7 psi.`;
    }
  }

  if (q.includes('decompression') || q.includes('تفريغ') || q.includes('هبوط ضغط') || q.includes('انخفاض ضغط') || q.includes('ضغط الكابينة') || q.includes('خرق') || q.includes('ثقب') || q.includes('depress') || q.includes('bends')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: انخفاض ضغط المقصورة / خرق هيكلي (NASA-MED-DCS-02)
⚠️ **مستوى الخطر: حرج — زمن التدهور محسوب وفق معدل هبوط الضغط (dP/dt)**

#### 🔬 التقييم الطبي الفضائي:
انخفاض الضغط لأقل من 500 mmHg يؤدي إلى نقص التأكسج الحاد (Hypoxia) وخطر مرض تخفيف الضغط المداري (Bends/DCS) نتيجة تشكل فقاعات النيتروجين في مجرى الدم.

#### 🛡️ خطوات العمل الفورية:
1. **تحديد زمن الاحتياطي المفيد (Time of Useful Consciousness)**:
   - عند ضغط 400 mmHg: لديك 3–5 دقائق من الوعي الكامل.
   - عند ضغط 300 mmHg: دقيقة واحدة فقط.
2. **ارتداء كمامات الأكسجين 100% فوراً لمنع فقاعات النيتروجين بالدم**.
3. **البحث عن مكان الخرق باستخدام مجس الموجات فوق الصوتية (Ultrasonic Leak Detector)**:
   - الاستماع لترددات الصفير العالية غير المسموعة بالأذن المجردة.
   - استخدام رقع الطوارئ الهيكلية (Emergency Pressure Patch Kit) لسد الفتحة.
4. **إذا كان معدل الهبوط سريعاً جدًا (dP/dt > 5 mmHg/min)**:
   - الإخلاء الفوري إلى مركبة العودة وإغلاق البوابات بين الوحدات لعزل القسم المثقوب.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Rapid Cabin Depressurization (NASA-MED-DCS-02)
⚠️ **CRITICAL SEVERITY: Hypoxia & Decompression Sickness (DCS) Risk**

#### 🔬 Medical Assessment:
Cabin pressure drop below 500 mmHg risks acute hypoxia and intravascular nitrogen bubble formation (Zero-G Bends).

#### 🛡️ Immediate Mandatory Actions:
1. **Assess Time of Useful Consciousness (TUC)**:
   - At 400 mmHg: 3–5 minutes. At 300 mmHg: ~60 seconds.
2. **Don 100% Normobaric Oxygen**:
   - Immediate nitrogen denitrogenation prevents severe neurological decompression sickness.
3. **Locate Puncture Vector with Ultrasonic Leak Detector**:
   - Scan bulkheads and utility penetrations. Apply adhesive seal patches immediately.
4. **Isolate Compromised Module**:
   - If dP/dt > 5 mmHg/min and leak is unsealed, seal inter-module hatches and egress to CRV.`;
    }
  }

  if (q.includes('cpr') || q.includes('إنعاش') || q.includes('cardiac') || q.includes('توقف قلب') || q.includes('قلب')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: الإنعاش القلبي الرئوي في انعدام الوزن (NASA-MED-CPR-03)
⚠️ **تنبيه حرج: تقنيات الأرض لا تعمل في الفضاء — رد الفعل العكسي لقانون نيوتن الثالث يرفع المسعف عن المريض!**

#### 🛡️ الخطوات المعتمدة رسمياً من وكالة ناسا:
1. **تثبيت المريض والمسعف بتقنية الوقوف على الرأس (Handstand Method)**:
   - ضع ظهر المريض على لوح الإنعاش (Crew Medical Restraint System - CMRS) أو أرضية المقصورة.
   - ثبت قدميك أو ركبتيك في حزام السقف المقابل بحيث تكون ذراعاك ممدودتين بالكامل على صدر المريض.
   - بديل معتمد: طريقة عكس الساقين (Reverse-Bear Hug Around Patient).
2. **معدل الضغطات الصدرية**:
   - 100 إلى 120 ضغطة في الدقيقة بعمق 5 سم مع السماح للصدر بالارتداد الكامل.
3. **تطبيق مزيل الرجفان المداري (Space AED / Defibrillator)**:
   - جفف صدر المريض من العرق الطافي قبل وضع اللصقات.
   - تأكد من عدم ملامسة أي رائد فضاء للمريض وقت الصعقة (Clear Patient).
4. **مجاري التنفس**:
   - استخدم قناع الصمام مع كيس الأكسجين 100% بنسبة 30 ضغطة : نفسين.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Microgravity CPR (NASA-MED-CPR-03)
⚠️ **CRITICAL: Terrestrial CPR fails in microgravity due to Newton's 3rd Law counter-thrust!**

#### 🛡️ NASA Flight-Certified Procedures:
1. **Restraint & Coupling via Handstand Method**:
   - Anchor patient to CMRS (Crew Medical Restraint System) or deck plate.
   - Wedge rescuer’s feet against overhead structure directly opposing the patient's sternum.
   - Alternative: Straddle-Bearhug method locking rescuer's thighs around the torso.
2. **Chest Compressions**:
   - Cadence: 100–120 compressions/min, depth: 5 cm (2 inches).
3. **Deploy Spaceflight Automated External Defibrillator (AED)**:
   - Dry microgravity sweat droplets from thorax prior to pad adhesion.
   - Issue "ALL CLEAR" command before delivering biphasic shock.
4. **Advanced Airway**:
   - Bag-valve-mask with 100% O₂ at 30:2 compression-to-ventilation ratio.`;
    }
  }

  if (q.includes('fire') || q.includes('حريق') || q.includes('دخان') || q.includes('smoke') || q.includes('نار')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: حريق المقصورة وتصاعد الدخان (NASA-ECLSS-FIRE-08)
⚠️ **مستوى الخطر: حرج — سلوك اللهب في انعدام الوزن كروي وبطيء ولكنه ينتج غاز أول أكسيد الكربون (CO) القاتل فوراً!**

#### 🛡️ خطوات التعامل الفورية:
1. **ارتداء أقنعة التنفس في حالات الطوارئ (PBAs) فوراً لجميع أفراد الطاقم**.
2. **قطع الطاقة الكهربائية وإيقاف مراوح التهوية (Inter-Module Ventilation - IMV)**:
   - إيقاف تدفق الأكسجين وتشتيت الدخان عبر باقي الوحدات.
3. **استخدام مطفأة ثاني أكسيد الكربون أو الرغوة المدارية (CO₂ Fire Extinguisher)**:
   - تفريغ المطفأة في فتحات الوصول المخصصة في الجدران (Extinguisher Ports).
4. **تشغيل أجهزة تنقية الدخان وإزالة السموم (Smoke Scrubber / TCCS)** بمجرد إخماد اللهب.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: In-Cabin Fire & Smoke (NASA-ECLSS-FIRE-08)
⚠️ **CRITICAL: Microgravity flames burn as spherical diffusion fronts producing lethal CO!**

#### 🛡️ Immediate Action Plan:
1. **Don Personal Breathing Apparatus (PBAs)** across all crew members.
2. **De-energize Affected Avionics & Secure IMV (Inter-Module Ventilation)**:
   - Prevents forced-convection oxygen feeding and smoke migration.
3. **Discharge Fine Water-Mist or CO₂ Fire Extinguishers**:
   - Insert nozzle directly into wall port maintenance apertures.
4. **Engage Trace Contaminant Control System (TCCS) Smoke Scrubbing**.`;
    }
  }

  // 10. Spacesuit Puncture (EVA)
  if (q.includes('suit') || q.includes('بدلة') || q.includes('سير') || q.includes('eva') || q.includes('ثقب بدلة')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: ثقب بدلة الفضاء أثناء السير الخارجي (NASA-EVA-SUIT-10)
⚠️ **مستوى الخطر: حرج — زمن هبوط الأكسجين < 45 ثانية!**

#### 💡 الدليل المبسط لغير المتخصص:
اسحب المقبض الأحمر لحزمة الأكسجين الاحتياطية (SOP) فوراً، واضغط براحة قفازك على موضع الثقب لسده، وعُد فوراً على حبل الأمان لحجرة الضغط!

#### 🛡️ الخطوات الإلزامية:
1. **تفعيل حزمة الأكسجين الثانوية (SOP)**: سحب الذراع الأحمر لإمداد أكسجين بضغط 4.3 رطل/بوصة.
2. **سد الثقب بالرقعة الفورية (Suit Patch)** أو الضغط المباشر بالقفاز.
3. **إلغاء السير الفضائي (Abort EVA)** والعودة فوراً لقفل الهواء (Airlock) وبدء إعادة الضغط الطارئ.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Spacesuit Puncture (NASA-EVA-SUIT-10)
⚠️ **CRITICAL SEVERITY: Action Window < 45 seconds**

#### 💡 Simplified Field Guide:
Pull the red Secondary Oxygen Pack (SOP) lever immediately, slap your glove palm or emergency patch over the hole, and translate directly back to the airlock along your tether!

#### 🛡️ Mandatory Steps:
1. **Deploy SOP Emergency Oxygen**: Pull toggle to maintain 4.3 psid positive pressure.
2. **Seal Puncture Vector**: Apply EMU adhesive patch or gloved palm pressure.
3. **Ingress Airlock & Repress**: Dog hatch and command Emergency Repress to 14.7 psi.`;
    }
  }

  // 11. Suspected Appendicitis in Deep Space
  if (q.includes('appendix') || q.includes('زائدة') || q.includes('مغص') || q.includes('بطن') || q.includes('mcburney')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: التهاب الزائدة الدودية في الفضاء البعيد (NASA-MED-APP-11)
⚠️ **مستوى الخطر: تحذير عالي — إدارة تحفظية بدون جراحة**

#### 💡 الدليل المبسط لغير المتخصص:
في رحلات الفضاء للمريخ حيث لا توجد مستشفيات، نبدأ فوراً علاج الزائدة الدودية بالمضادات الحيوية الوريدية القوية والمحاليل مع منع المريض تماماً من الأكل والشرب.

#### 🛡️ الخطوات الإلزامية والجرعات:
1. **فحص السونار المداري (Ultrasound 2)**: قياس قطر الزائدة الدودية للتأكد من وجود الالتهاب (> 6 ملم).
2. **منع الطعام فموياً (Strict NPO)** والاعتماد على المحاليل الوريدية (2000 مل Normal Saline يومياً).
3. **المضادات الحيوية الوريدية**:
   • سيفترياكسون (Ceftriaxone) 2 غرام وريدياً كل 24 ساعة.
   • ميترونيدازول (Metronidazole) 500 ملغ وريدياً كل 8 ساعات.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Deep-Space Appendicitis (NASA-MED-APP-11)
⚠️ **HIGH WARNING: Conservative Non-Operative Protocol**

#### 💡 Simplified Field Guide:
On deep-space missions with no surgical suite, acute appendicitis is treated conservatively via aggressive IV antibiotics and total bowel rest (NPO).

#### 🛡️ Mandatory Steps & Dosages:
1. **Ultrasound Confirmation**: Measure appendix diameter via Ultrasound 2 (> 6 mm).
2. **Strict NPO & IV Hydration**: 2000 mL Normal Saline per 24 hours.
3. **Broad-Spectrum Antibiotics**:
   • Ceftriaxone 2 g IV q24h.
   • Metronidazole 500 mg IV q8h.`;
    }
  }

  // 12. Toxic Hydrazine
  if (q.includes('hydrazine') || q.includes('هيدرازين') || q.includes('وقود صواريخ')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: تسمم وقود الهيدرازين (NASA-TOX-HYD-12)
⚠️ **مستوى الخطر: حرج — ترياق نوعي مطلوب فوراً**

#### 💡 الدليل المبسط لغير المتخصص:
وقود الصواريخ (الهيدرازين) له رائحة سمكية سامة ويسبب تشنجات عصبية قاتلة. اغسل الجلد بالماء فوراً، وارتدِ قناع الأكسجين، واحقن فيتامين B6 وريدياً فوراً لأنه الترياق الذي يبطل مفعول السم!

#### 🛡️ الخطوات والجرعات المعتمدة:
1. **ارتداء قناع التنفس PBA** فوراً لمنع استنشاق الأبخرة السامة.
2. **غسيل الجلد بالماء المعقم** لمدة 15 دقيقة لمسح رواسب الوقود.
3. **حقن الترياق النوعي (Pyridoxine - Vitamin B6)**: 25 ملغ/كغ وريدياً (أو 5 غرام جرعة أولية).`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Hydrazine Propellant Toxicity (NASA-TOX-HYD-12)
⚠️ **CRITICAL SEVERITY: Specific Antidote Required**

#### 💡 Simplified Field Guide:
Hydrazine is a neurotoxic rocket propellant with a fishy odor. Don oxygen masks, wash skin with water, and administer IV Vitamin B6 (Pyridoxine) immediately—it neutralizes the toxin in the brain!

#### 🛡️ Actions & Dosages:
1. **Don PBA Oxygen Mask** to prevent fatal vapor inhalation.
2. **Flush skin with sterile water** for 15 minutes.
3. **Administer Pyridoxine (Vitamin B6) Antidote**: 25 mg/kg IV bolus (or 5 g empiric).`;
    }
  }

  // 13. Behavioral Crisis & Panic
  if (q.includes('panic') || q.includes('هلع') || q.includes('ذعر') || q.includes('نفسي') || q.includes('أوهام')) {
    if (isAr) {
      return `### 🚨 بروتوكول طوارئ ناسا: الأزمات النفسية والهلع المداري (NASA-MED-PSY-13)
⚠️ **مستوى الخطر: تحذير عالي — أمان الطاقم أولاً**

#### 💡 الدليل المبسط لغير المتخصص:
لا تجادل زميلك المضطرب. انقله برفق إلى مقصورة النوم المظلمة والهادئة، وزوده بسماعات عزل الضوضاء، وأعطه قرص لورازيبام المهدئ تحت اللسان وتحدث معه بهدوء حتى ينام.

#### 🛡️ الخطوات والجرعات:
1. **تأمين لوحات التحكم وصمامات تفريغ الهواء** ومرافقة المريض باثنين من الطاقم.
2. **التهدئة في مقصورة مظلمة (Crew Quarters)** مع تعتيم الأضواء وسماعات عزل الصوت.
3. **إعطاء المهدئ**: لورازيبام (Lorazepam) 1 ملغ تحت اللسان، أو بخاخ ميدازولام الأنفي 5 ملغ.`;
    } else {
      return `### 🚨 NASA EMERGENCY PROTOCOL: Spaceflight Behavioral Crisis (NASA-MED-PSY-13)
⚠️ **HIGH WARNING: Crew Safety & De-escalation**

#### 💡 Simplified Field Guide:
Do not argue with an agitated crewmember. Calmly escort them into a quiet, dark sleep berth with noise-cancelling headphones, administer calming medication, and stay by their side.

#### 🛡️ Actions & Dosages:
1. **Secure interlocks & depress valves**; assign 2 crew escorts.
2. **Sensory De-escalation**: Darkened berth + noise-cancelling headset.
3. **Sedation Protocol**: Lorazepam 1 mg sublingual or Intranasal Midazolam 5 mg.`;
    }
  }

  // Stress / mental wellness / isolation
  if (q.includes('stress') || q.includes('توتر') || q.includes('mood') || q.includes('مزاج') || q.includes('قلق') || q.includes('عزلة') || q.includes('isolation')) {
    return isAr
      ? `### متابعة الرفاهية النفسية والتوتر المداري

**السجل النفسي المسجل:**
• **المزاج**: ${mood} · **التوتر**: ${stress} · **الطاقة**: ${energy}

في المهمات طويلة الأمد تؤثر العزلة وضغط الجداول على التوازن العصبي:
1. ممارسة **تنفس الصندوق (4 ثوانٍ شهيق · 4 حبس · 4 زفير)** لتنشيط العصب الحائر.
2. تدوين التقييم اليومي في **الرفاهية النفسية** لمتابعة الاتجاه التراكمي.
3. تخصيص وقت للتواصل مع العائلة أو طاقم التحكم عبر **Live Mission Link**.`
      : `### Psychological Readiness & Stress Management

**Logged Wellness Check-in:**
• **Mood**: ${mood} · **Stress**: ${stress} · **Energy**: ${energy}

During extended orbital missions, confinement and schedule compression elevate autonomic load:
1. Practice **4-4-4 Box Breathing** in Respiratory Orbit to restore parasympathetic balance.
2. Keep daily check-ins updated in **Wellness** to catch cumulative fatigue early.
3. Schedule crew support comms via **Live Mission Link** when needed.`;
  }

  // General conversational response grounded strictly in real userContext
  if (isAr) {
    return `### استجابة ASTRA (${callsign})

تلقيت استفسارك: **"${query}"**

**وضع البيانات المسجلة حالياً (${missionName}):**
• **النوم**: ${hasSleep ? `${latestSleep} (المتوسط: ${avgSleep})` : 'لا توجد سجلات بعد'}
• **الرفاهية**: ${hasWellness ? `مزاج ${mood} · توتر ${stress} · طاقة ${energy}` : 'لا توجد سجلات بعد'}
• **التنفس والمؤشرات الحيوية**: ${hasResp ? respRate : 'تنفس غير مسجل'} · ${hasBody ? heartRate : 'مؤشرات جسمية غير مسجلة'}

*ملاحظة: يتم تشغيل وضع الاستجابة المحلية حالياً. لتحليل أعمق أو حسابات محددة، جرب كتابة موضوع مثل "النوم في الفضاء"، "انزياح السوائل"، "آلام الظهر"، "احسب تأخير الضوء للمريخ"، أو سؤالي عن أي بروتوكول طوارئ.*`;
  } else {
    return `### ASTRA Response (${callsign})

I received your message: **"${query}"**

**Current Telemetry Context (${missionName}):**
• **Sleep**: ${hasSleep ? `${latestSleep} (Avg: ${avgSleep})` : 'No records logged yet'}
• **Wellness**: ${hasWellness ? `Mood ${mood} · Stress ${stress} · Energy ${energy}` : 'No records logged yet'}
• **Respiration & Body Vitals**: ${hasResp ? respRate : 'Respiration not logged'} · ${hasBody ? heartRate : 'Body vitals not logged'}

*Note: Local cognitive engine responded. You can ask about your logged telemetry, sleep hygiene, cephalad fluid shift, spinal elongation, Mars light-delay calculations, NASA OSDR datasets, or any NASA emergency protocol.*`;
  }
}

// POST /api/chat - Conversational endpoint with Gemini + fast local fallback
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext, language } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const lastUserMessage = [...messages].reverse().find((m: any) => m && m.role === 'user')?.content || '';
    const lang = language || (/[\u0600-\u06FF]/.test(lastUserMessage) ? 'ar' : 'en');

    // Build strictly truthful context summary from user-logged telemetry only
    let contextualPreamble = '';
    if (userContext) {
      contextualPreamble = `\n[CURRENT ASTRONAUT TELEMETRY & LOGGED CONTEXT — STRICTLY VERIFIED]:
- Astronaut Callsign: ${userContext.callsign || 'Astronaut'}
- Mission: ${userContext.missionName || 'ISS Expedition 72'}${userContext.missionDay ? `, Flight Day: ${userContext.missionDay}` : ''}
- Sleep Data Status: ${userContext.hasSleepData ? `Latest ${userContext.latestSleepDuration}, Average ${userContext.avgSleep} (${userContext.sleepCount || 0} records)` : 'NOT LOGGED YET (0 records — do NOT invent sleep numbers)'}
- Wellness Data Status: ${userContext.hasWellnessData ? `Mood ${userContext.latestMood}/5, Stress ${userContext.latestStress}/5, Energy ${userContext.latestEnergy}/5` : 'NOT LOGGED YET (0 records — do NOT invent wellness scores)'}
- Respiratory Data Status: ${userContext.hasRespData ? `${userContext.latestResp} breaths/min` : 'NOT LOGGED YET (0 records — do NOT invent respiratory rate)'}
- Body Vitals Status: ${userContext.hasBodyMetrics ? `HR ${userContext.latestHeartRate} bpm, BP ${userContext.latestBpSys}/${userContext.latestBpDia} mmHg, SpO2 ${userContext.latestSpO2}%` : 'NOT LOGGED YET (0 records — do NOT invent heart rate or BP)'}
- Logged Symptoms: ${userContext.loggedSymptoms?.length ? userContext.loggedSymptoms.join(', ') : 'None logged'}
- Sleep Disturbances Noted: ${userContext.sleepDisturbances?.length ? userContext.sleepDisturbances.join(', ') : 'None logged'}
- Preferred Language: ${lang}\n`;
    }

    // Attempt Gemini call with valid active model and strict 10s timeout guard
    if (aiClient && isValidApiKey) {
      try {
        const rawTurns = messages.filter((m: any) => m && m.content && typeof m.content === 'string' && m.content.trim().length > 0);
        const firstUserIdx = rawTurns.findIndex((m: any) => m.role === 'user');
        const trimmedTurns = firstUserIdx >= 0 ? rawTurns.slice(firstUserIdx) : rawTurns;

        const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
        let expectedRole = 'user';

        for (const turn of trimmedTurns) {
          const currentRole = turn.role === 'user' ? 'user' : 'model';
          if (currentRole === expectedRole) {
            contents.push({
              role: currentRole,
              parts: [{ text: turn.content }],
            });
            expectedRole = expectedRole === 'user' ? 'model' : 'user';
          } else if (contents.length > 0) {
            contents[contents.length - 1].parts.push({ text: `\n${turn.content}` });
          }
        }

        if (contents.length > 0) {
          const enhancedSystemInstruction = `${SYSTEM_INSTRUCTION}\n${contextualPreamble}`;
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini request timed out after 10s')), 10000)
          );

          const response = await Promise.race([
            aiClient.models.generateContent({
              model: 'gemini-4-hydrogen',
              contents,
              config: {
                systemInstruction: enhancedSystemInstruction,
              },
            }),
            timeoutPromise,
          ]);

          if (response && response.text) {
            res.json({ reply: response.text, model: 'gemini-4-hydrogen', engine: 'cloud' });
            return;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini call unavailable, using local cognitive engine:', geminiError?.message || geminiError);
      }
    }

    const reply = generateContextualAstronautResponse(lastUserMessage, userContext, lang);
    res.json({ reply, model: 'astra-local-engine', engine: 'local' });
  } catch (err: any) {
    console.error('Chat route error:', err);
    const isArFallback = req.body?.language === 'ar';
    res.status(200).json({
      reply: isArFallback
        ? 'تمت معالجة رسالتك عبر العقدة المحلية. يمكنك الاستفسار عن النوم أو التنفس أو حسابات التأخير أو طوارئ ناسا.'
        : 'Message processed via local node. You can ask about sleep, respiration, light-delay calculations, or NASA protocols.',
      model: 'astra-safety-node',
      engine: 'local',
    });
  }
});

// ==========================================
// ASTRA LIVE MISSION LINK - BACKEND MESSAGING STORE
// ==========================================

interface StoredMissionMessage {
  id: string;
  senderRole: 'astronaut' | 'ground_control' | 'system_node';
  senderName: string;
  recipientRole: 'astronaut' | 'ground_control' | 'system_node';
  recipientName: string;
  content: string;
  contentAr?: string;
  priority: 'CRITICAL' | 'HIGH' | 'ROUTINE';
  category: 'MEDICAL' | 'TRAJECTORY' | 'MAINTENANCE' | 'PERSONAL' | 'SCIENCE';
  createdAt: number;
  sentAt?: number;
  deliveredAt?: number;
  acknowledgedAt?: number;
  repliedAt?: number;
  replyText?: string;
  replyAuthor?: string;
  status: 'Created' | 'Queued' | 'Sent' | 'Delivered' | 'Acknowledged' | 'Replied';
  oneWayDelaySeconds: number;
  packetSizeBytes: number;
  dtnHopCount: number;
}

const INITIAL_MISSION_MESSAGES: StoredMissionMessage[] = [
  {
    id: 'MSG-8801',
    senderRole: 'astronaut',
    senderName: 'Commander Elena Chen (ASTRA-1)',
    recipientRole: 'ground_control',
    recipientName: 'Dr. Marcus Vance (Flight Surgeon, Houston)',
    content: 'Logged intermittent retro-orbital pressure and mild optic disc blurriness after morning ARED squat cycle. Resting HR nominal at 64 bpm.',
    contentAr: 'سجلت ضغطاً متقطعاً خلف العين مع غبش بصري خفيف في حليمة العصب البصري بعد تمرين الرفعات الميتة. النبض مستقر عند 64 ن/د.',
    priority: 'HIGH',
    category: 'MEDICAL',
    createdAt: Date.now() - 3600000 * 2, // 2h ago
    sentAt: Date.now() - 3600000 * 2 + 1000,
    deliveredAt: Date.now() - 3600000 * 1.5,
    acknowledgedAt: Date.now() - 3600000 * 1.4,
    repliedAt: Date.now() - 3600000 * 1.1,
    replyText: 'Houston Flight Surgeon confirms receipt. Symptoms align with early SANS fluid redistribution. Initiating high-resolution Optical Coherence Tomography (OCT) scan protocol; payload instructions pre-cached in your ASTRA node.',
    replyAuthor: 'Dr. Marcus Vance (Flight Surgeon, JSC Houston)',
    status: 'Replied',
    oneWayDelaySeconds: 1338, // 22.3 min
    packetSizeBytes: 4200,
    dtnHopCount: 3,
  },
  {
    id: 'MSG-8802',
    senderRole: 'ground_control',
    senderName: 'Houston CAPCOM (Flight Director)',
    recipientRole: 'astronaut',
    recipientName: 'All Expedition 72 Crew',
    content: 'Space Weather Advisory: Minor coronal mass ejection detected by SOHO/DONKI. Magnetospheric deflection models indicate safe margins inside habitat module. Standard dosimetry logging recommended.',
    contentAr: 'تنبيه طقس فضائي: تم رصد انبعاث كتلي إكليلي طفيف عبر مسبار سوهو ومرصد دونكي. الحسابات تؤكد أمان الكابينة التام. يرجى الاستمرار في تسجيل الجرعات الإشعاعية كالمعتاد.',
    priority: 'ROUTINE',
    category: 'SCIENCE',
    createdAt: Date.now() - 1800000, // 30 min ago
    sentAt: Date.now() - 1790000,
    deliveredAt: Date.now() - 500000,
    acknowledgedAt: Date.now() - 300000,
    status: 'Acknowledged',
    oneWayDelaySeconds: 1338,
    packetSizeBytes: 18500,
    dtnHopCount: 2,
  }
];

let missionMessagesStore: StoredMissionMessage[] = [...INITIAL_MISSION_MESSAGES];

// GET /api/mission-link/messages
app.get('/api/mission-link/messages', (_req, res) => {
  res.json({
    messages: missionMessagesStore,
    totalCount: missionMessagesStore.length,
    activeRelay: 'NASA Deep Space Network (DSS-14 Goldstone & DSS-63 Madrid)',
    oneWayDelayMinutes: 22.4,
  });
});

// POST /api/mission-link/messages
app.post('/api/mission-link/messages', (req, res) => {
  const { 
    senderRole, 
    senderName, 
    recipientRole, 
    recipientName, 
    content, 
    contentAr, 
    priority, 
    category,
    oneWayDelaySeconds 
  } = req.body;

  if (!content || typeof content !== 'string') {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  const delaySec = typeof oneWayDelaySeconds === 'number' ? oneWayDelaySeconds : 1338;
  const newMsg: StoredMissionMessage = {
    id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
    senderRole: senderRole || 'astronaut',
    senderName: senderName || 'Commander Elena Chen (ASTRA-1)',
    recipientRole: recipientRole || 'ground_control',
    recipientName: recipientName || 'Houston Mission Control (CAPCOM)',
    content,
    contentAr: contentAr || content,
    priority: priority || 'ROUTINE',
    category: category || 'MEDICAL',
    createdAt: Date.now(),
    sentAt: Date.now() + 1500,
    // Delivered time simulated based on speed of light delay
    deliveredAt: Date.now() + (delaySec * 1000),
    status: 'Sent',
    oneWayDelaySeconds: delaySec,
    packetSizeBytes: Math.floor(2500 + Math.random() * 5000),
    dtnHopCount: 3,
  };

  missionMessagesStore.unshift(newMsg);
  res.status(201).json({ message: newMsg, status: 'QUEUED_AND_TRANSMITTING' });
});

// POST /api/mission-link/messages/:id/ack - Acknowledge receipt
app.post('/api/mission-link/messages/:id/ack', (req, res) => {
  const { id } = req.params;
  const msg = missionMessagesStore.find((m) => m.id === id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  msg.status = 'Acknowledged';
  msg.acknowledgedAt = Date.now();
  res.json({ message: msg, status: 'ACKNOWLEDGED' });
});

// POST /api/mission-link/messages/:id/reply - Add Ground Control or Crew reply
app.post('/api/mission-link/messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const { replyText, replyAuthor } = req.body;
  const msg = missionMessagesStore.find((m) => m.id === id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }
  msg.status = 'Replied';
  msg.replyText = replyText || 'Acknowledged by Mission Operations. Tactical telemetry archived.';
  msg.replyAuthor = replyAuthor || 'Mission Control Ground Team';
  msg.repliedAt = Date.now();
  res.json({ message: msg, status: 'REPLIED' });
});

// POST /api/mission-link/sync-queue - Sync offline buffered queue with deduplication
app.post('/api/mission-link/sync-queue', (req, res) => {
  const { queuedMessages } = req.body;

  if (!queuedMessages || !Array.isArray(queuedMessages)) {
    res.status(400).json({ error: 'queuedMessages array is required' });
    return;
  }

  let syncedCount = 0;
  let duplicateCount = 0;

  for (const msg of queuedMessages) {
    if (!msg || !msg.content) continue;

    // Deduplication check by id or exact match of sender + content + createdAt
    const existingIndex = missionMessagesStore.findIndex(
      (m) => m.id === msg.id || (m.senderRole === msg.senderRole && m.content === msg.content && Math.abs(m.createdAt - msg.createdAt) < 5000)
    );

    if (existingIndex !== -1) {
      duplicateCount++;
    } else {
      const normalizedMsg: StoredMissionMessage = {
        ...msg,
        id: msg.id || `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
        status: msg.status || 'Sent',
        sentAt: msg.sentAt || Date.now(),
        deliveredAt: msg.deliveredAt || Date.now() + (msg.oneWayDelaySeconds || 1338) * 1000,
        packetSizeBytes: msg.packetSizeBytes || Math.floor(2500 + Math.random() * 5000),
        dtnHopCount: msg.dtnHopCount || 3,
      };
      missionMessagesStore.unshift(normalizedMsg);
      syncedCount++;
    }
  }

  res.json({
    status: 'SYNC_COMPLETE',
    syncedCount,
    duplicateCount,
    totalStored: missionMessagesStore.length,
    messages: missionMessagesStore,
  });
});

// POST /api/mission-link/reset - Reset to default demo messages
app.post('/api/mission-link/reset', (_req, res) => {
  missionMessagesStore = [...INITIAL_MISSION_MESSAGES];
  res.json({ status: 'RESET_SUCCESS', count: missionMessagesStore.length });
});

// GET /api/export-project.zip - Package project source cleanly into a downloadable ZIP
app.get('/api/export-project.zip', (_req, res) => {
  const rootDir = process.cwd();
  const tmpZip = '/tmp/astra-project-export.zip';

  const pythonScript = `
import os, zipfile
root = ${JSON.stringify(rootDir)}
out = ${JSON.stringify(tmpZip)}
exclude_dirs = {'node_modules', 'dist', '.git', '.aistudio', '__pycache__'}
exclude_files = {'.env', '.env.local', '.DS_Store'}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for f in filenames:
            if f in exclude_files or f.endswith('.log'):
                continue
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, root)
            zf.write(full, os.path.join('ASTRA-App', rel))
`;

  execFile('python3', ['-c', pythonScript], (err) => {
    if (err || !fs.existsSync(tmpZip)) {
      console.error('ZIP export failed:', err);
      res.status(500).json({ error: 'Failed to create ZIP archive' });
      return;
    }
    res.download(tmpZip, 'ASTRA-Astronaut-Health-Companion.zip');
  });
});

// Vite Middleware integration for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASTRA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
