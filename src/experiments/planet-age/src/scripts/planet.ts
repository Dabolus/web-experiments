import { Planet } from '../data/planets.yml';

export interface PlanetConfiguration extends Planet {
  readonly earthRevolutionTime: number;
}

const dateFormat = new Intl.DateTimeFormat();

export interface PlanetInstance extends Planet {
  readonly ref: HTMLElement;
  readonly computeAge: (birthday: Date) => void;
}

export const configurePlanet = ({
  id,
  revolutionTime,
  earthRevolutionTime,
  ...rest
}: PlanetConfiguration): PlanetInstance => {
  const ref = document.querySelector<HTMLElement>(`#${id}`)!;
  const ageElement = document.querySelector<HTMLElement>(`#${id}-age`)!;
  const nextBirthdayElement = document.querySelector<HTMLElement>(
    `#${id}-birthday`,
  )!;

  return {
    id,
    revolutionTime,
    ref,
    ...rest,
    computeAge(birthday: Date) {
      const today = new Date();
      const now = today.valueOf();
      const earthAge = (now - birthday.getTime()) / 86400000; // Number of milliseconds in a day

      const floatYears = earthAge / revolutionTime;
      const intYears = Math.floor(floatYears);
      const days = Math.floor((floatYears - intYears) * revolutionTime);

      const yearsString =
        intYears > 0 ? `${intYears} year${intYears === 1 ? '' : 's'}` : '';
      const daysString = days > 0 ? `${days} day${days === 1 ? '' : 's'}` : '';
      const finalString = `≈ ${yearsString}${
        yearsString && daysString ? ' and' : ''
      } ${daysString}`;

      ageElement.innerText = finalString;

      if (id === 'earth') {
        const nextBirthday = new Date(birthday);

        const currentMonth = today.getMonth();
        const birthdayMonth = birthday.getMonth();

        nextBirthday.setFullYear(
          today.getFullYear() +
            (currentMonth > birthdayMonth ||
            (currentMonth === birthdayMonth &&
              today.getDate() >= birthday.getDate())
              ? 1
              : 0),
        );

        nextBirthdayElement.innerText = `on ${dateFormat.format(nextBirthday)}`;

        return;
      }

      const nextBirthdayMilliseconds =
        now +
        revolutionTime *
          (1 -
            (earthAge / revolutionTime > 1
              ? earthAge / revolutionTime -
                Math.floor(earthAge / revolutionTime)
              : earthAge / revolutionTime)) *
          86400000;

      const nextBirthday = new Date(nextBirthdayMilliseconds);

      // If the date is too large
      if (isNaN(nextBirthday.valueOf())) {
        const nextBirthdayYears = Math.floor(
          nextBirthdayMilliseconds / 86400000 / earthRevolutionTime,
        );

        nextBirthdayElement.innerText = `≈ ${nextBirthdayYears} years from now`;

        return;
      }

      const formattedDate = dateFormat.format(nextBirthday);

      nextBirthdayElement.innerText = `on ${formattedDate}`;
    },
  };
};
