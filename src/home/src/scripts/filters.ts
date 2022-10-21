import type Fuse from 'fuse.js';

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
  description: string;
  languages: string[];
  frameworks: string[];
  element: HTMLElement;
}

const hydrateProjectFromDomElement = (element: HTMLElement): Project => {
  const id = element.id.slice(8);
  const name = element.querySelector('h2')!.textContent!;
  const description = element.querySelector('p')!.textContent!;
  const chips = element.querySelector('.chips')!;
  const languages = Array.from(chips.querySelectorAll('.chip-language')).map(
    language => language.textContent!.trim(),
  );
  const frameworks = Array.from(chips.querySelectorAll('.chip-framework')).map(
    framework => framework.textContent!.trim(),
  );
  return {
    id,
    name,
    description,
    languages,
    frameworks,
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

  projects.forEach(({ id, languages, frameworks, element }) => {
    const hasSearchMatch = Boolean(currentSearchProjectsKeyVal[id]);
    const hasLanguage =
      Object.keys(selectedLanguages).length < 1 ||
      languages.some(language => selectedLanguages[language]);
    const hasFramework =
      Object.keys(selectedFrameworks).length < 1 ||
      frameworks.some(framework => selectedFrameworks[framework]);

    element.hidden = !hasSearchMatch || !hasLanguage || !hasFramework;
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

const selectedLanguages: Record<string, boolean> =
  parseSelectionMapFromUrl('languages');
const selectedFrameworks: Record<string, boolean> =
  parseSelectionMapFromUrl('frameworks');

const toggleLanguage = (language: string) => {
  if (selectedLanguages[language]) {
    delete selectedLanguages[language];
  } else {
    selectedLanguages[language] = true;
  }
  requestAnimationFrame(() => {
    updateProjectsView();
    const selectedLanguagesArray = Object.keys(selectedLanguages);
    updateSearchParam(
      'languages',
      selectedLanguagesArray.length > 0 ? selectedLanguagesArray.join(',') : '',
    );
  });
};

const toggleFramework = (framework: string) => {
  if (selectedFrameworks[framework]) {
    delete selectedFrameworks[framework];
  } else {
    selectedFrameworks[framework] = true;
  }
  requestAnimationFrame(() => {
    updateProjectsView();
    const selectedFrameworksArray = Object.keys(selectedFrameworks);
    updateSearchParam(
      'frameworks',
      selectedFrameworksArray.length > 0
        ? selectedFrameworksArray.join(',')
        : '',
    );
  });
};

export const setupFilters = () => {
  // Only show filters if JavaScript is enabled
  document.querySelector<HTMLElement>('#filters')!.hidden = false;

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
      keys: ['name', 'description', 'languages', 'frameworks'],
    });
    updateProjectsView();
    searchBar.disabled = false;
  });

  // Setup languages chips
  document
    .querySelectorAll<HTMLUListElement>('#languages > li')
    .forEach(languageElement => {
      const checkbox = languageElement.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )!;
      const language = languageElement
        .querySelector('label')!
        .textContent!.trim();

      toggleChip(languageElement, selectedLanguages[language]);

      languageElement.addEventListener('click', () => {
        toggleLanguage(language);
        checkbox.checked = selectedLanguages[language];
        toggleChip(languageElement, selectedLanguages[language]);
      });
    });

  // Setup frameworks chips
  document
    .querySelectorAll<HTMLUListElement>('#frameworks > li')
    .forEach(frameworkElement => {
      const checkbox = frameworkElement.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )!;
      const framework = frameworkElement
        .querySelector('label')!
        .textContent!.trim();

      toggleChip(frameworkElement, selectedFrameworks[framework]);

      frameworkElement.addEventListener('click', () => {
        toggleFramework(framework);
        checkbox.checked = selectedFrameworks[framework];
        toggleChip(frameworkElement, selectedFrameworks[framework]);
      });
    });
};

updateProjectsView();
