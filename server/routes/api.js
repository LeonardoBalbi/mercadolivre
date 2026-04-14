const { Router } = require('express')
const { Op } = require('sequelize')

module.exports = (Product, Customer) => {
  const router = Router()
  router.get('/products', async (req, res) => {
    const q = (req.query.q || '').trim()
    const pageSize = parseInt(req.query.pageSize || '50', 10)
    const where = q ? { title: { [Op.like]: `%${q}%` }, published: true } : { published: true }
    const rows = await Product.findAll({ where, order: [['id', 'ASC']], limit: pageSize })
    res.json(rows.map(r => r.get ? r.get({ plain: true }) : r))
  })
  router.get('/health', async (req, res) => {
    const count = await Product.count()
    res.json({ ok: true, db: 'up', products_count: count })
  })
  router.get('/customers', async (req, res) => {
    const q = (req.query.q || '').trim()
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)
    const where = q ? { [Op.or]: [
      { name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } }
    ] } : undefined
    const { rows, count } = await Customer.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    })
    res.json({
      data: rows,
      pagination: {
        page,
        pageSize,
        total: count,
        pages: Math.max(1, Math.ceil(count / pageSize))
      }
    })
  })
  return router
}