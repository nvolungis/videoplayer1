(function(utils, document, window){
  function MomentAnalyzerUI(duration, container, moments, options){
    this.duration  = duration;
    this.container = container; 
    this.options   = options;
    this.moments   = moments;

    this.addHeatmap();
    this.addStats();
  }

  utils.extend(MomentAnalyzerUI.prototype, {
    showThresholdExceeded: function(){
      this.container.querySelector('.' + this.options.prefix + '-stats-rewatched').className += ' exceeded';
    },

    updatePercentageWatched: function(percentWatched){
      var valueWatched = this.container.querySelector('.' + this.options.prefix + '-stats-watched-value');
      valueWatched.innerHTML = percentWatched.toFixed(2) + '%';
    },

    updatePercentageRewatched: function(percentRewatched){
      var valueRewatched = this.container.querySelector('.' + this.options.prefix + '-stats-rewatched-value');
      valueRewatched.innerHTML = percentRewatched.toFixed(2) + '%';
    },

    updateHeatmap: function(indexes, sum){
      var moment;

      indexes.forEach(function(moment_index){
        moment = sum[moment_index];
        moment.el.setAttribute('data-played', moment.plays);
      });
    },

    addHeatmap: function(){
      var heatmap     = document.createElement('div'),
          elBase      = document.createElement('div'),
          currentLeft = 0;

      elBase.className  += this.options.prefix + '-heatmap-moment';
      heatmap.className += this.options.prefix + '-heatmap';

      this.moments.forEach(function(moment){
        var el = elBase.cloneNode(),
        width = ((moment.end - moment.start) / this.duration) * 100;

        this.moments[moment.index].el = el;

        el.style.width = width + '%';
        el.style.left = currentLeft + '%';
        el.setAttribute('data-index', moment.index);

        currentLeft += width;
        heatmap.appendChild(el);
      }.bind(this));

      this.container.appendChild(heatmap);
    },

    addStats: function(){
      var stats = document.createElement('div'),
          label = document.createElement('span'),
          value = document.createElement('span');

      ['watched', 'rewatched'].forEach(function(item){
        var statsclone = stats.cloneNode(),
            labelclone = label.cloneNode(),
            valueclone = value.cloneNode();

        statsclone.className += this.options.prefix + '-stats ' + this.options.prefix + '-stats-'+ item;
        labelclone.className += this.options.prefix + '-stats-' + this.options.prefix + '-' + item + '-label';
        labelclone.innerHTML = 'Percentage ' + item + ': ';

        valueclone.className += this.options.prefix + '-stats-' + item + '-value';
        valueclone.innerHTML = '0.00%';

        statsclone.appendChild(labelclone);
        statsclone.appendChild(valueclone);

        this.container.appendChild(statsclone);
      }.bind(this));
    },

  });

  window.MomentAnalyzerUI = MomentAnalyzerUI;

}(utils, document, window));
