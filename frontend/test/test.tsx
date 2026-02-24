import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1. POPRAVKA ZA FETCH (Rešava "ReferenceError: fetch is not defined")
// Pravimo lažni fetch koji vraća prazan niz podataka kako test ne bi pukao
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

// 2. POPRAVKA ZA ROUTER
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
}));

// 3. MOCK ZA MAPE
jest.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }: any) => <div>{children}</div>,
  Map: ({ children }: any) => <div data-testid="mapa">{children}</div>,
  AdvancedMarker: () => <div>M</div>,
  Pin: () => <div>P</div>,
}));

import Home from '../app/page';
import Kontakt from '../app/kontakt/page';
import Login from '../app/login/page';
import Profil from '../app/profil/page';
import Potvrda from '../app/potvrda/page';
import DodajPublikaciju from '../app/dodaj-publikaciju/page';
import KreirajSluzbenika from '../app/kreiraj-sluzbenika/page';

describe('Automatizovana provera svih stranica projekta', () => {

  test('1. Početna stranica se uspešno učitava', () => {
    render(<Home />);
    expect(document.body).toBeDefined();
  });

  test('2. Kontakt stranica renderuje mapu', () => {
    render(<Kontakt />);
    expect(screen.getByTestId('mapa')).toBeInTheDocument();
  });

  test('3. Login stranica postoji', () => {
    render(<Login />);
    // Tražimo specifično dugme koje sadrži tekst "Prijavi se" 
    // kako bismo izbegli grešku "multiple elements found"
    expect(screen.getByRole('button', { name: /Prijavi se/i })).toBeInTheDocument();
  });

  test('4. Profil stranica se renderuje', () => {
    render(<Profil />);
    expect(document.body).toBeDefined();
  });

  test('5. Stranica Potvrda je dostupna', () => {
    render(<Potvrda />);
    expect(document.body).toBeDefined();
  });

  test('6. Stranica za dodavanje publikacija radi', () => {
    render(<DodajPublikaciju />);
    expect(document.body).toBeDefined();
  });

  test('7. Stranica za kreiranje službenika radi', () => {
    render(<KreirajSluzbenika />);
    expect(document.body).toBeDefined();
  });
});