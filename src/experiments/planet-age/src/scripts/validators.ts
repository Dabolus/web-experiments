import planets from '../data/planets.yml';

export const isDate = (date?: unknown): date is string => {
  if (!date || typeof date !== 'string') {
    return false;
  }
  const match = date.match(/^([1-9]\d{3})-(\d{1,2})-(\d{1,2})$/);

  if (!match) {
    return false;
  }

  const [, yearString, monthString, dayString] = match;

  const year = parseInt(yearString, 10);
  const month = parseInt(monthString, 10);
  const day = parseInt(dayString, 10);

  return (
    year > 1900 &&
    month > 0 &&
    month <= 12 &&
    day > 0 &&
    day <=
      [
        31,
        (!(year % 4) && year % 100) || !(year % 400) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
      ][month - 1] &&
    new Date(year, month - 1, day) < new Date()
  );
};

export const isPlanet = (planet?: unknown): planet is string => {
  if (!planet || typeof planet !== 'string') {
    return false;
  }

  return planets.some(({ id }) => id === planet);
};
