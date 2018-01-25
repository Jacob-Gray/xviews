# XView.js
XView.js is a lightweight in-place view and templating JS library. The main point of XView is to allow easy to use, extendable view rendering that doesn't require any preprocessing.

With XView you can dynamically render data into the DOM, while preserving the elements. For example, consider this HTML:

```html
<div class="view">
    <h1>Hello ${username}</h1>
</div>
```

XView allows you to render the variable `username` easily and effeciently:

```javascript
let view = new XView(".view");

view.render({
    username: "John"
});
```

Calling `view.set("username", "Jack")` will change the username variable to "Jack", and then rerender only the elements that use that variable, leaving everything else untouched.

The real power of XView comes in the functions, both the built in ones, and the ability to easily make your own custom ones. XView ships with some built in functions that accomplish common tasks, such as `foreach` or `show`, but it also provides a system to easily make your own functions. In fact, all of XViews' built in functions are made using the custom function system and API.

So how do functions work? Here's a brief example using `x-show`:
```html
<div class="view">
    <div x-show="showIt">I am shown!</div>
</div>
```
```javascript
let view = new XView(".view");

view.render({
    showIt: false
});
```

When the `showIt` variable is `true` the div will be shown. Otherwise, it's removed.

## Documentation

Coming soon