XElement.prototype.extend.foreach = function () {

	this.build = function (group, xel) {

		xel.noLink = true;

		xel.useVar(group);
	}

	this.render = function (group, xel) {

		var data;

		if (group.length) data = xel.data[group];
		else data = xel.data;

		if (!data || !data.length) {
			xel.view.temporarilyRemoveElement(xel.el, group);
		} else {

			if (data.constructor !== Array) return console.warn("x-foreach expects an array @", xel.el);

			var parent = xel.el.parentNode,
				next = xel.el.nextSibling;

			data.forEach(function (d, i) {

				if (i > 0) {

					var copy = xel.copy({
						parent: xel.parent
					});

					delete copy.funcs.foreach;

					var el = copy.render(d);

					xel.view.setTemporaryElement(el, group);

					parent.insertBefore(el, next);
				} else xel.data = d;
			});
		}
	}
};

XElement.prototype.extend.id = function () {
	this.build = function (group, xel) {

		xel.view.ids = xel.view.ids || {};

		xel.view.ids[group] = xel;
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

		if ((!data && !this.inverse) || (data && this.inverse && data.length)) xel.view.temporarilyRemoveElement(xel.el, this.scope[0]);
	}
};




XElement.prototype.extend.value = function () {

	this.build = function (group, xel) {
		xel.useVar(group);

		xel.el.onchange = xel.el.onkeyup = function () {

			xel.view.set(group, xel.el.value);
		}
	}

	this.render = function (group, xel) {

		xel.el.value = (xel.data[group] instanceof Function ? xel.data[group].call(xel.data, xel) : xel.data[group]) || "";
	}
};