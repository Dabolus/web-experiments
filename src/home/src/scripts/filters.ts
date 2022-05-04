import Fuse from 'fuse.js';

const currentUrl = new URL(window.location.href);

const projectsElements =
  document.querySelectorAll<HTMLLIElement>('#projects > li');

interface Project {
  id: string;
  name: string;
  description: string;
}

const projects: Project[] = Array.from(projectsElements).map(projectElement => {
  const id = projectElement.id.slice(8);
  const name = projectElement.querySelector('h2')!.textContent!;
  const description = projectElement.querySelector('p')!.textContent!;
  return { id, name, description };
});

const fuse = new Fuse(projects, {
  keys: ['name', 'description'],
  // We need to force-cast due to a bug in Fuse.js type definitions.
  // See: https://github.com/krisk/Fuse/issues/650
} as Fuse.IFuseOptions<Project>);

let currentSearch = currentUrl.searchParams.get('search') || '';

const updateProjectsView = () => {
  const currentSearchProjectsKeyVal = Object.fromEntries(
    currentSearch
      ? fuse.search(currentSearch).map(result => [result.item.id, result.item])
      : projects.map(project => [project.id, project]),
  );

  projectsElements.forEach(projectElement => {
    const projectId = projectElement.id.slice(8);
    const projectChips = projectElement.querySelector('.chips')!;
    const projectTechnologies = Array.from(
      projectChips.querySelectorAll('.technology-chip'),
    );
    const hasSearchMatch = Boolean(currentSearchProjectsKeyVal[projectId]);
    const hasTechnology =
      Object.keys(selectedTechnologies).length < 1 ||
      projectTechnologies.some(
        projectTechnology =>
          selectedTechnologies[projectTechnology.textContent!.trim()],
      );
    projectElement.hidden = !hasSearchMatch || !hasTechnology;
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

const selectedTechnologies: Record<string, boolean> =
  parseSelectionMapFromUrl('technologies');

const toggleTechnology = (technology: string) => {
  if (selectedTechnologies[technology]) {
    delete selectedTechnologies[technology];
  } else {
    selectedTechnologies[technology] = true;
  }
  requestAnimationFrame(() => {
    const selectedTechnologiesArray = Object.keys(selectedTechnologies);
    if (selectedTechnologiesArray.length > 0) {
      const updatedTechnologiesFilter = selectedTechnologiesArray.join(',');
      currentUrl.searchParams.set('technologies', updatedTechnologiesFilter);
    } else {
      currentUrl.searchParams.delete('technologies');
    }
    window.history.replaceState({}, '', currentUrl.href);
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
    updateProjectsView();
    requestAnimationFrame(() => {
      currentUrl.searchParams.set('search', currentSearch);
      window.history.replaceState({}, '', currentUrl.href);
    });
  });

  // Setup technologies chips
  document
    .querySelectorAll<HTMLUListElement>('#technologies > li')
    .forEach(technologyElement => {
      const checkbox = technologyElement.querySelector<HTMLInputElement>(
        'input[type="checkbox"]',
      )!;
      const technology = technologyElement.textContent?.trim() || '';

      toggleChip(technologyElement, selectedTechnologies[technology]);

      technologyElement.addEventListener('click', () => {
        toggleTechnology(technology);
        checkbox.checked = selectedTechnologies[technology];
        toggleChip(technologyElement, selectedTechnologies[technology]);
        updateProjectsView();
      });
    });
};

updateProjectsView();
