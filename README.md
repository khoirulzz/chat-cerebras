# Cerebras Chat Lab — Netlify + Exa + riwayat

Paket siap deploy. Tampilan berada di `public/index.html` (CSS/JavaScript sudah dibundel), sedangkan pencarian web dijalankan melalui `netlify/functions/exa.mjs`. Tidak perlu build frontend atau memasukkan API key ke source.

## Deploy melalui GitHub (bisa dari browser)

1. Ekstrak ZIP. Buat repository di GitHub, lalu unggah seluruh isi folder paket: `public`, `netlify`, dan `netlify.toml` berada di root repository. Sertakan juga README dan catatan.
2. Di Netlify pilih **Add new project → Import an existing project**, hubungkan GitHub, lalu pilih repository tadi. Label menu dapat sedikit berbeda.
3. Base directory: kosong/root repository. Build command: kosong. Publish directory: `public`. Functions directory: `netlify/functions` (sudah diatur dalam `netlify.toml`).
4. Deploy. Untuk memperbarui website Netlify yang sudah ada, hubungkan repository ini ke proyek tersebut agar alamatnya tetap sama.
5. Buka URL HTTPS website dan Pengaturan API. Isi key Cerebras, key Exa, pilih model, lalu klik Simpan. Mode Web otomatis memakai Function di website ini, tanpa URL proxy manual.

**Jangan unggah hanya index.html atau menggunakan Netlify Drop untuk paket ini.** Function memerlukan deployment melalui Git, CLI, atau API Netlify. Drag-and-drop aset statis saja tidak men-deploy Function.

## Alternatif Netlify CLI

Dari folder yang berisi `netlify.toml`, jalankan `npx netlify-cli login`, lalu `npx netlify-cli link` untuk proyek yang sudah ada (atau `npx netlify-cli init` untuk baru). Jalankan `npx netlify-cli deploy --prod`. Konfigurasi publish dan functions dibaca dari TOML. Uji lokal dapat memakai `npx netlify-cli dev`.

## Penggunaan

- Chat, Tulis, Kode, dan Web tetap tersedia. Pilihan model ada di header.
- Default output aplikasi 16.384 token. Ini plafon per permintaan, bukan jumlah yang selalu dipakai.
- Reasoning otomatis: Qwen `none`; GPT OSS `low`. Bisa diubah di Pengaturan. GPT OSS tidak mendukung mematikan reasoning.
- Input aplikasi default 24.000 token perkiraan. Anggaran efektif mengikuti sisa konteks model setelah output dan cadangan 2.048 token. Pesan lama yang tidak muat dikeluarkan dari permintaan, bukan dihapus dari riwayat. Pesan terakhir tidak dipotong diam-diam.
- Setelah jawaban, pemakaian token API ditampilkan bila tersedia. Jika terpotong, klik Lanjutkan. Jika kosong, lihat finish_reason dan budget pada pesan error, lalu ubah pengaturan dan klik Coba lagi. Tidak ada retry berbayar otomatis.
- Muat model dari Cerebras memperbarui daftar model akun dan mencoba mengambil batas dari katalog publik. Klik Simpan setelah memperbarui. Jika katalog gagal, batas snapshot tetap dipakai. Model lain memakai batas konservatif aplikasi 8.192 konteks / 4.096 output sampai metadata tersedia.

## Riwayat dan pengaturan browser

Sesi tersimpan otomatis di localStorage dengan nama berdasarkan pesan pertama. Percakapan baru membuat sesi baru; sesi lama bisa dibuka dari sidebar. Ada hapus per sesi dan ekspor riwayat JSON (tanpa API key). Kegagalan penyimpanan, misalnya kuota penuh, ditampilkan dan data tidak sengaja dibuang untuk mengosongkan ruang.

Pengaturan API tetap tersimpan setelah klik Simpan. Riwayat dan key hanya tersedia pada browser/profil serta origin yang sama. Pindah domain, subdomain, profil, atau perangkat tidak memindahkannya. Menghapus data situs menghapus penyimpanan; private/incognito dapat membuang data saat ditutup. Pembaruan pada domain Netlify yang sama mempertahankan key dari HTML versi sebelumnya.

Gunakan satu tab aktif untuk mengedit riwayat; paket ini belum menyinkronkan konflik antar-tab. Percakapan pada versi lama yang hilang saat refresh tidak dapat dipulihkan. File ekspor tersedia sebagai backup; impor otomatis belum disediakan.

## Exa dan kredensial

Exa key dikirim dari browser ke Function Netlify milik proyek ini, kemudian hanya ke `https://api.exa.ai/search`. Function tidak menerima URL upstream arbitrer, tidak menanam key bersama, dan tidak mencetak key atau isi permintaan ke log. Browser Cerebras tetap terhubung langsung ke `https://api.cerebras.ai/v1`. Key Cerebras tidak dikirim ke Function Exa.

Function menerima POST JSON query 1–5.000 karakter, maksimal 5 hasil dengan teks 2.200 karakter/hasil dan timeout Exa 20 detik. Tidak menerima permintaan browser dari origin lain. Pemeriksaan origin bukan autentikasi; setiap pemanggil tetap harus menyediakan Exa key sendiri. Pemanggilan tetap menggunakan kuota Exa dan Netlify milik akun terkait.

## Pemeriksaan

Build HTML, alur request tiruan, penghitungan anggaran konteks, error output kosong/terpotong, pemulihan penyimpanan, dan handler Exa diuji secara lokal. Belum dilakukan deployment Netlify atau panggilan AI berbayar dengan key pengguna. Error HTTP 400 spesifik pengguna belum direproduksi; perbaikan ini mengatasi budget/reasoning dan memperjelas diagnosis, bukan mengklaim seluruh kemungkinan HTTP 400 selesai.

Rincian sumber resmi dan batas model: lihat `CATATAN-CEREBRAS.md`.
