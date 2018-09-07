/**
 * HiDPI Canvas Polyfill (1.0.10)
 *
 * Author: Jonathan D. Johnson (http://jondavidjohn.com)
 * Homepage: https://github.com/jondavidjohn/hidpi-canvas-polyfill
 * Issue Tracker: https://github.com/jondavidjohn/hidpi-canvas-polyfill/issues
 * License: Apache-2.0
*/
(function(prototype) {

	// var pixelRatio = (function() {
	// 		var canvas = document.createElement('canvas'),
	// 				context = canvas.getContext('2d'),
	// 				backingStore = context.backingStorePixelRatio ||
	// 					context.webkitBackingStorePixelRatio ||
	// 					context.mozBackingStorePixelRatio ||
	// 					context.msBackingStorePixelRatio ||
	// 					context.oBackingStorePixelRatio ||
	// 					context.backingStorePixelRatio || 1;
	// 		return (window.devicePixelRatio || 1) / backingStore;
	// 	})(),

    var pixelRatio =window.devicePixelRatio,

		forEach = function(obj, func) {
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					func(obj[p], p);
				}
			}
		},

		ratioArgs = {
			'fillRect': 'all',
			'clearRect': 'all',
			'strokeRect': 'all',
			'moveTo': 'all',
			'lineTo': 'all',
			'arc': [0,1,2],
			'arcTo': 'all',
			'bezierCurveTo': 'all',
			'isPointinPath': 'all',
			'isPointinStroke': 'all',
			'quadraticCurveTo': 'all',
			'rect': 'all',
			'translate': 'all',
			'createRadialGradient': 'all',
			'createLinearGradient': 'all',
            'getImageData':'all'
		};
	if (pixelRatio === 1 || pixelRatio <1) return;

	forEach(ratioArgs, function(value, key) {
		prototype[key] = (function(_super) {
			return function() {
				if(!this.isQuality){
					return _super.apply(this, arguments);
				}
				
				var i, len,
					args = Array.prototype.slice.call(arguments);

				if (value === 'all') {
					args = args.map(function(a) {
						return a * pixelRatio;
					});
				}
				else if (Array.isArray(value)) {
					for (i = 0, len = value.length; i < len; i++) {
						args[value[i]] *= pixelRatio;
					}
				}

				return _super.apply(this, args);
			};
		})(prototype[key]);
	});

	 // Stroke lineWidth adjustment
	prototype.stroke = (function(_super) {
		return function() {
			if(!this.isQuality){
					return _super.apply(this, arguments);
			}
			
			this.lineWidth *= pixelRatio;
			_super.apply(this, arguments);
			this.lineWidth /= pixelRatio;
		};
	})(prototype.stroke);

	// Text
	//
	prototype.fillText = (function(_super) {
		return function() {
			if(!this.isQuality){
					return _super.apply(this, arguments);
			}
			
			var args = Array.prototype.slice.call(arguments);
			args[1] *= pixelRatio; // x
			args[2] *= pixelRatio; // y

			this.font = this.font.replace(
				/(\d+\.?\d*)(px|em|rem|pt)/g,
				function(w, m, u) {
					if(m < 12){
						m = 12;
					}else{
						m = Math.round(m);
					}
					return (m * pixelRatio) + u;
				}
			);

			_super.apply(this, args);

			this.font = this.font.replace(
				/(\d+\.?\d*)(px|em|rem|pt)/g,
				function(w, m, u) {
					return (m / pixelRatio) + u;
				}
			);
		};
	})(prototype.fillText);

	prototype.strokeText = (function(_super) {
		return function() {
			if(!this.isQuality){
					return _super.apply(this, arguments);
			}
			
			var args = Array.prototype.slice.call(arguments);

			args[1] *= pixelRatio; // x
			args[2] *= pixelRatio; // y

			this.font = this.font.replace(
				/(\d+\.?\d*)(px|em|rem|pt)/g,
				function(w, m, u) {
                    if(m < 12){
                        m = 12;
                    }else{
                        m = Math.round(m);
                    }
					return (m * pixelRatio) + u;
				}
			);

			_super.apply(this, args);

			this.font = this.font.replace(
				/(\d+\.?\d*)(px|em|rem|pt)/g,
				function(w, m, u) {
					return (m / pixelRatio) + u;
				}
			);
		};
	})(prototype.strokeText);

    prototype.drawImage = (function(_super) {
        return function() {
        	if(!this.isQuality){
					return _super.apply(this, arguments);
			}
        	
            var args = Array.prototype.slice.call(arguments);
            args[1] *= pixelRatio; // x
            args[2] *= pixelRatio; // y
            args[3] *= pixelRatio; // width
            args[4] *= pixelRatio; // height
            _super.apply(this, args);
        };
    })(prototype.drawImage);

    prototype.clearRect = (function(_super) {
        return function() {
        	if(!this.isQuality){
					return _super.apply(this, arguments);
			}
        	
            var args = Array.prototype.slice.call(arguments);
            args[2] *= pixelRatio; // width
            args[3] *= pixelRatio; // height
            _super.apply(this, args);  
        };
    })(prototype.clearRect);

})(CanvasRenderingContext2D.prototype);
;(function(prototype) {
	prototype.getContext = (function(_super) {
		return function(type,option) {
			var backingStore, ratio,
				context = _super.call(this, type);
			context.isQuality = false;
			if(option){
				context.isQuality = option.isQuality;
			}
			
			if (type === '2d' && context.isQuality == true) {

				// backingStore = context.backingStorePixelRatio ||
				// 			context.webkitBackingStorePixelRatio || 
				// 			context.mozBackingStorePixelRatio ||
				// 			context.msBackingStorePixelRatio ||
				// 			context.oBackingStorePixelRatio ||
				// 			context.backingStorePixelRatio || 1;
                //
				// ratio = (window.devicePixelRatio || 1) / backingStore;

                ratio = window.devicePixelRatio;
				if (ratio > 1) {
					this.style.height = this.height + 'px';
					this.style.width = this.width + 'px';
					this.width *= ratio;
					this.height *= ratio;
				}
			}

			return context;
		};
	})(prototype.getContext);
})(HTMLCanvasElement.prototype);
