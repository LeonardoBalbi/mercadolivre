const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(50), allowNull: false }
  }, {
    tableName: 'customers',
    timestamps: false
  })
  return Customer
}