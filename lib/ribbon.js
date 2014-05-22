/*
 * ribbon
 * http://github.com/typesettin/ribbon
 *
 * Copyright (c) 2014 Yaw Joseph Etse. All rights reserved.
 */

'use strict';

var classie = require('classie'),
	extend = require('util-extend'),
	events = require('events'),
	util = require('util');

/**
 * A module that represents a ribbon.
 * @{@link https://github.com/typesettin/ribbon}
 * @author Yaw Joseph Etse
 * @copyright Copyright (c) 2014 Typesettin. All rights reserved.
 * @license MIT
 * @module ribbon
 * @requires module:classie
 * @requires module:util-extent
 * @requires module:util
 * @requires module:events
 * @todo to do later
 */
var ribbon = function(config_options,ribbon_message,show,timed,callback){
	/** module default configuration */
	var options,
		defaults = {
			idSelector : '#_mms_ribbon-element',
			message : false,
			element : null,
			type : "info",
			parentElement : null,
			style : 'cards',
		},
		container;

	defaults.message = (ribbon_message) ? ribbon_message : "empty ribbon";
	//extend default options
	options = extend( defaults,config_options );


	/** Returns the configuration object 
	 * @return {object} the module configuration
	 */
	this.config = function(){
		return options;
	};

	/** 
	 * The element to clone in child window
	 * @param {object} element - html element to clone
	 */
	this.setRibbonContentElement = function(element){
		options.element = element;
	};

	/**
	 * intialize a new platter
	 */
	this.init = function(ribbon_message,show,timed,callback){
		console.log(this.config());
		if(document.querySelector(options.idSelector)){
			options.element = document.querySelector(options.idSelector);
			if (options.parentElement){
				options.parentElement = options.parentElement;
			}
			else if(document.querySelector('._ribbon_parent-element')){
				options.parentElement = document.querySelector('._ribbon_parent-element');
			}
			else{
				options.parentElement = options.element.parentElement;
			}

			classie.addClass(options.parentElement,'_ribbon_parent-element');
			options.element.addEventListener('click',ribbonClickEventHandler,false);
			this.createContainer();
			this.createRibbon(options.idSelector);
			this.emit("intializedRibbon",true);
			if(show){
				this.showRibbon(ribbon_message,timed,options.type,callback);
			}
		}
		else{
			throw new Error("invalid element selector");
		}
	}.bind(this);

	this.setRibbonMessage = function(msg,hideDismiss){
		var hideDismissText = (hideDismiss) ? '':' <span class="_rb_small _rb-hide-ribbon">(dismiss)</span>';
		options.message = msg;
		options.element.innerHTML = options.message + hideDismissText;
	};

	/**
	 * create ribbon html container
	 */
	this.createContainer = function(){
		if(document.getElementById("_mms_ribbon-element-wrapper")){
			this.emit("ribbonContainerCreated",false);
		}
		else{
			var ribbonContainer = document.createElement('div');
			ribbonContainer.setAttribute("id","_mms_ribbon-element-wrapper");
			classie.addClass(ribbonContainer,'_mms_ribbon-element-wrapper');
			options.parentElement.appendChild(ribbonContainer);
			this.emit("ribbonContainerCreated",ribbonContainer);
		}
	};

	/**
	 * create ribbon html
	 * @param {string} id name for platter selector id
	 */
	this.createRibbon = function(id){
		var ribbonHTML = (document.querySelector(id)) ? document.querySelector(id) : document.createElement('div');
		/** create platter tab html */
		classie.addClass(ribbonHTML,'_mms_ribbon-element');
		classie.addClass(ribbonHTML,'future');
		classie.addClass(ribbonHTML,options.style);
		ribbonHTML.innerHTML =options.message;
		/** add platter tab to tab bar */
		document.querySelector('#_mms_ribbon-element-wrapper').appendChild(ribbonHTML);
		this.emit("ribbonCreated",ribbonHTML);
	};

	/** hides platter in bar */
	this.hideRibbon = function(){
		classie.addClass(options.element,'past');
		var t = setTimeout(function(){
			classie.removeClass(options.parentElement,'_mss-ribbon-active');
			classie.removeClass(options.element,'past');
			classie.addClass(options.element,'future');
			clearTimeout(t);
			this.emit("ribbonClosed",true);
		},900);
	};

	/** show platter in bar */
	this.showRibbon = function(msg,timed,type,hideDismiss,callback){
		// console.log("msg",msg,"timed",timed,"type",type,"callback",callback);
		if(hideDismiss === true && timed < 500 || timed > 20000){
			timed = 5000;
		}
		if(msg){
			var ribbonstyle = (type) ? type : options.type;
			switch(type){
				case "warn":
					classie.addClass(options.element,'_mms_ribbon-type-warn');
					classie.removeClass(options.element,'_mms_ribbon-type-error');
					classie.removeClass(options.element,'_mms_ribbon-type-success');
					classie.removeClass(options.element,'_mms_ribbon-type-info');
					classie.removeClass(options.element,'_mms_ribbon-type-default');
					break;
				case "success":
					classie.addClass(options.element,'_mms_ribbon-type-success');
					classie.removeClass(options.element,'_mms_ribbon-type-warn');
					classie.removeClass(options.element,'_mms_ribbon-type-error');
					classie.removeClass(options.element,'_mms_ribbon-type-info');
					classie.removeClass(options.element,'_mms_ribbon-type-default');
					break;
				case "info":
					classie.addClass(options.element,'_mms_ribbon-type-info');
					classie.removeClass(options.element,'_mms_ribbon-type-warn');
					classie.removeClass(options.element,'_mms_ribbon-type-success');
					classie.removeClass(options.element,'_mms_ribbon-type-error');
					classie.removeClass(options.element,'_mms_ribbon-type-default');
					break;
				case "error":
					classie.addClass(options.element,'_mms_ribbon-type-error');
					classie.removeClass(options.element,'_mms_ribbon-type-warn');
					classie.removeClass(options.element,'_mms_ribbon-type-success');
					classie.removeClass(options.element,'_mms_ribbon-type-info');
					classie.removeClass(options.element,'_mms_ribbon-type-default');
					break;
				default:
					classie.addClass(options.element,'_mms_ribbon-type-default');
					classie.removeClass(options.element,'_mms_ribbon-type-error');
					classie.removeClass(options.element,'_mms_ribbon-type-warn');
					classie.removeClass(options.element,'_mms_ribbon-type-success');
					classie.removeClass(options.element,'_mms_ribbon-type-info');
					break;
			}
			this.setRibbonMessage(msg,hideDismiss);

			classie.addClass(options.parentElement,'_mss-ribbon-active');
			var y = setTimeout(function(){
				classie.removeClass(options.element,'future');
				if(timed){
					var t = setTimeout(function(){
						clearTimeout(t);
						this.hideRibbon();
						callCallBack(callback);
						this.emit("ribbonOpened",true);
					}.bind(this),timed);
				}
				else{
					this.emit("ribbonOpened",true);
					callCallBack(callback);
				}
			}.bind(this),100);
		}
	}.bind(this);

	var ribbonClickEventHandler = function(e){
		var etarget = e.target;
		if(classie.hasClass(etarget,'_rb-hide-ribbon')){
			this.hideRibbon();
		}
	}.bind(this);

	this.init(ribbon_message,show,timed,callback);

	function callCallBack(callback){
		if(typeof callback ==='function'){
			callback();
		}
	}
};

util.inherits(ribbon,events.EventEmitter);

module.exports = ribbon;

// If there is a window object, that at least has a document property,
// define linotype
if ( typeof window === "object" && typeof window.document === "object" ) {
	window.ribbon = ribbon;
}