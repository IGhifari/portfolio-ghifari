// Practical email validation regex matching standard web form and Zod conventions
export const EMAIL_REGEX =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

export const CONTACT_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 254,
  SUBJECT_MAX: 200,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 5000,
};

/**
 * Validates contact form data purely in JavaScript without JIT compilation,
 * eliminating dynamic eval / new Function execution under strict CSP.
 * Behavior and output structure are drop-in compatible with the previous Zod schema:
 * - name: required, trimmed, min 2 chars, max 100 chars
 * - email: required, trimmed, valid email format, max 254 chars
 * - subject: optional string, trimmed, max 200 chars
 * - message: required, trimmed, min 10 chars, max 5000 chars
 */
export const validateContactForm = (data, t) => {
  const issues = [];
  const name = typeof data?.name === 'string' ? data.name.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  const subject = typeof data?.subject === 'string' ? data.subject.trim() : '';

  const getMsg = (key, fallback) => (typeof t === 'function' ? t(key) : fallback);

  if (name.length < CONTACT_LIMITS.NAME_MIN) {
    issues.push({
      path: ['name'],
      message: getMsg('contact.validation.nameMin', 'Name must be at least 2 characters'),
    });
  } else if (name.length > CONTACT_LIMITS.NAME_MAX) {
    issues.push({
      path: ['name'],
      message: getMsg('contact.validation.nameMax', 'Name cannot exceed 100 characters'),
    });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    issues.push({
      path: ['email'],
      message: getMsg('contact.validation.emailValid', 'Please enter a valid email address'),
    });
  } else if (email.length > CONTACT_LIMITS.EMAIL_MAX) {
    issues.push({
      path: ['email'],
      message: getMsg('contact.validation.emailMax', 'Email address cannot exceed 254 characters'),
    });
  }

  if (subject.length > CONTACT_LIMITS.SUBJECT_MAX) {
    issues.push({
      path: ['subject'],
      message: getMsg('contact.validation.subjectMax', 'Subject cannot exceed 200 characters'),
    });
  }

  if (message.length < CONTACT_LIMITS.MESSAGE_MIN) {
    issues.push({
      path: ['message'],
      message: getMsg('contact.validation.messageMin', 'Message must be at least 10 characters'),
    });
  } else if (message.length > CONTACT_LIMITS.MESSAGE_MAX) {
    issues.push({
      path: ['message'],
      message: getMsg('contact.validation.messageMax', 'Message cannot exceed 5000 characters'),
    });
  }

  if (issues.length > 0) {
    return { success: false, error: { issues } };
  }

  return {
    success: true,
    data: {
      name,
      email,
      subject,
      message,
    },
  };
};
