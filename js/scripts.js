var livemode = true;

function id(id) {
	if(document.getElementById(id)) {
		return document.getElementById(id);
	}
	
	return false;
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function findAncestor(el, cls, isid, istag) {
	if(typeof istag !== 'undefined' && istag === 1) {
		while ((el = el.parentElement) && el.tagName != cls);
   		return el;
	}
	else if(typeof isid !== 'undefined' && isid === 1) {
		while ((el = el.parentElement) && el.id != cls);
   		return el;
	}
	else {
		while ((el = el.parentElement) && !el.classList.contains(cls));
   		return el;
	}
}

function isDescendant(parent, child) {
	var node = child.parentNode;
	while(node !== null) {
		if(node === parent) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}

function findChild(element, className) {
	var foundElement = null, found;
	function recurse(element, className, found) {
		for (var i = 0; i < element.childNodes.length && !found; i++) {
			var el = element.childNodes[i];
			var classes = el.className != undefined? el.className.split(" ") : [];
			for (var j = 0, jl = classes.length; j < jl; j++) {
				if (classes[j] == className) {
					found = true;
					foundElement = element.childNodes[i];
					break;
				}
			}
			if(found)
				break;
			recurse(element.childNodes[i], className, found);
		}
	}
	recurse(element, className, false);
	return foundElement;
}

function pageScrollTo(to, duration) {
    var start = document.body.scrollTop || document.documentElement.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;
        
    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        document.body.scrollTop = val;
		document.documentElement.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }
    };
    animateScroll();
}

//t = current time, b = start value, c = change in value, d = duration
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, days) {
	var expires;
	if(days) {
    	var date = new Date();
    	date.setTime(date.getTime()+days*24*60*60*1000); // ) removed
		expires = "; expires=" + date.toGMTString(); // + added
	}
	else {
		expires = "";
	}
	var thiscookie = cname + "=" + cvalue + expires + ";path=/";
	
	document.cookie = thiscookie;
}


function setModules() {
	// TO DO: Nested hs-modules that may have same pageY as parent
	
	var levelmods = {};
	var modules = document.querySelectorAll(".hs-module");
	var i, modulepos, toppos, modheight, modgroup;
	
	for(i=0; i < modules.length; i++) {
		modgroup = modules[i].parentNode.parentNode.parentNode.querySelector(".hs-module").id;
		
		modules[i].parentNode.parentNode.style.padding = null;
		modules[i].style.minHeight = null;
		modulepos = modules[i].getBoundingClientRect();
		
		toppos = parseInt(modulepos.top);
		modheight = parseInt(modulepos.height);
		//modules[i].style.height = modheight+"px";
		
		modgroup = modgroup+toppos;
		
		if(levelmods[modgroup]) {
			if(modheight > levelmods[modgroup].tallest) {
				levelmods[modgroup].tallest = modheight;
			}
		}
		else {
			levelmods[modgroup] = {
				"tallest" : modheight,
				"matchheight" : [],
				"valign" : []
			};
		}
		
		if(hasClass(modules[i], "hs-matchheight")) {
			levelmods[modgroup].matchheight.push({
				"module" : modules[i],
				"height" : modheight
			});
		}
		if(hasClass(modules[i], "hs-valign")) {
			levelmods[modgroup].valign.push({
				"module" : modules[i],
				"height" : modheight
			});
		}
	}
	
	var j, paddheight;
	for(var level in levelmods) {
		if(Object.prototype.hasOwnProperty.call(levelmods, level)) {
			if(levelmods[level].matchheight.length > 0) {
				for(j=0; j<levelmods[level].matchheight.length; j++) {
					if(levelmods[level].matchheight[j].height != levelmods[level].tallest) {
						levelmods[level].matchheight[j].module.style.minHeight = levelmods[level].tallest+"px";
					}
				} 
			}
			if(levelmods[level].valign.length > 0) {
				for(j=0; j<levelmods[level].valign.length; j++) {
					if(levelmods[level].valign[j].height != levelmods[level].tallest) {
						paddheight = (levelmods[level].tallest-levelmods[level].valign[j].height)/2;
						levelmods[level].valign[j].module.parentNode.parentNode.style.paddingTop = paddheight+"px";
						levelmods[level].valign[j].module.parentNode.parentNode.style.paddingBottom = paddheight+"px";
					}
				} 
			}
		}
	}
}

var stickyobj = {
	"offset" : 0,
	"stickies" : []
};

function setStickies() {
	var scrollpos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
	var headerbar = id("page-header");
	var offset = 0;
	if(headerbar) {
		offset = headerbar.offsetHeight;
		stickyobj.offset = offset;
	}
	var stickies = document.querySelectorAll(".scroll-sticky");
	var sticky, stickycontainer, mintrigger, maxtrigger, stickyplaceholder, toppos;
	for(var i=0; i<stickies.length; i++) {
		sticky = stickies[i].getBoundingClientRect();
		
		stickies[i].style.webkitTransform = "translate(0,0)";
		stickies[i].style.transform = "translate(0,0)";
		stickies[i].style.position = "relative";
		stickies[i].style.top = "auto";
		stickies[i].style.width = "auto";
		
		if(!hasClass(stickies[i].parentNode, "sticky-obj-container")) {
			stickyplaceholder = document.createElement("div");
			stickyplaceholder.className = "sticky-obj-container";
			stickies[i].parentNode.insertBefore(stickyplaceholder, stickies[i]);
			stickyplaceholder.appendChild(stickies[i]);
			if(!hasClass(stickies[i], "sticky-obj-"+i)) {
				stickies[i].className = stickies[i].className + " sticky-obj-"+i;
			}
		}
		
		stickycontainer = findAncestor(stickies[i], "scroll-sticky-container").getBoundingClientRect();
		
		var stickydiff = sticky.top - stickycontainer.top;
		
		mintrigger = scrollpos - offset + stickycontainer.top + stickydiff;
		maxtrigger = mintrigger + stickycontainer.height - sticky.height - stickydiff;
		toppos = offset + sticky.top - stickycontainer.top - stickydiff;
		
		stickyobj.stickies[i] = {
			"item" : sticky,
			"width" : stickies[i].parentNode.offsetWidth,
			"toppos" : toppos,
			"container" : stickycontainer,
			"mintrigger" : mintrigger,
			"maxtrigger" : maxtrigger
		};
		
	}
	
	positionStickies();
}

