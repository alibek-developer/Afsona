import { ToastContainer } from '@/components/toast/toast-container'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import type React from 'react'
import './globals.css'

export const metadata: Metadata = {
	title: 'Afsona | Milliy taomlar',
	description:
		"Eng mazali o'zbek taomlari - Palov, Lag'mon, Manti va boshqalar.",
	icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
}

// Fontlarni preload qilish - Next.js tomonidan boshqariladi

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='uz' suppressHydrationWarning>
			<body className='antialiased font-sans min-h-screen text-foreground'>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
					{children}
					<ToastContainer />
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	)
}
