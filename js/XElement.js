function XElement(options) {

	/**
	 * Default values for required properties
	 */
	this.attrs = {};
	this.children = [];
	this.events = {};
	this.funcs = {};
	this.tempAttrs = [];
	this.vars = [];
	this.funcData = {};
	this._renderVersion = -1;

	/**
	 * Make sure that the view is set if it's going to try and build
	 */
	if (options.el && !options.view && !this.noBuild) throw new Error("XElement requires a view to be set if it's going to attempt to build");

	/**
	 * Loop through the options and add the key value pairs to the XElement
	 */
	for (var prop in options) {
		this[prop] = options[prop];
	}

	/**
	 * Copy over values from the parent
	 */
	if (this.parent) {
		this.noLink = this.parent.noLink;
	}

	/**
	 * Check that this element should build
	 */
	if (this.el || this.noBuild) this.build();
}

/**
 * Take a template generated by variablePosition, fill with data, and return the rendered data string.
 * @param {Object} template A template as generated by variablePosition
 * @param {Object} data Object holding data to render
 */
XElement.prototype.renderString = function (template, data) {

	return template.render.map(function (i) {

		if (typeof i === "number") {

			if (data && data[template.vars[i]]) {

				var variable = data[template.vars[i]];

				if (variable instanceof Function) return variable.call(data, this);

				return data[template.vars[i]];
			}

			return "";
		}

		return i;

	}).join("");
}

XElement.prototype.build = function () {

	this.el.XElement = this;

	/**
	 * Search attributes for the current element
	 */

	var linking = [];

	for (var i = 0; i < this.el.attributes.length; i++) {

		var attr = this.el.attributes[i],
			res = this.variablePosition(attr.value);

		linking.push(res);

		/**
		 * Find functions that need to be run
		 */

		if (attr.name.indexOf("x-") === 0) {

			var funcname = attr.name.substr(2);

			if (!this.extend[funcname]) console.warn("x-" + funcname + " is not a valid function @", this.el);
			else this.funcs[funcname] = {
				group: res,
				fn: new this.extend[funcname]
			};

			this.el.removeAttribute(attr.name);
			i--
		} else if (res.vars.length) this.attrs[attr.name] = res;
	}

	this.runFuncs("build");

	Array.prototype.forEach.call(this.el.childNodes, function (node) {

		if (!(node instanceof Text)) {

			var child = new XElement({
				view: this.view,
				el: node,
				parent: this
			});

			child.index = this.children.length;

			return this.children.push(child);
		}

		var res = this.variablePosition(node.nodeValue);

		linking.push(res);

		node.XElement = {
			el: node,
			render: res
		};

		if (res.vars) this.children.push(node.XElement);
	}.bind(this));

	if (!this.noLink) linking.forEach(function (template) {

		template.vars.forEach(function (varName) {
			if (this.vars.indexOf(varName) < 0) {

				this.vars.push(varName);

				if (this.view) {

					this.view.usesVars[varName] = this.view.usesVars[varName] || [];

					this.view.usesVars[varName].push(this);
				}
			}

			if (this.parent && this.parent.vars.indexOf(varName) < 0) this.parent.vars.push(varName);
		}.bind(this))
	}.bind(this));
}

XElement.prototype.variablePosition = function (str) {

	var varMatch = /\${([^}]*)}/g,
		output = {
			vars: [],
			render: [str]
		};

	str.replace(varMatch, function (m, varName) {

		var i = output.vars.indexOf(varName),
			last = output.render[output.render.length - 1];

		if (i < 0) i = output.vars.push(varName) - 1;

		last = last.split("${" + varName + "}");
		last.splice(1, 0, i);

		output.render.splice(-1, 1);

		output.render = output.render.concat(last);
	}.bind(this));

	return output;
}

XElement.prototype.runFuncs = function (state) {

	for (var func in this.funcs) {

		var group = this.renderString(this.funcs[func].group, this.data);

		if (this.funcs[func].fn[state]) this.funcs[func].fn[state](group, this);
	}
};

XElement.prototype.render = function (data) {

	this.data = data || this.data;

	if (!this.data) {

		var current = this.parent;

		while (!this.data && current) {
			this.data = current.data;
			current = current.parent;
		}
	}

	if (this.parent) this.runFuncs("render");

	this.tempAttrs.forEach(function (attr) {
		this.el.removeAttribute(attr);
	}.bind(this));

	for (var attr in this.attrs) {

		this.el.setAttribute(attr, this.renderString(this.attrs[attr], this.data));
	}

	for (var event in this.events) {

		this.events[event].forEach(function (fn) {
			this.el.addEventListener(event, fn);
		}.bind(this));
	}

	var i = 0;

	this.children.forEach(function (child) {

		if ((child instanceof XElement) && this.noLink) child.render(this.data);
		else if (child.el instanceof Text) child.el.nodeValue = this.renderString(child.render, this.data);
	}.bind(this));

	return this.el;
}

XElement.prototype.useVar = function (varName) {

	if (this.vars.indexOf(varName) < 0) {

		this.vars.push(varName);

		this.view.usesVars[varName] = this.view.usesVars[varName] || [];

		if (this.view && this.view.usesVars[varName].indexOf(this) < 0) {

			this.view.usesVars[varName].push(this);
		}
	}
	if (this.parent && this.parent.vars.indexOf(varName) < 0) this.parent.vars.push(varName);
};

XElement.prototype.tempAttr = function (attr, value) {

	this.el.setAttribute(attr, value);

	if (this.tempAttrs.indexOf(attr) < 0) this.tempAttrs.push(attr);
};


XElement.prototype.cloneableProperties = ["index", "attrs", "funcs", "events", "tempAttrs", "noLink"];
XElement.prototype.copy = function (options) {

	function cloneItem(obj) {
		if (typeof obj !== "object" || Array.isArray(obj)) return obj;

		var output = {};

		for (var key in obj) {
			output[key] = cloneItem(obj[key]);
		}
		return output;
	}

	var defaults = {
		view: this.view,
		el: this.el.cloneNode(),
		noBuild: true
	};

	for (var prop in options) {
		defaults[prop] = options[prop];
	}

	var copy = new XElement(defaults);

	copy.parent = parent;

	this.cloneableProperties.forEach(function (item) {

		copy[item] = cloneItem(this[item]);
	}.bind(this));

	Array.prototype.forEach.call(this.el.childNodes, function (child) {
		if (!child.XElement) copy.appendChild(child);
		else {

			child = child.XElement;

			var cpy;

			if (child instanceof XElement) {
				cpy = child.copy({
					parent: copy
				});
			} else {
				cpy = {
					el: child.el.cloneNode(),
					render: child.render
				}
			}

			copy.el.appendChild(cpy.el);

			copy.children.push(cpy);
		}
	});

	return copy;
};

XElement.prototype.extend = {};