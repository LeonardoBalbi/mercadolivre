'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Product {
  id: number
  title: string
  price: number
  discount: number
  image: string
  description?: string
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('nome')

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

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'preco-asc':
        return a.price - b.price
      case 'preco-desc':
        return b.price - a.price
      case 'desconto':
        return b.discount - a.discount
      default:
        return a.title.localeCompare(b.title)
    }
  })

  const discountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100
  }

  if (loading) {
    return <div className="text-center py-12">Carregando produtos...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Catálogo de Produtos</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Buscar Produtos</label>
            <input
              type="text"
              placeholder="Digite o nome do produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Ordenar Por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="nome">Nome (A-Z)</option>
              <option value="preco-asc">Preço (Menor)</option>
              <option value="preco-desc">Preço (Maior)</option>
              <option value="desconto">Maior Desconto</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4 text-gray-600">
        Mostrando {sortedProducts.length} de {products.length} produtos
      </div>

      {sortedProducts.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-center">
          Nenhum produto encontrado com o termo "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
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

                {product.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                )}

                <div className="text-sm text-gray-600 mb-2">
                  {product.discount > 0 && (
                    <>
                      <div className="line-through">R$ {product.price.toFixed(2)}</div>
                      <div className="text-green-600 font-bold text-lg">
                        R$ {discountedPrice(product.price, product.discount).toFixed(2)}
                      </div>
                    </>
                  )}
                  {product.discount === 0 && (
                    <div className="font-bold text-lg">R$ {product.price.toFixed(2)}</div>
                  )}
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