function positionStickies() {
	var scrollpos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
	for(var i=0; i<stickyobj.stickies.length; i++) {
		var sticky = document.querySelector(".sticky-obj-"+i);
		if(scrollpos > stickyobj.stickies[i].mintrigger && scrollpos < stickyobj.stickies[i].maxtrigger) {
			sticky.style.width = stickyobj.stickies[i].width + 'px';
			sticky.style.webkitTransform = "translate(0,0)";
			sticky.style.transform = "translate(0,0)";
			sticky.style.position = 'fixed';
			sticky.style.top = stickyobj.stickies[i].toppos + "px";
		}
		else if(scrollpos <= stickyobj.stickies[i].mintrigger) {
			sticky.style.webkitTransform = "translate(0,0)";
			sticky.style.transform = "translate(0,0)";
			sticky.style.position = "relative";
			sticky.style.top = "auto";
			sticky.style.width = "auto";
		}
		else {
			sticky.style.webkitTransform = "translate(0,"+(stickyobj.stickies[i].maxtrigger-stickyobj.stickies[i].mintrigger)+"px)";
			sticky.style.transform = "translate(0,"+(stickyobj.stickies[i].maxtrigger-stickyobj.stickies[i].mintrigger)+"px)";
			sticky.style.position = "relative";
			sticky.style.top = "auto";
			sticky.style.width = "auto";
		}
		
		sticky.style.visibility = "visible";
	}
}

function toggleDialog(dialogoverlay, dialogcontainer, dialogtarget, callbackFunction) {
	if(dialogoverlay.style.opacity==="0") {
		dialogoverlay.style.width = "100%";
		dialogoverlay.style.height = "100%";
		dialogoverlay.style.opacity = "1";
		document.body.style.overflow = "hidden";
	}
	else {
		document.body.style.overflow = "visible";
		dialogoverlay.style.opacity = "0";
		setTimeout(function() {
			dialogoverlay.style.width = "0px";
			dialogoverlay.style.height = "0px";
			//dialogtarget.innerHTML = '';
		}, 350);
	}
	
	if(dialogcontainer.style.opacity==="0") {
		dialogcontainer.style.webkitTransform = "scale(1,1)";
		dialogcontainer.style.transform = "scale(1,1)";
		dialogcontainer.style.opacity = "1";
		if(callbackFunction!==undefined) {
			callbackFunction();
		}
	}
	else {
		dialogcontainer.style.opacity = "0";
		dialogcontainer.style.webkitTransform = "scale(0)";
		dialogcontainer.style.transform = "scale(0)";
	}
}

var openHeaderMenu = function(menu) {
	return function() {
		menu.style.display = "block";
		setTimeout(function() {
			menu.className = menu.className + " header-user-menu-open";
		}, 100);
	};
};
var closeHeaderMenu = function(menu) {
	return function() {
		menu.className = menu.className.replace(" header-user-menu-open", "");
		setTimeout(function() {
			menu.style.display = "none";
		}, 100);
	};
};

var toggleHeaderMenu = function(thiscontrol) {
	return function(e) {
		if(!findAncestor(e.target, "header-user-menu")) {
			var thismenu = thiscontrol.querySelector(".header-user-menu");
			if(thismenu) {
				var allmenus = document.querySelectorAll(".header-user-menu-open");
				for(var i=0; i<allmenus.length; i++) {
					if(allmenus[i] != thismenu) {
						closeHeaderMenu(allmenus[i])();
					}
				}
				
				if(thismenu.style.display == 'none') {
					openHeaderMenu(thismenu)();
				}
				else {
					closeHeaderMenu(thismenu)();
				}
			}
		}
	};
};



