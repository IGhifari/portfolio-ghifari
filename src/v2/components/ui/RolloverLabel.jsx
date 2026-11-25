import PropTypes from 'prop-types';

/**
 * Vertical text-rollover label paired with `.v2-pill-btn`.
 */
export default function RolloverLabel({ text }) {
  return (
    <span className="v2-rollover-wrap">
      <span className="v2-rollover-track">
        <span className="v2-rollover-line">{text}</span>
        <span className="v2-rollover-line" aria-hidden="true">
          {text}
        </span>
      </span>
    </span>
  );
}

RolloverLabel.propTypes = {
  text: PropTypes.string.isRequired,
};
