import { FunctionalComponent, h } from 'preact';
import { Router, Route, type Path } from 'wouter-preact';
import { parse as parsePattern } from 'regexparam';
import { lazy } from '../utils';

const Home = lazy(() => import('../routes/Home'));
const Reader = lazy(() => import('../routes/Reader'));

/*
 * A custom routing matcher function that supports multipath routes
 */
const multipathParser = (
  routeOrRoutes: Path | Path[],
  loose?: boolean,
): { pattern: RegExp; keys: string[] } => {
  if (typeof routeOrRoutes === 'string') {
    return parsePattern(routeOrRoutes, loose);
  }
  const results = routeOrRoutes.map(route => parsePattern(route, loose));
  const mergedKeys = results.flatMap(({ keys }) => keys);
  const mergedPatternSource = `(?:${results
    .map(({ pattern }) => pattern.source)
    .join('|')})`;
  const mergedPatternFlags = Array.from(
    new Set(results.flatMap(({ pattern }) => pattern.flags.split(''))),
  ).join('');
  return {
    keys: mergedKeys,
    pattern: new RegExp(mergedPatternSource, mergedPatternFlags),
  };
};

const App: FunctionalComponent = () => (
  <div>
    <Router base="/eudcc-reader" parser={multipathParser}>
      <Route path="/" component={Home} />
      {/* wouter types don't know about our custom matcher function */}
      <Route
        path={['/read', '/results'] as unknown as string}
        component={Reader}
      />
    </Router>
  </div>
);

export default App;
