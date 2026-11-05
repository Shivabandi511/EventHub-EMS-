import eventTech from './event-tech.svg';
import eventMusic from './event-music.svg';
import eventBusiness from './event-business.svg';
import eventSports from './event-sports.svg';
import eventArt from './event-art.svg';
import eventDefault from './event-default.svg';

export const localImages = {
  tech: eventTech,
  music: eventMusic,
  business: eventBusiness,
  sports: eventSports,
  art: eventArt,
  default: eventDefault,
};

export function getCategoryFallback(categoryName?: string): string {
  const cat = categoryName?.toLowerCase() ?? '';
  if (cat.includes('tech')) return localImages.tech;
  if (cat.includes('music')) return localImages.music;
  if (cat.includes('bus') || cat.includes('start')) return localImages.business;
  if (cat.includes('sport') || cat.includes('fit')) return localImages.sports;
  if (cat.includes('art') || cat.includes('cult')) return localImages.art;
  return localImages.default;
}

export function getEventImage(imageUrl?: string, categoryName?: string): string {
  if (imageUrl && imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
    return imageUrl;
  }
  return getCategoryFallback(categoryName);
}
