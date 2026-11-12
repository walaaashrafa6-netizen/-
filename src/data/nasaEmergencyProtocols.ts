import { NASAEmergencyProtocol, EdgeNodeStatus } from '../types';

export const CURRENT_EDGE_NODE_STATUS: EdgeNodeStatus = {
  nodeId: 'ASTRA-NODE-72-ALPHA',
  nodeName: 'Autonomous Deep-Space Edge Node (Module Node 2)',
  nodeRole: 'Primary Life-Support & Medical Emergency Autonomous Server',
  oneWayRadioDelayMinutes: 22.4, // Mars-Earth speed-of-light one-way latency
  offlineDatabaseEntriesCount: 18,
  localAIEngineStatus: 'ONLINE_AUTONOMOUS',
  dtnMeshStatus: 'P2P_LOCAL_MESH_ACTIVE',
  lastLocalSyncTimestamp: '2026-11-05T00:00:00Z',
};

export const NASA_EMERGENCY_PROTOCOLS: NASAEmergencyProtocol[] = [
  // 1. Ammonia Leak
  {
    id: 'nasa-nh3-toxic-01',
    code: 'NASA-ECLSS-NH3-01',
    title: 'Toxic Ammonia Leak (ECLSS Loop Decontainment)',
    titleAr: 'تسرب غاز الأمونيا السام في كابينة المحطة',
    severity: 'CRITICAL',
    category: 'toxic_ammonia',
    symptoms: [
      'Pungent, suffocating odor detected across cabin',
      'Severe eye burning and uncontrollable lacrimation',
      'Sudden laryngeal spasm and violent coughing',
      'ECLSS External Active Thermal Control System (EATCS) pressure drop alarm'
    ],
    symptomsAr: [
      'رائحة نفاذة خانقة مفاجئة في مقصورة المحطة',
      'حرقان شديد في العينين مع انهمار الدموع',
      'تشنج في الحنجرة وسعال حاد وصعوبة استنشاق',
      'انطلاق إنذار هبوط الضغط في حلقة التبريد الخارجية EATCS'
    ],
    immediateActionTimerSeconds: 60,
    immediateActions: [
      'DON OXYGEN MASK (PBBA) IN < 10 SECONDS. DO NOT INHALE CABIN AIR.',
      'Immediately evacuate USOS segment and translate to Russian Service Module (Zvezda).',
      'Hatch Isolation: Close and dog module isolation hatch immediately behind crew.',
      'Power down non-essential equipment to reduce ventilation circulation.'
    ],
    immediateActionsAr: [
      'ارتداء قناع الأكسجين المحمول (PBBA) في أقل من 10 ثوانٍ! تجنب استنشاق هواء المقصورة نهائياً.',
      'إخلاء الوحدة فوراً والاتجاه نحو أقرب وحدة آمنة (Safe Haven).',
      'إغلاق وإحكام قفل فوهة العزل (Hatch) لعزل مصدر التسرب ومنع انتشار الغاز.',
      'فصل مراوح التهوية لمنع تدوير الأمونيا في بقية وحدات المحطة.'
    ],
    simplifiedExplanationAr: 'إذا شممت رائحة نشادر نفاذة أو شعرت بحرقان في عينيك: لا تتنفس من هواء الغرفة! ارتدِ قناع الأكسجين فوراً في 10 ثوانٍ. اسحب زملاءك واخرجوا فوراً من الغرفة وأغلقوا الباب الفولاذي بإحكام خلفكم. الأمونيا تحرق الرئتين خلال دقيقتين إن لم تتنفس أكسجيناً نقياً.',
    simplifiedExplanationEn: 'If you smell harsh pungent ammonia or your eyes burn: STOP breathing room air! Put on your emergency oxygen mask within 10 seconds. Evacuate everyone immediately into the next compartment and latch the heavy hatch door shut.',
    dosageTableAr: [
      'أكسجين نقي 100% بمعدل تدفق طوارئ (12-15 لتر/دقيقة) لمدة 30 دقيقة على الأقل',
      'قطرات ترطيب العيون المحايدة: غسيل بمحلول ملحي معقم 500 مل لكل عين في بيئة مغلقة',
      'ألبوتيرول استنشاق (Albuterol Inhaler): 4 إلى 8 بخات لتوسيع الشعب الهوائية وتخفيف التشنج الحنجري'
    ],
    dosageTableEn: [
      '100% O2 via positive pressure mask at 12-15 L/min for >= 30 mins',
      'Sterile saline eye flush 500 mL per eye via closed adapter',
      'Albuterol MDI 4-8 puffs for bronchospasm relief'
    ],
    troubleshootingAr: [
      'إذا تعطل قناع PBBA: اسحب قناع الإخلاء السريع (EPE Hood) فوراً وافتح أسطوانة الهواء البديلة.',
      'إذا تعذر إغلاق الفوهة: تأكد من خلو مجرى القفل من كابلات التغذية أو الأربطة ثم اضغط على مقبض الإحكام (Dogging Handle).',
      'إذا استمرت أعراض الاختناق: استخدم موسع القصبات Albuterol فوراً مع استمرار تنفس الأكسجين النقي.'
    ],
    troubleshootingEn: [
      'If primary PBBA mask malfunctions: Don backup EPE Emergency Escape Hood immediately.',
      'If hatch fails to seal: Check sealing lip for tether cables or debris, then engage dogging lever with foot brace.',
      'If acute wheezing persists: Administer Albuterol 4-8 puffs via mask adapter.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Don Quick-Don Oxygen Mask or Portable Breathing Apparatus (PBBA). Turn supply valve 100% Open.',
        actionAr: 'ارتدِ قناع الأكسجين السريع أو جهاز التنفس المحمول PBBA، وافتح صمام الأكسجين بنسبة 100%.',
        warning: 'Failure to don mask within 15 seconds can cause laryngeal edema and acute incapacitation.',
        warningAr: 'التقاعس عن ارتداء القناع خلال 15 ثانية يؤدي لتورم الحنجرة وفقدان الوعي الحاد.'
      },
      {
        step: 2,
        action: 'Sound the General Emergency Alarm. Verify all crew accounted for via visual head count.',
        actionAr: 'أطلق إنذار الطوارئ العام وتأكد من عدد أفراد الطاقم بالاتصال البصري السريع.',
      },
      {
        step: 3,
        action: 'Ingress safe haven module. Close and dog the hatch securely.',
        actionAr: 'ادخل الوحدة الآمنة، وأغلق فوهة العزل بإحكام لمنع تسرب الغاز.',
        warning: 'Do not re-open hatch until Draeger tube gas sampling confirms NH3 < 2 ppm.',
        warningAr: 'يُحظر فتح الفوهة قبل قياس مستوى الأمونيا بأنابيب Draeger وتأكيد هبوطها دون 2 جزء بالمليون.'
      },
      {
        step: 4,
        action: 'Initiate ECLSS Ammonia Scrubber and Trace Contaminant Control System (TCCS) high-rate mode.',
        actionAr: 'شغّل نظام فلاتر الأمونيا ووحدة التحكم في الملوثات TCCS بأقصى طاقة امتصاص.',
      }
    ],
    equipmentNeeded: ['PBBA Oxygen Mask', 'Emergency Escape Mask (EPE)', 'Draeger NH3 Sampling Tubes', 'Node 1 Hatch Dog Tool'],
    equipmentNeededAr: ['قناع تنفس أكسجين محمول PBBA', 'قناع إخلاء طوارئ EPE', 'أنابيب فحص الغاز Draeger', 'أداة إحكام قفل الفوهة'],
    nasaSourceDocument: 'NASA Flight Rules Section 2.1 — Toxic Ammonia Response & ECLSS Matrix SSP-50260'
  },

  // 2. Decompression
  {
    id: 'nasa-med-dcs-02',
    code: 'NASA-MED-DCS-02',
    title: 'Acute Decompression Sickness (DCS "Bends") & Cabin Depress',
    titleAr: 'مرض تخفيف الضغط الحاد (فقاعات النيتروجين) وانخفاض ضغط الكابينة',
    severity: 'CRITICAL',
    category: 'decompression',
    symptoms: [
      'Severe peri-articular joint pain in shoulders and knees ("Bends")',
      'Substernal burning pain during inspiration and tachypnea ("Chokes")',
      'Scotoma (visual field loss) or neurological tingling/numbness',
      'Cabin pressure altimeter dropping below 14.7 psi (101.3 kPa)'
    ],
    symptomsAr: [
      'آلام مبرحة في مفاصل الركبتين والكتفين تشبه الطحن (The Bends)',
      'حرقان حاد خلف عظم القص أثناء التنفس وسعال لا إرادي (The Chokes)',
      'فقدان جزئي للرؤية، وخز خدر عصبي، أو ارتباك ذهني',
      'انخفاض مؤشر ضغط الكابينة تحت 14.7 رطل/بوصة مربعة'
    ],
    immediateActionTimerSeconds: 120,
    immediateActions: [
      'Initiate 100% Normobaric Oxygen via tightly sealed aviator mask immediately.',
      'Place crewmember in total physical immobilization (do not allow floating exertion).',
      'If cabin breach confirmed: locate breach via ultrasound leak detector or ingress EMU suit for 4.3 psi repress.',
      'Prep Hyperbaric Treatment Protocol via airlock repressurization if available.'
    ],
    immediateActionsAr: [
      'بدء استنشاق أكسجين نقي 100% عبر قناع محكم لمنع تكون فقاعات غاز النيتروجين بالدم.',
      'تثبيت رائد الفضاء ومنعه تماماً من الحركة أو بذل أي مجهود بدني.',
      'في حال وجود خرق هيكلي: استخدام كاشف التسريب بالموجات فوق الصوتية لسد الثقب أو الدخول في بدلة الفضاء.',
      'تجهيز بروتوكول الضغط العالي عبر قفل الهواء لرفع الضغط فوق المعدل الأرضي.'
    ],
    simplifiedExplanationAr: 'عند هبوط ضغط الكابينة، يتحول النيتروجين في دمك إلى فقاعات غازية تسد الأوعية الدموية في المفاصل والمخ. العلاج الفوري المنقذ للحياة: تنفس أكسجين نقي 100% فوراً واجلس دون أي حركة. الأكسجين يطرد النيتروجين من الدم ويذيب الفقاعات القاتلة.',
    simplifiedExplanationEn: 'When cabin pressure drops, dissolved nitrogen in blood bubbles out like soda foam, blocking vessels to your brain and joints. Immediate fix: breathe 100% pure oxygen immediately and remain completely still.',
    dosageTableAr: [
      'أكسجين نقي 100% بتدفق عالي (15 لتر/دقيقة) لمدة ساعتين على الأقل (Denitrogenation)',
      'ترطيب فموي أو وريدي: 1000 مل محلول ملحي متساوي التوتر (Normal Saline) لتقليل لزوجة الدم',
      'أسبرين فموي 325 ملغ لتقليل تجمع الصفائح الدموية حول فقاعات الغاز'
    ],
    dosageTableEn: [
      '100% high-flow O2 at 15 L/min for minimum 2 hours',
      '1000 mL IV normal saline to counteract hemoconcentration',
      'Aspirin 325 mg PO to prevent bubble-induced platelet aggregation'
    ],
    troubleshootingAr: [
      'إذا تفاقمت الأعراض العصبية (شلل أو فقدان بصر): انقل المريض إلى وحدة الإنزال أو قفل الضغط وقم بزيادة الضغط إلى 1.2 ضغط جوي.',
      'إذا تعذر فتح وريد لإعطاء المحاليل: استخدم إبرة الحقن العظمي (Intraosseous - IO Needle) في عظم الساق.'
    ],
    troubleshootingEn: [
      'If neurological deficits progress: Translate patient into airlock and execute hyperbaric overpressurization.',
      'If peripheral IV access fails: Deploy EZ-IO intraosseous vascular access in proximal tibia.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Apply Aviator Oxygen Mask with 100% O2 delivery. Verify tight facial perimeter seal.',
        actionAr: 'ضع قناع الأكسجين المعتمد بنسبة 100% وتأكد من إحكام الحواف المطاطية على الوجه.',
        warning: 'Even 5% cabin air leakage drastically slows nitrogen elimination and worsens ischemia.',
        warningAr: 'تسرب حتى 5% من هواء الكابينة يبطئ طرد النيتروجين ويفاقم نقص التروية الدموية.'
      },
      {
        step: 2,
        action: 'Immobilize patient in horizontal zero-g restraint with padded straps.',
        actionAr: 'ثبت المريض أفقياً في حمالة التثبيت الفضائية باستخدام أحزمة مبطنة.',
      },
      {
        step: 3,
        action: 'Initiate continuous neurological check: pupils, motor strength, verbal fluency every 15 min.',
        actionAr: 'ابدأ فحصاً عصبياً مستمراً كل 15 دقيقة: حدقة العين، وقوة العضلات، وطلاقة النطق.',
      }
    ],
    equipmentNeeded: ['Aviator 100% O2 Mask', 'Crew Medical Restraint System (CMRS)', 'Intravenous Saline Kit', 'Neuro Diagnostic Penlight'],
    equipmentNeededAr: ['قناع أكسجين طيارين 100%', 'حمالة تثبيت طبية CMRS', 'مجموعة محاليل وريدية', 'قلم فحص عصبي ضوئي'],
    nasaSourceDocument: 'NASA SP-2016-3705 — Space Flight Medicine: Operational Decompression Countermeasures'
  },

  // 3. CPR in Microgravity
  {
    id: 'nasa-med-cpr-03',
    code: 'NASA-MED-CPR-03',
    title: 'Microgravity CPR & Cardiac Arrest Resuscitation',
    titleAr: 'الإنعاش القلبي الرئوي في انعدام الوزن وحالات توقف القلب',
    severity: 'CRITICAL',
    category: 'cpr_cardiac',
    symptoms: [
      'Unresponsive crewmember with absent carotid pulse',
      'Sudden collapse during exercise or EVA egress',
      'Agonal gasping or complete apnea',
      'ECG telemetry showing Ventricular Fibrillation (VF) or Asystole'
    ],
    symptomsAr: [
      'فقدان تام للوعي مع انعدام النبض في الشريان السباتي بالرقبة',
      'سقوط مفاجئ أثناء التمارين أو الدخول من السير الفضائي',
      'توقف التنفس تماماً أو تنفس احتضاري متقطع',
      'شاشة التخطيط تظهر رجفاناً بطينياً VF أو توقفاً تاماً لنبض القلب'
    ],
    immediateActionTimerSeconds: 30,
    immediateActions: [
      'ACTIVATE HANDSTAND CPR: Wedge rescuer feet against opposite bulkhead to deliver downward force.',
      'Deploy Crew Medical Restraint System (CMRS) or secure patient to module deck plate immediately.',
      'Power on Space Automated External Defibrillator (Tempus Pro / AED) and adhere pads to dry chest.',
      'Deliver 100-120 compressions/min at 5 cm depth. Follow 30:2 ratio with bag-valve mask on 100% O2.'
    ],
    immediateActionsAr: [
      'تفعيل إنعاش الوقوف على الرأس (Handstand CPR): ثبت قدميك في السقف لضغط صدر المريض بقوة.',
      'تثبيت المريض بحمالة CMRS أو ربطه بأرضية الوحدة لمنعه من الارتداد للأعلى.',
      'تشغيل جهاز الصدمات الكهربائية الفضائي وتجفيف الصدر من العرق قبل وضع اللصقات.',
      'ضغط الصدر بمعدل 100-120 ضغطة بالدقيقة بعمق 5 سم مع إعطاء نفسين أكسجين كل 30 ضغطة.'
    ],
    simplifiedExplanationAr: 'في الفضاء لا يمكنك الضغط على صدر رائد الفضاء بوزنك لأن وزنك صفر! إذا ضغطت ستطير أنت في الهواء. الحل الوحيد: ثبت قدميك أو ركبتيك في سقف الكابينة فوق المريض مباشرة واضغط بذراعيك بقوة نحو صدره 100 مرة في الدقيقة، واستخدم جهاز الصعقات الكهربائية فوراً.',
    simplifiedExplanationEn: 'In zero gravity, your body weight is zero. If you push on their chest, you will push yourself away! Lock your feet against the ceiling directly above the patient and push down using your full arm power at 100-120 beats per minute.',
    dosageTableAr: [
      'إبينفرين (Epinephrine) وريدي/عظمي: 1 ملغ (1:10,000) كل 3 إلى 5 دقائق أثناء الإنعاش',
      'أميودارون (Amiodarone): 300 ملغ وريدياً بعد الصدمة الثالثة في حالات الرجفان البطيني المقاوم',
      'كبريتات المغنيسيوم: 2 غرام وريدياً في حال ظهور تورساد دي بوانت (Torsades de pointes)'
    ],
    dosageTableEn: [
      'Epinephrine 1 mg IV/IO every 3-5 minutes during active CPR',
      'Amiodarone 300 mg IV/IO bolus after 3rd defibrillation shock',
      'Magnesium Sulfate 2 g IV/IO for refractory polymorphic VT'
    ],
    troubleshootingAr: [
      'إذا لم تتمكن من تثبيت قدميك في السقف: استخدم طريقة العناق العكسي (Reverse Bear-Hug Method) واقفل ساقيك حول جذع المريض واضغط بكلتا يديك.',
      'إذا تعذر لصق أقطاب الصدمات بسبب تعرق انعدام الوزن: استخدم شاشاً جافاً وامسح الصدر بقوة لإزالة طبقة العرق الطافية.'
    ],
    troubleshootingEn: [
      'If overhead bulkhead is out of reach: Switch to Reverse Bear-Hug method, wrapping legs around patient thighs.',
      'If defibrillator pads fail to stick due to zero-g sweat film: Vigorously rub chest dry with sterile gauze pad.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Secure patient to CMRS board using torso and thigh velcro straps.',
        actionAr: 'ثبت ظهر المريض بحمالة CMRS باستخدام أربطة الصدر والفخذين لمنع انزلاقه.',
        warning: 'Unrestrained compressions propel both rescuer and patient across the cabin, nullifying cardiac output.',
        warningAr: 'الإنعاش دون تثبيت يدفع المسعف والمريض في أرجاء الكابينة دون أي تدفق للدم.'
      },
      {
        step: 2,
        action: 'Wedge rescuer feet against overhead deck. Lock elbows and compress sternum 5-6 cm.',
        actionAr: 'احشر قدميك في السقف، وافرد مرفقيك واضغط على منتصف عظم القص بعمق 5-6 سم.',
      },
      {
        step: 3,
        action: 'Attach Space AED pads: Right anterior clavicle, left mid-axillary line. Follow automated voice prompts.',
        actionAr: 'ألصق أقطاب جهاز الصدمات: أعلى الصدر يميناً وأسفل الإبط يساراً. واتبع الأوامر الصوتية للجهاز.',
      }
    ],
    equipmentNeeded: ['Crew Medical Restraint System (CMRS)', 'Spaceflight Defibrillator (Tempus Pro)', 'Bag-Valve Mask with HEPA Filter', 'EZ-IO Vascular Drill'],
    equipmentNeededAr: ['حمالة الإنعاش CMRS', 'جهاز الصدمات الكهربائية الفضائي', 'قناع تهوية ذو صمام مفرد', 'جهاز الحقن العظمي EZ-IO'],
    nasaSourceDocument: 'NASA TM-2020-220584 — Cardiopulmonary Resuscitation Techniques in Microgravity Environments'
  },

  // 4. Hypercapnia CO2
  {
    id: 'nasa-med-co2-04',
    code: 'NASA-MED-CO2-04',
    title: 'Severe Cabin Hypercapnia & Carbon Dioxide Micro-Pocket Toxicity',
    titleAr: 'تسمم ثاني أكسيد الكربون الحاد وتجمع الجيوب الهوائية الخاملة',
    severity: 'WARNING',
    category: 'hypoxia_co2',
    symptoms: [
      'Throbbing frontal headache resistant to NSAIDs',
      'Facial flushing, dyspnea, and rapid mental confusion',
      'Visual dimming and inability to concentrate on flight displays',
      'Module CO2 sensor reading > 4.5 mmHg (ppCO2)'
    ],
    symptomsAr: [
      'صداع نابض حاد في الجبهة لا يستجيب للمسكنات المعتادة',
      'احمرار في الوجه، ضيق في التنفس، وارتباك ذهني سريع',
      'تشوش في الرؤية وعدم القدرة على قراءة شاشات الطيران',
      'قراءة مجس غاز ثاني أكسيد الكربون تتجاوز 4.5 ملم زئبق'
    ],
    immediateActionTimerSeconds: 300,
    immediateActions: [
      'Reposition immediately to high-ventilation trunk area; vacate dead-air stagnant corners.',
      'Don emergency oxygen mask or initiate personal ventilation fan diffuser.',
      'Toggle ECLSS Carbon Dioxide Removal Assembly (CDRA) or Amine Scrubber to HIGH-SCRUB mode.',
      'Check cabin airflow velocity with anemometer (must be >= 15 ft/min).'
    ],
    immediateActionsAr: [
      'الانتقال فوراً إلى مسار تدفق الهواء الرئيسي والابتعاد عن الزوايا الراكدة.',
      'ارتداء قناع الأكسجين أو تشغيل مروحة التهوية الشخصية على الوجه مباشرة.',
      'تحويل نظام تنقية الهواء CDRA إلى وضع الامتصاص الأقصى لتخفيض نسبة الغاز.',
      'قياس سرعة تيار الهواء بمقياس الرياح (يجب ألا تقل عن 15 قدم/دقيقة).'
    ],
    simplifiedExplanationAr: 'في انعدام الوزن لا يرتفع الهواء الساخن لأعلى تلقائياً! عندما تتنفس في زاوية معزولة أو أثناء نومك يتجمع ثاني أكسيد الكربون حول رأسك ككرة غير مرئية تخنقك ببطء. الحل: تحرك فوراً نحو منتصف المقصورة حيث تعمل مراوح التهوية الكبيرة وتنفس أكسجيناً نقياً.',
    simplifiedExplanationEn: 'Without gravity, hot breath does not rise. A toxic bubble of your own exhaled CO2 forms around your head like an invisible pillow, poisoning your brain. Move into the center of the module where large fans blow, and breathe pure O2.',
    dosageTableAr: [
      'أكسجين نقي 100% لمدة 15 إلى 30 دقيقة لطرد حمض الكربونيك من الدم',
      'إيبوبروفين 400 ملغ فموياً لتخفيف الصداع الناتج عن تمدد الأوعية الدماغية',
      'شرب 500 مل ماء للمساعدة في التوازن الحمضي الكلوي'
    ],
    dosageTableEn: [
      '100% O2 for 15-30 minutes to hasten CO2 wash-out',
      'Ibuprofen 400 mg PO for cerebral vasodilatory headache',
      '500 mL oral hydration for renal acid-base compensation'
    ],
    troubleshootingAr: [
      'إذا تعطل نظام CDRA: ركب خراطيش هيدروكسيد الليثيوم (LiOH Canisters) الاحتياطية يدوياً في حلقة التنقية.',
      'إذا استمر الصداع الحاد: استمر على الأكسجين وتأكد من أن سرعة تيار الهواء فوق 20 قدم/دقيقة.'
    ],
    troubleshootingEn: [
      'If CDRA scrubber fails: Manually install backup Lithium Hydroxide (LiOH) canisters into ECLSS loop.',
      'If throbbing headache persists: Continue O2 washout and verify cabin ventilation velocity exceeds 20 ft/min.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Translate to Node center where active ventilation exceeds 0.1 m/s.',
        actionAr: 'انتقل إلى منتصف الوحدة حيث تتجاوز سرعة تيار الهواء 0.1 م/ثانية.',
      },
      {
        step: 2,
        action: 'Perform 15-minute 100% oxygen washout via portable mask.',
        actionAr: 'استنشق الأكسجين النقي لمدة 15 دقيقة لطرد الغاز من أنسجة المخ.',
      },
      {
        step: 3,
        action: 'Verify ECLSS CDRA bed temperature and valve cycling status on engineering telemetry.',
        actionAr: 'افحص درجة حرارة فلاتر نظام تنقية الهواء وتأكد من دورة صماماته على شاشات المحطة.',
      }
    ],
    equipmentNeeded: ['Personal Ventilation Fan', 'Vane Anemometer', 'Aviator Oxygen Mask', 'LiOH Scrubber Canister'],
    equipmentNeededAr: ['مروحة تهوية شخصية', 'مقياس سرعة الرياح', 'قناع أكسجين طيارين', 'خرطوشة هيدروكسيد الليثيوم LiOH'],
    nasaSourceDocument: 'NASA STD-3001 Vol 2 — Spaceflight Architectural Standards: ECLSS Carbon Dioxide Limits'
  },

  // 5. Radiation SPE Storm
  {
    id: 'nasa-rad-spe-05',
    code: 'NASA-RAD-SPE-05',
    title: 'Solar Particle Event (SPE) Radiation Storm Shelter Protocol',
    titleAr: 'بروتوكول الاحتماء من العواصف الإشعاعية والجسيمات الشمسية العاتية',
    severity: 'WARNING',
    category: 'radiation_spe',
    symptoms: [
      'Ground Mission Control SPE Alarm: Proton flux > 100 MeV threshold',
      'Phosphenes (cosmic ray light flashes seen in eyes even with eyelids closed)',
      'Acute nausea, fatigue, and subtle erythema (if heavy dose absorbed)',
      'Dosimeter TEPC rate spiking > 50 mGy/hour'
    ],
    symptomsAr: [
      'إنذار عاصفة شمسية: تدفق جسيمات البروتونات يتجاوز حد 100 ميغا إلكترون فولت',
      'ومضات ضوئية خاطفة في شبكية العين ترى حتى مع إغلاق الجفون (Phosphenes)',
      'غثيان حاد، إجهاد غير مبرر، واحمرار خفيف بالجلد في حال امتصاص جرعة عالية',
      'مقياس الإشعاع الرقمي الشخصي TEPC يرتفع بسرعة فوق 50 ملي جراي/ساعة'
    ],
    immediateActionTimerSeconds: 900,
    immediateActions: [
      'Ingress designated Storm Shelter immediately (Module Service Module / Water Wall Haven).',
      'Surround crew sleeping stations with hydrogen-rich water storage bags and polyethylene blocks.',
      'Power down external cameras, terminate EVAs, and orient vehicle solar arrays to minimal drag.',
      'Check personal active dosimeters (CPDS / RAD) every 30 minutes.'
    ],
    immediateActionsAr: [
      'الدخول فوراً إلى ملجأ العواصف الإشعاعية المبطن داخل المحطة (Storm Shelter).',
      'إحاطة مقصورة الاحتماء بأكياس المياه الغنية بالهيدروجين وألواح البولي إيثيلين لامتصاص الإشعاع.',
      'إنهاء أي خروج فضائي فوراً وإيقاف الأجهزة الإلكترونية الخارجية الحساسة.',
      'تسجيل قراءات مقاييس الإشعاع الشخصية النشطة كل 30 دقيقة.'
    ],
    simplifiedExplanationAr: 'عند حدوث انفجار شمسي، تطلق الشمس تياراً مميتاً من الجسيمات المشحونة التي تخترق جدران المركبة. ملجأ الأمان الوحيد هو الوحدة الداخلية المحاطة بخزانات المياه وأكياس الطعام، لأن الهيدروجين الموجود في الماء هو أفضل درع يوقف هذه الجسيمات. ابقَ داخل الملجأ ولا تخرج حتى ينتهي الإنذار.',
    simplifiedExplanationEn: 'A solar flare shoots a wave of deadly high-energy protons right through spacecraft hulls. Move immediately into the central storm shelter surrounded by water bags and polyethylene blocks—hydrogen in water absorbs the cosmic radiation.',
    dosageTableAr: [
      'أوندانسيترون (Ondansetron) 8 ملغ فموياً كل 8 ساعات لمنع الغثيان الإشعاعي الحاد',
      'بروميد البوتاسيوم ومضادات الأكسدة المعتمدة من ناسا لحماية الخلايا',
      'فيلغراستيم (Filgrastim - G-CSF) 5 ميكروغرام/كغ في حال انخفاض كريات الدم البيضاء بعد الجرعة العالية'
    ],
    dosageTableEn: [
      'Ondansetron 8 mg PO every 8h for acute radiation-induced nausea',
      'Antioxidant cocktail (Vitamin C/E, N-acetylcysteine) as free radical scavenger',
      'Filgrastim (G-CSF) 5 mcg/kg SQ if severe neutropenia follows high-dose absorption'
    ],
    troubleshootingAr: [
      'إذا تعذر الوصول للملجأ المركزي: قم بجمع جميع أكياس الماء (Water CWC Bags) ورصها حول كيس نومك كدرع مؤقت.',
      'إذا ظهر تقيؤ متكرر: استخدم حقن Ondansetron العضلية بدلاً من الأقراص الفموية مع تعويض السوائل وريدياً.'
    ],
    troubleshootingEn: [
      'If central shelter is inaccessible: Stack potable water contingency bags (CWCs) around sleep berth.',
      'If persistent emesis prevents oral pills: Administer Ondansetron 4 mg IM or IV.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Relocate all crew members to core storm haven module.',
        actionAr: 'انقل جميع أفراد الطاقم إلى ملجأ العواصف في قلب المحطة.',
      },
      {
        step: 2,
        action: 'Stack Contingency Water Containers (CWCs) along windward hull walls for maximum shielding.',
        actionAr: 'رص أكياس تخزين المياه على الجدران المواجهة لاتجاه التدفق الشمسي.',
      },
      {
        step: 3,
        action: 'Record baseline biodosimetry readings from personal and area dosimeters.',
        actionAr: 'سجل القراءات الإشعاعية الأولية من أجهزة القياس الشخصية ومجسات الحجرة.',
      }
    ],
    equipmentNeeded: ['Contingency Water Containers (CWCs)', 'Active Tissue Equivalent Proportional Counter (TEPC)', 'Ondansetron Injections', 'Polyethylene Shield Bricks'],
    equipmentNeededAr: ['أكياس المياه المرنة CWCs', 'مقياس الجرعات المكافئة للأنسجة TEPC', 'حقن مضاد الغثيان Ondansetron', 'قوالب البولي إيثيلين العازلة'],
    nasaSourceDocument: 'NASA Space Radiation Program Element — Operational Radiation Safety in Low Earth Orbit & Deep Space'
  },

  // 6. Eye Foreign Body
  {
    id: 'nasa-med-eye-06',
    code: 'NASA-MED-EYE-06',
    title: 'Zero-G Corneal Foreign Body & Toxic Chemical Eye Irrigation',
    titleAr: 'إصابات العين ودخول الأجسام الطافية وغسيل القرنية في الفضاء',
    severity: 'ADVISORY',
    category: 'eye_trauma',
    symptoms: [
      'Sudden sharp ocular pain, foreign body sensation, and photophobia',
      'Blepharospasm and intense conjunctival injection',
      'Microgravity debris or chemical droplet floating onto corneal surface'
    ],
    symptomsAr: [
      'ألم حاد مفاجئ بالعين وإحساس بوجود جسم غريب وعدم تحمل الضوء',
      'تشنج في الجفن وانغلاق لا إرادي للعين مع احمرار شديد في الملتحمة',
      'دخول ذرة غبار أو قطرة كيميائية طافية على سطح القرنية'
    ],
    immediateActionTimerSeconds: 180,
    immediateActions: [
      'DO NOT RUB THE EYE. Rubbing drives orbital particulate deep into corneal stroma.',
      'Deploy Eye Wash Kit with Closed-Loop Goggle or Morgan Lens irrigation system.',
      'Instill Proparacaine 0.5% topical anesthetic drops to abolish blepharospasm.',
      'Flush with 500 mL sterile saline using fluid-capturing zero-g suction.'
    ],
    immediateActionsAr: [
      'ممنوع فرك العين نهائياً! الفرك يغرس الشظية العالقة داخل أنسجة القرنية.',
      'تجهيز طقم غسيل العين بنظارة الشفط المغلقة أو عدسة مورغان (Morgan Lens).',
      'وضع قطرة التخدير الموضعي (Proparacaine 0.5%) لوقف تشنج الجفن فوراً.',
      'غسيل العين بـ 500 مل من المحلول الملحي المعقم مع الشفط المستمر لمنع تناثر قطرات الماء في الكابينة.'
    ],
    simplifiedExplanationAr: 'في الفضاء تتطاير كل ذرات الغبار والشظايا في الهواء ولا تستقر على الأرض. إذا دخل جسم في عينك: إياك أن تفركها! ضع قطرة التخدير الموضعي أولاً لتسكين الألم، ثم اغسل عينك بالمحلول الملحي باستخدام قناع الغسيل المغلق الذي يشفط الماء ولا يتركه يطفو في المقصورة.',
    simplifiedExplanationEn: 'Dust and micro-debris float forever in zero gravity. If something gets in your eye: NEVER rub it! Instill numbing drops, then use the sealed suction eye-wash cup to flush out the debris without water droplets floating around the cabin.',
    dosageTableAr: [
      'بروباراكائين (Proparacaine 0.5%): قطرة إلى قطرتين موضعياً في العين لتخدير القرنية في 30 ثانية',
      'محلول ملحي معقم (0.9% Normal Saline): 500 إلى 1000 مل للغسيل المتواصل',
      'إريثرومايسين مرهم عيني (Erythromycin Ointment): خط 1 سم داخل الجفن السفلي كل 6 ساعات لمنع العدوى'
    ],
    dosageTableEn: [
      'Proparacaine 0.5% ophthalmic: 1-2 drops for immediate corneal anesthesia',
      '0.9% sterile normal saline: 500-1000 mL continuous closed irrigation',
      'Erythromycin 0.5% ophthalmic ointment: apply ribbon q6h to prevent bacterial keratitis'
    ],
    troubleshootingAr: [
      'إذا استمرت الشظية ملتصقة بالقرنية: استخدم شريط صبغة الفلوريسين (Fluorescein Strip) مع الضوء الأزرق لتحديد مكان الخدش واستخدم ممسحة قطنية رطبة برفق.',
      'إذا تناثرت قطرات غسيل العين في المقصورة: استخدم شفاط الطوارئ المحمول فوراً لجمع قطرات السائل قبل وصولها للوحات التحكم.'
    ],
    troubleshootingEn: [
      'If foreign body remains adhered: Apply Fluorescein stain with cobalt blue light, then gently tease with moist cotton swab.',
      'If irrigation fluid escapes into cabin air: Engage portable HEPA wet vacuum immediately to capture droplets.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Instill 1 drop Proparacaine 0.5% onto lower conjunctival fornix.',
        actionAr: 'ضع قطرة واحدة من مخدر Proparacaine في الجفن السفلي.',
      },
      {
        step: 2,
        action: 'Affix Morgan Lens or closed suction irrigation eyecup over operative eye.',
        actionAr: 'ثبت عدسة مورغان أو قناع الغسيل المغلق فوق العين المصابة.',
      },
      {
        step: 3,
        action: 'Perfuse 500 mL sterile saline steadily while suction line extracts waste effluent.',
        actionAr: 'اضخ 500 مل من المحلول الملحي مع تشغيل خط الشفط لسحب السوائل المستهلكة.',
      }
    ],
    equipmentNeeded: ['Morgan Lens Closed Irrigation Kit', 'Proparacaine 0.5% Drops', 'Fluorescein Diagnostic Strips', 'Portable Wet Suction Aspirator'],
    equipmentNeededAr: ['طقم غسيل العين المغلق Morgan Lens', 'قطرة التخدير الموضعي Proparacaine', 'شرائط الفلوريسين التشخيصية', 'شفاط سوائل محمول'],
    nasaSourceDocument: 'NASA Flight Surgeon Clinical Practice Guideline — Corneal Abrasion & Chemical Splash in Space'
  },

  // 7. Tension Pneumothorax
  {
    id: 'nasa-med-thor-07',
    code: 'NASA-MED-THOR-07',
    title: 'Tension Pneumothorax Needle Thoracostomy & Chest Drainage',
    titleAr: 'استرواح الصدر الضاغط وإفراغ الهواء بالإبرة الصدرية',
    severity: 'CRITICAL',
    category: 'pneumothorax',
    symptoms: [
      'Rapidly worsening dyspnea and cyanosis following blunt trauma or decompression',
      'Absent unilateral breath sounds on affected hemithorax',
      'Tracheal deviation away from affected side and neck vein engorgement',
      'Severe hypotension (Systolic BP < 80 mmHg) and tachycardia'
    ],
    symptomsAr: [
      'ضيق تنفس متسارع وازرقاق في الشفاه عقب ارتطام قوي أو انخفاض ضغط',
      'انعدام كامل لأصوات التنفس في إحدى الرئتين عند الفحص بالسماعة',
      'انحراف القصبة الهوائية بعيداً عن الجانب المصاب مع انتفاخ أوردة الرقبة',
      'هبوط حاد في ضغط الدم (الانقباضي أقل من 80) مع تسارع نبضات القلب'
    ],
    immediateActionTimerSeconds: 60,
    immediateActions: [
      'IMMEDIATE NEEDLE DECOMPRESSION: Insert 14-gauge catheter into 2nd intercostal space mid-clavicular line.',
      'Listen for sudden audible hissing sound of escaping pressurized air.',
      'Attach Heimlich one-way flutter valve to prevent re-entry of ambient air.',
      'Place on 100% High-Flow Oxygen via bag-valve mask.'
    ],
    immediateActionsAr: [
      'إفراغ الصدر بالإبرة فوراً: إدخال قسطرة قياس 14 في الفراغ الضلعي الثاني على خط منتصف الترقوة.',
      'سماع صوت اندفاع الهواء المحبوس بوضوح عند اختراق القفص الصدري.',
      'توصيل صمام هيمليش (Heimlich Valve) ذو الاتجاه الواحد لمنع رجوع الهواء للصدر.',
      'إعطاء أكسجين نقي 100% عبر قناع عالي التدفق.'
    ],
    simplifiedExplanationAr: 'هذا ضغط هواء هائل انحبس داخل القفص الصدري ويضغط على القلب حتى يوقفه عن النبض تماماً. المريض سيموت خلال دقائق إن لم تفرغ الهواء. الحل: خذ إبرة القسطرة الصدرية الكبيرة، واغرسها تحت عظم الترقوة بين الضلعين الثاني والثالث حتى تسمع صوت فحيح الهواء يخرج كإطار سيارة مثقوب. ستعود دقات قلبه طبيعية فوراً.',
    simplifiedExplanationEn: 'Trapped air inside the chest is crushing the heart and lungs. The astronaut will die within minutes without decompression. Insert the large 14-gauge decompression needle directly into the 2nd intercostal space just below the collarbone until you hear the hiss of escaping air.',
    dosageTableAr: [
      'أكسجين نقي 100% بتدفق أقصى (15 لتر/دقيقة)',
      'سيفازولين (Cefazolin) 1 غرام وريدياً كل 8 ساعات لمنع عدوى الغشاء البلوري (Empyema)',
      'مورفين أو فينتانيل (Fentanyl 50 mcg) لتسكين الألم بعد استقرار ضغط الدم'
    ],
    dosageTableEn: [
      '100% O2 high flow at 15 L/min',
      'Cefazolin 1 g IV q8h antibiotic prophylaxis for pleural space penetration',
      'Fentanyl 50 mcg IV/buccal for post-procedure analgesia once BP stabilizes'
    ],
    troubleshootingAr: [
      'إذا لم يخرج هواء وظل المريض مخنوقاً: كرر المحاولة في الفراغ الضلعي الخامس على خط منتصف الإبط (5th ICS Mid-Axillary Line).',
      'إذا انسدت الإبرة بالدم أو الأنسجة: اسحب القسطرة وضع إبرة جديدة مع شق صغير بالمشرط.'
    ],
    troubleshootingEn: [
      'If no hiss heard and patient remains in arrest: Re-attempt decompression at 5th intercostal space anterior axillary line.',
      'If catheter kinks or clogs with tissue: Re-insert a fresh 14G needle-catheter adjacent to puncture site.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Locate 2nd intercostal space, mid-clavicular line on the affected side.',
        actionAr: 'حدد الفراغ بين الضلعين الثاني والثالث على خط منتصف عظم الترقوة.',
      },
      {
        step: 2,
        action: 'Insert 14G angiocatheter over the superior border of the 3rd rib to avoid neurovascular bundle.',
        actionAr: 'أدخل إبرة القسطرة بمحاذاة الحافة العلوية للضلع الثالث لتفادي الشرايين والأعصاب.',
        warning: 'Inserting along inferior rib margin risks lacerating the intercostal artery causing massive hemothorax.',
        warningAr: 'إدخال الإبرة بمحاذاة الحافة السفلية للضلع يمزق الشريان الوربي مسبباً نزيفاً داخلياً مميتاً.'
      },
      {
        step: 3,
        action: 'Remove needle, leave flexible cannula, and attach Heimlich flutter valve.',
        actionAr: 'اسحب الإبرة المعدنية واترك القسطرة المرنة، ثم ركب صمام هيمليش لمنع دخول الهواء ثانية.',
      }
    ],
    equipmentNeeded: ['14-Gauge Decompression Needle (ARS / TyTek)', 'Heimlich One-Way Flutter Valve', 'ChloraPrep Antiseptic Swab', 'Adhesive Chest Seal'],
    equipmentNeededAr: ['إبرة فك ضغط الصدر قياس 14G', 'صمام هيمليش باتجاه واحد', 'مسحة مطهرة ChloraPrep', 'لصقة إغلاق الصدر الطبية'],
    nasaSourceDocument: 'NASA Operational Medicine — Thoracic Trauma Management in Long Duration Exploration Missions'
  },

  // 8. Cabin Fire
  {
    id: 'nasa-eclss-fire-08',
    code: 'NASA-ECLSS-FIRE-08',
    title: 'In-Cabin Fire Suppression & Toxic Smoke Scrubbing',
    titleAr: 'إخماد حرائق المقصورة وتصفية الدخان السام في الفضاء',
    severity: 'CRITICAL',
    category: 'fire_smoke',
    symptoms: [
      'Optical smoke obscuration detectors triggered across multiple modules',
      'Acrid electrical ozone smell or visible spherical smoldering flame',
      'Sudden cabin Carbon Monoxide (CO) sensor spike > 50 ppm'
    ],
    symptomsAr: [
      'انطلاق صفارات كواشف الدخان الضوئية في عدة مقصورات',
      'رائحة أسلاك كهربائية محترقة أو ظهور لهب كروي طافٍ عديم الحمل الحراري',
      'ارتفاع حاد في قراءة مجس أول أكسيد الكربون CO فوق 50 جزء بالمليون'
    ],
    immediateActionTimerSeconds: 60,
    immediateActions: [
      'DON PBA OXYGEN MASKS IMMEDIATELY. Smoke contains lethal hydrogen cyanide and carbon monoxide.',
      'Depower affected electrical bus and shut down Inter-Module Ventilation (IMV) fans.',
      'Discharge Fine Water-Mist or CO2 Fire Extinguisher directly into access maintenance port.',
      'Egress to isolated module and initiate TCCS smoke scrubbing.'
    ],
    immediateActionsAr: [
      'ارتداء أقنعة التنفس PBA فوراً! دخان الفضاء يحتوي على سيانيد الهيدروجين وأول أكسيد الكربون القاتل.',
      'قطع التيار الكهربائي عن الدائرة المحترقة وإيقاف مراوح تدوير الهواء بين الوحدات IMV لمنع انتشار الدخان.',
      'تفريغ مطفأة الرذاذ المائي الدقيق أو غاز ثاني أكسيد الكربون في فتحات الصيانة المخصصة.',
      'الانسحاب إلى وحدة مجاورة وإغلاق الفوهة وتشغيل نظام تصفية الدخان TCCS.'
    ],
    simplifiedExplanationAr: 'النار في الفضاء لا تشتعل لأعلى بل تكون على شكل كرة لهب زرقاء هادئة تنتج غازات سامة مميتة بسرعة هائلة. ارتدِ قناع الأكسجين في ثوانٍ، وافصل الكهرباء عن اللوحة المحترقة، وفرغ المطفأة في فتحة الصيانة المخصصة، واهرب للمقصورة المجاورة واقفل الباب بإحكام.',
    simplifiedExplanationEn: 'Flames in microgravity burn as spherical, slow blue domes producing deadly carbon monoxide and cyanide without draft. Don oxygen masks instantly, switch off module power, discharge the extinguisher into the fire port, and seal the hatch.',
    dosageTableAr: [
      'أكسجين نقي 100% بضغط إيجابي لطرد أول أكسيد الكربون من الهيموغلوبين (نصف عمر CO ينخفض من 320 دقيقة إلى 80 دقيقة)',
      'هيدروكسوكوبالامين (Hydroxocobalamin - Cyanokit): 5 غرام وريدياً على مدى 15 دقيقة في حال الاشتباه بتسمم السيانيد من حرق البلاستيك',
      'موسعات الشعب الهوائية بالرذاذ لتخفيف تشنج القصبات الناتج عن استنشاق الدخان'
    ],
    dosageTableEn: [
      '100% positive pressure O2 to accelerate carboxyhemoglobin dissociation',
      'Hydroxocobalamin (Cyanokit) 5 g IV over 15 min for presumptive cyanide poisoning',
      'Inhaled bronchodilators (Albuterol/Ipratropium) for smoke inhalation bronchospasm'
    ],
    troubleshootingAr: [
      'إذا تعذر فتح منفذ الإطفاء بالجدار: وجه فوهة المطفأة نحو مسار الدخان وافرغها على دفعات قصيرة.',
      'إذا نفدت مطفأة CO2: استخدم مطفأة الرذاذ المائي الدقيق (Water Mist Extinguisher) المعتمدة للحرائق الكهربائية.'
    ],
    troubleshootingEn: [
      'If wall fire port is jammed: Discharge extinguisher in short bursts directly at the ventilation return grill.',
      'If primary CO2 extinguisher depletes: Deploy backup Fine Water Mist extinguisher rated for avionics.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Don Personal Breathing Apparatus (PBA). Check regulator green flow flag.',
        actionAr: 'ارتدِ جهاز التنفس المحمول PBA وتأكد من علامة تدفق الأكسجين الخضراء.',
      },
      {
        step: 2,
        action: 'Execute Emergency Power Cut on the affected avionics rack.',
        actionAr: 'اضغط زر قطع الطاقة الكهربائية الطارئ عن منصة الأجهزة المتضررة.',
      },
      {
        step: 3,
        action: 'Insert extinguisher nozzle into rack maintenance port and discharge for full duration.',
        actionAr: 'أدخل فوهة المطفأة في فتحة الصيانة وفرغ محتوياتها بالكامل دون فتح الواجهة.',
      }
    ],
    equipmentNeeded: ['Portable Breathing Apparatus (PBA)', 'Fine Water-Mist Fire Extinguisher', 'CO2 Fire Extinguisher', 'Hydroxocobalamin Cyanokit'],
    equipmentNeededAr: ['جهاز التنفس المحمول PBA', 'مطفأة الرذاذ المائي الدقيق', 'مطفأة ثاني أكسيد الكربون المدارية', 'طقم ترياق السيانيد Cyanokit'],
    nasaSourceDocument: 'NASA Emergency Operations Handbook — Station Fire Detection and Suppression Procedures'
  },

  // 9. Extremity Fracture
  {
    id: 'nasa-med-fx-09',
    code: 'NASA-MED-FX-09',
    title: 'Extremity Fracture & Microgravity Vacuum Splinting',
    titleAr: 'كسور العظام والتثبيت بالجبائر الهوائية في الفضاء',
    severity: 'WARNING',
    category: 'fracture',
    symptoms: [
      'Visible angular bone deformity after EVA impact or ARED cable snap',
      'Severe localized pain, crepitus, and swelling',
      'Weak or absent distal pulse in affected foot/wrist'
    ],
    symptomsAr: [
      'تشوه ظاهر في استقامة العظم بعد ارتطام في السير الفضائي أو انقطاع كابل جهاز ARED',
      'ألم حاد وتورم وصوت طقطقة عظمية عند أدنى حركة',
      'ضعف أو انعدام النبض الشرياني في أطراف اليد أو القدم المصابة'
    ],
    immediateActionTimerSeconds: 600,
    immediateActions: [
      'Immobilize the limb immediately with SAM splint or Vacuum Immobilizer.',
      'Assess Distal Neurovascular Status: Check radial/pedal pulse, capillary refill (<2s), and sensation.',
      'Administer analgesia (Fentanyl 50 mcg buccal lozenge or Acetaminophen/Codeine).',
      'Secure limb to crew quarters bulkhead with padded velcro strap to prevent floating collisions.'
    ],
    immediateActionsAr: [
      'تثبيت الطرف المصاب فوراً بجبيرة SAM القابلة للتشكيل أو الجبيرة المفرغة من الهواء.',
      'فحص التروية الدموية الطرفية: فحص النبض، وسرعة عودة الدم للشعيرات (< ثانيتين)، والإحساس.',
      'إعطاء المسكنات الطبية المعتمدة (Fentanyl تحت اللسان أو المسكنات الفموية القوية).',
      'تثبيت الطرف المصاب بشريط فيلكرو مبطن إلى جدار المقصورة لمنع ارتطامه أثناء الطفو.'
    ],
    simplifiedExplanationAr: 'في انعدام الوزن، يطفو الطرف المكسور بحرية مما يهدد بتمزق الشرايين حول العظم المكسور. ثبت الطرف فوراً بالجبيرة المرنة ولفها برباط ضاغط، وتأكد من أن أصابع اليد أو القدم دافئة والدم يدور فيها بشكل طبيعي.',
    simplifiedExplanationEn: 'In zero gravity, a broken arm or leg will float loosely, slicing nearby arteries with sharp bone edges. Immobilize the limb immediately with a rigid SAM splint, bandage firmly, and verify pulse in the fingers or toes.',
    dosageTableAr: [
      'فينتانيل (Fentanyl) 50 إلى 100 ميكروغرام قرص تحت اللسان لتسكين الألم الحاد',
      'سيفازولين (Cefazolin) 2 غرام وريدياً في حال كان الكسر مضاعفاً ومفتوحاً للجلد',
      'إيبوبروفين 600 ملغ فموياً كل 8 ساعات لتخفيف الالتهاب والتورم'
    ],
    dosageTableEn: [
      'Fentanyl buccal lozenge 50-100 mcg for acute fracture reduction analgesia',
      'Cefazolin 2 g IV if open compound fracture present',
      'Ibuprofen 600 mg PO q8h for tissue swelling'
    ],
    troubleshootingAr: [
      'إذا اختفى النبض في القدم بعد التثبيت: فك الرباط الضاغط فوراً، فقد يكون مشدوداً بشكل مفرط يمنع تدفق الدم.',
      'إذا لم تتوفر جبيرة SAM: استخدم كتاباً أو لوحاً بلاستيكياً مبطناً بملابس قطنية ولفه بإحكام.'
    ],
    troubleshootingEn: [
      'If distal pulse disappears: Immediately loosen Coban wrap to rule out iatrogenic arterial occlusion.',
      'If SAM splint unavailable: Improvise rigid support using plastic flight manual covers wrapped in cotton towels.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Form SAM Splint into rigid C-curve along posterior aspect of fractured extremity.',
        actionAr: 'شكّل جبيرة SAM على هيئة منحنى داعم خلف الطرف المكسور.',
      },
      {
        step: 2,
        action: 'Wrap firmly with self-adherent Coban elastic bandage from distal to proximal.',
        actionAr: 'لف الضمادة المرنة اللاصقة Coban بإحكام من الأطراف متجهاً للأعلى.',
      },
      {
        step: 3,
        action: 'Re-verify capillary refill and warmth every 30 minutes to prevent compartment syndrome.',
        actionAr: 'أعد فحص دفء الأصابع وسرعة دوران الدم كل 30 دقيقة لتجنب انضغاط الشرايين.',
      }
    ],
    equipmentNeeded: ['SAM Splint Universal Kit', 'Coban Elastic Bandages', 'Fentanyl Buccal Lozenges', 'Pulse Oximeter Finger Probe'],
    equipmentNeededAr: ['جبيرة SAM الطبية متعددة التشكيل', 'ضمادات ضاغطة Coban', 'أقراص مسكنة قوية Fentanyl', 'مقياس نبض الأصابع'],
    nasaSourceDocument: 'NASA Emergency Medical Checklist — Extremity Trauma & Splinting SSP-50260'
  },

  // 10. Spacesuit Puncture (EVA)
  {
    id: 'nasa-eva-suit-10',
    code: 'NASA-EVA-SUIT-10',
    title: 'Spacesuit (EMU/Orion) Puncture & Rapid Oxygen Depletion',
    titleAr: 'ثقب بدلة الفضاء أثناء السير الخارجي وهبوط مخزون الأكسجين',
    severity: 'CRITICAL',
    category: 'eva_suit',
    symptoms: [
      'Hissing sound and sudden pressure drop warning in spacesuit helmet display (< 3.8 psid)',
      'High O2 flow rate warning (> 3.5 lbs/hr) as suit attempts to compensate for puncture',
      'Rapid ear pain and hypoxia tingling in fingers'
    ],
    symptomsAr: [
      'صوت فحيح هواء مفاجئ مع انطلاق إنذار هبوط ضغط البدلة في خوذة الرائد (< 3.8 رطل/بوصة)',
      'استهلاك أقصى للأكسجين للتعويض عن التسريب مع انخفاض سريع في احتياطي الطوارئ',
      'ألم حاد في الأذنين مع خدر ونقص تأكسج في أطراف الأصابع'
    ],
    immediateActionTimerSeconds: 45,
    immediateActions: [
      'ACTIVATE EMERGENCY OXYGEN PACK (SOP) IMMEDIATELY: Pull red Secondary Oxygen toggle.',
      'LOCATE AND PLUG THE LEAK: Cover puncture with gloved palm or apply Self-Adhesive Emergency Suit Patch.',
      'ABORT EVA IMMEDIATELY: Translate along safety tether directly to Equipment Airlock.',
      'Begin rapid airlock repressurization once both crewmembers are inside.'
    ],
    immediateActionsAr: [
      'تفعيل حزمة أكسجين الطوارئ الثانوية (SOP) فوراً بسحب المقبض الأحمر.',
      'تحديد موقع الثقب وسده براحة القفاز أو لصق رقعة الطوارئ ذاتية الالتصاق فوراً.',
      'إلغاء السير الفضائي والعودة الفورية على طول حبل الأمان نحو حجرة قفل الهواء (Airlock).',
      'بدء إعادة ضغط حجرة الهواء بأقصى سرعة فور دخول الرائدين.'
    ],
    simplifiedExplanationAr: 'إذا حدث ثقب في بدلتك خارج المحطة: اسحب المقبض الأحمر لحزمة الأكسجين الاحتياطية فوراً، واضغط بيدك فوق مكان الثقب لسده، وعُد فوراً إلى حجرة قفل الهواء قبل نفاد الأكسجين.',
    simplifiedExplanationEn: 'If your spacesuit punctures during a spacewalk: Pull the red SOP oxygen handle immediately, slap your gloved palm or emergency patch over the hole to slow the leak, and translate along your safety tether back to the airlock.',
    dosageTableAr: [
      'أكسجين نقي 100% مستمر بمعدل ضغط إيجابي 4.3 رطل/بوصة مربعة حتى إعادة ضغط الكابينة',
      'مسكنات أذن فموية لتخفيف الرضح الضغطي (Barotrauma) بعد دخول المحطة'
    ],
    dosageTableEn: [
      '100% O2 continuous at 4.3 psid until full airlock repressurization',
      'Oral analgesia for barotitis media post-repressurization'
    ],
    troubleshootingAr: [
      'إذا تعذر الوصول لرقعة البدلة: استخدم راحة قفازك واضغط بقوة على موضع التسريب أثناء السير على حبل الأمان.',
      'إذا علق حبل الأمان: اقطع الحبل باستخدام مقص الطوارئ واعتمد على الدفع الذاتي لحقيبة الظهر SAFER.'
    ],
    troubleshootingEn: [
      'If suit patch is unreachable: Firmly press palm of EVA glove directly against puncture.',
      'If tether jams: Cut tether with safety shears and navigate to hatch using SAFER jetpack.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Pull SOP Secondary Oxygen Pack actuation lever.',
        actionAr: 'اسحب ذراع تشغيل حزمة أكسجين الطوارئ SOP.',
      },
      {
        step: 2,
        action: 'Apply EMU Emergency Pressure Seal Patch over micrometeoroid breach.',
        actionAr: 'الصق رقعة الضغط المعتمدة فوق موضع اختراق النيزك الدقيق.',
      },
      {
        step: 3,
        action: 'Ingress airlock, dog hatch, and initiate Emergency Repress to 14.7 psi.',
        actionAr: 'ادخل حجرة الضغط، وأغلق الباب واضغط زر إعادة الضغط الطارئ.',
      }
    ],
    equipmentNeeded: ['EMU Suit Repair Patch Kit', 'Secondary Oxygen Pack (SOP)', 'SAFER Propulsion Pack', 'Tether Shears'],
    equipmentNeededAr: ['طقم رقع بدلة الفضاء', 'حزمة أكسجين الطوارئ SOP', 'وحدة الدفع النفاثة SAFER', 'مقص قطع حبال الأمان'],
    nasaSourceDocument: 'NASA EVA Operations Handbook — Emergency Response to Suit Depressurization Rev. 14'
  },

  // 11. Suspected Appendicitis
  {
    id: 'nasa-med-app-11',
    code: 'NASA-MED-APP-11',
    title: 'Suspected Acute Appendicitis in Deep Space Transit',
    titleAr: 'الاشتباه في التهاب الزائدة الدودية الحاد في رحلات الفضاء البعيدة',
    severity: 'WARNING',
    category: 'appendicitis',
    symptoms: [
      'Progressive right lower quadrant (RLQ) abdominal pain with tenderness at McBurney point',
      'Rebound tenderness, guarding, and low-grade fever (> 38.0°C)',
      'Anorexia, nausea, and vomiting exacerbated by microgravity fluid shift'
    ],
    symptomsAr: [
      'ألم بطني متزايد في الجانب الأيمن السفلي (نقطة ماكبورني)',
      'ألم ارتدادي وتصلب في جدار البطن مع حمى خفيفة (> 38 مئوية)',
      'فقدان تام للشهية مع غثيان وقيء متكرر'
    ],
    immediateActionTimerSeconds: 1800,
    immediateActions: [
      'Confirm diagnosis via Ultrasound (Ultrasound 2 on ISS/Deep Space Gateway): Measure appendix diameter (> 6 mm).',
      'Initiate Non-Operative Conservative Antibiotic Management Protocol immediately.',
      'Make patient strictly NPO (nothing by mouth) and establish IV fluid resuscitation.',
      'Administer broad-spectrum IV antibiotics covering enteric gram-negatives and anaerobes.'
    ],
    immediateActionsAr: [
      'تأكيد التشخيص بجهاز الموجات فوق الصوتية المداري (فحص قطر الزائدة > 6 ملم).',
      'بدء بروتوكول العلاج التحفظي بالمضادات الحيوية الفضائية المعتمدة دون جراحة.',
      'منع المريض تماماً من تناول أي طعام أو شراب فموياً والاعتماد على المحاليل الوريدية.',
      'إعطاء مضادات حيوية وريدية واسعة النطاق للقضاء على بكتيريا الأمعاء اللاهوائية.'
    ],
    simplifiedExplanationAr: 'إذا أصيب رائد فضاء بالتهاب الزائدة الدودية وهو في طريقه للمريخ حيث لا توجد غرفة عمليات: نبدأ فوراً بروتوكول المضادات الحيوية الوريدية القوية والمحاليل مع منع الطعام تماماً. أثبتت الدراسات أن 80% من الحالات تشفى تماماً بدون جراحة.',
    simplifiedExplanationEn: 'If an astronaut develops acute appendicitis en route to Mars where surgery is impossible: We initiate intensive broad-spectrum IV antibiotics and IV hydration while keeping them strictly fasting. Most cases resolve conservatively without operating.',
    dosageTableAr: [
      'سيفترياكسون (Ceftriaxone) 2 غرام وريدياً كل 24 ساعة',
      'ميترونيدازول (Metronidazole) 500 ملغ وريدياً كل 8 ساعات لتغطية البكتيريا اللاهوائية',
      'محلول ملحي وريدي (Normal Saline): 2000 مل يومياً لتعويض السوائل ومنع الجفاف'
    ],
    dosageTableEn: [
      'Ceftriaxone 2 g IV q24h',
      'Metronidazole 500 mg IV q8h for enteric anaerobes',
      'Normal Saline IV 2000 mL/24h continuous hydration'
    ],
    troubleshootingAr: [
      'إذا ظهرت علامات الانفجار البريتوني (Peritonitis) وتصلب البطن كالخشب: استشر طبيب الرحلة عبر PMC لتحضير طقم الجراحة المدارية الطارئ المصغر (Minor Surgical Kit).'
    ],
    troubleshootingEn: [
      'If signs of frank rupture occur (rigid board-like abdomen): Prepare Exploration Minor Surgical Kit under Flight Surgeon tele-guidance.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Deploy Ultrasound 2 probe to scan right iliac fossa for non-compressible tubular structure.',
        actionAr: 'استخدم مجس السونار لفحص الحفرة الحرقفية اليمنى والبحث عن التورم الاسطواني.',
      },
      {
        step: 2,
        action: 'Insert 18G peripheral IV cannula and hang 1000 mL Saline bag with infusion pump.',
        actionAr: 'ركب قسطرة وريدية 18G وابدأ ضخ 1000 مل محلول ملحي بمضخة الحقن.',
      },
      {
        step: 3,
        action: 'Infuse Ceftriaxone 2g IV over 30 minutes, followed by Metronidazole 500mg IV.',
        actionAr: 'احقن السيفترياكسون وريدياً ببطء متبوعاً بالميترونيدازول.',
      }
    ],
    equipmentNeeded: ['Ultrasound 2 Diagnostic System', 'IV Infusion Pump & Cannulas', 'Ceftriaxone & Metronidazole IV', 'Medical Restraint Bed'],
    equipmentNeededAr: ['جهاز الموجات فوق الصوتية المداري', 'مضخة المحاليل الوريدية', 'مضادات حيوية وريدية', 'سرير التثبيت الطبي'],
    nasaSourceDocument: 'NASA Exploration Medical Capability (ExMC) — Deep Space Clinical Decision Support: Appendicitis'
  },

  // 12. Hydrazine Exposure
  {
    id: 'nasa-tox-hyd-12',
    code: 'NASA-TOX-HYD-12',
    title: 'Toxic Hydrazine / Hypergolic Propellant Exposure',
    titleAr: 'تسمم وقود الهيدرازين ومحركات الدفع الصاروخية',
    severity: 'CRITICAL',
    category: 'hydrazine_tox',
    symptoms: [
      'Fishy, ammonia-like odor following docking thruster firing or EVA contact',
      'Severe burning skin erythema, blistering, and pulmonary edema upon inhalation',
      'Tremors, seizures, and severe central nervous system neurotoxicity'
    ],
    symptomsAr: [
      'رائحة سمكية تشبه النشادر عقب التحام المركبة أو لمس أسطح المحركات الخارجية',
      'حروق كيميائية حادة وتقرحات بالجلد مع ضيق تنفس وتورم رئوي عند الاستنشاق',
      'رعشة وتشنجات عصبية حادة وتسمم في الجهاز العصبي المركزي'
    ],
    immediateActionTimerSeconds: 60,
    immediateActions: [
      'DON PBA OXYGEN MASK IMMEDIATELY. Hydrazine vapor is lethal and highly carcinogenic.',
      'Decontaminate skin immediately with copious sterile water rinse; wipe with wet decontamination towels.',
      'Administer Pyridoxine (Vitamin B6) IV immediately — this is the specific biochemical antidote!',
      'Bag and seal contaminated garments in airtight zip-lock bags to prevent outgassing into cabin air.'
    ],
    immediateActionsAr: [
      'ارتداء قناع التنفس المحمول فوراً! بخار الهيدرازين مميت وسام ومسرطن للغاية.',
      'إزالة التلوث عن الجلد فوراً بغسيل مائي غزير ومسحه بمناشف إزالة السموم المبللة.',
      'حقن البيريدوكسين (فيتامين B6) وريدياً فوراً — فهو الترياق الكيميائي النوعي للهيدرازين!',
      'عزل وتغليف الملابس الملوثة في أكياس محكمة الإغلاق لمنع تبخر الغاز في هواء المحطة.'
    ],
    simplifiedExplanationAr: 'وقود الصواريخ (الهيدرازين) سائل شديد السمية ورائحته مثل السمك المتعفن. إذا لامس جلدك أو استنشقته، ارتدِ قناع الأكسجين، واغسل جلدك بالماء، واحقن ترياق فيتامين B6 وريدياً فوراً لأنه يبطل مفعول السم في الدماغ.',
    simplifiedExplanationEn: 'Rocket thruster propellant (hydrazine) smells fishy and causes fatal seizures. Don oxygen masks, wash skin with water, and administer IV Pyridoxine (Vitamin B6) immediately—it is the direct chemical antidote for hydrazine poisoning.',
    dosageTableAr: [
      'بيريدوكسين (Pyridoxine - Vitamin B6): 25 ملغ/كغ وريدياً (أو 5 غرام جرعة أولية) لمنع التشنجات العصبية',
      'ديازيبام (Diazepam) 5 إلى 10 ملغ وريدياً إذا حدثت نوبات صرع مستمرة',
      'غسيل الجلد بالماء المعقم لمدة 15 دقيقة على الأقل'
    ],
    dosageTableEn: [
      'Pyridoxine (Vitamin B6) 25 mg/kg IV bolus (or 5 g empiric) as specific antidote',
      'Diazepam 5-10 mg IV for uncontrolled seizures',
      'Copious water skin irrigation for minimum 15 minutes'
    ],
    troubleshootingAr: [
      'إذا لم يتوفر خط وريدي: احقن فيتامين B6 بالعضل في الفخذ مع إعطاء مسكنات موضعية.'
    ],
    troubleshootingEn: [
      'If IV line unavailable: Administer Pyridoxine via deep IM injection in vastus lateralis.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Isolate contaminated astronaut in airlock before allowing ingress to living modules.',
        actionAr: 'اعزل رائد الفضاء في حجرة الهواء الخارجية قبل دخوله إلى وحدات المعيشة.',
      },
      {
        step: 2,
        action: 'Wipe down suit exterior with hydrazine detector badge to verify safe residue levels (< 0.1 ppm).',
        actionAr: 'افحص سطح البدلة بمجس كشف الهيدرازين للتأكد من زوال التلوث.',
      },
      {
        step: 3,
        action: 'Administer Pyridoxine antidote IV over 10 minutes.',
        actionAr: 'احقن ترياق البيريدوكسين وريدياً خلال 10 دقائق.',
      }
    ],
    equipmentNeeded: ['Hydrazine Detector Badge Kits', 'Pyridoxine (Vitamin B6) IV Vials', 'Decontamination Wet Packs', 'Sealed Hazardous Disposal Bags'],
    equipmentNeededAr: ['كواشف الهيدرازين الكيميائية', 'أمبولات فيتامين B6 الوريدية', 'مناشف إزالة التلوث الكيميائي', 'أكياس التخلص من النفايات الخطرة'],
    nasaSourceDocument: 'NASA Toxicology Group — Hypergolic Propellant Contamination Protocol SSP-50260'
  },

  // 13. Behavioral Crisis
  {
    id: 'nasa-med-psy-13',
    code: 'NASA-MED-PSY-13',
    title: 'Acute Spaceflight Behavioral Crisis & Sensory Deprivation Panic',
    titleAr: 'الأزمات النفسية والسلوكية الحادة ونوبات الهلع في العزلة المدارية',
    severity: 'WARNING',
    category: 'behavioral_psy',
    symptoms: [
      'Acute irrational panic, claustrophobia, or sudden attempt to open module hatches',
      'Severe disorientation, paranoid delusions, and refusal to follow Commander orders',
      'Uncontrolled agitation threatening mission safety or personal life support'
    ],
    symptomsAr: [
      'نوبة ذعر وهلع غير عقلانية أو محاولة مفاجئة للعبث بصمامات وبوابات المحطة',
      'أوهام ارتيابية واضطراب شديد في الإدراك ورفض الانصياع لأوامر قائد المهمة',
      'هياج حاد يهدد سلامة الطاقم أو أنظمة دعم الحياة'
    ],
    immediateActionTimerSeconds: 120,
    immediateActions: [
      'ENSURE PHYSICAL SAFETY: Assign two crewmembers to escort and physically restrain patient if necessary.',
      'De-escalate verbally with calm, low-tone communication; move patient to quiet sleep berth.',
      'Administer rapid anxiolytic/antipsychotic sedation under Flight Surgeon guidance.',
      'Secure all emergency hatch interlocks and manual depressurization valves.'
    ],
    immediateActionsAr: [
      'تأمين السلامة الفورية: تكليف اثنين من أفراد الطاقم بمرافقة المريض ومنعه بلطف من لمس أي لوحات تحكم.',
      'التهدئة اللفظية بنبرة هادئة ومطمئنة، ونقل المريض إلى مقصورة نوم هادئة ومعزولة عن الضوء والضوضاء.',
      'إعطاء المهدئات الطبية المعتمدة لتهدئة الجهاز العصبي المركزي وتسكين الهلع.',
      'إحكام قفل أجهزة فتح الأبواب اليدوية وصمامات تفريغ الهواء كإجراء وقائي.'
    ],
    simplifiedExplanationAr: 'العزلة والظلام في الفضاء قد يسببان صدمة نفسية مفاجئة أو هلعاً شديداً. لا تجادل المريض ولا تتركه وحيداً. اجلس بجانبه، وتحدث معه بهدوء، وأعطه الدواء المهدئ المعتمد وضعه في كيس نومه المظلم حتى يهدأ وينام.',
    simplifiedExplanationEn: 'Severe isolation and sensory deprivation can trigger acute panic or paranoia. Never leave the crewmember alone. Talk calmly, guide them into a dark, quiet sleep berth, and administer approved calming medications.',
    dosageTableAr: [
      'لورازيبام (Lorazepam) 1 إلى 2 ملغ تحت اللسان أو فموياً للتهدئة السريعة',
      'هالوبيريدول (Haloperidol) 2.5 إلى 5 ملغ عضلياً في حال الهياج الحاد غير المستجيب للمهدئات البسيطة',
      'أولانزابين (Olanzapine) 5 ملغ قرص سريع الذوبان في الفم'
    ],
    dosageTableEn: [
      'Lorazepam 1-2 mg sublingual or PO for acute panic',
      'Haloperidol 2.5-5 mg IM for severe behavioral agitation',
      'Olanzapine 5 mg orally disintegrating tablet (ODT)'
    ],
    troubleshootingAr: [
      'إذا رفض المريض ابتلاع الدواء: استخدم رذاذ الميدازولام الأنفي (Midazolam Nasal Spray 5 mg) الذي يمتص في ثوانٍ دون الحاجة لابتلاع أقراص.'
    ],
    troubleshootingEn: [
      'If oral medication is refused: Administer Intranasal Midazolam (5 mg atomizer) for rapid needle-free sedation.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Guide patient gently into Crew Quarters (CQ). Dim lights to zero and provide noise-cancelling headphones.',
        actionAr: 'وجه المريض برفق إلى مقصورة النوم CQ، واطفئ الأضواء تماماً وزوده بسماعات حجب الضجيج.',
      },
      {
        step: 2,
        action: 'Administer Lorazepam 1mg sublingual. Monitor respiratory rate every 15 min.',
        actionAr: 'ضع قرص اللورازيبام تحت لسانه وراقب معدل تنفسه كل 15 دقيقة.',
      },
      {
        step: 3,
        action: 'Establish Private Psychological Conference (PPC) with terrestrial flight psychiatrist.',
        actionAr: 'افتح قناة اتصال نفسية خاصة ومحمية مع الطبيب النفسي الأرضي.',
      }
    ],
    equipmentNeeded: ['Lorazepam Sublingual Tablets', 'Intranasal Midazolam Atomizer', 'Soft Padded Restraint Wraps', 'Noise-Cancelling Headsets'],
    equipmentNeededAr: ['أقراص لورازيبام تحت اللسان', 'بخاخ ميدازولام الأنفي', 'أربطة تثبيت قطنية مبطنة', 'سماعات عازلة للضوضاء'],
    nasaSourceDocument: 'NASA Behavioral Health & Performance (BHP) — Management of In-Flight Behavioral Emergencies'
  },

  // 14. Dental Pulpitis
  {
    id: 'nasa-med-dent-14',
    code: 'NASA-MED-DENT-14',
    title: 'Acute Dental Pulpitis & Barodontalgia Emergency Treatment',
    titleAr: 'ألم الأسنان الحاد والرضح الجوي وتسكين عصب الأسنان في المدار',
    severity: 'ADVISORY',
    category: 'dental_pulpitis',
    symptoms: [
      'Excruciating throbbing dental pain triggered by microgravity pressure changes (Barodontalgia)',
      'Severe sensitivity to temperature, localized gingival edema, or lost dental restoration/crown',
      'Inability to eat, sleep, or wear EVA communication cap due to jaw agony'
    ],
    symptomsAr: [
      'ألم نابض لا يحتمل في الضرس يزداد مع تغيرات ضغط الهواء في الكابينة (Barodontalgia)',
      'حساسية مفرطة للمس والحرارة وتورم في اللثة أو سقوط حشوة سن قديمة',
      'عدم القدرة على النوم أو الأكل أو ارتداء قبعة الاتصال الفضائية من شدة الألم'
    ],
    immediateActionTimerSeconds: 1800,
    immediateActions: [
      'Examine oral cavity using Dental Mirror and Zero-G Headlamp.',
      'Apply Cavit temporary filling paste over exposed dentin/pulp if filling was dislodged.',
      'Perform Local Infiltration Anesthesia (Lidocaine 2% with Epinephrine) for complete nerve block.',
      'Start oral antibiotics and analgesics to prevent deep facial space abscess.'
    ],
    immediateActionsAr: [
      'فحص الفم باستخدام مرآة الأسنان والمصباح الرأسي المداري.',
      'وضع معجون الحشو المؤقت Cavit فوق العصب المكشوف في حال سقوط الحشوة.',
      'حقن مخدر موضعي (Lidocaine 2% مع الإبينفرين) لتخدير عصب الفك ووقف الألم فوراً.',
      'بدء المضادات الحيوية الفموية والمسكنات القوية لمنع تكون خراج في الفك.'
    ],
    simplifiedExplanationAr: 'تغير الضغط الجوي في الفضاء قد يسبب تمدد جيوب الهواء الدقيقة المحبوسة تحت حشوات الأسنان مما يسبب ألماً مبرحاً. الحل: تنظيف الفجوة السنية، ووضع معجون الحشو المؤقت Cavit لتغطية العصب، واستخدام المخدر الموضعي لتسكين الألم.',
    simplifiedExplanationEn: 'Air trapped under tooth fillings expands during spaceflight pressure shifts, triggering excruciating barodontalgia. Clean the tooth cavity, seal the exposed nerve with Cavit temporary filling material, and administer dental local anesthesia.',
    dosageTableAr: [
      'ليدوكائين (Lidocaine 2% مع Epinephrine 1:100,000): 1.8 مل حقن موضعي بجانب جذر السن',
      'أموكسيسيلين/كلافولانات (Augmentin) 875 ملغ فموياً كل 12 ساعة لمدة 7 أيام',
      'إيبوبروفين 800 ملغ مع باراسيتامول 1000 ملغ لتسكين الألم العصبي'
    ],
    dosageTableEn: [
      'Lidocaine 2% with 1:100k Epinephrine: 1.8 mL infiltration',
      'Amoxicillin/Clavulanate 875 mg PO q12h for 7 days',
      'Ibuprofen 800 mg + Acetaminophen 1000 mg combination analgesia'
    ],
    troubleshootingAr: [
      'إذا لم تتمكن من حقن المخدر بالإبرة: استخدم قطنة مبللة بزيت القرنفل (Eugenol) وضعها مباشرة داخل تجويف السن لتخدير العصب طبيعياً.'
    ],
    troubleshootingEn: [
      'If injection fails: Place a sterile cotton pellet soaked in Eugenol (Clove Oil) directly into the cavity.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Dry tooth surface using sterile cotton roll under portable suction.',
        actionAr: 'جفف سطح الضرس بقطنة معقمة تحت الشفط المداري لمنع وصول اللعاب.',
      },
      {
        step: 2,
        action: 'Fill cavity flush with Cavit zinc-oxide filling material using dental spatula.',
        actionAr: 'املأ التجويف بمعجون Cavit وسوّه بملوق الأسنان ليجف مع لعاب الفم.',
      },
      {
        step: 3,
        action: 'Check dental occlusion to ensure patient does not bite prematurely on filling.',
        actionAr: 'تأكد من إطباق الفكين بشكل متساوٍ دون ضغط زائد على الحشوة المؤقتة.',
      }
    ],
    equipmentNeeded: ['Crew Dental Kit', 'Cavit Temporary Filling', 'Dental Syringe & Lidocaine Cartridges', 'Eugenol Drops'],
    equipmentNeededAr: ['طقم طب الأسنان المداري', 'معجون الحشو المؤقت Cavit', 'حقنة تخدير الأسنان وخراطيش الليدوكائين', 'محلول يوجينول مسكن'],
    nasaSourceDocument: 'NASA Space Medicine Dental Protocols — In-Flight Barodontalgia & Dental Restoration'
  },

  // 15. Potable Water Contamination
  {
    id: 'nasa-eclss-h2o-15',
    code: 'NASA-ECLSS-H2O-15',
    title: 'Potable Water Reclamation Contamination & Microbial Spike',
    titleAr: 'تلوث مياه الشرب المعادة وارتفاع البكتيريا في شبكة المحطة',
    severity: 'WARNING',
    category: 'water_contamination',
    symptoms: [
      'ECLSS Water Recovery System (WRS) conductivity sensor alarm (> 50 uS/cm)',
      'Cloudy water appearance or sulfur/metallic taste from galley potable water dispenser',
      'Gastroenteritis symptoms (diarrhea, abdominal cramps) in multiple crewmembers'
    ],
    symptomsAr: [
      'إنذار مجس التوصيل الكهربائي في نظام استعادة المياه WRS (> 50 ميكروسيمنس/سم)',
      'عكارة في الماء أو طعم كبريتي/معدني غير طبيعي في صنبور مياه الشرب',
      'أعراض نزلات معوية (إسهال وتقلصات بطنية) لدى أكثر من رائد فضاء'
    ],
    immediateActionTimerSeconds: 600,
    immediateActions: [
      'HALT DRINKING TAP WATER IMMEDIATELY: Lock out galley Potable Water Dispenser (PWD).',
      'Switch all crew to sealed Contingency Water Containers (CWCs) filled with certified ground reserve.',
      'Collect water sample using Microbial Water Analysis Kit for onboard incubation.',
      'Flush WRS distribution lines with high-concentration biocidal Silver / Iodine biocide.'
    ],
    immediateActionsAr: [
      'إيقاف شرب مياه الصنبور فوراً وقفل موزع المياه PWD في المطبخ.',
      'التحول فوراً للشرب من أكياس المياه الاحتياطية المعبأة مسبقاً من الأرض (CWCs).',
      'سحب عينة مياه لفحصها بكيت التحليل الميكروبي المداري المباشر.',
      'غسيل شبكة المياه بجرعة تعقيم مركزة من الفضة أو اليود المضاد للبكتيريا.'
    ],
    simplifiedExplanationAr: 'مياه الشرب في الفضاء يعاد تدويرها من الرطوبة والبول والعرق. إذا أطلق النظام إنذار التلوث: لا تشرب قطرة واحدة من الصنبور! افتح أكياس المياه الأرضية الاحتياطية المختومة، وسنقوم بتطهير الشبكة بمحلول اليود المعقم.',
    simplifiedExplanationEn: 'Drinking water is recycled from sweat and urine. If the water purification loop alarms, STOP drinking from the dispenser immediately! Switch to emergency sealed earth-reserve water bags while we flush the pipes with biocide.',
    dosageTableAr: [
      'أقراص تطهير المياه (Aquatabs / Iodine Biocide): تركيز 4 أجزاء بالمليون لمدة 30 دقيقة قبل الشرب',
      'سيبروفلوكساسين (Ciprofloxacin) 500 ملغ فموياً كل 12 ساعة في حال إصابة رائد الفضاء بإسهال بكتيري حاد',
      'أملاح التروية الفموية (Oral Rehydration Salts - ORS) كيس في 500 مل ماء نظيف'
    ],
    dosageTableEn: [
      'Silver / Iodine biocide dosing at 4 ppm for 30 min line contact',
      'Ciprofloxacin 500 mg PO q12h if acute bacterial gastroenteritis develops',
      'Oral Rehydration Salts (ORS) packet dissolved in 500 mL certified water'
    ],
    troubleshootingAr: [
      'إذا نفدت أكياس المياه النظيفة: استخدم فلتر التنقية الفوري (LifeStraw Space Cartridge) لترشيح المياه يدوياً قبل شربها.'
    ],
    troubleshootingEn: [
      'If CWC reserve is low: Route dispenser water through mechanical 0.2 micron microbial filter.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Tag out the galley PWD interface switch.',
        actionAr: 'ضع شريط الحظر على مفتاح تشغيل موزع المياه.',
      },
      {
        step: 2,
        action: 'Connect certified emergency CWC water bag to food preparation station.',
        actionAr: 'وصل كيس مياه الطوارئ المعقم بمحطة تحضير الطعام.',
      },
      {
        step: 3,
        action: 'Run automated biocide injection cycle through WRS plumbing manifold.',
        actionAr: 'شغّل دورة حقن المطهر الكيميائي الآلية عبر شبكة أنابيب تدوير المياه.',
      }
    ],
    equipmentNeeded: ['Contingency Water Containers (CWCs)', 'Microbial Water Analysis Kit', 'Iodine / Biocide Injection Syringe', '0.2 Micron In-Line Filter'],
    equipmentNeededAr: ['أكياس المياه الاحتياطية CWCs', 'طقم التحليل البكتيري للمياه', 'حقنة حقن المطهر الكيميائي', 'فلتر ميكروبي 0.2 ميكرون'],
    nasaSourceDocument: 'NASA ECLSS Operational Guidelines — Water Recovery System Potability Standards SSP-50260'
  },

  // 16. Electrical & Thermal Burns
  {
    id: 'nasa-med-burn-16',
    code: 'NASA-MED-BURN-16',
    title: 'Zero-G Flash Electrical & Thermal Burns Management',
    titleAr: 'حروق الصعق الكهربائي والحراري والتضميد المعقم في الفضاء',
    severity: 'WARNING',
    category: 'burns_electrical',
    symptoms: [
      'Flash arc explosion during avionics maintenance or battery thermal runaway',
      'Partial or full-thickness skin charring, blistering, and severe burn pain',
      'Risk of cardiac dysrhythmia following high-voltage DC (120V) electrical shock'
    ],
    symptomsAr: [
      'انفجار شرارة كهربائية خاطفة أثناء صيانة الأجهزة أو انصهار حراري لبطاريات الليثيوم',
      'تفحم أو تقرحات بالجلد من الدرجة الثانية أو الثالثة مع ألم شديد',
      'خطر اضطراب نبض القلب بعد الصعق الكهربائي بتيار 120 فولت المستمر'
    ],
    immediateActionTimerSeconds: 300,
    immediateActions: [
      'COOL BURN SURFACE: Apply Water-Jel sterile burn dressings immediately for 15 minutes.',
      'Check ECG immediately: Rule out ventricular ectopy after electrical current pathway transit.',
      'Apply non-adherent Silver Sulfadiazine / Silvadene dressing to prevent opportunistic infection.',
      'Calculate Parkland Formula fluid replacement in microgravity using IV infusion pump.'
    ],
    immediateActionsAr: [
      'تبريد الحرق فوراً: وضع ضمادات Water-Jel الهلامية المعقمة لمدة 15 دقيقة لتبريد الأنسجة.',
      'تخطيط القلب ECG فوراً للتأكد من عدم حدوث رجفان قلبي بعد مرور التيار بجسم الرائد.',
      'وضع مرهم سلفاديازين الفضة (Silvadene) مع ضماد غير لاصق لحماية الجلد من البكتيريا.',
      'حساب كمية المحاليل الوريدية المطلوبة بدقة لتعويض السوائل المفقودة من الحرق.'
    ],
    simplifiedExplanationAr: 'إذا تعرض رائد فضاء لحروق أو صعقة كهربائية: اقطع الكهرباء فوراً، ضع ضمادات الجل المبردة لتخفيف حرارة الحرق، ثم ضع مرهم الفضة المعقم وغطِّ الجرح بضمادة غير لاصقة، وراقب نبضات قلبه بجهاز التخطيط.',
    simplifiedExplanationEn: 'For zero-g burns: Cool with sterile hydrogel dressings immediately, apply silver antimicrobial ointment, and run an ECG monitor to ensure the electric shock did not trigger a dangerous heart rhythm.',
    dosageTableAr: [
      'فينتانيل (Fentanyl) 50 إلى 100 ميكروغرام لتسكين آلام الحروق الشديدة',
      'مرهم سيلفاديازين الفضة (Silvadene 1%): دهان موضعي بسماكة 2 ملم تحت ضماد معقم',
      'محلول رينجر لاكتات (Ringer Lactate): حسب معادلة باركلاند (4 مل × وزن كغ × نسبة الحرق %) في أول 24 ساعة'
    ],
    dosageTableEn: [
      'Fentanyl 50-100 mcg IV/buccal for severe burn pain',
      'Silver Sulfadiazine 1% cream applied 2 mm thick',
      'Lactated Ringer IV hydration calculated via Parkland Formula'
    ],
    troubleshootingAr: [
      'إذا التصقت الضمادة بالحرق: رطبها بمحلول ملحي معقم دافئ ولا تنزعها بالقوة حتى لا تمزق الأنسجة الحديثة.'
    ],
    troubleshootingEn: [
      'If dressing adheres: Soak thoroughly with sterile saline before gentle removal.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Apply sterile hydrogel burn dressing (Water-Jel) across burned skin surface.',
        actionAr: 'ضع ضمادة الجل المائي المعقمة فوق سطح الحرق.',
      },
      {
        step: 2,
        action: 'Perform 12-lead ECG tracing using Tempus Pro diagnostic monitor.',
        actionAr: 'أجرِ تخطيط قلب متكامل بجهاز المراقبة Tempus Pro.',
      },
      {
        step: 3,
        action: 'Wrap burn loosely with sterile non-adherent Telfa pads and tubular net bandage.',
        actionAr: 'لف الحرق بضمادات تيلفا غير اللاصقة والشبكة المطاطية الواقية.',
      }
    ],
    equipmentNeeded: ['Water-Jel Burn Dressings', 'Silvadene 1% Cream', 'Telfa Non-Adherent Pads', 'Tempus Pro ECG Leads'],
    equipmentNeededAr: ['ضمادات الجل المائي للحروق', 'مرهم سيلفاديازين الفضة', 'ضمادات تيلفا غير اللاصقة', 'أقطاب تخطيط القلب'],
    nasaSourceDocument: 'NASA Flight Surgeon Clinical Guidelines — Acute Burn Care & Electrical Injuries in Space'
  },

  // 17. Acute Urinary Retention
  {
    id: 'nasa-med-aur-17',
    code: 'NASA-MED-AUR-17',
    title: 'Acute Urinary Retention & Zero-G Hydrophilic Catheterization',
    titleAr: 'احتباس البول الحاد والقسطرة البولية المعقمة في انعدام الوزن',
    severity: 'ADVISORY',
    category: 'urinary_retention',
    symptoms: [
      'Inability to void bladder despite extreme suprapubic fullness and pain',
      'Bladder ultrasound showing volume > 600 mL retained urine',
      'Severe autonomic distress and sweating exacerbated by microgravity fluid shift'
    ],
    symptomsAr: [
      'عدم القدرة على التبول نهائياً رغم امتلاء المثانة الشديد والشعور بألم بطني خانق',
      'فحص السونار المداري يظهر احتباس أكثر من 600 مل من البول داخل المثانة',
      'تعرق وتسارع نبضات القلب وانزعاج عصبي حاد نتيجة انحباس البول'
    ],
    immediateActionTimerSeconds: 1800,
    immediateActions: [
      'Verify bladder distention via Ultrasound 2 probe in suprapubic window.',
      'Deploy Hydrophilic Intermittent Urinary Catheter kit with sterile containment sleeve.',
      'Instill 2% Lidocaine Jelly into urethra for lubrication and local anesthesia.',
      'Slowly drain bladder to low-pressure collection bag (drain maximum 800 mL initially).'
    ],
    immediateActionsAr: [
      'تأكيد احتباس البول بجهاز السونار المداري فوق عظم العانة.',
      'تجهيز قسطرة البول الهيدروفيليك ذاتية التزليق مع الغلاف الحافظ المعقم.',
      'حقن جل ليدوكائين المخدر داخل مجرى البول لتسهيل دخول القسطرة بدون ألم.',
      'تصريف البول ببطء إلى كيس التجميع المعقم (بحد أقصى 800 مل في الدفعة الأولى).'
    ],
    simplifiedExplanationAr: 'في انعدام الوزن قد يتشنج صمام المثانة مسبباً احتباساً مؤلماً للبول. الحل هو إدخال القسطرة البولية المرنة ذاتية التزليق برفق داخل مجرى البول بعد تخديره بالجل لتفريغ المثانة فوراً وزوال الألم.',
    simplifiedExplanationEn: 'Microgravity and anticholinergic medications can paralyze bladder voiding reflexes. Verify distention with ultrasound, lubricate with lidocaine gel, and insert a sterile hydrophilic catheter to drain the bladder safely.',
    dosageTableAr: [
      'ليدوكائين جل 2% (Lidocaine Jelly): 10 مل حقن في مجرى البول قبل 5 دقائق من القسطرة',
      'تامسولوسين (Tamsulosin) 0.4 ملغ فموياً يومياً لإرخاء عنق المثانة',
      'سيبروفلوكساسين 500 ملغ جرعة واحدة للوقاية من التهاب المسالك'
    ],
    dosageTableEn: [
      'Lidocaine 2% uro-jet: 10 mL intraurethral 5 min prior to insertion',
      'Tamsulosin 0.4 mg PO daily to relax bladder neck smooth muscle',
      'Ciprofloxacin 500 mg PO single dose post-catheterization UTI prophylaxis'
    ],
    troubleshootingAr: [
      'إذا واجهت مقاومة عند إدخال القسطرة: اطلب من الرائد أخذ نفس عميق والاسترخاء، ولا تضغط بالقوة لمنع تمزق مجرى البول.'
    ],
    troubleshootingEn: [
      'If resistance met at prostate/sphincter: Have patient take slow deep breath; never force catheter.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Prep sterile field and instill 10 mL Lidocaine jelly into urethral meatus.',
        actionAr: 'عقم المنطقة واحقن 10 مل من جل الليدوكائين داخل فتحة مجرى البول.',
      },
      {
        step: 2,
        action: 'Advance 14 French hydrophilic catheter gently until urine returns into drainage tube.',
        actionAr: 'أدخل القسطرة قياس 14Fr برفق حتى يبدأ تدفق البول داخل أنبوب التصريف.',
      },
      {
        step: 3,
        action: 'Drain into metered urine bag, then clamp and remove or secure as indicated.',
        actionAr: 'صرف البول إلى كيس القياس المخصص ثم اغلق القسطرة واسحبها برفق.',
      }
    ],
    equipmentNeeded: ['Hydrophilic 14Fr Urinary Catheter Kit', 'Lidocaine 2% Uro-Jet', 'Ultrasound 2 Diagnostic Probe', 'Urine Collection Bags'],
    equipmentNeededAr: ['طقم قسطرة بولية معقم قياس 14Fr', 'جل ليدوكائين المخدر', 'مجس السونار المداري', 'أكياس تصريف البول المغلقة'],
    nasaSourceDocument: 'NASA Medical Operations — Urological Emergencies & Bladder Catheterization Protocol'
  },

  // 18. Acute SANS & Intracranial Pressure
  {
    id: 'nasa-med-sans-18',
    code: 'NASA-MED-SANS-18',
    title: 'Acute SANS & Severe Intracranial Pressure Spike',
    titleAr: 'متلازمة ساس للعين وارتفاع الضغط داخل الجمجمة في انعدام الوزن',
    severity: 'WARNING',
    category: 'sans_neuro',
    symptoms: [
      'Rapid onset blurred vision, optic disc edema (papilledema), and cotton wool spots',
      'Globe flattening on optical coherence tomography (OCT)',
      'Intense retro-orbital headache and pulsatile tinnitus worsened by head-down tilt'
    ],
    symptomsAr: [
      'تشوش سريع في الرؤية، وتورم حليمة العصب البصري (وذمة الحليمة) وظهور بقع قطنية',
      'تسطح في جدار مقلة العين عند الفحص بجهاز التصوير المقطعي البصري OCT',
      'صداع حاد خلف العينين مع طنين نابض في الأذنين يزداد عند الانحناء أو النوم'
    ],
    immediateActionTimerSeconds: 1800,
    immediateActions: [
      'Perform Fundus Photography / OCT scan to grade optic nerve sheath swelling.',
      'Deploy Lower Body Negative Pressure (LBNP) device for 2 hours to pull fluids back to legs.',
      'Administer Acetazolamide (Diamox) to suppress cerebrospinal fluid (CSF) production.',
      'Elevate sleeping quarters head by 15 degrees using restraint tilt angle.'
    ],
    immediateActionsAr: [
      'تصوير قاع العين بجهاز OCT المداري لتحديد درجة تورم غلاف العصب البصري.',
      'تشغيل جهاز الضغط السلبي للجزء السفلي (LBNP) لمدة ساعتين لسحب السوائل من الرأس نحو الساقين.',
      'إعطاء دواء أسيتازولاميد (Diamox) لتقليل إفراز السائل الدماغي الشوكي وخفض ضغط الجمجمة.',
      'رفع زاوية رأس كيس النوم بمقدار 15 درجة لتقليل تجمع السوائل في الرأس أثناء النوم.'
    ],
    simplifiedExplanationAr: 'في الفضاء تصعد السوائل للرأس وتضغط على الدماغ والعصب البصري خلف العين، مما يسبب تشوش الرؤية وصداعاً. العلاج: استخدام جهاز الشفط السفلي LBNP لسحب السوائل نحو الساقين، مع أخذ دواء خفض ضغط سوائل المخ (Diamox).',
    simplifiedExplanationEn: 'Without gravity, 2 liters of fluid shift to your head, compressing your brain and eyes (SANS syndrome). We use Lower Body Negative Pressure (LBNP) suits to vacuum blood back to your legs, alongside medication to lower brain pressure.',
    dosageTableAr: [
      'أسيتازولاميد (Acetazolamide - Diamox) 250 ملغ فموياً مرتين يومياً لخفض إنتاج السائل الدماغي',
      'ميثازولاميد (Methazolamide) 50 ملغ كبديل في حال وجود حساسية',
      'جلسة جهاز LBNP: ضغط سلبي -25 ملم زئبق لمدة 90 إلى 120 دقيقة يومياً'
    ],
    dosageTableEn: [
      'Acetazolamide 250 mg PO BID to decrease CSF production',
      'Methazolamide 50 mg PO as alternative carbonic anhydrase inhibitor',
      'LBNP session at -25 mmHg for 90-120 minutes daily'
    ],
    troubleshootingAr: [
      'إذا تعذر استخدام جهاز LBNP: استخدم أحزمة الضغط الوريدي على الفخذين (Braslet-M Cuffs) لتقليل عودة الدم للرأس.'
    ],
    troubleshootingEn: [
      'If LBNP unavailable: Apply Russian Braslet-M venous thigh occlusion cuffs to trap venous volume in legs.'
    ],
    stepByStepProcedure: [
      {
        step: 1,
        action: 'Capture baseline retinal OCT image and optic nerve head thickness.',
        actionAr: 'التقط صورة مقطعية للشبكية وقس سماكة رأس العصب البصري بجهاز OCT.',
      },
      {
        step: 2,
        action: 'Ingress LBNP cylinder, seal waist skirt, and initiate -25 mmHg negative pressure cycle.',
        actionAr: 'ادخل أسطوانة LBNP وأحكم إغلاق تنورة الخصر وابدأ دورة الضغط السلبي -25 ملم زئبق.',
      },
      {
        step: 3,
        action: 'Administer Diamox 250 mg with 300 mL water. Recheck visual acuity in 4 hours.',
        actionAr: 'تناول قرص Diamox مع الماء وأعد فحص حدة البصر بعد 4 ساعات.',
      }
    ],
    equipmentNeeded: ['Lower Body Negative Pressure (LBNP) Unit', 'Optical Coherence Tomography (OCT)', 'Acetazolamide (Diamox) Tablets', 'Braslet-M Occlusion Cuffs'],
    equipmentNeededAr: ['جهاز الضغط السلبي للجزء السفلي LBNP', 'جهاز التصوير المقطعي للشبكية OCT', 'أقراص أسيتازولاميد Diamox', 'أحزمة حصر السوائل Braslet-M'],
    nasaSourceDocument: 'NASA Human Research Program — Spaceflight-Associated Neuro-ocular Syndrome (SANS) Clinical Protocols'
  }
];
