import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        price: true,
        discount: true,
        image: true,
        description: true,
      },
      orderBy: { id: 'asc' },
    })
    
    // Converter Decimal para número
    const productsFormatted = products.map((product) => ({
      ...product,
      price: Number(product.price),
    }))
    
    return NextResponse.json(productsFormatted)
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, price, discount, image, description } = body

    if (!title || !price || !image) {
      return NextResponse.json(
        { error: 'Título, preço e imagem são obrigatórios' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        title,
        price: parseFloat(price),
        discount: discount || 0,
        image,
        description: description || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}
