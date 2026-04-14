// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar status padrão
  const status1 = await prisma.orderStatus.findUnique({
    where: { id: 1 },
  })

  if (!status1) {
    await prisma.orderStatus.create({
      data: { id: 1, name: 'Pendente' },
    })
  }

  const status2 = await prisma.orderStatus.findUnique({
    where: { id: 2 },
  })

  if (!status2) {
    await prisma.orderStatus.create({
      data: { id: 2, name: 'Enviado' },
    })
  }

  const status3 = await prisma.orderStatus.findUnique({
    where: { id: 3 },
  })

  if (!status3) {
    await prisma.orderStatus.create({
      data: { id: 3, name: 'Entregue' },
    })
  }

  // Criar produtos padrão
  const products = [
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
    { title: 'Teclado Mecânico RGB', price: 449.90, discount: 22, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop' },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: products.indexOf(product) + 1 },
      update: {},
      create: {
        id: products.indexOf(product) + 1,
        title: product.title,
        price: product.price,
        discount: product.discount,
        image: product.image,
        published: true,
      },
    })
  }

  console.log('Seed iniciado com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
