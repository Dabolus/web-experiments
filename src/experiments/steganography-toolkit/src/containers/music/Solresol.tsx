import React, { FunctionComponent } from 'react';
import SolresolInfo from '../../components/music/solresol/SolresolInfo';
import SolresolTranslator from '../../components/music/solresol/SolresolTranslator';
import TechniquePage, {
  TechniquePageProps,
} from '../../components/TechniquePage';

export type SolresolProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const Solresol: FunctionComponent<SolresolProps> = props => (
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

export default Solresol;
