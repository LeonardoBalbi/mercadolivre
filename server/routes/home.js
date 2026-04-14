const { Router } = require('express')
const { Op } = require('sequelize')

module.exports = (Product, Order, CartItem, OrderStatus) => {
  const router = Router()
  router.get('/', async (req, res) => {
    const rows = await Product.findAll({ where: { published: true }, order: [['id', 'ASC']] })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    res.render('home', { products: list, productsJson: JSON.stringify(list) })
  })
  router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim()
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '12', 10)
    const where = q ? { title: { [Op.like]: `%${q}%` }, published: true } : { published: true }
    const { rows, count } = await Product.findAndCountAll({ where, order: [['id', 'ASC']], limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get({ plain: true }))
    res.render('search', { products: list, productsJson: JSON.stringify(list), q, page, pages: Math.max(1, Math.ceil(count / pageSize)), total: count })
  })
  router.get('/lista/:slug', async (req, res) => {
    const q = String(req.params.slug || '').replace(/-/g, ' ').trim()
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '12', 10)
    const where = q ? { title: { [Op.like]: `%${q}%` }, published: true } : { published: true }
    const { rows, count } = await Product.findAndCountAll({ where, order: [['id', 'ASC']], limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get({ plain: true }))
    res.render('search', { products: list, productsJson: JSON.stringify(list), q, page, pages: Math.max(1, Math.ceil(count / pageSize)), total: count })
  })
  router.get('/products/:id', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const id = parseInt(req.params.id, 10)
    const product = await Product.findByPk(id)
    if (!product) return res.redirect('/')
    const plain = product.get ? product.get({ plain: true }) : product
    const finalPrice = Number(plain.price) * (1 - Number(plain.discount || 0) / 100)
    const installment = finalPrice / 12
    res.render('product_detail', { product: plain, finalPrice, installment, user: username, productsJson: JSON.stringify([]) })
  })
  router.post('/purchase', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const productId = parseInt(req.body.product_id, 10)
    const quantity = Math.max(1, parseInt(req.body.quantity || '1', 10))
    const method = String(req.body.method || 'Cartão')
    const product = await Product.findByPk(productId)
    if (!product) return res.redirect('/')
    const plain = product.get ? product.get({ plain: true }) : product
    const unitFinal = Number(plain.price) * (1 - Number(plain.discount || 0) / 100)
    const total = unitFinal * quantity
    const customerId = parseInt(cookies.customer_id || '0', 10)
    if (!customerId) return res.redirect('/login')
    const order = await Order.create({ customer_id: customerId, product_id: plain.id, quantity, method, unit_price: unitFinal, total, status: 'CONFIRMADO' })
    if (OrderStatus) {
      await OrderStatus.create({ order_id: order.id, status: 'CONFIRMADO' })
    }
    res.render('purchase_success', { product: plain, quantity, method, unitFinal, total, orderId: order.id, user: username, productsJson: JSON.stringify([]) })
  })
  router.post('/cart/add', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const customerId = parseInt(cookies.customer_id || '0', 10)
    if (!customerId) return res.redirect('/login')
    const productId = parseInt(req.body.product_id, 10)
    const quantity = Math.max(1, parseInt(req.body.quantity || '1', 10))
    const product = await Product.findByPk(productId)
    if (!product) return res.redirect('/')
    const existing = await CartItem.findOne({ where: { customer_id: customerId, product_id: productId } })
    if (existing) {
      await CartItem.update({ quantity: existing.quantity + quantity }, { where: { id: existing.id } })
    } else {
      await CartItem.create({ customer_id: customerId, product_id: productId, quantity })
    }
    res.redirect('/cart')
  })
  router.get('/cart', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const customerId = parseInt(cookies.customer_id || '0', 10)
    const items = await CartItem.findAll({ where: { customer_id: customerId }, order: [['id', 'ASC']] })
    const plainItems = items.map(i => i.get ? i.get({ plain: true }) : i)
    const ids = Array.from(new Set(plainItems.map(i => i.product_id))).filter(Boolean)
    const products = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const prodMap = Object.fromEntries(products.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    const rows = plainItems.map(i => {
      const p = prodMap[i.product_id]
      const unitFinal = Number(p.price) * (1 - Number(p.discount || 0) / 100)
      const total = unitFinal * Number(i.quantity)
      return { ...i, product: p, unitFinal, total }
    })
    const grandTotal = rows.reduce((acc, r) => acc + Number(r.total), 0)
    res.render('cart', { user: username, items: rows, grandTotal, productsJson: JSON.stringify([]) })
  })
  router.post('/cart/remove/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10)
    if (!isNaN(id)) await CartItem.destroy({ where: { id } })
    res.redirect('/cart')
  })
  router.post('/cart/checkout', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const customerId = parseInt(cookies.customer_id || '0', 10)
    const method = String(req.body.method || 'Cartão')
    const items = await CartItem.findAll({ where: { customer_id: customerId } })
    const plainItems = items.map(i => i.get ? i.get({ plain: true }) : i)
    for (const i of plainItems) {
      const p = await Product.findByPk(i.product_id)
      if (!p) continue
      const pl = p.get ? p.get({ plain: true }) : p
      const unitFinal = Number(pl.price) * (1 - Number(pl.discount || 0) / 100)
      const total = unitFinal * Number(i.quantity)
      const order = await Order.create({ customer_id: customerId, product_id: pl.id, quantity: i.quantity, method, unit_price: unitFinal, total, status: 'CONFIRMADO' })
      if (OrderStatus) {
        await OrderStatus.create({ order_id: order.id, status: 'CONFIRMADO' })
      }
    }
    await CartItem.destroy({ where: { customer_id: customerId } })
    res.redirect('/user')
  })
  return router
}