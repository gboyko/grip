//Basic implementation of facade pattern to act as a sandbox for modules
//All modules sandboxed are refer to the single and same core

function Sandbox (scope,utils) {
	var Core = scope('Core'),
		Events = scope('Events');
	var sid = 0;

	var Sandbox = function (descriptor) {
		this.descriptor = descriptor || {};
		this.namespaces = this.descriptor.name + ++sid;
        this.utils = utils;
        this.extensions = {};
	};
	
	/**
	 * Permission module check 
	 * 
	 * @params {String} type of action
	 * @params {String} event of action
	 * 
	 * @returns {Boolean} true if ok , false if non
	 */
	Sandbox.prototype.is = function (type,action) {
		var actions = this.getActions();
		if (!actions) { return false};
		if (actions[type+':'+action]) {
			return true;
		} else {
			return false;
		}
	};
	
	/**	
	 * Event subscribe
	 * 
	 * @params {String} event name to subscribe
	 * @params {Function} callback function to be executed on event fire
	 * 
	 * @returns {Sandbox}
	 */
	Sandbox.prototype.subscribe = function (event,callback) {
		if (this.is('subscribe',event)) {
			Events.subscribe(event,callback);
		}
		return this;		
	};
	
	/**
	 * Events unsubscribe
	 * 
	 * @params {String} event name to unsubscrive
	 * @params {Function } callback function to be executed on unsubscribe ready
	 * 
	 * @returns {Sandbox}
	 */
	Sandbox.prototype.unsubscribe = function (event,callback) {
		if (this.is('subscribe',event)) {
			Events.unsubscribe(event,callback);
		}
		return this;	
	};
	
	/**
	 * Event publisher
	 * 
	 * @params {String} event name
	 * @params 			data to be published in stream
	 * 
	 * @returns {Sandbox}
	 */
	Sandbox.prototype.publish = function (event,data) {
		if (this.is('publish',event)) {
			Events.publish(event,data);
		}
		return this;	
	};
	
	/**
	 * Return truth module descriptor, withour wrapper
	 * 
	 * @returns {Object} module descriptor
	 */
	Sandbox.prototype.getDescriptor = function () {
		return this.descriptor.descriptor;
	};

    /**
     * Returns path to module
     * @return {String} path to module
     */
    Sandbox.prototype.getPath = function () {
        return this.descriptor.path;
    };

	/**
	 * Checks if descriptor param exist
	 * 
	 * @params {String} name of param to check in descriptor
	 * 
	 * @returns {Boolean} true if exist / false if no
	 */
	Sandbox.prototype.isDescriptor = function (name) {
		if (this.getDescriptor()[name]) { return true } else { return false}
	};
	
	/**
	 * Get module actions
	 * 
	 * @returns {Object/Boolean} dict or false if no exist 
	 */
	Sandbox.prototype.getActions = function () {
		if (this.isDescriptor('actions')) {
			return this.getDescriptor().actions;	
		} else {
			return false;
		}
		
	};
	
	/**
	 * Get module localization
	 * 
	 * @returns {Object} langs dict relay on current settings lang 
	 */
	Sandbox.prototype.getLocale = function () {
		if (this.isDescriptor('locale')) {
			return this.getDescriptor().locale;
		} else {
			return false;
		};
	};
	
	/**
	 * Get module resources
	 * 
	 * @return {Object} resources dict
	 */
	Sandbox.prototype.getResources = function () {
		if (this.isDescriptor('resources')) {
			return this.getDescriptor().resources;
		} else {
			return false;
		}
	};
	
	/**
	 * Get specific resource
	 * 
	 * @params {String} resource name
	 * 
	 * @returns {Object/Boolean} if exist return object / else return false
	 */	
	Sandbox.prototype.getResource = function (name) {
		var resources = this.getResources();
		if (!resources) { return false; };
		if (resources[name]) {
			return resources[name]; 
		} else {
			return false;
		}
	};

    /**
     * Get specific node installed module
     *
     * @params {String} module name
     *
     * @returns {Function} module
     */
    Sandbox.prototype.getModule = function (name) {
        return this.utils.get(name);
    };

    /**
     * Sandbox simple proxy of utils bind method
     *
     * @params {Function} function binding
     * @params {Object} context of binding
     *
     * @returns {Function} bind function
     */
    Sandbox.prototype.bind = function (fn,context) {
        return this.utils.bind(fn,context);
    };

    /**
     * Make additions module extensions
     *
     * @params {String} extension name
     *
     * @returns {Object/Boolean} return Object of module additions or false
     */
    Sandbox.prototype.makeExtension = function (name) {
        if (!name) return false;
        var descriptor = this.getDescriptor(),
            sandbox = this;
        if (descriptor[name]) {
            var ext = null,
                exts = {},
                path = this.getPath();
            for (ext in descriptor[name]) {
                exts[ext] = require(path+descriptor[name][ext])(sandbox);
            }
            this.setExtension(name,exts);
            return exts;
        } else {
            return false
        }
    };

    /**
     * Get local storage extensions
     *
     * @params {String} name of extension
     *
     * @returns {Object/Boolean} extensions object or false
     */
    Sandbox.prototype.getExtension = function (name) {
        if (this.extensions[name]) return this.extensions[name];
        return this.makeExtension(name);
    };

    /**
     * Saving loaded extensions
     *
     * @params {String} name of extensions
     * @params {Object} extensions object
     *
     * @returns {Sandbox}
     */
    Sandbox.prototype.setExtension = function (name,ext) {
        this.extensions[name] = ext;
        return this;
    };

	return Sandbox;	
}

exports = module.exports = Sandbox;

