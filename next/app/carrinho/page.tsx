'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface CartItem {
  id: number
  product_id: number
  title: string
  price: number
  image: string
  quantity: number
}

export default function Carrinho() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  const removeItem = (productId: number) => {
    const updated = cartItems.filter((item) => item.product_id !== productId)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    const updated = cartItems.map((item) =>
      item.product_id === productId ? { ...item, quantity } : item
    )
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Carrinho Vazio</h1>
        <p className="text-gray-600 mb-6">Você ainda não adicionou nenhum produto ao carrinho.</p>
        <Link href="/produtos" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Continuar Comprando
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Meu Carrinho</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">Produto</th>
              <th className="text-center px-4 py-3">Preço</th>
              <th className="text-center px-4 py-3">Quantidade</th>
              <th className="text-center px-4 py-3">Subtotal</th>
              <th className="text-center px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.product_id} className="border-t">
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-200 rounded">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center px-4 py-3">R$ {item.price.toFixed(2)}</td>
                <td className="text-center px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product_id, parseInt(e.target.value))
                    }
                    className="w-12 px-2 py-1 border rounded text-center"
                  />
                </td>
                <td className="text-center px-4 py-3 font-bold">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </td>
                <td className="text-center px-4 py-3">
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg">Total:</span>
          <span className="text-3xl font-bold text-green-600">R$ {total.toFixed(2)}</span>
        </div>
        <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg">
          Finalizar Compra
        </button>
      </div>

      <Link href="/produtos" className="text-blue-600 hover:underline">
        ← Continuar Comprando
      </Link>
    </div>
  )
}