var initSlider = function(slidercontainer) {
	return function() {
		var currentitem = 0;
		var currentposition = 0;
		var slider = slidercontainer.querySelector(".hs-slider-area");
		var rail = slidercontainer.querySelector(".hs-slider-content");
		var items = slidercontainer.querySelectorAll(".hs-slider-item");
		var itemwidth = 356;
		var railpos = 0;
		var margin = 20;
		var itemcount = 3;
		
		var tabletwidth = 1160;
		var tabletitems = 2;
		var tabletmargin = 20;
		
		var mobilewidth = 680;
		var mobileitems = 1;
		var mobilemargin = 20;
		
		if(slidercontainer.getAttribute("data-hs-items")) {
			itemcount = parseInt(slidercontainer.getAttribute("data-hs-items"));
		}
		if(slidercontainer.getAttribute("data-hs-tablet-items")) {
			tabletitems = parseInt(slidercontainer.getAttribute("data-hs-tablet-items"));
		}
		if(slidercontainer.getAttribute("data-hs-mobile-items")) {
			mobileitems = parseInt(slidercontainer.getAttribute("data-hs-mobile-items"));
		}
		
		var options = {
			"items" : itemcount,
			"margin" : margin,
			"tabletWidth" : tabletwidth,
			"tabletItems" : tabletitems,
			"tabletMargin" : tabletmargin,
			"mobileWidth" : mobilewidth,
			"mobileItems" : mobileitems,
			"mobileMargin" : mobilemargin,
		};
		
		function sizeSlider() {
			var windowwidth = window.innerWidth;
			var container = slider.getBoundingClientRect();
			
			if(windowwidth <= options.mobileWidth) {
				margin = options.mobileMargin;
				itemcount = options.mobileItems;
			}
			else if(windowwidth <= options.tabletWidth) {
				margin = options.tabletMargin;
				itemcount = options.tabletItems;
			}
			else {
				margin = options.margin;
				itemcount = options.items;
			}
			
			rail.style.marginLeft = "-"+margin+"px";
			if(itemcount > 1) {
				itemwidth = (container.width-((itemcount-1)*margin))/itemcount;
			}
			else {
				itemwidth = container.width;
			}
			rail.style.width = ((itemwidth+margin)*items.length)+"px";
			
			railpos = currentitem*(itemwidth+margin);
			rail.style.transform = "translate(-"+railpos+"px,0)";
			rail.style.webkitTransform = "translate(-"+railpos+"px,0)";

			for(var i=0; i<items.length; i++) {
				items[i].style.width = itemwidth+"px";
				items[i].style.marginLeft = margin+"px";
				if(i>=currentitem && i<(currentitem+itemcount)) {
					if(!hasClass(items[i], "hs-slider-item-active")) {
						items[i].className = items[i].className + " hs-slider-item-active";
					}
				}
			}
		}
		
		sizeSlider();
		
		window.addEventListener("resize", function() {
			sizeSlider();
		});
		
		function goToItem(toitem) {
			if(toitem === 'prev') {
				if(currentitem <= 0) {
					currentitem = items.length-((itemcount-1)+1);
				}
				else {
					currentitem--;
				}
			}
			else if(toitem === 'next') {
				if(currentitem >= items.length-((itemcount-1)+1) ) {
					currentitem = 0;
				}
				else {
					currentitem++;
				}
			}
			else {
				//console.log(toitem);
			}
					
			railpos = currentitem*(itemwidth+margin);
			rail.style.transform = "translate(-"+railpos+"px,0)";
			rail.style.webkitTransform = "translate(-"+railpos+"px,0)";
			
			for(var j=0; j<items.length; j++) {
				if(j>=currentitem && j<(currentitem+itemcount)) {
					if(!hasClass(items[j], "hs-slider-item-active")) {
						items[j].className = items[j].className + " hs-slider-item-active";
					}
				}
				else {
					items[j].className = items[j].className.replace(" hs-slider-item-active", "");
				}
			}
		}
		
		if(slidercontainer.querySelector(".hs-slider-control-prev")) {
			var previous = slidercontainer.querySelector(".hs-slider-control-prev");
			previous.onclick = function() {
				goToItem("prev");
			};
		}
		if(slidercontainer.querySelector(".hs-slider-control-next")) {
			var next = slidercontainer.querySelector(".hs-slider-control-next");
			next.onclick = function() {
				goToItem("next");
			};
		}
		
	};
};

function initSliders() {
	var sliders = document.querySelectorAll(".hs-slider-container");
	for(var i=0; i<sliders.length; i++) {
		initSlider(sliders[i])();
	}
}

var initSlideGallery = function(gallery) {
	return function() {
		
		var currentitem = 0;
		var currentposition = 0;
		var rail = gallery.querySelector(".hs-gallery-content");
		var items = gallery.querySelectorAll(".hs-gallery-item");
		var itemwidth = 356;
		var railpos = 0;
		
		function sizeGallery() {
			var container = gallery.getBoundingClientRect();
			itemwidth = container.width;
			rail.style.width = ((itemwidth)*items.length)+"px";
			
			railpos = currentitem*itemwidth;
			rail.style.transform = "translate(-"+railpos+"px,0)";
			rail.style.webkitTransform = "translate(-"+railpos+"px,0)";

			for(var i=0; i<items.length; i++) {
				items[i].style.width = itemwidth+"px";
			}
		}
		
		sizeGallery();
		
		window.addEventListener("resize", function() {
			sizeGallery();
		});
		
		function goToItem(toitem) {
			if(toitem === 'prev') {
				if(currentitem <= 0) {
					currentitem = items.length-((1-1)+1);
				}
				else {
					currentitem--;
				}
			}
			else if(toitem === 'next') {
				if(currentitem >= items.length-((1-1)+1) ) {
					currentitem = 0;
				}
				else {
					currentitem++;
				}
			}
			else {
				//console.log(toitem);
			}
					
			railpos = currentitem*itemwidth;
			rail.style.transform = "translate(-"+railpos+"px,0)";
			rail.style.webkitTransform = "translate(-"+railpos+"px,0)";
		}
		
		if(gallery.querySelector(".hs-gallery-control-prev")) {
			var previous = gallery.querySelector(".hs-gallery-control-prev");
			previous.onclick = function() {
				goToItem("prev");
			};
		}
		if(gallery.querySelector(".hs-gallery-control-next")) {
			var next = gallery.querySelector(".hs-gallery-control-next");
			next.onclick = function() {
				goToItem("next");
			};
		}
		
		
		
	};
};

function initGalleries() {
	var galleries = document.querySelectorAll(".hs-gallery");
	for(var i=0; i<galleries.length; i++) {
		initSlideGallery(galleries[i])();
	}
}



var hsScrollToFunction = function(trigger) {
	return function() {
		var headeroffset = id("hs-header").offsetHeight;
		if(id(trigger.getAttribute("data-target"))) {
			var target = id(trigger.getAttribute("data-target"));
			
			var targetdimensions = target.getBoundingClientRect();
			pageScrollTo((window.scrollY+targetdimensions.top-headeroffset), 300);
			
			closeHeaderMenu();
		}
		
	};
};

function initScrollTo() {
	var scrolltos = document.querySelectorAll(".hs-scrollto-trigger");
	for(var i=0; i<scrolltos.length; i++) {
		scrolltos[i].onclick = hsScrollToFunction(scrolltos[i]);
	}
}



function validateEmail(thisemail) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(thisemail);
}

function validateURL(thisurl) {
    var re = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    return re.test(thisurl);
}

