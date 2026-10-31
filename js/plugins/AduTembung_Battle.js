//=============================================================================
// AduTembung_Battle.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [Sistem] Battle kata "Adu Tembung" (tarik tambang).
 * @orderAfter Kamus_Sistem
 * @orderAfter AduTembung_BankSoal
 *
 * @help
 * Butuh: Kamus_Data, Kamus_Sistem, AduTembung_BankSoal.
 *
 * CARA MAIN
 *   Bar di tengah = tarik tambang. Jawaban benar mendorong bar ke musuh,
 *   salah / kehabisan waktu mendorong balik. Musuh juga terus menekan.
 *   Jawab cepat = dorongan lebih kuat. Benar berturut-turut = combo.
 *   Bar mentok di sisi musuh = MENANG, di sisi kita = KALAH.
 *
 * MEMANGGIL: Event > Plugin Command > AduTembung_Battle > Mulai Adu Tembung
 *
 * HASIL, pilih salah satu:
 *   - Isi "Switch Hasil" di plugin command, lalu
 *     Conditional Branch > Switch (ON = menang).
 *   - Conditional Branch > Script:  aduMenang()
 *
 * @param StartPos
 * @text Posisi Awal Bar
 * @desc 0 = kita kalah, 100 = menang.
 * @type number
 * @min 1
 * @max 99
 * @default 50
 *
 * @param PushBase
 * @text Dorongan Jawaban Benar
 * @type number
 * @default 20
 *
 * @param PushSpeed
 * @text Bonus Jawab Cepat
 * @desc Bonus maksimal kalau menjawab sangat cepat.
 * @type number
 * @default 6
 *
 * @param PushCombo
 * @text Bonus per Combo
 * @desc Ditambahkan per jawaban benar berturut-turut (maks 4 tingkat).
 * @type number
 * @default 2
 *
 * @param PushWrong
 * @text Dorongan Balik (Salah)
 * @desc Bar mundur sebanyak ini kalau salah atau waktu habis.
 * @type number
 * @default 5
 *
 * @param Level1
 * @text Level 1 (Gampang)
 * @type struct<Level>
 * @default {"waktu":"10.0","tekanan":"1.2"}
 *
 * @param Level2
 * @text Level 2 (Sedang)
 * @type struct<Level>
 * @default {"waktu":"7.0","tekanan":"2.0"}
 *
 * @param Level3
 * @text Level 3 (Susah)
 * @type struct<Level>
 * @default {"waktu":"5.0","tekanan":"3.0"}
 *
 * @param PlayBgm
 * @text Putar Musik Battle
 * @desc Pakai Battle BGM & Victory ME dari Database > System.
 * @type boolean
 * @default true
 *
 * @param Texts
 * @text Teks di Layar
 * @type struct<Texts>
 * @default {"krama":"Basa krama saka '%1' yaiku...?","inggil":"Basa krama inggil saka '%1' yaiku...?","ngoko":"Basa ngoko saka '%1' yaiku...?","ukara":"Isenana:","right":"Leres!","wrong":"Lepat! Ingkang leres: %1","timeout":"Wektu entek! Ingkang leres: %1","combo":"Combo x%1","win":"MENANG!","lose":"KALAH...","press":"(pencet OK)","enemy":"Mungsuh"}
 *
 * @param Colors
 * @text Warna
 * @type struct<Colors>
 * @default {"player":"rgb(70,140,255)","enemy":"rgb(230,70,70)","timer":"rgb(255,210,60)","frame":"rgb(20,20,30)"}
 *
 * @command Mulai
 * @text Mulai Adu Tembung
 * @desc Memulai battle kata.
 *
 * @arg nama
 * @text Nama Musuh
 * @default Mungsuh
 *
 * @arg face
 * @text Wajah Musuh
 * @type file
 * @dir img/faces/
 * @require 1
 * @default
 *
 * @arg faceIndex
 * @text Nomor Wajah
 * @type number
 * @min 0
 * @max 7
 * @default 0
 *
 * @arg level
 * @text Level
 * @type select
 * @option 1 - Gampang
 * @value 1
 * @option 2 - Sedang
 * @value 2
 * @option 3 - Susah
 * @value 3
 * @default 2
 *
 * @arg bank
 * @text Bank Soal
 * @desc Nama bank di AduTembung_BankSoal, mis. penjaga. Kosong = soal otomatis kamus.
 * @default
 *
 * @arg campur
 * @text Campur dengan Soal Otomatis
 * @desc Bank soal + soal otomatis dari kamus.
 * @type boolean
 * @default false
 *
 * @arg soalKrama
 * @text Soal Otomatis: Krama
 * @type boolean
 * @default true
 *
 * @arg soalInggil
 * @text Soal Otomatis: Krama Inggil
 * @type boolean
 * @default true
 *
 * @arg soalNgoko
 * @text Soal Otomatis: Ngoko
 * @type boolean
 * @default true
 *
 * @arg soalUkara
 * @text Soal Otomatis: Isian Kalimat
 * @type boolean
 * @default true
 *
 * @arg kebuka
 * @text Hanya Kata Terbuka
 * @desc Soal otomatis hanya dari kata yang sudah terbuka di kamus.
 * @type boolean
 * @default false
 *
 * @arg switchId
 * @text Switch Hasil
 * @desc Switch ini ON kalau menang, OFF kalau kalah. 0 = tidak dipakai.
 * @type switch
 * @default 0
 */
