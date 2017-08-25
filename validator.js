(function( win, factory ) { factory( win ); }( window,function( win ){

   win.Validator = {
         error: false,
      
         success: true,
      
         fields: {/* 
            Se registran los elementos a validar. Ej:
            [name-field] => {
               forms: Object,
               rules: String,
               element: Object,
               helpBlock: Object,
               formGroup: Object,
            }
         */}, 
      
         options: {
            classHasError: 'has-error',
            classHasSuccess: 'has-success',
            classFormGroup: 'form-group',
            classHelpBlock: 'help-block',
            addClassHelpBlock: '',
            local: 'es',
            messages: {
               en: {},
               es: {
                  alpha:           'El campo <b>:title</b> puede contener solo letras',
                  alpha_dash:      'El campo <b>:title</b> puede contener solo letras, numeros y _.',
                  alpha_num:       'El campo <b>:title</b> puede contener solo letras, numeros',
                  between:         '',
                  date_format:     'El campo <b>:title</b>, tiene el formato de fecha incorrecto. Ej: :format',
                  digits:          'El campo <b>:title</b> debe tener <b>:digits</b> digitos exactos',
                  digits_between:  'El campo <b>:title</b> debe estar entre <b>:min</b> a <b>:max</b> digitos',
                  email:           'El campo <b>:title</b> tiene el formato correo invalido',
                  image:           'El campo <b>:title</b> debe ser una imagen',
                  in:              'El seleccionado campo <b>:title</b> es invalido, debe incluir algunos de los valores :param',
                  integer:         'El campo <b>:title</b> debe ser un entero',
                  ip:              'El campo <b>:title</b> debe ser una IP valida',
                  max: {
                     number        :'El campo <b>:title</b> no debe tener una cantidad maximo de <b>:max</b>',
                     file          :'El campo <b>:title</b> no debe tener una maximo de <b>:max</b> bytes',
                     string        :'El campo <b>:title</b> no debe tener una maximo de <b>:max</b> characteres'
                  },
                  mimes:           'El campo <b>:title</b> debe ser un archivo de tipo: <b>:param</b>',
                  min: {
                     number        :'El campo <b>:title</b> debe tener una cantidad minimo de <b>:min</b>',
                     file          :'El campo <b>:title</b> debe tener una minimo de <b>:min</b> bytes',
                     string        :'El campo <b>:title</b> debe tener una minimo de <b>:min</b> characteres'
                  },
                  not_in:          'El seleccionado <b>:title</b> es invalido',
                  numeric:         'El campo <b>:title</b> debe ser un número',
                  regex:           'El campo <b>:title</b> tiene formato invalido',
                  required:        'El campo <b>:title</b> es requerido',
                  required_if:     'El campo <b>:title</b> es requerido si el campo <b>:other</b> contiene valor',
                  required_with:   'El campo <b>:title</b> es requerido con los siguientes campos: <b>:other</b>',
                  required_less:   'El campo <b>:title</b> es requerido sin los siguientes campos: <b>:other</b>',
                  required_without:'El campo <b>:title</b> es requerido sin los siguientes campos: <b>:other</b>',
                  same:            'El campo <b>:title</b> y el campo <b>:same</b> debe ser identico',
                  size: {
                     number        :'El campo <b>:title</b> debe coincidir con la cantidad <b>:size</b>',
                     file          :'El campo <b>:title</b> debe coincidir con la cantidad <b>:size</b> bytes',
                     string        :'El campo <b>:title</b> debe coincidir con la cantidad <b>:size</b> characteres'
                  },
                  text:            ''
               }
            }// End messages
         },// End options





         // Cross Browser Event Utility
         // Nicholas Zakas, Professional JavaScript for Web Developers p.441
         /**
         * NOTA: este programa no es el original para ver el original vea: 
         * https://gist.github.com/objectfoo/4144898
         **/
      
         addHandler: function( element, type, handler ) {
            if ( element.addEventListener ) {
                element.addEventListener ( type, handler, false );
            } else if ( element.attachEvent ) {
                element.attachEvent ( "on" + type, handler );
            } else {
                element["on" + type] = handler;
            }
         },
      
         removeHandler: function( element, type, handler ) {
            if ( element.removeEventListener ) {
                element.removeEventListener ( type, handler, false );
            } else if ( element.detachEvent ) {
                element.detachEvent ( "on" + type, handler );
            } else {
                element["on" + type] = null;
            }
         },
      
         getEvent: function ( event ) {
            return event ? event : window.event;
         },

         getTarget: function ( event ) {
            return event.target || event.srcElement;
         },
         /**
         ***********************************************************
         /\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
         \/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/
         ***********************************************************
         **/


      
         register: function( target ) {
         
            this.required_without = this.required_less;

            var forms;

            if ( typeof target==='string' ) {
               var forms = win.document.forms[target];
            }

            try{
               length = forms.length;
            }catch(err) {
               length = 0;
            }

            setTimeout(function() {
               for ( var i=0; i<length; i++ ) {

                  var element = forms[ i ];
                  var field;

                  try { 
                     field = element.getAttribute( 'name' );
                  }
                  catch( err ) { 
                     field = null 
                  }

                  if ( field ) {
                     var regExpClassFormGroup = new RegExp( this.options.classFormGroup );
                     var regExpClassHelpBlock = new RegExp( this.options.classHelpBlock );
                     var formGroup = element;
                     var helpBlock, textNode, helpBlockExist = false;
                     
                     // Se busca el nodo form-group 
                     do{
                        formGroup = formGroup.parentNode
                     }while( !regExpClassFormGroup.test( formGroup.className ) && !!formGroup );

                     // Se busca el help-block en donde se mostrarán los mensajes de error
                     var children = formGroup.getElementsByTagName( '*' );
                     for ( var j = 0; j < children.length; j++ ) {
                        helpBlock = children[j];
                        if ( regExpClassHelpBlock.test( helpBlock.className ) ) {
                           helpBlockExist = true;
                           break;
                        }
                     }

                     if ( !helpBlockExist ) {
                        helpBlock = document.createElement( "small" );
                        textNode = document.createTextNode('&nbsp;');
                        helpBlock.setAttribute( "class", this.options.classHelpBlock +' '+ this.options.addClassHelpBlock );
                        helpBlock.setAttribute( "style", 'display:none;position:relative;margin-top:0;margin-bottom:0;' );
                        
                        var br = document.createElement( "div" );
                        // br.setAttribute( "clear", 'both' );
                        br.setAttribute( "style", 'clear:both;' );

                        helpBlock.append( textNode );
                        // element.parentNode.appendChild( helpBlock );
                        formGroup.append( br );
                        formGroup.append( helpBlock );
                     }

                     // Se registran los elementos para su validación
                     this.fields[ field ]  = {
                        forms: forms,
                        rules: (element.getAttribute( 'aria-rules' ) || '').split( '|' ),
                        element: element,
                        formGroup: formGroup,
                        helpBlock: helpBlock
                     };


                     var handlerEvent = function( event ) {
                        var event  = this.getEvent( event );
                        var target = this.getTarget( event );
                        var field  = target.getAttribute('name');
                        this.exec( field );
                     }.bind( this );


                     this.addHandler( element,'focus',handlerEvent );
                     this.addHandler( element,'blur',handlerEvent );
                     this.addHandler( element,'change',handlerEvent );
                     this.addHandler( element,'keyup',handlerEvent );
                     this.addHandler( element,'keydown',handlerEvent );
                     this.addHandler( element,'click',handlerEvent );
                  }

               }
            }.bind(this), 500);

            return this;
         },








            /**
                           #####   #####   #      #####   ####
                           #    # #     #  #      #      #
                           #    # #     #  #      #      #
                           #####  #     #  #      #####  #####
                           #  #   #     #  #      #          #
                           #   #  #     #  #      #          #
                           #   #   #####   ###### #####  ####
            **/

      
         alpha: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               // ASCII lATIN1
               if (!value.match(/^[a-zA-Zá-üÁ-Ü\s]*$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },// End alpha
      
         alpha_dash: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               // ASCII lATIN1
               if (!value.match(/^[0-9a-zA-Zá-üÁ-Ü\s_\-\.,\(\)]*$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },// End alpha_dash
      
         alpha_num: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               // ASCII lATIN1
               if (!value.match(/^[0-9a-zA-Zá-üÁ-Ü\s\.]*$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },// End 
      
         between: function (rule, field, param ) {
         },
      
         date_format: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var p = param[0].replace(/([dmy]{1,1})+.([dmy]{1,1})+.([dmy]{1,1})+/i,'$1-$2-$3')
                  ,v = value;

               if ( p.match(/Y-M-D/i ) )
                  if ( value.match( /^([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+$/ ) )
                     v = value.replace( /([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+/,'$1-$2-$3' );
                  else v = "''";
               if ( p.match( /Y-D-M/i ) )
                  if ( value.match( /^([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+$/ ) )
                     v = value.replace( /([0-9]{4,4})+.([0-9]{1,2})+.([0-9]{1,2})+/,'$1-$3-$2' );
                  else v = "''";

               if ( p.match( /D-M-Y/i ) )
                  if ( value.match(/^([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+$/ ) )
                     v = value.replace( /([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+/,'$3-$2-$1' );
                  else v = "''";
               if ( p.match( /M-D-Y/i ) )
                  if ( value.match(/^([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+$/ ) )
                     v = value.replace( /([0-9]{1,2})+.([0-9]{1,2})+.([0-9]{4,4})+/,'$3-$1-$2' );
                  else v = "''";
               
               if ( p.match( /M-Y-D/i ) )
                  if ( value.match(/^([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+$/ ) )
                     v = value.replace( /([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+/,'$2-$1-$3' );
                  else v = "''";
               if ( p.match( /D-Y-M/i ) )
                  if ( value.match(/^([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+$/ ) )
                     v = value.replace ( /([0-9]{1,2})+.([0-9]{4,4})+.([0-9]{1,2})+/,'$2-$3-$1' );
                  else v = "''";

               if(new Date(v.replace(/-/g, "/")).toString()=='Invalid Date') {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         digits: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               if (value.length != param[0]) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         digits_between: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            param[1] = param[1]||'';
            if(!param.length || !param[0].match(/^[0-9]+$/) || !param[1].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               if (value.length < parseInt(param[0]) || value.length > parseInt(param[1]) ) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         email: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               if (!value.match(/^.+@.+[^\.]\..{2,}$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         image: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               if (!value.match(/^.*\.jpg$|\.jpeg$|\.png$|\.bmp$|\.gif$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         in: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var fail = true;
               for (var index in param) { 
                  if(fail && param[index]==value) fail = false; 
               };
               if (fail) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         integer: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               if (!value.match(/^[0-9]+$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         ip: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               if (!value.match(/^([0-9]){1,3}\.([0-9]){1,3}\.([0-9]){1,3}\.([0-9]){1,3}$/)) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         max: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[1] = param[0];
            param[0] = param[0]||'';
            if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var elm = this.fields[field].element;
               var len = elm.value.length, type = 'string';

               if(elm.getAttribute('type')=='number'){
                  len = parseInt(value);
                  type = 'number';
               }
               if(elm.getAttribute('type')=='file'){
                  len = elm.files[0].size;
                  type = 'file';
               }
               if (len > parseInt(param[0]))  {
                  var messages = this.options.messages[this.options.local][rule][type];
                  this._applyMessageFail( field, this._getMsg( rule, field, param, messages ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         mimes: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var elm = this.fields[field].element;
               var fail = true;
               if(elm.getAttribute('type')=='file'){
                  for (index in param) {
                     var regexp = new RegExp(param[index].replace('/','\\/'),'i')
                        ,match = regexp.exec(elm.files[0].type) || [];
                     if( fail && match[0] ) fail = false;
                  };
               }
               if (fail) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         min: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var elm = this.fields[field].element;
               var len = elm.value.length, type = 'string';

               if(elm.getAttribute('type')=='number'){
                  len = parseInt(value);
                  type = 'number';
               }
               if(elm.getAttribute('type')=='file'){
                  len = elm.files[0].size;
                  type = 'file';
               }
               if (len < parseInt(param[0]))  {
                  var messages = this.options.messages[this.options.local][rule][type];
                  this._applyMessageFail( field, this._getMsg( rule, field, param, messages ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         not_in: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var fail = true;
               for (var index in param) { 
                  if(fail && param[index]==value) fail = false; 
               };
               if (!fail) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         numeric: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value!='') {
               if (isNaN(value.replace(',','.'))) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         regex: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var regexp = new RegExp(param.join(',').replace('/','\\/'),'i')
                  ,match = regexp.exec(value) || [];
               if (!match[0]) {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         required: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            if (value==="" || value===false || value===null) {
               this._applyMessageFail( field, this._getMsg( rule, field, param ) );
               return true;
            } else {
               this._success( field );
               return false;
            }
         },
      
         /*
            Si existe un campo A y B, si en A se expecifica la validación "required_if:B" 
            entonce A es requerido y en B hay valor.

            <form>
               <input id="A" aria-rules="required_if:B" />
               <input id="B" aria-rules="" />
            </form>
          */
         required_if: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();

            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');


            for ( _field in param) {
               var elm1 = this.fields[field].element;
               var elm2 = this.fields[param[_field]].element;
               this.reference_if[param[_field]] = field;
               if ( !elm1.value && elm2.value )  {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            }
         },
      
         required_with: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');

            for ( _field in param) {
               var elm1 = this.fields[field].element;
               var elm2 = this.fields[param[_field]].element;

               this.reference_with[param[_field]] = field;

               if ( elm1.value&& !elm2.value )  {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            }
         },
      
         required_less: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');

            for ( _field in param) {
               var elm1 = this.fields[field].element;
               var elm2 = this.fields[param[_field]].element;

               this.reference_less[param[_field]] = field;

               if ( elm1.value && elm2.value )  {
                  this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                  return true;
               } else {
                  this._success( field );
                  this.clean(field);
                  return false;
               }
            }
         },
      
         required_without: function(){},
      
         same: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0]) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            var elm1 = this.fields[field];
            var elm2 = this.fields[param[0]];
            var rules_temp = elm1.rules;

            this.reference_same[param[0]] = field;

            try {
               elm1.rules = elm2.rules;
            }catch( err ){
               console.error( err );
               throw console.error( 'El parametro \'' + param[0] + '\' de la regla \'same\' ho ha sido identificado' );
            }

            this.exec( field );
            elm1.rules = rules_temp;
            
            if ( this.field_success[field] ) {
               if ( ( elm1.element.value != elm2.element.value ) ) {
                  var messages = this.options.messages[this.options.local][rule].replace(":same", elm2.element.getAttribute('aria-title') || '')
                  this._applyMessageFail( field, this._getMsg( rule, field, param, messages ) );
                  return true;
               } else {
                  if (value!='') {
                     this._success( field );
                  } else {
                     this.clean(field);
                  }
                  return false;
               }
            }
            
         },
      
         size: function (rule, field, param ) {
            var value = this.fields[field].element.value.trim();
            param[0] = param[0]||'';
            if(!param.length || !param[0].match(/^[0-9]+$/)) throw console.error('El parametro de la regla {'+rule+'} es incorrecto');
            if (value!='') {
               var elm = this.fields[field].element;
               var len = elm.value.length, 
                   type = 'string';

               if(elm.getAttribute('type')=='number'){
                  len = parseInt(value);
                  type = 'number';
               }
               if(elm.getAttribute('type')=='file'){
                  len = elm.files[0].size;
                  type = 'file';
               }
               if (len != parseInt(param[0]))  {
                  var messages = this.options.messages[this.options.local][rule][type];
                  this._applyMessageFail( field, this._getMsg( rule, field, param, messages ) );
                  return true;
               } else {
                  this._success( field );
                  return false;
               }
            } else {
               this.clean(field);
            }
         },
      
         text: function (rule, field, param ) {
            this._success( field );
            return false;
         },
      
         reference_if: {},  // para referenciar al campo requerido
      
         reference_with: {},// para referenciar al campo requerido
      
         reference_less: {},// para referenciar al campo requerido

         reference_same: {},// para referenciar al campo requerido
         
         field_error: {},// para referenciar al campo requerido

         field_success: {},// para referenciar al campo requerido


         _errorHandle:function(field) {
            var error;
            try{
               this.fields[field].formGroup.className;
               this.fields[field].element.value;
            }catch( e ){
               console.error( e.message + '\nEl campo "' + field + '" no esta definido en el formulario' );
               error = true;
            }
            return error;
         },

      
         _applyMessageFail: function( field, message ) {
            if ( this._errorHandle( field ) ) return;
            var regExpClassHasError = new RegExp( this.options.classHasError );

            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasError,'');
            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasSuccess,'');

            if ( !regExpClassHasError.test( this.fields[field].formGroup.className ) ) {
               this.fields[field].formGroup.className = this.fields[field].formGroup.className+' '+this.options.classHasError;
            }

            this.fields[field].helpBlock.style.display    = 'block';
            this.fields[field].helpBlock.style.fontWeight = 'bold';
            this.fields[field].helpBlock.innerHTML = message;
         },
      
         _success: function( field ) {
            var regExpClassHasSuccess = new RegExp( this.options.classHasSuccess );

            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasError,'');
            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasSuccess,'');

            if ( !regExpClassHasSuccess.test( this.fields[field].formGroup.className ) ) {
               this.fields[field].formGroup.className = this.fields[field].formGroup.className+' '+this.options.classHasSuccess;
            }

            this.fields[field].helpBlock.style.display = 'none';
         },
      
         _getMsg: function( rule, field, param, messages ) {
            if ( this._errorHandle( field ) ) return;

            var value = this.fields[field].element.value.trim();

            messages = messages || this.options.messages[this.options.local][rule];
            messages = this.fields[field].element.getAttribute('aria-message') || messages;
            
            if ( messages===undefined ) messages = '';

            return messages
               .replace(":title", this.fields[field].element.getAttribute('aria-title') || '')
               .replace(":attr", field)
               .replace(":value", value)
               .replace(":rule", rule)
               .replace(":param", param.join(', '))
               .replace(":format", param[0])
               .replace(":digits", param[0])
               .replace(":min", param[0])
               .replace(":max", param[1])
               .replace(":other", param.join(', '))
               .replace(":other_value", param[1])
               .replace(":size", param[0])
         },// End _getMsg






      
         isArray: function(obj) {
            var result;
            try {
               result = !!obj.length;
            }
            catch(err) {
               result = false;
            }
            return result;
         },


         /**
         * Agrega error generado en algún lugar del sistema
         * @name add_error
         * @type Function
         * @param {Object|String} fields Campo con error
         * @param {String} message Mensaje del error
         * @return Validator
            Ej: 
            Validator.add_error( 'field', 'Mensaje de error' );
            Ej: 
            Validator.add_error( { field: 'Mensaje de error' } );
            Ej: 
            Validator.add_error( { field: ['Mensaje de error'] } );
            Ej: 
            Validator.add_error( { field: [ { rule: "required" } ] } );
            Ej: 
            Validator.add_error( { field: [ { rule: "required", message: 'Mensaje de error' } ] } );
            Ej: 
            Validator.add_error( { field: [ { rule: "required", message: ['Mensaje de error'] } ] } );
            Ej: 
            Validator.add_error( { field: { rule: 'required' } } );
            Ej: 
            Validator.add_error( { field: { rule: 'required', message: 'Mensaje de error' } } );
            Ej: 
            Validator.add_error( { field: { rule: 'required', message: ['Mensaje de error'] } } );
         **/
         add_error: function( fields, message, onlyDefaultMessage ) {
            if ( typeof fields==='string' && typeof message==='string' ) {
               var field = fields;
               fields = {};
               fields[field] = message;
            }

            for ( field in fields ) {
               var rule = '';
               var message = '';

               if ( typeof fields[field]==='string' ) {
                  message = fields[field];
               }
               else if ( this.isArray( fields[field] ) ) {
                  if ( typeof fields[field][0]==='string' ) {
                     message = fields[field][0];
                  }
                  else if ( typeof fields[field][0]==='object' ) {
                     rule = fields[field][0].rule;

                     if ( this.isArray( fields[field][0].message ) ) {
                        message = fields[field][0].message[0];
                     }
                     else {
                        message = fields[field][0].message;
                     }
                  }
               }
               else if ( !this.isArray( fields[field] ) && typeof fields[field]==='object' ) {
                  rule = fields[field].rule;
                  if ( this.isArray( fields[field].message ) ) {
                     message = fields[field].message[0];
                  }
                  else {
                     message = fields[field].message;
                  }
               }

               if ( onlyDefaultMessage===true )
                  message = '';

               this._applyMessageFail( field, this._getMsg( rule, field, [], message ) );

               // llamamos la funcion a la que le compete la regla
               this.error = true;
               this.success = !this.error;

               this.field_error[field] = this.error;
               this.field_success[field] = this.success;
            }

            return this;
         },

      
         exec: function( field, isRecursive ) {
            if( !field ) return;

            // si el campo es referenciado en la regla required_if
            if ( this.reference_if[field] ) 
               this.exec( this.reference_if[field], true );

            // si el campo es referenciado en la regla required_with
            if ( this.reference_with[field] ) 
               this.exec( this.reference_with[field], true );

            // si el campo es referenciado en la regla required_less
            if ( this.reference_less[field] ) 
               this.exec( this.reference_less[field], true );

            // si el campo es referenciado en la regla required_same
            if ( this.reference_same[field] ) 
               this.exec( this.reference_same[field], true );
            

            if ( !isRecursive ) {
               var rules = this.fields[field].rules;
               for ( var i = 0; i < rules.length; i++ ) {
                  if ( rules[i].trim() ) {
                     var param = [];
                     var rule = rules[i].trim();
                     var match = rule.match(/:/);
                     if ( match ) {
                        rule = match.input.slice(0,match.index);
                        param = match.input.slice(match.index+1).split(',');
                     }

                     // llamamos la funcion a la que le compete la regla
                     var error = this[rule]( rule, field, param );

                     this.field_error[field] = error;
                     this.field_success[field] = !error;

                     if ( error && !this.error ) {
                        this.error = error;
                        this.success = !error;
                     }

                     if ( error ) break;
                  }
               }
            }

            return this;
         },
      
         cleanAll: function() {
            for ( var field in this.fields) {
               this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasError,'');
               this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasSuccess,'');

               var regExpClassFormGroup = new RegExp( this.options.classFormGroup );

               if ( !regExpClassFormGroup.test( this.fields[field].formGroup.className ) ) {
                  this.fields[field].formGroup.className = this.options.classFormGroup+' '+this.fields[field].formGroup.className ;
               }

               this.fields[field].helpBlock.style.display = 'none';
               this.error = false;
               this.success = true;
            }
            return this;
         },// End clean

         resetForm: function() {
            for ( var field in this.fields) {
               this.fields[field].forms.reset();
            }
            return this;
         },// End clean
      
         clean: function(field) {
            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasError,'');
            this.fields[field].formGroup.className = this.fields[field].formGroup.className.replace(this.options.classHasSuccess,'');

            var regExpClassFormGroup = new RegExp( this.options.classFormGroup );

            if ( !regExpClassFormGroup.test( this.fields[field].formGroup.className ) ) {
               this.fields[field].formGroup.className = this.options.classFormGroup+' '+this.fields[field].formGroup.className ;
            }


            this.fields[field].helpBlock.style.display = 'none';
            return this;
         },
      
         removeAll: function() {
            this.fields = {};
            this.reference_if = {};
            this.reference_with = {};
            this.reference_less = {};
            this.reference_same = {};
            this.field_error = {};
            this.field_success = {};

            return this;
         },
      
         remove: function(field) {
            delete this.fields[field];
            delete this.reference_if[field];
            delete this.reference_with[field];
            delete this.reference_less[field]
            delete this.reference_same[field]
            delete this.field_error[field]
            delete this.field_success[field]
            return this;
         },
      
         run: function() {
            this.error = false;
            this.success = true;
            for ( var field in this.fields ) {
               this.exec( field );
            }
            return this;
         },
      
         fails: function() {
            return this.error;
         },
      
         passes: function() {
            return this.success;
         },

         /**
         >> Registra una nueva regla de validación
            Ej:
            // Registrar una regla
            Validator.create({
               nameRule: {
                  message: 'Mensaje en caso de un error',
                  fn: function(validatorObject) {
                     return typeof 1 ==='number';
                  },
               },
            });

            // Registrar multiples reglas
            Validator.create( [{
               nameRule2: {
                  message: 'Mensaje en caso de un error',
                  fn: function(validatorObject) {
                     return typeof 2 ==='number';
                  },
               },
            }]);
         **/
         create: function( rules ) {
            if ( this.isArray( rules ) ) {
               for ( var i = 0; i < rules.length; i++ ) {
                  this.create( rules[ i ] );
               }
            } else {
               for ( var _rule_ in rules ) {
                  // registramos los mensajes asignado
                  this.options.messages[ this.options.local ][ _rule_ ] = rules[ _rule_ ].message || '';
                  
                  // registramos la regla creada
                  this[_rule_] = function ( rule, field, param ) {
                     var value = this.fields[ field ].element.value.trim();

                     if ( value!='' ) {
                        if ( typeof rules[ rule ].fn==='function') {
                           // ejecutamos el evento registrado
                           if ( !rules[ rule ].fn( value, field, rule, param, this ) ) {
                              this._applyMessageFail( field, this._getMsg( rule, field, param ) );
                              return true;
                           }
                        }

                        this._success( field );
                        return false;
                     }
                  };

               }
            }
            return this;
         }
      };

}));