function validateReq(thiselem) {
	var prefiller = thiselem.getAttribute("title");
	if(thiselem.value === "" || thiselem.value === prefiller) {
		if(hasClass(thiselem, "fwxreq")) {
			thiselem.style.borderColor = "#f3b6b3";
		}
		else {
			thiselem.style.borderColor = "#eeeeee";
		}
		thiselem.style.color = "#b3b3b3";
		thiselem.value = prefiller;
		return false;
	}
	else if(hasClass(thiselem, "fwxemail") && !validateEmail(thiselem.value)) {
		thiselem.style.borderColor = "#f3b6b3";
	}
	else {
		if(hasClass(thiselem, "fwxcard")) {
			thiselem.style.borderColor = "#eeeeee";
		}
		else {
			thiselem.style.borderColor = "#50e39b";
		}
		if(thiselem.parentNode.getElementsByClassName("mini-error-message")[0]) {
			var thiserror = thiselem.parentNode.getElementsByClassName("mini-error-message")[0];
			thiserror.innerHTML = '';
			thiserror.style.display = 'none';
		}
		return true;
	}
}

function validateSelect(thiselem) {
	if(thiselem.value === "") {
		thiselem.style.color = "#b3b3b3";
		return false;
	}
	else {
		thiselem.style.color = "#333333";
	}
	return true;
}

function initinputelem(thiselem) {
	if(thiselem.tagName == "INPUT" || thiselem.tagName == "TEXTAREA") {
		var prefiller = thiselem.getAttribute("title");
		if(thiselem.value === "" || thiselem.value === prefiller) {
			thiselem.style.color = "#b3b3b3";
			thiselem.value = prefiller;
		}

		thiselem.onfocus = function() {
			if(thiselem.value === prefiller) {
				thiselem.value = "";
				thiselem.style.color = "#333333";
			}
		};

		thiselem.onblur = function() {
			validateReq(thiselem);
		};
	}
	else if(thiselem.tagName == "SELECT") {
		validateSelect(thiselem);
		thiselem.onchange = function() {
			validateSelect(thiselem);
		};
	}
}


var checkForm = function(form) {
	return function() {
		var submitbutton = form.querySelector('[type=submit]');
		submitbutton.disabled = true;
		
		var sendform = 1;
		var sendparams = {};
		var inputfields = [];
		
		var requiredfields = form.querySelectorAll(".hs-req");
		for(var i=0; i<requiredfields.length; i++) {
			if(requiredfields[i].tagName == 'SELECT') {
				if(!validateSelect(requiredfields[i])) {
					sendform = 0;
				}
			}
			else {
				if(!validateReq(requiredfields[i])) {
					sendform = 0;
				}
			}
		}
		
		if(sendform == 1) {
			var inputs = form.querySelectorAll("input:not([type=submit])");
			inputfields.push.apply(inputfields, inputs);
			var selects = form.querySelectorAll("select");
			inputfields.push.apply(inputfields, selects);
			var textareas = form.querySelectorAll("textarea");
			inputfields.push.apply(inputfields, textareas);
			
			for(var j = 0; j<inputfields.length; j++) {
				if(inputfields[j].id!='hs-form-checker') {
					if(inputfields[j].hasAttribute("title")) {
						if(inputfields[j].getAttribute("title") != inputfields[j].value) {
							sendparams[inputfields[j].id] = inputfields[j].value;
						}
					}
					else {
						sendparams[inputfields[j].id] = inputfields[j].value;
					}
				}
			}
			
			sendparams._subject = "Website Form Completion - " + window.location.hostname;
			sendparams._template = "table";
			sendparams._captcha = "false";

			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == XMLHttpRequest.DONE) {
					var response = null;
					try { response = JSON.parse(xhttp.responseText); } catch(e) {}
					if (xhttp.status == 200 && response && (response.success === "true" || response.success === true)) {
						if(typeof formsubmitfunction != "undefined") {
							formsubmitfunction();
						}
						var sentmessage = document.createElement("div");
						sentmessage.className = "hs-message-sent";
						sentmessage.innerHTML = '<h5 class="mbottom">Message sent!</h5><p class="nombottom">Your message has been sent, a member of our team will get back to you as soon as possible!</p>';
						form.parentNode.replaceChild(sentmessage, form);
					}
					else {
						submitbutton.disabled = false;
					}
				}
			};

			xhttp.open("POST", "https://formsubmit.co/ajax/fahro275@googlemail.com", true);
			xhttp.setRequestHeader("Content-type", "application/json");
			xhttp.setRequestHeader("Accept", "application/json");
			xhttp.send(JSON.stringify(sendparams));
		}
		else {
			submitbutton.disabled = null;	
		}
		
		return false;
	};
};







var parallaxes = [];

