import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const NAKULA_EASE = [0.22, 1, 0.36, 1];

/**
 * Masked character-by-character display heading rise shared across Home & V2 subpages.
 * Supports optional per-line class overrides (`lineClassNames`) and controlled reveal (`reveal`).
 */
export default function MaskedDisplayHeading({
  lines,
  as: Tag = 'h2',
  className = '',
  lineClassNames = [],
  shouldReduceMotion = false,
  reveal,
}) {
  if (shouldReduceMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, lineIdx) => (
          <span key={line} className={`block ${lineClassNames[lineIdx] || ''}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  let charCursor = 0;
  const isControlled = typeof reveal === 'boolean';

  return (
    <motion.div
      initial="hidden"
      animate={isControlled ? (reveal ? 'visible' : 'hidden') : undefined}
      whileInView={isControlled ? undefined : 'visible'}
      viewport={isControlled ? undefined : { once: true, amount: 0.2 }}
    >
      <Tag className={className}>
        {lines.map((line, lineIdx) => {
          const words = line.split(' ');
          return (
            <span
              key={line}
              className={`block overflow-hidden py-[0.02em] ${lineClassNames[lineIdx] || ''}`}
            >
              {words.map((word, wIdx) => (
                <span
                  key={`${word}-${wIdx}`}
                  className="inline-block whitespace-nowrap mr-[0.22em] last:mr-0"
                >
                  {Array.from(word).map((ch, cIdx) => {
                    const delay = charCursor * 0.018;
                    charCursor += 1;
                    return (
                      <motion.span
                        key={`${ch}-${cIdx}`}
                        variants={{
                          hidden: { y: '106%' },
                          visible: {
                            y: '0%',
                            transition: {
                              duration: 0.58,
                              delay,
                              ease: NAKULA_EASE,
                            },
                          },
                        }}
                        className="inline-block will-change-transform"
                      >
                        {ch}
                      </motion.span>
                    );
                  })}
                </span>
              ))}
            </span>
          );
        })}
      </Tag>
    </motion.div>
  );
}

MaskedDisplayHeading.propTypes = {
  lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  as: PropTypes.elementType,
  className: PropTypes.string,
  lineClassNames: PropTypes.arrayOf(PropTypes.string),
  shouldReduceMotion: PropTypes.bool,
  reveal: PropTypes.bool,
};
