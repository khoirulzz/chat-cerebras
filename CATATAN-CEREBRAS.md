# Batas input/output dan jawaban kosong

Diperiksa 12 September 2026 melalui dokumentasi resmi dan respons langsung katalog publik Cerebras. Angka katalog dapat berubah; ketersediaan dan kuota akun tetap menentukan penggunaan.

| Model | Konteks total | Output maksimum | Reasoning bawaan penyedia | Default paket ini |
| --- | ---: | ---: | --- | --- |
| qwen-3.8-27b | 65.536 | 32.768 | high | none |
| gpt-oss-120b | 131.072 | 40.960 | medium | low |

Angka konteks dan output di atas berasal dari respons langsung `https://api.cerebras.ai/public/v1/models`, field `limits.max_context_length` dan `limits.max_completion_tokens`. Dokumentasi endpoint: https://inference-docs.cerebras.ai/api-reference/models/public-models

## Input tidak memiliki jatah terpisah yang bisa ditambahkan sembarangan

Input meliputi instruksi sistem, pesan pengguna, riwayat yang dikirim, dan hasil Exa. Input + anggaran output harus muat dalam konteks model. `max_completion_tokens` membatasi keseluruhan output, termasuk token reasoning. `max_tokens` adalah alias, dan tidak boleh dikirim bersamaan.

Contoh batas matematis sebelum cadangan framing/estimasi: dengan output 16.384 token, Qwen memiliki sisa konteks 49.152 token; GPT OSS 114.688. Ini bukan jaminan kuota input akun per request. Paket memakai anggaran input konservatif 24.000 token, dapat diubah, dan cadangan konteks 2.048 token. Estimasi menggunakan byte UTF-8 / 3, bukan tokenizer resmi; jumlah sebenarnya bisa berbeda dan API tetap menjadi penentu akhir.

Dokumentasi: https://inference-docs.cerebras.ai/api-reference/chat-completions

## Mengapa kode sebelumnya bisa menghasilkan jawaban kosong?

Versi lama menetapkan output 4.096 token tanpa memilih reasoning. Pada Qwen, reasoning default high dapat menghabiskan budget sebelum menghasilkan jawaban akhir. GPT OSS juga menghitung reasoning sebagai output. Ini kemungkinan yang didukung mekanisme API, belum diagnosis terkonfirmasi untuk percobaan pengguna karena respons lengkapnya tidak tersedia.

Versi baru menetapkan budget default 16.384, reasoning none untuk Qwen dan low untuk GPT OSS. Low tidak menjamin jumlah token reasoning tertentu. GPT OSS tidak mendukung none, sehingga aplikasi tidak mengirim nilai tersebut. Model lain tidak diberi parameter reasoning yang belum diverifikasi.

Jika `finish_reason=length`, berarti output mencapai batas. Dengan jawaban kosong, naikkan output atau turunkan reasoning. Dengan jawaban parsial, lanjutkan atau bagi tugas kode menjadi beberapa file. Batas tinggi bukan jaminan model membuat program lengkap tanpa error.

Dokumentasi: https://inference-docs.cerebras.ai/capabilities/reasoning

## Batas token bukan rate limit

RPM/TPM membatasi request/token per periode. Memiliki sisa kredit tidak berarti bebas rate limit. Periksa kuota akun pada dashboard; angka katalog publik tidak menentukan semua batas akun. Error 400 biasanya request tidak diterima; 429 terkait rate limit. Pesan asli API harus diperiksa sebelum menyimpulkan penyebabnya.

Dokumentasi: https://inference-docs.cerebras.ai/support/rate-limits

## Hosting Exa

Netlify Function mengikuti pola JavaScript ES module default handler Request → Response dan directory `netlify/functions`. Deployment menggunakan Git, CLI atau API; bukan upload HTML saja.

https://docs.netlify.com/build/functions/get-started/
https://docs.netlify.com/build/functions/overview/
