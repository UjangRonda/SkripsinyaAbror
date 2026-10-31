//=============================================================================
// Kamus_Data.js  —  RPG Maker MZ
//=============================================================================
/*:
 * @target MZ
 * @plugindesc [Data] Daftar kata kamus "Serat Tembung" (ngoko / krama / krama inggil).
 * @orderBefore Kamus_Sistem
 *
 * @help
 * Plugin ini HANYA berisi data kata. Isi lewat Plugin Manager:
 * klik dua kali plugin ini > "Daftar Kata" > klik baris kosong untuk
 * menambah kata, atau klik dua kali kata yang ada untuk mengubahnya.
 *
 * Setiap kata:
 *   Ngoko        : bentuk ngoko (wajib). Juga dipakai sebagai kunci kata.
 *   Krama        : kosongkan kalau tidak ada bentuk khusus.
 *   Krama Inggil : kosongkan kalau tidak ada bentuk khusus.
 *   Arti         : arti dalam bahasa Indonesia.
 *   Contoh       : kalimat contoh (juga dipakai untuk soal isian Adu Tembung).
 *   Cathetan     : catatan penting (opsional).
 *
 * PENTING: kunci kata = bentuk ngoko. Kalau ngoko sebuah kata diganti,
 * kata itu kembali terkunci di save game lama.
 *
 * Cek ulang isi kamus dengan guru / penutur basa Jawa, karena pemakaian
 * bisa berbeda antar daerah.
 *
 * @param Kata
 * @text Daftar Kata
 * @type struct<Kata>[]
 * @default ["{\"ngoko\":\"mangan\",\"krama\":\"nedha\",\"inggil\":\"dhahar\",\"arti\":\"makan\",\"contoh\":\"[\\\"Bapak sampun dhahar.\\\",\\\"Kula sampun nedha.\\\"]\",\"cathetan\":\"Dhahar kanggo wong liya, ora kanggo awake dhewe.\"}","{\"ngoko\":\"turu\",\"krama\":\"tilem\",\"inggil\":\"sare\",\"arti\":\"tidur\",\"contoh\":\"[\\\"Simbah sampun sare.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"tangi\",\"krama\":\"tangi\",\"inggil\":\"wungu\",\"arti\":\"bangun\",\"contoh\":\"[\\\"Bapak sampun wungu.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"adus\",\"krama\":\"adus\",\"inggil\":\"siram\",\"arti\":\"mandi\",\"contoh\":\"[\\\"Adhik nembe adus.\\\",\\\"Simbah nembe siram.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"lunga\",\"krama\":\"kesah\",\"inggil\":\"tindak\",\"arti\":\"pergi\",\"contoh\":\"[\\\"Ibu tindak dhateng peken.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"teka\",\"krama\":\"dugi\",\"inggil\":\"rawuh\",\"arti\":\"datang\",\"contoh\":\"[\\\"Pak Lurah badhe rawuh benjang.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"ndeleng\",\"krama\":\"ningali\",\"inggil\":\"mirsani\",\"arti\":\"melihat\",\"contoh\":\"[\\\"Bapak mirsani wayang.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"krungu\",\"krama\":\"mireng\",\"inggil\":\"midhanget\",\"arti\":\"mendengar\",\"contoh\":\"[\\\"Simbah midhanget pawarta.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"kandha\",\"krama\":\"sanjang\",\"inggil\":\"ngendika\",\"arti\":\"berkata\",\"contoh\":\"[\\\"Pak Guru ngendika bilih benjang prei.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"nggawa\",\"krama\":\"mbekta\",\"inggil\":\"ngasta\",\"arti\":\"membawa\",\"contoh\":\"[\\\"Ibu ngasta tas.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"menehi\",\"krama\":\"nyukani\",\"inggil\":\"maringi\",\"arti\":\"memberi\",\"contoh\":\"[\\\"Simbah maringi arta.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"tuku\",\"krama\":\"tumbas\",\"inggil\":\"mundhut\",\"arti\":\"membeli\",\"contoh\":\"[\\\"Ibu mundhut sayur.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"duwe\",\"krama\":\"gadhah\",\"inggil\":\"kagungan\",\"arti\":\"punya\",\"contoh\":\"[\\\"Pak Lurah kagungan sapi.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"arep\",\"krama\":\"badhe\",\"inggil\":\"kersa\",\"arti\":\"mau / akan\",\"contoh\":\"[\\\"Panjenengan kersa tindak pundi?\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"lara\",\"krama\":\"sakit\",\"inggil\":\"gerah\",\"arti\":\"sakit\",\"contoh\":\"[\\\"Simbah nembe gerah.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"omah\",\"krama\":\"griya\",\"inggil\":\"dalem\",\"arti\":\"rumah\",\"contoh\":\"[\\\"Griya kula wonten ing desa.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"jeneng\",\"krama\":\"nama\",\"inggil\":\"asma\",\"arti\":\"nama\",\"contoh\":\"[\\\"Sinten asmanipun panjenengan?\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"sirah\",\"krama\":\"sirah\",\"inggil\":\"mustaka\",\"arti\":\"kepala\",\"contoh\":\"[]\",\"cathetan\":\"\"}","{\"ngoko\":\"tangan\",\"krama\":\"tangan\",\"inggil\":\"asta\",\"arti\":\"tangan\",\"contoh\":\"[]\",\"cathetan\":\"\"}","{\"ngoko\":\"banyu\",\"krama\":\"toya\",\"inggil\":\"\",\"arti\":\"air\",\"contoh\":\"[]\",\"cathetan\":\"\"}","{\"ngoko\":\"sega\",\"krama\":\"sekul\",\"inggil\":\"\",\"arti\":\"nasi\",\"contoh\":\"[]\",\"cathetan\":\"\"}","{\"ngoko\":\"iya\",\"krama\":\"inggih\",\"inggil\":\"\",\"arti\":\"ya\",\"contoh\":\"[\\\"Inggih, Pak.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"wis\",\"krama\":\"sampun\",\"inggil\":\"\",\"arti\":\"sudah\",\"contoh\":\"[\\\"Sampun, Bu.\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"kowe\",\"krama\":\"sampeyan\",\"inggil\":\"panjenengan\",\"arti\":\"kamu\",\"contoh\":\"[\\\"Panjenengan saking pundi?\\\"]\",\"cathetan\":\"\"}","{\"ngoko\":\"aku\",\"krama\":\"kula\",\"inggil\":\"\",\"arti\":\"aku / saya\",\"contoh\":\"[\\\"Kula badhe nedha.\\\"]\",\"cathetan\":\"Kanggo awake dhewe ora nganggo krama inggil.\"}"]
 */
