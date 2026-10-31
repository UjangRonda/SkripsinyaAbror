//=============================================================================
// AwanGerak.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Bayangan awan yang bergerak pelan di atas map. Tanpa gambar.
 *
 * @help
 * Menampilkan bayangan awan yang melayang pelan di atas map.
 * Tekstur awan dibuat otomatis oleh plugin, jadi tidak perlu file gambar.
 *
 * MEMAKAI
 *   Tulis di Note map (Map Properties) yang mau diberi awan:
 *     <awan>
 *   Atau nyalakan "Semua Map" di setelan plugin, lalu map yang TIDAK mau
 *   diberi awan (mis. dalam rumah) diberi Note:
 *     <tanpa_awan>
 *
 * @param AllMaps
 * @text Semua Map
 * @desc true = awan di semua map (kecuali yang diberi <tanpa_awan>).
 * @type boolean
 * @default false
 *
 * @param Opacity
 * @text Kepekatan
 * @desc 0 = tidak terlihat, 255 = pekat.
 * @type number
 * @min 0
 * @max 255
 * @default 60
 *
 * @param SpeedX
 * @text Kecepatan X
 * @desc Piksel per frame. Minus = ke kiri.
 * @type number
 * @decimals 2
 * @min -10
 * @default 0.40
 *
 * @param SpeedY
 * @text Kecepatan Y
 * @desc Piksel per frame. Minus = ke atas.
 * @type number
 * @decimals 2
 * @min -10
 * @default 0.15
 *
 * @param Coverage
 * @text Banyak Awan
 * @desc 0-100. Makin besar makin banyak awan.
 * @type number
 * @min 0
 * @max 100
 * @default 45
 *
 * @param Size
 * @text Ukuran Awan
 * @desc 1 = kecil, 2 = sedang, 3 = besar.
 * @type select
 * @option Kecil
 * @value 1
 * @option Sedang
 * @value 2
 * @option Besar
 * @value 3
 * @default 2
 *
 * @param Color
 * @text Warna
 * @desc Format R,G,B. Biru gelap terasa seperti bayangan alami.
 * @default 20,26,60
 *
 * @param HideSwitch
 * @text Switch Sembunyikan
 * @desc Switch ON = awan disembunyikan (mis. saat cutscene). 0 = tidak dipakai.
 * @type switch
 * @default 0
 */

(() => {
    "use strict";
    const P = PluginManager.parameters("AwanGerak");
    const num = (v, d) => (v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
    const CFG = {
        all: P.AllMaps === "true",
        opacity: num(P.Opacity, 60),
        sx: num(P.SpeedX, 0.4),
        sy: num(P.SpeedY, 0.15),
        coverage: Math.max(0, Math.min(100, num(P.Coverage, 45))) / 100,
        size: Math.max(1, Math.min(3, num(P.Size, 2))),
        color: String(P.Color || "20,26,60").split(",").map(v => Number(v) || 0),
        hideSwitch: num(P.HideSwitch, 0)
    };
    const TEX = 512;

    const cloudsHere = () => {
        const note = ($dataMap && $dataMap.note) || "";
        if (/<tanpa_awan>/i.test(note)) return false;
        return CFG.all || /<awan>/i.test(note);
    };

    //-------------------------------------------------------------------------
    // Tekstur awan (noise yang bisa disambung tanpa terlihat sambungannya)
    //-------------------------------------------------------------------------
    const makeCloudBitmap = () => {
        let seed = 1234567;
        const rand = () => {
            seed = (seed * 16807) % 2147483647;
            return seed / 2147483647;
        };
        const field = new Float32Array(TEX * TEX);
        const smooth = t => t * t * (3 - 2 * t);
        let amp = 1, total = 0;
        const base = [6, 4, 3][CFG.size - 1];   // sel lebih sedikit = awan lebih besar
        for (let o = 0, cells = base; o < 5; o++, cells *= 2, amp *= 0.5) {
            const grid = new Float32Array(cells * cells);
            for (let i = 0; i < grid.length; i++) grid[i] = rand();
            const step = TEX / cells;
            for (let y = 0; y < TEX; y++) {
                const gy = y / step, y0 = Math.floor(gy), ty = smooth(gy - y0);
                const r0 = (y0 % cells) * cells, r1 = ((y0 + 1) % cells) * cells;
                for (let x = 0; x < TEX; x++) {
                    const gx = x / step, x0 = Math.floor(gx), tx = smooth(gx - x0);
                    const c0 = x0 % cells, c1 = (x0 + 1) % cells;
                    const a = grid[r0 + c0] + (grid[r0 + c1] - grid[r0 + c0]) * tx;
                    const b = grid[r1 + c0] + (grid[r1 + c1] - grid[r1 + c0]) * tx;
                    field[y * TEX + x] += (a + (b - a) * ty) * amp;
                }
            }
            total += amp;
        }
        // ubah jadi transparansi: hanya bagian "tebal" yang jadi awan
        const cut = 0.62 - CFG.coverage * 0.25;
        const bitmap = new Bitmap(TEX, TEX);
        const ctx = bitmap.context;
        const img = ctx.createImageData(TEX, TEX);
        const [r, g, b] = CFG.color;
        for (let i = 0; i < field.length; i++) {
            const v = field[i] / total;
            const a = Math.max(0, Math.min(1, (v - cut) / 0.18));
            img.data[i * 4] = r;
            img.data[i * 4 + 1] = g;
            img.data[i * 4 + 2] = b;
            img.data[i * 4 + 3] = Math.round(a * a * (3 - 2 * a) * 255);
        }
        ctx.putImageData(img, 0, 0);
        if (bitmap._baseTexture) bitmap._baseTexture.update();
        return bitmap;
    };

    //-------------------------------------------------------------------------
    const _createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
    Spriteset_Map.prototype.createLowerLayer = function() {
        _createLowerLayer.call(this);
        this._awanSprite = null;
        this._awanMove = [0, 0];
        if (!cloudsHere()) return;
        const sprite = new TilingSprite(makeCloudBitmap());
        sprite.move(0, 0, Graphics.width, Graphics.height);
        sprite.z = 8;                 // di atas karakter & tile bintang
        sprite.opacity = this.awanTarget();
        this._tilemap.addChild(sprite);
        this._awanSprite = sprite;
    };

    Spriteset_Map.prototype.awanTarget = function() {
        return CFG.hideSwitch > 0 && $gameSwitches.value(CFG.hideSwitch) ? 0 : CFG.opacity;
    };

    const _update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        _update.call(this);
        const s = this._awanSprite;
        if (!s) return;
        this._awanMove[0] += CFG.sx;
        this._awanMove[1] += CFG.sy;
        // ikut scroll map, jadi awan terasa "di langit", bukan menempel di layar
        s.origin.x = $gameMap.displayX() * $gameMap.tileWidth() - this._awanMove[0];
        s.origin.y = $gameMap.displayY() * $gameMap.tileHeight() - this._awanMove[1];
        const target = this.awanTarget();
        if (s.opacity < target) s.opacity = Math.min(s.opacity + 4, target);
        else if (s.opacity > target) s.opacity = Math.max(s.opacity - 4, target);
    };
})();
