import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        status: true,
        items: {
          include: {
            order: false,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_id, items } = body

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer ID e items são obrigatórios' },
        { status: 400 }
      )
    }

    // Calcular preço total
    let totalPrice = 0
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.product_id },
      })
      if (product) {
        totalPrice += Number(product.price) * item.quantity
      }
    }

    const order = await prisma.order.create({
      data: {
        customer_id,
        status_id: 1, // Status padrão: Pendente
        total_price: totalPrice,
        items: {
          create: items.map((item: any) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price || 0,
          })),
        },
      },
      include: {
        customer: true,
        status: true,
        items: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}
