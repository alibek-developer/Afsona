import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'

// Eslatma: Shrift xatosi chiqmasligi uchun standart tizim shriftlaridan foydalanamiz.
// Keyinchalik Turbopack-siz rejimda Google Fonts'ni qaytarish mumkin.

export const metadata: Metadata = {
	title: 'Afsona | Milliy taomlar',
	description:
		"Eng mazali o'zbek taomlari - Palov, Lag'mon, Manti va boshqalar. Yetkazib berish xizmati mavjud.",
	icons: {
		icon: '/logo.jpg',
		apple: '/logo.jpg',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='uz' suppressHydrationWarning>
			<body
				className='antialiased'
				style={{
					fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
				}}
			>
				<ThemeProvider
					attribute='class'
					defaultTheme='dark' // Logotipingiz qora fonda bo'lgani uchun 'dark' tavsiya etiladi
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster position='top-right' />
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	)
}
