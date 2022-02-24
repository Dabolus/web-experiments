import { FunctionalComponent, h } from 'preact';
import { ValidEUDCC } from '../types/DCC.schema';
import { eudccStatusToMessageMap } from '../utils/extractor';
import { formatDate } from '../utils/helpers';
import classes from './EUDCCResultsTab.module.scss';

export interface EUDCCResultsTabProps {
  value: ValidEUDCC;
}

const EUDCCResultsTab: FunctionalComponent<EUDCCResultsTabProps> = ({
  value,
}) => (
  <div className={classes.grid}>
    <label id="name-label">Name</label>
    <span aria-labelledby="name-label">
      {value.data.name?.surname} {value.data.name?.forename}
    </span>
    <label id="birth-date-label">Birth date</label>
    <span aria-labelledby="birth-date-label">
      {formatDate(value.data.birthDate) ?? '-'}
    </span>
    <strong className={classes.reason}>
      {eudccStatusToMessageMap[value.status]}
    </strong>
  </div>
);

export default EUDCCResultsTab;
