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
					<Toaster
						richColors
						closeButton
						position='bottom-right'
						toastOptions={{
							style: {
								background: 'rgba(255, 255, 255, 0.4)', // Shaffof oq fon
								backdropFilter: 'blur(12px)', // Orqa fonni xiralashtirish (Glass)
								WebkitBackdropFilter: 'blur(12px)',
								border: '1px solid rgba(255, 255, 255, 0.2)', // Nozik chegara
								boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)', // Yumshoq soya
								borderRadius: '20px', // Dumaloq dizayn
								color: '#000', // Matn rangi
							},
							className: 'glass-toast-animation', // Maxsus animatsiya klassi
						}}
					/>
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	)
}