function getCoords(elem) { 
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function parallaxObj(handler, imagew, imageh, contw, conth, imagetopoffset, triggerpoint, scrollspeed) {
	this.handler = handler;
	this.imagew = imagew;
	this.imageh = imageh;
	this.contw = contw;
	this.conth = conth;
	this.imagetopoffset = imagetopoffset;
	this.triggerpoint = triggerpoint;
	this.scrollspeed = scrollspeed;
}

function initParallax() {
	parallaxes = [];
	
	var thisstyle, thisimage, containerheight, containerwidth, origw, origh, contratio, imageratio, multiplier, neww, newh, thisw, thish, triggerpoint, thisparallax, centerpoint;
	var bgs = document.querySelectorAll(".hs-parallax-bg");
	var windowheight = window.innerHeight;
	var bgimage = null;
	for(var i=0; i<bgs.length; i++) {
		bgimage = id(bgs[i].id+"-bgimage");
		if(bgimage) {
			containerheight = bgimage.offsetHeight;
			containerwidth = bgimage.offsetWidth;

			thisimage = new Image();
			thisstyle = bgimage.currentStyle || getComputedStyle(bgimage, null);
			thisimage.src = thisstyle.backgroundImage.slice(5, -2);
			origw = thisimage.naturalWidth;
			origh = thisimage.naturalHeight;

			contratio = containerwidth/containerheight;
			imageratio = origw/origh;

			if(imageratio === contratio) {
				bgimage.style.backgroundSize = containerwidth+"px "+containerheight+"px";
				thisw = containerwidth;
				thish = containerheight;
			}
			else if(imageratio > contratio) {
				multiplier = origh/containerheight;
				neww = origw/multiplier;
				bgimage.style.backgroundSize = neww+"px "+containerheight+"px";
				thisw = neww;
				thish = containerheight;
			}
			else if(imageratio < contratio) {
				multiplier = origw/containerwidth;
				newh = origh/multiplier;
				bgimage.style.backgroundSize = containerwidth+"px "+newh+"px";
				thisw = containerwidth;
				thish = newh;
			}

			centerpoint = (containerheight-thish)/2;
			bgimage.style.backgroundPosition = "center "+centerpoint+"px";

			triggerpoint = getCoords(bgimage).top;
			if(triggerpoint < windowheight) {
				//triggerpoint = 0;
			}

			thisparallax = new parallaxObj(bgimage, thisw, thish, containerwidth, containerheight, centerpoint, triggerpoint);
			parallaxes.push(thisparallax);
		}
	}
	
	scrollParallaxBG();
}

function scrollParallaxBG() {
	var scrollpos =  window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
	var bgdifference, scrolldifference, scrollpercent, imageslack, minscroll, maxscroll;
	var windowheight = window.innerHeight;
	for(var i=0; i<parallaxes.length; i++) {
		imageslack = parallaxes[i].imageh-parallaxes[i].conth;
		minscroll = parallaxes[i].triggerpoint+parallaxes[i].conth;
		maxscroll = parallaxes[i].triggerpoint-windowheight;
		scrolldifference = maxscroll-minscroll;
		scrollpercent = (scrollpos-minscroll)/scrolldifference;
		
		bgdifference = imageslack*scrollpercent;
		
		parallaxes[i].handler.style.backgroundPosition = "center -"+bgdifference+"px";
	}
}



function initMobileMenu() {
	if(id("hs-side-container")) {
		var isopen = 0;

		var trigger = id("hs-mobile-nav-trigger");
		var menucontainer = id("hs-side-container");
		var header = id("hs-header");
		var wrap = id("hs-site-wrap");

		var basemenu = id("hs-side-menu-base");

		var closeMenu = function() {
			return function() {
				wrap.className = wrap.className.replace(" hs-site-wrap-open-right", "");
				menucontainer.className = menucontainer.className.replace(" hs-side-container-open", "");
				header.className = header.className.replace(" hs-header-open-right", "");
				isopen = 0;
			};
		};

		var openMenu = function() {
			return function() {
				wrap.className = wrap.className + " hs-site-wrap-open-right";
				menucontainer.className = menucontainer.className + " hs-side-container-open";
				header.className = header.className + " hs-header-open-right";
				isopen = 1;
			};
		};

		function toggleMenu() {
			if(isopen === 1) {
				closeMenu()();
			}
			else {
				openMenu()();
			}
		}

		var changeMenu = function(changetrigger) {
			return function() {
				var frommenu = menucontainer.querySelector(".hs-side-menu-active");
				var tomenu = basemenu;

				if(changetrigger.getAttribute("data-tomenu")) {
					tomenu = id(changetrigger.getAttribute("data-tomenu"));
				}

				if(tomenu && frommenu && tomenu!=frommenu) {
					frommenu.className = frommenu.className.replace(" hs-side-menu-active", "");
					setTimeout(function() {
						tomenu.className = tomenu.className + " hs-side-menu-active";
					}, 400);
				}

			};
		};

		trigger.onclick = function() {
			toggleMenu();
		};

		var closemenus = menucontainer.querySelectorAll(".hs-close-menu");
		for(var i=0; i<closemenus.length; i++) {
			closemenus[i].onclick = closeMenu();
		}
		var tomenus = menucontainer.querySelectorAll(".hs-to-menu");
		for(var j=0; j<tomenus.length; j++) {
			tomenus[j].onclick = changeMenu(tomenus[j]);
		}
	}
}

function sizePositionFunctions() {
	setStickies();
	setModules();
}




var showGallery = function() {};
var hideGallery = function() {};

var prevImage = function() {};
var nextImage = function() {};

var setImage = function() {};

var loadedgalleries = [];


var initGalleryUI = function() {

	var gallerystyles = document.getElementById("hs-gallery-styles");
	if(!gallerystyles) {
		gallerystyles = document.createElement("STYLE");
		gallerystyles.type = "text/css";
		gallerystyles.id = "hs-gallery-styles";

		document.head.appendChild(gallerystyles);

		var gallerycss = '.hs-gallery-grid {clear: both; padding: 0px; margin: 0px 0px 0px -20px; line-height:inherit; zoom:1;} .hs-gallery-grid:before, .hs-gallery-grid:after {content:""; display:table;} .hs-gallery-grid:after {clear:both;}';

		gallerycss = gallerycss + '.hs-gallery-grid-item {float:left; width:100%;} .hs-gallery-grid-block {padding:0 0 0 20px;}';

		gallerycss = gallerycss + '.hs-gallery-grid-item-50 {width:50%;} .hs-gallery-grid-item-33 {width:33.33%;} .hs-gallery-grid-item-25 {width:25%;} .hs-gallery-grid-item-20 {width:20%;} .hs-gallery-grid-item-16 {width:16.66%;}';

		gallerycss = gallerycss + '.hs-gallery-image-item {background: #fff; padding:6px; border-radius:6px; margin-bottom:20px;} .hs-gallery-image-container {width:100%; height:0px; padding-bottom:100%; position:relative; background-size:cover; background-position:center; background-repeat:no-repeat; cursor: pointer;} .hs-gallery-image-box {position:absolute; left:0px; top:0px; display: table; width: 100%; height:100%; height:100%;} .hs-gallery-image {display: table-cell; vertical-align: middle;} .hs-gallery-image img {max-width: 100%; max-height: 100%; display: block; margin: 0 auto;}';

		gallerycss = gallerycss + '#hs-gallery-viewer-overlay {position:fixed; left:0px; top:0px; width:100%; height:0px; background:rgba(0,0,0,0.8); z-index:119999; overflow: hidden; opacity:0; -webkit-transition:opacity 0.3s; transition:opacity 0.3s;} .hs-gallery-viewer-overlay-open {opacity:1 !important;}';

		gallerycss = gallerycss + '#hs-gallery-viewer-container {position:absolute; left:0px; top:0px; width:100%; height:100vh; display: table; } #hs-gallery-viewer-vertalign { display: table-cell; vertical-align: middle; } #hs-gallery-viewer-horizalign { width:100%; margin:0 auto; } #hs-gallery-viewer { } #hs-gallery-viewer img { display:block; max-width:100% !important; max-height:100vh !important; margin:0 auto; }';

		gallerycss = gallerycss + '.hs-gallery-viewer-control {color:#fff; -webkit-transition:opacity 0.3s; transition:opacity 0.3s;} #hs-gallery-viewer-close {position:absolute; width:42px; height:42px; right:0px; top:0px; text-align:center; z-index:10; padding:9px; opacity:0.7;} #hs-gallery-viewer-close:hover {opacity:1; cursor:pointer;} #hs-gallery-viewer-close svg {width:42px; height:42px;} .hs-gallery-viewer-arrow {position:absolute; top:0px; height:100%; width:120px; text-align:center; z-index:9; opacity:0.4; } .hs-gallery-viewer-arrow:hover {opacity:1; cursor:pointer;} #hs-gallery-viewer-left {left:0px;} #hs-gallery-viewer-right {right:0px;} .hs-gallery-viewer-arrow-icon {position:absolute; top:50%; width:42px; height:42px; margin-top:-21px; } .hs-gallery-viewer-arrow-icon svg {width:42px; height:42px;}';

		gallerycss = gallerycss + '#hs-gallery-viewer-left .hs-gallery-viewer-arrow-icon {left:9px;} #hs-gallery-viewer-right .hs-gallery-viewer-arrow-icon {right:9px;}';

		gallerycss = gallerycss + '#hs-gallery-viewer-left {background: linear-gradient(to right,  rgba(0,0,0,1) 0%,rgba(0,0,0,0.99) 1%,rgba(0,0,0,0) 100%);} #hs-gallery-viewer-right {background: linear-gradient(to right,  rgba(0,0,0,0) 0%,rgba(0,0,0,0.01) 1%,rgba(0,0,0,1) 100%);}';



		gallerycss = gallerycss + '@media (min-width: 680px) and (max-width:1160px) {}';

		gallerycss = gallerycss + '@media (max-width: 680px) { .hs-gallery-grid-item-33, .hs-gallery-grid-item-25, .hs-gallery-grid-item-20, .hs-gallery-grid-item-16 {width:50%;} }';


		gallerystyles.innerHTML = gallerycss;
	} 


	var galleryoverlay = document.getElementById("hs-gallery-viewer-overlay");
	if(!galleryoverlay) {
		var galleryviewer = document.createElement("DIV");

		var galleryviewerstring = '<div id="hs-gallery-viewer-overlay">';

		galleryviewerstring = galleryviewerstring + '<div id="hs-gallery-viewer-container"><div id="hs-gallery-viewer-vertalign"><div id="hs-gallery-viewer-horizalign"><div id="hs-gallery-viewer"><img id="hs-gallery-viewer-image" src="" /></div></div></div></div>';

		galleryviewerstring = galleryviewerstring + '<div class="hs-gallery-viewer-control" id="hs-gallery-viewer-close"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>';

		galleryviewerstring = galleryviewerstring + '<div class="hs-gallery-viewer-arrow hs-gallery-viewer-control" id="hs-gallery-viewer-left"><div class="hs-gallery-viewer-arrow-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg></div></div>';

		galleryviewerstring = galleryviewerstring + '<div class="hs-gallery-viewer-arrow hs-gallery-viewer-control" id="hs-gallery-viewer-right"><div class="hs-gallery-viewer-arrow-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg></div></div>';

		galleryviewerstring = galleryviewerstring + '</div>';

		galleryviewer.innerHTML = galleryviewerstring;




		galleryoverlay = galleryviewer.querySelector("#hs-gallery-viewer-overlay");
		var displayimage = galleryviewer.querySelector("#hs-gallery-viewer-image");


		showGallery = function(imagetoshow) {
			displayimage.src = imagetoshow;
			if(!hasClass(galleryoverlay, "hs-gallery-viewer-overlay-open")) {
				galleryoverlay.className = galleryoverlay.className + " hs-gallery-viewer-overlay-open";
				galleryoverlay.style.height = "100%";
			}
		};

		hideGallery = function() {
			displayimage.src = "";
			galleryoverlay.className = galleryoverlay.className.replace(" hs-gallery-viewer-overlay-open", "");
			setTimeout(function() {
				galleryoverlay.style.height = "0px";
			}, 300);
		};


		var closegallery = galleryviewer.querySelector("#hs-gallery-viewer-close");
		closegallery.onclick = function() {
			hideGallery();
		};

		var prevarrow = galleryviewer.querySelector("#hs-gallery-viewer-left");
		prevarrow.onclick = function() {

			for(var i=0; i<loadedgalleries.length; i++) {
				if(displayimage.src.indexOf(loadedgalleries[i]) !== -1) {
					if(i==0) {
						displayimage.src = loadedgalleries[(loadedgalleries.length-1)];
					}
					else {
						displayimage.src = loadedgalleries[i-1];
						break;
					}
				}
			}

		};

		var nextarrow = galleryviewer.querySelector("#hs-gallery-viewer-right");
		nextarrow.onclick = function() {
			
			for(var i=0; i<loadedgalleries.length; i++) {
				
				if(displayimage.src.indexOf(loadedgalleries[i]) !== -1) {
					
					if(typeof loadedgalleries[i+1] != 'undefined') {
						displayimage.src = loadedgalleries[i+1];
						break;
					}
					else {
						displayimage.src = loadedgalleries[0];
					}
				}
			}

			
		};

		document.body.appendChild(galleryviewer.firstChild);

	}

};


var initImage = function(thisimage) {
	return function() {

		var thisfile=thisimage.getAttribute("data-image");

		var preload = new Image();
		preload.src = thisfile;

		thisimage.onclick = function() {
			showGallery(thisfile);
		}

		loadedgalleries.push(thisfile);

	};
};


var initGallery = function(gallerycontainer, callback) {
	return function() {

		initGalleryUI();

		loadedgalleries = [];

		var images = gallerycontainer.querySelectorAll(".hs-gallery-image-container");
		for(var i=0; i<images.length; i++) {
			initImage(images[i])();
		}

	};
};


var generateGallery = function(gallerydata) {

	var addelemstring = '';

	if(gallerydata.length > 0) {

		addelemstring = '<div class="hs-gallery-grid">';

		for(var i=0; i<gallerydata.length; i++) {
			addelemstring = addelemstring + '<div class="hs-gallery-grid-item hs-gallery-grid-item-16"><div class="hs-gallery-grid-block">';

			addelemstring = addelemstring + '<div class="hs-gallery-image-item"><div class="hs-gallery-image-container" data-image="'+gallerydata[i]+'" style="background-image:url(\''+gallerydata[i]+'\');">';

			//addelemstring = addelemstring + '<div class="hs-gallery-image-box"><div class="hs-gallery-image"><img src="'+gallerydata.images[i].thumb+'"></div></div>';

			addelemstring = addelemstring + '</div></div>';

			addelemstring = addelemstring + '</div></div>';

		} 

		addelemstring = addelemstring + '</div>';

	}

	return addelemstring;

};


var loadGallery = function(gallerycontainer) {
	return function() {
		gallerycontainer.innerHTML = '';
		
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == XMLHttpRequest.DONE ) {
				var returndata;
				if (xhttp.status == 200) {
					returndata = JSON.parse(xhttp.responseText);

					var addtogallerycontent = generateGallery(returndata);
					if(addtogallerycontent != '') {
						gallerycontainer.innerHTML = addtogallerycontent;
						initGallery(gallerycontainer)();
					}
					else {
						gallerycontainer.innerHTML = 'No images to show.';
					}
				}
				else {
					console.log("Could not get gallery");
				}
			}
		};
		xhttp.open("GET", "gallery.json", true);
		xhttp.send();

	};
};






























