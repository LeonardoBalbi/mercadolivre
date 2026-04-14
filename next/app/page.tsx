'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Product {
  id: number
  title: string
  price: number
  discount: number
  image: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  const discountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100
  }

  if (loading) {
    return <div className="text-center py-12">Carregando produtos...</div>
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-12 rounded-lg mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao MercadoLivre</h1>
        <p className="text-xl">Encontre os melhores produtos com os melhores preços</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative w-full h-48 bg-gray-200">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded font-bold">
                  -{product.discount}%
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold mb-2 text-sm line-clamp-2">{product.title}</h3>
              <div className="text-sm text-gray-600 mb-2">
                {product.discount > 0 && (
                  <>
                    <div className="line-through">
                      R$ {product.price.toFixed(2)}
                    </div>
                    <div className="text-green-600 font-bold text-lg">
                      R$ {discountedPrice(product.price, product.discount).toFixed(2)}
                    </div>
                  </>
                )}
                {product.discount === 0 && (
                  <div className="font-bold text-lg">
                    R$ {product.price.toFixed(2)}
                  </div>
                )}
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
