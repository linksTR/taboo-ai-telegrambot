const { Telegraf } = require('telegraf');

// Railway'de environment variable'dan token al
const bot = new Telegraf(process.env.BOT_TOKEN);

// Türkçe kelime listesi
const kelimeler = [
    {
        kelime: "ELMA",
        yasaklar: ["meyve", "kırmızı", "ağaç", "sebze değil", "adem"]
    },
    {
        kelime: "FUTBOL", 
        yasaklar: ["top", "gol", "sahada", "11 kişi", "spor"]
    },
    {
        kelime: "TELEFON",
        yasaklar: ["aramak", "tuşlamak", "çalmak", "mobil", "cep"]
    },
    {
        kelime: "OKUL",
        yasaklar: ["öğrenci", "öğretmen", "ders", "eğitim", "sınıf"]
    },
    {
        kelime: "ARABA",
        yasaklar: ["araç", "sürücü", "yol", "motor", "tekerlek"]
    },
    {
        kelime: "KİTAP",
        yasaklar: ["okumak", "sayfa", "yazı", "kağıt", "yazar"]
    },
    {
        kelime: "DOKTOR",
        yasaklar: ["hasta", "iyileştirmek", "hastane", "sağlık", "beyaz önlük"]
    },
    {
        kelime: "PARA",
        yasaklar: ["lira", "dolar", "harçlık", "alışveriş", "zengin"]
    },
    {
        kelime: "AŞIK",
        yasaklar: ["sevmek", "kalp", "romantik", "öpmek", "sevgili"]
    },
    {
        kelime: "YEMEK",
        yasaklar: ["aç", "lezzetli", "tabak", "çatal", "kaşık"]
    },
    {
        kelime: "UYKU",
        yasaklar: ["yorgun", "yatak", "rüya", "gece", "yastık"]
    },
    {
        kelime: "DENIZ",
        yasaklar: ["su", "balık", "dalga", "yüzmek", "plaj"]
    },
    {
        kelime: "KÖPEK",
        yasaklar: ["havlamak", "kuyruk", "kemik", "sadık", "evcil hayvan"]
    },
    {
        kelime: "MÜZİK",
        yasaklar: ["şarkı", "nota", "çalmak", "dinlemek", "enstrüman"]
    },
    {
        kelime: "ANNE",
        yasaklar: ["doğurmak", "sevgi", "şefkat", "ev", "çocuk"]
    }
];

// Her chat için oyun durumu
const oyunDurumlari = new Map();

// Bot başladığında
bot.start((ctx) => {
    ctx.reply(`🎮 **TABOO OYUNUNA HOŞ GELDİN!**

📋 **Nasıl Oynanır?**
• Büyük harflerle yazılan kelimeyi tarif et
• Yasak kelimeleri ASLA kullanma
• Arkadaşların tahmin etsin!

🎯 **Komutlar:**
/yenioyun - Yeni oyun başlat
/kart - Kart çek
/dogru - Doğru bilindi
/gec - Bu kartı geç
/skor - Skorunu gör

**Haydi başlayalım! 🚀**`, 
    { parse_mode: 'Markdown' });
});

// Yeni oyun başlat
bot.command('yenioyun', (ctx) => {
    const chatId = ctx.chat.id;
    
    oyunDurumlari.set(chatId, {
        skor: 0,
        mevcutKelime: null,
        kullanilanlKelimeler: [],
        toplamKart: 0
    });
    
    ctx.reply(`🎯 **YENİ OYUN BAŞLADI!**
    
📊 Skor: 0
🎴 Hazır kartlar: ${kelimeler.length}

/kart komutu ile ilk kartını çek! 🚀`, 
    { 
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                [{ text: '🎴 Kart Çek' }, { text: '✅ Doğru' }],
                [{ text: '⏭️ Geç' }, { text: '📊 Skor' }]
            ],
            resize_keyboard: true
        }
    });
});

// Kart çek (hem komut hem buton)
bot.command('kart', kartCek);
bot.hears('🎴 Kart Çek', kartCek);

function kartCek(ctx) {
    const chatId = ctx.chat.id;
    let oyun = oyunDurumlari.get(chatId);
    
    // Eğer oyun yoksa yeni başlat
    if (!oyun) {
        oyun = {
            skor: 0,
            mevcutKelime: null,
            kullanilanlKelimeler: [],
            toplamKart: 0
        };
        oyunDurumlari.set(chatId, oyun);
    }
    
    // Rastgele kelime seç
    const kullanilmayanKelimeler = kelimeler.filter(k => 
        !oyun.kullanilanlKelimeler.includes(k.kelime)
    );
    
    if (kullanilmayanKelimeler.length === 0) {
        ctx.reply(`🎊 **OYUN BİTTİ!**
        
🏆 Final Skoru: ${oyun.skor}/${oyun.toplamKart}
📈 Başarı Oranı: %${Math.round((oyun.skor/oyun.toplamKart)*100)}

/yenioyun ile tekrar oyna! 🔄`, 
        { parse_mode: 'Markdown' });
        return;
    }
    
    const rastgeleKelime = kullanilmayanKelimeler[
        Math.floor(Math.random() * kullanilmayanKelimeler.length)
    ];
    
    oyun.mevcutKelime = rastgeleKelime;
    oyun.kullanilanlKelimeler.push(rastgeleKelime.kelime);
    oyun.toplamKart++;
    
    const mesaj = `🎯 **${rastgeleKelime.kelime}**

❌ **Yasak kelimeler:**
${rastgeleKelime.yasaklar.map(y => `• ${y}`).join('\n')}

📊 Kart: ${oyun.toplamKart} | Skor: ${oyun.skor}`;
    
    ctx.reply(mesaj, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '✅ Doğru Bilindi', callback_data: 'dogru' },
                    { text: '⏭️ Geç', callback_data: 'gec' }
                ],
                [
                    { text: '🎴 Yeni Kart', callback_data: 'kart' },
                    { text: '📊 Skor', callback_data: 'skor' }
                ]
            ]
        }
    });
}

