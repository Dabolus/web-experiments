import { FunctionalComponent, h, JSX } from 'preact';

export type ArrowBackProps = Omit<JSX.SVGAttributes<SVGSVGElement>, 'viewBox'>;

const ArrowBack: FunctionalComponent<ArrowBackProps> = props => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
    />
  </svg>
);

export default ArrowBack;
