const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;

// 1. Konfigurasi Koneksi Database
const pool = new Pool({
    user: 'postgres',        // Ganti dengan username postgres kamu
    host: 'localhost',
    database: 'gigi_kecil', // Ganti dengan nama database kamu
    password: '1212',        // Ganti dengan password postgres kamu
    port: 5432,
});

// 2. Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Menyajikan file HTML/CSS dari folder public

// 3. Route untuk Register (Daftar)
app.post('/register-process', async (req, res) => {
    const { user_nama, user_email, user_password, konfirmasi_password } = req.body;

    // Validasi sederhana
    if (user_password !== konfirmasi_password) {
        return res.send('<script>alert("Password tidak sama!"); window.history.back();</script>');
    }

    try {
        // Enkripsi password sebelum disimpan (Wajib demi keamanan)
        const hashedPassword = await bcrypt.hash(user_password, 10);

        // Masukkan ke Database
        const query = 'INSERT INTO users (nama, email, password) VALUES ($1, $2, $3)';
        await pool.query(query, [user_nama, user_email, hashedPassword]);

        // Jika sukses, arahkan ke halaman login
        res.redirect('/masuk.html');
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Error kode untuk email duplikat
            res.send('<script>alert("Email sudah terdaftar!"); window.history.back();</script>');
        } else {
            res.send('Terjadi kesalahan pada server.');
        }
    }
});

// 4. Route untuk Login (Masuk)
app.post('/login-process', async (req, res) => {
    const { user_email, user_password } = req.body;

    try {
        // Cari user berdasarkan email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [user_email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Cek apakah password cocok dengan yang ada di database
            const match = await bcrypt.compare(user_password, user.password);

            if (match) {
                // Login Berhasil
                // Disini biasanya kita set session/cookie, tapi untuk simpelnya kita redirect dulu
                res.send(`<script>alert("Selamat Datang, ${user.nama}!"); window.location.href="/index.html";</script>`);
            } else {
                res.send('<script>alert("Password salah!"); window.history.back();</script>');
            }
        } else {
            res.send('<script>alert("Email tidak ditemukan!"); window.history.back();</script>');
        }
    } catch (err) {
        console.error(err);
        res.send('Terjadi kesalahan saat login.');
    }
});

// Jalankan Server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});