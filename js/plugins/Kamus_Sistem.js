//=============================================================================
// Kamus_Sistem.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [Sistem] Kamus "Serat Tembung": menu, layar kamus, koleksi kata.
 * @orderAfter Kamus_Data
 *
 * @help
 * Butuh plugin Kamus_Data (daftar kata).
 * Kata terbuka satu per satu saat pemain menemukannya, dan tersimpan
 * otomatis di save file.
 *
 * PLUGIN COMMAND (Event > Plugin Command > Kamus_Sistem):
 *   Buka Kata          buka kata, mis. "mangan" atau "turu, lunga"
 *                      (boleh pakai bentuk ngoko/krama/krama inggil)
 *   Buka Semua Kata    untuk tes
 *   Buka Layar Kamus   tampilkan kamus dari event
 *   Cek Kata ke Switch switch ON kalau kata sudah terbuka
 *   Jumlah ke Variabel simpan jumlah kata terbuka ke variabel
 *
 * SCRIPT (Conditional Branch > Script), kalau lebih suka:
 *   kamusAda("rawuh")
 *   kamusJumlah() >= 10
 *
 * @param MenuName
 * @text Nama Menu
 * @default Serat Tembung
 *
 * @param ShowInMenu
 * @text Tampil di Menu Utama
 * @type boolean
 * @default true
 *
 * @param Notify
 * @text Pesan Kata Baru
 * @desc Tampilkan pesan saat kata baru tercatat (default untuk command Buka Kata).
 * @type boolean
 * @default true
 *
 * @param ListWidth
 * @text Lebar Daftar Kata
 * @type number
 * @min 120
 * @default 220
 *
 * @param LockedText
 * @text Teks Kata Terkunci
 * @default ???
 *
 * @param LabelNgoko
 * @text Label Ngoko
 * @default Ngoko
 *
 * @param LabelKrama
 * @text Label Krama
 * @default Krama
 *
 * @param LabelInggil
 * @text Label Krama Inggil
 * @default Krama Inggil
 *
 * @param LabelArti
 * @text Label Arti
 * @default Tegese
 *
 * @param LabelContoh
 * @text Label Contoh
 * @default Tuladha
 *
 * @param LabelCathetan
 * @text Label Cathetan
 * @default Cathetan
 *
 * @param TextLocked
 * @text Teks Belum Tercatat
 * @default Tembung iki dereng kacathet.
 *
 * @param TextNew
 * @text Teks Kata Baru
 * @default Tembung anyar kacathet!
 *
 * @param TextCount
 * @text Teks Jumlah
 * @desc %1 = jumlah terbuka, %2 = jumlah semua kata.
 * @default %1 / %2 tembung
 *
 * @command BukaKata
 * @text Buka Kata
 * @desc Membuka kata di kamus.
 *
 * @arg kata
 * @text Kata
 * @desc Satu atau beberapa kata dipisah koma, mis. mangan, turu, rawuh
 * @default
 *
 * @arg pesan
 * @text Tampilkan Pesan
 * @type select
 * @option Ikut setelan plugin
 * @value default
 * @option Ya
 * @value true
 * @option Tidak
 * @value false
 * @default default
 *
 * @command BukaSemua
 * @text Buka Semua Kata
 * @desc Membuka semua kata (untuk tes).
 *
 * @command BukaMenu
 * @text Buka Layar Kamus
 * @desc Menampilkan layar kamus.
 *
 * @command CekKata
 * @text Cek Kata ke Switch
 * @desc Switch ON kalau kata sudah terbuka, OFF kalau belum.
 *
 * @arg kata
 * @text Kata
 * @default
 *
 * @arg switchId
 * @text Switch
 * @type switch
 * @default 0
 *
 * @command JumlahKata
 * @text Jumlah ke Variabel
 * @desc Simpan jumlah kata yang sudah terbuka ke variabel.
 *
 * @arg variableId
 * @text Variabel
 * @type variable
 * @default 0
 */

