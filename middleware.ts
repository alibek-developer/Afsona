import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname

	const isProtected =
		path.startsWith('/admin') || path.startsWith('/call-center')

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (isProtected && (!supabaseUrl || !supabaseAnonKey)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	})

	let supabase: any = null
	let user: any = null
	let email: string | undefined
	try {
		supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value)
					)
					response = NextResponse.next({
						request,
					})
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options)
					)
				},
			},
		})

		const {
			data: { user: nextUser },
		} = await supabase.auth.getUser()

		user = nextUser
		email = user?.email?.toLowerCase().trim()
	} catch {
		if (isProtected) {
			return NextResponse.redirect(new URL('/login', request.url))
		}
	}

	// 1. HIMOYALANGAN YO'LLAR: /admin va /call-center
	if (isProtected) {
		// Agar foydalanuvchi tizimga kirmagan bo'lsa
		if (!user) {
			const loginUrl = new URL('/login', request.url)
			return NextResponse.redirect(loginUrl)
		}

		// Admin yo'nalishlari - faqat admin uchun
		if (path.startsWith('/admin')) {
			if (email !== 'a1ibekdew0@gmail.com') {
				// Agar operator bo'lsa, uni call-center ga yo'naltir
				if (email === 'inoqdost478@gmail.com') {
					return NextResponse.redirect(new URL('/call-center', request.url))
				}
				// Boshqa foydalanuvchilar uchun login
				return NextResponse.redirect(new URL('/login', request.url))
			}
		}

		// Call-center yo'nalishlari - admin va operator uchun
		if (path.startsWith('/call-center')) {
			if (
				email !== 'inoqdost478@gmail.com' &&
				email !== 'a1ibekdew0@gmail.com'
			) {
				return NextResponse.redirect(new URL('/login', request.url))
			}
		}
	}

	// 2. LOGIN SAHIFASI: Tizimga kirganlarni tegishli panelga yo'naltirish
	if (path === '/login') {
		if (user && email) {
			// Admin uchun
			if (email === 'a1ibekdew0@gmail.com') {
				return NextResponse.redirect(new URL('/admin/buyurtmalar', request.url))
			}
			// Operator uchun
			if (email === 'inoqdost478@gmail.com') {
				return NextResponse.redirect(new URL('/call-center', request.url))
			}
			// Noma'lum foydalanuvchi - sessiyani tozalash
			if (supabase) {
				await supabase.auth.signOut()
			}
		}
	}

	// 3. ILDIZ SAHIFA (/) - Hamma uchun ochiq, hech qanday redirect yo'q

	return response
}

export const config = {
	matcher: [
		/*
		 * Quyidagilardan tashqari barcha yo'llarni tekshirish:
		 * - _next/static (statik fayllar)
		 * - _next/image (rasmlarni optimallashtirish)
		 * - favicon.ico
		 * - Rasmlar (svg, png, jpg, jpeg, gif, webp)
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
