module.exports = (function() {
    var validators = {};
    
    // generic path functions
    function _getPath(path, base) {
        var pathLength = path.length,
            key;
        for (var pathIndex = 0; pathIndex < pathLength; pathIndex++) {
            key = path[pathIndex];
            if (base[key] === undefined) {
                return null;
            }
            base = base[key];
        }
        return base === undefined ? null : base;
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
        validate: function(value, validator, options) {
            if (typeof validator !== 'string') {
                throw new Error('Must provide name of validator as a string (e.g. "String.Length").');
            }
            validator = getValidator(validator);
            return true;
        }
    };
}());