var showReviewModal = function() {};
var hideReviewModal = function() {};


var initReviewUI = function() {

	var reviewstyles = document.getElementById("hs-review-styles");
	if(!reviewstyles) {
		reviewstyles = document.createElement("STYLE");
		reviewstyles.type = "text/css";
		reviewstyles.id = "hs-review-styles";

		document.head.appendChild(reviewstyles);

		var reviewcss = '#hs-review-overlay {position:fixed; left:0px; top:0px; width:100%; height:0px; background:rgba(0,0,0,0.7); overflow-y: hidden; z-index:119999; overflow: hidden; opacity:0; -webkit-transition:opacity 0.3s; transition:opacity 0.3s; } .hs-review-overlay-open {opacity:1 !important;}';

		reviewcss = reviewcss + '#hs-review-modal-container {position:absolute; left:0px; top:0px; width:100%; height:100%; display: table;}';

		reviewcss = reviewcss + '#hs-review-modal-vertalign {display: table-cell; vertical-align: middle;}';

		reviewcss = reviewcss + '#hs-review-modal-horizalign {width:94%; max-width: 520px; padding:50px 0; margin:0 auto;}';

		reviewcss = reviewcss + '#hs-review-modal {background:#fff; border-radius:10px; padding:30px; opacity:0; -webkit-transition:transform 0.1s ease, opacity 0.1s; transition:transform 0.1s ease, opacity 0.1s; will-change: transform, opacity, visibility; -webkit-transform:scale(0.9); transform:scale(0.9);} .hs-review-overlay-open #hs-review-modal {-webkit-transform:scale(1); transform:scale(1); opacity:1;}';

		reviewcss = reviewcss + '.hs-review-modal-control {color:#fff; -webkit-transition:opacity 0.3s; transition:opacity 0.3s;} #hs-review-modal-close {position:absolute; width:42px; height:42px; right:0px; top:0px; text-align:center; z-index:10; padding:9px; opacity:0.7;} #hs-review-modal-close:hover {opacity:1; cursor:pointer;} #hs-review-modal-close svg {width:42px; height:42px;}';

		reviewcss = reviewcss + '';

		reviewstyles.innerHTML = reviewcss;
	} 
};


