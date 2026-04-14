const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const GiftList = sequelize.define('GiftList', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'gift_lists',
    timestamps: false
  })
  return GiftList
}