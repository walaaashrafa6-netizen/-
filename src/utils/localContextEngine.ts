import { NASA_EMERGENCY_PROTOCOLS } from '../data/nasaEmergencyProtocols';
import { NASAEmergencyProtocol, LocalContextSearchResult } from '../types';

/**
 * ASTRA Local Context & Offline Knowledge Engine
 * Fully autonomous on-device RAG (Retrieval-Augmented Generation) & Triage system.
 * Designed for deep-space missions where radio latency to Earth exceeds 20 minutes.
 */

// Normalized tokenization helper for multilingual English/Arabic queries
function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?،]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1);
}

// Keyword-based synonyms and triage mapping for rapid offline search
const TOPIC_SYNONYMS: Record<string, string[]> = {
  toxic_ammonia: ['ammonia', 'nh3', 'pungent', 'odor', 'smell', 'choking', 'أمونيا', 'نشادر', 'ريحة', 'رائحة', 'خانقة', 'تسرب', 'غاز', 'سام', 'تسمم'],
  decompression: ['decompression', 'depress', 'bends', 'chokes', 'pressure', 'breach', 'hole', 'leak', 'vacuum', 'تفريغ', 'ضغط', 'خرق', 'ثقب', 'نيتروجين', 'فقاعات', 'مفاصل', 'كابينة'],
  cpr_cardiac: ['cpr', 'cardiac', 'arrest', 'unresponsive', 'pulse', 'heart', 'defibrillator', 'aed', 'collapse', 'إنعاش', 'قلب', 'نبض', 'توقف', 'صدمات', 'فقدان وعي', 'صدر'],
  hypoxia_co2: ['co2', 'hypercapnia', 'carbon', 'dioxide', 'headache', 'drowsy', 'pocket', 'ثاني أكسيد', 'كربون', 'صداع', 'جيب', 'تهوية', 'اختناق', 'نعاس'],
  radiation_spe: ['radiation', 'solar', 'spe', 'proton', 'storm', 'flare', 'dosimeter', 'إشعاع', 'شمسية', 'عاصفة', 'بروتونات', 'ملجأ', 'درع', 'جرعة'],
  eye_trauma: ['eye', 'cornea', 'vision', 'foreign', 'debris', 'dust', 'blind', 'tear', 'عين', 'قرنية', 'بصر', 'جسم غريب', 'غبار', 'شظية', 'غسيل', 'دموع', 'حرقان'],
  pneumothorax: ['pneumothorax', 'chest', 'rib', 'needle', 'hiss', 'collapsed', 'lung', 'صدر', 'رئة', 'استرواح', 'إبرة', 'ضلع', 'فحيح', 'طعنة'],
  fire_smoke: ['fire', 'smoke', 'flame', 'burn', 'extinguisher', 'co', 'spark', 'حريق', 'دخان', 'نار', 'لهب', 'مطفأة', 'اشتعال', 'أول أكسيد'],
  fracture: ['fracture', 'bone', 'splint', 'broken', 'arm', 'leg', 'sam', 'cast', 'كسر', 'عظم', 'جبيرة', 'ساق', 'ذراع', 'تشوه'],
  eva_suit: ['suit', 'eva', 'spacewalk', 'emu', 'orion', 'puncture', 'sop', 'tether', 'بدلة', 'سير فضائي', 'ثقب بدلة', 'أكسجين البدلة', 'حبل'],
  appendicitis: ['appendix', 'appendicitis', 'abdomen', 'belly', 'stomach', 'mcburney', 'rlq', 'زائدة', 'بطن', 'مغص', 'أمعاء', 'الجانب الأيمن'],
  hydrazine_tox: ['hydrazine', 'propellant', 'fuel', 'thruster', 'rocket', 'fishy', 'هيدرازين', 'وقود', 'صواريخ', 'محرك', 'ترياق'],
  behavioral_psy: ['panic', 'psychosis', 'anxiety', 'claustrophobia', 'delusion', 'restrain', 'calm', 'هلع', 'ذعر', 'جنون', 'أوهام', 'نفسي', 'هدوء', 'مهدئ'],
  dental_pulpitis: ['tooth', 'dental', 'teeth', 'pulpitis', 'jaw', 'filling', 'barodontalgia', 'ضرس', 'سن', 'أسنان', 'عصب', 'حشوة', 'فك'],
  water_contamination: ['water', 'drinking', 'reclamation', 'microbial', 'bacteria', 'diarrhea', 'مياه', 'ماء', 'شرب', 'تلوث', 'بكتيريا', 'إسهال'],
  burns_electrical: ['burn', 'electrical', 'arc', 'shock', 'volt', 'charring', 'حرق', 'كهرباء', 'صعق', 'شرارة', 'سيلفادين'],
  urinary_retention: ['urine', 'urinary', 'bladder', 'catheter', 'void', 'retenion', 'بول', 'مثانة', 'قسطرة', 'احتباس'],
  sans_neuro: ['sans', 'vision', 'optic', 'nerve', 'intracranial', 'lbnp', 'papilledema', 'رؤية', 'عصب بصري', 'جمجمة', 'ضغط الدماغ', 'تسطح العين']
};

