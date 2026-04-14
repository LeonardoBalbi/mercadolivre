const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const OrderStatus = sequelize.define('OrderStatus', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'order_statuses',
    timestamps: false
  })
  return OrderStatus
}