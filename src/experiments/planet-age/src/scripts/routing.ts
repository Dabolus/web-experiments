import { installRouter } from 'pwa-helpers';
import { isDate, isPlanet } from './validators';

type LocationUpdatedCallback = (date?: Date, planet?: string) => void;

const listeners: LocationUpdatedCallback[] = [];

export interface RoutingData {
  readonly date?: Date;
  readonly planet?: string;
  readonly path: string;
}

export const getRoutingData = (
  { href }: Location = window.location,
): RoutingData => {
  const pathname = href.replace(document.baseURI, '');

  const [pathDate, pathPlanet] = pathname.split('/');

  const cachedDate = localStorage.getItem('date');

  const date = isDate(pathDate)
    ? pathDate
    : !pathDate && isDate(cachedDate)
    ? cachedDate
    : undefined;

  const planet = isPlanet(pathPlanet) ? pathPlanet : undefined;

  const path = [
    ...(date ? [date] : []),
    ...(date && planet ? [planet] : []),
  ].join('/');

  return {
    path,
    date: date ? new Date(date) : undefined,
    planet,
  };
};

export const setupRouter = (
  locationUpdatedCallback: LocationUpdatedCallback,
) => {
  installRouter(location => {
    const { path: newPath, date, planet } = getRoutingData(location);

    if (newPath !== location.pathname) {
      history.replaceState({}, '', newPath);
    }

    locationUpdatedCallback(date, planet);
  });

  listeners.push(locationUpdatedCallback);
};

export const computeUrl = (date?: Date, planet?: string) => {
  const formattedDate = date?.toISOString().slice(0, 10);

  return formattedDate ? `${formattedDate}${planet ? `/${planet}` : ''}` : '';
};

export const navigate = (date?: Date, planet?: string) => {
  if (date) {
    localStorage.setItem('date', date.toISOString().slice(0, 10));
  }

  window.history.pushState({}, '', computeUrl(date, planet));

  listeners.forEach(callback => callback(date, planet));
};
