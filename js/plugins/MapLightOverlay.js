//=============================================================================
// MapLightOverlay.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Lighting map dari gambar: bayangan, cahaya matahari, awan bergerak, vignette.
 *
 * @help
 * Menempelkan layer lighting yang ikut scroll bersama map.
 *
 *  - Shading objek (bayangan, sisi gelap, tepi bercahaya) digambar DI BAWAH
 *    karakter, jadi tidak "mengecat" kepala karakter di depan rumah/pohon.
 *    Bagian yang ada di tile bintang (☆, di atas karakter) otomatis ikut
 *    dipindah ke atas karakter, mengikuti passage tileset.
 *  - Karakter yang masuk bayangan digelapkan merata.
 *  - Cahaya matahari umum, awan, dan vignette di atas karakter.
 *
 * PEMASANGAN
 *   1. Salin gambar ke  <project>/img/overlays/
 *   2. Aktifkan plugin ini di Plugin Manager.
 *   3. Map Properties > Note:
 *        <overlay: Desa>
 *        <overlay_tone: 12, 3, -14, 0>      (opsional, R G B Gray)
 *
 * FILE (nama overlay = "Desa"):
 *   Desa_shade.png   bayangan + shading objek  (Normal, bawah karakter*)
 *   Desa_glow.png    cahaya di objek & air     (Add,    bawah karakter*)
 *   Desa_clouds.png  bayangan awan             (Normal, atas karakter, bergerak)
 *   Desa_light.png   cahaya matahari           (Add,    atas karakter)
 *   vignette.png     vignette layar
 *   * bagian di tile ☆ otomatis di atas karakter.
 *   File yang tidak ada dilewati saja.
 *
 * Ukuran layer map = lebar map x 48  by  tinggi map x 48 piksel.
 *
 * DEPLOYMENT: kalau memakai "Exclude unused files", gambar di img/overlays
 * bisa ikut terbuang. Matikan opsi itu, atau salin folder img/overlays
 * secara manual ke hasil deployment.
 *
 * @param HideSwitch
 * @text Switch Sembunyikan
 * @desc Switch ON = overlay disembunyikan (mis. saat cutscene). 0 = tidak dipakai.
 * @type switch
 * @default 0
 *
 * @param FadeFrames
 * @text Lama Fade (frame)
 * @type number
 * @default 30
 *
 * @param CloudSpeedX
 * @text Kecepatan Awan X
 * @desc Piksel per frame.
 * @type number
 * @decimals 2
 * @min -10
 * @default 0.45
 *
 * @param CloudSpeedY
 * @text Kecepatan Awan Y
 * @type number
 * @decimals 2
 * @min -10
 * @default 0.18
 *
 * @param Vignette
 * @text Gambar Vignette
 * @desc Kosongkan untuk mematikan vignette.
 * @default vignette
 *
 * @param UseTone
 * @text Pakai Tone dari Note
 * @type boolean
 * @default true
 *
 * @param CharShade
 * @text Gelap Karakter di Bayangan
 * @desc 0 = mati, 1 = penuh.
 * @type number
 * @decimals 2
 * @min 0
 * @max 1
 * @default 0.85
 */