/*~struct~Kata:
 * @param ngoko
 * @text Ngoko
 * @desc Bentuk ngoko (wajib). Dipakai juga sebagai kunci kata.
 * @default
 *
 * @param krama
 * @text Krama
 * @desc Kosongkan kalau tidak ada bentuk khusus.
 * @default
 *
 * @param inggil
 * @text Krama Inggil
 * @desc Kosongkan kalau tidak ada bentuk khusus.
 * @default
 *
 * @param arti
 * @text Arti
 * @desc Arti dalam bahasa Indonesia.
 * @default
 *
 * @param contoh
 * @text Contoh Kalimat
 * @type string[]
 * @default []
 *
 * @param cathetan
 * @text Cathetan
 * @type multiline_string
 * @default
 */

(() => {
    "use strict";
    const params = PluginManager.parameters("Kamus_Data");
    const parse = (text, fallback) => {
        try { return JSON.parse(text); } catch (e) { return fallback; }
    };
    const str = v => String(v || "").trim();

    window.Kamus = window.Kamus || {};
    Kamus.DATA = parse(params["Kata"] || "[]", []).map(s => {
        const o = parse(s, null);
        if (!o) return null;
        return {
            ngoko:    str(o.ngoko),
            krama:    str(o.krama),
            inggil:   str(o.inggil),
            arti:     str(o.arti),
            contoh:   parse(o.contoh || "[]", []).map(str).filter(Boolean),
            cathetan: str(o.cathetan)
        };
    }).filter(o => o && o.ngoko);
})();
