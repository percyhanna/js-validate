var jsValidate = require('../lib/main.js');

describe('validate', function() {
    it('validates string values', function() {
        expect(jsValidate.validate('a', 'String')).toBeTruthy();
        expect(jsValidate.validate(123, 'String')).toBeFalsy();
    });
});
