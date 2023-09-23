import React, { FunctionComponent } from 'react';
import UnicodeInfo from '../../components/text/unicode/UnicodeInfo';
import UnicodeConcealer from '../../components/text/unicode/UnicodeConcealer';
import UnicodeRevealer from '../../components/text/unicode/UnicodeRevealer';
import TechniquePage, {
  TechniquePageProps,
} from '../../components/TechniquePage';

export type UnicodeProps = Omit<TechniquePageProps, 'id' | 'name' | 'tabs'>;

const Unicode: FunctionComponent<UnicodeProps> = props => (
  <TechniquePage
    id="unicode"
    name="Unicode"
    tabs={[
      {
        id: 'info',
        name: 'Info',
        component: <UnicodeInfo />,
      },
      {
        id: 'conceal',
        name: 'Conceal',
        component: <UnicodeConcealer />,
      },
      {
        id: 'reveal',
        name: 'Reveal',
        component: <UnicodeRevealer />,
      },
    ]}
    {...props}
  />
);

export default Unicode;
