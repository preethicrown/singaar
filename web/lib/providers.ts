// Sample providers, copied from the static prototype (assets/js/app.js).
// Every price here is SAMPLE data, not confirmed by the provider.
export type Look = 'bridal' | 'reception' | 'engagement' | 'saree' | 'hair' | 'mehendi' | 'party';
export type City = 'Bangalore' | 'Chennai';

export interface Provider {
  id: number;
  name: string;
  type: 'artist' | 'salon' | 'studio';
  city: City;
  area: string;
  styles: string[];
  bio: string;
  prices: Partial<Record<Look, number>>;
  booked: string[]; // dates (YYYY-MM-DD) already taken
  verified: boolean; // true only once the provider confirms her own prices
}

export const LOOKS: Look[] = ['bridal', 'reception', 'engagement', 'saree', 'hair', 'mehendi', 'party'];
export const CITIES: City[] = ['Bangalore', 'Chennai'];

const p = (
  id: number, name: string, type: Provider['type'], city: City, area: string,
  styles: string[], bio: string, prices: Provider['prices'], booked: string[] = [],
): Provider => ({ id, name, type, city, area, styles, bio, prices, booked, verified: false });

export const PROVIDERS: Provider[] = [
  p(1, 'Anita R', 'artist', 'Chennai', 'Adyar', ['soft glam', 'traditional'], 'Soft glam and traditional South Indian looks, with trials before the big day.', { bridal: 18000, reception: 12000, engagement: 9000, saree: 1500, hair: 3000, party: 4500 }, ['2026-12-13', '2027-01-24']),
  p(2, "Meena's Bridal Parlour", 'salon', 'Chennai', 'T. Nagar', ['traditional', 'minimal'], 'Family-run parlour with fifteen years of bridal work. Bridal packages include saree draping and hair.', { bridal: 22000, reception: 14000, saree: 1200, hair: 2500, mehendi: 2500 }, ['2026-12-12']),
  p(3, 'Kavya N', 'artist', 'Bangalore', 'Indiranagar', ['airbrush', 'soft glam'], 'Airbrush and soft glam for modern brides and party looks.', { bridal: 28000, reception: 18000, engagement: 12000, saree: 2000, hair: 4000, party: 6000 }, ['2026-12-06']),
  p(4, 'Divya & Co. Studio', 'studio', 'Chennai', 'Nungambakkam', ['HD', 'airbrush'], 'Established studio with a team for large wedding parties.', { bridal: 38000, reception: 25000, engagement: 16000, saree: 2500, hair: 5000, party: 9000 }, ['2026-12-20']),
  p(5, 'Priya M', 'artist', 'Chennai', 'Anna Nagar', ['traditional', 'minimal'], 'Clean, natural looks that last through long ceremonies.', { bridal: 14000, reception: 9000, engagement: 7000, saree: 1000, hair: 2000, party: 3000 }),
  p(6, 'Lakshmi Beauty Care', 'salon', 'Bangalore', 'Jayanagar', ['traditional'], 'Bridal, pre-bridal, skin and mehendi under one roof.', { bridal: 20000, reception: 13000, saree: 1500, hair: 2800, mehendi: 2000 }, ['2026-12-13']),
  p(7, 'Sowmya K', 'artist', 'Bangalore', 'Koramangala', ['HD', 'soft glam'], 'HD finish for photos and video, with a trial look included.', { bridal: 24000, reception: 15000, engagement: 10000, saree: 1800, hair: 3500, party: 5000 }, ['2026-12-27']),
  p(8, 'Nandini V', 'artist', 'Chennai', 'Velachery', ['soft glam', 'minimal'], 'Weekend artist who styles brides and party looks on Saturdays and Sundays.', { bridal: 12000, reception: 8000, engagement: 6000, saree: 900, hair: 1800, party: 2500 }, ['2026-12-06']),
  p(9, 'Roja Beauty Lounge', 'salon', 'Bangalore', 'Malleshwaram', ['traditional', 'minimal'], 'Neighbourhood salon for bridal packages, skin and hair for the whole family.', { bridal: 16000, reception: 10000, saree: 1200, hair: 2200 }),
  p(10, 'Harini S', 'artist', 'Chennai', 'Mylapore', ['traditional', 'airbrush'], 'Traditional Tamil bridal looks with airbrush finish.', { bridal: 30000, reception: 20000, engagement: 13000, saree: 2200, hair: 4500 }, ['2026-12-12', '2026-12-20']),
  p(11, 'Ishita B', 'artist', 'Bangalore', 'Whitefield', ['HD', 'soft glam', 'minimal'], 'Party and bridal looks for the Whitefield crowd. Evening and weekend slots.', { bridal: 21000, reception: 14000, engagement: 9500, saree: 1600, hair: 3200, party: 4000 }, ['2026-12-06']),
  p(12, 'Shruthi G', 'artist', 'Bangalore', 'HSR Layout', ['traditional', 'soft glam'], 'Traditional Karnataka and South Indian bridal looks, with mehendi.', { bridal: 17000, reception: 11000, engagement: 8000, saree: 1400, hair: 2600, party: 3500, mehendi: 3000 }),
  p(13, 'Fatima Q', 'artist', 'Bangalore', 'Frazer Town', ['traditional', 'minimal'], 'Nikah, walima and festive looks, with mehendi and bridesmaid styling.', { bridal: 19000, reception: 12500, engagement: 8500, hair: 2800, mehendi: 3500, party: 3800 }, ['2026-12-13']),
  p(14, 'Glow & Grace Salon', 'salon', 'Bangalore', 'BTM Layout', ['minimal', 'soft glam'], 'Skin, hair and nails in one visit, with party makeup on weekends.', { party: 3200, hair: 1800 }),
  p(15, 'Aarohi Nails & Beauty', 'salon', 'Bangalore', 'Koramangala', ['nail art', 'minimal'], 'Nail art, glow facials and blow-dries for a quick get-ready.', { party: 3600 }),
  p(16, 'Rashmi P', 'artist', 'Bangalore', 'Basavanagudi', ['traditional'], 'Hair is her craft: styling, spa and blow-dries, plus accessory styling.', { hair: 2400, saree: 1100, party: 2800, mehendi: 2200 }, ['2026-12-20']),
];

export const getProvider = (id: number) => PROVIDERS.find((x) => x.id === id);
