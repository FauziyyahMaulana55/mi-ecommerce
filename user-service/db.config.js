const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'userdb', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || 'root', 
    {
        host: process.env.DB_HOST || 'user-db', 
        dialect: 'mysql',
        port: 3306,
        logging: false 
    }
);

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Koneksi Sequelize ke Database berhasil.');
    } catch (error) {
        console.error('Gagal terhubung ke Database dengan Sequelize:', error.message);
    }
}

testConnection();

module.exports = sequelize;