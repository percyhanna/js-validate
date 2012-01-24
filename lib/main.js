(function(ex) {
    var types = {
            String: isType('string', String),
            Number: isType('number', Number),
            Boolean: isType('boolean', Boolean)
        },
        helpers = {
            Numeric: nest(function(value, options) {
                types.Number(value);
                for (var option in options) {
                    if (typeof helpers.Numeric[option] === 'function') {
                        helpers.Numeric[option](value, options[option]);
                    } else {
                        throw new Error('Invalid Numeric option name: ' + option);
                    }
                }
                return true;
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
            if (typeof value === typeofName
                || (typeof value === 'object'
                    && value.constructor === klass)
            ) {
                return true;
            }
            throw new Error('Value was not of type ' + typeofName);
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
    
    function getPathStack(path, base) {
        var pathStack = [],
            paths = [];
        if (typeof path === 'string') {
            path = path.split('.');
        }
        if (!path instanceof Array) {
            throw new Error('Invalid path provided, must be a string or array.');
        }
        path.forEach(function(key) {
            pathStack.push(key);
            if (base[key] === undefined || base[key] === null) {
                throw new Error('Invalid path: ' + pathStack.join('.'));
            }
            paths.push({
                name: pathStack.join('.'),
                fn: base = base[key]
            });
        });
        return paths;
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
    
    function getValidatorStack(path) {
        return getPathStack(path, validators);
    }
    
    function setValidator(path, validator) {
        setPath(path, validators, validator);
    }
    
    function addValidator(path, validator, loadValue) {
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
    
    ex.addValidator = addValidator;
    ex.validate = function(value, validatorName, options) {
        var validators;
        if (typeof validatorName !== 'string') {
            throw new Error('Must provide name of validator as a string (e.g. "String.Length").');
        }
        validators = getValidatorStack(validatorName);

        // catch any errors
        try {
            validators.forEach(function(validator) {
                var valid;
                if (typeof validator.fn === 'function') {
                    valid = validator.fn(value, options);
                    if (valid !== true) {
                        throw new Error(validator.name);
                    }
                }
            });
        } catch (error) {
            return false;
        }
        return true;
    };
}(typeof window === 'undefined' ? (module.exports = {}) : (window.jsValidate = {})));
