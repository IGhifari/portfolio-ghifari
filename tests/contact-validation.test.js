import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateContactForm, EMAIL_REGEX } from '../src/utils/contactValidation.js';

describe('CONF-04: Contact Form Validation (Zero-Eval & Zod Parity)', () => {
  const mockT = (key) => {
    const dict = {
      'contact.validation.nameMin': 'Name must be at least 2 characters',
      'contact.validation.emailValid': 'Please enter a valid email address',
      'contact.validation.messageMin': 'Message must be at least 10 characters',
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
});
