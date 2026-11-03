// Practical email validation regex matching standard web form and Zod conventions
export const EMAIL_REGEX =
  /^(?:[A-Za-z0-9_'+-]+\.)*[A-Za-z0-9_'+-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

/**
 * Validates contact form data purely in JavaScript without JIT compilation,
 * eliminating dynamic eval / new Function execution under strict CSP.
 * Behavior and output structure are drop-in compatible with the previous Zod schema:
 * - name: required, trimmed, min 2 chars
 * - email: required, trimmed, valid email format
 * - subject: optional string, trimmed
 * - message: required, trimmed, min 10 chars
 */
export const validateContactForm = (data, t) => {
  const issues = [];
  const name = typeof data?.name === 'string' ? data.name.trim() : '';
  const email = typeof data?.email === 'string' ? data.email.trim() : '';
  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  const subject = typeof data?.subject === 'string' ? data.subject.trim() : '';

  const getMsg = (key, fallback) => (typeof t === 'function' ? t(key) : fallback);

  if (name.length < 2) {
    issues.push({
      path: ['name'],
      message: getMsg('contact.validation.nameMin', 'Name must be at least 2 characters'),
    });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    issues.push({
      path: ['email'],
      message: getMsg('contact.validation.emailValid', 'Please enter a valid email address'),
    });
  }

  if (message.length < 10) {
    issues.push({
      path: ['message'],
      message: getMsg('contact.validation.messageMin', 'Message must be at least 10 characters'),
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
