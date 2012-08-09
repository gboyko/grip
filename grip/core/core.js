// Implementation of mediator pattern to act as application core


function Core (scope,utils) {
	var Sandbox = scope('Sandbox'),
		Events = scope('Events');
		config = scope('Config');
	
	console.log(utils);
		
	var bind = function (func,context){
		return function(){
			return func.apply(context,arguments);
		}
	};
	
	var Core = {
		/**
		 * Modules descriptor
		 * 
		 * @type Object
		 */
		modules: {},
		
		/**
		 * Sandboxes
		 * 
		 * @type Object
		 */
		sandboxes: {},
		
		/**
		 * Inititalize of application
		 * first loading all modules from dirs 
		 * initialize all modules
		 * 
		 * @params {Array} pathes to custom modules directories
		 * 
		 * @returns {Core}
		 */
		init: function () {
			this.loadModules(config.modules.dir,this.modules);
			this.initModules(this.modules,this.sandboxes);
		},
		
		/**
		 * Module loader
		 * Loads all modules that presented in specified folders
		 * 
		 * @params {String} pathes to modules directory
		 * 
		 * @returns {Boolean} load success/load fails
		 */
		loadModules: function (dir,modules_dispatcher) {
			var modules = utils('fs').readdirSync(dir);
			
			modules.forEach(function(module){
				var path_to_module = dir+module+'/',
					descriptor = require(path_to_module+'descriptor.json'),
					module_name = descriptor.name;
				modules_dispatcher[module_name] = {
					descriptor : descriptor,
					name 	   : module_name,
					path 	   : path_to_module  					
				}
			});
			return true;
		},
		
		/**
		 * initialize modules looking by this.modules
		 * 
		 * @params {Object} dict of modules 
		 * @params {Object} dict of sandboxes
		 * 
		 * @returns {Boolean} init success/or fail
		 */
		initModules: function (modules,sandboxes) {
			var _val,_key,self = this;
			for (_key in modules) {
				_val = modules[_key];
				self.initModule(_key,_val,sandboxes);
			}
			return true;
		},
		
		/**
		 * Init specific module
		 * 
		 * @params {String} name of module to be inited
		 * @params {Object} params of module to be inited
		 * @params {Object} dict of sandboxes
		 * 
		 * @returns {Core}
		 */
		initModule: function (name,params,sandboxes) {
			var sandbox = new Sandbox(params),
				module = require(params.path+name);
			sandboxes[name] = sandbox;
			new module(sandbox);
			return this			
		},
		
		/**
		 * Destroy module
		 * 
		 * @params {String} name of module to be destroyed
		 * 
		 * @returns {Core}
		 */
		destroyModule: function (name) {
						
		},
		
		/**
		 * Get module localization
 		 * 
 		 * @param {String} name of module
 		 * 
 		 * @returns {Object} dict of lang pack
 		 */
		getLocale: function (name) {
			
		},
		
		/**
		 * Get module resources 
		 * 
 		 * @param {String} name of module
 		 * 
 		 * @returns {Object} dict of module settings
		 */
		getResource: function (name) {
			
		}
		
	};
	
	var CoreGlobals = {
		publish: 		bind(Events.publish, Events),
		subscribe:		bind(Events.subscribe, Events),
		unsubscribe: 	bind(Events.unsubscribe, Events),
		init:			bind(Core.init, Core),
		destroyModule:  bind(Core.destroyModule, Core),
		getLocales:		bind(Core.getLocale, Core),
		getResources:	bind(Core.getResource, Core)
	};
	
	return CoreGlobals;
};

exports = module.exports = Core;


