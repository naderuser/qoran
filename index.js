/**
 * قرآن صوتی همراه با متن
 * طراح: نادر اکشیک
 * Cloudflare Worker
 * 
 * API Sources:
 * - Text: AlQuran Cloud API (quran-simple edition for audio matching)
 * - Audio: Islamic Network CDN
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
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
    
    if (url.pathname === '/api/ayah') {
      const surah = url.searchParams.get('surah') || '1';
      const ayah = url.searchParams.get('ayah') || '1';
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
    { number: 1, name: "الفاتحة", nameEn: "Al-Faatiha", ayahCount: 7, type: "Meccan" },
    { number: 2, name: "البقرة", nameEn: "Al-Baqara", ayahCount: 286, type: "Medinan" },
    { number: 3, name: "آل عمران", nameEn: "Aal-Imran", ayahCount: 200, type: "Medinan" },
    { number: 4, name: "النساء", nameEn: "An-Nisa", ayahCount: 176, type: "Medinan" },
    { number: 5, name: "المائدة", nameEn: "Al-Ma'ida", ayahCount: 120, type: "Medinan" },
    { number: 6, name: "الأنعام", nameEn: "Al-An'am", ayahCount: 165, type: "Meccan" },
    { number: 7, name: "الأعراف", nameEn: "Al-A'raf", ayahCount: 206, type: "Meccan" },
    { number: 8, name: "الأنفال", nameEn: "Al-Anfal", ayahCount: 75, type: "Medinan" },
    { number: 9, name: "التوبة", nameEn: "At-Tawba", ayahCount: 129, type: "Medinan" },
    { number: 10, name: "يونس", nameEn: "Yunus", ayahCount: 109, type: "Meccan" },
    { number: 11, name: "هود", nameEn: "Hud", ayahCount: 123, type: "Meccan" },
    { number: 12, name: "يوسف", nameEn: "Yusuf", ayahCount: 111, type: "Meccan" },
    { number: 13, name: "الرعد", nameEn: "Ar-Ra'd", ayahCount: 43, type: "Medinan" },
    { number: 14, name: "إبراهيم", nameEn: "Ibrahim", ayahCount: 52, type: "Meccan" },
    { number: 15, name: "الحجر", nameEn: "Al-Hijr", ayahCount: 99, type: "Meccan" },
    { number: 16, name: "النحل", nameEn: "An-Nahl", ayahCount: 128, type: "Meccan" },
    { number: 17, name: "الإسراء", nameEn: "Al-Isra", ayahCount: 111, type: "Meccan" },
    { number: 18, name: "الكهف", nameEn: "Al-Kahf", ayahCount: 110, type: "Meccan" },
    { number: 19, name: "مريم", nameEn: "Maryam", ayahCount: 98, type: "Meccan" },
    { number: 20, name: "طه", nameEn: "Ta-Ha", ayahCount: 135, type: "Meccan" },
    { number: 21, name: "الأنبياء", nameEn: "Al-Anbiya", ayahCount: 112, type: "Meccan" },
    { number: 22, name: "الحج", nameEn: "Al-Hajj", ayahCount: 78, type: "Medinan" },
    { number: 23, name: "المؤمنون", nameEn: "Al-Mu'minun", ayahCount: 118, type: "Meccan" },
    { number: 24, name: "النور", nameEn: "An-Nur", ayahCount: 64, type: "Medinan" },
    { number: 25, name: "الفرقان", nameEn: "Al-Furqan", ayahCount: 77, type: "Meccan" },
    { number: 26, name: "الشعراء", nameEn: "Ash-Shu'ara", ayahCount: 227, type: "Meccan" },
    { number: 27, name: "النمل", nameEn: "An-Naml", ayahCount: 93, type: "Meccan" },
    { number: 28, name: "القصص", nameEn: "Al-Qasas", ayahCount: 88, type: "Meccan" },
    { number: 29, name: "العنكبوت", nameEn: "Al-Ankabut", ayahCount: 69, type: "Meccan" },
    { number: 30, name: "الروم", nameEn: "Ar-Rum", ayahCount: 60, type: "Meccan" },
    { number: 31, name: "لقمان", nameEn: "Luqman", ayahCount: 34, type: "Meccan" },
    { number: 32, name: "السجدة", nameEn: "As-Sajda", ayahCount: 30, type: "Meccan" },
    { number: 33, name: "الأحزاب", nameEn: "Al-Ahzab", ayahCount: 73, type: "Medinan" },
    { number: 34, name: "سبأ", nameEn: "Saba", ayahCount: 54, type: "Meccan" },
    { number: 35, name: "فاطر", nameEn: "Fatir", ayahCount: 45, type: "Meccan" },
    { number: 36, name: "يس", nameEn: "Ya-Sin", ayahCount: 83, type: "Meccan" },
    { number: 37, name: "الصافات", nameEn: "As-Saffat", ayahCount: 182, type: "Meccan" },
    { number: 38, name: "ص", nameEn: "Sad", ayahCount: 88, type: "Meccan" },
    { number: 39, name: "الزمر", nameEn: "Az-Zumar", ayahCount: 75, type: "Meccan" },
    { number: 40, name: "غافر", nameEn: "Ghafir", ayahCount: 85, type: "Meccan" },
    { number: 41, name: "فصلت", nameEn: "Fussilat", ayahCount: 54, type: "Meccan" },
    { number: 42, name: "الشورى", nameEn: "Ash-Shura", ayahCount: 53, type: "Meccan" },
    { number: 43, name: "الزخرف", nameEn: "Az-Zukhruf", ayahCount: 89, type: "Meccan" },
    { number: 44, name: "الدخان", nameEn: "Ad-Dukhan", ayahCount: 59, type: "Meccan" },
    { number: 45, name: "الجاثية", nameEn: "Al-Jathiya", ayahCount: 37, type: "Meccan" },
    { number: 46, name: "الأحقاف", nameEn: "Al-Ahqaf", ayahCount: 35, type: "Meccan" },
    { number: 47, name: "محمد", nameEn: "Muhammad", ayahCount: 38, type: "Medinan" },
    { number: 48, name: "الفتح", nameEn: "Al-Fath", ayahCount: 29, type: "Medinan" },
    { number: 49, name: "الحجرات", nameEn: "Al-Hujurat", ayahCount: 18, type: "Medinan" },
    { number: 50, name: "ق", nameEn: "Qaf", ayahCount: 45, type: "Meccan" },
    { number: 51, name: "الذاريات", nameEn: "Adh-Dhariyat", ayahCount: 60, type: "Meccan" },
    { number: 52, name: "الطور", nameEn: "At-Tur", ayahCount: 49, type: "Meccan" },
    { number: 53, name: "النجم", nameEn: "An-Najm", ayahCount: 62, type: "Meccan" },
    { number: 54, name: "القمر", nameEn: "Al-Qamar", ayahCount: 55, type: "Meccan" },
    { number: 55, name: "الرحمن", nameEn: "Ar-Rahman", ayahCount: 78, type: "Medinan" },
    { number: 56, name: "الواقعة", nameEn: "Al-Waqi'a", ayahCount: 96, type: "Meccan" },
    { number: 57, name: "الحديد", nameEn: "Al-Hadid", ayahCount: 29, type: "Medinan" },
    { number: 58, name: "المجادلة", nameEn: "Al-Mujadila", ayahCount: 22, type: "Medinan" },
    { number: 59, name: "الحشر", nameEn: "Al-Hashr", ayahCount: 24, type: "Medinan" },
    { number: 60, name: "الممتحنة", nameEn: "Al-Mumtahina", ayahCount: 13, type: "Medinan" },
    { number: 61, name: "الصف", nameEn: "As-Saff", ayahCount: 14, type: "Medinan" },
    { number: 62, name: "الجمعة", nameEn: "Al-Jumu'a", ayahCount: 11, type: "Medinan" },
    { number: 63, name: "المنافقون", nameEn: "Al-Munafiqun", ayahCount: 11, type: "Medinan" },
    { number: 64, name: "التغابن", nameEn: "At-Taghabun", ayahCount: 18, type: "Medinan" },
    { number: 65, name: "الطلاق", nameEn: "At-Talaq", ayahCount: 12, type: "Medinan" },
    { number: 66, name: "التحريم", nameEn: "At-Tahrim", ayahCount: 12, type: "Medinan" },
    { number: 67, name: "الملك", nameEn: "Al-Mulk", ayahCount: 30, type: "Meccan" },
    { number: 68, name: "القلم", nameEn: "Al-Qalam", ayahCount: 52, type: "Meccan" },
    { number: 69, name: "الحاقة", nameEn: "Al-Haqqa", ayahCount: 52, type: "Meccan" },
    { number: 70, name: "المعارج", nameEn: "Al-Ma'arj", ayahCount: 44, type: "Meccan" },
    { number: 71, name: "نوح", nameEn: "Nuh", ayahCount: 28, type: "Meccan" },
    { number: 72, name: "الجن", nameEn: "Al-Jinn", ayahCount: 28, type: "Meccan" },
    { number: 73, name: "المزمل", nameEn: "Al-Muzzammil", ayahCount: 20, type: "Meccan" },
    { number: 74, name: "المدثر", nameEn: "Al-Muddaththir", ayahCount: 56, type: "Meccan" },
    { number: 75, name: "القيامة", nameEn: "Al-Qiyama", ayahCount: 40, type: "Meccan" },
    { number: 76, name: "الإنسان", nameEn: "Al-Insan", ayahCount: 31, type: "Medinan" },
    { number: 77, name: "المرسلات", nameEn: "Al-Mursalat", ayahCount: 50, type: "Meccan" },
    { number: 78, name: "النبأ", nameEn: "An-Naba", ayahCount: 40, type: "Meccan" },
    { number: 79, name: "النازعات", nameEn: "An-Nazi'at", ayahCount: 46, type: "Meccan" },
    { number: 80, name: "عبس", nameEn: "Abasa", ayahCount: 42, type: "Meccan" },
    { number: 81, name: "التكوير", nameEn: "At-Takwir", ayahCount: 29, type: "Meccan" },
    { number: 82, name: "الإنفطار", nameEn: "Al-Infitar", ayahCount: 19, type: "Meccan" },
    { number: 83, name: "المطففين", nameEn: "Al-Mutaffifin", ayahCount: 36, type: "Meccan" },
    { number: 84, name: "الإنشقاق", nameEn: "Al-Inshiqaq", ayahCount: 25, type: "Meccan" },
    { number: 85, name: "البروج", nameEn: "Al-Buruj", ayahCount: 22, type: "Meccan" },
    { number: 86, name: "الطارق", nameEn: "At-Tariq", ayahCount: 17, type: "Meccan" },
    { number: 87, name: "الأعلى", nameEn: "Al-A'la", ayahCount: 19, type: "Meccan" },
    { number: 88, name: "الغاشية", nameEn: "Al-Ghashiya", ayahCount: 26, type: "Meccan" },
    { number: 89, name: "الفجر", nameEn: "Al-Fajr", ayahCount: 30, type: "Meccan" },
    { number: 90, name: "البلد", nameEn: "Al-Balad", ayahCount: 20, type: "Meccan" },
    { number: 91, name: "الشمس", nameEn: "Ash-Shams", ayahCount: 15, type: "Meccan" },
    { number: 92, name: "الليل", nameEn: "Al-Layl", ayahCount: 21, type: "Meccan" },
    { number: 93, name: "الضحى", nameEn: "Ad-Duha", ayahCount: 11, type: "Meccan" },
    { number: 94, name: "الشرح", nameEn: "Ash-Sharh", ayahCount: 8, type: "Meccan" },
    { number: 95, name: "التين", nameEn: "At-Tin", ayahCount: 8, type: "Meccan" },
    { number: 96, name: "العلق", nameEn: "Al-Alaq", ayahCount: 19, type: "Meccan" },
    { number: 97, name: "القدر", nameEn: "Al-Qadr", ayahCount: 5, type: "Meccan" },
    { number: 98, name: "البينة", nameEn: "Al-Bayyina", ayahCount: 8, type: "Medinan" },
    { number: 99, name: "الزلزلة", nameEn: "Az-Zalzala", ayahCount: 8, type: "Medinan" },
    { number: 100, name: "العاديات", nameEn: "Al-Adiyat", ayahCount: 11, type: "Meccan" },
    { number: 101, name: "القارعة", nameEn: "Al-Qari'a", ayahCount: 11, type: "Meccan" },
    { number: 102, name: "التكاثر", nameEn: "At-Takathur", ayahCount: 8, type: "Meccan" },
    { number: 103, name: "العصر", nameEn: "Al-Asr", ayahCount: 3, type: "Meccan" },
    { number: 104, name: "الهمزة", nameEn: "Al-Humaza", ayahCount: 9, type: "Meccan" },
    { number: 105, name: "الفيل", nameEn: "Al-Fil", ayahCount: 5, type: "Meccan" },
    { number: 106, name: "قريش", nameEn: "Quraysh", ayahCount: 4, type: "Meccan" },
    { number: 107, name: "الماعون", nameEn: "Al-Ma'un", ayahCount: 7, type: "Meccan" },
    { number: 108, name: "الكوثر", nameEn: "Al-Kawthar", ayahCount: 3, type: "Meccan" },
    { number: 109, name: "الكافرون", nameEn: "Al-Kafirun", ayahCount: 6, type: "Meccan" },
    { number: 110, name: "النصر", nameEn: "An-Nasr", ayahCount: 3, type: "Medinan" },
    { number: 111, name: "المسد", nameEn: "Al-Masad", ayahCount: 5, type: "Meccan" },
    { number: 112, name: "الإخلاص", nameEn: "Al-Ikhlas", ayahCount: 4, type: "Meccan" },
    { number: 113, name: "الفلق", nameEn: "Al-Falaq", ayahCount: 5, type: "Meccan" },
    { number: 114, name: "الناس", nameEn: "An-Nas", ayahCount: 6, type: "Meccan" }
  ];

  return new Response(JSON.stringify(surahData), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// Get specific ayah with matching text and audio
async function getAyah(surah, ayah, reciter, translation) {
  try {
    // Fetch Arabic text (quran-simple = no diacritics, matches audio)
    // Fetch translation
    const [arabicRes, transRes] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-simple`),
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${translation}`)
    ]);

    const arabicData = await arabicRes.json();
    const transData = await transRes.json();

    // Calculate global verse number for audio
    const globalVerseNumber = getGlobalVerseNumber(parseInt(surah), parseInt(ayah));

    const result = {
      surah: parseInt(surah),
      ayah: parseInt(ayah),
      arabic: arabicData.data?.text || '',
      translation: transData.data?.text || '',
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalVerseNumber}.mp3`
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

// Redirect to audio CDN
function getAudioRedirect(surah, ayah, reciter) {
  const globalVerseNumber = getGlobalVerseNumber(parseInt(surah), parseInt(ayah));
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalVerseNumber}.mp3`;
  return Response.redirect(audioUrl, 302);
}

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
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
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
        }
        
        .bg-pattern {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
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
        }
        
        .designer {
            font-size: 0.9rem;
            color: var(--secondary);
            margin-top: 10px;
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
        
        .select-group { display: flex; flex-direction: column; gap: 8px; }
        
        .select-group label {
            font-size: 0.85rem;
            color: var(--secondary);
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
        }
        
        select:hover { border-color: var(--gold); }
        
        .player-card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(212, 175, 55, 0.15);
            margin-bottom: 30px;
        }
        
        .now-playing { text-align: center; margin-bottom: 25px; }
        
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
        }
        
        .arabic-text {
            font-family: 'Amiri', serif;
            font-size: 2.5rem;
            line-height: 2.2;
            color: var(--text-arabic);
            direction: rtl;
        }
        
        .translation {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(212, 175, 55, 0.15);
            font-size: 1.1rem;
            color: rgba(212, 229, 212, 0.85);
            line-height: 1.8;
        }
        
        .audio-controls { display: flex; flex-direction: column; gap: 20px; }
        
        .progress-container { display: flex; align-items: center; gap: 12px; }
        
        .time-display {
            font-size: 0.85rem;
            color: rgba(212, 229, 212, 0.6);
            min-width: 45px;
            text-align: center;
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
            font-size: 1.2rem;
        }
        
        .volume-slider {
            width: 100px;
            height: 4px;
            -webkit-appearance: none;
            background: rgba(212, 175, 55, 0.2);
            border-radius: 2px;
        }
        
        .volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 14px;
            height: 14px;
            background: var(--gold);
            border-radius: 50%;
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
        }
        
        .nav-btn:hover { background: rgba(212, 175, 55, 0.2); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
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
        }
        
        .surah-details h3 { font-size: 1rem; color: var(--text-farsi); }
        .surah-details span { font-size: 0.8rem; color: rgba(212, 229, 212, 0.6); }
        
        .loading {
            display: none;
            justify-content: center;
            padding: 40px;
        }
        
        .loading.active { display: flex; }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(212, 175, 55, 0.2);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .toast {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: var(--bg-card);
            border: 1px solid var(--gold);
            padding: 15px 30px;
            border-radius: 12px;
            opacity: 0;
            transition: all 0.4s ease;
            z-index: 1000;
        }
        
        .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
        
        footer {
            text-align: center;
            padding: 40px 20px;
            margin-top: 50px;
            border-top: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        footer p { font-size: 0.85rem; color: rgba(212, 229, 212, 0.5); }
        .tafsir-link { color: var(--gold); text-decoration: none; }
        
        @media (max-width: 600px) {
            .bismillah { font-size: 2.2rem; }
            h1 { font-size: 1.4rem; }
            .arabic-text { font-size: 1.8rem; }
            .selection-panel { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    
    <div class="container">
        <header>
            <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ</div>
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
                <div class="ayah-number" id="ayahNumber">۱</div>
                <div class="loading" id="loadingState">
                    <div class="spinner"></div>
                </div>
                <p class="arabic-text" id="arabicText">بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ</p>
                <p class="translation" id="translationText">نام خداوند بخشنده مهربان</p>
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
                    <button class="control-btn" id="prevAyahBtn" title="آیه قبلی">⏮</button>
                    <button class="control-btn" id="prev10Btn" title="۱۰ آیه قبل">⏪</button>
                    <button class="control-btn play-btn" id="playBtn" title="پخش">▶</button>
                    <button class="control-btn" id="next10Btn" title="۱۰ آیه بعد">⏩</button>
                    <button class="control-btn" id="nextAyahBtn" title="آیه بعدی">⏭</button>
                </div>
                
                <div class="volume-container">
                    <button class="volume-btn" id="volumeBtn">🔊</button>
                    <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="80">
                </div>
            </div>
            
            <div class="nav-controls">
                <button class="nav-btn" id="prevSurahBtn">◀ سوره قبلی</button>
                <button class="nav-btn" id="nextSurahBtn">سوره بعدی ▶</button>
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
        let shouldAutoPlay = false;
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
                option.textContent = (index + 1) + '. ' + name + ' (' + surahAyahCounts[index] + ')';
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
            
            const reciter = reciterSelect.value;
            const translation = translationSelect.value;
            
            // Set audio with global verse number (this matches the text)
            const globalVerse = getGlobalVerseNumber(currentSurah, currentAyah);
            audio.src = 'https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + globalVerse + '.mp3';
            
            try {
                // Fetch from API with quran-simple edition (no diacritics, matches audio)
                const response = await fetch('/api/ayah?surah=' + currentSurah + '&ayah=' + currentAyah + '&translation=' + translation);
                const data = await response.json();
                
                if (data.arabic) arabicText.textContent = data.arabic;
                if (data.translation) translationText.textContent = data.translation;
            } catch (error) {
                console.error('Error loading ayah:', error);
            }
            
            // Auto-play if coming from previous ayah ended
            if (shouldAutoPlay) {
                audio.play().then(() => {
                    isPlaying = true;
                    playBtn.textContent = '⏸';
                }).catch(e => console.error('Auto-play failed:', e));
                shouldAutoPlay = false;
            }
            
            updateNavButtons();
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
                shouldAutoPlay = isPlaying;
                loadAyah();
            }
        }
        
        function nextAyah() {
            if (currentAyah < totalAyahs) {
                currentAyah++;
                shouldAutoPlay = isPlaying;
                loadAyah();
            }
        }
        
        function prev10Ayahs() {
            currentAyah = Math.max(1, currentAyah - 10);
            shouldAutoPlay = isPlaying;
            loadAyah();
        }
        
        function next10Ayahs() {
            currentAyah = Math.min(totalAyahs, currentAyah + 10);
            shouldAutoPlay = isPlaying;
            loadAyah();
        }
        
        function prevSurah() {
            if (currentSurah > 1) {
                currentSurah--;
                currentAyah = 1;
                surahSelect.value = currentSurah;
                shouldAutoPlay = isPlaying;
                loadAyah();
            }
        }
        
        function nextSurah() {
            if (currentSurah < 114) {
                currentSurah++;
                currentAyah = 1;
                surahSelect.value = currentSurah;
                shouldAutoPlay = isPlaying;
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
            isPlaying = false;
            if (currentAyah < totalAyahs) {
                shouldAutoPlay = true;
                nextAyah();
            } else if (currentSurah < 114) {
                shouldAutoPlay = true;
                nextSurah();
            } else {
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
            const globalVerse = getGlobalVerseNumber(currentSurah, currentAyah);
            audio.src = 'https://cdn.islamic.network/quran/audio/128/' + reciter + '/' + globalVerse + '.mp3';
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