var initReviews = function(reviewcontainer, callback) {
	return function() {

		initReviewUI();

		// Show more buttons
		var toggleShowMore = function(showmore) {
			return function() {
				var contentwindow = showmore.parentNode.parentNode;
				var contentheight = showmore.parentNode.querySelector(".hs-testimonial-content").offsetHeight;

				showmore.style.opacity = '0';
				setTimeout(function() {
					if(hasClass(contentwindow, "hs-testimonial-content-window-open")) {
						// Close
						contentwindow.className = contentwindow.className.replace(" hs-testimonial-content-window-open", "");
						contentwindow.style.height = "80px";
						showmore.innerHTML = 'Show more...';
					}
					else {
						// Open
						contentwindow.className = contentwindow.className + " hs-testimonial-content-window-open";
						contentwindow.style.height = contentheight+"px";
						showmore.innerHTML = 'Show less...';
					}
					setTimeout(function() {
						showmore.style.opacity = '1';
					}, 300);
				}, 150);


			};
		};

		var showmores = reviewcontainer.querySelectorAll(".hs-testimonial-content-readmore");
		for(var j=0; j<showmores.length; j++) {
			showmores[j].onclick = toggleShowMore(showmores[j]);
		}

	};
};




var generateReviews = function(reviewdata) {
		
	var addelemstring = '';

	// Show reviews
	addelemstring = addelemstring + '<div>';

	if(reviewdata.length > 0) {

		addelemstring = addelemstring + '<div class="hs-slider-container"><div class="hs-slider-control hs-slider-control-prev"><div class="hs-slider-control-icon"><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 516.1" style="enable-background:new 0 0 512 516.1;" xml:space="preserve"><path d="M363.6,34.2l-15.7,15.7l0,0L126,271.8c-7.8,7.8-20.5,7.8-28.3,0s-7.8-20.5,0-28.3l15.7-15.7l0,0L335.3,5.9 c7.8-7.8,20.5-7.8,28.3,0C371.4,13.7,371.4,26.3,363.6,34.2z" fill="#fff" /><path d="M126,243.4c-7.8-7.8-20.5-7.8-28.3,0s-7.8,20.5,0,28.3l15.2,15.2l0.5,0.5l221.9,221.9c7.8,7.8,20.5,7.8,28.3,0 s7.8-20.5,0-28.3" fill="#fff" /></svg></div></div><div class="hs-slider-control hs-slider-control-next"><div class="hs-slider-control-icon"><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 516.1" style="enable-background:new 0 0 512 516.1;" xml:space="preserve"><path class="st0" d="M150.7,5.9c7.8-7.8,20.5-7.8,28.3,0l221.9,221.9l0,0l15.7,15.7c7.8,7.8,7.8,20.5,0,28.3 c-7.8,7.8-20.5,7.8-28.3,0L166.4,49.9l0,0l-15.7-15.7C142.9,26.3,142.9,13.7,150.7,5.9z" fill="#fff" /><path class="st0" d="M150.7,481c-7.8,7.8-7.8,20.5,0,28.3c7.8,7.8,20.5,7.8,28.3,0l221.9-221.9l0.5-0.5l15.2-15.2 c7.8-7.8,7.8-20.5,0-28.3c-7.8-7.8-20.5-7.8-28.3,0" fill="#fff" /></svg></div></div><div class="hs-slider-area"><div class="hs-slider-content">';

		var starstring;
		for(var i=0; i<reviewdata.length; i++) {
			addelemstring = addelemstring + '<div class="hs-slider-item">';

			starstring = '';
			for(var j=0; j<(parseInt(reviewdata[i].rating)/2); j++) {
				starstring = starstring + '<div class="hs-testimonial-star"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>';
			}

			addelemstring = addelemstring + '<div class="hs-testimonial-item"><div class="hs-testimonial-inner"><div class="hs-testimonial-stars">'+starstring+'</div><div class="hs-testimonial-name">'+reviewdata[i].author+'</div><div class="hs-testimonial-content-window"><div class="hs-testimonial-content-inner"><div class="hs-testimonial-content">'+reviewdata[i].content+'</div><div class="hs-testimonial-content-readmore">Show more...</div></div></div></div></div>';

			addelemstring = addelemstring + '</div>';
		}

		addelemstring = addelemstring + '<div class="hs-clr"></div></div></div></div>';

	}
	else {
		addelemstring = addelemstring + '<div style="text-align:center;"><em>There are no reviews to display.</em></div>';
	}

	addelemstring = addelemstring + '</div>';


	return addelemstring;

};




