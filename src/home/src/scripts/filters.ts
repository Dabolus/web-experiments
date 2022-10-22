import type Fuse from 'fuse.js';
import { ProjectType } from '@dabolus/portfolio-data';

const projectTypeToNameMap: Record<ProjectType, string> = {
  [ProjectType.BOT_TELEGRAM]: 'Telegram Bot',
  [ProjectType.BOT_DISCORD]: 'Discord Bot',
  [ProjectType.BOT_SLACK]: 'Slack Bot',
  [ProjectType.APP_WEB]: 'Web App',
  [ProjectType.APP_CROSS_PLATFORM]: 'Cross Platform App',
  [ProjectType.APP_WINDOWS]: 'Windows App',
  [ProjectType.APP_MACOS]: 'macOS App',
  [ProjectType.APP_LINUX]: 'GNU/Linux App',
  [ProjectType.APP_ANDROID]: 'Android App',
  [ProjectType.APP_IOS]: 'iOS App',
};

const currentUrl = new URL(window.location.href);

const updateSearchParam = (key: string, value?: string | null) => {
  if (!value) {
    currentUrl.searchParams.delete(key);
  } else {
    currentUrl.searchParams.set(key, value);
  }
  window.history.replaceState({}, '', currentUrl.href);
};

const projectsElements =
  document.querySelectorAll<HTMLLIElement>('#projects > li');

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  languages: string[];
  frameworks: string[];
  apis: string[];
  element: HTMLElement;
}

const hydrateProjectFromDomElement = (element: HTMLElement): Project => {
  const id = element.id.slice(8);
  const name = element.querySelector('h2')!.textContent!;
  const type = element.dataset.type! as ProjectType;
  const description = element.querySelector('p')!.textContent!;
  const chips = element.querySelector('.chips')!;
  const languages = Array.from(chips.querySelectorAll('.chip-language')).map(
    language => language.textContent!,
  );
  const frameworks = Array.from(chips.querySelectorAll('.chip-framework')).map(
    framework => framework.textContent!,
  );
  const apis = Array.from(chips.querySelectorAll('.chip-api')).map(
    api => api.textContent!,
  );

  return {
    id,
    name,
    type,
    description,
    languages,
    frameworks,
    apis,
    element,
  };
};

const projects: Project[] = Array.from(projectsElements).map(
  hydrateProjectFromDomElement,
);

let fuse: Fuse<Project>;

let currentSearch = currentUrl.searchParams.get('search') || '';

const updateProjectsView = () => {
  const currentSearchProjectsKeyVal = Object.fromEntries(
    fuse && currentSearch
      ? fuse.search(currentSearch).map(result => [result.item.id, result.item])
      : projects.map(project => [project.id, project]),
  );

  projects.forEach(({ id, type, languages, frameworks, apis, element }) => {
    const hasSearchMatch = Boolean(currentSearchProjectsKeyVal[id]);
    const hasType =
      Object.keys(selectedTypes).length < 1 ||
      selectedTypes[projectTypeToNameMap[type]];
    const hasLanguage =
      Object.keys(selectedLanguages).length < 1 ||
      languages.some(language => selectedLanguages[language]);
    const hasFramework =
      Object.keys(selectedFrameworks).length < 1 ||
      frameworks.some(framework => selectedFrameworks[framework]);
    const hasApi =
      Object.keys(selectedApis).length < 1 ||
      apis.some(api => selectedApis[api]);

    element.hidden =
      !hasSearchMatch || !hasType || !hasLanguage || !hasFramework || !hasApi;
  });
};

const toggleChip = (chip: HTMLUListElement, checked: boolean) => {
  if (checked) {
    chip.classList.add('checked');
  } else {
    chip.classList.remove('checked');
  }
};

const parseSelectionMapFromUrl = (key: string) =>
  Object.fromEntries(
    (currentUrl.searchParams.get(key) || '')
      .split(',')
      .filter(Boolean)
      .map(val => [val, true]),
  );

const selectedTypes: Record<string, boolean> =
  parseSelectionMapFromUrl('types');
const selectedLanguages: Record<string, boolean> =
  parseSelectionMapFromUrl('languages');
const selectedFrameworks: Record<string, boolean> =
  parseSelectionMapFromUrl('frameworks');
const selectedApis: Record<string, boolean> = parseSelectionMapFromUrl('apis');

const setupToggleQueryParamFunction =
  (queryParam: string, map: Record<string, boolean>) => (key: string) => {
    if (map[key]) {
      delete map[key];
    } else {
      map[key] = true;
    }
    requestAnimationFrame(() => {
      updateProjectsView();
      const selectedKeysArray = Object.keys(map);
      updateSearchParam(
        queryParam,
        selectedKeysArray.length > 0 ? selectedKeysArray.join(',') : '',
      );
    });
  };

const setupCheckboxFilter = (id: string, map: Record<string, boolean>) => {
  const toggleFilter = setupToggleQueryParamFunction(id, map);
  document
    .querySelectorAll<HTMLUListElement>(`#${id} > li`)
    .forEach(element => {
      const checkbox = element.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )!;
      const key =
        element.querySelector<HTMLLabelElement>('label')!.textContent!;

      toggleChip(element, map[key]);

      element.addEventListener('click', () => {
        toggleFilter(key);
        checkbox.checked = map[key];
        toggleChip(element, map[key]);
      });
    });
};

export const setupFilters = () => {
  // Setup search bar
  const searchBar = document.querySelector<HTMLInputElement>('#filter-search')!;
  searchBar.value = currentSearch;
  searchBar.addEventListener('input', event => {
    currentSearch = (event.target as HTMLInputElement).value;
    requestAnimationFrame(() => {
      updateProjectsView();
      updateSearchParam('search', currentSearch);
    });
  });
  import('fuse.js').then(({ default: Fuse }) => {
    fuse = new Fuse(projects, {
      keys: ['type', 'name', 'description', 'languages', 'frameworks'],
    });
    updateProjectsView();
    searchBar.disabled = false;
  });

  // Setup project type chips
  setupCheckboxFilter('types', selectedTypes);
  // Setup languages chips
  setupCheckboxFilter('languages', selectedLanguages);
  // Setup frameworks chips
  setupCheckboxFilter('frameworks', selectedFrameworks);
  // Setup APIs chips
  setupCheckboxFilter('apis', selectedApis);
};

updateProjectsView();
