var jsValidate = require('../lib/main.js');
console.log(jsValidate);

describe('validate', function() {
  it('validates string values', function() {
    expect(jsValidate.validate('a', 'String')).toBeTruthy();
  });
});
