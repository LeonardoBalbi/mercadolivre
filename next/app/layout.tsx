import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MercadoLivre Clone',
  description: 'E-commerce platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="bg-yellow-400 text-black p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-3xl font-bold">MercadoLivre</h1>
            <nav className="flex gap-6">
              <a href="/" className="hover:underline">Início</a>
              <a href="/produtos" className="hover:underline">Produtos</a>
              <a href="/carrinho" className="hover:underline">Carrinho</a>
              <a href="/pedidos" className="hover:underline">Meus Pedidos</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-8 px-4">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-12">
          <div className="max-w-7xl mx-auto text-center">
            <p>&copy; 2024 MercadoLivre. Todos os direitos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
