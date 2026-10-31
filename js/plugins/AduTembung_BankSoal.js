//=============================================================================
// AduTembung_BankSoal.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [Data] Bank soal manual untuk battle Adu Tembung.
 * @orderBefore AduTembung_Battle
 *
 * @help
 * Plugin ini HANYA berisi soal buatan sendiri, dikelompokkan per musuh
 * atau tempat. Isi lewat Plugin Manager:
 * klik dua kali plugin ini > "Bank Soal".
 *
 * Setiap kelompok:
 *   Nama Bank : dipakai di plugin command Adu Tembung, kolom "Bank Soal".
 *   Soal      : daftar soal.
 *
 * Setiap soal:
 *   Pertanyaan : teks pertanyaan di baris atas (wajib).
 *   Ukara      : kalimat besar di tengah, pakai ____ untuk isian (opsional).
 *   Petunjuk   : teks kecil di bawah kalimat (opsional).
 *   Jawaban    : jawaban yang benar (wajib).
 *   Pengecoh   : jawaban salah, 1-3 buah (wajib).
 *
 * Soal di bank TIDAK disaring oleh opsi "Hanya kata terbuka".
 *
 * @param Bank
 * @text Bank Soal
 * @type struct<Bank>[]
 * @default ["{\"nama\":\"penjaga\",\"soal\":\"[\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Isenana:\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"Simbah sampun ____.\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"(tidur)\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"sare\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"tilem\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"turu\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"tindak\\\\\\\\\\\\\\\"]\\\\\\\"}\\\",\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Isenana:\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"Pak Lurah badhe ____ benjang.\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"(datang)\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"rawuh\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"dugi\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"teka\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"kesah\\\\\\\\\\\\\\\"]\\\\\\\"}\\\",\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Matur Pak Guru, tembung 'kowe' dadi...?\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"panjenengan\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"kowe\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"sampeyan\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"kula\\\\\\\\\\\\\\\"]\\\\\\\"}\\\",\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Ukara endi sing bener?\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"Kula badhe nedha.\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"Kula badhe dhahar.\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"Aku badhe dhahar.\\\\\\\\\\\\\\\"]\\\\\\\"}\\\"]\"}","{\"nama\":\"pedagang\",\"soal\":\"[\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Isenana:\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"Ibu ____ sayur.\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"(membeli)\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"mundhut\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"tumbas\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"tuku\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"maringi\\\\\\\\\\\\\\\"]\\\\\\\"}\\\",\\\"{\\\\\\\"tanya\\\\\\\":\\\\\\\"Basa krama saka 'tuku' yaiku...?\\\\\\\",\\\\\\\"ukara\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"petunjuk\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"jawab\\\\\\\":\\\\\\\"tumbas\\\\\\\",\\\\\\\"pengecoh\\\\\\\":\\\\\\\"[\\\\\\\\\\\\\\\"mundhut\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"tuku\\\\\\\\\\\\\\\",\\\\\\\\\\\\\\\"nyukani\\\\\\\\\\\\\\\"]\\\\\\\"}\\\"]\"}"]
 */
/*~struct~Bank:
 * @param nama
 * @text Nama Bank
 * @desc Nama kelompok, mis. penjaga. Ditulis sama persis di plugin command.
 * @default
 *
 * @param soal
 * @text Soal
 * @type struct<Soal>[]
 * @default []
 */
/*~struct~Soal:
 * @param tanya
 * @text Pertanyaan
 * @default
 *
 * @param ukara
 * @text Ukara (isian)
 * @desc Kalimat besar di tengah. Pakai ____ untuk bagian kosong. Boleh kosong.
 * @default
 *
 * @param petunjuk
 * @text Petunjuk
 * @desc Teks kecil di bawah kalimat, mis. (tidur). Boleh kosong.
 * @default
 *
 * @param jawab
 * @text Jawaban
 * @default
 *
 * @param pengecoh
 * @text Pengecoh
 * @desc Jawaban salah, 1-3 buah.
 * @type string[]
 * @default []
 */

(() => {
    "use strict";
    const params = PluginManager.parameters("AduTembung_BankSoal");
    const parse = (text, fallback) => {
        try { return JSON.parse(text); } catch (e) { return fallback; }
    };
    const str = v => String(v || "").trim();

    window.AduTembung = window.AduTembung || {};
    AduTembung.BANK = {};
    for (const b of parse(params["Bank"] || "[]", [])) {
        const bank = parse(b, null);
        if (!bank || !str(bank.nama)) continue;
        AduTembung.BANK[str(bank.nama).toLowerCase()] =
            parse(bank.soal || "[]", []).map(s => {
                const o = parse(s, null);
                if (!o || !str(o.tanya) || !str(o.jawab)) return null;
                return {
                    tanya:    str(o.tanya),
                    ukara:    str(o.ukara),
                    petunjuk: str(o.petunjuk),
                    jawab:    str(o.jawab),
                    pengecoh: parse(o.pengecoh || "[]", []).map(str).filter(Boolean)
                };
            }).filter(Boolean);
    }
})();