var loadReviews = function(reviewcontainer) {
	return function() {
		reviewcontainer.innerHTML = '';
		
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == XMLHttpRequest.DONE ) {
				var returndata;
				if (xhttp.status == 200) {
					returndata = JSON.parse(xhttp.responseText);

					reviewcontainer.innerHTML = generateReviews(returndata);
					initReviews(reviewcontainer)();
				}
				else {
					console.log("Could not get reviews");
				}
			}
		};
		xhttp.open("GET", "reviews.json", true);
		xhttp.send();

	};
};









window.onload = function() {
	if(document.body.getAttribute("data-dev-mode") === "true") {
		//livemode = false;
	}
	
	
	
	initParallax();
	
	setTimeout(function() {
		initSliders();
	}, 1000);
	
	sizePositionFunctions();
	initScrollTo();
	initMobileMenu();
	
	
	
	if(id("hs-loading-overlay")) {
		setTimeout(function() {
			var loadingoverlay = id("hs-loading-overlay");
			var loadinglogo = id("hs-loading-logo-bounding");
			
			loadinglogo.className = "hs-loading-logo-loaded";
			
			setTimeout(function() {
				
				loadingoverlay.className = "hs-loading-overlay-loaded";
				
				setTimeout(function() {
					loadinglogo.parentNode.removeChild(loadinglogo);
					loadingoverlay.parentNode.removeChild(loadinglogo);
				}, 1000);
				
			}, 550);
			
		}, 700);
	}
	
	if(id("hs-totop-button")) {
		var hstotop = id("hs-totop-button");
		hstotop.onclick = function() {
			pageScrollTo(0);
		}
	}
	
	var hsforms = document.querySelectorAll(".hs-form");
	for(var j=0; j<hsforms.length; j++) {
		hsforms[j].onsubmit = checkForm(hsforms[j]);
	}
	
	var hsgalleries = document.querySelectorAll(".hs-gallery");
	for(var i=0; i<hsgalleries.length; i++) {
		loadGallery(hsgalleries[i])();
	}
	
	var hsreviews = document.querySelectorAll(".hs-review-container");
	for(var k=0; k<hsreviews.length; k++) {
		loadReviews(hsreviews[k])();
	}
	
};

window.onresize = function() {
	sizePositionFunctions();
};

window.onscroll = function() {
	var scrollpos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
	
	if(id("hs-header")) {
		var hsheader = id("hs-header");
		
		if(scrollpos > 0 && !hasClass(hsheader, "hs-header-fixed")) {
			hsheader.className = hsheader.className + " hs-header-fixed";
		}
		else if(scrollpos <= 0) {
			hsheader.className = hsheader.className.replace(" hs-header-fixed", "");
		}
	}
	
	if(id("hs-totop-button")) {
		var totopbutton = id("hs-totop-button");
		
		if(scrollpos > 150 && !hasClass(totopbutton, "hs-totop-button-visible")) {
			totopbutton.className = totopbutton.className + " hs-totop-button-visible";
		}
		else if(scrollpos <= 150) {
			totopbutton.className = totopbutton.className.replace(" hs-totop-button-visible", "");
		}
	}
	
	positionStickies();
	scrollParallaxBG();
};