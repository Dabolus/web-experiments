import { FunctionalComponent, h } from 'preact';
import { Router, Route } from 'wouter-preact';
import makeMatcher, { MatcherFn } from 'wouter-preact/matcher';
import { lazy } from '../utils';

const Home = lazy(() => import('../routes/Home'));
const Reader = lazy(() => import('../routes/Reader'));

const defaultMatcher = makeMatcher();

/*
 * A custom routing matcher function that supports multipath routes
 */
const multipathMatcher: MatcherFn = (patterns, path) => {
  for (let pattern of [patterns].flat()) {
    const [match, params] = defaultMatcher(pattern, path);
    if (match) return [match, params];
  }

  return [false, null];
};

const App: FunctionalComponent = () => (
  <div>
    <Router base="/eudcc-reader" matcher={multipathMatcher}>
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
