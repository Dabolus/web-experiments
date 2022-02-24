import { FunctionalComponent, h } from 'preact';
import classes from './Spinner.module.scss';

const Spinner: FunctionalComponent = () => {
  return (
    <div className={classes.ring}>
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default Spinner;