/**
 * Searches the local NASA emergency protocol library with zero network calls.
 * Returns ranked protocol results, plain-language triage advice, and immediate actions.
 */
export function searchLocalKnowledgeBase(query: string, lang: 'ar' | 'en' = 'ar'): LocalContextSearchResult[] {
  if (!query || !query.trim()) {
    // Return all protocols ordered by critical severity first
    return NASA_EMERGENCY_PROTOCOLS.map((p) => ({
      protocol: p,
      relevanceScore: p.severity === 'CRITICAL' ? 100 : p.severity === 'WARNING' ? 80 : 60,
      matchedKeywords: [],
      triageSeverity: p.severity === 'CRITICAL' ? 'IMMEDIATE_ACTION' : p.severity === 'WARNING' ? 'URGENT' : 'MONITOR',
      plainAdviceAr: p.simplifiedExplanationAr || p.immediateActionsAr[0],
      plainAdviceEn: p.simplifiedExplanationEn || p.immediateActions[0],
    }));
  }

  const queryTokens = tokenizeText(query);
  const results: LocalContextSearchResult[] = [];

  for (const protocol of NASA_EMERGENCY_PROTOCOLS) {
    let score = 0;
    const matchedTokens: string[] = [];

    // 1. Direct code or title match
    const titleTokens = tokenizeText(`${protocol.code} ${protocol.title} ${protocol.titleAr}`);
    for (const token of queryTokens) {
      if (titleTokens.some((t) => t.includes(token) || token.includes(t))) {
        score += 40;
        matchedTokens.push(token);
      }
    }

    // 2. Category & synonym match
    const synonyms = TOPIC_SYNONYMS[protocol.category] || [];
    for (const token of queryTokens) {
      if (synonyms.some((s) => s.includes(token) || token.includes(s))) {
        score += 35;
        if (!matchedTokens.includes(token)) matchedTokens.push(token);
      }
    }

    // 3. Symptoms match
    const allSymptoms = [...protocol.symptoms, ...protocol.symptomsAr].join(' ').toLowerCase();
    for (const token of queryTokens) {
      if (allSymptoms.includes(token)) {
        score += 25;
        if (!matchedTokens.includes(token)) matchedTokens.push(token);
      }
    }

    // 4. Procedures & equipment match
    const allText = [
      ...protocol.immediateActions,
      ...protocol.immediateActionsAr,
      ...protocol.equipmentNeeded,
      ...protocol.equipmentNeededAr,
      protocol.simplifiedExplanationAr || '',
      protocol.simplifiedExplanationEn || ''
    ].join(' ').toLowerCase();

    for (const token of queryTokens) {
      if (allText.includes(token)) {
        score += 15;
        if (!matchedTokens.includes(token)) matchedTokens.push(token);
      }
    }

    // Boost critical protocols
    if (score > 0) {
      if (protocol.severity === 'CRITICAL') score += 20;
      if (protocol.severity === 'WARNING') score += 10;

      results.push({
        protocol,
        relevanceScore: score,
        matchedKeywords: matchedTokens,
        triageSeverity: protocol.severity === 'CRITICAL' ? 'IMMEDIATE_ACTION' : protocol.severity === 'WARNING' ? 'URGENT' : 'MONITOR',
        plainAdviceAr: protocol.simplifiedExplanationAr || protocol.immediateActionsAr[0],
        plainAdviceEn: protocol.simplifiedExplanationEn || protocol.immediateActions[0],
      });
    }
  }

  // Sort by highest score first
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Standalone offline AI reasoning engine that constructs a complete response
 * for any astronaut health or emergency question, completely in-browser.
 */
export function generateLocalEngineResponse(query: string, lang: 'ar' | 'en' = 'ar'): string {
  const matches = searchLocalKnowledgeBase(query, lang);

  if (matches.length > 0 && matches[0].relevanceScore >= 25) {
    const top = matches[0].protocol;

    if (lang === 'ar') {
      return `### 🚨 استجابة عقدة طوارئ ناسا المحلية (0ms Offline Engine)
**البروتوكول المطابق:** ${top.code} — ${top.titleAr}
**مستوى الخطر:** ${top.severity === 'CRITICAL' ? '⚠️ حرج ومهدد للحياة' : top.severity === 'WARNING' ? '⚠️ تحذير عالي' : 'ℹ️ إرشادي'}

---

#### 💡 الدليل المبسط (ماذا تفعل فوراً إذا لم تكن طبيباً؟):
${top.simplifiedExplanationAr || top.immediateActionsAr[0]}

---

#### ⚡ الإجراءات الفورية الإلزامية:
${top.immediateActionsAr.map((act, i) => `${i + 1}. **${act}**`).join('\n')}

---

#### 💊 جدول الجرعات الطبية الفضائية المعتمدة:
${(top.dosageTableAr || []).map((d) => `• ${d}`).join('\n')}

---

#### 🛠️ استكشاف الأخطاء والبدائل الميدانية (إذا فشلت الخطوة الأولى):
${(top.troubleshootingAr || []).map((t) => `• ${t}`).join('\n')}

---

#### 🧰 المعدات والأدوات المطلوبة فوراً:
${top.equipmentNeededAr.map((eq) => `• ${eq}`).join('\n')}

*(المرجع المعتمد: ${top.nasaSourceDocument} — تم استرجاعه ذاتياً من ذاكرة العقدة المحلية دون حاجة لاتصال بالأرض).*`;
    } else {
      return `### 🚨 NASA Emergency Local Node Protocol (0ms Offline Engine)
**Matched Flight Protocol:** ${top.code} — ${top.title}
**Severity Level:** ${top.severity}

---

#### 💡 Simplified Field Guide (Immediate Plain English):
${top.simplifiedExplanationEn || top.immediateActions[0]}

---

#### ⚡ Immediate Mandatory Flight Steps:
${top.immediateActions.map((act, i) => `${i + 1}. **${act}**`).join('\n')}

---

#### 💊 Approved Spaceflight Dosages:
${(top.dosageTableEn || []).map((d) => `• ${d}`).join('\n')}

---

#### 🛠️ Troubleshooting & Fallback Alternatives:
${(top.troubleshootingEn || []).map((t) => `• ${t}`).join('\n')}

---

#### 🧰 Required Flight Hardware:
${top.equipmentNeeded.map((eq) => `• ${eq}`).join('\n')}

*(Flight Source: ${top.nasaSourceDocument} — Autonomous edge retrieval; no terrestrial communication link required).*`;
    }
  }

  // Fallback if no specific emergency matched
  if (lang === 'ar') {
    return `### 🛰️ رفيق أسترا الصحي — محرك العقدة الفضائية المستقلة (Offline Edge Mode)
تمت معالجة استفسارك محلياً داخل جهازك بدون أي اتصال بخوادم الأرض.

نظام العقدة يحتوي على **18 بروتوكول طوارئ معتمد من ناسا**، بالإضافة إلى بيانات متكاملة عن:
1. **طوارئ دعم الحياة الفورية**: تسرب الأمونيا، خرق الكابينة وتفريغ الضغط، إنعاش القلب في انعدام الوزن، وحرائق المحطة.
2. **العمليات الجراحية والطبية في الفضاء البعيد**: علاج الزائدة الدودية بالأدوية، كسور العظام، إصابات العين والأجسام الطافية، وإفراغ هواء الصدر بالإبرة.
3. **التكيف الفسيولوجي المداري**: انزياح السوائل نحو الرأس، استطالة العمود الفقري، وتمارين جهاز ARED لمنع هشاشة العظام.

*يمكنك كتابة أي عرض أو اسم حالة (مثل: "تسرب أمونيا"، "قلب وقف"، "عين مصابة"، "كسر"، "حريق") وسيقوم المحرك المحلي بعرض الإجراءات الفورية وجرعات الأدوية بدقة.*`;
  } else {
    return `### 🛰️ ASTRA Autonomous Deep-Space Edge Engine (0ms Local Node)
Processed completely on-device without terrestrial cloud reliance.

The autonomous node contains **18 certified NASA Flight Medicine Protocols**, covering:
1. **Critical ECLSS & Life Threats**: Toxic Ammonia, Rapid Depressurization, Zero-G CPR, In-Cabin Fire.
2. **Deep Space Clinical Emergencies**: Conservative Appendicitis Management, Fracture Splinting, Corneal Foreign Body, Needle Thoracostomy.
3. **Microgravity Countermeasures**: Cephalic fluid shift, spinal elongation, and ARED resistance training.

*Type any symptom or emergency keyword (e.g., "ammonia leak", "cardiac arrest", "eye injury", "fire", "decompression") for immediate checklists and drug dosages.*`;
  }
}
