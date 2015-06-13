

/* utils
 *
 * A collection of some methods that I utilize throughout the other
 * modules. 
 *
 */


(function(window){
  var utils = {};

  /* extend
   *
   * Accepts n number of objects and copies their
   * properties on the first object passed in
   *
   */


  utils.extend = function(targetObj){
    if(!targetObj) return {};

    var sourceObjs = [].slice.call(arguments, 1),
        i;

    sourceObjs.forEach(function(obj){
      for(i in obj){
        targetObj[i] = obj[i];
      }
    });

    return targetObj;
  };

  /* emitter
   *
   * A collection of methods that adds the ability for 
   * any object to send and receive events. Mix it in
   * using utils.extend(target, utils.emitter)
   *
   */

  utils.emitter = {
    on: function(event, cb) {
      if(!this._callbacks) this._callbacks = {};
      if(!this._callbacks[event]){
        this._callbacks[event] = [];
      }

      this._callbacks[event].push(cb);
    },

    off: function(event){
      if(!this._callbacks) this._callbacks = {};
      delete this._callbacks[event] 
    },

    trigger: function(event){
      if(!this._callbacks) this._callbacks = {};
      var args;

      if(!this._callbacks[event]) return;

      args = [].slice.call(arguments, 1)
      args.unshift({event: event});

      this._callbacks[event].forEach(function(cb){
        cb.apply(this, args) 
      }.bind(this));
    }
  };

  window.utils = utils;
}(window));
