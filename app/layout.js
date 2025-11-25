import './globals.css'

export const metadata = {
  title: 'Simulador Alpargatas',
  description: 'Simulador de Predição de Inutilizados',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
