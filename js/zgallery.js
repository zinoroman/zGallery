var zGallery = (function () {

	//Private methods and members
	var error, css, slideshow, img, animate, UI, listeners, pageSettings,
		images = {}, cache = {}, imageInterval,
		options = {
			user: {},
			plugin: {
				menuId: 'z-Gallery-menu',
				cssPath: 'css/zg-style.min.css',
				loadCssAsync: true
			}
		}, 
		defaultOptions = {
			previewHeight: 50,
			background: '#000',
			delay: 2500,
			autoPreload: true,
			prefix: 'zg-img',
			animation: true,
			lang: 'eng'
		},
		lang = {
			eng: {
				0: 'Image',
				1: 'from'
			},
			ru: {
				0: 'Изображение',
				1: 'из'
			},
			ua: {
				0: 'Зображення',
				1: 'з'
			},
			esp: {
				0: 'Imagen',
				1: 'de'
			}
		};

	error = {
		/*
		@param {String} error - Error that will be thrown
		@param {Boolean} inform If true - will be shown javascript alert window
		*/
		fatal: function (error, inform) {
			var error  = "zGallery Fatal Error :: " + error;
			if (inform) alert (error);
			throw new Error (error);
		},
		/*
		@param {String} warning - The warning that will be shown in console
		*/
		warning: function (warning) {
			console.warn("zGallery Warning :: " + warning);
		}
	};
	animate = {
		workspaceCreation: function () {
			UI.wrapper.className = 'fade-in';
			pageSettings.update();
		},
		workspaceDestroy: function () {
			UI.wrapper.className = 'fade-out';

			setTimeout(function () {
				document.body.removeChild(UI.wrapper);
			}, 500);
		},
		imageSwitch: function (image) {
			img.active.className = 'fade-out';

			setTimeout(function () {
				img.readyToSwitch(image);
				img.active.className = 'fade-in';
			}, 300);
		}
	},
	UI = {
		createWorkSpace: function () {;
			this.wrapper = document.createElement('div');
			this.wrapper.id = 'fullscreen-wrapper';
			this.wrapper.style.width = '100%';
			this.wrapper.style.height = '100%';
			this.wrapper.style.position = 'absolute';
			this.wrapper.style.top = window.pageYOffset + 'px';
			this.wrapper.style.left = '0px';
			this.wrapper.style.background = options.user[this.activeEl].background;
			this.wrapper.style.zIndex = 2;
			
			document.body.appendChild(this.wrapper);
			this.addMenu();
			listeners.init();

			if (options.user[this.activeEl].animation) {
				animate.workspaceCreation();
			}
			else {
				pageSettings.update();
			}
		},
		addMenu: function () {
			var galleryMenu = document.createElement('div');
			//Add bottom menu
			galleryMenu.id = options.plugin.menuId;
			galleryMenu.innerHTML = "<div id='z-Gallery-menu-left-column'>" + lang[options.user[this.activeEl].lang][0] + " <span id='z-Gallery-menu-image-id'>1</span> "+ lang[options.user[this.activeEl].lang][1] +" <span id='z-Gallery-menu-image-all'></span></div><div id='z-Gallery-menu-center-column'><div id='z-Gallery-first-image'></div><div id='z-Gallery-prev-image'></div><div id='z-Gallery-next-image'></div><div id='z-Gallery-last-image'></div></div><div id='z-Gallery-menu-right-column'><div id='z-Gallery-slideshow' class='z-Gallery-slideshow-start'></div><div id='z-Gallery-fullscreen-icon'></div><div id='z-Gallery-close-icon'></div></div>";

			this.wrapper.appendChild(galleryMenu);
			//Calucalte window height with opened menu
			this.windowHeight = window.innerHeight - galleryMenu.offsetHeight;

			document.getElementById("z-Gallery-menu-image-all").innerHTML = images[this.activeEl].length;
		},
		updateStage: function (image) {
			if (img.isDisplayed && img.active) {
				try {
					this.wrapper.removeChild(img.active);
				}
				catch (e) {}
			}

			this.wrapper.appendChild(image);

			document.getElementById("z-Gallery-menu-image-id").innerHTML = parseInt(image.id)+1;
		},
		destroyStage: function () {
			//If workspace is already opened
			if (img.isDisplayed) {
				img.isDisplayed = false;
				slideshow('stop');

				if (options.user[this.activeEl].animation) {
					animate.workspaceDestroy();
				}
				else {
					document.body.removeChild(this.wrapper);
				}

				pageSettings.restore();
			}
		},
		fullscreenMode: function () {
			if (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
				if (document.exitFullscreen) {
				    document.exitFullscreen();
				  } else if (document.mozCancelFullScreen) {
				    document.mozCancelFullScreen();
				  } else if (document.webkitExitFullscreen) {
				    document.webkitExitFullscreen();
				  }
			}
			else {
				if (this.wrapper) {
					if (this.wrapper.requestFullscreen) {
						this.wrapper.requestFullscreen(); 
					}
					else if (this.wrapper.mozRequestFullScreen) {
						this.wrapper.mozRequestFullScreen(); 
					}
					else if (this.wrapper.webkitRequestFullscreen) {
						this.wrapper.webkitRequestFullscreen(); 
					}
					else if (this.wrapper.msRequestFullscreen) {
						this.wrapper.msRequestFullscreen(); 
					}

					this.fullscreenMode.styleTopBefore = this.wrapper.style.top;
					//Fix for the Chrome
					this.wrapper.style.top = '0px';
					this.fullscreenModeEnabled = true;
				}
			}
		},
		exitFullscreen: function (e) {
			var element = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
			if (!element) {
				UI.wrapper.style.top = UI.fullscreenMode.styleTopBefore + 'px';
				UI.fullscreenModeEnabled = false;
			}
		}
	},

	css = {
		load: function () {
			if (options.plugin.loadCssAsync) {
				var stylesheet = document.createElement('link'),
					loadStylesheetInterval;

				stylesheet.setAttribute("rel", "stylesheet");
				stylesheet.setAttribute("href", options.plugin.cssPath);
				document.getElementsByTagName("head")[0].appendChild(stylesheet);
				
				loadStylesheetInterval = setInterval(function () {
					if (!css.loaded) {
						error.warning("Can't load stylesheet");
					}
					else {
						clearInterval(loadStylesheetInterval);
					}
				}, 3000);

				setTimeout(function () {
					if (!css.loaded) {
						clearInterval(loadStylesheetInterval);
						css.onFail();
					}
				}, 25000);

				stylesheet.onload = function () {
					css.loaded = true;
				};
			}
			else {
				//We believe that a user successfully uploaded CSS stylesheet manually
				css.loaded = true;
			}
		},
		onFail: function () {
			error.fatal("Stylesheet can't be loaded", true);
		}
	},

	listeners = {
		init: function () {
			document.getElementById('z-Gallery-menu').onclick = function (e) {
				var elementId = e.target.id;

				//It's click by gallery icon
				if (elementId != options.plugin.menuId) {
					if (elementId === 'z-Gallery-slideshow') {
						slideshow();
					}
					else if (elementId === 'z-Gallery-fullscreen-icon') {
						UI.fullscreenMode();
					}
					else if (elementId === 'z-Gallery-close-icon') {
						UI.destroyStage();
					}
					else if (elementId === 'z-Gallery-prev-image') {
						img.open(4);
					}
					else if (elementId  === 'z-Gallery-next-image') {
						img.open(2);
					}
					else if (elementId === 'z-Gallery-first-image') {
						img.open(1);
					}
					else if (elementId === 'z-Gallery-last-image') {
						img.open(3);
					}
				}
			}
			//Switch image with keybord
			window.onkeydown = function (e) {
				listeners.keyboard(e);
			};
			//Switch image with mouse
			UI.wrapper.onclick = function (e) {
				listeners.mouse(e);
			};

			window.onresize = function () {
				UI.wrapper.style.width = '100%';
				UI.wrapper.style.height = '100%';
				//context.imageWrapper.style.top = window.scrollY + 'px';
				UI.windowHeight = window.innerHeight - document.getElementById(options.plugin.menuId).offsetHeight;
				img.moveToCenter();
			};

			document.addEventListener("fullscreenchange", UI.exitFullscreen);      
   			document.addEventListener("webkitfullscreenchange", UI.exitFullscreen);
   			document.addEventListener("mozfullscreenchange", UI.exitFullscreen);
		},
		keyboard: function (e) {
			//Close zGallery
			if (e.keyCode == 27) {
				if (!UI.fullscreenModeEnabled) {
					UI.destroyStage();
				}
			}
			//Fist image
			else if (e.keyCode == 38) {
				img.open(1);
			}
			//Move right
			else if (e.keyCode == 39) {
				img.open(2);
			}
			//Last image
			else if (e.keyCode == 40) {
				img.open(3);
			}
			else if (e.keyCode == 37) {
				img.open(4);
			}
			else if (e.keyCode == 13) {
				UI.fullscreenMode();
			}
			else if (e.keyCode == 32) {
				slideshow();
			}
		},
		mouse: function (e) {
			if (e.pageY <= UI.windowHeight) {
				var windowCenter = window.innerWidth / 2;

				if (e.pageX >= windowCenter) {
					img.open(2);
				}
				else {
					img.open(4);
				}
			}
		},
		openImage: function (image, options) {
			image.onclick = function (e) {
				//Is css succesfully loaded?
				if (css.loaded) {
					UI.activeEl = e.target.parentNode.id;
					UI.createWorkSpace();
					img.open(null, e.target);

					if (options.slideshow) {
						slideshow('start');
					}
				}
				else {
					//No css - no gallery
					css.onFail();
				}
			}
		}
	}

	img = {
		/*
		@param {Object} imgArr - An array with image from which will be create thumbnails
		@param {String} elementID - The id of element containing images
		@param {Object} options - User options
		*/
		createPreview: function (imgArr, elementID, options) {
			var imgCount = imgArr.length;

			for (imgCount; imgCount--;) {
				//Small image - set height
				imgArr[imgCount].style.height = options['previewHeight'] + 'px';
				//Set unical id
				imgArr[imgCount].id = imgCount + "-" + elementID + "-" + options.prefix;
				//Cache all images
				if (options.autoPreload) {
					var cachedImg = new Image();
					cachedImg.src = imgArr[imgCount].src;
					cachedImg.id = imgArr[imgCount].id + '-big';
					cache[imgArr[imgCount].src] = cachedImg;
				}

				//Add event listener to thumbinal
				listeners.openImage(imgArr[imgCount], options);
			}
		},

		/*
			@param {Number} side:
			If side == 1 - will be shown first image
			If side == 2 - next image
			if side == 3 - last image
			If side == 4 - previous image

			@return {Number} id - Id of image that will be shown
		*/
		calcNextId: function (side) {
			var id = parseInt(this.active.id),
				imagesLength = images[UI.activeEl].length;

			if (side == 2) {
				id += 1;
				//No more images
				if (id == imagesLength) {
					--id;

					slideshow('stop');

					return false;
				}
			}
			else if (side == 4) {
				id -= 1;

				//Now shows first image?
				if (id < 0) {
					++id;

					slideshow('stop');

					return false;
				}
			}
			else if (side == 1) {
				if (id > 0) {
					id = 0;
				}
				else {
					return false;
				}
			}
			else if (side == 3) {
				var newId = imagesLength - 1;
				if (id != newId) {
					id = newId;
				}
				else {
					return false;
				}
			}

			return id;
		},
		//@param {number} side
		//@param {optional Object} target - Target from event when the user clicks on a thumbnail image
		open: function (side, target) {
			var id, src;
			if (typeof target === 'undefined') {
				id = this.calcNextId(side);

				if (typeof id === 'number') {
					src = images[UI.activeEl][id].src;
				}
			}
			else {
				id = parseInt(target.id);
				src = target.src;
			}

			if (typeof id === 'number') {
				if (cache[src]) {
					this.onLoad(cache[src], id);
				}
				else {
					var cachedImg = new Image();
					cachedImg.src = src;
					cache[src] = cachedImg;
					cachedImg.onload = function () {
						img.onLoad(cachedImg, id);
					};
				}
			}
		},
		onLoad: function (image, id) {
			image.id = id + "-" + UI.activeEl + "-" + options.user[UI.activeEl].prefix + '-big';

			if (!this.isDisplayed || !options.user[UI.activeEl].animation) {
				this.readyToSwitch(image);
			}
			else {
				animate.imageSwitch(image);
			}
		},
		readyToSwitch: function (image) {
			UI.updateStage(image);
			image.className = '';
			this.active = image;
			this.isDisplayed = true;

			this.moveToCenter();
		},
		moveToCenter: function () {
			var ImgWidth = this.active.naturalWidth,
				ImgHeight = this.active.naturalHeight,
				windowW = window.innerWidth;

			if (ImgWidth > windowW && ImgHeight > UI.windowHeight) {
				if (windowW * (ImgHeight / ImgWidth) > UI.windowHeight) {
					this.active.style.height = UI.windowHeight + 'px';
					this.active.style.width = UI.windowHeight * ImgWidth / ImgHeight + 'px';
				}
				else {
					this.active.style.width = windowW + 'px';
					this.active.style.height = windowW * ImgHeight / ImgWidth + 'px';
				}
			}
			else if (ImgHeight > UI.windowHeight) {
				this.active.style.height = UI.windowHeight + 'px';
				this.active.style.width = UI.windowHeight * ImgWidth / ImgHeight + 'px';
			}
			else if (ImgWidth > windowW) {
				this.active.style.width = windowW + 'px';
				this.active.style.height = windowW * ImgHeight / ImgWidth + 'px';
			}
			else {
				this.active.style.width = ImgWidth + 'px';
				this.active.style.height = ImgHeight + 'px';
			}

			this.active.style.position = 'absolute';
			this.active.style.top = UI.windowHeight/2 - parseInt(this.active.style.height)/2 + 'px';
			this.active.style.left = windowW/2 - parseInt(this.active.style.width)/2 + 'px';
			this.active.style.zIndex = 1;
		}
	}

	
	//@param {optional String} action - What to do - start or (stop) slideshow?
	slideshow =  function (action) {
		var element = document.getElementById('z-Gallery-slideshow'),
			action;

		if (typeof action === 'undefined') {
			slideshow.isActive ? action = 'stop' : action = 'start';
		}

		if (action == 'start') {

			setTimeout(function () {
				img.open(2);

				imageInterval = setInterval(function () {
					img.open(2);
				}, options.user[UI.activeEl].delay);
			}, 150);

			slideshow.isActive = true;
		}
		else if (action == 'stop') {
			clearInterval(imageInterval);
			slideshow.isActive = false;
		}

		action == 'start' ? action = 'stop' : action = 'start'
		element.className = 'z-Gallery-slideshow-'+ action;
	}

	pageSettings = {
		save:  function () {
			this.setups = {
				style: [document.body.style.cssText, document.documentElement.style.cssText],
				script: {
					onkeydown: window.onkeydown,
					onresize: window.onresize
				}
			};
		},
		restore: function () {
			document.body.style.cssText = this.setups.style[0];
			document.documentElement.style.cssText = this.setups.style[1];
			window.onkeydown = this.setups.script.onkeydown;
			window.onresize = this.setups.script.onresize;
		},
		update: function () {
			document.body.style.cssText = 'overflow: hidden; height:100%; padding: 0px; margin: 0px; z-index: 1; -webkit-user-select: none;-moz-user-select: -moz-none;-ms-user-select: none; user-select: none;';
			document.documentElement.style.cssText = 'overflow:hidden; height:100%';
		}
	}

	return {
		//Public members
		init: function () {
			var argL = arguments.length,
				i = 0;

			for (i; i < argL; i++) {
				if (typeof arguments[i] == 'string') {
					//Get id of DOM elements
					var elements = arguments[i].replace(/\s/g, '').split(','),
					//Other variables
						elementsL = elements.length,
						galleryOptions,
						element,
						imageDiv,
						reqOpts;

					//Get options for this elements
					if (typeof arguments[i+1] == 'object') {
						galleryOptions = function () {},
						galleryOptions.prototype = arguments[i+1];
						galleryOptions = new galleryOptions();
						
						for (var index in defaultOptions) {
							if (typeof galleryOptions[index] === 'undefined') {
								galleryOptions[index] = defaultOptions[index];
							}
						}
					}
					else {
						galleryOptions = defaultOptions;
					}

					//Save options
					for (elementsL; elementsL--;) {
						element = elements[elementsL];
						imageDiv = document.getElementById(element);

						if (!imageDiv) {
							error.fatal('The DOM element "#' + element + '" passed plugin does not exist', true);
						}
						else {
							//Get images from element
							images[element] = imageDiv.getElementsByTagName('img');
							if (images[element].length === 0) {
								//No images
								error.warning('In element "#'+ element +'" that passed to plugin does not have image');
							}
							else {
								//Create preview
								img.createPreview(images[element], element, galleryOptions);
							}
						}

						if (typeof options[element] === 'undefined') {
							options.user[element] = galleryOptions;
							
							//override plugin settings
							for (index in options.plugin) {
								if (typeof galleryOptions[index] !== 'undefined') {
									options.plugin[index] = galleryOptions[index];
								}
							}
						}
						else {
							error.warning('The element "#' + element + '" is already in use');
						}
					}
				}
			}

			//Save old page's css and javascript listeners
			pageSettings.save();
			//Load plugin's stylesheet
			css.load();
		}
	}
})();