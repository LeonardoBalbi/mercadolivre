'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Order {
  id: number
  customer_id: number
  status_id: number
  total_price: number
  created_at: string
  status?: { name: string }
  customer?: { name: string; email: string }
}

export default function Pedidos() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Carregando pedidos...</div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Meus Pedidos</h1>
        <p className="text-gray-600 mb-6">Você ainda não realizou nenhum pedido.</p>
        <Link href="/produtos" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Fazer Compras
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-center px-4 py-3">Total</th>
              <th className="text-left px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{order.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{order.customer?.email || 'N/A'}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    {order.status?.name || 'Pendente'}
                  </span>
                </td>
                <td className="text-center px-4 py-3 font-bold">
                  R$ {Number(order.total_price).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/produtos" className="text-blue-600 hover:underline">
          ← Continuar Comprando
        </Link>
      </div>
    </div>
  )
}
