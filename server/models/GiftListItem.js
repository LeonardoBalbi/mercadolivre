const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const GiftListItem = sequelize.define('GiftListItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    list_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'gift_list_items',
    timestamps: false
  })
  return GiftListItem
}