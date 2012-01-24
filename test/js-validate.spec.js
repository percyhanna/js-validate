var jsValidate = jsValidate || require('../lib/main.js');

// simplify passing functions for catching exceptions
Function.prototype.wrap = function() {
    var args = Array.prototype.slice.call(arguments),
        method = this;
    return function() {
        return method.apply(method, args);
    };
};

describe('validate', function() {
    beforeEach(function() {
        this.addMatchers({
            toBeOfType: function(expected) {
                return this.actual.constructor === expected;
            }
        });
    });

    // validate string values
    it('validates string values', function() {
        expect(jsValidate.validate('a', 'String')).toBeTruthy();
        expect(jsValidate.validate(123, 'String')).toBeFalsy();
        expect(jsValidate.validate({}, 'String')).toBeFalsy();
        expect(jsValidate.validate([], 'String')).toBeFalsy();
    });
    
    // validate numeric values
    it('validates numeric values', function() {
        expect(jsValidate.validate(123, 'Number')).toBeTruthy();
        expect(jsValidate.validate('123', 'Number')).toBeFalsy();
        expect(jsValidate.validate({}, 'Number')).toBeFalsy();
        expect(jsValidate.validate([], 'Number')).toBeFalsy();
    });
    
    // validate boolean values
    it('validates boolean values', function() {
        expect(jsValidate.validate(true, 'Boolean')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean')).toBeTruthy();
        expect(jsValidate.validate(true, 'Boolean.True')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean.False')).toBeTruthy();
        expect(jsValidate.validate(false, 'Boolean.True')).not.toBeTruthy();
        expect(jsValidate.validate(true, 'Boolean.False')).not.toBeTruthy();
        expect(jsValidate.validate('123', 'Boolean')).toBeFalsy();
        expect(jsValidate.validate({}, 'Boolean')).toBeFalsy();
        expect(jsValidate.validate([], 'Boolean')).toBeFalsy();
    });
    
    // invalid validators
    it('throws exceptions for invalid validators', function() {
        expect(jsValidate.validate.wrap(123, 'InvalidValidator')).toThrow();
        expect(jsValidate.validate.wrap(123, 'Number')).not.toThrow();
    });
});

describe('add validator', function() {
    it('allows adding a validator', function() {
        expect(jsValidate.addValidator('String.Awesome', function(value) { return value.match(/awesome/i) !== null; }));
        expect(jsValidate.validate('is awesome', 'String.Awesome')).toBeTruthy();
        expect(jsValidate.validate('is not', 'String.Awesome')).toBeFalsy();
        expect(jsValidate.validate(123, 'String.Awesome')).toBeFalsy();
    });
    
    it('prevents bad validator', function() {
        expect(jsValidate.addValidator.wrap('Bad.Stuff', 'not a function')).toThrow();
    });
});
