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

module.exports = (Product, Customer, Order, OrderStatus, Question, Review, GiftList, GiftListItem) => {
  const router = Router()
  router.get('/user', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || req.query.user || '').toString()
    if (!username) return res.redirect('/login')
    const rows = await Product.findAll({ order: [['discount', 'DESC']], limit: 8 })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    const customersRows = Customer ? await Customer.findAll({ order: [['id', 'DESC']], limit: 5 }) : []
    const customers = customersRows.map(c => c.get ? c.get({ plain: true }) : c)
    const ordersRows = Order ? await Order.findAll({ where: { customer_id: Number(cookies.customer_id) || -1 }, order: [['id', 'DESC']], limit: 10 }) : []
    const ordersPlain = ordersRows.map(o => o.get ? o.get({ plain: true }) : o)
    const ids = Array.from(new Set(ordersPlain.map(o => o.product_id))).filter(Boolean)
    const mapProducts = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const prodMap = Object.fromEntries(mapProducts.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    let statusesMap = {}
    if (OrderStatus && ordersPlain.length) {
      const orderIds = ordersPlain.map(o => o.id)
      const sts = await OrderStatus.findAll({ where: { order_id: orderIds } })
      const stsPlain = sts.map(s => s.get ? s.get({ plain: true }) : s)
      statusesMap = stsPlain.reduce((acc, s) => {
        acc[s.order_id] = acc[s.order_id] || []
        acc[s.order_id].push(s)
        return acc
      }, {})
      for (const k of Object.keys(statusesMap)) {
        statusesMap[k].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }
    }
    const orders = ordersPlain.map(o => ({ ...o, product: prodMap[o.product_id], statuses: statusesMap[o.id] || [] }))
    res.render('user', { user: username, products: list, productsJson: JSON.stringify(list), customers, orders })
  })
  router.get('/user/products', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const page = parseInt(req.query.page || '1', 10)
    let pageSize = parseInt(req.query.pageSize || '12', 10)
    const state = String(req.query.state || 'published')
    const q = (req.query.q || '').trim()
    const sort = String(req.query.sort || 'recent')
    const where = { seller_id: Number(cookies.customer_id) || -1 }
    if (state === 'published') where.published = true
    else if (state === 'drafts') where.published = false
    if (q) where.title = { [Op.like]: `%${q}%` }
    pageSize = Math.max(6, Math.min(48, pageSize))
    const order =
      sort === 'price_asc' ? [['price', 'ASC']] :
      sort === 'price_desc' ? [['price', 'DESC']] :
      sort === 'discount_desc' ? [['discount', 'DESC']] :
      sort === 'discount_asc' ? [['discount', 'ASC']] :
      sort === 'title_asc' ? [['title', 'ASC']] :
      sort === 'title_desc' ? [['title', 'DESC']] :
      [['id','DESC']]
    const { rows, count } = await Product.findAndCountAll({ where, order, limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    res.render('user_products', { user: username, products: list, page, pages: Math.max(1, Math.ceil(count / pageSize)), state, q, sort, pageSize, productsJson: JSON.stringify([]) })
  })
  router.get('/user/products/new', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    res.render('user_product_new', { user: username })
  })
  router.post('/user/products', upload.single('image'), async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const sellerId = Number(cookies.customer_id) || 0
    if (!sellerId) return res.redirect('/login')
    const { title, price, discount, description } = req.body
    if (!title || !price || !discount || !req.file) {
      return res.status(400).render('user_product_new', { user: cookies.customer_name || '', error: 'Preencha todos os campos.' })
    }
    const imgPath = '/uploads/' + req.file.filename
    await Product.create({ title: String(title), price: parseFloat(price), discount: parseInt(discount, 10), image: imgPath, description: description ? String(description) : null, seller_id: sellerId, published: true })
    res.redirect('/user/products')
  })
  router.get('/user/products/:id/edit', async (req, res) => {
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
    if (!product) return res.redirect('/user/products')
    const plain = product.get ? product.get({ plain: true }) : product
    if (plain.seller_id !== Number(cookies.customer_id)) return res.redirect('/user/products')
    res.render('user_product_edit', { user: username, product: plain })
  })
  router.post('/user/products/:id/update', upload.single('image'), async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const id = parseInt(req.params.id, 10)
    const product = await Product.findByPk(id)
    if (!product) return res.redirect('/user/products')
    const plain = product.get ? product.get({ plain: true }) : product
    if (plain.seller_id !== Number(cookies.customer_id)) return res.redirect('/user/products')
    const { title, price, discount, description } = req.body
    if (!title || !price || !discount) {
      return res.status(400).render('user_product_edit', { user: cookies.customer_name || '', product: plain, error: 'Preencha todos os campos.' })
    }
    const nextImage = req.file ? ('/uploads/' + req.file.filename) : plain.image
    await Product.update({ title: String(title), price: parseFloat(price), discount: parseInt(discount, 10), image: nextImage, description: description ? String(description) : null }, { where: { id } })
    res.redirect('/user/products')
  })
  router.post('/user/products/:id/delete', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const id = parseInt(req.params.id, 10)
    const product = await Product.findByPk(id)
    if (!product) return res.redirect('/user/products')
    const plain = product.get ? product.get({ plain: true }) : product
    if (plain.seller_id !== Number(cookies.customer_id)) return res.redirect('/user/products')
    await Product.destroy({ where: { id } })
    res.redirect('/user/products')
  })
  router.post('/user/products/:id/publish', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const id = parseInt(req.params.id, 10)
    const product = await Product.findByPk(id)
    if (!product) return res.redirect('/user/products')
    const plain = product.get ? product.get({ plain: true }) : product
    if (plain.seller_id !== Number(cookies.customer_id)) return res.redirect('/user/products')
    const next = String(req.body.state || '').trim() === 'on'
    await Product.update({ published: next }, { where: { id } })
    res.redirect('/user/products')
  })
  router.get('/orders/:id', async (req, res) => {
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
    const order = await Order.findByPk(id)
    if (!order) return res.redirect('/user/history')
    const plain = order.get ? order.get({ plain: true }) : order
    const product = await Product.findByPk(plain.product_id)
    const prod = product && (product.get ? product.get({ plain: true }) : product)
    const statusesRows = OrderStatus ? await OrderStatus.findAll({ where: { order_id: id }, order: [['created_at', 'ASC']] }) : []
    const statuses = statusesRows.map(s => s.get ? s.get({ plain: true }) : s)
    res.render('order_user_detail', { user: username, order: plain, product: prod, statuses, productsJson: JSON.stringify([]) })
  })
  router.get('/user/history', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)
    const q = (req.query.q || '').trim()
    let prodIds
    if (q) {
      const prods = await Product.findAll({ where: { title: { [Op.like]: `%${q}%` } } })
      prodIds = prods.map(p => (p.get ? p.get({ plain: true }).id : p.id))
      if (!prodIds.length) prodIds = [-1]
    }
    const where = { customer_id: Number(cookies.customer_id) || -1 }
    if (q) where.product_id = prodIds
    const { rows: ordersRows, count } = await Order.findAndCountAll({ where, order: [['id','DESC']], limit: pageSize, offset: (page - 1) * pageSize })
    const ordersPlain = ordersRows.map(o => o.get ? o.get({ plain: true }) : o)
    let statusesMap = {}
    if (OrderStatus && ordersPlain.length) {
      const orderIds = ordersPlain.map(o => o.id)
      const sts = await OrderStatus.findAll({ where: { order_id: orderIds }, order: [['created_at', 'ASC']] })
      const stsPlain = sts.map(s => s.get ? s.get({ plain: true }) : s)
      statusesMap = stsPlain.reduce((acc, s) => {
        acc[s.order_id] = acc[s.order_id] || []
        acc[s.order_id].push(s)
        return acc
      }, {})
    }
    const ids = Array.from(new Set(ordersPlain.map(o => o.product_id))).filter(Boolean)
    const products = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const pmap = Object.fromEntries(products.map(p => { const pl = p.get ? p.get({ plain: true }) : p; return [pl.id, pl] }))
    const orders = ordersPlain.map(o => ({ ...o, product: pmap[o.product_id] }))
    res.render('user_history', { user: username, orders, statusesMap, q, page, pages: Math.max(1, Math.ceil(count / pageSize)), productsJson: JSON.stringify([]) })
  })
  router.get('/user/questions', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)
    const q = (req.query.q || '').trim()
    let prodIds
    if (q) {
      const prods = await Product.findAll({ where: { title: { [Op.like]: `%${q}%` } } })
      prodIds = prods.map(p => (p.get ? p.get({ plain: true }).id : p.id))
      if (!prodIds.length) prodIds = [-1]
    }
    const where = { customer_id: Number(cookies.customer_id) || -1 }
    if (q) where.product_id = prodIds
    const { rows, count } = await Question.findAndCountAll({ where, order: [['id','DESC']], limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    const ids = Array.from(new Set(list.map(q => q.product_id))).filter(Boolean)
    const products = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const pmap = Object.fromEntries(products.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    const data = list.map(q => ({ ...q, product: pmap[q.product_id] }))
    const productsForSelect = await Product.findAll({ order: [['title','ASC']], limit: 50 })
    const productsList = productsForSelect.map(p => p.get ? p.get({ plain: true }) : p)
    res.render('user_questions', { user: username, questions: data, q, page, pages: Math.max(1, Math.ceil(count / pageSize)), products: productsList, productsJson: JSON.stringify([]) })
  })
  router.post('/user/questions', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const customerId = Number(cookies.customer_id) || 0
    if (!customerId) return res.redirect('/login')
    const productId = parseInt(req.body.product_id, 10)
    const content = String(req.body.content || '').trim()
    if (!productId || !content) return res.redirect('/user/questions')
    await Question.create({ customer_id: customerId, product_id: productId, content })
    res.redirect('/user/questions')
  })
  router.get('/user/reviews', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const page = parseInt(req.query.page || '1', 10)
    const pageSize = parseInt(req.query.pageSize || '10', 10)
    const q = (req.query.q || '').trim()
    let prodIds
    if (q) {
      const prods = await Product.findAll({ where: { title: { [Op.like]: `%${q}%` } } })
      prodIds = prods.map(p => (p.get ? p.get({ plain: true }).id : p.id))
      if (!prodIds.length) prodIds = [-1]
    }
    const where = { customer_id: Number(cookies.customer_id) || -1 }
    if (q) where.product_id = prodIds
    const { rows, count } = await Review.findAndCountAll({ where, order: [['id','DESC']], limit: pageSize, offset: (page - 1) * pageSize })
    const list = rows.map(r => r.get ? r.get({ plain: true }) : r)
    const ids = Array.from(new Set(list.map(q => q.product_id))).filter(Boolean)
    const products = ids.length ? await Product.findAll({ where: { id: ids } }) : []
    const pmap = Object.fromEntries(products.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    const data = list.map(r => ({ ...r, product: pmap[r.product_id] }))
    const productsForSelect = await Product.findAll({ order: [['title','ASC']], limit: 50 })
    const productsList = productsForSelect.map(p => p.get ? p.get({ plain: true }) : p)
    res.render('user_reviews', { user: username, reviews: data, q, page, pages: Math.max(1, Math.ceil(count / pageSize)), products: productsList, productsJson: JSON.stringify([]) })
  })
  router.post('/user/reviews', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const customerId = Number(cookies.customer_id) || 0
    if (!customerId) return res.redirect('/login')
    const productId = parseInt(req.body.product_id, 10)
    const rating = Math.max(1, Math.min(5, parseInt(req.body.rating || '5', 10)))
    const comment = String(req.body.comment || '').trim()
    if (!productId) return res.redirect('/user/reviews')
    await Review.create({ customer_id: customerId, product_id: productId, rating, comment })
    res.redirect('/user/reviews')
  })
  router.get('/user/gifts', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    const listsRows = await GiftList.findAll({ where: { customer_id: Number(cookies.customer_id) || -1 }, order: [['id','DESC']] })
    const lists = listsRows.map(l => l.get ? l.get({ plain: true }) : l)
    const listIds = lists.map(l => l.id)
    const itemsRows = listIds.length ? await GiftListItem.findAll({ where: { list_id: listIds } }) : []
    const items = itemsRows.map(i => i.get ? i.get({ plain: true }) : i)
    const prodIds = Array.from(new Set(items.map(i => i.product_id))).filter(Boolean)
    const products = prodIds.length ? await Product.findAll({ where: { id: prodIds } }) : []
    const pmap = Object.fromEntries(products.map(p => {
      const pl = p.get ? p.get({ plain: true }) : p
      return [pl.id, pl]
    }))
    const byList = {}
    for (const it of items) {
      byList[it.list_id] = byList[it.list_id] || []
      byList[it.list_id].push({ ...it, product: pmap[it.product_id] })
    }
    const data = lists.map(l => ({ ...l, items: byList[l.id] || [] }))
    const productsForSelect = await Product.findAll({ order: [['title','ASC']], limit: 50 })
    const productsList = productsForSelect.map(p => p.get ? p.get({ plain: true }) : p)
    res.render('user_gifts', { user: username, lists: data, products: productsList, productsJson: JSON.stringify([]) })
  })
  router.post('/user/gifts', async (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const customerId = Number(cookies.customer_id) || 0
    if (!customerId) return res.redirect('/login')
    const title = String(req.body.title || '').trim()
    if (!title) return res.redirect('/user/gifts')
    await GiftList.create({ customer_id: customerId, title })
    res.redirect('/user/gifts')
  })
  router.post('/user/gifts/:id/items', async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const productId = parseInt(req.body.product_id, 10)
    const quantity = Math.max(1, parseInt(req.body.quantity || '1', 10))
    if (!id || !productId) return res.redirect('/user/gifts')
    await GiftListItem.create({ list_id: id, product_id: productId, quantity })
    res.redirect('/user/gifts')
  })
  router.post('/user/gifts/items/:itemId/delete', async (req, res) => {
    const itemId = parseInt(req.params.itemId, 10)
    if (!itemId) return res.redirect('/user/gifts')
    await GiftListItem.destroy({ where: { id: itemId } })
    res.redirect('/user/gifts')
  })
  router.get('/login', (req, res) => {
    res.render('login')
  })
  router.get('/admin/become', (req, res) => {
    const raw = String(req.headers.cookie || '')
    const pairs = raw.split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf('=')
      if (i < 0) return null
      return [decodeURIComponent(s.slice(0, i)), decodeURIComponent(s.slice(i + 1))]
    }).filter(Boolean)
    const cookies = Object.fromEntries(pairs)
    const username = (cookies.customer_name || '').toString()
    if (!username) return res.redirect('/login')
    res.cookie('is_admin', '1', { httpOnly: true })
    res.redirect('/admin/orders')
  })
  router.post('/login', async (req, res) => {
    const email = String(req.body.email || '').trim()
    if (!email) return res.status(400).render('login', { error: 'Informe seu e-mail.' })
    const existing = await Customer.findOne({ where: { email } })
    if (!existing) return res.redirect('/admin/customers/new')
    const plain = existing.get ? existing.get({ plain: true }) : existing
    res.cookie('customer_id', String(plain.id), { httpOnly: true })
    res.cookie('customer_name', String(plain.name), { httpOnly: true })
    res.redirect('/user')
  })
  router.get('/logout', (req, res) => {
    res.clearCookie('customer_id')
    res.clearCookie('customer_name')
    res.redirect('/')
  })
  return router
}
