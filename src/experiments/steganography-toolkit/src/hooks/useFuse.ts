import { useState, useEffect, useCallback } from 'react';
import Fuse from 'fuse.js';

export interface UseFuseOutput<T = unknown> {
  results?: Fuse.FuseResult<T>[];
  search(pattern: string): Fuse.FuseResult<T>[];
  setList(list: T[]): void;
}

/**
 * A React Hook that filters an array using the Fuse.js fuzzy-search library.
 *
 * @param list The array to filter.
 * @param searchTerm The search term to filter by.
 * @param fuseOptions Options for Fuse.js.
 *
 * @returns The filtered array.
 *
 * @see https://fusejs.io/
 */
const useFuse = <T = unknown>(
  list: T[] = [],
  fuseOptions?: Fuse.IFuseOptions<T>,
): UseFuseOutput<T> => {
  const [currentList, setList] = useState(list);
  const [results, setResults] = useState<Fuse.FuseResult<T>[]>();
  const [fuse, setFuse] = useState<Fuse<T>>(new Fuse(list, fuseOptions));

  useEffect(() => {
    if (fuse) {
      fuse.setCollection(currentList);
    } else {
      setFuse(new Fuse(list, fuseOptions));
    }
  }, [currentList, fuse, fuseOptions, list]);

  const search = useCallback(
    (pattern: string) => {
      const results = fuse.search(pattern);

      setResults(results);

      return results;
    },
    [fuse],
  );

  return { results, search, setList };
};

export default useFuse;
