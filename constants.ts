export interface WallpaperType {
  id: string;
  name: string;
  url: string;
  textColor: 'light' | 'dark';
  overlayOpacity: number;
  accentColor: string;
}

export const WALLPAPERS: WallpaperType[] = [
  {
    id: 'nordic-mist',
    name: 'Nordic Mist',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2670',
    textColor: 'light',
    overlayOpacity: 0.1,
    accentColor: '#6366F1'
  },
  {
    id: 'solaris',
    name: 'Solaris Peak',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2670',
    textColor: 'light',
    overlayOpacity: 0.15,
    accentColor: '#F59E0B'
  },
  {
    id: 'midnight-glacier',
    name: 'Midnight Glacier',
    url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&q=80&w=2670',
    textColor: 'light',
    overlayOpacity: 0.2,
    accentColor: '#818CF8'
  },
  {
    id: 'emerald-valley',
    name: 'Emerald Valley',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2670',
    textColor: 'light',
    overlayOpacity: 0.1,
    accentColor: '#10B981'
  },
  {
    id: 'prism-minimal',
    name: 'Prism Canvas',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2670',
    textColor: 'dark',
    overlayOpacity: 0.05,
    accentColor: '#6366F1'
  },
  {
    id: 'abstract-flow',
    name: 'Abstract Flow',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2670',
    textColor: 'light',
    overlayOpacity: 0.25,
    accentColor: '#6366F1'
  }
];
