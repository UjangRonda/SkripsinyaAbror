//=============================================================================
// MapExport.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Ekspor map ke PNG ukuran asli (layer bawah & atas terpisah). Hanya untuk playtest.
 *
 * @help
 * Dipakai untuk membuat gambar map yang tajam (48 px per tile) supaya
 * lighting bisa di-bake langsung ke PNG.
 *
 * CARA PAKAI
 *   1. Aktifkan plugin ini di Plugin Manager.
 *   2. Playtest, pergi ke map yang mau diekspor.
 *   3. Tekan F7  (atau pakai Plugin Command "Ekspor Map").
 *   4. File muncul di folder project:  export/
 *        MapXXX_lower.png   tanah, dinding, bayangan bawaan (di bawah karakter)
 *        MapXXX_upper.png   tile bintang / atap / daun (di atas karakter)
 *        MapXXX_full.png    gabungan (untuk dilihat saja)
 *
 * Event (NPC, objek event) TIDAK ikut diekspor, hanya tile.
 * Plugin ini hanya bekerja saat playtest. Matikan sebelum rilis.
 *
 * @param Key
 * @text Tombol
 * @desc Kode tombol keyboard. 118 = F7.
 * @type number
 * @default 118
 *
 * @command Export
 * @text Ekspor Map
 * @desc Ekspor map saat ini ke folder export/.
 */

(() => {
    "use strict";
    const PLUGIN = "MapExport";
    const P = PluginManager.parameters(PLUGIN);
    const KEY = Number(P.Key || 118);
    Input.keyMapper[KEY] = "mapExport";

    const canExport = () => Utils.isNwjs() && Utils.isOptionValid("test");

    const notify = text => {
        console.log("[MapExport] " + text);
        if (!$gameMessage.isBusy()) $gameMessage.add(text);
    };

    const writePng = (canvas, file) => {
        const fs = require("fs");
        const path = require("path");
        const dir = path.join(path.dirname(process.mainModule.filename), "export");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const data = canvas.toDataURL("image/png").split(",")[1];
        fs.writeFileSync(path.join(dir, file), Buffer.from(data, "base64"));
    };

    const exportMap = () => {
        if (!canExport()) {
            notify("MapExport hanya bisa dipakai saat playtest.");
            return;
        }
        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        const W = $gameMap.width() * tw;
        const H = $gameMap.height() * th;
        const bitmaps = $gameMap.tileset().tilesetNames.map(n => ImageManager.loadTileset(n));
        const name = "Map" + String($gameMap.mapId()).padStart(3, "0");

        const tilemap = new Tilemap();
        tilemap.tileWidth = tw;
        tilemap.tileHeight = th;
        tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
        tilemap.horizontalWrap = false;
        tilemap.verticalWrap = false;
        tilemap.flags = $gameMap.tilesetFlags();
        tilemap.width = W;
        tilemap.height = H;
        tilemap.origin.x = 0;
        tilemap.origin.y = 0;

        let tries = 0;
        const run = () => {
            if (!bitmaps.every(b => b.isReady())) {
                if (++tries > 300) return notify("Gagal memuat gambar tileset.");
                return setTimeout(run, 16);
            }
            try {
                tilemap.setBitmaps(bitmaps);
                tilemap.refresh();
                const renderer = Graphics.app.renderer;
                const rt = PIXI.RenderTexture.create({ width: W, height: H });
                const shot = (lower, upper, file) => {
                    tilemap._lowerLayer.visible = lower;
                    tilemap._upperLayer.visible = upper;
                    tilemap.refresh();
                    renderer.render(tilemap, rt, true);
                    writePng(renderer.extract.canvas(rt), file);
                };
                shot(true, false, name + "_lower.png");
                shot(false, true, name + "_upper.png");
                shot(true, true, name + "_full.png");
                rt.destroy(true);
                tilemap.destroy();
                notify("Map diekspor ke folder export/ (" + name + ", " + W + "x" + H + ")");
            } catch (e) {
                console.error(e);
                notify("Ekspor gagal: " + e.message);
            }
        };
        run();
    };

    PluginManager.registerCommand(PLUGIN, "Export", exportMap);

    const _update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _update.call(this);
        if (Input.isTriggered("mapExport")) exportMap();
    };
})();
