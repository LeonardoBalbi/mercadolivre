const express = require('express')
const cors = require('cors')
const path = require('path')
const { engine } = require('express-handlebars')
const { sequelize, ensureDatabase } = require('./db')
const ProductFactory = require('./models/Product')
const CustomerFactory = require('./models/Customer')
const OrderFactory = require('./models/Order')
const CartItemFactory = require('./models/CartItem')
const OrderStatusFactory = require('./models/OrderStatus')
const QuestionFactory = require('./models/Question')
const ReviewFactory = require('./models/Review')
const GiftListFactory = require('./models/GiftList')
const GiftListItemFactory = require('./models/GiftListItem')

const app = express()
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }))
  app.engine('handlebars', engine({
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    },
    helpers: {
      formatBRL: (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value)),
      range: (start, end) => {
        const a = []
        for (let i = Number(start); i <= Number(end); i++) a.push(i)
        return a
      },
      eq: (a, b) => String(a) === String(b)
    }
  }))
app.set('view engine', 'handlebars')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, '..'), { index: false }))

const Product = ProductFactory(sequelize)
const Customer = CustomerFactory(sequelize)
const Order = OrderFactory(sequelize)
const CartItem = CartItemFactory(sequelize)
const OrderStatus = OrderStatusFactory(sequelize)
const Question = QuestionFactory(sequelize)
const Review = ReviewFactory(sequelize)
const GiftList = GiftListFactory(sequelize)
const GiftListItem = GiftListItemFactory(sequelize)

let bootPromise = null
let routesMounted = false

async function init() {
  await ensureDatabase()
  await sequelize.sync({ alter: true })
  const count = await Product.count()
  if (count === 0) {
    await Product.bulkCreate([
      { title: 'Smartphone Samsung Galaxy A54', price: 1899.99, discount: 15, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' },
      { title: 'Notebook Lenovo IdeaPad', price: 2999.90, discount: 20, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { title: 'Smart TV LG 50 4K', price: 2299.00, discount: 10, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop' },
      { title: 'Tênis Nike Air Max', price: 399.99, discount: 25, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
      { title: 'Fone JBL Bluetooth', price: 199.90, discount: 30, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' },
      { title: 'Cadeira Gamer ThunderX3', price: 899.00, discount: 18, image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=400&fit=crop' },
      { title: 'Console PlayStation 5', price: 3999.99, discount: 5, image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop' },
      { title: 'Apple Watch Series 8', price: 2899.00, discount: 12, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop' },
      { title: 'Tablet Samsung Galaxy Tab', price: 2199.90, discount: 15, image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop' },
      { title: 'Câmera Canon EOS Rebel', price: 2699.00, discount: 8, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop' },
      { title: 'Mouse Gamer Logitech', price: 249.90, discount: 20, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop' },
      { title: 'Teclado Mecânico RGB', price: 449.90, discount: 22, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop' }
    ])
  }

  if (!routesMounted) {
    const homeRouter = require('./routes/home')(Product, Order, CartItem, OrderStatus)
    const apiRouter = require('./routes/api')(Product, Customer)
    const userRouter = require('./routes/user')(Product, Customer, Order, OrderStatus, Question, Review, GiftList, GiftListItem)
    const adminRouter = require('./routes/admin')(Product, Customer, Order, OrderStatus)
    app.use('/', homeRouter)
    app.use('/api', apiRouter)
    app.use('/', userRouter)
    app.use('/admin', adminRouter)
    routesMounted = true
  }

  return app
}

async function bootstrap() {
  if (!bootPromise) {
    bootPromise = init()
  }
  return bootPromise
}

if (!process.env.VERCEL) {
  bootstrap()
    .then(() => {
      const port = process.env.PORT || 3000
      app.listen(port, () => {
        console.log(`server running on http://localhost:${port}`)
      })
    })
    .catch((err) => {
      console.error('failed to boot server', err)
      process.exit(1)
    })
}

module.exports = bootstrap