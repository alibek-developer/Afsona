'use client'

import { Button } from '@/components/ui/button'
import { MAX_DELIVERY_RADIUS_KM } from '@/lib/constants'
import { calculateDistance } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface LocationPickerProps {
	onLocationSelect: (address: string, distance: number, tooFar: boolean) => void
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
	const [isLocating, setIsLocating] = useState(false)
	const [mounted, setMounted] = useState(false)
	const [distanceInfo, setDistanceInfo] = useState<{
		dist: number
		text: string
		tooFar: boolean
		lat: number
		lng: number
	} | null>(null)

	useEffect(() => {
		setMounted(true)
	}, [])

	const handleCurrentLocation = async () => {
		setDistanceInfo(null)
		setIsLocating(true)

		try {
			const gpsPosition = await new Promise<GeolocationPosition>(
				(resolve, reject) => {
					if (!navigator.geolocation) {
						reject(new Error("Geolocation qo'llab-quvvatlanmaydi"))
						return
					}
					navigator.geolocation.getCurrentPosition(resolve, reject, {
						enableHighAccuracy: true,
						maximumAge: 0,
					})
				},
			)

			const gpsLat = gpsPosition.coords.latitude
			const gpsLng = gpsPosition.coords.longitude
			const gpsDist = calculateDistance(gpsLat, gpsLng)

			if (gpsDist > 10) {
				try {
					const response = await fetch('http://ip-api.com/json/')
					const data = await response.json()

					if (data.status === 'success') {
						const { lat, lon, city } = data
						const ipDist = calculateDistance(lat, lon)

						const dist = ipDist
						const tooFar = dist > MAX_DELIVERY_RADIUS_KM
						const distanceText =
							dist < 1
								? `${(dist * 1000).toFixed(0)} m`
								: `${dist.toFixed(1)} km`
						const address = `Aniqlangan shahar: ${city} (IP orqali tekshirildi)`

						setDistanceInfo({ dist, text: distanceText, tooFar, lat, lng: lon })
						onLocationSelect(address, dist, tooFar)

						if (tooFar) {
							toast.warning(
								`Masofa uzoq (${distanceText}). Yetkazib berish narxi kelishiladi.`,
								{
									style: {
										background: '#F59E0B',
										color: '#fff',
										border: '2px solid black',
									},
								},
							)
						} else {
							toast.success('Yetkazib berish hududi aniqlandi!', {
								style: {
									background: '#DC2626',
									color: '#fff',
									border: '2px solid black',
								},
							})
						}
					} else {
						throw new Error('IP aniqlashda xatolik')
					}
				} catch (ipError) {
					const dist = gpsDist
					const tooFar = dist > MAX_DELIVERY_RADIUS_KM
					const distanceText =
						dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`
					const address = `GPS orqali aniqlangan joylashuv`

					setDistanceInfo({
						dist,
						text: distanceText,
						tooFar,
						lat: gpsLat,
						lng: gpsLng,
					})
					onLocationSelect(address, dist, tooFar)

					if (tooFar) {
						toast.warning(
							`Masofa uzoq (${distanceText}). Yetkazib berish narxi kelishiladi.`,
							{
								style: {
									background: '#F59E0B',
									color: '#fff',
									border: '2px solid black',
								},
							},
						)
					} else {
						toast.success('Yetkazib berish hududi aniqlandi!', {
							style: {
								background: '#DC2626',
								color: '#fff',
								border: '2px solid black',
							},
						})
					}
				}
			} else {
				const dist = gpsDist
				const tooFar = dist > MAX_DELIVERY_RADIUS_KM
				const distanceText =
					dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`
				const address = `GPS orqali aniqlangan joylashuv`

				setDistanceInfo({
					dist,
					text: distanceText,
					tooFar,
					lat: gpsLat,
					lng: gpsLng,
				})
				onLocationSelect(address, dist, tooFar)

				if (tooFar) {
					toast.warning(
						`Masofa uzoq (${distanceText}). Yetkazib berish narxi kelishiladi.`,
						{
							style: {
								background: '#F59E0B',
								color: '#fff',
								border: '2px solid black',
							},
						},
					)
				} else {
					toast.success('Yetkazib berish hududi aniqlandi!', {
						style: {
							background: '#DC2626',
							color: '#fff',
							border: '2px solid black',
						},
					})
				}
			}
		} catch (error) {
			toast.error("Joylashuvni aniqlab bo'lmadi. Iltimos, qayta urining.")
		} finally {
			setIsLocating(false)
		}
	}

	const openInGoogleMaps = (lat: number, lng: number) => {
		window.open(
			`https://www.google.com/search?q=https://www.google.com/maps%3Fq%3D${lat},${lng}`,
			'_blank',
		)
	}

	if (!mounted) return null

	return (
		<div className='space-y-4 max-w-xl mx-auto'>
			<Button
				type='button'
				onClick={handleCurrentLocation}
				disabled={isLocating}
				className='w-full h-16 text-lg font-black bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-50 hover:text-red-600 hover:border-red-600 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all uppercase tracking-wide rounded-2xl disabled:opacity-50'
			>
				{isLocating ? (
					<Loader2 className='animate-spin mr-2 h-6 w-6' />
				) : (
					<Navigation className='mr-2 h-6 w-6' />
				)}
				{distanceInfo ? 'Qayta aniqlash' : 'Mening joylashuvim'}
			</Button>

			<AnimatePresence>
				{distanceInfo && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.3 }}
						onClick={() => openInGoogleMaps(distanceInfo.lat, distanceInfo.lng)}
						className={`p-6 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
							distanceInfo.tooFar
								? 'bg-amber-50 hover:bg-amber-100'
								: 'bg-white hover:bg-slate-50'
						}`}
					>
						<div className='flex items-center gap-4'>
							{distanceInfo.tooFar ? (
								<AlertCircle className='text-amber-600 w-12 h-12 flex-shrink-0' />
							) : (
								<CheckCircle2 className='text-red-600 w-12 h-12 flex-shrink-0' />
							)}
							<div className='flex-1'>
								<p className='text-xl font-black text-black uppercase tracking-tight'>
									Masofa:{' '}
									<span
										className={
											distanceInfo.tooFar
												? 'text-amber-600'
												: 'text-red-600 drop-shadow-[0_0_6px_rgba(255,0,0,0.3)]'
										}
									>
										{distanceInfo.text}
									</span>
								</p>
								<p
									className={`text-sm font-bold mt-2 ${
										distanceInfo.tooFar ? 'text-amber-600' : 'text-gray-600'
									}`}
								>
									{distanceInfo.tooFar
										? `⚠️ Masofa uzoq (${distanceInfo.text}). Yetkazib berish narxi kelishiladi.`
										: '✓ YETKAZIB BERISH MUMKIN'}
								</p>
								<p className='text-xs text-gray-500 mt-2 font-bold uppercase tracking-wide'>
									📍 Xaritada ko'rish
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}
