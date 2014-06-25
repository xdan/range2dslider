!function($){
	var defaultOptions = {
		axis:[[0,10],[0,10]],
		value:[[0,0],[5,5]],
		showRanges:[[0,1]],
		
		className:'range2dslider',
		style:'',
		
		height:'100px',
		width:'auto',
		x:'left',
		y:'bottom',
		
		grid:true,
		
		round:false,
		roundMethod:Math.round,
		
		showLegend:[true,true],
		recalcLegends:false,
		
		tooltip:['top'], // false, 'top','left','right','bottom'
		alwaysShowTooltip:[true], // false,true - work only with tooltip<>false
		
		onlyGridPoint:false,
		gridStep:false,
		
		outOfRange:true,
		
		allowAxisMove:['both'], // 'x','y','both'
		
		printValue:function(value){
			return value[0].toFixed(2)+'-'+value[1].toFixed(2)
		},
	};
	
	Boolean.prototype.xd = Function.prototype.xd = Number.prototype.xd = String.prototype.xd = Array.prototype.xd = function( i,defaultValue ){
		if( !(this instanceof Array) )
			return this;
		else{
			if( typeof(this[i])!='undefined' ){
				return this[i];
			}else{
				return typeof(this[0])!='undefined'?
						this[0]:(	
							typeof(defaultValue)!='undefined'?
								defaultValue:
								null	
						);
			}
		}
	};
	
	function parseValue(str){
		var s = str.split(';'),i,value=[], prs = [];
		for(i =0;i<s.length;i++){
			prs = s[i].split('|');
			prs[0] = parseFloat(prs[0]);
			prs[1] = parseFloat(prs[1]);
			value.push(prs);
		}
		return value;
	}
	
	function stringifyValue( value ){
		var s = [],i;
		for(i =0;i<value.length;i++){
			if( $.isArray(value[i]) ){
				s.push(value[i].join('|'));
			}else{
				s.push(value.join('|'));
				break;
			}		
		}			
		return s.join(';');
	}
	
	function init(_this){
		var $input = $(_this),i;
			
		if( $input.hasClass('xdsoft') )
			return;
			
		$input.addClass('xdsoft');
		
		$input.hide();
		
		
		_this.sliderActive = 0;
		_this.$range2DSlider = $('<div '+( _this.options.style?'style="'+_this.options.style+'"':'')+' class="xdsoft_range2dslider '+_this.options.className+'"></div>');
		_this.$sliderBox = $('<div class="xdsoft_range2dslider_box xdsoft_range2dslider_box_'+_this.options.x+' xdsoft_range2dslider_box_'+_this.options.y+'"></div>'),
		_this.$sliders = [];
		_this.$ranges = [];
		
		_this.$range2DSlider.on('xchange.xdsoft',function(){
			$input
				.attr('value',stringifyValue(_this.values))
				.val(stringifyValue(_this.values))
				.trigger('change');
		});	
		
		_this.$sliderBox.on('mousedown.xdsoft', function( e ){
			var x = e.offsetX==undefined?e.layerX:e.offsetX,
				y = e.offsetY==undefined?e.layerY:e.offsetY;
			$('html').addClass('xdsoft_noselect');
			_this.getValue(_this.sliderActive,_this.options.x=='left'?x:_this.limitX-x,_this.options.y=='top'?y:_this.limitY-y);
			if( !_this.options.onlyGridPoint ){
				_this.setValue( _this.sliderActive, _this.values[_this.sliderActive][0],_this.values[_this.sliderActive][1] );
			}
		});
		
		if( _this.options.tooltip.xd(0) ){
			_this.$range2DSlider.on('xchange.xdsoft',function(){
				for(i=0;i<_this.values.length;i++){
					_this.$sliders[i][0]&&
						_this.$sliders[i][0].span&&
							_this.$sliders[i][0].span.html(_this.options.printValue.xd(i).call(_this.$sliders[i][0].span,_this.values[i]));
				}
			});
		}
		
		$(window).on('resize.xdsoft',function(){
			setTimeout(function(){
				_this.limitX 		= 	parseInt(_this.$sliderBox[0].clientWidth);
				_this.limitY	 	=  	parseInt(_this.$sliderBox[0].clientHeight);
				_this.grid();
				for(i=0;i<_this.values.length;i++)
					_this.setValue(i,_this.values[i][0],_this.values[i][1]);
			},100);
		});
		
		_this.roundValue = function(_val){
			if( _this.options.round ){
				return [_this.options.roundMethod(_val[0]),_this.options.roundMethod(_val[1])];
			}
			return _val;
		};
			
		_this.setValue = function ( sliderId,relX,relY ){
			if( !_this.options.outOfRange ){
				if( relX<_this.options.axis[0][0] ){
					relX = _this.options.axis[0][0];
				}else if( relX>_this.options.axis[0][_this.options.axis[0].length-1] ){
					relX = _this.options.axis[0][_this.options.axis[0].length-1];
				}
				if( relY<_this.options.axis[1][0] ){
					relY = _this.options.axis[1][0];
				}else if( relY>_this.options.axis[1][_this.options.axis[1].length-1] ){
					relY = _this.options.axis[1][_this.options.axis[1].length-1];
				}
			}
			var posX = ((relX-_this.options.axis[0][0])/(_this.options.axis[0][_this.options.axis[0].length-1]-_this.options.axis[0][0]))*_this.limitX,
				posY = ((relY-_this.options.axis[1][0])/(_this.options.axis[1][_this.options.axis[1].length-1]-_this.options.axis[1][0]))*_this.limitY;
			
			
			
			_this.$sliders[sliderId][0].style[_this.options.x] = Math.round(posX)+'px';
			_this.$sliders[sliderId][0].style[_this.options.y] = Math.round(posY)+'px';
			
			_this.values[sliderId] = $.extend(true,_this.values[sliderId],_this.roundValue([relX,relY]));
			
			_this.$range2DSlider.trigger('xchange.xdsoft');
		};
		
		_this.getValue = function(sliderId, x,y ){
			var allowAxis = _this.options.allowAxisMove.xd(sliderId,'both');
			_this.values[sliderId] = $.extend(true,_this.values[sliderId],_this.roundValue([
				(allowAxis=='x'||allowAxis=='both')?(_this.limitX?(parseInt(x)/_this.limitX)*(_this.options.axis[0][_this.options.axis[0].length-1]-_this.options.axis[0][0])+_this.options.axis[0][0]:0):_this.values[sliderId][0],
				(allowAxis=='y'||allowAxis=='both')?(_this.limitY?(parseInt(y)/_this.limitY)*(_this.options.axis[1][_this.options.axis[1].length-1]-_this.options.axis[1][0])+_this.options.axis[1][0]:0):_this.values[sliderId][1]
			]));
			if( _this.options.onlyGridPoint ){
				_this.setValue( sliderId,_this.values[sliderId][0],_this.values[sliderId][1] )
			}else{
				_this.$range2DSlider.trigger('xchange.xdsoft');
			}
			return _this.values;
		}
		
		_this.grid = function(){
			if( _this.options.grid ){
				_this.$sliderBox.addClass('xdsoft_grid');
				var gridSize = 
					!_this.options.gridStep?[
						Math.round(_this.limitX/(_this.options.axis[0][_this.options.axis[0].length-1]-_this.options.axis[0][0])),
						Math.round(_this.limitY/(_this.options.axis[1][_this.options.axis[1].length-1]-_this.options.axis[1][0]))
					]:$.extend(true,[],_this.options.gridStep);
				
				_this.$sliderBox.css({
					'background-size':gridSize[0]+'px '+gridSize[1]+'px',
					'background-position':_this.options.x+' '+_this.options.y,
				});
			}else{
				_this.$sliderBox.removeClass('xdsoft_grid');
			}
		};
	
		_this.$range2DSlider.append(_this.$sliderBox);
		$input.after(_this.$range2DSlider);
	}
	
	$.fn.xdSoftDraggable = function( _options ){
		var options = $.extend(true,{},{
			x:'left',
			y:'bottom',
			allowAxisMove:'both', // 'x','y','both'
			onMove:function(){},
		},_options);
		
		return this.each(function(){
			var _this = this,
				$this = $(_this),
				drag = false, 
				oldX, 
				oldY,
				newX, 
				newY, 
				oldTop, 
				oldLeft,
				limitX,
				limitY;
				
			$this
				.off('mousedown.xdSoftDraggable')
				.on('mousedown.xdSoftDraggable',function( event ){
					drag 		= 	true;
					oldX 		= 	event.clientX;
					oldY 		= 	event.clientY;
					newX 		= 	oldLeft 	= 	(!isNaN(parseInt(_this.style[options.x]))&&parseInt(_this.style[options.x]))?parseInt(_this.style[options.x]):0;
					newY 		= 	oldTop		= 	(!isNaN(parseInt(_this.style[options.y]))&&parseInt(_this.style[options.y]))?parseInt(_this.style[options.y]):0;
					limitX 		= 	$this.parent()[0].clientWidth;
					limitY	 	=  	$this.parent()[0].clientHeight;
					$('html').addClass('xdsoft_noselect');
					event.stopPropagation();
				});
				
			if( _this.xdSoftDraggableMove )
				$(window)
					.off('mousemove.xdSoftDraggable',_this.xdSoftDraggableMove)
					.off('mouseup.xdSoftDraggable',_this.xdSoftDraggableMouseup);
					
			$(window)	
				.on('mousemove.xdSoftDraggable',_this.xdSoftDraggableMove = function( event ){
					if( drag ){
						if( options.allowAxisMove=='both' || options.allowAxisMove=='x'){
							newX = oldLeft+(options.x=='right'?-1:1)*(event.clientX-oldX);
							if( newX < 0 ) 
								newX = 0;
							if( newX > limitX ) 
								newX = limitX;
						}
						if( options.allowAxisMove=='both' || options.allowAxisMove=='y'){
							newY = oldTop+(options.y=='bottom'?-1:1)*(event.clientY-oldY);
							if( newY < 0 ) 
								newY = 0;
							if( newY > limitY ) 
								newY = limitY;
						}
						
	
						_this.style[options.x] = newX + 'px';
						_this.style[options.y] = newY+'px';
						
						if( options.onMove&&$.isFunction(options.onMove) ){
							options.onMove.call(_this,newX,newY);
						}
					}
				})
				.on('mouseup.xdSoftDraggable',_this.xdSoftDraggableMouseup = function( event ){
					drag = false;
					$('html').removeClass('xdsoft_noselect');
				});
		});
	};
	$.fn.range2dslider = $.fn.range2DSlider = function(_options){
	
		
		
		this.val = function( value ){
			if( typeof(value) == 'undefined' )
				return parseValue(this.attr('value'));
			else{
				this.attr('value',stringifyValue(value));
				this.range2dslider();
			}
		};
		
		return this.each(function(){
			var _this = this,
				i,j,
				$input = $(_this),
				options = $.extend(true,{},$.fn.range2DSlider.defaultOptions,_options);
			
			_this.values = $.extend(true,[],[],options.value);
			
			if( (!_options||!_options.axis)&&!_this.options ){
				if( $input.data('minx')){
					options.axis[0] = [];
					options.axis[0].push(parseFloat($input.data('minx')));
					if( $input.data('middlex') )
						options.axis[0].push(parseFloat($input.data('middlex')));
					options.axis[0].push(parseFloat($input.data('maxx')));
					options.axis[1] = [];
					options.axis[1].push(parseFloat($input.data('miny')));
					if( $input.data('middley') )
						options.axis[1].push(parseFloat($input.data('middley')));
					options.axis[1].push(parseFloat($input.data('maxy')));
				}
			}

			if( !_options||!_options.value ){
				if( $input.attr('value')){
					_this.values = parseValue($input.attr('value'));
				}
			}else{
				$input.attr('value',stringifyValue(_this.values))
			}
			
			
			if( !$.isArray(_this.values[0]) )
				_this.values = [_this.values]
			
			if( _this.options )
				_this.options = $.extend(true,{},_this.options,_options);
			else 
				_this.options = $.extend(true,{},{},options);
			
			if( !_this.options.axis )
				_this.options.axis = [];
			if( !_this.options.axis[0] )
				_this.options.axis[0] = [0,1];
			if( !_this.options.axis[1] )
				_this.options.axis[1] = [0,1];
				
			init(_this);
			var $slider;
			for(i=0;i<_this.values.length;i++){
				if( !_this.$sliders[i] ){
					_this.$sliders.push($slider = $('<div class="xdsoft_range2dslider_slider xdsoft_range2dslider_slider'+i+'"></div>'));
					$slider[0].ranges = [];
				}
			}
			
			// for second init remove extra sliders
			for(i=_this.values.length;i<_this.$sliders.length;i++){
				_this.$sliders[i].remove();
			}
			_this.$sliders.length = _this.values.length;
			
			if( _this.options.showRanges&&$.isArray(_this.options.showRanges)&&_this.options.showRanges.length ){
				var range,$range ;
				for(i=0;i< _this.options.showRanges.length;i++){
					range = _this.options.showRanges[i];
					if( _this.$sliders[range.xd(0)] && _this.$sliders[range.xd(1)] ){
						_this.$ranges.push($range=$('<div class="xdsoft_range2dslider_range xdsoft_range2dslider_range'+i+'"></div>'));					
						_this.$sliders[range.xd(0)][0].ranges.push({rng:$range,chnk:_this.$sliders[range.xd(1)][0]});
						_this.$sliders[range.xd(1)][0].ranges.push({rng:$range,chnk:_this.$sliders[range.xd(0)][0]});
					}
				}
			}
			
			for(i=0;i<_this.values.length;i++)
				!function(i){
					var $span,spanpos;
					
					spanpos = _this.options.tooltip.xd(i,'top');
					if( spanpos ){
						if(!_this.$sliders[i][0].span){
							$span = $('<span class="xdsoft_slider_label  xdsoft_slider_label_'+spanpos+' xdsoft_slider_label_'+(_this.options.alwaysShowTooltip.xd(i)?'visible':'hidden')+'" >'+_this.options.printValue.xd(i).call($span,_this.values[i])+'</span>');
							_this.$sliders[i].append($span);
							_this.$sliders[i][0].span = $span;
						}else{
							_this.$sliders[i][0].span.addClass('xdsoft_label_'+spanpos);
						}
					}
					_this.$sliders[i]
						.xdSoftDraggable({
							x:_this.options.x,
							y:_this.options.y,
							allowAxisMove:_this.options.allowAxisMove.xd(i,'both'),
							onMove:function(x,y){
								_this.getValue(i,x,y);
							}
						})
						.on('click.xdsoft', function( e ){
							_this.sliderActive = i;
							e.stopPropagation();
						});
				}(i);
			
			_this.$sliderBox
				.css({
					height:_this.options.height,
					width:_this.options.width,
				})
				.append(_this.$sliders);
			
			
			if( _this.options.showLegend && ( !_this.legends||_this.options.recalcLegends ) ){
				if( _this.legends ){
					for(i=0;i<2;i++)
						if( _this.legends[i] )
							for(var j=0;j<_this.legends[i].length;j++)
								_this.legends[i][j]&&
									_this.legends[i][j].remove&&
										_this.legends[i][j].remove();
				}
				
				_this.legends = [[],[]];
				var offsets = [0,0];
				for(i=0;i<2;i++){
					if( _this.options.axis[i] )
						for(var j=0;j<_this.options.axis[i].length;j++){
							_this.legends[i][j] = $('<span class="xdsoft_legend">'+_this.options.axis[i][j]+'</span>');
							if( _this.options.showLegend[i] ){
								_this.$range2DSlider
									.append(_this.legends[i][j]);
								offsets[i?0:1] = Math.max(offsets[i?0:1],_this.legends[i][j][0][i?'offsetWidth':'offsetHeight']);
							}
						}
				}
				
				_this.$range2DSlider.css('padding-'+_this.options.x,(offsets[0])+'px');
				_this.$range2DSlider.css('padding-'+_this.options.y,(offsets[1])+'px');
				
				
				if( _this.legends[0]&&_this.legends[0][0] ){
					_this.legends[0][0]
						.css(_this.options.y,'0px')
						.css(_this.options.x,offsets[0]+'px')
					
					var percentOffset = [
						((offsets[0])/_this.$range2DSlider[0].clientWidth)*100,
						((offsets[1])/_this.$range2DSlider[0].clientHeight)*100
					];
					
					for( i = 1;i<_this.legends[0].length-1;i++ )
						_this.legends[0][i]
							.css(_this.options.y,'0px')
							.css(_this.options.x,(
									(100-percentOffset[0])*(
										(
											_this.options.axis[0][i]-_this.options.axis[0][0]
										)/(
											_this.options.axis[0][_this.options.axis[0].length-1]-_this.options.axis[0][0]
										)
									)+
									percentOffset[0]/2
								).toFixed(8)+'%'
							)
							.css('width',offsets[0]+'px');
						
					_this.legends[0][_this.legends[0].length-1]
						.css(_this.options.y,'0px')
						.css(_this.options.x=='left'?'right':'left','0px')
					}
				if( _this.legends[1]&&_this.legends[1][0] ){
					_this.legends[1][0]
						.css(_this.options.y,offsets[1]+'px')
						.css(_this.options.x,'0px')
						.css('width',offsets[0]+'px');
					
					for(i = 1;i<_this.legends[1].length-1;i++)
						_this.legends[1][i]
							.css(_this.options.x,'0px')
							.css('width',offsets[0]+'px')
							.css(_this.options.y,(
									(100-percentOffset[1])*(
										(
											_this.options.axis[1][i]-_this.options.axis[1][0]
										)/(
											_this.options.axis[1][_this.options.axis[1].length-1]-_this.options.axis[1][0]
										)
									)+
									percentOffset[1]/2
								).toFixed(8)+'%'
							);
					
					_this.legends[1][_this.legends[1].length-1]
						.css(_this.options.y=='top'?'bottom':'top','-0px')
						.css(_this.options.x,'0px')
						.css('width',offsets[0]+'px');
				}
			}
			
			_this.limitX 		= 	parseInt(_this.$sliderBox[0].clientWidth);
			_this.limitY	 	=  	parseInt(_this.$sliderBox[0].clientHeight);

			_this.grid();
			
			
			/*for(i=0;i<value.length;i++)
				$sliders[i]
					.css('margin-'+_this.options.x,'-'+Math.round($sliders[i][0].offsetWidth/2)+'px')
					.css('margin-'+_this.options.y,'-'+Math.round($sliders[i][0].offsetHeight/2)+'px');
			*/	
			
			
			for(i=0;i<_this.values.length;i++)
				_this.setValue(i,_this.values[i][0],_this.values[i][1] );
			
			
			
			/* End Insert in DOM */
		});
	};
	$.fn.range2DSlider.defaultOptions = defaultOptions;
}(jQuery);