(() => {
    "use strict";
    const P = PluginManager.parameters("MapLightOverlay");
    const num = (v, d) => (v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
    const CFG = {
        folder: "img/overlays/",
        hideSwitch: num(P.HideSwitch, 0),
        fade: Math.max(1, num(P.FadeFrames, 30)),
        cloud: [num(P.CloudSpeedX, 0.45), num(P.CloudSpeedY, 0.18)],
        vignette: P.Vignette === undefined ? "vignette" : String(P.Vignette).trim(),
        useTone: P.UseTone !== "false",
        charShade: num(P.CharShade, 0.85)
    };

    // urutan z di dalam Tilemap:
    // 0 tile bawah | 1 event "below" | 3 karakter | 4 tile bintang | 5 event "above"
    const Z_UNDER = 0.5;   // di atas tanah, di bawah karakter
    const Z_STAR  = 4.5;   // di atas tile bintang
    const Z_OVER  = 8;     // selalu di atas karakter

    // [akhiran, blend (0 normal, 1 add), mode]
    const LAYERS = [
        ["_shade",  0, "split"],
        ["_glow",   1, "split"],
        ["_clouds", 0, "plane"],
        ["_light",  1, "over"]
    ];

    //-------------------------------------------------------------------------
    const mapNote = () => ($dataMap && $dataMap.note) || "";
    const overlayName = () => {
        const m = mapNote().match(/<overlay:\s*([^>\s]+)\s*>/i);
        return m ? m[1] : null;
    };
    const overlayTone = () => {
        const m = mapNote().match(/<overlay_tone:\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*(?:,\s*(\d+)\s*)?>/i);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4] || 0)] : null;
    };

    Game_Map.prototype.mloStar = function(x, y) {
        const flags = this.tilesetFlags();
        for (let z = 0; z < 4; z++) {
            const id = this.tileId(x, y, z);
            if (id > 0 && (flags[id] & 0x10) !== 0) return true;
        }
        return false;
    };

    //-------------------------------------------------------------------------
    const _createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _createLowerLayer.call(this);
        this.createLightOverlay();
    };

    const _update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _update.call(this);
        this.updateLightOverlay();
    };

    const _destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function(options) {
        const own = (this._mloSprites || []).filter(s => s.mloOwnBitmap && s.bitmap).map(s => s.bitmap);
        this._mloShade = null;
        _destroy.call(this, options);
        for (const b of own) b.destroy();
    };

    Spriteset_Map.prototype.mloTarget = function() {
        return CFG.hideSwitch > 0 && $gameSwitches.value(CFG.hideSwitch) ? 0 : 255;
    };

    Spriteset_Map.prototype.mloAdd = function(sprite, blend, z, type) {
        sprite.blendMode = blend;
        sprite.z = z;
        sprite.opacity = this.mloTarget();
        sprite.mloType = type;
        this._tilemap.addChild(sprite);
        this._mloSprites.push(sprite);
        return sprite;
    };

    Spriteset_Map.prototype.createLightOverlay = function() {
        this._mloSprites = [];
        this._mloCloud = [0, 0];
        this._mloShade = null;
        this._mloCharCache = new Map();
        const name = overlayName();
        if (!name) {
            this.mloResetTone();
            return;
        }
        LAYERS.forEach(([suffix, blend, mode], i) => {
            const bitmap = ImageManager.loadBitmap(CFG.folder, name + suffix);
            if (mode === "split") {
                const under = this.mloAdd(new Sprite(), blend, Z_UNDER + i * 0.1, "map");
                const over = this.mloAdd(new Sprite(), blend, Z_STAR + i * 0.1, "map");
                bitmap.addLoadListener(() => this.mloSplit(bitmap, under, over, suffix === "_shade"));
            } else if (mode === "plane") {
                const plane = new TilingSprite(bitmap);
                plane.move(0, 0, Graphics.width, Graphics.height);
                this.mloAdd(plane, blend, Z_OVER + i * 0.1, "plane");
            } else {
                this.mloAdd(new Sprite(bitmap), blend, Z_OVER + i * 0.1, "map");
            }
        });
        if (CFG.vignette) {
            const vb = ImageManager.loadBitmap(CFG.folder, CFG.vignette);
            const vs = this.mloAdd(new Sprite(vb), 0, Z_OVER + 1, "screen");
            vb.addLoadListener(() => {
                vs.scale.x = Graphics.width / vb.width;
                vs.scale.y = Graphics.height / vb.height;
            });
        }
        this.mloApplyTone();
    };

    // Belah per tile: tile ☆ -> sprite atas, lainnya -> sprite bawah
    Spriteset_Map.prototype.mloSplit = function(src, under, over, isShade) {
        if (src.isError && src.isError()) return;
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        const cols = Math.min(Math.floor(src.width / tw), $gameMap.width());
        const rows = Math.min(Math.floor(src.height / th), $gameMap.height());
        const ub = new Bitmap(src.width, src.height);
        let ob = null;
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if ($gameMap.mloStar(x, y)) {
                    if (!ob) ob = new Bitmap(src.width, src.height);
                    ob.blt(src, x * tw, y * th, tw, th, x * tw, y * th);
                } else {
                    ub.blt(src, x * tw, y * th, tw, th, x * tw, y * th);
                }
            }
        }
        under.bitmap = ub;
        under.mloOwnBitmap = true;
        if (ob) {
            over.bitmap = ob;
            over.mloOwnBitmap = true;
        }
        if (isShade) this._mloShade = src;
    };

    //-------------------------------------------------------------------------
    // MZ: Game_Screen.startTint(tone, duration)  (aman kalau tidak tersedia)
    const setTint = tone => {
        if (typeof $gameScreen === "undefined" || !$gameScreen ||
            typeof $gameScreen.startTint !== "function") return false;
        $gameScreen.startTint(tone, 0);
        return true;
    };

    Spriteset_Map.prototype.mloApplyTone = function() {
        if (!CFG.useTone) return;
        const tone = overlayTone();
        if (!tone) return this.mloResetTone();
        if (setTint(tone)) $gameSystem._mloToneOn = true;
    };

    Spriteset_Map.prototype.mloResetTone = function() {
        if (!CFG.useTone || !$gameSystem._mloToneOn) return;
        if (setTint([0, 0, 0, 0])) $gameSystem._mloToneOn = false;
    };

    //-------------------------------------------------------------------------
    Spriteset_Map.prototype.updateLightOverlay = function() {
        if (!this._mloSprites || this._mloSprites.length === 0) return;
        const target = this.mloTarget();
        const step = Math.max(255 / CFG.fade, 1);
        this._mloCloud[0] += CFG.cloud[0];
        this._mloCloud[1] += CFG.cloud[1];
        const ox = $gameMap.displayX() * $gameMap.tileWidth();
        const oy = $gameMap.displayY() * $gameMap.tileHeight();
        for (const s of this._mloSprites) {
            if (s.opacity < target) s.opacity = Math.min(s.opacity + step, target);
            else if (s.opacity > target) s.opacity = Math.max(s.opacity - step, target);
            if (s.mloType === "map") {
                s.x = Math.round(-ox);
                s.y = Math.round(-oy);
            } else if (s.mloType === "plane") {
                s.origin.x = ox - this._mloCloud[0];
                s.origin.y = oy - this._mloCloud[1];
            }
        }
        this.updateCharacterShade();
    };

    // Gelapkan karakter merata sesuai bayangan di posisi kakinya
    Spriteset_Map.prototype.updateCharacterShade = function() {
        const bmp = this._mloShade;
        if (!bmp || !bmp.isReady() || CFG.charShade <= 0) return;
        const k = CFG.charShade * this.mloTarget() / 255;
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        for (const spr of this._characterSprites) {
            const ch = spr._character;
            if (!ch) continue;
            const fx = Math.floor(ch._realX * tw + tw / 2);
            const fy = Math.floor(ch._realY * th + th * 0.8);
            const key = fx + "," + fy + "," + k;
            if (this._mloCharCache.get(spr) === key) continue;
            this._mloCharCache.set(spr, key);
            let a = 0;
            if (fx >= 0 && fy >= 0 && fx < bmp.width && fy < bmp.height) {
                a = bmp.getAlphaPixel(fx, fy) * k;
            }
            spr.setBlendColor([26, 32, 78, Math.round(a)]);
        }
    };
})();
