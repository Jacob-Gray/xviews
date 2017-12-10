function XView(el) {

	var self = this;

	this.el = el instanceof Element ? el : document.querySelector(el);

	this.data = {};
	this._prevData = {};

	this.watching = {};

	this.usesVars = {};

	this.tempEls = {
		add: {},
		remove: {}
	};

	this._renderVersion = 0;

	this.build();
}

XView.prototype.find = function (selector) {

	var output = [],
		res = this.el.querySelector(selector);

	return res.XElement;
};

XView.prototype.render = function (data) {

	this.data = data || this.data;

	function areEqual(a, b) {

		if (typeof a != "object" || typeof b != "object") return a === b;

		for (var key in a)
			if (!areEqual(a[key], b[key])) return false;
		for (var key in b)
			if (!areEqual(a[key], b[key])) return false;

		return true;
	}

	var changedData = [];

	for (var item in this.data)
		if (!areEqual(this.data[item], this._prevData[item])) changedData.push(item);

	for (var item in this._prevData)
		if (!areEqual(this.data[item], this._prevData[item]) && changedData.indexOf(item) < 0) changedData.push(item);

	changedData.forEach(this.renderVariable.bind(this));

	this._renderVersion++;
}

XView.prototype.renderVariable = function (item) {

	if (this.tempEls.add[item]) {

		this.tempEls.add[item].forEach(function (el) {

			if (el.parentNode || el.oldParent)(el.parentNode || el.oldParent).removeChild(el);
		});

		this.tempEls.add[item] = [];
	}

	if (this.tempEls.remove[item]) {

		this.tempEls.remove[item].forEach(function (pair) {
			(pair.sibling.parentNode || pair.sibling.oldParent).insertBefore(pair.el, pair.sibling);
		});

		this.tempEls.remove[item] = [];
	}

	if (this.usesVars[item]) this.usesVars[item].forEach(function (xel) {

		if (this._renderVersion > xel._renderVersion) {

			xel._renderVersion = this._renderVersion;

			xel.render(this.data);
		}
	}.bind(this));
}

XView.prototype.build = function () {

	this._structure = new XElement({
		XView: this,
		el: this.el
	});
}

XView.prototype.set = function (key, value) {

	function cloneItem(obj) {
		if (typeof obj !== "object" || Array.isArray(obj)) return obj;

		var output = {};

		for (var key in obj) {
			output[key] = cloneItem(obj[key]);
		}
		return output;
	}

	this._prevData = this.data;

	this.data = cloneItem(this.data);

	this.data[key] = value;

	this.usesVars[key] = this.usesVars[key] || [];

	this.renderVariable(key);
	this._renderVersion++;

	if (this.watching[key]) this.watching[key].forEach(function (fn) {
		fn();
	}.bind(this));
}

XView.prototype.setTemporaryElement = function (el, variable) {

	this.tempEls.add[variable] = this.tempEls.add[variable] || [];

	if (this.tempEls.add[variable].indexOf(el) < 0) this.tempEls.add[variable].push(el);
}

XView.prototype.temporarilyRemoveElement = function (el, variable) {

	if (el.XElement && el.XElement.hide instanceof Function) el.XElement.hide(el.XElement);
	else {

		this.tempEls.remove[variable] = this.tempEls.remove[variable] || [];

		if (this.tempEls.remove[variable].indexOf(el) < 0) this.tempEls.remove[variable].push({
			el: el,
			sibling: el.nextSibling
		});

		el.oldParent = el.parentNode;

		el.parentNode.removeChild(el);
	}
}

XView.prototype.watch = function (variable, fn) {

	this.watching[variable] = this.watching[variable] || [];

	if (this.watching[variable].indexOf(fn) < 0) this.watching[variable].push(fn.bind(this));
}