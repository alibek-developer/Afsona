import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	variable: '--font-mono-next',
	display: 'swap',
})

export const metadata: Metadata = {
	title: "O'zbek Oshxonasi | Milliy taomlar",
	description:
		"Eng mazali o'zbek taomlari - Palov, Lag'mon, Manti va boshqalar. Yetkazib berish xizmati mavjud.",
	generator: 'v0.app',
	icons: {
		icon: [
			{
				url: '/icon-light-32x32.png',
				media: '(prefers-color-scheme: light)',
			},
			{
				url: '/icon-dark-32x32.png',
				media: '(prefers-color-scheme: dark)',
			},
			{
				url: '/icon.svg',
				type: 'image/svg+xml',
			},
		],
		apple: '/apple-icon.png',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='uz'>
			<body className={`${jetbrainsMono.variable} font-sans antialiased`}>
				{children}
				<Toaster position='top-right' />
				<Analytics />
			</body>
		</html>
	)
}
