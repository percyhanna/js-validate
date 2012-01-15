var jsValidate;
jsValidate = module.exports = (function() {
    var ValidationError = function(err) { this.err = err; },
        types = {
            String: isType('string', String),
            Number: isType('number', Number),
            Boolean: isType('boolean', Boolean)
        },
        helpers = {
            Numeric: nest(function(value, options) {
                var valid = types.Number(value);
                if (valid !== true) {
                    return valid;
                }
                for (var option in options) {
                    if (typeof helpers.Numeric[option] === 'function') {
                        valid = helpers.Numeric[option](value, options[option]);
                        if (valid !== true) {
                            return valid;
                        }
                    } else {
                        throw new Error('Invalid Numeric option name: ' + option);
                    }
                }
                return valid;
            }, {
                lt: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "lt" option.');
                    }
                    return value < option;
                },
                lte: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "lte" option.');
                    }
                    return value <= option;
                },
                gt: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "gt" option.');
                    }
                    return value > option;
                },
                gte: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "gte" option.');
                    }
                    return value >= option;
                },
                eq: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "eq" option.');
                    }
                    return value == option;
                },
                neq: function(value, option) {
                    if (!types.Number(value)) {
                        throw new Error('Invalid number provided for "neq" option.');
                    }
                    return value != option;
                }
            }),
        },
        validators = {
            String: nest(types.String, {
                
            }),
            Number: nest(types.Number, {
                
            }),
            Boolean: nest(types.Boolean, {
                True: function(value) {
                    return value === true;
                },
                False: function(value) {
                    return value === false;
                }
            })
        };
    
    // shared type validator
    function isType(typeofName, klass) {
        return function(value) {
            return (typeof value === typeofName
                    || (typeof value === 'object'
                        && value.constructor === klass))
                || new ValidationError('Value was not of type ' + typeofName);
        };
    }
    
    // allow nesting of functions
    function nest(fn, children) {
        for (var nested in children) {
            if (children.hasOwnProperty(nested)) {
                fn[nested] = children[nested];
            }
        }
        return fn;
    }
    
    // generic path functions
    function _getPath(path, base) {
        var pathLength = path.length,
            key;
        for (var pathIndex = 0; pathIndex < pathLength; pathIndex++) {
            key = path[pathIndex];
            if (base[key] === undefined || base[key] === null) {
                return null;
            }
            base = base[key];
        }
        return (base === undefined || base === null) ? null : base;
    }
    
    function _setPath(path, base, value) {
        var lastKey = path.pop(),
            pathLength = path.length,
            key;
        for (var pathIndex = 0; pathIndex < pathLength; pathIndex++) {
            key = path[pathIndex];
            if (base[key] === undefined || base[key] === null) {
                base[key] = {};
            }
            base = base[key];
        }
        base[lastKey] = value;
    }

    function getPath(path, base) {
        if (typeof path === 'string') {
            path = path.split('.');
        }
        if (typeof path !== 'object' && path.constructor !== Array) {
            throw new Error('Invalid path provided, must be a string or array.');
        }
        return _getPath(path, base);
    }
    
    function setPath(path, base, value) {
        if (typeof path === 'string') {
            path = path.split('.');
        }
        if (!path instanceof Array) {
            throw new Error('Invalid path provided, must be a string or array.');
        }
        _setPath(path, base, value);
    }

    // validator management functions
    function getValidator(path) {
        return getPath(path, validators);
    }
    
    function setValidator(path, validator) {
        setPath(path, validators, validator);
    }
    
    function addValidator(path, validator, loadValue) {
        var cur = getValidator(path);
        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function.');
        }
        if (typeof loadValue === 'function') {
            validator = function(value, options) {
                value = loadValue(value, options);
                return validator(value, options);
            };
        }
        setValidator(path, validator);
    }
    
    return {
        ValidationError: ValidationError,
        
        addValidator: addValidator,
        
        validate: function(value, validatorName, options) {
            var validator;
            if (typeof validatorName !== 'string') {
                throw new Error('Must provide name of validator as a string (e.g. "String.Length").');
            }
            validator = getValidator(validatorName);
            if (typeof validator !== 'function') {
                throw new Error('Invalid validator name provided: ' + validatorName);
            }
            return validator(value, options);
        }
    };
}());
