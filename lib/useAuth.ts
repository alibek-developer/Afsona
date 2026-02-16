'use client'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

type Role = 'admin' | 'operator' | 'kitchen' | 'unknown'

type AuthState = {
	loading: boolean
	email: string | null
	role: Role
}

function resolveRole(email: string | null): Role {
	const normalized = email?.toLowerCase().trim() ?? null
	if (normalized === 'a1ibekdew0@gmail.com') return 'admin'
	if (normalized === 'inoqdost478@gmail.com') return 'operator'
	if (normalized === 'trajabboyev@gmail.com') return 'kitchen'
	return 'unknown'
}

export function useAuth() {
	const [state, setState] = useState<AuthState>({
		loading: true,
		email: null,
		role: 'unknown',
	})

	useEffect(() => {
		let mounted = true

		async function load() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser()

				if (!mounted) return
				const email = user?.email?.toLowerCase().trim() ?? null
				setState({ loading: false, email, role: resolveRole(email) })
			} catch {
				if (!mounted) return
				setState({ loading: false, email: null, role: 'unknown' })
			}
		}

		load()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(() => {
			load()
		})

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [])

	return state
}

export function useAuthGuard({
	allowRoles,
	redirectTo = '/login',
}: {
	allowRoles: Role[]
	redirectTo?: string
}) {
	const { loading, email, role } = useAuth()
	const authorized = useMemo(() => {
		if (loading) return false
		if (!email) return false
		return allowRoles.includes(role)
	}, [allowRoles, email, loading, role])

	useEffect(() => {
		if (loading) return
		if (!authorized) {
			supabase.auth.signOut().catch(() => {})
			window.location.href = redirectTo
		}
	}, [authorized, loading, redirectTo])

	return { loading, email, role, authorized }
}