/*~struct~Level:
 * @param waktu
 * @text Detik per Soal
 * @type number
 * @decimals 1
 * @min 1
 * @default 7.0
 *
 * @param tekanan
 * @text Tekanan Musuh per Detik
 * @type number
 * @decimals 1
 * @default 2.0
 */
/*~struct~Texts:
 * @param krama
 * @text Soal Krama
 * @default Basa krama saka '%1' yaiku...?
 * @param inggil
 * @text Soal Krama Inggil
 * @default Basa krama inggil saka '%1' yaiku...?
 * @param ngoko
 * @text Soal Ngoko
 * @default Basa ngoko saka '%1' yaiku...?
 * @param ukara
 * @text Soal Isian
 * @default Isenana:
 * @param right
 * @text Benar
 * @default Leres!
 * @param wrong
 * @text Salah
 * @default Lepat! Ingkang leres: %1
 * @param timeout
 * @text Waktu Habis
 * @default Wektu entek! Ingkang leres: %1
 * @param combo
 * @text Combo
 * @default Combo x%1
 * @param win
 * @text Menang
 * @default MENANG!
 * @param lose
 * @text Kalah
 * @default KALAH...
 * @param press
 * @text Tekan Tombol
 * @default (pencet OK)
 * @param enemy
 * @text Nama Musuh Default
 * @default Mungsuh
 */
/*~struct~Colors:
 * @param player
 * @text Bar Pemain
 * @default rgb(70,140,255)
 * @param enemy
 * @text Bar Musuh
 * @default rgb(230,70,70)
 * @param timer
 * @text Bar Waktu
 * @default rgb(255,210,60)
 * @param frame
 * @text Bingkai
 * @default rgb(20,20,30)
 */

