import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateContactForm, EMAIL_REGEX, CONTACT_LIMITS } from '../src/utils/contactValidation.js';

describe('CONF-04: Contact Form Validation (Zero-Eval & Zod Parity)', () => {
  const mockT = (key) => {
    const dict = {
      'contact.validation.nameMin': 'Name must be at least 2 characters',
      'contact.validation.nameMax': 'Name cannot exceed 100 characters',
      'contact.validation.emailValid': 'Please enter a valid email address',
      'contact.validation.emailMax': 'Email address cannot exceed 254 characters',
      'contact.validation.subjectMax': 'Subject cannot exceed 200 characters',
      'contact.validation.messageMin': 'Message must be at least 10 characters',
      'contact.validation.messageMax': 'Message cannot exceed 5000 characters',
    };
    return dict[key] || key;
  };

  describe('1. Valid Submissions & Data Trimming', () => {
    it('accepts completely valid submission and trims all fields', () => {
      const input = {
        name: '  M. Ghifari  ',
        email: '  ghifari@ighifari.my.id  ',
        subject: '  Collaboration Inquiry  ',
        message: '  Hello, I would like to discuss a web project with you.  ',
      };

      const result = validateContactForm(input, mockT);
      assert.equal(result.success, true);
      assert.deepEqual(result.data, {
        name: 'M. Ghifari',
        email: 'ghifari@ighifari.my.id',
        subject: 'Collaboration Inquiry',
        message: 'Hello, I would like to discuss a web project with you.',
      });
    });

    it('accepts valid submission with empty optional subject', () => {
      const input = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        subject: '',
        message: 'This is a message that easily exceeds ten characters.',
      };

      const result = validateContactForm(input, mockT);
      assert.equal(result.success, true);
      assert.equal(result.data.subject, '');
      assert.equal(result.data.name, 'Jane Doe');
    });

    it('accepts valid submission when subject is omitted/undefined', () => {
      const input = {
        name: 'John Smith',
        email: 'john+dev@example.co.id',
        message: 'Another valid message with sufficient length for validation.',
      };

      const result = validateContactForm(input, mockT);
      assert.equal(result.success, true);
      assert.equal(result.data.subject, '');
    });
  });

  describe('2. Name Field Validation', () => {
    it('rejects name shorter than 2 characters after trimming', () => {
      const testCases = ['', ' ', '   ', 'A', ' A '];
      for (const name of testCases) {
        const result = validateContactForm(
          { name, email: 'test@example.com', message: 'Valid long message here.' },
          mockT
        );
        assert.equal(result.success, false);
        const nameIssue = result.error.issues.find((i) => i.path[0] === 'name');
        assert.ok(nameIssue, `Expected name issue for "${name}"`);
        assert.equal(nameIssue.message, 'Name must be at least 2 characters');
      }
    });

    it('accepts name with exactly 2 characters', () => {
      const result = validateContactForm(
        { name: 'AB', email: 'test@example.com', message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, true);
    });
  });

  describe('3. Email Field Validation & EMAIL_REGEX', () => {
    it('accepts common valid email addresses', () => {
      const validEmails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'other.email-with-hyphen@example.com',
        'fully-qualified-domain@example.co.id',
        'user.name@ighifari.my.id',
        'x@example.com',
        'firstname-lastname@example.com',
        'user_name@domain.com',
        'user123@sub.domain.org',
      ];

      for (const email of validEmails) {
        assert.ok(EMAIL_REGEX.test(email), `EMAIL_REGEX should accept: ${email}`);
        const result = validateContactForm(
          { name: 'Valid User', email, message: 'Valid long message here.' },
          mockT
        );
        assert.equal(result.success, true, `validateContactForm should accept: ${email}`);
      }
    });

    it('rejects malformed email addresses', () => {
      const invalidEmails = [
        '',
        '   ',
        'plainaddress',
        '@example.com',
        'email.example.com',
        'email@example@example.com',
        '.email@example.com',
        'email.@example.com',
        'email..email@example.com',
        'email@example',
        'email@-example.com',
        'email@example..com',
        'user space@domain.com',
      ];

      for (const email of invalidEmails) {
        assert.equal(EMAIL_REGEX.test(email), false, `EMAIL_REGEX should reject: "${email}"`);
        const result = validateContactForm(
          { name: 'Valid User', email, message: 'Valid long message here.' },
          mockT
        );
        assert.equal(result.success, false, `validateContactForm should reject: "${email}"`);
        const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
        assert.ok(emailIssue, `Expected email issue for: "${email}"`);
        assert.equal(emailIssue.message, 'Please enter a valid email address');
      }
    });
  });

  describe('4. Message Field Validation', () => {
    it('rejects message shorter than 10 characters after trimming', () => {
      const shortMessages = ['', '   ', 'Short', '123456789', '   12345   '];
      for (const message of shortMessages) {
        const result = validateContactForm(
          { name: 'Valid User', email: 'test@example.com', message },
          mockT
        );
        assert.equal(result.success, false);
        const msgIssue = result.error.issues.find((i) => i.path[0] === 'message');
        assert.ok(msgIssue, `Expected message issue for: "${message}"`);
        assert.equal(msgIssue.message, 'Message must be at least 10 characters');
      }
    });

    it('accepts message with exactly 10 characters', () => {
      const result = validateContactForm(
        { name: 'Valid User', email: 'test@example.com', message: '0123456789' },
        mockT
      );
      assert.equal(result.success, true);
    });
  });

  describe('5. Error Formatting & Zod Compatibility', () => {
    it('produces compatible issue structure for multiple simultaneous errors', () => {
      const invalidInput = {
        name: 'A',
        email: 'invalid-email',
        message: 'Short',
      };

      const result = validateContactForm(invalidInput, mockT);
      assert.equal(result.success, false);
      assert.equal(result.error.issues.length, 3);

      // Verify the issue mapping structure used by Contact.jsx:
      // validation.error.issues.forEach((issue) => { fieldErrors[issue.path[0]] = issue.message; })
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });

      assert.deepEqual(fieldErrors, {
        name: 'Name must be at least 2 characters',
        email: 'Please enter a valid email address',
        message: 'Message must be at least 10 characters',
      });
    });
  });

  describe('6. CONF-05: Upper Boundary Limits (maxLength) & Edge Cases', () => {
    it('exports CONTACT_LIMITS matching requirements', () => {
      assert.deepEqual(CONTACT_LIMITS, {
        NAME_MIN: 2,
        NAME_MAX: 100,
        EMAIL_MAX: 254,
        SUBJECT_MAX: 200,
        MESSAGE_MIN: 10,
        MESSAGE_MAX: 5000,
      });
    });

    it('accepts name with exactly 100 characters (upper boundary)', () => {
      const name100 = 'A'.repeat(100);
      const result = validateContactForm(
        { name: name100, email: 'test@example.com', message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, true);
      assert.equal(result.data.name, name100);
    });

    it('rejects name with 101 characters (exceeds boundary)', () => {
      const name101 = 'A'.repeat(101);
      const result = validateContactForm(
        { name: name101, email: 'test@example.com', message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, false);
      const nameIssue = result.error.issues.find((i) => i.path[0] === 'name');
      assert.ok(nameIssue);
      assert.equal(nameIssue.message, 'Name cannot exceed 100 characters');
    });

    it('handles name trimming before upper boundary check', () => {
      const name100 = `  ${'A'.repeat(100)}  `;
      const passResult = validateContactForm(
        { name: name100, email: 'test@example.com', message: 'Valid long message here.' },
        mockT
      );
      assert.equal(passResult.success, true);
      assert.equal(passResult.data.name.length, 100);

      const name101 = `  ${'A'.repeat(101)}  `;
      const failResult = validateContactForm(
        { name: name101, email: 'test@example.com', message: 'Valid long message here.' },
        mockT
      );
      assert.equal(failResult.success, false);
    });

    it('accepts valid email with exactly 254 characters (upper boundary)', () => {
      // 64 + 1 + 63 + 1 + 63 + 1 + 57 + 1 + 3 = 254
      const email254 = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`;
      assert.equal(email254.length, 254);
      assert.ok(EMAIL_REGEX.test(email254));

      const result = validateContactForm(
        { name: 'Valid User', email: email254, message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, true);
      assert.equal(result.data.email, email254);
    });

    it('rejects validly formatted email with 255 characters (exceeds boundary)', () => {
      // 64 + 1 + 63 + 1 + 63 + 1 + 58 + 1 + 3 = 255
      const email255 = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.com`;
      assert.equal(email255.length, 255);
      assert.ok(EMAIL_REGEX.test(email255));

      const result = validateContactForm(
        { name: 'Valid User', email: email255, message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, false);
      const emailIssue = result.error.issues.find((i) => i.path[0] === 'email');
      assert.ok(emailIssue);
      assert.equal(emailIssue.message, 'Email address cannot exceed 254 characters');
    });

    it('accepts subject with exactly 200 characters (upper boundary)', () => {
      const subject200 = 'S'.repeat(200);
      const result = validateContactForm(
        { name: 'Valid User', email: 'test@example.com', subject: subject200, message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, true);
      assert.equal(result.data.subject, subject200);
    });

    it('rejects subject with 201 characters (exceeds boundary)', () => {
      const subject201 = 'S'.repeat(201);
      const result = validateContactForm(
        { name: 'Valid User', email: 'test@example.com', subject: subject201, message: 'Valid long message here.' },
        mockT
      );
      assert.equal(result.success, false);
      const subjectIssue = result.error.issues.find((i) => i.path[0] === 'subject');
      assert.ok(subjectIssue);
      assert.equal(subjectIssue.message, 'Subject cannot exceed 200 characters');
    });

    it('accepts message with exactly 5000 characters (upper boundary)', () => {
      const message5000 = 'M'.repeat(5000);
      const result = validateContactForm(
        { name: 'Valid User', email: 'test@example.com', message: message5000 },
        mockT
      );
      assert.equal(result.success, true);
      assert.equal(result.data.message.length, 5000);
    });

    it('rejects message with 5001 characters (exceeds boundary)', () => {
      const message5001 = 'M'.repeat(5001);
      const result = validateContactForm(
        { name: 'Valid User', email: 'test@example.com', message: message5001 },
        mockT
      );
      assert.equal(result.success, false);
      const msgIssue = result.error.issues.find((i) => i.path[0] === 'message');
      assert.ok(msgIssue);
      assert.equal(msgIssue.message, 'Message cannot exceed 5000 characters');
    });

    it('rejects all fields simultaneously when exceeding maximum boundaries', () => {
      const email255 = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(58)}.com`;
      const invalidInput = {
        name: 'A'.repeat(101),
        email: email255,
        subject: 'S'.repeat(201),
        message: 'M'.repeat(5001),
      };

      const result = validateContactForm(invalidInput, mockT);
      assert.equal(result.success, false);
      assert.equal(result.error.issues.length, 4);

      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });

      assert.deepEqual(fieldErrors, {
        name: 'Name cannot exceed 100 characters',
        email: 'Email address cannot exceed 254 characters',
        subject: 'Subject cannot exceed 200 characters',
        message: 'Message cannot exceed 5000 characters',
      });
    });
  });
});
