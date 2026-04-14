const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.INTEGER, allowNull: false },
    image: { type: DataTypes.STRING(500), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    seller_id: { type: DataTypes.INTEGER, allowNull: true },
    published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    tableName: 'products',
    timestamps: false
  })
  return Product
}