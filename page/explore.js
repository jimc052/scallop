const Window = require('./window');

function Explore(props) {
  Window.call(this, props);
}
Explore.prototype = Object.create(Window.prototype); // 原型繼承*****
Explore.prototype.constructor = Explore;

module.exports = new Explore({name: "explore"});
