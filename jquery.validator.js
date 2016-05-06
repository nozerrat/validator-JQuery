/*!
 * Validator v0.1
 * Copyright Created by CARLOS on 17-03-2016.
 * Licensed under MIT
 */

/** @lends <global> */
+function( window, document, undefined ) {

if (typeof window.jQuery === 'undefined') {
	throw new Error('Validator\'s JavaScript requires jQuery')
}

+function ($) {
	'use strict';
	var version = $.fn.jquery.split(' ')[0].split('.');
	if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
		throw new Error('Validator\'s JavaScript requires jQuery version 1.9.1 or higher')
	}
}(window.jQuery);

+function( factory ) {
	"use strict";
	// Define as an AMD module if possible
	if ( typeof define === 'function' && define.amd ) {
		define( ['jquery'], factory );
	}
	/* Define using browser globals otherwise
	 * Prevent multiple instantiations if the script is loaded twice
	 */
	else if ( window.jQuery && !window.jQuery.Validator ) {
		factory( window.jQuery );
	}

}(function( $ ) {
	// Contructor
	var Validator = function (options) {
		_clean();
		var lang, _messages = {}, create = {};

		try{ lang      = options['lang'];     }catch(err){}
		try{ _messages = options['messages']; }catch(err){}
		try{ create    = options['create'];   }catch(err){}

		Validator.local = lang || Validator.local;
		_extendRulesMsg(_messages);
		_extendRulesMsg(_convertToRulesMsg(create));
		$.extend(Validator.rules.other, create);

		return this;
	};

	Validator.local = 'es';

	Validator.field = 0;

	Validator.fail = {};
	Validator.fail.failed = {};
	Validator.fail.element = {};
	Validator.fail.messages = {};

	Validator.rules = {};
	Validator.rules.fn = {};
	Validator.rules.rules = {};
	Validator.rules.other = {};
	Validator.rules.messages = {};
	Validator.rules.messages.es = {
		alpha          :'El atributo :attr puede contener solo letras'
		,alpha_dash    :'El atributo :attr puede contener solo letras, numeros y _.'
		,alpha_num     :'El atributo :attr puede contener solo letras, numeros'
		,between       :''
		,date_format   :'El atributo :attr no es identico el formato :format'
		,digits        :'El atributo :attr debe tener :digits digitos exactos'
		,digits_between:'El atributo :attr debe estar entre :min a :max digitos'
		,email         :'El atributo :attr tiene el formato correo invalido'
		,image         :'El atributo :attr debe ser una imagen'
		,in            :'El seleccionado atributo :attr es invalido, debe incluir algunos de los valores :param'
		,integer       :'El atributo :attr debe ser un entero'
		,ip            :'El atributo :attr debe ser una IP valida'
		,max           :{
			number         :"El atributo :attr no debe tener una cantidad maximo de :max"
			,file          :"El atributo :attr no debe tener una maximo de :max bytes"
			,string        :"El atributo :attr no debe tener una maximo de :max characteres"
		}
		,mimes         :'El atributo :attr debe ser un archivo de tipo: :param'
		,min           :{
			number         :"El atributo :attr debe tener una cantidad minimo de :min"
			,file          :"El atributo :attr debe tener una minimo de :min bytes"
			,string        :"El atributo :attr debe tener una minimo de :min characteres"
		}
		,not_in        :'El seleccionado :attr es invalido'
		,numeric       :'El atributo :attr debe ser un número'
		,regex         :'El atributo :attr tiene formato invalido'
		,required      :'El campo :attr es requerido'
		,required_if   :'El campo :attr es requerido si el campo :other contiene el valor :other_value'
		,required_less :'El campo :attr es requerido si el campo :other no contiene el valor :other_value'
		,required_with :'El campo :attr es requerido con los siguientes campos ":param"'
		,required_without :'El campo :attr es requerido sin los siguientes campos ":param"'
		,same          :'El campo :attr y el campo :other debe ser identico'
		,size          :{
			number         :"El atributo :attr debe coincidir con la cantidad :size"
			,file          :"El atributo :attr debe coincidir con la cantidad :size bytes"
			,string        :"El atributo :attr debe coincidir con la cantidad :size characteres"
		}
		,text          :''
	};

	Validator.rules.fn.alpha = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			// ASCII lATIN1
			if (!value.match(/^[a-zA-Zá-üÁ-Ü\s]*$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.alpha_dash = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			// ASCII lATIN1
			if (!value.match(/^[0-9a-zA-Zá-üÁ-Ü\s_\-\.,\(\)]*$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.alpha_num = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			// ASCII lATIN1
			if (!value.match(/^[0-9a-zA-Zá-üÁ-Ü\s\.]*$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.between = function (rule, field, value, param, messages) {};
	Validator.rules.fn.date_format = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var p = param[0].replace(/([dmy]{1,1})+.([dmy]{1,1})+.([dmy]{1,1})+/i,'$1-$2-$3')
				,v = value;

			if(p.match(/Y-M-D/i))
				if(value.match(/^([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+$/))
					v = value.replace(/([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+/,'$1-$2-$3');
				else v = "''";
			if(p.match(/M-D-Y/i))
				if(value.match(/^([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+$/))
					v = value.replace(/([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+/,'$3-$1-$2');
				else v = "''";
			if(p.match(/D-M-Y/i))
				if(value.match(/^([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+$/))
					v = value.replace(/([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+/,'$2-$1-$3');
				else v = "''";
			if(p.match(/Y-D-M/i))
				if(value.match(/^([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+$/))
					v = value.replace(/([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+/,'$1-$3-$2');
				else v = "''";
			if(p.match(/M-Y-D/i))
				if(value.match(/^([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+$/))
					v = value.replace(/([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+/,'$2-$1-$3');
				else v = "''";
			if(p.match(/D-Y-M/i))
				if(value.match(/^([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+$/))
					v = value.replace(/([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+/,'$2-$3-$1');
				else v = "''";

			if(new Date(v).toString()=='Invalid Date')
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.digits = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			if (value.length != param[0])
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.digits_between = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		param[1] = param[1]||'';
		if(!param.length || !param[0].match(/^[0-9]+$/) || !param[1].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			if (value.length < parseInt(param[0]) || value.length > parseInt(param[1]) )
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.email = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			if (!value.match(/^.+@.+[^\.]\..+$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.image = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			if (!value.match(/^.*\.jpg$|\.jpeg$|\.png$|\.bmp$|\.gif$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.in = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var fail = true;
			$.each(param, function (index, val) { if(fail && value==val) fail = false; });
			if (fail)
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.integer = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			if (!value.match(/^[0-9].*$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.ip = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			if (!value.match(/^([0-9]){1,3}\.([0-9]){1,3}\.([0-9]){1,3}\.([0-9]){1,3}$/))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.max = function (rule, field, value, param, messages) {
		param[1] = param[0];
		param[0] = param[0]||'';
		if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var len = value.length, type = 'string';
			if($('[v_field='+field+']').attr('type')=='number'){
				len = parseInt(value);
				type = 'number';
			}
			if($('[v_field='+field+']').attr('type')=='file'){
				len = $('[v_field='+field+']')[0].files[0].size;
				type = 'file';
			}
			if (len > parseInt(param[0])) {
				messages[Validator.local][rule+'-'+type] = messages[Validator.local][rule][type];
				_applyMessageFail(rule,field,_getMsg(rule+'-'+type, field, value, param, messages));
			}
		}
	};
	Validator.rules.fn.mimes = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var fail = true;
			if($('[v_field='+field+']').attr('type')=='file'){
				$.each(param, function (index, val) {
					var regexp = new RegExp(val.replace('/','\\/'),'i')
						,match = regexp.exec($('[v_field='+field+']')[0].files[0].type) || [];
					if( fail && match[0] ) fail = false;
				});
			}
			if (fail)
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.min = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var len = value.length, type = 'string';
			if($('[v_field='+field+']').attr('type')=='number'){
				len = parseInt(value);
				type = 'number';
			}
			if($('[v_field='+field+']').attr('type')=='file'){
				len = $('[v_field='+field+']')[0].files[0].size;
				type = 'file';
			}
			if (len < parseInt(param[0])) {
				messages[Validator.local][rule+'-'+type] = messages[Validator.local][rule][type];
				_applyMessageFail(rule,field,_getMsg(rule+'-'+type, field, value, param, messages));
			}
		}
	};
	Validator.rules.fn.not_in = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var fail = true;
			$.each(param, function (index, val) { if(fail && value==val) fail = false; });
			if (!fail)
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.numeric = function (rule, field, value, param, messages) {
		if (value!='' && typeof value!='undefined') {
			if (!$.isNumeric(value.replace(',','.')))
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.regex = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var regexp = new RegExp(param[0].replace('/','\\/'),'i')
				,match = regexp.exec(value) || [];
			if (!match[0])
				_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
		}
	};
	Validator.rules.fn.required = function (rule, field, value, param, messages) {
		if (value==="" || value===false || value===null)
			_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
	};
	Validator.rules.fn.required_if = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if ((param.length%2)!=0) throw console.error('Los valores del parametro del rol {'+rule+'} deben ser de campo-valor. Ej. field1,value1,field2,value2,...');

		var pa = [], val;

		$.each(param, function (key, field_val) {
			if((key%2)==0) {
				pa.push(field_val);
				val = $('[id="'+field_val+'"]').val()||$('[name="'+field_val+'"]').val();
			} else {
				pa.push(field_val||null);
				if ((value==="" || value===false || value===null) && ($.trim(val)==$.trim(field_val)))
					_applyMessageFail(rule,field,_getMsg(rule, field, value, pa, messages));
				pa = [];
			}
		});
	};
	Validator.rules.fn.required_less = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if ((param.length%2)!=0) throw console.error('Los valores del parametro del rol {'+rule+'} deben ser de campo-valor. Ej. field1,value1,field2,value2,...');

		var _param = [], val;

		$.each(param, function (key, field_val) {
			if((key%2)==0) {
				_param.push(field_val);
				val = $('[id="'+field_val+'"]').val()||$('[name="'+field_val+'"]').val();
			} else {
				_param.push(field_val||null);
				if ((value==="" || value===false || value===null) && ($.trim(val)!=$.trim(field_val)))
					_applyMessageFail(rule,field,_getMsg(rule, field, value, _param, messages));
				_param = [];
			}
		});
	};
	Validator.rules.fn.required_with = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		var fail = [];
		$.each(param, function (index, _field) {
			if(!fail.length && !$('[id="'+_field+'"],[name="'+_field+'"]')[0]) fail.push(true);
		});
		if (fail.length)
			_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
	};
	Validator.rules.fn.required_without = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		var fail = [];
		$.each(param, function (index, _field) {
			if(!fail.length && !!$('[id="'+_field+'"],[name="'+_field+'"]')[0]) fail.push(true);
		});
		if (fail.length)
			_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
	};
	Validator.rules.fn.same = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		var fail = $('[id="'+field+'"],[name="'+field+'"]').v_make(Validator.rules.rules[param[0]]);
		var same = $('[id="'+param[0]+'"],[name="'+param[0]+'"]');
		if (fail.v_fails() || value!=same.val())
			_applyMessageFail(rule,field,_getMsg(rule, field, value, param, messages));
	};
	Validator.rules.fn.size = function (rule, field, value, param, messages) {
		param[0] = param[0]||'';
		if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
		if (value!='' && typeof value!='undefined') {
			var len = value.length, type = 'string';
			if($('[v_field='+field+']').attr('type')=='number'){
				len = parseInt(value);
				type = 'number';
			}
			if($('[v_field='+field+']').attr('type')=='file'){
				len = $('[v_field='+field+']')[0].files[0].size;
				type = 'file';
			}
			if (len != parseInt(param[0])) {
				messages[Validator.local][rule+'-'+type] = messages[Validator.local][rule][type];
				_applyMessageFail(rule,field,_getMsg(rule+'-'+type, field, value, param, messages));
			}
		}
	};
	Validator.rules.fn.text = function (rule, field, value, param, messages) {};

	var _clean = function(ban){
		if((typeof ban=='undefined')? true : (ban ? true : false)) {
			Validator.field = 1;
			Validator.fail.messages = {};
			Validator.fail.failed   = {};
		}
	};

	var _getMsg = function(rule, field, value, param, messages){
		return (messages[Validator.local][rule] ? messages[Validator.local][rule] : (messages[Validator.local][field] ? messages[Validator.local][field] : Validator.rules.messages[Validator.local][rule]))
			.replace(":attr", field)
			.replace(":value", value)
			.replace(":rule", rule)
			.replace(":param", param.join(','))
			.replace(":format", param[0])
			.replace(":digits", param[0])
			.replace(":min", param[0])
			.replace(":max", param[1])
			.replace(":other", param[0])
			.replace(":other_value", param[1])
			.replace(":size", param[0])
	};

	var _applyMessageFail = function(rule,field,message){
		if($.isArray(Validator.fail.messages[field])){
			if( Validator.fail.messages[field].indexOf(message)==(-1)){
				Validator.fail.messages[field].push(message);
			}
		}else{
			Validator.fail.element[field] = $('[v_field='+field+']');
			Validator.fail.messages[field] = [message];
		}
		if($.isArray(Validator.fail.failed  [field])){
			if( Validator.fail.failed[field].indexOf(message)==(-1)){
				Validator.fail.failed[field].push(rule);
			}
		}else{
			Validator.fail.messages[field] = [message];
			Validator.fail.failed[field] = [rule];
		}
	};

	var _extendRulesMsg = function(rulesMessages, rulesMessages_2, noExtend) {
		var _messages = {};
		if(typeof rulesMessages_2 === 'undefined') { // estender en general
			try{
				$.each(rulesMessages, function (lang, obj) {
					$.each(obj, function (rol, msg) {
						if(typeof Validator.rules.messages[lang] === 'undefined') Validator.rules.messages[lang] = {};
						Validator.rules.messages[lang][rol] = msg;
					});
				});
			}catch(err){}
		} else {
			if(typeof rulesMessages_2==='boolean' && typeof noExtend==='undefined') {
				$.each(Validator.rules.messages, function (lang, obj) {
					$.each(obj, function (rol, msg) {
						if(typeof _messages[lang] === 'undefined') _messages[lang] = {};
						_messages[lang][rol] = msg;
					});
				});
				try{
					$.each(rulesMessages, function (lang, obj) {
						$.each(obj, function (rol, msg) {
							if(typeof _messages[lang] === 'undefined') _messages[lang] = {};
							_messages[lang][rol] = msg;
						});
					});
				}catch(err){}
			} else {
				try{
					$.each(rulesMessages, function (lang, obj) {
						$.each(obj, function (rol, msg) {
							if(typeof _messages[lang] === 'undefined') _messages[lang] = {};
							_messages[lang][rol] = msg;
						});
					});
					$.each(rulesMessages_2, function (lang, obj) {
						$.each(obj, function (rol, msg) {
							if(typeof _messages[lang] === 'undefined') _messages[lang] = {};
							_messages[lang][rol] = msg;
						});
					});
				}catch(err){}
			}
		}
		return _messages;
	};

	var _convertToRulesMsg = function(createdRules) {
		var _messages = {};
		if(typeof createdRules !== 'undefined') {
			$.each(createdRules, function (rol, obj) {
				$.each(obj, function (lang, msg) {
					if(lang !== 'fn') {
						var rule = {};
						var rules = {};
						rule[rol] = msg;
						rules[lang] = rule;
						if(typeof _messages[lang] === 'undefined')
							_messages[lang] = {};

						$.each(rules, function (lang, obj) {
							$.each(obj, function (rol, msg) {
								_messages[lang][rol] = msg;
							});
						});
					}
				});
			});
		}
		return _messages;
	};

	var _operation = function(elem, rules, messages, other) {
		var field = elem.attr('v_field')
			,value = elem.val();

		if(!rules) return;
		if(!$.isArray(rules)) rules = rules.split("|");
		if(!$.isArray(value)) value = $.trim(value);

		var param = [];

		$.each(rules, function( key_rol, rule ) {
			rule = $.trim(rule);
			if (rule.match(/:/)) {
				var temp_rol = [];
				$.each(rule.split(":"), function (index, val) {
					if(index) temp_rol.push(val);
				});
				rule = rule.split(":",1)[0];
				if (rule.match(/regex/)) {
					param[0] = temp_rol.join(':');
				} else {
					param = temp_rol.join(':').split(",");
				}
			}

			try{
				Validator.rules.fn[rule](rule, field, value, param, messages);
			}catch (err) {
				try{
					if(!other[rule].fn(value, param, Validator)){
						var message = _getMsg(rule, field, value, param, messages);
						_applyMessageFail(rule,field,message);
					}
				}catch (err) {
					//console.log('Error: El rol "'+rule+'" no esta definido')
				}
			}
		});
	};

	var _make = function(rules, options) {
		var _messages = {}, create = {}, other;
		try{ create = options['create']; }catch(err){}
		try{ _messages = options['messages']; }catch(err){}

		other = $.extend({}, Validator.rules.other, create);
		_messages  = _extendRulesMsg(_messages, false);
		_messages  = _extendRulesMsg(_messages, _convertToRulesMsg(create));

		return this.each(function() {
			var self = this, elem = $(this), field;
			$(self).ready(function () {
				field = Validator.field++;
				elem.attr('v_field', field);
				Validator.rules.rules[field] = rules;
				_operation(elem, rules, _messages, other);
			});
		});
	};

	/**
	 * Indica si tiene errores
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Boolean
	 **/
	var _fails = function() {
		return Object.keys(Validator.fail.failed).length > 0 || Object.keys(Validator.fail.messages).length > 0;
	};

	/**
	 * Indica si no tiene errores
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Boolean
	 **/
	var _passes = function() {
		return Object.keys(Validator.fail.failed).length == 0 || Object.keys(Validator.fail.messages).length == 0;
	};

	/**
	 * Retorna todos los mensages fallidos
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @param format
	 * @return Array
	 **/
	var _messages = function(format) {
		var _messages = {};
		if (format) {
			if (Object.keys(Validator.fail.messages).length) {
				$.each(Validator.fail.messages, function (field, messages) {
					var temp = [];
					$.each(messages, function (index, message) {
						temp.push( format.replace(':message', message) );
					});
					_messages[field] = temp;
				});
			}
		}
		return Object.keys(_messages).length ? _messages : Validator.fail.messages;
	};

	/**
	 * Retorna todos los roles fallidos
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Array
	 **/
	var _failed = function() {
		return Object.keys(Validator.fail.failed).length ? Validator.fail.failed : {};
	};

	/**
	 * Retorna el primer mensage del campo indicado
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Array
	 * @param format String
	 * @param obj Object
	 **/
	var _first = function(obj, format) {
		var temp
			,elem = obj?$(obj):$(this)
			,field = elem.attr('v_field');
		if (format) {
			try{
				Validator.fail.messages[typeof obj=='string' ? obj : field][0] = format.replace(':message', Validator.fail.messages[typeof obj=='string' ? obj : field][0]);
			}catch(err){}
		}
		try{
			temp = Validator.fail.messages[typeof obj=='string' ? obj : field][0];
		}catch(err){
			temp = '';
		}
		return temp;
	};

	/**
	 * Retorna el primer mensage del campo indicado
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Array
	 * @param format String
	 * @param obj Object
	 **/
	var _element = function(obj) {
		var temp
			,elem = obj ? $(obj) : $(this)
			,field = elem.attr('v_field');
		try{
			temp = Validator.fail.element[typeof obj=='string' ? obj : field];
		}catch(err){
			temp = {};
		}
		return temp;
	};

	/**
	 * Retorna todos mensages del campo indicado
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Array
	 * @param format String
	 * @param obj Object
	 **/
	var _get = function(obj, format) {
		var temp = []
			,elem = obj?$(obj):$(this)
			,field = elem.attr('v_field');
		if (format) {
			try{
				$.each(Validator.fail.messages[typeof obj=='string' ? obj : field], function (index, message) {
					temp.push( format.replace(':message', message) );
				});
			}catch(err){}
		}
		if(!temp.length){
			try{
				$.each(Validator.fail.messages[typeof obj=='string' ? obj : field], function (index, message) {
					temp.push( message );
				});
			}catch(err){}
		}
		return temp;
	};

	/**
	 * Aplica un mensaje de error
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Object
	 * @param msg String
	 * @param obj Object
	 **/
	var _set = function(obj, msg) {
		var elem = obj?$(obj):$(this)
			,field = elem.attr('v_field');
		try{
			Validator.fail.failed[typeof obj=='string' ? obj : field].push(true);
			Validator.fail.messages[typeof obj=='string' ? obj : field].push(msg);
		}catch(err){}
		return this;
	};

	/**
	 * Retorna todos mensages y todos los roles
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @param String  $format
	 * @return Array
	 **/
	var _all = function(format) {
		var _messages = {};
		if (format) {
			if (Object.keys(Validator.fail.messages).length) {
				$.each(Validator.fail.messages, function (field, messages) {
					var temp = [];
					$.each(messages, function (index, message) {
						temp.push( format.replace(':message', message) );
					});
					_messages[field] = temp;
				});
			}
		}

		return {
			element:Validator.fail.element
			,failed:Validator.fail.failed
			,messages: Object.keys(_messages).length ? _messages : Validator.fail.messages
		};
	};

	/**
	 * Indeca si un campo tiene mensage
	 * @author Carlos Garcia <garlos.figueroa@gmail.com>
	 * @return Boolean
	 * @param obj Object
	 **/
	var _has =  function(obj) {
		var bool = false;
		var elem = obj?$(obj):$(this)
			,field = elem.attr('v_field');
		try{
			bool = Object.keys(Validator.fail.messages[typeof obj=='string' ? obj : field]).length > 0;
		}catch(err){}

		return bool;
	};



	$.fn.v_make     = _make;
	$.fn.v_fails    = _fails;
	$.fn.v_passes   = _passes;
	$.fn.v_messages = _messages;
	$.fn.v_failed   = _failed;
	$.fn.v_first    = _first;
	$.fn.v_element  = _element;
	$.fn.v_get      = _get;
	$.fn.v_set      = _set;
	$.fn.v_all      = _all;
	$.fn.v_has      = _has;

	$.validator  = Validator;
	$.v_fails    = _fails;
	$.v_passes   = _passes;
	$.v_messages = _messages;
	$.v_failed   = _failed;
	$.v_first    = _first;
	$.v_element  = _element;
	$.v_get      = _get;
	$.v_set      = _set;
	$.v_all      = _all;
	$.v_has      = _has;
	$.v_clean    = _clean;

});
}(window, document);
