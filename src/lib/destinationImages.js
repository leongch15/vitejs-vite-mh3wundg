const DESTINATION_IMAGES = {
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=600&fit=crop',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=600&fit=crop',

  italie: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&h=600&fit=crop',
  italy: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&h=600&fit=crop',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=600&fit=crop',
  florence: 'https://images.unsplash.com/photo-1543429258-cc72195b8e4b?w=1200&h=600&fit=crop',
  venise: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&h=600&fit=crop',
  venice: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&h=600&fit=crop',

  danemark: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=600&fit=crop',
  denmark: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=600&fit=crop',
  copenhague: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=600&fit=crop',
  copenhagen: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200&h=600&fit=crop',

  espagne: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
  spain: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
  barcelone: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
  barcelona: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
  madrid: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',

  tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop',
  japon: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop',
  japan: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=600&fit=crop',

  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=600&fit=crop',
  londres: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=600&fit=crop',
  new_york: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=600&fit=crop',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=600&fit=crop',

  default: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=600&fit=crop',
};

function normalizeDestination(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '_');
}

export function getDestinationImage(destination) {
  const key = normalizeDestination(destination);

  if (DESTINATION_IMAGES[key]) {
    return DESTINATION_IMAGES[key];
  }

  for (const [destinationKey, imageUrl] of Object.entries(DESTINATION_IMAGES)) {
    if (key.includes(destinationKey) || destinationKey.includes(key)) {
      return imageUrl;
    }
  }

  return DESTINATION_IMAGES.default;
}