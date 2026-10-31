//=============================================================================
// GeserEvent.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Geser gambar event per piksel dan perkecil/perbesar ukurannya lewat Note event.
 *
 * @help
 * Tile di editor selalu menempel ke grid. Untuk menaruh benda di tengah
 * antara dua tile, atau membuatnya lebih kecil, jadikan benda itu EVENT
 * (Graphic: pilih tile dari tab B-E atau gambar karakter), lalu tulis di
 * kolom Note event:
 *
 *   <geser: x, y>     geser gambar sekian piksel.
 *                     1 tile = 48 piksel, setengah tile = 24.
 *                     Contoh <geser: 0, 24>  = turun setengah tile
 *                            <geser: -24, 0> = ke kiri setengah tile
 *
 *   <skala: n>        ukuran gambar. 1 = normal, 0.5 = setengah,
 *                     0.75 = tiga perempat.
 *                     Contoh <skala: 0.6>
 *
 * Bisa dipakai bersama:  <geser: 0, 24> <skala: 0.75>
 *
 * Catatan:
 *  - Yang bergeser/mengecil hanya GAMBAR. Posisi untuk tabrakan & interaksi
 *    tetap di tile event aslinya.
 *  - Gambar mengecil dari titik bawah-tengah, jadi benda tetap "berdiri"
 *    di lantai.
 *  - Note dibaca dari Note event (kotak "Note" di jendela event),
 *    berlaku untuk semua halaman event.
 */

(() => {
    "use strict";

    const parseOffset = text => {
        const m = String(text || "").match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
        return m ? [Number(m[1]), Number(m[2])] : [0, 0];
    };

    Game_Event.prototype.geserData = function() {
        if (this._geserData === undefined) {
            const meta = (this.event() && this.event().meta) || {};
            const off = meta.geser !== undefined ? parseOffset(meta.geser) : [0, 0];
            const sc = meta.skala !== undefined ? Number(String(meta.skala).trim()) : 1;
            this._geserData = { x: off[0], y: off[1], scale: isNaN(sc) || sc <= 0 ? 1 : sc };
        }
        return this._geserData;
    };

    const _screenX = Game_Event.prototype.screenX;
    Game_Event.prototype.screenX = function() {
        return _screenX.call(this) + this.geserData().x;
    };

    const _screenY = Game_Event.prototype.screenY;
    Game_Event.prototype.screenY = function() {
        return _screenY.call(this) + this.geserData().y;
    };

    const _updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _updatePosition.call(this);
        const ch = this._character;
        if (ch instanceof Game_Event) {
            const s = ch.geserData().scale;
            this.scale.x = s;
            this.scale.y = s;
        }
    };
})();
