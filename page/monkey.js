const Window = require('./window');

function Monkey(props) {
  Window.call(this, props);
}
Monkey.prototype = Object.create(Window.prototype); // 原型繼承*****
Monkey.prototype.constructor = Monkey;

module.exports = new Monkey({name: "monkey"});