(() => {
    "use strict";
    const PLUGIN = "AduTembung_Battle";
    const P = PluginManager.parameters(PLUGIN);
    const parse = (text, fallback) => {
        try { return JSON.parse(text); } catch (e) { return fallback; }
    };
    const num = (v, d) => (v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
    const level = (text, t, p) => {
        const o = parse(text, {}) || {};
        return { time: num(o.waktu, t), pressure: num(o.tekanan, p) };
    };

    window.AduTembung = window.AduTembung || {};
    const A = AduTembung;
    A.BANK = A.BANK || {};
    A.START_POS  = num(P.StartPos, 50);
    A.PUSH_BASE  = num(P.PushBase, 20);
    A.PUSH_SPEED = num(P.PushSpeed, 6);
    A.PUSH_COMBO = num(P.PushCombo, 2);
    A.PUSH_WRONG = num(P.PushWrong, 5);
    A.PLAY_BGM   = P.PlayBgm !== "false";
    A.LEVELS = {
        1: level(P.Level1, 10.0, 1.2),
        2: level(P.Level2, 7.0, 2.0),
        3: level(P.Level3, 5.0, 3.0)
    };
    A.T = Object.assign({
        krama: "Basa krama saka '%1' yaiku...?",
        inggil: "Basa krama inggil saka '%1' yaiku...?",
        ngoko: "Basa ngoko saka '%1' yaiku...?",
        ukara: "Isenana:", right: "Leres!",
        wrong: "Lepat! Ingkang leres: %1", timeout: "Wektu entek! Ingkang leres: %1",
        combo: "Combo x%1", win: "MENANG!", lose: "KALAH...", press: "(pencet OK)",
        enemy: "Mungsuh"
    }, parse(P.Texts, {}) || {});
    A.C = Object.assign({
        player: "rgb(70,140,255)", enemy: "rgb(230,70,70)",
        timer: "rgb(255,210,60)", frame: "rgb(20,20,30)"
    }, parse(P.Colors, {}) || {});

    const fmt = (text, value) => String(text).replace("%1", value);
    const sample = arr => arr[Math.floor(Math.random() * arr.length)];
    const shuffle = arr => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordRe = f => new RegExp("\\b" + escapeRe(f) + "\\b", "i");
    const ALL_TYPES = ["krama", "inggil", "ngoko", "ukara"];

    //=========================================================================
    // Pembuat soal
    //   soal = { key, prompt, sentence, hint, answer, choices[] }
    //=========================================================================
    A.kamusWords = () => (window.Kamus && Kamus.words ? Kamus.words() : []);

    A.pool = function(onlyUnlocked) {
        const words = A.kamusWords();
        if (!onlyUnlocked) return words;
        const open = $gameSystem.kamusUnlocked();
        return words.filter(w => open.includes(w.key)); // ketat, boleh kosong
    };

    // Hanya memakai kata di "words". null kalau tidak ada soal yang bisa dibuat.
    A.makeQuestion = function(types, words) {
        if (!words || words.length === 0 || types.length === 0) return null;
        for (let i = 0; i < 40; i++) {
            const q = A.tryQuestion(sample(types), sample(words), words);
            if (q) return q;
        }
        for (const w of shuffle(words)) {
            for (const t of shuffle(types)) {
                const q = A.tryQuestion(t, w, words);
                if (q) return q;
            }
        }
        return null;
    };

    A.tryQuestion = function(type, w, words) {
        const q = A.buildQuestion(type, w, words);
        return q && q.choices.length >= 2 ? q : null;
    };

    A.buildQuestion = function(type, w, words) {
        const { ngoko, krama, inggil } = w;
        let prompt, answer, lvl;
        switch (type) {
            case "krama":
                if (krama === "-" || krama === ngoko) return null;
                prompt = fmt(A.T.krama, ngoko); answer = krama; lvl = "krama";
                break;
            case "inggil":
                if (inggil === "-" || inggil === krama) return null;
                prompt = fmt(A.T.inggil, ngoko); answer = inggil; lvl = "inggil";
                break;
            case "ngoko": {
                const src = inggil !== "-" ? inggil : krama;
                if (src === "-" || src === ngoko) return null;
                prompt = fmt(A.T.ngoko, src); answer = ngoko; lvl = "ngoko";
                break;
            }
            case "ukara": {
                if (!w.contoh || w.contoh.length === 0) return null;
                const sentence = sample(w.contoh);
                const found = Kamus.forms(w).find(f => wordRe(f).test(sentence));
                if (!found) return null;
                const ans = found.toLowerCase();
                return {
                    key: w.key + ":ukara", prompt: A.T.ukara,
                    sentence: sentence.replace(wordRe(found), "____"),
                    hint: "(" + w.arti + ")",
                    answer: ans, choices: A.choicesFor(ans, w, words, null)
                };
            }
            default:
                return null;
        }
        return {
            key: w.key + ":" + type, prompt, sentence: "", hint: "",
            answer: answer.toLowerCase(),
            choices: A.choicesFor(answer.toLowerCase(), w, words, lvl)
        };
    };

    // Pengecoh: bentuk lain dari kata yang sama (jebakan unggah-ungguh)
    // + bentuk setingkat dari kata lain
    A.choicesFor = function(answer, w, words, lvl) {
        const list = [answer, ...Kamus.forms(w).map(f => f.toLowerCase())];
        for (const o of shuffle(words.filter(o => o.key !== w.key))) {
            if (new Set(list).size >= 4) break;
            const f = lvl ? o[lvl] : sample(Kamus.forms(o));
            if (f && f !== "-") list.push(f.toLowerCase());
        }
        return shuffle([...new Set(list)].slice(0, 4));
    };

    //=========================================================================
    // Sumber soal untuk satu battle
    //=========================================================================
    A.Sumber = class {
        constructor(opts) {
            this._types = opts.jenis.length > 0 ? opts.jenis : ALL_TYPES.slice();
            this._bank = opts.bank ? (A.BANK[opts.bank.toLowerCase()] || []) : [];
            this._auto = this._bank.length === 0 || opts.campur;
            this._deck = [];
            this._last = null;
            if (this._auto) {
                this._words = A.pool(opts.kebuka);
                // Kata terbuka belum cukup untuk soal otomatis:
                //  - ada bank   -> pakai bank saja
                //  - tanpa bank -> terpaksa pakai semua kata kamus
                if (!A.makeQuestion(this._types, this._words)) {
                    if (this._bank.length === 0) {
                        this._words = A.kamusWords();
                        if (!A.makeQuestion(this._types, this._words)) this._types = ALL_TYPES.slice();
                    } else {
                        this._auto = false;
                    }
                }
            }
        }

        next() {
            let q = null;
            for (let i = 0; i < 6; i++) {
                const useBank = this._bank.length > 0 && (!this._auto || Math.random() < 0.5);
                q = useBank ? this.fromBank() : this.fromKamus();
                if (!q && this._bank.length > 0) q = this.fromBank();
                if (q && q.key !== this._last) break;
            }
            this._last = q ? q.key : null;
            return q;
        }

        fromBank() {
            if (this._deck.length === 0) this._deck = shuffle([...this._bank.keys()]);
            const i = this._deck.shift();
            const s = this._bank[i];
            return {
                key: "bank:" + i, prompt: s.tanya, sentence: s.ukara, hint: s.petunjuk,
                answer: s.jawab, choices: shuffle([...new Set([s.jawab, ...s.pengecoh])].slice(0, 4))
            };
        }

        fromKamus() {
            return A.makeQuestion(this._types, this._words);
        }
    };

    //=========================================================================
    // Plugin command & helper
    //=========================================================================
    PluginManager.registerCommand(PLUGIN, "Mulai", args => {
        const jenis = [];
        if (args.soalKrama !== "false") jenis.push("krama");
        if (args.soalInggil !== "false") jenis.push("inggil");
        if (args.soalNgoko !== "false") jenis.push("ngoko");
        if (args.soalUkara !== "false") jenis.push("ukara");
        $gameTemp._aduOpts = {
            nama: args.nama || A.T.enemy,
            face: args.face || "",
            faceIndex: num(args.faceIndex, 0),
            level: num(args.level, 2),
            bank: String(args.bank || "").trim(),
            campur: args.campur === "true",
            jenis: jenis,
            kebuka: args.kebuka === "true",
            switchId: num(args.switchId, 0)
        };
        SceneManager.push(Scene_AduTembung);
    });

    window.aduMenang = () => $gameSystem._aduResult === "win";

    //=========================================================================
    // Window_AduStatus — wajah, bar tarik tambang, timer
    //=========================================================================
    const FACE = 96;

    function Window_AduStatus() {
        this.initialize(...arguments);
    }
    Window_AduStatus.prototype = Object.create(Window_Base.prototype);
    Window_AduStatus.prototype.constructor = Window_AduStatus;

    Window_AduStatus.prototype.initialize = function(rect, enemyName, face, faceIndex) {
        Window_Base.prototype.initialize.call(this, rect);
        this._enemyName = enemyName;
        this._face = face;
        this._faceIndex = faceIndex;
        this._last = "";
    };

    Window_AduStatus.prototype.setState = function(pos, timerRate, combo) {
        const key = [Math.round(pos), Math.round(timerRate * 100), combo].join(",");
        if (key === this._last) return;
        this._last = key;
        this.refreshState(pos, timerRate, combo);
    };

    Window_AduStatus.prototype.drawFaceScaled = function(name, index, x, y) {
        const bitmap = ImageManager.loadFace(name);
        const pw = ImageManager.faceWidth;
        const ph = ImageManager.faceHeight;
        const sx = (index % 4) * pw;
        const sy = Math.floor(index / 4) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, FACE, FACE);
    };

    Window_AduStatus.prototype.refreshState = function(pos, timerRate, combo) {
        const c = this.contents;
        c.clear();
        const cw = this.innerWidth;
        const leader = $gameParty.leader();
        if (leader && leader.faceName()) {
            this.drawFaceScaled(leader.faceName(), leader.faceIndex(), 0, 0);
        }
        if (this._face) this.drawFaceScaled(this._face, this._faceIndex, cw - FACE, 0);
        const bx = FACE + 16;
        const bw = cw - bx * 2;

        // baris 1: nama
        c.fontSize = $gameSystem.mainFontSize() - 4;
        this.changeTextColor(A.C.player);
        this.drawText(leader ? leader.name() : "", bx, -4, bw / 2 - 4, "left");
        this.changeTextColor(A.C.enemy);
        this.drawText(this._enemyName, bx + bw / 2 + 4, -4, bw / 2 - 4, "right");
        this.resetFontSettings();
        this.resetTextColor();

        // baris 2: bar tarik tambang
        const by = 34, bh = 30;
        const pw = Math.round(bw * Math.max(0, Math.min(100, pos)) / 100);
        c.fillRect(bx - 3, by - 3, bw + 6, bh + 6, A.C.frame);
        c.fillRect(bx, by, pw, bh, A.C.player);
        c.fillRect(bx + pw, by, bw - pw, bh, A.C.enemy);
        c.fillRect(bx, by, bw, Math.floor(bh / 3), "rgba(255,255,255,0.22)");   // kilap
        c.fillRect(bx, by + bh - 4, bw, 4, "rgba(0,0,0,0.25)");                // bayangan
        c.fillRect(bx + Math.floor(bw / 2) - 1, by, 2, bh, "rgba(255,255,255,0.45)"); // garis tengah
        c.fillRect(bx + pw - 4, by - 7, 8, bh + 14, A.C.frame);                 // penanda posisi
        c.fillRect(bx + pw - 2, by - 5, 4, bh + 10, "#ffffff");
        if (combo >= 2) {
            c.fontSize = $gameSystem.mainFontSize() - 6;
            this.changeTextColor(ColorManager.crisisColor());
            this.drawText(fmt(A.T.combo, combo), bx, by + bh / 2 - this.lineHeight() / 2, bw, "center");
            this.resetFontSettings();
            this.resetTextColor();
        }

        // baris 3: waktu
        const ty = by + bh + 12;
        const low = timerRate < 0.3;
        c.fillRect(bx - 2, ty - 2, bw + 4, 12, A.C.frame);
        c.fillRect(bx, ty, Math.round(bw * timerRate), 8, low ? A.C.enemy : A.C.timer);
    };

    //=========================================================================
    // Window_AduQuestion — soal & tanggapan
    //=========================================================================
    function Window_AduQuestion() {
        this.initialize(...arguments);
    }
    Window_AduQuestion.prototype = Object.create(Window_Base.prototype);
    Window_AduQuestion.prototype.constructor = Window_AduQuestion;

    Window_AduQuestion.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._q = null;
        this._feedback = null;
    };

    Window_AduQuestion.prototype.showQuestion = function(q) {
        this._q = q;
        this._feedback = null;
        this.refresh();
    };

    Window_AduQuestion.prototype.showFeedback = function(text, good) {
        this._feedback = { text, good };
        this.refresh();
    };

    Window_AduQuestion.prototype.showResult = function(text, good) {
        this.contents.clear();
        const cw = this.innerWidth;
        const ch = this.innerHeight;
        this.contents.fontSize = 44;
        this.changeTextColor(good ? ColorManager.powerUpColor() : ColorManager.powerDownColor());
        this.drawText(text, 0, ch / 2 - 48, cw, "center");
        this.resetFontSettings();
        this.changePaintOpacity(false);
        this.drawText(A.T.press, 0, ch / 2 + 16, cw, "center");
        this.changePaintOpacity(true);
    };

    // Pecah teks jadi beberapa baris sesuai lebar jendela (pakai ukuran font saat ini)
    Window_AduQuestion.prototype.wrapLines = function(text) {
        const cw = this.innerWidth - 16;
        const lines = [];
        let line = "";
        for (const word of String(text).split(/\s+/)) {
            const test = line ? line + " " + word : word;
            if (this.textWidth(test) > cw && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    };

    Window_AduQuestion.prototype.refresh = function() {
        const c = this.contents;
        c.clear();
        const q = this._q;
        if (!q) return;
        const cw = this.innerWidth;
        const lh = this.lineHeight();
        const base = $gameSystem.mainFontSize();

        // susun blok teks: pertanyaan, kalimat isian, petunjuk
        const blocks = [{ text: q.prompt, size: base + 2, lh: lh, color: ColorManager.systemColor(), gap: 12 }];
        if (q.sentence) {
            blocks.push({ text: q.sentence, size: base + 12, lh: lh + 14, color: ColorManager.normalColor(), gap: 4 });
            if (q.hint) blocks.push({ text: q.hint, size: base - 4, lh: lh - 6, dim: true, gap: 0 });
        }
        let total = 0;
        for (const b of blocks) {
            c.fontSize = b.size;
            b.lines = this.wrapLines(b.text);
            total += b.lines.length * b.lh + b.gap;
        }
        // taruh di tengah ruang di atas pita tanggapan
        const band = lh + 16;
        let y = Math.max(4, Math.floor((this.innerHeight - band - total) / 2));
        for (const b of blocks) {
            c.fontSize = b.size;
            this.changeTextColor(b.color || ColorManager.normalColor());
            this.changePaintOpacity(!b.dim);
            for (const line of b.lines) {
                this.drawText(line, 8, y + (b.lh - lh) / 2, cw - 16, "center");
                y += b.lh;
            }
            y += b.gap;
        }
        this.changePaintOpacity(true);
        this.resetFontSettings();

        // pita tanggapan di bawah
        if (this._feedback) {
            const f = this._feedback;
            const fy = this.innerHeight - lh - 8;
            c.fillRect(0, fy - 4, cw, lh + 8, f.good ? "rgba(40,160,80,0.35)" : "rgba(200,50,50,0.35)");
            this.changeTextColor(f.good ? ColorManager.powerUpColor() : ColorManager.powerDownColor());
            this.drawText(f.text, 0, fy, cw, "center");
        }
        this.resetTextColor();
    };

    //=========================================================================
    // Window_AduChoice — pilihan jawaban 2 x 2
    //=========================================================================
    function Window_AduChoice() {
        this.initialize(...arguments);
    }
    Window_AduChoice.prototype = Object.create(Window_Command.prototype);
    Window_AduChoice.prototype.constructor = Window_AduChoice;

    Window_AduChoice.prototype.initialize = function(rect) {
        this._choices = [];
        Window_Command.prototype.initialize.call(this, rect);
        this.deactivate();
    };

    Window_AduChoice.prototype.maxCols = function() {
        return 2;
    };

    Window_AduChoice.prototype.drawItem = function(index) {
        const rect = this.itemLineRect(index);
        const lw = 40;
        this.changeTextColor(ColorManager.systemColor());
        this.drawText("ABCD"[index] + ".", rect.x, rect.y, lw);
        this.resetTextColor();
        this.drawText(this.commandName(index), rect.x + lw, rect.y, rect.width - lw * 2, "center");
    };

    Window_AduChoice.prototype.makeCommandList = function() {
        (this._choices || []).forEach((c, i) => this.addCommand(c, "choice", true, i));
    };

    Window_AduChoice.prototype.setChoices = function(list) {
        this._choices = list;
        this.refresh();
        this.select(0);
    };

    //=========================================================================
    // Scene_AduTembung
    //=========================================================================
    function Scene_AduTembung() {
        this.initialize(...arguments);
    }
    Scene_AduTembung.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_AduTembung.prototype.constructor = Scene_AduTembung;

    Scene_AduTembung.prototype.needsCancelButton = function() {
        return false;
    };

    Scene_AduTembung.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        const o = $gameTemp._aduOpts || { jenis: [], level: 2 };
        this._opts = o;
        const lv = A.LEVELS[o.level] || A.LEVELS[2];
        this._timeMax = Math.max(1, Math.round(lv.time * 60));
        this._drift = lv.pressure / 60;
        this._pos = A.START_POS;
        this._shown = this._pos;
        this._combo = 0;
        this._shake = 0;
        this._timer = this._timeMax;
        this._wait = 0;
        this._phase = "start";
        this._source = new A.Sumber(o);
        // muat gambar wajah lebih dulu (scene menunggu sampai siap)
        const leader = $gameParty.leader();
        if (leader && leader.faceName()) ImageManager.loadFace(leader.faceName());
        if (o.face) ImageManager.loadFace(o.face);
        this.createAduWindows();
    };

    Scene_AduTembung.prototype.createAduWindows = function() {
        const pad = $gameSystem.windowPadding();
        const statusH = FACE + pad * 2;
        const choiceH = this.calcWindowHeight(2, true);
        this._statusWindow = new Window_AduStatus(
            new Rectangle(0, 0, Graphics.boxWidth, statusH),
            this._opts.nama || A.T.enemy, this._opts.face, this._opts.faceIndex || 0);
        this.addWindow(this._statusWindow);
        const choiceY = Graphics.boxHeight - choiceH;
        this._questionWindow = new Window_AduQuestion(
            new Rectangle(0, statusH, Graphics.boxWidth, choiceY - statusH));
        this.addWindow(this._questionWindow);
        this._choiceWindow = new Window_AduChoice(new Rectangle(0, choiceY, Graphics.boxWidth, choiceH));
        this._choiceWindow.setHandler("choice", this.onChoice.bind(this));
        this.addWindow(this._choiceWindow);
    };

    Scene_AduTembung.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
        this.startBgm();
        this.nextQuestion();
    };

    Scene_AduTembung.prototype.startBgm = function() {
        if (!A.PLAY_BGM) return;
        this._mapBgm = AudioManager.saveBgm();
        this._mapBgs = AudioManager.saveBgs();
        AudioManager.stopBgs();
        AudioManager.playBgm($gameSystem.battleBgm());
    };

    Scene_AduTembung.prototype.terminate = function() {
        Scene_MenuBase.prototype.terminate.call(this);
        if (this._mapBgm) {
            AudioManager.replayBgm(this._mapBgm);
            AudioManager.replayBgs(this._mapBgs);
        }
    };

    Scene_AduTembung.prototype.nextQuestion = function() {
        this._q = this._source.next();
        if (!this._q) {
            // tidak ada soal sama sekali (kamus & bank kosong)
            this.finish(false);
            return;
        }
        this._timer = this._timeMax;
        this._questionWindow.showQuestion(this._q);
        this._choiceWindow.setChoices(this._q.choices);
        this._choiceWindow.activate();
        this._phase = "question";
    };

    Scene_AduTembung.prototype.onChoice = function() {
        this.answer(this._q.choices[this._choiceWindow.currentExt()]);
    };

    Scene_AduTembung.prototype.answer = function(choice) {
        this._choiceWindow.deactivate();
        if (choice === this._q.answer) {
            this._combo += 1;
            const speed = this._timer / this._timeMax;
            this._pos += A.PUSH_BASE + A.PUSH_SPEED * speed + A.PUSH_COMBO * Math.min(this._combo - 1, 4);
            SoundManager.playEnemyDamage();
            this._questionWindow.showFeedback(A.T.right, true);
            this._wait = 45;
        } else {
            this._combo = 0;
            this._pos -= A.PUSH_WRONG;
            SoundManager.playActorDamage();
            this._shake = 16;
            const text = choice ? A.T.wrong : A.T.timeout;
            this._questionWindow.showFeedback(fmt(text, this._q.answer), false);
            this._wait = 90;
        }
        this._phase = "feedback";
    };

    Scene_AduTembung.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this);
        switch (this._phase) {
            case "question":
                this._timer--;
                this._pos -= this._drift;
                if (!this.checkEnd() && this._timer <= 0) this.answer(null);
                break;
            case "feedback":
                this._wait--;
                if (this._wait <= 0 && !this.checkEnd()) this.nextQuestion();
                break;
            case "end":
                if (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isTriggered()) {
                    this.popScene();
                    this._phase = "closing";
                }
                break;
        }
        this.updateVisuals();
    };

    Scene_AduTembung.prototype.updateVisuals = function() {
        this._shown += (this._pos - this._shown) * 0.2;
        const rate = this._phase === "question" || this._phase === "feedback"
            ? this._timer / this._timeMax : 0;
        this._statusWindow.setState(this._shown, Math.max(0, Math.min(1, rate)), this._combo);
        if (this._shake > 0) this._shake--;
        this._statusWindow.x = this._shake > 0 ? (this._shake % 4 < 2 ? 4 : -4) : 0;
    };

    Scene_AduTembung.prototype.checkEnd = function() {
        if (this._pos < 100 && this._pos > 0) return false;
        this.finish(this._pos >= 100);
        return true;
    };

    Scene_AduTembung.prototype.finish = function(win) {
        this._pos = win ? 100 : 0;
        this._phase = "end";
        this._choiceWindow.deactivate();
        this._choiceWindow.hide();
        $gameSystem._aduResult = win ? "win" : "lose";
        if (this._opts.switchId > 0) $gameSwitches.setValue(this._opts.switchId, win);
        if (win) {
            if (A.PLAY_BGM) AudioManager.playMe($gameSystem.victoryMe());
        } else {
            SoundManager.playBuzzer();
        }
        this._questionWindow.showResult(win ? A.T.win : A.T.lose, win);
    };

    window.Scene_AduTembung = Scene_AduTembung;
})();
