(function(window){
  var utils = {};

  utils.extend = function(targetObj){
    var sourceObjs = [].slice.call(arguments, 1),
        i;

    sourceObjs.forEach(function(obj){
      for(i in obj){
        targetObj[i] = obj[i];
      }
    });

    return targetObj;
  };

  utils.emitter = {
    on: function(event, cb) {
      if(!this.callbacks) this.callbacks = {};
      if(!this.callbacks[event]){
        this.callbacks[event] = [];
      }

      this.callbacks[event].push(cb);
    },

    off: function(event){
      if(!this.callbacks) this.callbacks = {};
      delete this.callbacks[event] 
    },

    trigger: function(event){
      if(!this.callbacks) this.callbacks = {};
      var args;

      if(!this.callbacks[event]) return;

      args = [].slice.call(arguments, 1)
      args.unshift({event: event});

      this.callbacks[event].forEach(function(cb){
        cb.apply(this, args) 
      }.bind(this));
    }
  };

  window.utils = utils;
}(window));
