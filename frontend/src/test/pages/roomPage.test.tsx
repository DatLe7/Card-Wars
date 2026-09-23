import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router'

import RoomPage from '../../pages/room';

describe('Room Page', () => {
	it('renders code', () => {
		render(
			<MemoryRouter initialEntries={['/room/123']}>
				<Routes>
					<Route path="/room/:id" element={<RoomPage />} />
				</Routes>
			</MemoryRouter>
		)

		expect(screen.getByText('Room: 123')).toBeInTheDocument()
	})
})
