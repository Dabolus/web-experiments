import { FunctionalComponent, h } from 'preact';
import { Router, Route } from 'wouter-preact';

import Home from '../routes/Home';
import Reader from '../routes/Reader';

const App: FunctionalComponent = () => {
  return (
    <div>
      <Router base="/eudcc-reader">
        <Route path="/" component={Home} />
        <Route path="/read" component={Reader} />
      </Router>
    </div>
  );
};

export default App;
