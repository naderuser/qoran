/**
 * قرآن صوتی همراه با متن
 * طراح: نادر اکشیک
 * Cloudflare Worker
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Endpoints
    if (url.pathname === '/api/surahs') {
      return getSurahs();
    }
    
    if (url.pathname === '/api/ayah' && url.searchParams.has('surah') && url.searchParams.has('ayah')) {
      const surah = url.searchParams.get('surah');
      const ayah = url.searchParams.get('ayah');
      const reciter = url.searchParams.get('reciter') || 'ar.alafasy';
      const translation = url.searchParams.get('translation') || 'fa.makarem';
      return getAyah(surah, ayah, reciter, translation);
    }
    
    if (url.pathname === '/api/audio') {
      const surah = url.searchParams.get('surah');
      const ayah = url.searchParams.get('ayah');
      const reciter = url.searchParams.get('reciter') || 'ar.alafasy';
      return getAudioRedirect(surah, ayah, reciter);
    }

    // Serve HTML page
    return new Response(getHTML(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        ...corsHeaders,
      },
    });
  },
};

// Get all surahs
async function getSurahs() {
  const surahData = [
    { number: 1, name: "الفاتحة", ayahCount: 7 },
    { number: 2, name: "البقرة", ayahCount: 286 },
    { number: 3, name: "آل عمران", ayahCount: 200 },
    { number: 4, name: "النساء", ayahCount: 176 },
    { number: 5, name: "المائدة", ayahCount: 120 },
    { number: 6, name: "الأنعام", ayahCount: 165 },
    { number: 7, name: "الأعراف", ayahCount: 206 },
    { number: 8, name: "الأنفال", ayahCount: 75 },
    { number: 9, name: "التوبة", ayahCount: 129 },
    { number: 10, name: "يونس", ayahCount: 109 },
    { number: 11, name: "هود", ayahCount: 123 },
    { number: 12, name: "يوسف", ayahCount: 111 },
    { number: 13, name: "الرعد", ayahCount: 43 },
    { number: 14, name: "إبراهيم", ayahCount: 52 },
    { number: 15, name: "الحجر", ayahCount: 99 },
    { number: 16, name: "النحل", ayahCount: 128 },
    { number: 17, name: "الإسراء", ayahCount: 111 },
    { number: 18, name: "الكهف", ayahCount: 110 },
    { number: 19, name: "مريم", ayahCount: 98 },
    { number: 20, name: "طه", ayahCount: 135 },
    { number: 21, name: "الأنبياء", ayahCount: 112 },
    { number: 22, name: "الحج", ayahCount: 78 },
    { number: 23, name: "المؤمنون", ayahCount: 118 },
    { number: 24, name: "النور", ayahCount: 64 },
    { number: 25, name: "الفرقان", ayahCount: 77 },
    { number: 26, name: "الشعراء", ayahCount: 227 },
    { number: 27, name: "النمل", ayahCount: 93 },
    { number: 28, name: "القصص", ayahCount: 88 },
    { number: 29, name: "العنكبوت", ayahCount: 69 },
    { number: 30, name: "الروم", ayahCount: 60 },
    { number: 31, name: "لقمان", ayahCount: 34 },
    { number: 32, name: "السجدة", ayahCount: 30 },
    { number: 33, name: "الأحزاب", ayahCount: 73 },
    { number: 34, name: "سبأ", ayahCount: 54 },
    { number: 35, name: "فاطر", ayahCount: 45 },
    { number: 36, name: "يس", ayahCount: 83 },
    { number: 37, name: "الصافات", ayahCount: 182 },
    { number: 38, name: "ص", ayahCount: 88 },
    { number: 39, name: "الزمر", ayahCount: 75 },
    { number: 40, name: "غافر", ayahCount: 85 },
    { number: 41, name: "فصلت", ayahCount: 54 },
    { number: 42, name: "الشورى", ayahCount: 53 },
    { number: 43, name: "الزخرف", ayahCount: 89 },
    { number: 44, name: "الدخان", ayahCount: 59 },
    { number: 45, name: "الجاثية", ayahCount: 37 },
    { number: 46, name: "الأحقاف", ayahCount: 35 },
    { number: 47, name: "محمد", ayahCount: 38 },
    { number: 48, name: "الفتح", ayahCount: 29 },
    { number: 49, name: "الحجرات", ayahCount: 18 },
    { number: 50, name: "ق", ayahCount: 45 },
    { number: 51, name: "الذاريات", ayahCount: 60 },
    { number: 52, name: "الطور", ayahCount: 49 },
    { number: 53, name: "النجم", ayahCount: 62 },
    { number: 54, name: "القمر", ayahCount: 55 },
    { number: 55, name: "الرحمن", ayahCount: 78 },
    { number: 56, name: "الواقعة", ayahCount: 96 },
    { number: 57, name: "الحديد", ayahCount: 29 },
    { number: 58, name: "المجادلة", ayahCount: 22 },
    { number: 59, name: "الحشر", ayahCount: 24 },
    { number: 60, name: "الممتحنة", ayahCount: 13 },
    { number: 61, name: "الصف", ayahCount: 14 },
    { number: 62, name: "الجمعة", ayahCount: 11 },
    { number: 63, name: "المنافقون", ayahCount: 11 },
    { number: 64, name: "التغابن", ayahCount: 18 },
    { number: 65, name: "الطلاق", ayahCount: 12 },
    { number: 66, name: "التحريم", ayahCount: 12 },
    { number: 67, name: "الملك", ayahCount: 30 },
    { number: 68, name: "القلم", ayahCount: 52 },
    { number: 69, name: "الحاقة", ayahCount: 52 },
    { number: 70, name: "المعارج", ayahCount: 44 },
    { number: 71, name: "نوح", ayahCount: 28 },
    { number: 72, name: "الجن", ayahCount: 28 },
    { number: 73, name: "المزمل", ayahCount: 20 },
    { number: 74, name: "المدثر", ayahCount: 56 },
    { number: 75, name: "القيامة", ayahCount: 40 },
    { number: 76, name: "الإنسان", ayahCount: 31 },
    { number: 77, name: "المرسلات", ayahCount: 50 },
    { number: 78, name: "النبأ", ayahCount: 40 },
    { number: 79, name: "النازعات", ayahCount: 46 },
    { number: 80, name: "عبس", ayahCount: 42 },
    { number: 81, name: "التكوير", ayahCount: 29 },
    { number: 82, name: "الإنفطار", ayahCount: 19 },
    { number: 83, name: "المطففين", ayahCount: 36 },
    { number: 84, name: "الإنشقاق", ayahCount: 25 },
    { number: 85, name: "البروج", ayahCount: 22 },
    { number: 86, name: "الطارق", ayahCount: 17 },
    { number: 87, name: "الأعلى", ayahCount: 19 },
    { number: 88, name: "الغاشية", ayahCount: 26 },
    { number: 89, name: "الفجر", ayahCount: 30 },
    { number: 90, name: "البلد", ayahCount: 20 },
    { number: 91, name: "الشمس", ayahCount: 15 },
    { number: 92, name: "الليل", ayahCount: 21 },
    { number: 93, name: "الضحى", ayahCount: 11 },
    { number: 94, name: "الشرح", ayahCount: 8 },
    { number: 95, name: "التين", ayahCount: 8 },
    { number: 96, name: "العلق", ayahCount: 19 },
    { number: 97, name: "القدر", ayahCount: 5 },
    { number: 98, name: "البينة", ayahCount: 8 },
    { number: 99, name: "الزلزلة", ayahCount: 8 },
    { number: 100, name: "العاديات", ayahCount: 11 },
    { number: 101, name: "القارعة", ayahCount: 11 },
    { number: 102, name: "التكاثر", ayahCount: 8 },
    { number: 103, name: "العصر", ayahCount: 3 },
    { number: 104, name: "الهمزة", ayahCount: 9 },
    { number: 105, name: "الفيل", ayahCount: 5 },
    { number: 106, name: "قريش", ayahCount: 4 },
    { number: 107, name: "الماعون", ayahCount: 7 },
    { number: 108, name: "الكوثر", ayahCount: 3 },
    { number: 109, name: "الكافرون", ayahCount: 6 },
    { number: 110, name: "النصر", ayahCount: 3 },
    { number: 111, name: "المسد", ayahCount: 5 },
    { number: 112, name: "الإخلاص", ayahCount: 4 },
    { number: 113, name: "الفلق", ayahCount: 5 },
    { number: 114, name: "الناس", ayahCount: 6 }
  ];

  return new Response(JSON.stringify(surahData), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Get specific ayah
async function getAyah(surah, ayah, reciter, translation) {
  try {
    // Fetch from AlQuran Cloud API
    const [arabicRes, transRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}`),
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${translation}`)
    ]);

    const arabicData = await arabicRes.json();
    const transData = await transRes.json();

    const result = {
      surah: parseInt(surah),
      ayah: parseInt(ayah),
      arabic: arabicData.data?.text || '',
      translation: transData.data?.text || '',
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciter}/${surah}${String(ayah).padStart(3, '0')}.mp3`
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch ayah' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Redirect to audio CDN
function getAudioRedirect(surah, ayah, reciter) {
  // Calculate global verse number for Islamic Network CDN
  const globalVerseNumber = getGlobalVerseNumber(parseInt(surah), parseInt(ayah));
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalVerseNumber}.mp3`;
  
  return Response.redirect(audioUrl, 302);
}

// Calculate global verse number (cumulative) for audio API
function getGlobalVerseNumber(surah, ayah) {
  const ayahCounts = [
    0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
    123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
    34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
    54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
    60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
    14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
    29, 19, 5, 8, 8, 11, 8, 11, 11, 8,
    3, 9, 8, 3, 8, 8, 3, 3, 8, 8,
    3, 3, 3, 5, 5, 3, 4, 5, 5, 1,
    5, 4, 3, 6, 3, 3, 7, 3, 6, 3
  ];
  
  let total = 0;
  for (let i = 0; i < surah - 1; i++) {
    total += ayahCounts[i];
  }
  return total + ayah;
}

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// HTML Page
function getHTML() {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>قرآن صوتی | صوت + متن</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Vazirmatn:wght@300;400;500;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #1a5f2a;
            --primary-dark: #0d3d16;
            --secondary: #c9a227;
            --bg-dark: #0a0f0a;
            --bg-card: #111811;
            --text-arabic: #f0e6d3;
            --text-farsi: #d4e5d4;
            --gold: #d4af37;
        }
        
        body {
            font-family: 'Vazirmatn', sans-serif;
            background: var(--bg-dark);
            color: var(--text-farsi);
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .bg-pattern {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 20% 20%, rgba(26, 95, 42, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(201, 162, 39, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
            position: relative;
            z-index: 1;
        }
        
        header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
            margin-bottom: 30px;
        }
        
        .bismillah {
            font-family: 'Amiri', serif;
            font-size: 3rem;
            color: var(--gold);
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(212, 175, 55, 0.3);
        }
        
        h1 {
            font-size: 1.8rem;
            color: var(--text-farsi);
            font-weight: 500;
        }
        
        .designer {
            font-size: 0.9rem;
            color: var(--secondary);
            margin-top: 10px;
            opacity: 0.8;
        }
        
        .selection-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--bg-card);
            border-radius: 16px;
            border: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        .select-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .select-group label {
            font-size: 0.85rem;
            color: var(--secondary);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        select {
            padding: 12px 16px;
            border-radius: 10px;
            border: 1px solid rgba(212, 175, 55, 0.2);
            background: var(--bg-dark);
            color: var(--text-farsi);
            font-family: 'Vazirmatn', sans-serif;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        select:hover, select:focus {
            border-color: var(--gold);
            outline: none;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
        }
        
        .player-card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(212, 175, 55, 0.15);
            margin-bottom: 30px;
        }
        
        .now-playing {
            text-align: center;
            margin-bottom: 25px;
        }
        
        .surah-name {
            font-family: 'Amiri', serif;
            font-size: 2.2rem;
            color: var(--gold);
            margin-bottom: 8px;
        }
        
        .ayah-info {
            font-size: 0.95rem;
            color: rgba(212, 229, 212, 0.7);
        }
        
        .quran-text-container {
            background: linear-gradient(135deg, rgba(26, 95, 42, 0.1), rgba(10, 15, 10, 0.5));
            border-radius: 16px;
            padding: 40px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid rgba(212, 175, 55, 0.1);
            min-height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            overflow: hidden;
        }
        
        .ayah-number {
            position: absolute;
            top: 15px;
            right: 20px;
            background: var(--primary);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .arabic-text {
            font-family: 'Amiri', serif;
            font-size: 2.5rem;
            line-height: 2.2;
            color: var(--text-arabic);
            direction: rtl;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .translation {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(212, 175, 55, 0.15);
            font-size: 1.1rem;
            color: rgba(212, 229, 212, 0.85);
            line-height: 1.8;
        }
        
        .audio-controls {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .progress-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .time-display {
            font-size: 0.85rem;
            color: rgba(212, 229, 212, 0.6);
            min-width: 45px;
            text-align: center;
            font-variant-numeric: tabular-nums;
        }
        
        .progress-bar {
            flex: 1;
            height: 6px;
            background: rgba(212, 175, 55, 0.2);
            border-radius: 3px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--gold));
            border-radius: 3px;
            width: 0%;
            transition: width 0.1s linear;
        }
        
        .main-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
        }
        
        .control-btn {
            background: transparent;
            border: 2px solid rgba(212, 175, 55, 0.3);
            color: var(--text-farsi);
            width: 55px;
            height: 55px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            font-size: 1.2rem;
        }
        
        .control-btn:hover {
            border-color: var(--gold);
            background: rgba(212, 175, 55, 0.1);
            transform: scale(1.05);
        }
        
        .control-btn.play-btn {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary), var(--primary-dark));
            border: none;
            box-shadow: 0 5px 25px rgba(26, 95, 42, 0.4);
        }
        
        .control-btn.play-btn:hover {
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            box-shadow: 0 8px 35px rgba(26, 95, 42, 0.5);
        }
        
        .control-btn svg {
            width: 24px;
            height: 24px;
            fill: currentColor;
        }
        
        .control-btn.play-btn svg {
            width: 28px;
            height: 28px;
        }
        
        .volume-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .volume-btn {
            background: transparent;
            border: none;
            color: var(--text-farsi);
            cursor: pointer;
            padding: 5px;
            opacity: 0.8;
            transition: opacity 0.3s;
        }
        
        .volume-slider {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: rgba(212, 175, 55, 0.2);
            border-radius: 2px;
            cursor: pointer;
        }
        
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: var(--gold);
            border-radius: 50%;
            cursor: pointer;
        }
        
        .nav-controls {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        
        .nav-btn {
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.2);
            color: var(--text-farsi);
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-family: 'Vazirmatn', sans-serif;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .nav-btn:hover {
            background: rgba(212, 175, 55, 0.2);
            border-color: var(--gold);
        }
        
        .nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }
        
        .surah-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 12px;
            margin-top: 20px;
        }
        
        .surah-item {
            background: var(--bg-card);
            border: 1px solid rgba(212, 175, 55, 0.1);
            border-radius: 12px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .surah-item:hover {
            border-color: var(--gold);
            background: rgba(26, 95, 42, 0.1);
            transform: translateY(-2px);
        }
        
        .surah-item.active {
            border-color: var(--gold);
            background: rgba(212, 175, 55, 0.1);
        }
        
        .surah-number {
            width: 45px;
            height: 45px;
            background: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            font-size: 0.95rem;
        }
        
        .surah-details h3 {
            font-size: 1rem;
            color: var(--text-farsi);
            margin-bottom: 4px;
        }
        
        .surah-details span {
            font-size: 0.8rem;
            color: rgba(212, 229, 212, 0.6);
        }
        
        .loading {
            display: none;
            justify-content: center;
            align-items: center;
            padding: 40px;
        }
        
        .loading.active {
            display: flex;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(212, 175, 55, 0.2);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--bg-card);
            border: 1px solid var(--gold);
            padding: 15px 30px;
            border-radius: 12px;
            color: var(--text-farsi);
            font-size: 0.95rem;
            opacity: 0;
            transition: all 0.4s ease;
            z-index: 1000;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        footer {
            text-align: center;
            padding: 40px 20px;
            margin-top: 50px;
            border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        footer p {
            font-size: 0.85rem;
            color: rgba(212, 229, 212, 0.5);
        }
        
        .tafsir-link {
            color: var(--gold);
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .bismillah { font-size: 2.2rem; }
            h1 { font-size: 1.4rem; }
            .arabic-text { font-size: 1.8rem; }
            .selection-panel { grid-template-columns: 1fr; }
            .main-controls { gap: 10px; }
            .control-btn { width: 48px; height: 48px; }
            .control-btn.play-btn { width: 60px; height: 60px; }
        }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    
    <div class="container">
        <header>
            <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            <h1>قرآن کریم با صوت و ترجمه</h1>
            <p class="designer">طراح: نادر اکشیک</p>
        </header>
        
        <div class="selection-panel">
            <div class="select-group">
                <label>📖 سوره</label>
                <select id="surahSelect">
                    <option value="">انتخاب سوره...</option>
                </select>
            </div>
            
            <div class="select-group">
                <label>🎙️ قاری</label>
                <select id="reciterSelect">
                    <option value="ar.alafasy">مشاری راشد العفاسی</option>
                    <option value="ar.abdurabor">عبدالباسط عبدالصمد</option>
                    <option value="ar.husary">محمود خلیل الحصری</option>
                    <option value="ar.maaboralmeeqly">محمد البرای</option>
                    <option value="ar.ahmedajamy">احمد بن علی العجمی</option>
                    <option value="ar.minshawimujawwad">محمد صدیق منشاوی</option>
                </select>
            </div>
            
            <div class="select-group">
                <label>🌍 ترجمه</label>
                <select id="translationSelect">
                    <option value="fa.makarem">مکارم شیرازی</option>
                    <option value="fa.ansarian">انصاریان</option>
                    <option value="fa.fooladvand">فولادوند</option>
                    <option value="en.sahih">English - Sahih</option>
                </select>
            </div>
        </div>
        
        <div class="player-card">
            <div class="now-playing">
                <h2 class="surah-name" id="surahName">الفاتحة</h2>
                <p class="ayah-info" id="ayahInfo">آیه ۱ از ۷</p>
            </div>
            
            <div class="quran-text-container">
                <div class="ayah-number" id="ayahNumber">1</div>
                <div class="loading" id="loadingState">
                    <div class="spinner"></div>
                </div>
                <p class="arabic-text" id="arabicText">الحمدلله رب العالمین</p>
                <p class="translation" id="translationText">ستایش، ویژه خداوندی است که پروردگار جهانیان است</p>
            </div>
            
            <div class="audio-controls">
                <div class="progress-container">
                    <span class="time-display" id="currentTime">0:00</span>
                    <div class="progress-bar" id="progressBar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <span class="time-display" id="totalTime">0:00</span>
                </div>
                
                <div class="main-controls">
                    <button class="control-btn" id="prevAyahBtn" title="آیه قبلی">◀</button>
                    <button class="control-btn" id="prev10Btn" title="۱۰ آیه قبل">⏪</button>
                    <button class="control-btn play-btn" id="playBtn" title="پخش">▶</button>
                    <button class="control-btn" id="next10Btn" title="۱۰ آیه بعد">⏩</button>
                    <button class="control-btn" id="nextAyahBtn" title="آیه بعدی">▶</button>
                </div>
                
                <div class="volume-container">
                    <button class="volume-btn" id="volumeBtn">🔊</button>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="80">
                </div>
            </div>
            
            <div class="nav-controls">
                <button class="nav-btn" id="prevSurahBtn">
                    <span>◀</span> سوره قبلی
                </button>
                <button class="nav-btn" id="nextSurahBtn">
                    سوره بعدی <span>▶</span>
                </button>
            </div>
        </div>
        
        <h2 style="margin-bottom: 20px; color: var(--gold);">📜 فهرست سوره‌ها</h2>
        <div class="surah-list" id="surahList"></div>
        
        <footer>
            <p>با استفاده از <a href="https://alquran.cloud/api" class="tafsir-link" target="_blank">AlQuran Cloud API</a></p>
            <p style="margin-top: 10px;">تمامی حقوق محفوظ است © ۱۴۰۳</p>
        </footer>
    </div>
    
    <div class="toast" id="toast"></div>
    
    <script>
        // Calculate global verse number for Islamic Network CDN
        function getGlobalVerseNumber(surah, ayah) {
            const ayahCounts = [
                0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
                123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
                112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
                34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
                54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
                60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
                14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
                28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
                29, 19, 5, 8, 8, 11, 8, 11, 11, 8,
                3, 9, 8, 3, 8, 8, 3, 3, 8, 8,
                3, 3, 3, 5, 5, 3, 4, 5, 5, 1,
                5, 4, 3, 6, 3, 3, 7, 3, 6, 3
            ];
            let total = 0;
            for (let i = 0; i < surah - 1; i++) {
                total += ayahCounts[i];
            }
            return total + ayah;
        }
        
        const surahNames = [
            "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
            "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
            "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
            "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
            "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
            "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
            "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
            "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
            "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
            "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
            "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
            "المسد", "الإخلاص", "الفلق", "الناس"
        ];
        
        const surahAyahCounts = [
            7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
            123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
            112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
            34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
            54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
            60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
            14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
            28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
            29, 19, 5, 8, 8, 11, 8, 11, 11, 8,
            3, 9, 8, 3, 8, 8, 3, 3, 8, 8,
            3, 3, 3, 5, 5, 3, 4, 5, 5, 1,
            5, 4, 3, 6, 3, 3, 7, 3, 6, 3
        ];
        
        let currentSurah = 1;
        let currentAyah = 1;
        let totalAyahs = 7;
        let isPlaying = false;
        let audio = new Audio();
        
        const surahSelect = document.getElementById('surahSelect');
        const reciterSelect = document.getElementById('reciterSelect');
        const translationSelect = document.getElementById('translationSelect');
        const surahName = document.getElementById('surahName');
        const ayahInfo = document.getElementById('ayahInfo');
        const ayahNumber = document.getElementById('ayahNumber');
        const arabicText = document.getElementById('arabicText');
        const translationText = document.getElementById('translationText');
        const loadingState = document.getElementById('loadingState');
        const playBtn = document.getElementById('playBtn');
        const prevAyahBtn = document.getElementById('prevAyahBtn');
        const nextAyahBtn = document.getElementById('nextAyahBtn');
        const prev10Btn = document.getElementById('prev10Btn');
        const next10Btn = document.getElementById('next10Btn');
        const prevSurahBtn = document.getElementById('prevSurahBtn');
        const nextSurahBtn = document.getElementById('nextSurahBtn');
        const progressBar = document.getElementById('progressBar');
        const progressFill = document.getElementById('progressFill');
        const currentTimeEl = document.getElementById('currentTime');
        const totalTimeEl = document.getElementById('totalTime');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeBtn = document.getElementById('volumeBtn');
        const surahList = document.getElementById('surahList');
        const toast = document.getElementById('toast');
        
        function initSurahList() {
            surahNames.forEach((name, index) => {
                const option = document.createElement('option');
                option.value = index + 1;
                option.textContent = (index + 1) + '. ' + name + ' (' + surahAyahCounts[index] + ' ayah)';
                surahSelect.appendChild(option);
            });
            
            surahNames.forEach((name, index) => {
                const item = document.createElement('div');
                item.className = 'surah-item';
                item.innerHTML = '<div class="surah-number">' + (index + 1) + '</div><div class="surah-details"><h3>' + name + '</h3><span>' + surahAyahCounts[index] + ' آیه</span></div>';
                item.addEventListener('click', () => {
                    currentSurah = index + 1;
                    currentAyah = 1;
                    surahSelect.value = currentSurah;
                    loadAyah();
                });
                surahList.appendChild(item);
            });
        }
        
        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }
        
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
        
        function toPersianNum(num) {
            const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            return String(num).replace(/[0-9]/g, d => persianDigits[d]);
        }
        
        async function loadAyah() {
            showLoading(true);
            
            document.querySelectorAll('.surah-item').forEach((item, index) => {
                item.classList.toggle('active', index + 1 === currentSurah);
            });
            
            surahName.textContent = surahNames[currentSurah - 1];
            totalAyahs = surahAyahCounts[currentSurah - 1];
            ayahInfo.textContent = 'آیه ' + toPersianNum(currentAyah) + ' از ' + toPersianNum(totalAyahs);
            ayahNumber.textContent = toPersianNum(currentAyah);
            
            try {
                const reciter = reciterSelect.value;
                const translation = translationSelect.value;
                
                audio.src = 'https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + getGlobalVerseNumber(currentSurah, currentAyah) + '.mp3';
                
                const response = await fetch('/api/ayah?surah=' + currentSurah + '&ayah=' + currentAyah + '&translation=' + translation);
                const data = await response.json();
                
                if (data.arabic) arabicText.textContent = data.arabic;
                if (data.translation) translationText.textContent = data.translation;
                
                updateNavButtons();
            } catch (error) {
                console.error('Error:', error);
                showToast('خطا در بارگذاری');
            }
            
            showLoading(false);
        }
        
        function showLoading(show) {
            loadingState.classList.toggle('active', show);
            arabicText.style.display = show ? 'none' : 'block';
        }
        
        function updateNavButtons() {
            prevAyahBtn.disabled = currentAyah <= 1;
            nextAyahBtn.disabled = currentAyah >= totalAyahs;
            prevSurahBtn.disabled = currentSurah <= 1;
            nextSurahBtn.disabled = currentSurah >= 114;
            prev10Btn.disabled = currentAyah <= 10;
            next10Btn.disabled = currentAyah > totalAyahs - 10;
        }
        
        function togglePlay() {
            if (isPlaying) {
                audio.pause();
                playBtn.textContent = '▶';
            } else {
                audio.play();
                playBtn.textContent = '⏸';
            }
            isPlaying = !isPlaying;
        }
        
        function prevAyah() {
            if (currentAyah > 1) {
                currentAyah--;
                loadAyah();
                if (isPlaying) audio.play();
            }
        }
        
        function nextAyah() {
            if (currentAyah < totalAyahs) {
                currentAyah++;
                loadAyah();
                if (isPlaying) audio.play();
            }
        }
        
        function prev10Ayahs() {
            currentAyah = Math.max(1, currentAyah - 10);
            loadAyah();
            if (isPlaying) audio.play();
        }
        
        function next10Ayahs() {
            currentAyah = Math.min(totalAyahs, currentAyah + 10);
            loadAyah();
            if (isPlaying) audio.play();
        }
        
        function prevSurah() {
            if (currentSurah > 1) {
                currentSurah--;
                currentAyah = 1;
                surahSelect.value = currentSurah;
                loadAyah();
            }
        }
        
        function nextSurah() {
            if (currentSurah < 114) {
                currentSurah++;
                currentAyah = 1;
                surahSelect.value = currentSurah;
                loadAyah();
            }
        }
        
        audio.addEventListener('timeupdate', () => {
            if (audio.duration) {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressFill.style.width = progress + '%';
                currentTimeEl.textContent = formatTime(audio.currentTime);
            }
        });
        
        audio.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(audio.duration);
        });
        
        audio.addEventListener('ended', () => {
            if (currentAyah < totalAyahs) {
                nextAyah();
            } else if (currentSurah < 114) {
                nextSurah();
            } else {
                isPlaying = false;
                playBtn.textContent = '▶';
                showToast('پایان قرآن کریم');
            }
        });
        
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audio.currentTime = percent * audio.duration;
        });
        
        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value / 100;
        });
        
        volumeBtn.addEventListener('click', () => {
            audio.muted = !audio.muted;
            volumeBtn.textContent = audio.muted ? '🔇' : '🔊';
        });
        
        surahSelect.addEventListener('change', (e) => {
            currentSurah = parseInt(e.target.value);
            currentAyah = 1;
            loadAyah();
        });
        
        reciterSelect.addEventListener('change', () => {
            const reciter = reciterSelect.value;
            audio.src = 'https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + getGlobalVerseNumber(currentSurah, currentAyah) + '.mp3';
            if (isPlaying) audio.play();
        });
        
        translationSelect.addEventListener('change', () => loadAyah());
        
        playBtn.addEventListener('click', togglePlay);
        prevAyahBtn.addEventListener('click', prevAyah);
        nextAyahBtn.addEventListener('click', nextAyah);
        prev10Btn.addEventListener('click', prev10Ayahs);
        next10Btn.addEventListener('click', next10Ayahs);
        prevSurahBtn.addEventListener('click', prevSurah);
        nextSurahBtn.addEventListener('click', nextSurah);
        
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ': e.preventDefault(); togglePlay(); break;
                case 'ArrowRight': prevAyah(); break;
                case 'ArrowLeft': nextAyah(); break;
                case 'ArrowUp': prevSurah(); break;
                case 'ArrowDown': nextSurah(); break;
            }
        });
        
        audio.volume = 0.8;
        initSurahList();
        loadAyah();
    </script>
</body>
</html>`;
}