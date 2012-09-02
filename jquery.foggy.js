(function( $ ){

  $.fn.foggy = function( options ) {

    var settings = $.extend( {
      'opacity': 0.5,
      'blurRadius' : 2,
      'quality': 16
    }, options);

    var BlurPass = function(content, position, offset, opacity){
      this.content = content;
      this.position = position;
      this.offset = offset;
      this.opacity = opacity;
    };

    BlurPass.prototype.render = function(target){
      $('<div/>', { html: this.content }).css({
        position: this.position,
        opacity: this.opacity,
        top: this.offset[0],
        left: this.offset[1]
      }).appendTo(target);
    };

    var Circle = function(radius){
      this.radius = radius;
    };

    Circle.prototype.includes = function(x,y){
      if (Math.pow(x,2) + Math.pow(y,2) <= Math.pow(this.radius, 2)){
        return true;
      } else {
        return false;
      }
    };

    Circle.prototype.points = function(){
      var results = [];
      for (var x = -this.radius; x<=this.radius; x++){
        for (var y = -this.radius; y<=this.radius; y++){
          if (this.includes(x,y)){
            results.push([x,y]);
          }
        }
      }
      return results;
    };

    return this.each(function(index, element) {

      var content = $(element).html();

      $(element).html('');

      var wrapper = $('<div/>', {
      }).css({
        position: 'relative'
      });

      var all_offsets = $.grep(
        new Circle(settings.blurRadius).points(),
        function(element){ return (element[0] != 0) || (element[1] != 0) }
      );

      if (all_offsets.length <= settings.quality){
        offsets = all_offsets;
      } else {
        var overhead = all_offsets.length - settings.quality;
        var targets = [];
        for (var i = 0; i < overhead; i++){
          targets.push(Math.round(i * (all_offsets.length / overhead)));
        }
        offsets = $.grep( all_offsets, function(element, index){
          if (targets.indexOf(index) >= 0){
            return false;
          } else {
            return true;
          }
        });
      }

      var opacity = (settings.opacity * 2) / (offsets.length + 1);

      new BlurPass(content, 'relative', [0,0], opacity).render(wrapper);

      $(offsets).each(function(index, offset){
        new BlurPass(content, 'absolute', offset, opacity).render(wrapper);
      });

      wrapper.appendTo(element);

    });
  };

})( jQuery );
