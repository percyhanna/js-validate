var jsValidate = require('../lib/main.js');

beforeEach(function() {
    this.addMatchers({
        toBeOfType: function(expected) {
            return this.actual.constructor === expected;
        }
    });
});

// simplify passing functions for catching exceptions
Function.prototype.wrap = function() {
    var args = Array.prototype.slice.call(arguments),
        method = this;
    return function() {
        return method.apply(method, args);
    };
};

describe('validate', function() {
    // validate string values
    it('validates string values', function() {
        expect(jsValidate.validate('a', 'String')).toBeTruthy();
        expect(jsValidate.validate(123, 'String')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate({}, 'String')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate([], 'String')).toBeOfType(jsValidate.ValidationError);
    });
    
    // validate numeric values
    it('validates numeric values', function() {
        expect(jsValidate.validate(123, 'Number')).toBeTruthy();
        expect(jsValidate.validate('123', 'Number')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate({}, 'Number')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate([], 'Number')).toBeOfType(jsValidate.ValidationError);
    });
    
    // validate boolean values
    it('validates boolean values', function() {
        expect(jsValidate.validate(true, 'Boolean')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean')).toBeTruthy();
        expect(jsValidate.validate(true, 'Boolean.True')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean.False')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean.True')).not.toBeTruthy();
        expect(jsValidate.validate(true, 'Boolean.False')).not.toBeTruthy();
        expect(jsValidate.validate('123', 'Boolean')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate({}, 'Boolean')).toBeOfType(jsValidate.ValidationError);
        expect(jsValidate.validate([], 'Boolean')).toBeOfType(jsValidate.ValidationError);
    });
    
    // invalid validators
    it('throws exceptions for invalid validators', function() {
        expect(jsValidate.validate.wrap(123, 'InvalidValidator')).toThrow();
        expect(jsValidate.validate.wrap(123, 'Number')).not.toThrow();
    });
});
