import { FunctionalComponent, h } from 'preact';
import { useState } from 'preact/hooks';
import {
  eudccStatusToMessageMap,
  EUDCCDataOutput,
  isValidEUDCC,
} from '../utils/extractor';
import classes from './EUDCC.module.scss';
import commonClasses from '../common/styles.module.scss';
import Tabs from './Tabs';
import { lazy } from '../utils';

const EUDCCResultsTab = lazy(() => import('../routes/EUDCCResultsTab'));
const EUDCCAdvancedTab = lazy(() => import('../routes/EUDCCAdvancedTab'));
const EUDCCRawTab = lazy(() => import('../routes/EUDCCRawTab'));

export interface EUDCCProps {
  value: EUDCCDataOutput;
}

const EUDCC: FunctionalComponent<EUDCCProps> = ({ value }) => {
  const [currentTab, setCurrentTab] = useState('results');

  return (
    <main className={classes.container}>
      {isValidEUDCC(value.parsed) ? (
        <Tabs
          tabs={[
            {
              id: 'results',
              title: 'Results',
              content: <EUDCCResultsTab value={value.parsed} />,
            },
            {
              id: 'advanced',
              title: 'Advanced',
              content: <EUDCCAdvancedTab value={value.parsed} />,
            },
            {
              id: 'raw',
              title: 'Raw',
              content: <EUDCCRawTab value={value} />,
            },
          ]}
          value={currentTab}
          onChange={setCurrentTab}
        />
      ) : (
        <div className={`${commonClasses.card} ${classes.spaced}`}>
          <strong>{eudccStatusToMessageMap[value.parsed.status]}</strong>
        </div>
      )}
      <span role="alert" className={classes.warning}>
        Note that this app doesn't currently verify the validity of the EUDCC
        you read, but it just reads its contents.{' '}
        <strong>
          Don't trust this app if you need to check the validity of an EUDCC!
        </strong>
      </span>
    </main>
  );
};

export default EUDCC;
