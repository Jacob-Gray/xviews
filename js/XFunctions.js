XElement.prototype.extend.foreach = function () {

	this.build = function (group, xel) {

		xel.noLink = true;


		var currentParent = xel.parent,
			forEachParent;

		while (currentParent) {
			if (currentParent.funcs.foreach) forEachParent = currentParent;
			currentParent = currentParent.parent;
		}

		if (forEachParent) this.forEachParent = forEachParent.funcs.foreach.fn;
		else {
			xel.useVar(group);
		}
	}

	this.render = function (group, xel) {

		var renderGroup = group;

		if (this.forEachParent) renderGroup = this.forEachParent.group;
		else this.group = group;

		var data = xel.data[group];

		if (!data || !data.length) {
			xel.XView.temporarilyRemoveElement(xel.el, renderGroup);
		} else {

			if (data.constructor !== Array) return console.warn("x-foreach expects an array @", xel.el);

			var parent = xel.el.parentNode,
				next = xel.el.nextSibling;

			data.forEach(function (d, i) {

				if (typeof d !== "object") d = {
					base: d
				};

				d.i = i;

				if (i > 0) {

					var copy = xel.copy({
						parent: xel.parent
					});

					delete copy.funcs.foreach;

					var el = copy.render(d);

					xel.XView.setTemporaryElement(el, renderGroup);

					parent.insertBefore(el, next);
				} else xel.data = d;
			}.bind(this));
		}
	}
};

XElement.prototype.extend.id = function () {
	this.build = function (group, xel) {

		xel.XView.ids = xel.XView.ids || {};

		xel.XView.ids[group] = xel;
	}
};

XElement.prototype.extend.html = function () {

	this.render = function (group, xel) {

		xel.el.innerHTML = group;
	}
};

XElement.prototype.extend.show = function () {

	this.build = function (group, xel) {

		if (group.substring(0, 1) == '!') {

			this.inverse = true;

			group = group.substring(1);
		}

		this.scope = group.split(/\.|\[|\]/g).filter(function (item) {
			return item.length;
		});

		xel.useVar(this.scope[0]);

		this.render(group, xel);
	}

	this.render = function (group, xel) {

		var data = xel.data;

		for (var i = 0; i < this.scope.length; i++) {
			if (data && data[this.scope[i]]) data = data[this.scope[i]];
			else {
				data = false;
				continue;
			}
		}

		data = data instanceof Function ? data.call(xel.data, xel) : data;

		if ((!data && !this.inverse) || (data && this.inverse && data.length)) xel.XView.temporarilyRemoveElement(xel.el, this.scope[0]);
	}
};

XElement.prototype.extend.value = function () {

	this.build = function (group, xel) {
		xel.useVar(group);

		xel.el.onchange = xel.el.onkeyup = function () {

			xel.XView.set(group, xel.el.value);
		}
	}

	this.render = function (group, xel) {

		xel.el.value = (xel.data[group] instanceof Function ? xel.data[group].call(xel.data, xel) : xel.data[group]) || "";
	}
};