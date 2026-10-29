import eventTech from './event-tech.svg';
import eventMusic from './event-music.svg';
import eventBusiness from './event-business.svg';
import eventDefault from './event-default.svg';

export const localImages = {
  tech: eventTech,
  music: eventMusic,
  business: eventBusiness,
  default: eventDefault,
};

export function getEventImage(imageUrl?: string, categoryName?: string): string {
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  const cat = categoryName?.toLowerCase() ?? '';
  if (cat.includes('tech')) return localImages.tech;
  if (cat.includes('music')) return localImages.music;
  if (cat.includes('bus') || cat.includes('start')) return localImages.business;
  return localImages.default;
}
