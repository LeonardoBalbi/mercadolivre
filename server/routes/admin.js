const { Router } = require('express')
const { Op } = require('sequelize')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const rootDir = path.join(__dirname, '..', '..')
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(rootDir, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2)
    cb(null, base.replace(/[^a-z0-9-_]/gi, '_') + '-' + unique + ext)
  }
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true)
    else cb(new Error('Tipo de arquivo inválido'))
  }
})

module.exports = (Product, Customer, Order, OrderStatus) => {
  const router = Router()
  router.get('/products/new', async (req, res) => {
    res.render('product_new')
  })
  router.get('/products', async (req, res) => {
    res.redirect('/admin/products/new')
  })
  router.get('/login', (req, res) => {
    res.render('admin_login')
  })
  router.post('/login', (req, res) => {
    const code = String(req.body.code || '').trim()
    const expected = process.env.ADMIN_CODE || 'admin123'
    if (code !== expected) return res.status(400).render('admin_login', { error: 'Código inválido.' })
    res.cookie('is_admin', '1', { httpOnly: true })
    res.redirect('/admin/orders')
  })
  function requireAdmin(req, res, next) {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    if (String(cookies.is_admin || '') !== '1') return res.redirect('/login')
    next()
  }
  router.get('/customers/new', async (req, res) => {
    res.render('customer_new')
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
    const list = rows.map(r => r.get({ plain: true }))
    res.render('customers_list', { customers: list, page, pages: Math.max(1, Math.ceil(count / pageSize)), q, total: count })
  })
  router.post('/customers/:id/delete', async (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (!Number.isFinite(id)) return res.redirect('/admin/customers')
    await Customer.destroy({ where: { id } })
    res.redirect('/admin/customers')
  })
  router.post('/customers', async (req, res) => {
    const { name, email, phone } = req.body
    if (!name || !email || !phone) {
      return res.status(400).render('customer_new', { error: 'Preencha todos os campos.' })
    }
    try {
      const created = await Customer.create({ name: String(name), email: String(email), phone: String(phone) })
      res.cookie('customer_id', String(created.id), { httpOnly: true })
      res.cookie('customer_name', String(name), { httpOnly: true })
      res.redirect('/user')
    } catch (e) {
      res.status(400).render('customer_new', { error: 'E-mail já cadastrado ou inválido.' })
    }
  })
  router.get('/customers/:id/edit', async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const customer = await Customer.findByPk(id)
    if (!customer) return res.redirect('/admin/customers')
    res.render('customer_edit', { customer: customer.get({ plain: true }) })
  })
  router.post('/customers/:id/update', async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { name, email, phone } = req.body
    if (!name || !email || !phone) {
      const customer = await Customer.findByPk(id)
      return res.status(400).render('customer_edit', { customer: customer && customer.get({ plain: true }), error: 'Preencha todos os campos.' })
    }
    try {
      await Customer.update({ name: String(name), email: String(email), phone: String(phone) }, { where: { id } })
      res.redirect('/admin/customers')
    } catch (e) {
      const customer = await Customer.findByPk(id)
      res.status(400).render('customer_edit', { customer: customer && customer.get({ plain: true }), error: 'E-mail já cadastrado ou inválido.' })
    }
  })
  router.post('/products', upload.single('image'), async (req, res) => {
    const { title, price, discount, description } = req.body
    if (!title || !price || !discount || !req.file) {
      return res.status(400).render('product_new', { error: 'Preencha todos os campos.' })
    }
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const sellerId = cookies.customer_id ? parseInt(cookies.customer_id, 10) : null
    const imgPath = '/uploads/' + req.file.filename
    const created = await Product.create({
      title: String(title),
      price: parseFloat(price),
      discount: parseInt(discount, 10),
      image: imgPath,
      description: description ? String(description) : null,
      seller_id: sellerId || null
    })
    res.redirect('/')
  })
  router.get('/orders', requireAdmin, async (req, res) => {
    const q = (req.query.q || '').trim()
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)
    const where = q ? { status: { [Op.like]: `%${q}%` } } : undefined
    const { rows, count } = await Order.findAndCountAll({ where, order: [['id', 'DESC']], limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    const ids = Array.from(new Set(list.map(o => o.product_id))).filter(Boolean)
    const products = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const pmap = Object.fromEntries(products.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    const data = list.map(o => ({ ...o, product: pmap[o.product_id] }))
    res.render('orders_list', { orders: data, page, pages: Math.max(1, Math.ceil(count / pageSize)), q, total: count })
  })
  router.get('/orders/:id', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const order = await Order.findByPk(id)
    if (!order) return res.redirect('/admin/orders')
    const plain = order.get ? order.get({ plain: true }) : order
    const product = await Product.findByPk(plain.product_id)
    const prod = product && (product.get ? product.get({ plain: true }) : product)
    const statusesRows = OrderStatus ? await OrderStatus.findAll({ where: { order_id: id }, order: [['created_at', 'ASC']] }) : []
    const statuses = statusesRows.map(s => s.get ? s.get({ plain: true }) : s)
    res.render('order_detail', { order: plain, product: prod, statuses })
  })
  router.post('/orders/:id/status', requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const status = String(req.body.status || '').trim()
    if (!status) return res.redirect(`/admin/orders/${id}`)
    const order = await Order.findByPk(id)
    if (!order) return res.redirect('/admin/orders')
    await Order.update({ status }, { where: { id } })
    if (OrderStatus) {
      await OrderStatus.create({ order_id: id, status })
    }
    res.redirect(`/admin/orders/${id}`)
  })
  return router
}
