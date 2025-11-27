const express = require('express');
const cors = require('cors');

const sequelize = require('./db.config'); 
const User = require('./UserModel'); 

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json()); 

app.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role'] 
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error saat mengambil user:", error);
        res.status(500).json({ message: 'Kesalahan server saat mengambil data.', error: error.message });
    }
});

app.get('/users/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role']
        });

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User tidak ditemukan' });
        }
    } catch (error) {
        console.error("Error saat mengambil detail user:", error);
        res.status(500).json({ message: 'Kesalahan server saat mengambil detail data.' });
    }
});

app.post('/users', async (req, res) => {
    const { name, email, role } = req.body;

    let errors = [];

    
    if (!name) errors.push("Nama wajib diisi");
    if (!email) errors.push("Email wajib diisi");
    if (!role) errors.push("Role wajib diisi");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push("Format email tidak valid");
    }

    const allowedRoles = ["admin", "customer"];
    if (role && !allowedRoles.includes(role.toLowerCase())) {
        errors.push("Role Wajib diisi");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        const newUser = await User.create({
            name,
            email,
            role: role.toLowerCase()
        });

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                errors: ["Email sudah terdaftar"]
            });
        }

        console.error("Error saat menambah user:", error);
        res.status(500).json({
            errors: ["Kesalahan server saat menyimpan data"]
        });
    }
});

app.listen(PORT, () => {
    console.log(`User Service (Sequelize) berjalan pada http://localhost:${PORT}`);
});
