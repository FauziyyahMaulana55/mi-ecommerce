const express = require('express');
const app = express();
const sequelize = require('./database');
const { DataTypes } = require('sequelize');
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Model
const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  price: { type: DataTypes.FLOAT, allowNull: false }
});

// ==== Function tunggu MySQL siap ====
const connectWithRetry = async () => {
  let retries = 20;

  while (retries) {
    try {
      console.log("Mencoba koneksi ke database...");
      await sequelize.authenticate();
      console.log("Koneksi ke database berhasil!");
      return true;
    } catch (err) {
      retries--;
      console.log(`Gagal koneksi, mencoba lagi... (${retries} retry tersisa)`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }

  throw new Error("Tidak bisa konek ke database setelah beberapa percobaan.");
};

// ==== Init Database ====
const initDb = async () => {
  await connectWithRetry();
  await sequelize.sync({ alter: true });
  console.log("Tabel produk siap!");
};

// ==== ROUTES ====

const successResponse = (res, message, data = null) => {
  res.status(200).json({ success: true, message, data });
};

const errorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

// CREATE
app.post('/products', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) return errorResponse(res, 400, "Nama dan harga wajib");

    const newProduct = await Product.create({ name, description, price });
    successResponse(res, "Produk ditambah", newProduct);

  } catch (err) {
    console.log(err);
    errorResponse(res, 500, "Gagal menambah produk");
  }
});

// READ ALL
app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    successResponse(res, "Produk ditemukan", products);
  } catch (err) {
    errorResponse(res, 500, "Gagal mengambil produk");
  }
});

// READ BY ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, "Produk tidak ditemukan");

    successResponse(res, "Produk ditemukan", product);
  } catch (err) {
    errorResponse(res, 500, "Gagal mengambil produk");
  }
});

// UPDATE
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, "Produk tidak ditemukan");

    await product.update(req.body);
    successResponse(res, "Produk diperbarui", product);

  } catch (err) {
    errorResponse(res, 500, "Gagal update produk");
  }
});

// DELETE
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return errorResponse(res, 404, "Produk tidak ditemukan");

    await product.destroy();
    successResponse(res, "Produk dihapus");

  } catch (err) {
    errorResponse(res, 500, "Gagal hapus produk");
  }
});

// START SERVER
initDb().then(() => {
  app.listen(3000, () => console.log("Product service berjalan di port 3000"));
});
