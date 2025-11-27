const { DataTypes } = require('sequelize');
const sequelize = require('./db.config'); 

const User = sequelize.define('User', {

    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false 
});

sequelize.sync({ alter: true }).then(() => {
    console.log('Model dan Tabel Users berhasil disinkronkan.');
}).catch(err => {
    console.error('Gagal sinkronisasi model:', err);
    process.exit(1); 
});


module.exports = User;