// Doğru cevap (hem komut hem buton)
bot.command('dogru', dogruCevap);
bot.hears('✅ Doğru', dogruCevap);
bot.action('dogru', dogruCevap);

function dogruCevap(ctx) {
    const chatId = ctx.chat.id;
    const oyun = oyunDurumlari.get(chatId);
    
    if (!oyun || !oyun.mevcutKelime) {
        ctx.reply('❌ Önce /kart komutu ile kart çek!');
        return;
    }
    
    oyun.skor++;
    const mesaj = `🎉 **TEBRİKLER!**
    
✅ "${oyun.mevcutKelime.kelime}" doğru bilindi!
📊 Yeni Skor: ${oyun.skor}/${oyun.toplamKart}

Devam edelim! 🚀`;
    
    // Callback query ise answer et
    if (ctx.callbackQuery) {
        ctx.answerCbQuery('🎉 Doğru!');
    }
    
    ctx.reply(mesaj, { parse_mode: 'Markdown' });
}

// Geç (hem komut hem buton)
bot.command('gec', gecKart);
bot.hears('⏭️ Geç', gecKart);
bot.action('gec', gecKart);

function gecKart(ctx) {
    const chatId = ctx.chat.id;
    const oyun = oyunDurumlari.get(chatId);
    
    if (!oyun || !oyun.mevcutKelime) {
        ctx.reply('❌ Önce /kart komutu ile kart çek!');
        return;
    }
    
    // Callback query ise answer et
    if (ctx.callbackQuery) {
        ctx.answerCbQuery('⏭️ Geçildi');
    }
    
    ctx.reply(`⏭️ **"${oyun.mevcutKelime.kelime}" geçildi**
    
📊 Skor: ${oyun.skor}/${oyun.toplamKart}

Yeni kart için devam! 🎴`, 
    { parse_mode: 'Markdown' });
}

// Skor görüntüle (hem komut hem buton)
bot.command('skor', skorGoster);
bot.hears('📊 Skor', skorGoster);
bot.action('skor', skorGoster);

function skorGoster(ctx) {
    const chatId = ctx.chat.id;
    const oyun = oyunDurumlari.get(chatId);
    
    if (!oyun) {
        ctx.reply('❌ Henüz oyun başlatmadın! /yenioyun ile başla.');
        return;
    }
    
    const basariOrani = oyun.toplamKart > 0 ? Math.round((oyun.skor/oyun.toplamKart)*100) : 0;
    
    const mesaj = `📊 **SKOR TABLOSU**
    
🎯 Doğru Cevaplar: ${oyun.skor}
🎴 Toplam Kart: ${oyun.toplamKart}  
📈 Başarı Oranı: %${basariOrani}
📦 Kalan Kart: ${kelimeler.length - oyun.kullanilanlKelimeler.length}

${oyun.skor >= 10 ? '🏆 Harika gidiyorsun!' : oyun.skor >= 5 ? '👍 İyi oyun!' : '💪 Daha iyisini yapabilirsin!'}`;
    
    // Callback query ise answer et
    if (ctx.callbackQuery) {
        ctx.answerCbQuery('📊 Skor gösteriliyor');
    }
    
    ctx.reply(mesaj, { parse_mode: 'Markdown' });
}

// Yeni kart butonu
bot.action('kart', (ctx) => {
    ctx.answerCbQuery('🎴 Yeni kart çekiliyor...');
    kartCek(ctx);
});

// Yardım
bot.command('help', (ctx) => {
    ctx.reply(`🆘 **YARDIM**

🎮 **Komutlar:**
/start - Botu başlat
/yenioyun - Yeni oyun başlat
/kart - Yeni kart çek
/dogru - Kelime doğru bilindiğinde
/gec - Kartı geçmek için
/skor - Mevcut skoru gör

🎯 **Oyun Kuralları:**
• Büyük harfle yazılan kelimeyi arkadaşlarına tarif et
• Yasak kelimeleri kullanma
• Tahmin ettirmeye çalış!

🎪 **İpuçları:**
• El hareketleri kullanabilirsin
• Sesli tarif yapabilirsin  
• Yaratıcı ol!

**Keyifli oyunlar! 🎉**`, 
    { parse_mode: 'Markdown' });
});

// Hata yakalama
bot.catch((err, ctx) => {
    console.log('Bot hatası:', err);
    ctx.reply('⚠️ Bir hata oluştu, lütfen tekrar dene.');
});

// Health check endpoint (Railway için)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Taboo Telegram Bot çalışıyor!');
});

app.listen(PORT, () => {
    console.log(`Server çalışıyor: ${PORT}`);
});

// Botu başlat
bot.launch();

console.log('🤖 Taboo Bot başlatıldı!');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
