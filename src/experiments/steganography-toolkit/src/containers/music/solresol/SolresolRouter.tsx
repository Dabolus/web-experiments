import React, { FunctionComponent } from 'react';
import SolresolInfo from './SolresolInfo';
import SolresolTranslator from './SolresolTranslator';
import TechniquePage, {
  TechniquePageProps,
} from '../../../components/TechniquePage';

export type SolresolRouterProps = Omit<
  TechniquePageProps,
  'id' | 'name' | 'tabs'
>;

const SolresolRouter: FunctionComponent<SolresolRouterProps> = props => (
  <TechniquePage
    id="solresol"
    name="Solresol"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <SolresolInfo />,
      },
      {
        id: 'translate',
        name: 'Translate',
        component: <SolresolTranslator />,
      },
    ]}
    {...props}
  />
);

export default SolresolRouter;