(() => {
    "use strict";
    const PLUGIN = "Kamus_Sistem";
    const P = PluginManager.parameters(PLUGIN);
    const bool = (v, d) => (v === undefined || v === "" ? d : v === "true");

    window.Kamus = window.Kamus || {};
    Object.assign(Kamus, {
        MENU_NAME:    P.MenuName || "Serat Tembung",
        SHOW_IN_MENU: bool(P.ShowInMenu, true),
        NOTIFY:       bool(P.Notify, true),
        LIST_WIDTH:   Number(P.ListWidth || 220),
        LOCKED_TEXT:  P.LockedText || "???",
        L_NGOKO:      P.LabelNgoko || "Ngoko",
        L_KRAMA:      P.LabelKrama || "Krama",
        L_INGGIL:     P.LabelInggil || "Krama Inggil",
        L_ARTI:       P.LabelArti || "Tegese",
        L_CONTOH:     P.LabelContoh || "Tuladha",
        L_CATHET:     P.LabelCathetan || "Cathetan",
        T_LOCKED:     P.TextLocked || "Tembung iki dereng kacathet.",
        T_NEW:        P.TextNew || "Tembung anyar kacathet!",
        T_COUNT:      P.TextCount || "%1 / %2 tembung"
    });

    //-------------------------------------------------------------------------
    // Data
    //   word = { key, ngoko, krama, inggil, arti, contoh[], cathetan }
    //   krama / inggil = "-" kalau tidak ada bentuk khusus
    //-------------------------------------------------------------------------
    Kamus.words = function() {
        if (!this._words) {
            this._words = (Kamus.DATA || []).map(d => ({
                key:      d.ngoko.toLowerCase(),
                ngoko:    d.ngoko,
                krama:    d.krama || "-",
                inggil:   d.inggil || "-",
                arti:     d.arti || "",
                contoh:   d.contoh || [],
                cathetan: d.cathetan || ""
            }));
        }
        return this._words;
    };

    Kamus.forms = function(w) {
        return [...new Set([w.ngoko, w.krama, w.inggil].filter(f => f && f !== "-"))];
    };

    // Cari kata lewat kunci ATAU bentuk apa saja (ngoko/krama/krama inggil)
    Kamus.entry = function(key) {
        const name = String(key || "").trim().toLowerCase();
        if (!name) return null;
        return this.words().find(w => w.key === name) ||
               this.words().find(w => this.forms(w).some(f => f.toLowerCase() === name)) ||
               null;
    };

    Kamus.unlocked = function() {
        return $gameSystem.kamusUnlocked();
    };

    Kamus.isUnlocked = function(key) {
        const e = this.entry(key);
        return !!e && this.unlocked().includes(e.key);
    };

    Kamus.unlock = function(keys) {
        const added = [];
        for (const k of keys) {
            const e = this.entry(k);
            if (e && !this.unlocked().includes(e.key)) {
                this.unlocked().push(e.key);
                added.push(e);
            }
        }
        return added;
    };

    Kamus.splitKeys = function(text) {
        return String(text || "").split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    };

    // Helper untuk Conditional Branch > Script
    window.kamusAda = key => Kamus.isUnlocked(key);
    window.kamusJumlah = () => Kamus.unlocked().length;

    //-------------------------------------------------------------------------
    // Save data
    //-------------------------------------------------------------------------
    Game_System.prototype.kamusUnlocked = function() {
        if (!this._kamusUnlocked) this._kamusUnlocked = [];
        return this._kamusUnlocked;
    };

    //-------------------------------------------------------------------------
    // Plugin commands
    //-------------------------------------------------------------------------
    PluginManager.registerCommand(PLUGIN, "BukaKata", function(args) {
        const added = Kamus.unlock(Kamus.splitKeys(args.kata));
        const notify = args.pesan === "true" || (args.pesan !== "false" && Kamus.NOTIFY);
        if (notify && added.length > 0) {
            $gameMessage.add("\\C[17]" + Kamus.T_NEW + "\\C[0]");
            for (const e of added) {
                $gameMessage.add(Kamus.forms(e).join(" - ") + "  (" + e.arti + ")");
            }
            this.setWaitMode("message");
        }
    });

    PluginManager.registerCommand(PLUGIN, "BukaSemua", () => {
        Kamus.unlock(Kamus.words().map(w => w.key));
    });

    PluginManager.registerCommand(PLUGIN, "BukaMenu", () => {
        SceneManager.push(Scene_Kamus);
    });

    PluginManager.registerCommand(PLUGIN, "CekKata", args => {
        const id = Number(args.switchId || 0);
        if (id > 0) $gameSwitches.setValue(id, Kamus.isUnlocked(args.kata));
    });

    PluginManager.registerCommand(PLUGIN, "JumlahKata", args => {
        const id = Number(args.variableId || 0);
        if (id > 0) $gameVariables.setValue(id, Kamus.unlocked().length);
    });

    //-------------------------------------------------------------------------
    // Window_KamusList — daftar kata (kiri)
    //-------------------------------------------------------------------------
    function Window_KamusList() {
        this.initialize(...arguments);
    }
    Window_KamusList.prototype = Object.create(Window_Selectable.prototype);
    Window_KamusList.prototype.constructor = Window_KamusList;

    Window_KamusList.prototype.initialize = function(rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.refresh();
    };

    Window_KamusList.prototype.maxItems = function() {
        return Kamus.words().length;
    };

    Window_KamusList.prototype.item = function() {
        return Kamus.words()[this.index()] || null;
    };

    Window_KamusList.prototype.drawItem = function(index) {
        const w = Kamus.words()[index];
        const rect = this.itemLineRect(index);
        const open = Kamus.unlocked().includes(w.key);
        this.resetTextColor();
        this.changePaintOpacity(open);
        this.drawText(open ? w.ngoko : Kamus.LOCKED_TEXT, rect.x, rect.y, rect.width);
        this.changePaintOpacity(true);
    };

    Window_KamusList.prototype.updateHelp = function() {
        if (this._helpWindow) this._helpWindow.setEntry(this.item());
    };

    //-------------------------------------------------------------------------
    // Window_KamusDetail — detail kata (kanan)
    //-------------------------------------------------------------------------
    function Window_KamusDetail() {
        this.initialize(...arguments);
    }
    Window_KamusDetail.prototype = Object.create(Window_Base.prototype);
    Window_KamusDetail.prototype.constructor = Window_KamusDetail;

    Window_KamusDetail.prototype.initialize = function(rect) {
        Window_Base.prototype.initialize.call(this, rect);
        this._entry = null;
    };

    Window_KamusDetail.prototype.setEntry = function(entry) {
        if (this._entry === entry) return;
        this._entry = entry;
        this.refresh();
    };

    Window_KamusDetail.prototype.refresh = function() {
        this.contents.clear();
        const e = this._entry;
        if (!e) return;
        const cw = this.innerWidth;
        const lh = this.lineHeight();
        if (!Kamus.unlocked().includes(e.key)) {
            this.changePaintOpacity(false);
            this.drawText(Kamus.T_LOCKED, 0, 0, cw);
            this.changePaintOpacity(true);
            return;
        }
        let y = 0;
        this.contents.fontSize = $gameSystem.mainFontSize() + 8;
        this.changeTextColor(ColorManager.crisisColor());
        this.drawText(e.ngoko, 0, y, cw);
        this.resetFontSettings();
        y += lh + 6;
        this.contents.fillRect(0, y, cw, 2, ColorManager.systemColor());
        this.contents.paintOpacity = 255;
        y += 10;
        y = this.drawRow(y, Kamus.L_ARTI, e.arti);
        y += 6;
        y = this.drawRow(y, Kamus.L_NGOKO, e.ngoko);
        y = this.drawRow(y, Kamus.L_KRAMA, e.krama);
        y = this.drawRow(y, Kamus.L_INGGIL, e.inggil);
        if (e.contoh.length > 0) {
            y += 8;
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(Kamus.L_CONTOH, 0, y, cw);
            y += lh;
            this.resetTextColor();
            for (const c of e.contoh) y = this.drawWrapped(16, y, cw - 16, c);
        }
        if (e.cathetan) {
            y += 8;
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(Kamus.L_CATHET, 0, y, cw);
            y += lh;
            this.changeTextColor(ColorManager.powerUpColor());
            y = this.drawWrapped(16, y, cw - 16, e.cathetan);
            this.resetTextColor();
        }
    };

    Window_KamusDetail.prototype.labelWidth = function() {
        const labels = [Kamus.L_ARTI, Kamus.L_NGOKO, Kamus.L_KRAMA, Kamus.L_INGGIL];
        return Math.max(...labels.map(l => this.textWidth(l))) + 24;
    };

    Window_KamusDetail.prototype.drawRow = function(y, label, value) {
        const lw = this.labelWidth();
        this.changeTextColor(ColorManager.systemColor());
        this.drawText(label, 0, y, lw);
        this.resetTextColor();
        this.changePaintOpacity(value !== "-");
        this.drawText(value, lw, y, this.innerWidth - lw);
        this.changePaintOpacity(true);
        return y + this.lineHeight();
    };

    // Tulis teks dengan pindah baris otomatis
    Window_KamusDetail.prototype.drawWrapped = function(x, y, width, text) {
        let line = "";
        for (const word of String(text).split(/\s+/)) {
            const test = line ? line + " " + word : word;
            if (this.textWidth(test) > width && line) {
                this.drawText(line, x, y, width);
                y += this.lineHeight();
                line = word;
            } else {
                line = test;
            }
        }
        if (line) {
            this.drawText(line, x, y, width);
            y += this.lineHeight();
        }
        return y;
    };

    //-------------------------------------------------------------------------
    // Scene_Kamus
    //-------------------------------------------------------------------------
    function Scene_Kamus() {
        this.initialize(...arguments);
    }
    Scene_Kamus.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_Kamus.prototype.constructor = Scene_Kamus;

    Scene_Kamus.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        // Tata letak sendiri (tidak ikut posisi area help), supaya aman di
        // mode "bottom help" dan resolusi layar berapa pun.
        const btnTop = !this.isBottomButtonMode();
        const top = btnTop ? this.buttonAreaBottom() : 0;
        const bottom = Graphics.boxHeight - (btnTop ? 0 : this.buttonAreaHeight());
        const titleH = this.calcWindowHeight(1, false);
        const y = top + titleH;
        const h = bottom - y;
        const lw = Math.min(Kamus.LIST_WIDTH, Math.floor(Graphics.boxWidth / 2));

        this._titleWindow = new Window_Base(new Rectangle(0, top, Graphics.boxWidth, titleH));
        const count = Kamus.T_COUNT.replace("%1", Kamus.unlocked().length)
                                   .replace("%2", Kamus.words().length);
        const tw = this._titleWindow;
        tw.changeTextColor(ColorManager.systemColor());
        tw.drawText(Kamus.MENU_NAME, 8, 0, tw.innerWidth - 16, "left");
        tw.resetTextColor();
        tw.drawText(count, 8, 0, tw.innerWidth - 16, "right");
        this.addWindow(this._titleWindow);

        this._detailWindow = new Window_KamusDetail(new Rectangle(lw, y, Graphics.boxWidth - lw, h));
        this.addWindow(this._detailWindow);

        this._listWindow = new Window_KamusList(new Rectangle(0, y, lw, h));
        this._listWindow.setHandler("cancel", this.popScene.bind(this));
        this._listWindow.setHelpWindow(this._detailWindow);
        this.addWindow(this._listWindow);
        this._listWindow.select(0);
        this._listWindow.activate();
    };

    window.Scene_Kamus = Scene_Kamus;

    //-------------------------------------------------------------------------
    // Menu utama
    //-------------------------------------------------------------------------
    const _addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function() {
        _addOriginalCommands.call(this);
        if (Kamus.SHOW_IN_MENU) this.addCommand(Kamus.MENU_NAME, "kamus", true);
    };

    const _createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _createCommandWindow.call(this);
        this._commandWindow.setHandler("kamus", this.commandKamus.bind(this));
    };

    Scene_Menu.prototype.commandKamus = function() {
        SceneManager.push(Scene_Kamus);
    };
})();
