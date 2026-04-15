import React from 'react'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

interface QuickActionIconProps {
	size?: number
}

export function VolunteerQuickActionIcon({
	size = 24,
}: QuickActionIconProps) {
	return (
		<Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
			<Circle cx='12' cy='12' r='11' fill='#E8FFF2' />
			<Circle cx='9' cy='9' r='2.2' fill='#14B8A6' />
			<Circle cx='15' cy='9' r='2.2' fill='#22C55E' />
			<Path
				d='M5.8 16.8C6.8 14.7 8.4 13.6 10.4 13.6C12.3 13.6 13.7 14.7 14.7 16.8'
				stroke='#0F766E'
				strokeWidth='1.7'
				strokeLinecap='round'
			/>
			<Path
				d='M13.6 16.8C14.3 15.3 15.5 14.5 17 14.5C18.3 14.5 19.4 15.2 20.2 16.5'
				stroke='#15803D'
				strokeWidth='1.6'
				strokeLinecap='round'
			/>
		</Svg>
	)
}

export function TrackingQuickActionIcon({
	size = 24,
}: QuickActionIconProps) {
	return (
		<Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
			<Circle cx='12' cy='12' r='11' fill='#EAF4FF' />
			<Rect x='5' y='5.5' width='14' height='4' rx='1.2' fill='#60A5FA' />
			<Rect x='6.3' y='11' width='11.4' height='1.6' rx='0.8' fill='#93C5FD' />
			<Rect x='6.3' y='13.6' width='8.7' height='1.6' rx='0.8' fill='#93C5FD' />
			<Path
				d='M16.2 16.1L13.6 18.7L12.2 17.3'
				stroke='#2563EB'
				strokeWidth='1.8'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</Svg>
	)
}

export function DonateQuickActionIcon({
	size = 24,
}: QuickActionIconProps) {
	return (
		<Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
			<Circle cx='12' cy='12' r='11' fill='#F4E8FF' />
			<Path
				d='M12 18.2C11.9 18.2 11.7 18.1 11.6 18C9.4 16.4 7 14.6 7 11.8C7 10 8.5 8.6 10.2 8.6C11 8.6 11.8 8.9 12.3 9.5C12.8 8.9 13.6 8.6 14.4 8.6C16.2 8.6 17.6 10 17.6 11.8C17.6 14.6 15.2 16.4 13 18C12.8 18.1 12.6 18.2 12.5 18.2H12Z'
				fill='#EF4444'
			/>
			<Circle cx='8.2' cy='9' r='2.1' fill='#F59E0B' />
			<Path
				d='M8.2 7.8V10.2M7.2 9H9.2'
				stroke='#FFFFFF'
				strokeWidth='1.2'
				strokeLinecap='round'
			/>
		</Svg>
	)
}
