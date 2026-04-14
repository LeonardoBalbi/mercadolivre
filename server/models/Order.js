const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    method: { type: DataTypes.STRING(50), allowNull: false },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'CONFIRMADO' },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'orders',
    timestamps: false
  })
  return Order
}