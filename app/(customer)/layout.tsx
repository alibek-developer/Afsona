import { Footer } from '@/components/customer/footer'
import { Header } from '@/components/customer/header'
import type React from 'react'

export default function CustomerLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className='min-h-screen flex flex-col'>
			<Header />
			<main className='flex-1 max-w-screen-2xl mx-auto px-6 lg:px-10 w-full'>
				{children}
			</main>
			<Footer />
		</div>
	)
}
