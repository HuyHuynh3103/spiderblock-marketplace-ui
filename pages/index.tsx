import { Inter } from 'next/font/google'
import InvestView from '@/src/views/invests'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
	<InvestView />
  )
}
