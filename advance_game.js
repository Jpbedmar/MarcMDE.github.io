
var Module;

if (typeof Module === 'undefined') Module = {};

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'advance_game.data';
    var REMOTE_PACKAGE_BASE = 'advance_game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      },
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_advance_game.data');

    };
    Module['addRunDependency']('datafile_advance_game.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 107204, "filename": "/resources"}], "remote_package_size": 107204, "package_uuid": "3db41df8-7f40-46b6-a032-88dd3c04f885"});

})();

// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_WEB = typeof window === 'object';
// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -s PROXY_TO_WORKER=1) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function' && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) {
    var ret = Module['read'](filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  if (!Module['thisProgram']) {
    if (process['argv'].length > 1) {
      Module['thisProgram'] = process['argv'][1].replace(/\\/g, '/');
    } else {
      Module['thisProgram'] = 'unknown-program';
    }
  }

  Module['arguments'] = process['argv'].slice(2);

  if (typeof module !== 'undefined') {
    module['exports'] = Module;
  }

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    var data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WORKER) {
    Module['load'] = importScripts;
  }

  if (typeof Module['setWindowTitle'] === 'undefined') {
    Module['setWindowTitle'] = function(title) { document.title = title };
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
if (!Module['thisProgram']) {
  Module['thisProgram'] = './this.program';
}

// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in: 
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at: 
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  STACK_ALIGN: 16,
  prepVararg: function (ptr, type) {
    if (type === 'double' || type === 'i64') {
      // move so the load is aligned
      if (ptr & 7) {
        assert((ptr & 7) === 4);
        ptr += 4;
      }
    } else {
      assert((ptr & 3) === 0);
    }
    return ptr;
  },
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      assert(args.length == sig.length-1);
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      assert(sig.length == 1);
      assert(('dynCall_' + sig) in Module, 'bad function pointer type - no table for sig \'' + sig + '\'');
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[sig]) {
      Runtime.funcWrappers[sig] = {};
    }
    var sigCache = Runtime.funcWrappers[sig];
    if (!sigCache[func]) {
      sigCache[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return sigCache[func];
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+15)&-16);(assert((((STACKTOP|0) < (STACK_MAX|0))|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+15)&-16); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+15)&-16); if (DYNAMICTOP >= TOTAL_MEMORY) { var success = enlargeMemory(); if (!success) { DYNAMICTOP = ret;  return 0; } }; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 16))*(quantum ? quantum : 16); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}



Module["Runtime"] = Runtime;



//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  if (!func) {
    try {
      func = eval('_' + ident); // explicit lookup
    } catch(e) {}
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

var cwrap, ccall;
(function(){
  var JSfuncs = {
    // Helpers for cwrap -- it can't refer to Runtime directly because it might
    // be renamed by closure, instead it calls JSfuncs['stackSave'].body to find
    // out what the minified function name is.
    'stackSave': function() {
      Runtime.stackSave()
    },
    'stackRestore': function() {
      Runtime.stackRestore()
    },
    // type conversion from js to c
    'arrayToC' : function(arr) {
      var ret = Runtime.stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    },
    'stringToC' : function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        ret = Runtime.stackAlloc((str.length << 2) + 1);
        writeStringToMemory(str, ret);
      }
      return ret;
    }
  };
  // For fast lookup of conversion functions
  var toC = {'string' : JSfuncs['stringToC'], 'array' : JSfuncs['arrayToC']};

  // C calling interface. 
  ccall = function ccallFunc(ident, returnType, argTypes, args, opts) {
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== 'array', 'Return type should not be "array".');
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = Runtime.stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    if ((!opts || !opts.async) && typeof EmterpreterAsync === 'object') {
      assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling ccall');
    }
    if (opts && opts.async) assert(!returnType, 'async ccalls cannot return values');
    if (returnType === 'string') ret = Pointer_stringify(ret);
    if (stack !== 0) {
      if (opts && opts.async) {
        EmterpreterAsync.asyncFinalizers.push(function() {
          Runtime.stackRestore(stack);
        });
        return;
      }
      Runtime.stackRestore(stack);
    }
    return ret;
  }

  var sourceRegex = /^function\s*\(([^)]*)\)\s*{\s*([^*]*?)[\s;]*(?:return\s*(.*?)[;\s]*)?}$/;
  function parseJSFunc(jsfunc) {
    // Match the body and the return value of a javascript function source
    var parsed = jsfunc.toString().match(sourceRegex).slice(1);
    return {arguments : parsed[0], body : parsed[1], returnValue: parsed[2]}
  }
  var JSsource = {};
  for (var fun in JSfuncs) {
    if (JSfuncs.hasOwnProperty(fun)) {
      // Elements of toCsource are arrays of three items:
      // the code, and the return value
      JSsource[fun] = parseJSFunc(JSfuncs[fun]);
    }
  }

  
  cwrap = function cwrap(ident, returnType, argTypes) {
    argTypes = argTypes || [];
    var cfunc = getCFunc(ident);
    // When the function takes numbers and returns a number, we can just return
    // the original function
    var numericArgs = argTypes.every(function(type){ return type === 'number'});
    var numericRet = (returnType !== 'string');
    if ( numericRet && numericArgs) {
      return cfunc;
    }
    // Creation of the arguments list (["$1","$2",...,"$nargs"])
    var argNames = argTypes.map(function(x,i){return '$'+i});
    var funcstr = "(function(" + argNames.join(',') + ") {";
    var nargs = argTypes.length;
    if (!numericArgs) {
      // Generate the code needed to convert the arguments from javascript
      // values to pointers
      funcstr += 'var stack = ' + JSsource['stackSave'].body + ';';
      for (var i = 0; i < nargs; i++) {
        var arg = argNames[i], type = argTypes[i];
        if (type === 'number') continue;
        var convertCode = JSsource[type + 'ToC']; // [code, return]
        funcstr += 'var ' + convertCode.arguments + ' = ' + arg + ';';
        funcstr += convertCode.body + ';';
        funcstr += arg + '=' + convertCode.returnValue + ';';
      }
    }

    // When the code is compressed, the name of cfunc is not literally 'cfunc' anymore
    var cfuncname = parseJSFunc(function(){return cfunc}).returnValue;
    // Call the function
    funcstr += 'var ret = ' + cfuncname + '(' + argNames.join(',') + ');';
    if (!numericRet) { // Return type can only by 'string' or 'number'
      // Convert the result to a string
      var strgfy = parseJSFunc(function(){return Pointer_stringify}).returnValue;
      funcstr += 'ret = ' + strgfy + '(ret);';
    }
    funcstr += "if (typeof EmterpreterAsync === 'object') { assert(!EmterpreterAsync.state, 'cannot start async op with normal JS calling cwrap') }";
    if (!numericArgs) {
      // If we had a stack, restore it
      funcstr += JSsource['stackRestore'].body.replace('()', '(stack)') + ';';
    }
    funcstr += 'return ret})';
    return eval(funcstr);
  };
})();
Module["ccall"] = ccall;
Module["cwrap"] = cwrap;

function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module["setValue"] = setValue;


function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module["getValue"] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module["ALLOC_NORMAL"] = ALLOC_NORMAL;
Module["ALLOC_STACK"] = ALLOC_STACK;
Module["ALLOC_STATIC"] = ALLOC_STATIC;
Module["ALLOC_DYNAMIC"] = ALLOC_DYNAMIC;
Module["ALLOC_NONE"] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    assert(type, 'Must know what type to store in allocate!');

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module["allocate"] = allocate;

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!staticSealed) return Runtime.staticAlloc(size);
  if ((typeof _sbrk !== 'undefined' && !_sbrk.called) || !runtimeInitialized) return Runtime.dynamicAlloc(size);
  return _malloc(size);
}
Module["getMemory"] = getMemory;

function Pointer_stringify(ptr, /* optional */ length) {
  if (length === 0 || !ptr) return '';
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = 0;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
    t = HEAPU8[(((ptr)+(i))>>0)];
    hasUtf |= t;
    if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (hasUtf < 128) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  return Module['UTF8ToString'](ptr);
}
Module["Pointer_stringify"] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAP8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}
Module["AsciiToString"] = AsciiToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}
Module["stringToAscii"] = stringToAscii;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

function UTF8ArrayToString(u8Array, idx) {
  var u0, u1, u2, u3, u4, u5;

  var str = '';
  while (1) {
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    u0 = u8Array[idx++];
    if (!u0) return str;
    if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
    u1 = u8Array[idx++] & 63;
    if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
    u2 = u8Array[idx++] & 63;
    if ((u0 & 0xF0) == 0xE0) {
      u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
    } else {
      u3 = u8Array[idx++] & 63;
      if ((u0 & 0xF8) == 0xF0) {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | u3;
      } else {
        u4 = u8Array[idx++] & 63;
        if ((u0 & 0xFC) == 0xF8) {
          u0 = ((u0 & 3) << 24) | (u1 << 18) | (u2 << 12) | (u3 << 6) | u4;
        } else {
          u5 = u8Array[idx++] & 63;
          u0 = ((u0 & 1) << 30) | (u1 << 24) | (u2 << 18) | (u3 << 12) | (u4 << 6) | u5;
        }
      }
    }
    if (u0 < 0x10000) {
      str += String.fromCharCode(u0);
    } else {
      var ch = u0 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    }
  }
}
Module["UTF8ArrayToString"] = UTF8ArrayToString;

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF8ToString(ptr) {
  return UTF8ArrayToString(HEAPU8,ptr);
}
Module["UTF8ToString"] = UTF8ToString;

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x1FFFFF) {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0x3FFFFFF) {
      if (outIdx + 4 >= endIdx) break;
      outU8Array[outIdx++] = 0xF8 | (u >> 24);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 5 >= endIdx) break;
      outU8Array[outIdx++] = 0xFC | (u >> 30);
      outU8Array[outIdx++] = 0x80 | ((u >> 24) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 18) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}
Module["stringToUTF8Array"] = stringToUTF8Array;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}
Module["stringToUTF8"] = stringToUTF8;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) {
      ++len;
    } else if (u <= 0x7FF) {
      len += 2;
    } else if (u <= 0xFFFF) {
      len += 3;
    } else if (u <= 0x1FFFFF) {
      len += 4;
    } else if (u <= 0x3FFFFFF) {
      len += 5;
    } else {
      len += 6;
    }
  }
  return len;
}
Module["lengthBytesUTF8"] = lengthBytesUTF8;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module["UTF16ToString"] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF16"] = stringToUTF16;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}
Module["lengthBytesUTF16"] = lengthBytesUTF16;

function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module["UTF32ToString"] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null 
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  assert(typeof maxBytesToWrite == 'number', 'stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!');
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}
Module["stringToUTF32"] = stringToUTF32;

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}
Module["lengthBytesUTF32"] = lengthBytesUTF32;

function demangle(func) {
  var hasLibcxxabi = !!Module['___cxa_demangle'];
  if (hasLibcxxabi) {
    try {
      var buf = _malloc(func.length);
      writeStringToMemory(func.substr(1), buf);
      var status = _malloc(4);
      var ret = Module['___cxa_demangle'](buf, 0, 0, status);
      if (getValue(status, 'i32') === 0 && ret) {
        return Pointer_stringify(ret);
      }
      // otherwise, libcxxabi failed, we can try ours which may return a partial result
    } catch(e) {
      // failure when using libcxxabi, we can try ours which may return a partial result
    } finally {
      if (buf) _free(buf);
      if (status) _free(status);
      if (ret) _free(ret);
    }
  }
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  var parsed = func;
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    parsed = parse();
  } catch(e) {
    parsed += '?';
  }
  if (parsed.indexOf('?') >= 0 && !hasLibcxxabi) {
    Runtime.warnOnce('warning: a problem occurred in builtin C++ name demangling; build with  -s DEMANGLE_SUPPORT=1  to link in libcxxabi demangling');
  }
  return parsed;
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function jsStackTrace() {
  var err = new Error();
  if (!err.stack) {
    // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
    // so try that as a special-case.
    try {
      throw new Error(0);
    } catch(e) {
      err = e;
    }
    if (!err.stack) {
      return '(no stack trace available)';
    }
  }
  return err.stack.toString();
}

function stackTrace() {
  return demangleAll(jsStackTrace());
}
Module["stackTrace"] = stackTrace;

// Memory management

var PAGE_SIZE = 4096;

function alignMemoryPage(x) {
  if (x % 4096 > 0) {
    x += (4096 - (x % 4096));
  }
  return x;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk


function abortOnCannotGrowMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which adjusts the size at runtime but prevents some optimizations, (3) set Module.TOTAL_MEMORY to a higher value before the program runs, or if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ');
}

function enlargeMemory() {
  abortOnCannotGrowMemory();
}


var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;

var totalMemory = 64*1024;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be compliant with the asm.js spec (and given that TOTAL_STACK=' + TOTAL_STACK + ')');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer;



buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);


// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['buffer'] = buffer;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
  runtimeExited = true;
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module["addOnPreRun"] = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module["addOnInit"] = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module["addOnPreMain"] = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module["addOnExit"] = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module["addOnPostRun"] = addOnPostRun;

// Tools


function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}
Module["intArrayFromString"] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module["intArrayToString"] = intArrayToString;

function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module["writeStringToMemory"] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[((buffer++)>>0)]=array[i];
  }
}
Module["writeArrayToMemory"] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}
Module["writeAsciiToMemory"] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}


// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


if (!Math['clz32']) Math['clz32'] = function(x) {
  x = x >>> 0;
  for (var i = 0; i < 32; i++) {
    if (x & (1 << (31 - i))) return i;
  }
  return 32;
};
Math.clz32 = Math['clz32']

var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;
var Math_clz32 = Math.clz32;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
var runDependencyTracking = {};

function getUniqueRunDependency(id) {
  var orig = id;
  while (1) {
    if (!runDependencyTracking[id]) return id;
    id = orig + Math.random();
  }
  return id;
}

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
    if (runDependencyWatcher === null && typeof setInterval !== 'undefined') {
      // Check for missing dependencies every few seconds
      runDependencyWatcher = setInterval(function() {
        if (ABORT) {
          clearInterval(runDependencyWatcher);
          runDependencyWatcher = null;
          return;
        }
        var shown = false;
        for (var dep in runDependencyTracking) {
          if (!shown) {
            shown = true;
            Module.printErr('still waiting on run dependencies:');
          }
          Module.printErr('dependency: ' + dep);
        }
        if (shown) {
          Module.printErr('(end of list)');
        }
      }, 10000);
    }
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module["addRunDependency"] = addRunDependency;

function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module["removeRunDependency"] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data



var memoryInitializer = null;



// === Body ===

var ASM_CONSTS = [function($0, $1) { { Module.printErr('bad name in getProcAddress: ' + [Pointer_stringify($0), Pointer_stringify($1)]); } }];

function _emscripten_asm_const_2(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}



STATIC_BASE = 8;

STATICTOP = STATIC_BASE + 18448;
  /* global initializers */  __ATINIT__.push();
  

/* memory initializer */ allocate([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);
/* memory initializer */ allocate([32,0,32,0,0,176,1,0,0,0,0,0,0,0,0,0,32,37,249,142,0,10,2,0,0,128,190,125,95,244,125,31,160,242,43,74,30,9,82,8,0,64,34,65,80,20,4,16,32,32,41,46,18,8,34,8,0,32,34,65,80,20,4,16,32,32,249,16,76,8,250,62,60,16,34,125,222,247,125,16,32,32,161,232,50,8,34,8,0,8,34,5,16,4,69,16,0,240,163,164,50,8,82,8,0,4,34,5,16,4,69,16,32,32,249,226,94,8,2,0,129,2,62,125,31,244,125,16,0,0,32,0,0,176,1,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,190,15,0,192,15,224,247,251,125,126,191,95,232,190,80,0,162,8,8,68,232,47,20,10,133,2,129,80,72,160,80,0,162,40,228,73,40,40,20,10,132,2,129,64,72,160,72,0,190,15,2,16,175,235,247,9,132,62,159,216,79,160,71,0,34,136,228,9,161,42,20,10,132,2,129,80,72,160,72,0,34,40,8,4,160,47,20,10,133,2,129,80,72,162,80,0,190,143,0,0,33,32,244,251,125,126,129,95,232,156,208,7,0,128,0,0,224,15,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,1,12,0,130,66,191,223,239,247,251,11,5,5,133,66,191,4,72,0,198,66,161,80,40,20,64,8,5,37,133,66,160,8,168,0,170,70,161,80,40,20,64,8,5,37,133,66,144,16,8,0,146,74,161,95,232,247,67,8,5,37,121,126,136,32,8,0,130,82,161,64,40,1,66,8,137,36,133,64,132,64,8,0,130,98,161,64,42,2,66,8,81,36,133,64,130,128,8,0,130,66,191,192,47,244,67,248,33,252,133,126,191,0,9,62,0,0,0,0,4,0,0,0,0,0,0,0,128,1,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,0,4,0,32,72,65,0,0,0,0,0,8,0,0,4,4,0,4,60,32,0,65,0,0,0,0,0,8,0,0,240,125,223,247,133,239,75,81,190,239,251,190,239,59,81,4,0,69,65,20,133,40,74,73,170,40,138,162,32,8,81,4,240,69,65,244,157,40,74,71,170,40,138,162,224,11,81,4,16,69,65,20,132,40,74,73,170,40,138,162,0,10,145,2,240,125,223,247,133,47,74,209,170,232,251,190,224,123,31,1,0,0,0,0,4,8,64,0,0,0,8,32,0,0,0,0,0,0,0,0,132,15,96,0,0,0,8,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,172,1,15,0,0,0,0,0,0,0,0,0,0,0,0,0,36,1,9,0,0,0,0,0,0,0,0,0,6,0,0,0,36,1,9,0,0,0,0,0,0,0,128,16,9,162,40,250,36,1,9,0,0,0,0,0,0,0,0,62,1,42,37,66,34,82,9,0,0,0,0,0,0,0,128,138,3,42,34,34,36,41,9,0,0,0,0,0,0,0,128,10,1,42,37,18,36,1,9,0,0,0,0,0,0,0,128,10,1,190,232,251,36,1,9,0,0,0,0,0,0,0,128,190,14,0,0,2,172,1,15,0,0,0,0,0,0,0,128,4,0,0,224,3,0,0,0,0,0,0,0,0,0,0,128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,0,0,0,14,184,67,132,3,58,32,0,128,160,190,2,32,0,0,240,138,32,82,196,2,43,32,4,34,145,2,248,59,0,240,7,142,56,75,228,2,58,32,2,28,138,30,8,42,233,17,4,224,11,66,244,2,130,36,1,20,4,20,232,186,4,209,5,128,184,195,231,10,58,137,0,28,14,60,40,2,9,80,4,128,0,64,196,2,128,68,0,34,132,32,232,2,0,80,4,0,0,64,128,2,0,32,5,0,142,62,8,2,0,16,4,224,3,64,128,66,0,0,7,0,132,0,248,3,0,240,7,0,0,64,128,34,0,0,4,0,0,0,0,0,0,0,0,0,0,64,128,2,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,7,128,0,194,160,72,24,0,0,1,132,33,9,146,2,66,38,4,1,33,81,0,0,127,63,2,66,2,16,41,0,34,20,192,239,247,251,253,126,9,161,223,239,247,187,187,3,18,15,68,40,20,10,133,66,9,129,64,32,16,16,17,1,8,4,68,40,20,10,133,66,127,129,64,32,16,16,17,1,4,130,199,239,247,251,253,126,9,129,207,231,243,17,17,1,50,169,80,40,20,10,133,66,9,161,64,32,16,16,17,1,64,184,80,40,20,10,133,66,121,191,223,239,247,187,187,3,32,160,31,0,0,0,0,0,0,16,0,0,0,0,0,0,112,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,2,8,131,34,1,0,2,8,67,2,1,0,1,1,124,20,4,132,68,1,0,32,4,132,4,128,8,63,130,0,132,66,191,223,239,247,3,126,161,80,40,20,10,33,0,0,132,70,161,80,40,20,138,82,161,80,40,20,122,161,239,3,158,74,161,80,40,20,82,82,161,80,40,20,74,31,8,2,132,82,161,80,40,20,34,74,161,80,40,244,75,161,239,3,132,98,161,80,40,20,82,74,161,80,40,4,122,161,40,2,124,66,191,223,239,247,139,126,191,223,239,247,11,189,239,3,0,0,0,0,0,0,0,4,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,5,32,0,0,4,132,0,34,129,69,17,16,66,1,0,148,66,81,0,0,8,66,81,148,42,162,32,8,165,80,0,0,0,32,0,0,0,0,0,0,0,5,0,0,0,0,8,190,239,251,254,251,190,239,251,20,145,235,251,190,239,251,0,32,8,130,32,10,162,40,138,20,145,40,138,162,40,138,62,190,239,251,254,11,190,239,251,20,145,40,138,162,40,138,0,162,40,138,34,8,130,32,8,20,145,40,138,162,40,138,8,190,239,251,254,251,190,239,251,20,145,47,250,190,239,251,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,33,0,4,0,0,0,0,0,0,0,0,0,0,0,0,130,80,20,2,20,0,0,0,0,0,0,0,0,0,0,16,0,0,0,32,0,0,0,0,0,0,0,0,0,0,0,190,40,138,162,40,34,0,0,0,0,0,0,0,0,0,0,170,40,138,162,232,34,0,0,0,0,0,0,0,0,0,0,170,40,138,162,168,34,0,0,0,0,0,0,0,0,0,0,170,40,138,162,232,34,0,0,0,0,0,0,0,0,0,0,190,239,251,190,47,62,0,0,0,0,0,0,0,0,0,0,4,0,0,0,40,32,0,0,0,0,0,0,0,0,0,0,0,0,0,128,15,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,4,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,5,0,0,0,5,0,0,0,2,0,0,0,4,0,0,0,1,0,0,0,7,0,0,0,5,0,0,0,2,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,1,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,3,0,0,0,6,0,0,0,7,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,5,0,0,0,6,0,0,0,5,0,0,0,7,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,6,0,0,0,7,0,0,0,7,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,2,0,0,0,7,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,2,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,1,0,0,0,2,0,0,0,5,0,0,0,2,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,4,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,7,0,0,0,1,0,0,0,5,0,0,0,3,0,0,0,7,0,0,0,3,0,0,0,5,0,0,0,4,0,0,0,1,0,0,0,7,0,0,0,4,0,0,0,3,0,0,0,5,0,0,0,3,0,0,0,3,0,0,0,2,0,0,0,5,0,0,0,6,0,0,0,1,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,7,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,3,0,0,0,7,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,5,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,4,0,0,0,6,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,9,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,2,0,0,0,2,0,0,0,3,0,0,0,3,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,5,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,188,19,0,0,188,19,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,250,65,0,0,0,4,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,60,103,97,109,101,32,110,97,109,101,32,103,111,101,115,32,104,101,114,101,62,0,0,0,0,0,0,0,0,0,76,79,71,79,32,83,67,82,69,69,78,0,87,65,73,84,32,102,111,114,32,50,32,83,69,67,79,78,68,83,46,46,46,0,84,73,84,76,69,32,83,67,82,69,69,78,0,80,82,69,83,83,32,69,78,84,69,82,32,116,111,32,74,85,77,80,32,116,111,32,71,65,77,69,80,76,65,89,32,83,67,82,69,69,78,0,71,65,77,69,80,76,65,89,32,83,67,82,69,69,78,0,80,82,69,83,83,32,69,78,84,69,82,32,116,111,32,74,85,77,80,32,116,111,32,69,78,68,73,78,71,32,83,67,82,69,69,78,0,69,78,68,73,78,71,32,83,67,82,69,69,78,0,80,82,69,83,83,32,69,78,84,69,82,32,116,111,32,82,69,84,85,82,78,32,116,111,32,84,73,84,76,69,32,83,67,82,69,69,78,0,73,110,105,116,105,97,108,105,122,105,110,103,32,114,97,121,108,105,98,32,40,118,49,46,51,46,48,41,0,84,97,114,103,101,116,32,116,105,109,101,32,112,101,114,32,102,114,97,109,101,58,32,37,48,50,46,48,51,102,32,109,105,108,108,105,115,101,99,111,110,100,115,0,87,105,110,100,111,119,32,99,108,111,115,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+1964);
/* memory initializer */ allocate([83,116,97,99,107,32,66,117,102,102,101,114,32,79,118,101,114,102,108,111,119,32,40,77,65,88,32,37,105,32,77,97,116,114,105,120,41,0,77,65,88,95,76,73,78,69,83,95,66,65,84,67,72,32,111,118,101,114,102,108,111,119,0,77,65,88,95,84,82,73,65,78,71,76,69,83,95,66,65,84,67,72,32,111,118,101,114,102,108,111,119,0,77,65,88,95,81,85,65,68,83,95,66,65,84,67,72,32,111,118,101,114,102,108,111,119,0,71,80,85,58,32,86,101,110,100,111,114,58,32,32,32,37,115,0,71,80,85,58,32,82,101,110,100,101,114,101,114,58,32,37,115,0,71,80,85,58,32,86,101,114,115,105,111,110,58,32,32,37,115,0,71,80,85,58,32,71,76,83,76,58,32,32,32,32,32,37,115,0,32,0,78,117,109,98,101,114,32,111,102,32,115,117,112,112,111,114,116,101,100,32,101,120,116,101,110,115,105,111,110,115,58,32,37,105,0,71,76,95,79,69,83,95,118,101,114,116,101,120,95,97,114,114,97,121,95,111,98,106,101,99,116,0,103,108,71,101,110,86,101,114,116,101,120,65,114,114,97,121,115,79,69,83,0,103,108,66,105,110,100,86,101,114,116,101,120,65,114,114,97,121,79,69,83,0,103,108,68,101,108,101,116,101,86,101,114,116,101,120,65,114,114,97,121,115,79,69,83,0,71,76,95,79,69,83,95,116,101,120,116,117,114,101,95,110,112,111,116,0,71,76,95,69,88,84,95,116,101,120,116,117,114,101,95,99,111,109,112,114,101,115,115,105,111,110,95,115,51,116,99,0,71,76,95,79,69,83,95,99,111,109,112,114,101,115,115,101,100,95,69,84,67,49,95,82,71,66,56,95,116,101,120,116,117,114,101,0,71,76,95,65,82,66,95,69,83,51,95,99,111,109,112,97,116,105,98,105,108,105,116,121,0,71,76,95,73,77,71,95,116,101,120,116,117,114,101,95,99,111,109,112,114,101,115,115,105,111,110,95,112,118,114,116,99,0,71,76,95,75,72,82,95,116,101,120,116,117,114,101,95,99,111,109,112,114,101,115,115,105,111,110,95,97,115,116,99,95,104,100,114,0,91,69,88,84,69,78,83,73,79,78,93,32,86,65,79,32,101,120,116,101,110,115,105,111,110,32,100,101,116,101,99,116,101,100,44,32,86,65,79,32,102,117,110,99,116,105,111,110,115,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,69,88,84,69,78,83,73,79,78,93,32,86,65,79,32,101,120,116,101,110,115,105,111,110,32,110,111,116,32,102,111,117,110,100,44,32,86,65,79,32,117,115,97,103,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,78,80,79,84,32,116,101,120,116,117,114,101,115,32,101,120,116,101,110,115,105,111,110,32,100,101,116,101,99,116,101,100,44,32,102,117,108,108,32,78,80,79,84,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,78,80,79,84,32,116,101,120,116,117,114,101,115,32,101,120,116,101,110,115,105,111,110,32,110,111,116,32,102,111,117,110,100,44,32,78,80,79,84,32,116,101,120,116,117,114,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,68,88,84,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,69,84,67,49,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,69,84,67,50,47,69,65,67,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,80,86,82,84,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,69,88,84,69,78,83,73,79,78,93,32,65,83,84,67,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,115,32,115,117,112,112,111,114,116,101,100,0,91,84,69,88,32,73,68,32,37,105,93,32,66,97,115,101,32,119,104,105,116,101,32,116,101,120,116,117,114,101,32,108,111,97,100,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,66,97,115,101,32,119,104,105,116,101,32,116,101,120,116,117,114,101,32,99,111,117,108,100,32,110,111,116,32,98,101,32,108,111,97,100,101,100,0,68,88,84,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,69,84,67,49,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,69,84,67,50,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,80,86,82,84,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,83,84,67,32,99,111,109,112,114,101,115,115,101,100,32,116,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,84,101,120,116,117,114,101,32,102,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,91,84,69,88,32,73,68,32,37,105,93,32,84,101,120,116,117,114,101,32,99,114,101,97,116,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,32,40,37,105,120,37,105,41,0,84,101,120,116,117,114,101,32,99,111,117,108,100,32,110,111,116,32,98,101,32,99,114,101,97,116,101,100,0,91,84,69,88,32,73,68,32,37,105,93,32,85,110,108,111,97,100,101,100,32,116,101,120,116,117,114,101,32,100,97,116,97,32,40,98,97,115,101,32,119,104,105,116,101,32,116,101,120,116,117,114,101,41,32,102,114,111,109,32,86,82,65,77,0,91,70,66,79,32,37,105,93,32,85,110,108,111,97,100,101,100,32,112,111,115,116,112,114,111,99,101,115,115,105,110,103,32,100,97,116,97,0,79,112,101,110,71,76,32,103,114,97,112,104,105,99,32,100,101,118,105,99,101,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,118,101,114,116,101,120,80,111,115,105,116,105,111,110,0,118,101,114,116,101,120,84,101,120,67,111,111,114,100,0,118,101,114,116,101,120,78,111,114,109,97,108,0,109,111,100,101,108,118,105,101,119,77,97,116,114,105,120,0,112,114,111,106,101,99,116,105,111,110,77,97,116,114,105,120,0,116,105,110,116,67,111,108,111,114,0,116,101,120,116,117,114,101,48,0,91,86,83,72,68,82,32,73,68,32,37,105,93,32,70,97,105,108,101,100,32,116,111,32,99,111,109,112,105,108,101,32,118,101,114,116,101,120,32,115,104,97,100,101,114,46,46,46,0,37,115,0,91,86,83,72,68,82,32,73,68,32,37,105,93,32,86,101,114,116,101,120,32,115,104,97,100,101,114,32,99,111,109,112,105,108,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,70,83,72,68,82,32,73,68,32,37,105,93,32,70,97,105,108,101,100,32,116,111,32,99,111,109,112,105,108,101,32,102,114,97,103,109,101,110,116,32,115,104,97,100,101,114,46,46,46,0,91,70,83,72,68,82,32,73,68,32,37,105,93,32,70,114,97,103,109,101,110,116,32,115,104,97,100,101,114,32,99,111,109,112,105,108,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,83,72,68,82,32,73,68,32,37,105,93,32,70,97,105,108,101,100,32,116,111,32,108,105,110,107,32,115,104,97,100,101,114,32,112,114,111,103,114,97,109,46,46,46,0,91,83,72,68,82,32,73,68,32,37,105,93,32,83,104,97,100,101,114,32,112,114,111,103,114,97,109,32,108,111,97,100,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,84,69,88,32,73,68,32,37,105,93,32,85,110,108,111,97,100,101,100,32,116,101,120,116,117,114,101,32,100,97,116,97,32,102,114,111,109,32,86,82,65,77,32,40,71,80,85,41,0,70,111,114,109,97,116,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,102,111,114,32,112,105,120,101,108,32,100,97,116,97,32,114,101,116,114,105,101,118,97,108,0,73,109,97,103,101,32,100,97,116,97,32,102,111,114,109,97,116,32,105,115,32,99,111,109,112,114,101,115,115,101,100,44,32,99,97,110,32,110,111,116,32,98,101,32,99,111,110,118,101,114,116,101,100,0,91,84,69,88,32,73,68,32,37,105,93,32,68,101,102,97,117,108,116,32,102,111,110,116,32,108,111,97,100,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,73,78,70,79,58,32,0,69,82,82,79,82,58,32,0,87,65,82,78,73,78,71,58,32,0,91,86,65,79,32,73,68,32,37,105,93,32,76,105,110,101,115,32,86,65,79,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,86,66,79,32,73,68,32,37,105,93,91,86,66,79,32,73,68,32,37,105,93,32,76,105,110,101,115,32,86,66,79,115,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,86,65,79,32,73,68,32,37,105,93,32,84,114,105,97,110,103,108,101,115,32,86,65,79,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,86,66,79,32,73,68,32,37,105,93,91,86,66,79,32,73,68,32,37,105,93,32,84,114,105,97,110,103,108,101,115,32,86,66,79,115,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,86,65,79,32,73,68,32,37,105,93,32,81,117,97,100,115,32,86,65,79,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,86,66,79,32,73,68,32,37,105,93,91,86,66,79,32,73,68,32,37,105,93,91,86,66,79,32,73,68,32,37,105,93,91,86,66,79,32,73,68,32,37,105,93,32,81,117,97,100,115,32,86,66,79,115,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,67,80,85,32,98,117,102,102,101,114,115,32,40,108,105,110,101,115,44,32,116,114,105,97,110,103,108,101,115,44,32,113,117,97,100,115,41,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,35,118,101,114,115,105,111,110,32,49,48,48,32,32,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,51,32,118,101,114,116,101,120,80,111,115,105,116,105,111,110,59,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,118,101,114,116,101,120,84,101,120,67,111,111,114,100,59,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,51,32,118,101,114,116,101,120,78,111,114,109,97,108,59,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,50,32,102,114,97,103,84,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,10,117,110,105,102,111,114,109,32,109,97,116,52,32,112,114,111,106,101,99,116,105,111,110,77,97,116,114,105,120,59,32,32,32,32,32,10,117,110,105,102,111,114,109,32,109,97,116,52,32,109,111,100,101,108,118,105,101,119,77,97,116,114,105,120,59,32,32,32,32,32,32,10,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,102,114,97,103,84,101,120,67,111,111,114,100,32,61,32,118,101,114,116,101,120,84,101,120,67,111,111,114,100,59,32,10,32,32,32,32,103,108,95,80,111,115,105,116,105,111,110,32,61,32,112,114,111,106,101,99,116,105,111,110,77,97,116,114,105,120,42,109,111,100,101,108,118,105,101,119,77,97,116,114,105,120,42,118,101,99,52,40,118,101,114,116,101,120,80,111,115,105,116,105,111,110,44,32,49,46,48,41,59,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,0,35,118,101,114,115,105,111,110,32,49,48,48,32,32,32,32,32,32,32,10,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,50,32,102,114,97,103,84,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,10,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,116,101,120,116,117,114,101,48,59,32,32,32,32,32,32,32,32,10,117,110,105,102,111,114,109,32,118,101,99,52,32,116,105,110,116,67,111,108,111,114,59,32,32,32,32,32,32,32,32,32,32,32,32,10,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,118,101,99,52,32,116,101,120,101,108,67,111,108,111,114,32,61,32,116,101,120,116,117,114,101,50,68,40,116,101,120,116,117,114,101,48,44,32,102,114,97,103,84,101,120,67,111,111,114,100,41,59,32,10,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,116,101,120,101,108,67,111,108,111,114,42,116,105,110,116,67,111,108,111,114,59,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,0,91,83,72,68,82,32,73,68,32,37,105,93,32,83,105,109,112,108,101,32,115,104,97,100,101,114,32,108,111,97,100,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,83,72,68,82,32,73,68,32,37,105,93,32,83,105,109,112,108,101,32,115,104,97,100,101,114,32,99,111,117,108,100,32,110,111,116,32,98,101,32,108,111,97,100,101,100,0,35,118,101,114,115,105,111,110,32,49,48,48,32,32,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,51,32,118,101,114,116,101,120,80,111,115,105,116,105,111,110,59,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,50,32,118,101,114,116,101,120,84,101,120,67,111,111,114,100,59,32,32,32,32,32,10,97,116,116,114,105,98,117,116,101,32,118,101,99,52,32,118,101,114,116,101,120,67,111,108,111,114,59,32,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,50,32,102,114,97,103,84,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,52,32,116,105,110,116,67,111,108,111,114,59,32,32,32,32,32,32,32,32,32,32,32,32,10,117,110,105,102,111,114,109,32,109,97,116,52,32,112,114,111,106,101,99,116,105,111,110,77,97,116,114,105,120,59,32,32,32,32,32,10,117,110,105,102,111,114,109,32,109,97,116,52,32,109,111,100,101,108,118,105,101,119,77,97,116,114,105,120,59,32,32,32,32,32,32,10,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,102,114,97,103,84,101,120,67,111,111,114,100,32,61,32,118,101,114,116,101,120,84,101,120,67,111,111,114,100,59,32,10,32,32,32,32,116,105,110,116,67,111,108,111,114,32,61,32,118,101,114,116,101,120,67,111,108,111,114,59,32,32,32,32,32,32,32,10,32,32,32,32,103,108,95,80,111,115,105,116,105,111,110,32,61,32,112,114,111,106,101,99,116,105,111,110,77,97,116,114,105,120,42,109,111,100,101,108,118,105,101,119,77,97,116,114,105,120,42,118,101,99,52,40,118,101,114,116,101,120,80,111,115,105,116,105,111,110,44,32,49,46,48,41,59,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,0,35,118,101,114,115,105,111,110,32,49,48,48,32,32,32,32,32,32,32,10,112,114,101,99,105,115,105,111,110,32,109,101,100,105,117,109,112,32,102,108,111,97,116,59,32,32,32,32,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,50,32,102,114,97,103,84,101,120,67,111,111,114,100,59,32,32,32,32,32,32,32,32,32,10,118,97,114,121,105,110,103,32,118,101,99,52,32,116,105,110,116,67,111,108,111,114,59,32,32,32,32,32,32,32,32,32,32,32,32,10,117,110,105,102,111,114,109,32,115,97,109,112,108,101,114,50,68,32,116,101,120,116,117,114,101,48,59,32,32,32,32,32,32,32,32,10,118,111,105,100,32,109,97,105,110,40,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,118,101,99,52,32,116,101,120,101,108,67,111,108,111,114,32,61,32,116,101,120,116,117,114,101,50,68,40,116,101,120,116,117,114,101,48,44,32,102,114,97,103,84,101,120,67,111,111,114,100,41,59,32,10,32,32,32,32,103,108,95,70,114,97,103,67,111,108,111,114,32,61,32,116,101,120,101,108,67,111,108,111,114,42,116,105,110,116,67,111,108,111,114,59,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,0,91,83,72,68,82,32,73,68,32,37,105,93,32,68,101,102,97,117,108,116,32,115,104,97,100,101,114,32,108,111,97,100,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,91,83,72,68,82,32,73,68,32,37,105,93,32,68,101,102,97,117,108,116,32,115,104,97,100,101,114,32,99,111,117,108,100,32,110,111,116,32,98,101,32,108,111,97,100,101,100,0,118,101,114,116,101,120,67,111,108,111,114,0,70,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,71,76,70,87,0,84,114,121,105,110,103,32,116,111,32,101,110,97,98,108,101,32,77,83,65,65,32,120,52,0,71,76,70,87,32,70,97,105,108,101,100,32,116,111,32,105,110,105,116,105,97,108,105,122,101,32,87,105,110,100,111,119,0,68,105,115,112,108,97,121,32,100,101,118,105,99,101,32,105,110,105,116,105,97,108,105,122,101,100,32,115,117,99,99,101,115,115,102,117,108,108,121,0,82,101,110,100,101,114,32,115,105,122,101,58,32,37,105,32,120,32,37,105,0,83,99,114,101,101,110,32,115,105,122,101,58,32,37,105,32,120,32,37,105,0,86,105,101,119,112,111,114,116,32,111,102,102,115,101,116,115,58,32,37,105,44,32,37,105,0,84,114,121,105,110,103,32,116,111,32,101,110,97,98,108,101,32,86,83,89,78,67,0,68,79,87,78,83,67,65,76,73,78,71,58,32,82,101,113,117,105,114,101,100,32,115,99,114,101,101,110,32,115,105,122,101,32,40,37,105,120,37,105,41,32,105,115,32,98,105,103,103,101,114,32,116,104,97,110,32,100,105,115,112,108,97,121,32,115,105,122,101,32,40,37,105,120,37,105,41,0,68,111,119,110,115,99,97,108,101,32,109,97,116,114,105,120,32,103,101,110,101,114,97,116,101,100,44,32,99,111,110,116,101,110,116,32,119,105,108,108,32,98,101,32,114,101,110,100,101,114,101,100,32,97,116,58,32,37,105,32,120,32,37,105,0,85,80,83,67,65,76,73,78,71,58,32,82,101,113,117,105,114,101,100,32,115,99,114,101,101,110,32,115,105,122,101,58,32,37,105,32,120,32,37,105,32,45,62,32,68,105,115,112,108,97,121,32,115,105,122,101,58,32,37,105,32,120,32,37,105,0,91,71,76,70,87,51,32,69,114,114,111,114,93,32,67,111,100,101,58,32,37,105,32,68,101,99,114,105,112,116,105,111,110,58,32,37,115,0,69,88,84,0,65,82,66,0,79,69,83,0,65,78,71,76,69,0,103,108,67,114,101,97,116,101,80,114,111,103,114,97,109,79,98,106,101,99,116,0,103,108,67,114,101,97,116,101,80,114,111,103,114,97,109,0,103,108,85,115,101,80,114,111,103,114,97,109,79,98,106,101,99,116,0,103,108,85,115,101,80,114,111,103,114,97,109,0,103,108,67,114,101,97,116,101,83,104,97,100,101,114,79,98,106,101,99,116,0,103,108,67,114,101,97,116,101,83,104,97,100,101,114,0,103,108,65,116,116,97,99,104,79,98,106,101,99,116,0,103,108,65,116,116,97,99,104,83,104,97,100,101,114,0,103,108,68,101,116,97,99,104,79,98,106,101,99,116,0,103,108,68,101,116,97,99,104,83,104,97,100,101,114,0,103,108,80,105,120,101,108,83,116,111,114,101,105,0,103,108,71,101,116,83,116,114,105,110,103,0,103,108,71,101,116,73,110,116,101,103,101,114,118,0,103,108,71,101,116,70,108,111,97,116,118,0,103,108,71,101,116,66,111,111,108,101,97,110,118,0,103,108,71,101,110,84,101,120,116,117,114,101,115,0,103,108,68,101,108,101,116,101,84,101,120,116,117,114,101,115,0,103,108,67,111,109,112,114,101,115,115,101,100,84,101,120,73,109,97,103,101,50,68,0,103,108,67,111,109,112,114,101,115,115,101,100,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,84,101,120,73,109,97,103,101,50,68,0,103,108,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,82,101,97,100,80,105,120,101,108,115,0,103,108,66,105,110,100,84,101,120,116,117,114,101,0,103,108,71,101,116,84,101,120,80,97,114,97,109,101,116,101,114,102,118,0,103,108,71,101,116,84,101,120,80,97,114,97,109,101,116,101,114,105,118,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,102,118,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,84,101,120,116,117,114,101,0,103,108,71,101,110,66,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,66,117,102,102,101,114,115,0,103,108,71,101,116,66,117,102,102,101,114,80,97,114,97,109,101,116,101,114,105,118,0,103,108,66,117,102,102,101,114,68,97,116,97,0,103,108,66,117,102,102,101,114,83,117,98,68,97,116,97,0,103,108,73,115,66,117,102,102,101,114,0,103,108,71,101,110,82,101,110,100,101,114,98,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,82,101,110,100,101,114,98,117,102,102,101,114,115,0,103,108,66,105,110,100,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,71,101,116,82,101,110,100,101,114,98,117,102,102,101,114,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,71,101,116,85,110,105,102,111,114,109,102,118,0,103,108,71,101,116,85,110,105,102,111,114,109,105,118,0,103,108,71,101,116,85,110,105,102,111,114,109,76,111,99,97,116,105,111,110,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,102,118,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,105,118,0,103,108,71,101,116,86,101,114,116,101,120,65,116,116,114,105,98,80,111,105,110,116,101,114,118,0,103,108,71,101,116,65,99,116,105,118,101,85,110,105,102,111,114,109,0,103,108,85,110,105,102,111,114,109,49,102,0,103,108,85,110,105,102,111,114,109,50,102,0,103,108,85,110,105,102,111,114,109,51,102,0,103,108,85,110,105,102,111,114,109,52,102,0,103,108,85,110,105,102,111,114,109,49,105,0,103,108,85,110,105,102,111,114,109,50,105,0,103,108,85,110,105,102,111,114,109,51,105,0,103,108,85,110,105,102,111,114,109,52,105,0,103,108,85,110,105,102,111,114,109,49,105,118,0,103,108,85,110,105,102,111,114,109,50,105,118,0,103,108,85,110,105,102,111,114,109,51,105,118,0,103,108,85,110,105,102,111,114,109,52,105,118,0,103,108,85,110,105,102,111,114,109,49,102,118,0,103,108,85,110,105,102,111,114,109,50,102,118,0,103,108,85,110,105,102,111,114,109,51,102,118,0,103,108,85,110,105,102,111,114,109,52,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,50,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,51,102,118,0,103,108,85,110,105,102,111,114,109,77,97,116,114,105,120,52,102,118,0,103,108,66,105,110,100,66,117,102,102,101,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,49,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,50,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,51,102,118,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,52,102,118,0,103,108,71,101,116,65,116,116,114,105,98,76,111,99,97,116,105,111,110,0,103,108,71,101,116,65,99,116,105,118,101,65,116,116,114,105,98,0,103,108,68,101,108,101,116,101,83,104,97,100,101,114,0,103,108,71,101,116,65,116,116,97,99,104,101,100,83,104,97,100,101,114,115,0,103,108,83,104,97,100,101,114,83,111,117,114,99,101,0,103,108,71,101,116,83,104,97,100,101,114,83,111,117,114,99,101,0,103,108,67,111,109,112,105,108,101,83,104,97,100,101,114,0,103,108,71,101,116,83,104,97,100,101,114,73,110,102,111,76,111,103,0,103,108,71,101,116,83,104,97,100,101,114,105,118,0,103,108,71,101,116,80,114,111,103,114,97,109,105,118,0,103,108,73,115,83,104,97,100,101,114,0,103,108,68,101,108,101,116,101,80,114,111,103,114,97,109,0,103,108,71,101,116,83,104,97,100,101,114,80,114,101,99,105,115,105,111,110,70,111,114,109,97,116,0,103,108,76,105,110,107,80,114,111,103,114,97,109,0,103,108,71,101,116,80,114,111,103,114,97,109,73,110,102,111,76,111,103,0,103,108,86,97,108,105,100,97,116,101,80,114,111,103,114,97,109,0,103,108,73,115,80,114,111,103,114,97,109,0,103,108,66,105,110,100,65,116,116,114,105,98,76,111,99,97,116,105,111,110,0,103,108,66,105,110,100,70,114,97,109,101,98,117,102,102,101,114,0,103,108,71,101,110,70,114,97,109,101,98,117,102,102,101,114,115,0,103,108,68,101,108,101,116,101,70,114,97,109,101,98,117,102,102,101,114,115,0,103,108,70,114,97,109,101,98,117,102,102,101,114,82,101,110,100,101,114,98,117,102,102,101,114,0,103,108,70,114,97,109,101,98,117,102,102,101,114,84,101,120,116,117,114,101,50,68,0,103,108,71,101,116,70,114,97,109,101,98,117,102,102,101,114,65,116,116,97,99,104,109,101,110,116,80,97,114,97,109,101,116,101,114,105,118,0,103,108,73,115,70,114,97,109,101,98,117,102,102,101,114,0,103,108,68,101,108,101,116,101,79,98,106,101,99,116,0,103,108,71,101,116,79,98,106,101,99,116,80,97,114,97,109,101,116,101,114,105,118,0,103,108,71,101,116,73,110,102,111,76,111,103,0,103,108,66,105,110,100,80,114,111,103,114,97,109,0,103,108,71,101,116,80,111,105,110,116,101,114,118,0,103,108,68,114,97,119,82,97,110,103,101,69,108,101,109,101,110,116,115,0,103,108,69,110,97,98,108,101,67,108,105,101,110,116,83,116,97,116,101,0,103,108,86,101,114,116,101,120,80,111,105,110,116,101,114,0,103,108,84,101,120,67,111,111,114,100,80,111,105,110,116,101,114,0,103,108,78,111,114,109,97,108,80,111,105,110,116,101,114,0,103,108,67,111,108,111,114,80,111,105,110,116,101,114,0,103,108,67,108,105,101,110,116,65,99,116,105,118,101,84,101,120,116,117,114,101,0,103,108,71,101,110,86,101,114,116,101,120,65,114,114,97,121,115,0,103,108,68,101,108,101,116,101,86,101,114,116,101,120,65,114,114,97,121,115,0,103,108,66,105,110,100,86,101,114,116,101,120,65,114,114,97,121,0,103,108,77,97,116,114,105,120,77,111,100,101,0,103,108,76,111,97,100,73,100,101,110,116,105,116,121,0,103,108,76,111,97,100,77,97,116,114,105,120,102,0,103,108,70,114,117,115,116,117,109,0,103,108,82,111,116,97,116,101,102,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,80,111,105,110,116,101,114,0,103,108,69,110,97,98,108,101,86,101,114,116,101,120,65,116,116,114,105,98,65,114,114,97,121,0,103,108,68,105,115,97,98,108,101,86,101,114,116,101,120,65,116,116,114,105,98,65,114,114,97,121,0,103,108,68,114,97,119,65,114,114,97,121,115,0,103,108,68,114,97,119,69,108,101,109,101,110,116,115,0,103,108,83,104,97,100,101,114,66,105,110,97,114,121,0,103,108,82,101,108,101,97,115,101,83,104,97,100,101,114,67,111,109,112,105,108,101,114,0,103,108,71,101,116,69,114,114,111,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,68,105,118,105,115,111,114,0,103,108,68,114,97,119,65,114,114,97,121,115,73,110,115,116,97,110,99,101,100,0,103,108,68,114,97,119,69,108,101,109,101,110,116,115,73,110,115,116,97,110,99,101,100,0,103,108,70,105,110,105,115,104,0,103,108,70,108,117,115,104,0,103,108,67,108,101,97,114,68,101,112,116,104,0,103,108,67,108,101,97,114,68,101,112,116,104,102,0,103,108,68,101,112,116,104,70,117,110,99,0,103,108,69,110,97,98,108,101,0,103,108,68,105,115,97,98,108,101,0,103,108,70,114,111,110,116,70,97,99,101,0,103,108,67,117,108,108,70,97,99,101,0,103,108,67,108,101,97,114,0,103,108,76,105,110,101,87,105,100,116,104,0,103,108,67,108,101,97,114,83,116,101,110,99,105,108,0,103,108,68,101,112,116,104,77,97,115,107,0,103,108,83,116,101,110,99,105,108,77,97,115,107,0,103,108,67,104,101,99,107,70,114,97,109,101,98,117,102,102,101,114,83,116,97,116,117,115,0,103,108,71,101,110,101,114,97,116,101,77,105,112,109,97,112,0,103,108,65,99,116,105,118,101,84,101,120,116,117,114,101,0,103,108,66,108,101,110,100,69,113,117,97,116,105,111,110,0,103,108,73,115,69,110,97,98,108,101,100,0,103,108,66,108,101,110,100,70,117,110,99,0,103,108,66,108,101,110,100,69,113,117,97,116,105,111,110,83,101,112,97,114,97,116,101,0,103,108,68,101,112,116,104,82,97,110,103,101,0,103,108,68,101,112,116,104,82,97,110,103,101,102,0,103,108,83,116,101,110,99,105,108,77,97,115,107,83,101,112,97,114,97,116,101,0,103,108,72,105,110,116,0,103,108,80,111,108,121,103,111,110,79,102,102,115,101,116,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,49,102,0,103,108,83,97,109,112,108,101,67,111,118,101,114,97,103,101,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,105,0,103,108,84,101,120,80,97,114,97,109,101,116,101,114,102,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,50,102,0,103,108,83,116,101,110,99,105,108,70,117,110,99,0,103,108,83,116,101,110,99,105,108,79,112,0,103,108,86,105,101,119,112,111,114,116,0,103,108,67,108,101,97,114,67,111,108,111,114,0,103,108,83,99,105,115,115,111,114,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,51,102,0,103,108,67,111,108,111,114,77,97,115,107,0,103,108,82,101,110,100,101,114,98,117,102,102,101,114,83,116,111,114,97,103,101,0,103,108,66,108,101,110,100,70,117,110,99,83,101,112,97,114,97,116,101,0,103,108,66,108,101,110,100,67,111,108,111,114,0,103,108,83,116,101,110,99,105,108,70,117,110,99,83,101,112,97,114,97,116,101,0,103,108,83,116,101,110,99,105,108,79,112,83,101,112,97,114,97,116,101,0,103,108,86,101,114,116,101,120,65,116,116,114,105,98,52,102,0,103,108,67,111,112,121,84,101,120,73,109,97,103,101,50,68,0,103,108,67,111,112,121,84,101,120,83,117,98,73,109,97,103,101,50,68,0,103,108,68,114,97,119,66,117,102,102,101,114,115,0,123,32,77,111,100,117,108,101,46,112,114,105,110,116,69,114,114,40,39,98,97,100,32,110,97,109,101,32,105,110,32,103,101,116,80,114,111,99,65,100,100,114,101,115,115,58,32,39,32,43,32,91,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,40,36,48,41,44,32,80,111,105,110,116,101,114,95,115,116,114,105,110,103,105,102,121,40,36,49,41,93,41,59,32,125,0,84,33,34,25,13,1,2,3,17,75,28,12,16,4,11,29,18,30,39,104,110,111,112,113,98,32,5,6,15,19,20,21,26,8,22,7,40,36,23,24,9,10,14,27,31,37,35,131,130,125,38,42,43,60,61,62,63,67,71,74,77,88,89,90,91,92,93,94,95,96,97,99,100,101,102,103,105,106,107,108,114,115,116,121,122,123,124,0,73,108,108,101,103,97,108,32,98,121,116,101,32,115,101,113,117,101,110,99,101,0,68,111,109,97,105,110,32,101,114,114,111,114,0,82,101,115,117,108,116,32,110,111,116,32,114,101,112,114,101,115,101,110,116,97,98,108,101,0,78,111,116,32,97,32,116,116,121,0,80,101,114,109,105,115,115,105,111,110,32,100,101,110,105,101,100,0,79,112,101,114,97,116,105,111,110,32,110,111,116,32,112,101,114,109,105,116,116,101,100,0,78,111,32,115,117,99,104,32,102,105,108,101,32,111,114,32,100,105,114,101,99,116,111,114,121,0,78,111,32,115,117,99,104,32,112,114,111,99,101,115,115,0,70,105,108,101,32,101,120,105,115,116,115,0,86,97,108,117,101,32,116,111,111,32,108,97,114,103,101,32,102,111,114,32,100,97,116,97,32,116,121,112,101,0,78,111,32,115,112,97,99,101,32,108,101,102,116,32,111,110,32,100,101,118,105,99,101,0,79,117,116,32,111,102,32,109,101,109,111,114,121,0,82,101,115,111,117,114,99,101,32,98,117,115,121,0,73,110,116,101,114,114,117,112,116,101,100,32,115,121,115,116,101,109,32,99,97,108,108,0,82,101,115,111,117,114,99,101,32,116,101,109,112,111,114,97,114,105,108,121,32,117,110,97,118,97,105,108,97,98,108,101,0,73,110,118,97,108,105,100,32,115,101,101,107,0,67,114,111,115,115,45,100,101,118,105,99,101,32,108,105,110,107,0,82,101,97,100,45,111,110,108,121,32,102,105,108,101,32,115,121,115,116,101,109,0,68,105,114,101,99,116,111,114,121,32,110,111,116,32,101,109,112,116,121,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,112,101,101,114,0,79,112,101,114,97,116,105,111,110,32,116,105,109,101,100,32,111,117,116,0,67,111,110,110,101,99,116,105,111,110,32,114,101,102,117,115,101,100,0,72,111,115,116,32,105,115,32,100,111,119,110,0,72,111,115,116,32,105,115,32,117,110,114,101,97,99,104,97,98,108,101,0,65,100,100,114,101,115,115,32,105,110,32,117,115,101,0,66,114,111,107,101,110,32,112,105,112,101,0,73,47,79,32,101,114,114,111,114,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,32,111,114,32,97,100,100,114,101,115,115,0,66,108,111,99,107,32,100,101,118,105,99,101,32,114,101,113,117,105,114,101,100,0,78,111,32,115,117,99,104,32,100,101,118,105,99,101,0,78,111,116,32,97,32,100,105,114,101,99,116,111,114,121,0,73,115,32,97,32,100,105,114,101,99,116,111,114,121,0,84,101,120,116,32,102,105,108,101,32,98,117,115,121,0,69,120,101,99,32,102,111,114,109,97,116,32,101,114,114,111,114,0,73,110,118,97,108,105,100,32,97,114,103,117,109,101,110,116,0,65,114,103,117,109,101,110,116,32,108,105,115,116,32,116,111,111,32,108,111,110,103,0,83,121,109,98,111,108,105,99,32,108,105,110,107,32,108,111,111,112,0,70,105,108,101,110,97,109,101,32,116,111,111,32,108,111,110,103,0,84,111,111,32,109,97,110,121,32,111,112,101,110,32,102,105,108,101,115,32,105,110,32,115,121,115,116,101,109,0,78,111,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,115,32,97,118,97,105,108,97,98,108,101,0,66,97,100,32,102,105,108,101,32,100,101,115,99,114,105,112,116,111,114,0,78,111,32,99,104,105,108,100,32,112,114,111,99,101,115,115,0,66,97,100,32,97,100,100,114,101,115,115,0,70,105,108,101,32,116,111,111,32,108,97,114,103,101,0,84,111,111,32,109,97,110,121,32,108,105,110,107,115,0,78,111,32,108,111,99,107,115,32,97,118,97,105,108,97,98,108,101,0,82,101,115,111,117,114,99,101,32,100,101,97,100,108,111,99,107,32,119,111,117,108,100,32,111,99,99,117,114,0,83,116,97,116,101,32,110,111,116,32,114,101,99,111,118,101,114,97,98,108,101,0,80,114,101,118,105,111,117,115,32,111,119,110,101,114,32,100,105,101,100,0,79,112,101,114,97,116,105,111,110,32,99,97,110,99,101,108,101,100,0,70,117,110,99,116,105,111,110,32,110,111,116,32,105,109,112,108,101,109,101,110,116,101,100,0,78,111,32,109,101,115,115,97,103,101,32,111,102,32,100,101,115,105,114,101,100,32,116,121,112,101,0,73,100,101,110,116,105,102,105,101,114,32,114,101,109,111,118,101,100,0,68,101,118,105,99,101,32,110,111,116,32,97,32,115,116,114,101,97,109,0,78,111,32,100,97,116,97,32,97,118,97,105,108,97,98,108,101,0,68,101,118,105,99,101,32,116,105,109,101,111,117,116,0,79,117,116,32,111,102,32,115,116,114,101,97,109,115,32,114,101,115,111,117,114,99,101,115,0,76,105,110,107,32,104,97,115,32,98,101,101,110,32,115,101,118,101,114,101,100,0,80,114,111,116,111,99,111,108,32,101,114,114,111,114,0,66,97,100,32,109,101,115,115,97,103,101,0,70,105,108,101,32,100,101,115,99,114,105,112,116,111,114,32,105,110,32,98,97,100,32,115,116,97,116,101,0,78,111,116,32,97,32,115,111,99,107,101,116,0,68,101,115,116,105,110,97,116,105,111,110,32,97,100,100,114,101,115,115,32,114,101,113,117,105,114,101,100,0,77,101,115,115,97,103,101,32,116,111,111,32,108,97,114,103,101,0,80,114,111,116,111,99,111,108,32,119,114,111,110,103,32,116,121,112,101,32,102,111,114,32,115,111,99,107,101,116,0,80,114,111,116,111,99,111,108,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,80,114,111,116,111,99,111,108,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,83,111,99,107,101,116,32,116,121,112,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,78,111,116,32,115,117,112,112,111,114,116,101,100,0,80,114,111,116,111,99,111,108,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,65,100,100,114,101,115,115,32,102,97,109,105,108,121,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,98,121,32,112,114,111,116,111,99,111,108,0,65,100,100,114,101,115,115,32,110,111,116,32,97,118,97,105,108,97,98,108,101,0,78,101,116,119,111,114,107,32,105,115,32,100,111,119,110,0,78,101,116,119,111,114,107,32,117,110,114,101,97,99,104,97,98,108,101,0,67,111,110,110,101,99,116,105,111,110,32,114,101,115,101,116,32,98,121,32,110,101,116,119,111,114,107,0,67,111,110,110,101,99,116,105,111,110,32,97,98,111,114,116,101,100,0,78,111,32,98,117,102,102,101,114,32,115,112,97,99,101,32,97,118,97,105,108,97,98,108,101,0,83,111,99,107,101,116,32,105,115,32,99,111,110,110,101,99,116,101,100,0,83,111,99,107,101,116,32,110,111,116,32,99,111,110,110,101,99,116,101,100,0,67,97,110,110,111,116,32,115,101,110,100,32,97,102,116,101,114,32,115,111,99,107,101,116,32,115,104,117,116,100,111,119,110,0,79,112,101,114,97,116,105,111,110,32,97,108,114,101,97,100,121,32,105,110,32,112,114,111,103,114,101,115,115,0,79,112,101,114,97,116,105,111,110,32,105,110,32,112,114,111,103,114,101,115,115,0,83,116,97,108,101,32,102,105,108,101,32,104,97,110,100,108,101,0,82,101,109,111,116,101,32,73,47,79,32,101,114,114,111,114,0,81,117,111,116,97,32,101,120,99,101,101,100,101,100,0,78,111,32,109,101,100,105,117,109,32,102,111,117,110,100,0,87,114,111,110,103,32,109,101,100,105,117,109,32,116,121,112,101,0,78,111,32,101,114,114,111,114,32,105,110,102,111,114,109,97,116,105,111,110], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+7004);
/* memory initializer */ allocate([17,0,10,0,17,17,17,0,0,0,0,5,0,0,0,0,0,0,9,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,15,10,17,17,17,3,10,7,0,1,19,9,11,11,0,0,9,6,11,0,0,11,0,6,17,0,0,0,17,17,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,17,0,10,10,17,17,17,0,10,0,0,2,0,9,11,0,0,0,9,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,0,0,0,0,0,13,0,0,0,4,13,0,0,0,0,9,14,0,0,0,0,0,14,0,0,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,15,0,0,0,0,15,0,0,0,0,9,16,0,0,0,0,0,16,0,0,16,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,18,18,18,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,0,10,0,0,0,0,9,11,0,0,0,0,0,11,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,12,0,0,0,0,9,12,0,0,0,0,0,12,0,0,12,0,0,48,49,50,51,52,53,54,55,56,57,65,66,67,68,69,70,45,43,32,32,32,48,88,48,120,0,40,110,117,108,108,41,0,45,48,88,43,48,88,32,48,88,45,48,120,43,48,120,32,48,120,0,105,110,102,0,73,78,70,0,110,97,110,0,78,65,78,0,46,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE+17906);





/* no memory initializer */
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}

// {{PRE_LIBRARY}}


  
  var GL={counter:1,lastError:0,buffers:[],mappedBuffers:{},programs:[],framebuffers:[],renderbuffers:[],textures:[],uniforms:[],shaders:[],vaos:[],contexts:[],currentContext:null,byteSizeByTypeRoot:5120,byteSizeByType:[1,1,2,2,4,4,4,2,3,4,8],programInfos:{},stringCache:{},packAlignment:4,unpackAlignment:4,init:function () {
        GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
        for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
          GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i+1);
        }
      },recordError:function recordError(errorCode) {
        if (!GL.lastError) {
          GL.lastError = errorCode;
        }
      },getNewId:function (table) {
        var ret = GL.counter++;
        for (var i = table.length; i < ret; i++) {
          table[i] = null;
        }
        return ret;
      },MINI_TEMP_BUFFER_SIZE:16,miniTempBuffer:null,miniTempBufferViews:[0],getSource:function (shader, count, string, length) {
        var source = '';
        for (var i = 0; i < count; ++i) {
          var frag;
          if (length) {
            var len = HEAP32[(((length)+(i*4))>>2)];
            if (len < 0) {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
            } else {
              frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)], len);
            }
          } else {
            frag = Pointer_stringify(HEAP32[(((string)+(i*4))>>2)]);
          }
          source += frag;
        }
        return source;
      },createContext:function (canvas, webGLContextAttributes) {
        if (typeof webGLContextAttributes.majorVersion === 'undefined' && typeof webGLContextAttributes.minorVersion === 'undefined') {
          webGLContextAttributes.majorVersion = 1;
          webGLContextAttributes.minorVersion = 0;
        }
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
          try {
            if (webGLContextAttributes.majorVersion == 1 && webGLContextAttributes.minorVersion == 0) {
              ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
            } else if (webGLContextAttributes.majorVersion == 2 && webGLContextAttributes.minorVersion == 0) {
              ctx = canvas.getContext("webgl2", webGLContextAttributes) || canvas.getContext("experimental-webgl2", webGLContextAttributes);
            } else {
              throw 'Unsupported WebGL context version ' + majorVersion + '.' + minorVersion + '!'
            }
          } finally {
            canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e, JSON.stringify(webGLContextAttributes)]);
          return 0;
        }
        // possible GL_DEBUG entry point: ctx = wrapDebugGL(ctx);
  
        if (!ctx) return 0;
        return GL.registerContext(ctx, webGLContextAttributes);
      },registerContext:function (ctx, webGLContextAttributes) {
        var handle = GL.getNewId(GL.contexts);
        var context = {
          handle: handle,
          version: webGLContextAttributes.majorVersion,
          GLctx: ctx
        };
        // Store the created context object so that we can access the context given a canvas without having to pass the parameters again.
        if (ctx.canvas) ctx.canvas.GLctxObject = context;
        GL.contexts[handle] = context;
        if (typeof webGLContextAttributes['enableExtensionsByDefault'] === 'undefined' || webGLContextAttributes.enableExtensionsByDefault) {
          GL.initExtensions(context);
        }
        return handle;
      },makeContextCurrent:function (contextHandle) {
        var context = GL.contexts[contextHandle];
        if (!context) return false;
        GLctx = Module.ctx = context.GLctx; // Active WebGL context object.
        GL.currentContext = context; // Active Emscripten GL layer context object.
        return true;
      },getContext:function (contextHandle) {
        return GL.contexts[contextHandle];
      },deleteContext:function (contextHandle) {
        if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
        if (typeof JSEvents === 'object') JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas); // Release all JS event handlers on the DOM element that the GL context is associated with since the context is now deleted.
        if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined; // Make sure the canvas object no longer refers to the context object so there are no GC surprises.
        GL.contexts[contextHandle] = null;
      },initExtensions:function (context) {
        // If this function is called without a specific context object, init the extensions of the currently active context.
        if (!context) context = GL.currentContext;
  
        if (context.initExtensionsDone) return;
        context.initExtensionsDone = true;
  
        var GLctx = context.GLctx;
  
        context.maxVertexAttribs = GLctx.getParameter(GLctx.MAX_VERTEX_ATTRIBS);
  
        // Detect the presence of a few extensions manually, this GL interop layer itself will need to know if they exist. 
  
        if (context.version < 2) {
          // Extension available from Firefox 26 and Google Chrome 30
          var instancedArraysExt = GLctx.getExtension('ANGLE_instanced_arrays');
          if (instancedArraysExt) {
            GLctx['vertexAttribDivisor'] = function(index, divisor) { instancedArraysExt['vertexAttribDivisorANGLE'](index, divisor); };
            GLctx['drawArraysInstanced'] = function(mode, first, count, primcount) { instancedArraysExt['drawArraysInstancedANGLE'](mode, first, count, primcount); };
            GLctx['drawElementsInstanced'] = function(mode, count, type, indices, primcount) { instancedArraysExt['drawElementsInstancedANGLE'](mode, count, type, indices, primcount); };
          }
  
          // Extension available from Firefox 25 and WebKit
          var vaoExt = GLctx.getExtension('OES_vertex_array_object');
          if (vaoExt) {
            GLctx['createVertexArray'] = function() { return vaoExt['createVertexArrayOES'](); };
            GLctx['deleteVertexArray'] = function(vao) { vaoExt['deleteVertexArrayOES'](vao); };
            GLctx['bindVertexArray'] = function(vao) { vaoExt['bindVertexArrayOES'](vao); };
            GLctx['isVertexArray'] = function(vao) { return vaoExt['isVertexArrayOES'](vao); };
          }
  
          var drawBuffersExt = GLctx.getExtension('WEBGL_draw_buffers');
          if (drawBuffersExt) {
            GLctx['drawBuffers'] = function(n, bufs) { drawBuffersExt['drawBuffersWEBGL'](n, bufs); };
          }
        }
  
        // These are the 'safe' feature-enabling extensions that don't add any performance impact related to e.g. debugging, and
        // should be enabled by default so that client GLES2/GL code will not need to go through extra hoops to get its stuff working.
        // As new extensions are ratified at http://www.khronos.org/registry/webgl/extensions/ , feel free to add your new extensions
        // here, as long as they don't produce a performance impact for users that might not be using those extensions.
        // E.g. debugging-related extensions should probably be off by default.
        var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives",
                                               "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture",
                                               "OES_element_index_uint", "EXT_texture_filter_anisotropic", "ANGLE_instanced_arrays",
                                               "OES_texture_float_linear", "OES_texture_half_float_linear", "WEBGL_compressed_texture_atc",
                                               "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float",
                                               "EXT_frag_depth", "EXT_sRGB", "WEBGL_draw_buffers", "WEBGL_shared_resources",
                                               "EXT_shader_texture_lod" ];
  
        function shouldEnableAutomatically(extension) {
          var ret = false;
          automaticallyEnabledExtensions.forEach(function(include) {
            if (ext.indexOf(include) != -1) {
              ret = true;
            }
          });
          return ret;
        }
  
        var exts = GLctx.getSupportedExtensions();
        if (exts && exts.length > 0) {
          GLctx.getSupportedExtensions().forEach(function(ext) {
            if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
              GLctx.getExtension(ext); // Calling .getExtension enables that extension permanently, no need to store the return value to be enabled.
            }
          });
        }
      },populateUniformTable:function (program) {
        var p = GL.programs[program];
        GL.programInfos[program] = {
          uniforms: {},
          maxUniformLength: 0, // This is eagerly computed below, since we already enumerate all uniforms anyway.
          maxAttributeLength: -1 // This is lazily computed and cached, computed when/if first asked, "-1" meaning not computed yet.
        };
  
        var ptable = GL.programInfos[program];
        var utable = ptable.uniforms;
        // A program's uniform table maps the string name of an uniform to an integer location of that uniform.
        // The global GL.uniforms map maps integer locations to WebGLUniformLocations.
        var numUniforms = GLctx.getProgramParameter(p, GLctx.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUniforms; ++i) {
          var u = GLctx.getActiveUniform(p, i);
  
          var name = u.name;
          ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length+1);
  
          // Strip off any trailing array specifier we might have got, e.g. "[0]".
          if (name.indexOf(']', name.length-1) !== -1) {
            var ls = name.lastIndexOf('[');
            name = name.slice(0, ls);
          }
  
          // Optimize memory usage slightly: If we have an array of uniforms, e.g. 'vec3 colors[3];', then 
          // only store the string 'colors' in utable, and 'colors[0]', 'colors[1]' and 'colors[2]' will be parsed as 'colors'+i.
          // Note that for the GL.uniforms table, we still need to fetch the all WebGLUniformLocations for all the indices.
          var loc = GLctx.getUniformLocation(p, name);
          var id = GL.getNewId(GL.uniforms);
          utable[name] = [u.size, id];
          GL.uniforms[id] = loc;
  
          for (var j = 1; j < u.size; ++j) {
            var n = name + '['+j+']';
            loc = GLctx.getUniformLocation(p, n);
            id = GL.getNewId(GL.uniforms);
  
            GL.uniforms[id] = loc;
          }
        }
      }};function _emscripten_glIsRenderbuffer(renderbuffer) {
      var rb = GL.renderbuffers[renderbuffer];
      if (!rb) return 0;
      return GLctx.isRenderbuffer(rb);
    }

  function _emscripten_glStencilMaskSeparate(x0, x1) { GLctx.stencilMaskSeparate(x0, x1) }

  function _glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.programInfos[program] = null; // uniforms no longer keep the same names after linking
      GL.populateUniformTable(program);
    }

  function _glBindTexture(target, texture) {
      GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }

  function _emscripten_glStencilFunc(x0, x1, x2) { GLctx.stencilFunc(x0, x1, x2) }

  function _glGetString(name_) {
      if (GL.stringCache[name_]) return GL.stringCache[name_];
      var ret; 
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          ret = allocate(intArrayFromString(GLctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
          break;
        case 0x1F03 /* GL_EXTENSIONS */:
          var exts = GLctx.getSupportedExtensions();
          var gl_exts = [];
          for (var i in exts) {
            gl_exts.push(exts[i]);
            gl_exts.push("GL_" + exts[i]);
          }
          ret = allocate(intArrayFromString(gl_exts.join(' ')), 'i8', ALLOC_NORMAL);
          break;
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          ret = allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
          break;
        default:
          GL.recordError(0x0500/*GL_INVALID_ENUM*/);
          return 0;
      }
      GL.stringCache[name_] = ret;
      return ret;
    }

  function _emscripten_glUniform3iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 3;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform3iv(location, value);
    }

  function _emscripten_glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }

  function _emscripten_glReleaseShaderCompiler() {
      // NOP (as allowed by GLES 2.0 spec)
    }

  
  
  function _emscripten_get_now() {
      if (!_emscripten_get_now.actual) {
        if (ENVIRONMENT_IS_NODE) {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() {
            var t = process['hrtime']();
            return t[0] * 1e3 + t[1] / 1e6;
          }
        } else if (typeof dateNow !== 'undefined') {
          _emscripten_get_now.actual = dateNow;
        } else if (typeof self === 'object' && self['performance'] && typeof self['performance']['now'] === 'function') {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return self['performance']['now'](); };
        } else if (typeof performance === 'object' && typeof performance['now'] === 'function') {
          _emscripten_get_now.actual = function _emscripten_get_now_actual() { return performance['now'](); };
        } else {
          _emscripten_get_now.actual = Date.now;
        }
      }
      return _emscripten_get_now.actual();
    }var GLFW={Window:function (id, width, height, title, monitor, share) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.storedX = 0; // Used to store X before fullscreen
        this.storedY = 0; // Used to store Y before fullscreen
        this.width = width;
        this.height = height;
        this.storedWidth = width; // Used to store width before fullscreen
        this.storedHeight = height; // Used to store height before fullscreen
        this.title = title;
        this.monitor = monitor;
        this.share = share;
        this.attributes = GLFW.hints;
        this.inputModes = {
          0x00033001:0x00034001, // GLFW_CURSOR (GLFW_CURSOR_NORMAL)
          0x00033002:0, // GLFW_STICKY_KEYS
          0x00033003:0, // GLFW_STICKY_MOUSE_BUTTONS
        };
        this.buttons = 0;
        this.keys = new Array();
        this.shouldClose = 0;
        this.title = null;
        this.windowPosFunc = null; // GLFWwindowposfun
        this.windowSizeFunc = null; // GLFWwindowsizefun
        this.windowCloseFunc = null; // GLFWwindowclosefun
        this.windowRefreshFunc = null; // GLFWwindowrefreshfun
        this.windowFocusFunc = null; // GLFWwindowfocusfun
        this.windowIconifyFunc = null; // GLFWwindowiconifyfun
        this.framebufferSizeFunc = null; // GLFWframebuffersizefun
        this.mouseButtonFunc = null; // GLFWmousebuttonfun
        this.cursorPosFunc = null; // GLFWcursorposfun
        this.cursorEnterFunc = null; // GLFWcursorenterfun
        this.scrollFunc = null; // GLFWscrollfun
        this.keyFunc = null; // GLFWkeyfun
        this.charFunc = null; // GLFWcharfun
        this.userptr = null;
      },WindowFromId:function (id) {
        if (id <= 0 || !GLFW.windows) return null;
        return GLFW.windows[id - 1];
      },errorFunc:null,monitorFunc:null,active:null,windows:null,monitors:null,monitorString:null,versionString:null,initialTime:null,extensions:null,hints:null,defaultHints:{131073:0,131074:0,131075:1,131076:1,131077:1,135169:8,135170:8,135171:8,135172:8,135173:24,135174:8,135175:0,135176:0,135177:0,135178:0,135179:0,135180:0,135181:0,135182:0,135183:0,139265:196609,139266:1,139267:0,139268:0,139269:0,139270:0,139271:0,139272:0},DOMToGLFWKeyCode:function (keycode) {
        switch (keycode) {
          case 0x20:return 32; // DOM_VK_SPACE -> GLFW_KEY_SPACE
          case 0xDE:return 39; // DOM_VK_QUOTE -> GLFW_KEY_APOSTROPHE
          case 0xBC:return 44; // DOM_VK_COMMA -> GLFW_KEY_COMMA
          case 0xAD:return 45; // DOM_VK_HYPHEN_MINUS -> GLFW_KEY_MINUS
          case 0xBE:return 46; // DOM_VK_PERIOD -> GLFW_KEY_PERIOD
          case 0xBF:return 47; // DOM_VK_SLASH -> GLFW_KEY_SLASH
          case 0x30:return 48; // DOM_VK_0 -> GLFW_KEY_0
          case 0x31:return 49; // DOM_VK_1 -> GLFW_KEY_1
          case 0x32:return 50; // DOM_VK_2 -> GLFW_KEY_2
          case 0x33:return 51; // DOM_VK_3 -> GLFW_KEY_3
          case 0x34:return 52; // DOM_VK_4 -> GLFW_KEY_4
          case 0x35:return 53; // DOM_VK_5 -> GLFW_KEY_5
          case 0x36:return 54; // DOM_VK_6 -> GLFW_KEY_6
          case 0x37:return 55; // DOM_VK_7 -> GLFW_KEY_7
          case 0x38:return 56; // DOM_VK_8 -> GLFW_KEY_8
          case 0x39:return 57; // DOM_VK_9 -> GLFW_KEY_9
          case 0x3B:return 59; // DOM_VK_SEMICOLON -> GLFW_KEY_SEMICOLON
          case 0x61:return 61; // DOM_VK_EQUALS -> GLFW_KEY_EQUAL
          case 0x41:return 65; // DOM_VK_A -> GLFW_KEY_A
          case 0x42:return 66; // DOM_VK_B -> GLFW_KEY_B
          case 0x43:return 67; // DOM_VK_C -> GLFW_KEY_C
          case 0x44:return 68; // DOM_VK_D -> GLFW_KEY_D
          case 0x45:return 69; // DOM_VK_E -> GLFW_KEY_E
          case 0x46:return 70; // DOM_VK_F -> GLFW_KEY_F
          case 0x47:return 71; // DOM_VK_G -> GLFW_KEY_G
          case 0x48:return 72; // DOM_VK_H -> GLFW_KEY_H
          case 0x49:return 73; // DOM_VK_I -> GLFW_KEY_I
          case 0x4A:return 74; // DOM_VK_J -> GLFW_KEY_J
          case 0x4B:return 75; // DOM_VK_K -> GLFW_KEY_K
          case 0x4C:return 76; // DOM_VK_L -> GLFW_KEY_L
          case 0x4D:return 77; // DOM_VK_M -> GLFW_KEY_M
          case 0x4E:return 78; // DOM_VK_N -> GLFW_KEY_N
          case 0x4F:return 79; // DOM_VK_O -> GLFW_KEY_O
          case 0x50:return 80; // DOM_VK_P -> GLFW_KEY_P
          case 0x51:return 81; // DOM_VK_Q -> GLFW_KEY_Q
          case 0x52:return 82; // DOM_VK_R -> GLFW_KEY_R
          case 0x53:return 83; // DOM_VK_S -> GLFW_KEY_S
          case 0x54:return 84; // DOM_VK_T -> GLFW_KEY_T
          case 0x55:return 85; // DOM_VK_U -> GLFW_KEY_U
          case 0x56:return 86; // DOM_VK_V -> GLFW_KEY_V
          case 0x57:return 87; // DOM_VK_W -> GLFW_KEY_W
          case 0x58:return 88; // DOM_VK_X -> GLFW_KEY_X
          case 0x59:return 89; // DOM_VK_Y -> GLFW_KEY_Y
          case 0x5a:return 90; // DOM_VK_Z -> GLFW_KEY_Z
          case 0xDB:return 91; // DOM_VK_OPEN_BRACKET -> GLFW_KEY_LEFT_BRACKET
          case 0xDC:return 92; // DOM_VK_BACKSLASH -> GLFW_KEY_BACKSLASH
          case 0xDD:return 93; // DOM_VK_CLOSE_BRACKET -> GLFW_KEY_RIGHT_BRACKET
          case 0xC0:return 94; // DOM_VK_BACK_QUOTE -> GLFW_KEY_GRAVE_ACCENT
          case 0x1B:return 256; // DOM_VK_ESCAPE -> GLFW_KEY_ESCAPE
          case 0x0D:return 257; // DOM_VK_RETURN -> GLFW_KEY_ENTER
          case 0x09:return 258; // DOM_VK_TAB -> GLFW_KEY_TAB
          case 0x08:return 259; // DOM_VK_BACK -> GLFW_KEY_BACKSPACE
          case 0x2D:return 260; // DOM_VK_INSERT -> GLFW_KEY_INSERT
          case 0x2E:return 261; // DOM_VK_DELETE -> GLFW_KEY_DELETE
          case 0x27:return 262; // DOM_VK_RIGHT -> GLFW_KEY_RIGHT
          case 0x25:return 263; // DOM_VK_LEFT -> GLFW_KEY_LEFT
          case 0x28:return 264; // DOM_VK_DOWN -> GLFW_KEY_DOWN
          case 0x26:return 265; // DOM_VK_UP -> GLFW_KEY_UP
          case 0x21:return 266; // DOM_VK_PAGE_UP -> GLFW_KEY_PAGE_UP
          case 0x22:return 267; // DOM_VK_PAGE_DOWN -> GLFW_KEY_PAGE_DOWN
          case 0x24:return 268; // DOM_VK_HOME -> GLFW_KEY_HOME
          case 0x23:return 269; // DOM_VK_END -> GLFW_KEY_END
          case 0x14:return 280; // DOM_VK_CAPS_LOCK -> GLFW_KEY_CAPS_LOCK
          case 0x91:return 281; // DOM_VK_SCROLL_LOCK -> GLFW_KEY_SCROLL_LOCK
          case 0x90:return 282; // DOM_VK_NUM_LOCK -> GLFW_KEY_NUM_LOCK
          case 0x2C:return 283; // DOM_VK_SNAPSHOT -> GLFW_KEY_PRINT_SCREEN
          case 0x13:return 284; // DOM_VK_PAUSE -> GLFW_KEY_PAUSE
          case 0x70:return 290; // DOM_VK_F1 -> GLFW_KEY_F1
          case 0x71:return 291; // DOM_VK_F2 -> GLFW_KEY_F2
          case 0x72:return 292; // DOM_VK_F3 -> GLFW_KEY_F3
          case 0x73:return 293; // DOM_VK_F4 -> GLFW_KEY_F4
          case 0x74:return 294; // DOM_VK_F5 -> GLFW_KEY_F5
          case 0x75:return 295; // DOM_VK_F6 -> GLFW_KEY_F6
          case 0x76:return 296; // DOM_VK_F7 -> GLFW_KEY_F7
          case 0x77:return 297; // DOM_VK_F8 -> GLFW_KEY_F8
          case 0x78:return 298; // DOM_VK_F9 -> GLFW_KEY_F9
          case 0x79:return 299; // DOM_VK_F10 -> GLFW_KEY_F10
          case 0x7A:return 300; // DOM_VK_F11 -> GLFW_KEY_F11
          case 0x7B:return 301; // DOM_VK_F12 -> GLFW_KEY_F12
          case 0x7C:return 302; // DOM_VK_F13 -> GLFW_KEY_F13
          case 0x7D:return 303; // DOM_VK_F14 -> GLFW_KEY_F14
          case 0x7E:return 304; // DOM_VK_F15 -> GLFW_KEY_F15
          case 0x7F:return 305; // DOM_VK_F16 -> GLFW_KEY_F16
          case 0x80:return 306; // DOM_VK_F17 -> GLFW_KEY_F17
          case 0x81:return 307; // DOM_VK_F18 -> GLFW_KEY_F18
          case 0x82:return 308; // DOM_VK_F19 -> GLFW_KEY_F19
          case 0x83:return 309; // DOM_VK_F20 -> GLFW_KEY_F20
          case 0x84:return 310; // DOM_VK_F21 -> GLFW_KEY_F21
          case 0x85:return 311; // DOM_VK_F22 -> GLFW_KEY_F22
          case 0x86:return 312; // DOM_VK_F23 -> GLFW_KEY_F23
          case 0x87:return 313; // DOM_VK_F24 -> GLFW_KEY_F24
          case 0x88:return 314; // 0x88 (not used?) -> GLFW_KEY_F25
          case 0x60:return 320; // DOM_VK_NUMPAD0 -> GLFW_KEY_KP_0
          case 0x61:return 321; // DOM_VK_NUMPAD1 -> GLFW_KEY_KP_1
          case 0x62:return 322; // DOM_VK_NUMPAD2 -> GLFW_KEY_KP_2
          case 0x63:return 323; // DOM_VK_NUMPAD3 -> GLFW_KEY_KP_3
          case 0x64:return 324; // DOM_VK_NUMPAD4 -> GLFW_KEY_KP_4
          case 0x65:return 325; // DOM_VK_NUMPAD5 -> GLFW_KEY_KP_5
          case 0x66:return 326; // DOM_VK_NUMPAD6 -> GLFW_KEY_KP_6
          case 0x67:return 327; // DOM_VK_NUMPAD7 -> GLFW_KEY_KP_7
          case 0x68:return 328; // DOM_VK_NUMPAD8 -> GLFW_KEY_KP_8
          case 0x69:return 329; // DOM_VK_NUMPAD9 -> GLFW_KEY_KP_9
          case 0x6E:return 330; // DOM_VK_DECIMAL -> GLFW_KEY_KP_DECIMAL
          case 0x6F:return 331; // DOM_VK_DIVIDE -> GLFW_KEY_KP_DIVIDE
          case 0x6A:return 332; // DOM_VK_MULTIPLY -> GLFW_KEY_KP_MULTIPLY
          case 0x6D:return 333; // DOM_VK_SUBTRACT -> GLFW_KEY_KP_SUBTRACT
          case 0x6B:return 334; // DOM_VK_ADD -> GLFW_KEY_KP_ADD
          // case 0x0D:return 335; // DOM_VK_RETURN -> GLFW_KEY_KP_ENTER (DOM_KEY_LOCATION_RIGHT)
          // case 0x61:return 336; // DOM_VK_EQUALS -> GLFW_KEY_KP_EQUAL (DOM_KEY_LOCATION_RIGHT)
          case 0x10:return 340; // DOM_VK_SHIFT -> GLFW_KEY_LEFT_SHIFT
          case 0x11:return 341; // DOM_VK_CONTROL -> GLFW_KEY_LEFT_CONTROL
          case 0x12:return 342; // DOM_VK_ALT -> GLFW_KEY_LEFT_ALT
          case 0x5B:return 343; // DOM_VK_WIN -> GLFW_KEY_LEFT_SUPER
          // case 0x10:return 344; // DOM_VK_SHIFT -> GLFW_KEY_RIGHT_SHIFT (DOM_KEY_LOCATION_RIGHT)
          // case 0x11:return 345; // DOM_VK_CONTROL -> GLFW_KEY_RIGHT_CONTROL (DOM_KEY_LOCATION_RIGHT)
          // case 0x12:return 346; // DOM_VK_ALT -> GLFW_KEY_RIGHT_ALT (DOM_KEY_LOCATION_RIGHT)
          // case 0x5B:return 347; // DOM_VK_WIN -> GLFW_KEY_RIGHT_SUPER (DOM_KEY_LOCATION_RIGHT)
          case 0x5D:return 348; // DOM_VK_CONTEXT_MENU -> GLFW_KEY_MENU
  
          // XXX: GLFW_KEY_WORLD_1, GLFW_KEY_WORLD_2 what are these?
          default:return -1; // GLFW_KEY_UNKNOWN
        };
      },getModBits:function (win) {
        var mod = 0;
        if (win.keys[340]) mod |= 0x0001; // GLFW_MOD_SHIFT
        if (win.keys[341]) mod |= 0x0002; // GLFW_MOD_CONTROL
        if (win.keys[342]) mod |= 0x0004; // GLFW_MOD_ALT
        if (win.keys[343]) mod |= 0x0008; // GLFW_MOD_SUPER
        return mod;
      },onKeyPress:function (event) {
        if (!GLFW.active || !GLFW.active.charFunc) return;
  
        // correct unicode charCode is only available with onKeyPress event
        var charCode = event.charCode;
        if (charCode == 0 || (charCode >= 0x00 && charCode <= 0x1F)) return;
  
  
        Runtime.dynCall('vii', GLFW.active.charFunc, [GLFW.active.id, charCode]);
      },onKeyChanged:function (event, status) {
        if (!GLFW.active) return;
  
        var key = GLFW.DOMToGLFWKeyCode(event.keyCode);
        if (key == -1) return;
  
        GLFW.active.keys[key] = status;
        if (!GLFW.active.keyFunc) return;
  
  
        Runtime.dynCall('viiiii', GLFW.active.keyFunc, [GLFW.active.id, key, event.keyCode, status, GLFW.getModBits(GLFW.active)]);
      },onKeydown:function (event) {
        GLFW.onKeyChanged(event, 1); // GLFW_PRESS
  
        // This logic comes directly from the sdl implementation. We cannot
        // call preventDefault on all keydown events otherwise onKeyPress will
        // not get called
        if (event.keyCode === 8 /* backspace */ || event.keyCode === 9 /* tab */) {
          event.preventDefault();
        }
      },onKeyup:function (event) {
        GLFW.onKeyChanged(event, 0); // GLFW_RELEASE
      },onMousemove:function (event) {
        if (!GLFW.active) return;
  
        Browser.calculateMouseEvent(event);
  
        if (event.target != Module["canvas"] || !GLFW.active.cursorPosFunc) return;
  
  
        Runtime.dynCall('vidd', GLFW.active.cursorPosFunc, [GLFW.active.id, Browser.mouseX, Browser.mouseY]);
      },onMouseButtonChanged:function (event, status) {
        if (!GLFW.active || !GLFW.active.mouseButtonFunc) return;
  
        Browser.calculateMouseEvent(event);
  
        if (event.target != Module["canvas"]) return;
  
        if (status == 1) { // GLFW_PRESS
          try {
            event.target.setCapture();
          } catch (e) {}
        }
  
        // DOM and glfw have different button codes
        var eventButton = event['button'];
        if (eventButton > 0) {
          if (eventButton == 1) {
            eventButton = 2;
          } else {
            eventButton = 1;
          }
        }
  
  
        Runtime.dynCall('viiii', GLFW.active.mouseButtonFunc, [GLFW.active.id, eventButton, status, GLFW.getModBits(GLFW.active)]);
      },onMouseButtonDown:function (event) {
        if (!GLFW.active) return;
        GLFW.active.buttons |= (1 << event['button']);
        GLFW.onMouseButtonChanged(event, 1); // GLFW_PRESS
      },onMouseButtonUp:function (event) {
        if (!GLFW.active) return;
        GLFW.active.buttons &= ~(1 << event['button']);
        GLFW.onMouseButtonChanged(event, 0); // GLFW_RELEASE
      },onMouseWheel:function (event) {
        // Note the minus sign that flips browser wheel direction (positive direction scrolls page down) to native wheel direction (positive direction is mouse wheel up)
        var delta = -Browser.getMouseWheelDelta(event);
        delta = (delta == 0) ? 0 : (delta > 0 ? Math.max(delta, 1) : Math.min(delta, -1)); // Quantize to integer so that minimum scroll is at least +/- 1.
        GLFW.wheelPos += delta;
  
        if (!GLFW.active || !GLFW.active.scrollFunc || event.target != Module['canvas']) return;
  
  
        var sx = 0;
        var sy = 0;
        if (event.type == 'mousewheel') {
          sx = event.wheelDeltaX;
          sy = event.wheelDeltaY;
        } else {
          sx = event.deltaX;
          sy = event.deltaY;
        }
  
        Runtime.dynCall('vidd', GLFW.active.scrollFunc, [GLFW.active.id, sx, sy]);
  
        event.preventDefault();
      },onFullScreenEventChange:function () {
        if (!GLFW.active) return;
  
        if (document["fullScreen"] || document["mozFullScreen"] || document["webkitIsFullScreen"]) {
          GLFW.active.storedX = GLFW.active.x;
          GLFW.active.storedY = GLFW.active.y;
          GLFW.active.storedWidth = GLFW.active.width;
          GLFW.active.storedHeight = GLFW.active.height;
          GLFW.active.x = GLFW.active.y = 0;
          GLFW.active.width = screen.width;
          GLFW.active.height = screen.height;
        } else {
          GLFW.active.x = GLFW.active.storedX;
          GLFW.active.y = GLFW.active.storedY;
          GLFW.active.width = GLFW.active.storedWidth;
          GLFW.active.height = GLFW.active.storedHeight;
        }
  
        Browser.setCanvasSize(GLFW.active.width, GLFW.active.height, true); // resets the canvas size to counter the aspect preservation of Browser.updateCanvasDimensions
  
        if (!GLFW.active.windowSizeFunc) return;
  
  
        Runtime.dynCall('viii', GLFW.active.windowSizeFunc, [GLFW.active.id, GLFW.active.width, GLFW.active.height]);
      },requestFullScreen:function () {
        var RFS = Module["canvas"]['requestFullscreen'] ||
                  Module["canvas"]['requestFullScreen'] ||
                  Module["canvas"]['mozRequestFullScreen'] ||
                  Module["canvas"]['webkitRequestFullScreen'] ||
                  (function() {});
        RFS.apply(Module["canvas"], []);
      },cancelFullScreen:function () {
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['webkitCancelFullScreen'] ||
            (function() {});
        CFS.apply(document, []);
      },getTime:function () {
        return _emscripten_get_now() / 1000;
      },setWindowTitle:function (winid, title) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        win.title = Pointer_stringify(title);
        if (GLFW.active.id == win.id) {
          document.title = win.title;
        }
      },setKeyCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.keyFunc = cbfun;
      },setCharCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.charFunc = cbfun;
      },setMouseButtonCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.mouseButtonFunc = cbfun;
      },setCursorPosCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.cursorPosFunc = cbfun;
      },setScrollCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.scrollFunc = cbfun;
      },setWindowSizeCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.windowSizeFunc = cbfun;
      },setWindowCloseCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.windowCloseFunc = cbfun;
      },setWindowRefreshCallback:function (winid, cbfun) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.windowRefreshFunc = cbfun;
      },getKey:function (winid, key) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return win.keys[key];
      },getMouseButton:function (winid, button) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return 0;
        return (win.buttons & (1 << button)) > 0;
      },getCursorPos:function (winid, x, y) {
        setValue(x, Browser.mouseX, 'double');
        setValue(y, Browser.mouseY, 'double');
      },getMousePos:function (winid, x, y) {
        setValue(x, Browser.mouseX, 'i32');
        setValue(y, Browser.mouseY, 'i32');
      },setCursorPos:function (winid, x, y) {
      },getWindowPos:function (winid, x, y) {
        var wx = 0;
        var wy = 0;
  
        var win = GLFW.WindowFromId(winid);
        if (win) {
          wx = win.x;
          wy = win.y;
        }
  
        setValue(x, wx, 'i32');
        setValue(y, wy, 'i32');
      },setWindowPos:function (winid, x, y) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
        win.x = x;
        win.y = y;
      },getWindowSize:function (winid, width, height) {
        var ww = 0;
        var wh = 0;
  
        var win = GLFW.WindowFromId(winid);
        if (win) {
          ww = win.width;
          wh = win.height;
        }
  
        setValue(width, ww, 'i32');
        setValue(height, wh, 'i32');
      },setWindowSize:function (winid, width, height) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        if (GLFW.active.id == win.id) {
          if (width == screen.width && height == screen.height) {
            GLFW.requestFullScreen();
          } else {
            GLFW.cancelFullScreen();
            Browser.setCanvasSize(width, height);
            win.width = width;
            win.height = height;
          }
        }
  
        if (!win.windowResizeFunc) return;
  
  
        Runtime.dynCall('viii', win.windowResizeFunc, [win.id, width, height]);
      },createWindow:function (width, height, title, monitor, share) {
        var i, id;
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] !== null; i++);
        if (i > 0) throw "glfwCreateWindow only supports one window at time currently";
  
        // id for window
        id = i + 1;
  
        // not valid
        if (width <= 0 || height <= 0) return 0;
  
        if (monitor) {
          GLFW.requestFullScreen();
        } else {
          Browser.setCanvasSize(width, height);
        }
  
        // Create context when there are no existing alive windows
        for (i = 0; i < GLFW.windows.length && GLFW.windows[i] == null; i++);
        if (i == GLFW.windows.length) {
          var contextAttributes = {
            antialias: (GLFW.hints[0x0002100D] > 1), // GLFW_SAMPLES
            depth: (GLFW.hints[0x00021005] > 0),     // GLFW_DEPTH_BITS
            stencil: (GLFW.hints[0x00021006] > 0)    // GLFW_STENCIL_BITS
          }
          Module.ctx = Browser.createContext(Module['canvas'], true, true, contextAttributes);
        }
  
        // If context creation failed, do not return a valid window
        if (!Module.ctx) return 0;
  
        // Get non alive id
        var win = new GLFW.Window(id, width, height, title, monitor, share);
  
        // Set window to array
        if (id - 1 == GLFW.windows.length) {
          GLFW.windows.push(win);
        } else {
          GLFW.windows[id - 1] = win;
        }
  
        GLFW.active = win;
        return win.id;
      },destroyWindow:function (winid) {
        var win = GLFW.WindowFromId(winid);
        if (!win) return;
  
        if (win.windowCloseFunc)
          Runtime.dynCall('vi', win.windowCloseFunc, [win.id]);
  
        GLFW.windows[win.id - 1] = null;
        if (GLFW.active.id == win.id)
          GLFW.active = null;
  
        // Destroy context when no alive windows
        for (var i = 0; i < GLFW.windows.length; i++)
          if (GLFW.windows[i] !== null) return;
  
        Module.ctx = Browser.destroyContext(Module['canvas'], true, true);
      },swapBuffers:function (winid) {
      },GLFW2ParamToGLFW3Param:function (param) {
        table = {
          0x00030001:0, // GLFW_MOUSE_CURSOR
          0x00030002:0, // GLFW_STICKY_KEYS
          0x00030003:0, // GLFW_STICKY_MOUSE_BUTTONS
          0x00030004:0, // GLFW_SYSTEM_KEYS
          0x00030005:0, // GLFW_KEY_REPEAT
          0x00030006:0, // GLFW_AUTO_POLL_EVENTS
          0x00020001:0, // GLFW_OPENED
          0x00020002:0, // GLFW_ACTIVE
          0x00020003:0, // GLFW_ICONIFIED
          0x00020004:0, // GLFW_ACCELERATED
          0x00020005:0x00021001, // GLFW_RED_BITS
          0x00020006:0x00021002, // GLFW_GREEN_BITS
          0x00020007:0x00021003, // GLFW_BLUE_BITS
          0x00020008:0x00021004, // GLFW_ALPHA_BITS
          0x00020009:0x00021005, // GLFW_DEPTH_BITS
          0x0002000A:0x00021006, // GLFW_STENCIL_BITS
          0x0002000B:0x0002100F, // GLFW_REFRESH_RATE
          0x0002000C:0x00021007, // GLFW_ACCUM_RED_BITS
          0x0002000D:0x00021008, // GLFW_ACCUM_GREEN_BITS
          0x0002000E:0x00021009, // GLFW_ACCUM_BLUE_BITS
          0x0002000F:0x0002100A, // GLFW_ACCUM_ALPHA_BITS
          0x00020010:0x0002100B, // GLFW_AUX_BUFFERS
          0x00020011:0x0002100C, // GLFW_STEREO
          0x00020012:0, // GLFW_WINDOW_NO_RESIZE
          0x00020013:0x0002100D, // GLFW_FSAA_SAMPLES
          0x00020014:0x00022002, // GLFW_OPENGL_VERSION_MAJOR
          0x00020015:0x00022003, // GLFW_OPENGL_VERSION_MINOR
          0x00020016:0x00022006, // GLFW_OPENGL_FORWARD_COMPAT
          0x00020017:0x00022007, // GLFW_OPENGL_DEBUG_CONTEXT
          0x00020018:0x00022008, // GLFW_OPENGL_PROFILE
        };
        return table[param];
      }};function _glfwSetScrollCallback(winid, cbfun) {
      GLFW.setScrollCallback(winid, cbfun);
    }

  function _emscripten_glTexParameterf(x0, x1, x2) { GLctx.texParameterf(x0, x1, x2) }

  function _emscripten_glTexParameteri(x0, x1, x2) { GLctx.texParameteri(x0, x1, x2) }

  function _glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }

  
  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  function ___setErrNo(value) {
      if (Module['___errno_location']) HEAP32[((Module['___errno_location']())>>2)]=value;
      else Module.printErr('failed to set errno from JS');
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          stream.tty.ops.flush(stream.tty);
        },flush:function (stream) {
          stream.tty.ops.flush(stream.tty);
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              // we will read data by chunks of BUFSIZE
              var BUFSIZE = 256;
              var buf = new Buffer(BUFSIZE);
              var bytesRead = 0;
  
              var fd = process.stdin.fd;
              // Linux and Mac cannot use process.stdin.fd (which isn't set up as sync)
              var usingDevice = false;
              try {
                fd = fs.openSync('/dev/stdin', 'r');
                usingDevice = true;
              } catch (e) {}
  
              bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
  
              if (usingDevice) { fs.closeSync(fd); }
              if (bytesRead > 0) {
                result = buf.slice(0, bytesRead).toString('utf-8');
              } else {
                result = null;
              }
  
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            Module['print'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },flush:function (tty) {
          if (tty.output && tty.output.length > 0) {
            Module['printErr'](UTF8ArrayToString(tty.output, 0));
            tty.output = [];
          }
        }}};
  
  var MEMFS={ops_table:null,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap,
                msync: MEMFS.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            }
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.buffer.byteLength which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },getFileDataAsRegularArray:function (node) {
        if (node.contents && node.contents.subarray) {
          var arr = [];
          for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
          return arr; // Returns a copy of the original data.
        }
        return node.contents; // No-op, the file contents are already in a JS array. Return as-is.
      },getFileDataAsTypedArray:function (node) {
        if (!node.contents) return new Uint8Array;
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },expandFileStorage:function (node, newCapacity) {
        // If we are asked to expand the size of a file that already exists, revert to using a standard JS array to store the file
        // instead of a typed array. This makes resizing the array more flexible because we can just .push() elements at the back to
        // increase the size.
        if (node.contents && node.contents.subarray && newCapacity > node.contents.length) {
          node.contents = MEMFS.getFileDataAsRegularArray(node);
          node.usedBytes = node.contents.length; // We might be writing to a lazy-loaded file which had overridden this property, so force-reset it.
        }
  
        if (!node.contents || node.contents.subarray) { // Keep using a typed array if creating a new storage, or if old one was a typed array as well.
          var prevCapacity = node.contents ? node.contents.buffer.byteLength : 0;
          if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
          // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
          // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
          // avoid overshooting the allocation cap by a very large margin.
          var CAPACITY_DOUBLING_MAX = 1024 * 1024;
          newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) | 0);
          if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
          var oldContents = node.contents;
          node.contents = new Uint8Array(newCapacity); // Allocate new storage.
          if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
          return;
        }
        // Not using a typed array to back the file storage. Use a standard JS array instead.
        if (!node.contents && newCapacity > 0) node.contents = [];
        while (node.contents.length < newCapacity) node.contents.push(0);
      },resizeFileStorage:function (node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
          return;
        }
        if (!node.contents || node.contents.subarray) { // Resize a typed array if that is being used as the backing store.
          var oldContents = node.contents;
          node.contents = new Uint8Array(new ArrayBuffer(newSize)); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
          return;
        }
        // Backing with a JS array.
        if (!node.contents) node.contents = [];
        if (node.contents.length > newSize) node.contents.length = newSize;
        else while (node.contents.length < newSize) node.contents.push(0);
        node.usedBytes = newSize;
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          if (!length) return 0;
          var node = stream.node;
          node.timestamp = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) { // Can we just reuse the buffer we are given?
              assert(position === 0, 'canOwn must imply no weird position inside the file');
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); // Use typed array write if available.
          else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position+length);
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.expandFileStorage(stream.node, offset + length);
          stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < stream.node.usedBytes) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        },msync:function (stream, buffer, offset, length, mmapFlags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          if (mmapFlags & 2) {
            // MAP_PRIVATE calls need not to be synced back to underlying fs
            return 0;
          }
  
          var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        if (typeof indexedDB !== 'undefined') return indexedDB;
        var ret = null;
        if (typeof window === 'object') ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        assert(ret, 'IDBFS used, but indexedDB not supported');
        return ret;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          if (!fileStore.indexNames.contains('timestamp')) {
            fileStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function(e) {
            callback(this.error);
            e.preventDefault();
          };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          // Performance consideration: storing a normal JavaScript array to a IndexedDB is much slower than storing a typed array.
          // Therefore always convert the file contents to a typed array first before writing the data to IndexedDB.
          node.contents = MEMFS.getFileDataAsTypedArray(node);
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.chmod(path, entry.mode);
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function(e) {
          callback(this.error);
          e.preventDefault();
        };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function(e) {
          done(this.error);
          e.preventDefault();
        };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        flags &= ~0100000 /*O_LARGEFILE*/; // Ignore this flag from musl, otherwise node.js fails to open the file.
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            path = fs.readlinkSync(path);
            path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
            return path;
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          if (length === 0) return 0; // node errors on 0 length reads
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          return position;
        }}};
  
  var WORKERFS={DIR_MODE:16895,FILE_MODE:33279,reader:null,mount:function (mount) {
        assert(ENVIRONMENT_IS_WORKER);
        if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
        var root = WORKERFS.createNode(null, '/', WORKERFS.DIR_MODE, 0);
        var createdParents = {};
        function ensureParent(path) {
          // return the parent node, creating subdirs as necessary
          var parts = path.split('/');
          var parent = root;
          for (var i = 0; i < parts.length-1; i++) {
            var curr = parts.slice(0, i+1).join('/');
            if (!createdParents[curr]) {
              createdParents[curr] = WORKERFS.createNode(parent, curr, WORKERFS.DIR_MODE, 0);
            }
            parent = createdParents[curr];
          }
          return parent;
        }
        function base(path) {
          var parts = path.split('/');
          return parts[parts.length-1];
        }
        // We also accept FileList here, by using Array.prototype
        Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
          WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
        });
        (mount.opts["blobs"] || []).forEach(function(obj) {
          WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
        });
        (mount.opts["packages"] || []).forEach(function(pack) {
          pack['metadata'].files.forEach(function(file) {
            var name = file.filename.substr(1); // remove initial slash
            WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack['blob'].slice(file.start, file.end));
          });
        });
        return root;
      },createNode:function (parent, name, mode, dev, contents, mtime) {
        var node = FS.createNode(parent, name, mode);
        node.mode = mode;
        node.node_ops = WORKERFS.node_ops;
        node.stream_ops = WORKERFS.stream_ops;
        node.timestamp = (mtime || new Date).getTime();
        assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
        if (mode === WORKERFS.FILE_MODE) {
          node.size = contents.size;
          node.contents = contents;
        } else {
          node.size = 4096;
          node.contents = {};
        }
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },node_ops:{getattr:function (node) {
          return {
            dev: 1,
            ino: undefined,
            mode: node.mode,
            nlink: 1,
            uid: 0,
            gid: 0,
            rdev: undefined,
            size: node.size,
            atime: new Date(node.timestamp),
            mtime: new Date(node.timestamp),
            ctime: new Date(node.timestamp),
            blksize: 4096,
            blocks: Math.ceil(node.size / 4096),
          };
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
        },lookup:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        },mknod:function (parent, name, mode, dev) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },rename:function (oldNode, newDir, newName) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },unlink:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },rmdir:function (parent, name) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },readdir:function (node) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },symlink:function (parent, newName, oldPath) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        },readlink:function (node) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          if (position >= stream.node.size) return 0;
          var chunk = stream.node.contents.slice(position, position + length);
          var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
          buffer.set(new Uint8Array(ab), offset);
          return chunk.size;
        },write:function (stream, buffer, offset, length, position) {
          throw new FS.ErrnoError(ERRNO_CODES.EIO);
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.size;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},filesystems:null,handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        if (!path) return { path: '', node: null };
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
  
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); }
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); }
            }
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        var err = FS.nodePermissions(dir, 'x');
        if (err) return err;
        if (!dir.node_ops.lookup) return ERRNO_CODES.EACCES;
        return 0;
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === '.' || name === '..') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        if (!PATH.resolve(oldpath)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        if (!old_dir || !new_dir) throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        if (path === "") {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var err = FS.mayOpen(node, flags);
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },msync:function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },munmap:function (stream) {
        return 0;
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var buf = new Uint8Array(lengthBytesUTF8(data)+1);
          var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
          FS.write(stream, buf, 0, actualNumBytes, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function(stream, buffer, offset, length, pos) { return length; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        var random_device;
        if (typeof crypto !== 'undefined') {
          // for modern web browsers
          var randomBuffer = new Uint8Array(1);
          random_device = function() { crypto.getRandomValues(randomBuffer); return randomBuffer[0]; };
        } else if (ENVIRONMENT_IS_NODE) {
          // for nodejs
          random_device = function() { return require('crypto').randomBytes(1)[0]; };
        } else {
          // default for ES5 platforms
          random_device = function() { return (Math.random()*256)|0; };
        }
        FS.createDevice('/dev', 'random', random_device);
        FS.createDevice('/dev', 'urandom', random_device);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createSpecialDirectories:function () {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount: function() {
            var node = FS.createNode('/proc/self', 'fd', 16384 | 0777, 73);
            node.node_ops = {
              lookup: function(parent, name) {
                var fd = +name;
                var stream = FS.getStream(fd);
                if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: function() { return stream.path } }
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno, node) {
          //Module.printErr(stackTrace()); // useful for debugging
          this.node = node;
          this.setErrno = function(errno) {
            this.errno = errno;
            for (var key in ERRNO_CODES) {
              if (ERRNO_CODES[key] === errno) {
                this.code = key;
                break;
              }
            }
          };
          this.setErrno(errno);
          this.message = ERRNO_MESSAGES[errno];
          if (this.stack) this.stack = demangleAll(this.stack);
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
          'IDBFS': IDBFS,
          'NODEFS': NODEFS,
          'WORKERFS': WORKERFS,
        };
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        var fflush = Module['_fflush'];
        if (fflush) fflush(0);
        // close all of our streams
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = (idx / this.chunkSize)|0;
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
          // Find length
          var xhr = new XMLHttpRequest();
          xhr.open('HEAD', url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var chunkSize = 1024*1024; // Chunk size in bytes
  
          if (!hasByteServing) chunkSize = datalength;
  
          // Function to get a range from the remote URL.
          var doXHR = (function(from, to) {
            if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
            // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
            // Some hints to the browser that we want binary data.
            if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType('text/plain; charset=x-user-defined');
            }
  
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            } else {
              return intArrayFromString(xhr.responseText || '', true);
            }
          });
          var lazyArray = this;
          lazyArray.setDataGetter(function(chunkNum) {
            var start = chunkNum * chunkSize;
            var end = (chunkNum+1) * chunkSize - 1; // including this byte
            end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
  
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperty(node, "usedBytes", {
            get: function() { return this.contents.length; }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency('cp ' + fullname); // might have several active requests for the same fullname
        function processData(byteArray) {
          function finish(byteArray) {
            if (preFinish) preFinish();
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency(dep);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency(dep);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};var SYSCALLS={DEFAULT_POLLMASK:5,mappings:{},umask:511,calculateAt:function (dirfd, path) {
        if (path[0] !== '/') {
          // relative path
          var dir;
          if (dirfd === -100) {
            dir = FS.cwd();
          } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
            dir = dirstream.path;
          }
          path = PATH.join2(dir, path);
        }
        return path;
      },doStat:function (func, path, buf) {
        try {
          var stat = func(path);
        } catch (e) {
          if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
            // an error occurred while trying to look up the path; we should just report ENOTDIR
            return -ERRNO_CODES.ENOTDIR;
          }
          throw e;
        }
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode;
        HEAP32[(((buf)+(16))>>2)]=stat.nlink;
        HEAP32[(((buf)+(20))>>2)]=stat.uid;
        HEAP32[(((buf)+(24))>>2)]=stat.gid;
        HEAP32[(((buf)+(28))>>2)]=stat.rdev;
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size;
        HEAP32[(((buf)+(40))>>2)]=4096;
        HEAP32[(((buf)+(44))>>2)]=stat.blocks;
        HEAP32[(((buf)+(48))>>2)]=(stat.atime.getTime() / 1000)|0;
        HEAP32[(((buf)+(52))>>2)]=0;
        HEAP32[(((buf)+(56))>>2)]=(stat.mtime.getTime() / 1000)|0;
        HEAP32[(((buf)+(60))>>2)]=0;
        HEAP32[(((buf)+(64))>>2)]=(stat.ctime.getTime() / 1000)|0;
        HEAP32[(((buf)+(68))>>2)]=0;
        HEAP32[(((buf)+(72))>>2)]=stat.ino;
        return 0;
      },doMsync:function (addr, stream, len, flags) {
        var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
        FS.msync(stream, buffer, 0, len, flags);
      },doMkdir:function (path, mode) {
        // remove a trailing slash, if one - /a/b/ has basename of '', but
        // we want to create b in the context of this function
        path = PATH.normalize(path);
        if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
        FS.mkdir(path, mode, 0);
        return 0;
      },doMknod:function (path, mode, dev) {
        // we don't want this in the JS API as it uses mknod to create all nodes.
        switch (mode & 61440) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default: return -ERRNO_CODES.EINVAL;
        }
        FS.mknod(path, mode, dev);
        return 0;
      },doReadlink:function (path, buf, bufsize) {
        if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
        var ret = FS.readlink(path);
        ret = ret.slice(0, Math.max(0, bufsize));
        writeStringToMemory(ret, buf, true);
        return ret.length;
      },doAccess:function (path, amode) {
        if (amode & ~7) {
          // need a valid mode
          return -ERRNO_CODES.EINVAL;
        }
        var node;
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
        var perms = '';
        if (amode & 4) perms += 'r';
        if (amode & 2) perms += 'w';
        if (amode & 1) perms += 'x';
        if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
          return -ERRNO_CODES.EACCES;
        }
        return 0;
      },doDup:function (path, flags, suggestFD) {
        var suggest = FS.getStream(suggestFD);
        if (suggest) FS.close(suggest);
        return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
      },doReadv:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.read(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
          if (curr < len) break; // nothing more to read
        }
        return ret;
      },doWritev:function (stream, iov, iovcnt, offset) {
        var ret = 0;
        for (var i = 0; i < iovcnt; i++) {
          var ptr = HEAP32[(((iov)+(i*8))>>2)];
          var len = HEAP32[(((iov)+(i*8 + 4))>>2)];
          var curr = FS.write(stream, HEAP8,ptr, len, offset);
          if (curr < 0) return -1;
          ret += curr;
        }
        return ret;
      },varargs:0,get:function (varargs) {
        SYSCALLS.varargs += 4;
        var ret = HEAP32[(((SYSCALLS.varargs)-(4))>>2)];
        return ret;
      },getStr:function () {
        var ret = Pointer_stringify(SYSCALLS.get());
        return ret;
      },getStreamFromFD:function () {
        var stream = FS.getStream(SYSCALLS.get());
        if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return stream;
      },getSocketFromFD:function () {
        var socket = SOCKFS.getSocket(SYSCALLS.get());
        if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        return socket;
      },getSocketAddress:function (allowNull) {
        var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
        if (allowNull && addrp === 0) return null;
        var info = __read_sockaddr(addrp, addrlen);
        if (info.errno) throw new FS.ErrnoError(info.errno);
        info.addr = DNS.lookup_addr(info.addr) || info.addr;
        return info;
      },get64:function () {
        var low = SYSCALLS.get(), high = SYSCALLS.get();
        if (low >= 0) assert(high === 0);
        else assert(high === -1);
        return low;
      },getZero:function () {
        assert(SYSCALLS.get() === 0);
      }};function ___syscall54(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // ioctl
      var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
      switch (op) {
        case 21505: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return 0;
        }
        case 21506: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          var argp = SYSCALLS.get();
          HEAP32[((argp)>>2)]=0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -ERRNO_CODES.ENOTTY;
          return -ERRNO_CODES.EINVAL; // not supported
        }
        case 21531: {
          var argp = SYSCALLS.get();
          return FS.ioctl(stream, op, argp);
        }
        default: abort('bad ioctl syscall ' + op);
      }
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_glSampleCoverage(x0, x1) { GLctx.sampleCoverage(x0, x1) }

  function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        if (!texture) continue; // GL spec: "glDeleteTextures silently ignores 0s and names that do not correspond to existing textures".
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }

  function _emscripten_glFrustum() {
  Module['printErr']('missing function: emscripten_glFrustum'); abort(-1);
  }

  function _glfwSetWindowSizeCallback(winid, cbfun) {
      GLFW.setWindowSizeCallback(winid, cbfun);
    }

  function _emscripten_glGetTexParameterfv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAPF32[((params)>>2)]=GLctx.getTexParameter(target, pname);
    }

  function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      GLctx.uniform4i(location, v0, v1, v2, v3);
    }

  function _emscripten_glBindRenderbuffer(target, renderbuffer) {
      GLctx.bindRenderbuffer(target, renderbuffer ? GL.renderbuffers[renderbuffer] : null);
    }

  function _emscripten_glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { GLctx.copyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }

  function _emscripten_glTexParameterfv(target, pname, params) {
      var param = HEAPF32[((params)>>2)];
      GLctx.texParameterf(target, pname, param);
    }

  function _emscripten_glLinkProgram(program) {
      GLctx.linkProgram(GL.programs[program]);
      GL.programInfos[program] = null; // uniforms no longer keep the same names after linking
      GL.populateUniformTable(program);
    }

  function _emscripten_glUniform3f(location, v0, v1, v2) {
      location = GL.uniforms[location];
      GLctx.uniform3f(location, v0, v1, v2);
    }

  function _emscripten_glGetObjectParameterivARB() {
  Module['printErr']('missing function: emscripten_glGetObjectParameterivARB'); abort(-1);
  }

  function _emscripten_glBlendFunc(x0, x1) { GLctx.blendFunc(x0, x1) }

  function _emscripten_glUniform3i(location, v0, v1, v2) {
      location = GL.uniforms[location];
      GLctx.uniform3i(location, v0, v1, v2);
    }

  function _emscripten_glStencilOp(x0, x1, x2) { GLctx.stencilOp(x0, x1, x2) }

  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }

  function _glUniform1i(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1i(location, v0);
    }

  function _emscripten_glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      GLctx.bindAttribLocation(GL.programs[program], index, name);
    }

  var _cosf=Math_cos;

  function _glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
      var heapView;
      if (data) {
        heapView = HEAPU8.subarray((data),(data+imageSize));
      } else {
        heapView = null;
      }
      GLctx['compressedTexImage2D'](target, level, internalFormat, width, height, border, heapView);
    }

  function _emscripten_glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }

   
  Module["_memset"] = _memset;

  var _BDtoILow=true;

  function _glfwMakeContextCurrent(winid) {}

  function _glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }

  function ___lock() {}

  function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) { GLctx.blendFuncSeparate(x0, x1, x2, x3) }

  function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
      if (!pointer) {
        // GLES2 specification does not specify how to behave if pointer is a null pointer. Since calling this function does not make sense
        // if pointer == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((pointer)>>2)]=GLctx.getVertexAttribOffset(index, pname);
    }

  function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) { GLctx.vertexAttrib3f(x0, x1, x2, x3) }

  function _emscripten_glEnable(x0) { GLctx.enable(x0) }

  function _emscripten_glNormalPointer() {
  Module['printErr']('missing function: emscripten_glNormalPointer'); abort(-1);
  }

  
  var _emscripten_GetProcAddress=undefined;
  Module["_emscripten_GetProcAddress"] = _emscripten_GetProcAddress;
  
  
  function _eglWaitClient() {
      EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
      return 1;
    }var EGL={errorCode:12288,defaultDisplayInitialized:false,currentContext:0,currentReadSurface:0,currentDrawSurface:0,stringCache:{},setErrorCode:function (code) {
        EGL.errorCode = code;
      },chooseConfig:function (display, attribList, config, config_size, numConfigs) { 
        if (display != 62000 /* Magic ID for Emscripten 'default display' */) {
          EGL.setErrorCode(0x3008 /* EGL_BAD_DISPLAY */);
          return 0;
        }
        // TODO: read attribList.
        if ((!config || !config_size) && !numConfigs) {
          EGL.setErrorCode(0x300C /* EGL_BAD_PARAMETER */);
          return 0;
        }
        if (numConfigs) {
          HEAP32[((numConfigs)>>2)]=1; // Total number of supported configs: 1.
        }
        if (config && config_size > 0) {
          HEAP32[((config)>>2)]=62002; 
        }
        
        EGL.setErrorCode(0x3000 /* EGL_SUCCESS */);
        return 1;
      }};function _eglGetProcAddress(name_) {
      return _emscripten_GetProcAddress(name_);
    }

  function _glDeleteProgram(id) {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) { // glDeleteProgram actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
      GL.programInfos[id] = null;
    }

  
  
  function _emscripten_set_main_loop_timing(mode, value) {
      Browser.mainLoop.timingMode = mode;
      Browser.mainLoop.timingValue = value;
  
      if (!Browser.mainLoop.func) {
        console.error('emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.');
        return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
      }
  
      if (mode == 0 /*EM_TIMING_SETTIMEOUT*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
          setTimeout(Browser.mainLoop.runner, value); // doing this each time means that on exception, we stop
        };
        Browser.mainLoop.method = 'timeout';
      } else if (mode == 1 /*EM_TIMING_RAF*/) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
          Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'rAF';
      } else if (mode == 2 /*EM_TIMING_SETIMMEDIATE*/) {
        if (!window['setImmediate']) {
          // Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
          var setImmediates = [];
          var emscriptenMainLoopMessageId = '__emcc';
          function Browser_setImmediate_messageHandler(event) {
            if (event.source === window && event.data === emscriptenMainLoopMessageId) {
              event.stopPropagation();
              setImmediates.shift()();
            }
          }
          window.addEventListener("message", Browser_setImmediate_messageHandler, true);
          window['setImmediate'] = function Browser_emulated_setImmediate(func) {
            setImmediates.push(func);
            window.postMessage(emscriptenMainLoopMessageId, "*");
          }
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
          window['setImmediate'](Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = 'immediate';
      }
      return 0;
    }function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
      Module['noExitRuntime'] = true;
  
      assert(!Browser.mainLoop.func, 'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.');
  
      Browser.mainLoop.func = func;
      Browser.mainLoop.arg = arg;
  
      var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
  
      Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) return;
        if (Browser.mainLoop.queue.length > 0) {
          var start = Date.now();
          var blocker = Browser.mainLoop.queue.shift();
          blocker.func(blocker.arg);
          if (Browser.mainLoop.remainingBlockers) {
            var remaining = Browser.mainLoop.remainingBlockers;
            var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
            if (blocker.counted) {
              Browser.mainLoop.remainingBlockers = next;
            } else {
              // not counted, but move the progress along a tiny bit
              next = next + 0.5; // do not steal all the next one's progress
              Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
            }
          }
          console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + ' ms'); //, left: ' + Browser.mainLoop.remainingBlockers);
          Browser.mainLoop.updateStatus();
          setTimeout(Browser.mainLoop.runner, 0);
          return;
        }
  
        // catch pauses from non-main loop sources
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Implement very basic swap interval control
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1/*EM_TIMING_RAF*/ && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
          // Not the scheduled time to render this frame - skip.
          Browser.mainLoop.scheduler();
          return;
        }
  
        // Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
        // VBO double-buffering and reduce GPU stalls.
  
        if (Browser.mainLoop.method === 'timeout' && Module.ctx) {
          Module.printErr('Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!');
          Browser.mainLoop.method = ''; // just warn once per call to set main loop
        }
  
        Browser.mainLoop.runIter(function() {
          if (typeof arg !== 'undefined') {
            Runtime.dynCall('vi', func, [arg]);
          } else {
            Runtime.dynCall('v', func);
          }
        });
  
        // catch pauses from the main loop itself
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  
        // Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
        // to queue the newest produced audio samples.
        // TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
        //       do not need to be hardcoded into this function, but can be more generic.
        if (typeof SDL === 'object' && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  
        Browser.mainLoop.scheduler();
      }
  
      if (!noSetTiming) {
        if (fps && fps > 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 1000.0 / fps);
        else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, 1); // Do rAF by rendering each frame (no decimating)
  
        Browser.mainLoop.scheduler();
      }
  
      if (simulateInfiniteLoop) {
        throw 'SimulateInfiniteLoop';
      }
    }var Browser={mainLoop:{scheduler:null,method:"",currentlyRunningMainloop:0,func:null,arg:0,timingMode:0,timingValue:0,currentFrameNumber:0,queue:[],pause:function () {
          Browser.mainLoop.scheduler = null;
          Browser.mainLoop.currentlyRunningMainloop++; // Incrementing this signals the previous main loop that it's now become old, and it must return.
        },resume:function () {
          Browser.mainLoop.currentlyRunningMainloop++;
          var timingMode = Browser.mainLoop.timingMode;
          var timingValue = Browser.mainLoop.timingValue;
          var func = Browser.mainLoop.func;
          Browser.mainLoop.func = null;
          _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true /* do not set timing and call scheduler, we will do it on the next lines */);
          _emscripten_set_main_loop_timing(timingMode, timingValue);
          Browser.mainLoop.scheduler();
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        },runIter:function (func) {
          if (ABORT) return;
          if (Module['preMainLoop']) {
            var preRet = Module['preMainLoop']();
            if (preRet === false) {
              return; // |return false| skips a frame
            }
          }
          try {
            func();
          } catch (e) {
            if (e instanceof ExitStatus) {
              return;
            } else {
              if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
              throw e;
            }
          }
          if (Module['postMainLoop']) Module['postMainLoop']();
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          assert(typeof url == 'string', 'createObjectURL must return a url as a string');
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            assert(typeof url == 'string', 'createObjectURL must return a url as a string');
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          contextHandle = GL.createContext(canvas, contextAttributes);
          if (contextHandle) {
            ctx = GL.getContext(contextHandle).GLctx;
          }
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          if (!useWebGL) assert(typeof GLctx === 'undefined', 'cannot set in module if GLctx is used, but we are a non-GL context that would replace it');
  
          Module.ctx = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas, vrDevice) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        Browser.vrDevice = vrDevice;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        if (typeof Browser.vrDevice === 'undefined') Browser.vrDevice = null;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
  
        if (vrDevice) {
          canvasContainer.requestFullScreen({ vrDisplay: vrDevice });
        } else {
          canvasContainer.requestFullScreen();
        }
      },nextRAF:0,fakeRequestAnimationFrame:function (func) {
        // try to keep 60fps between calls to here
        var now = Date.now();
        if (Browser.nextRAF === 0) {
          Browser.nextRAF = now + 1000/60;
        } else {
          while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
            Browser.nextRAF += 1000/60;
          }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          Browser.fakeRequestAnimationFrame(func);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           Browser.fakeRequestAnimationFrame;
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },allowAsyncCallbacks:true,queuedAsyncCallbacks:[],pauseAsyncCallbacks:function () {
        Browser.allowAsyncCallbacks = false;
      },resumeAsyncCallbacks:function () { // marks future callbacks as ok to execute, and synchronously runs any remaining ones right now
        Browser.allowAsyncCallbacks = true;
        if (Browser.queuedAsyncCallbacks.length > 0) {
          var callbacks = Browser.queuedAsyncCallbacks;
          Browser.queuedAsyncCallbacks = [];
          callbacks.forEach(function(func) {
            func();
          });
        }
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } else {
            Browser.queuedAsyncCallbacks.push(func);
          }
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (ABORT) return;
          if (Browser.allowAsyncCallbacks) {
            func();
          } // drop it on the floor otherwise, next interval will kick in
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll': 
            delta = event.detail;
            break;
          case 'mousewheel': 
            delta = event.wheelDelta;
            break;
          case 'wheel': 
            delta = event['deltaY'];
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          // If this assert lands, it's likely because the browser doesn't support scrollX or pageXOffset
          // and we have no viable fallback.
          assert((typeof scrollX !== 'undefined') && (typeof scrollY !== 'undefined'), 'Unable to retrieve scroll position, mouse positions likely broken.');
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              if (!last) last = coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },wgetRequests:{},nextWgetRequestHandle:0,getNextWgetRequestHandle:function () {
        var handle = Browser.nextWgetRequestHandle;
        Browser.nextWgetRequestHandle++;
        return handle;
      }};

  function _glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _glfwGetPrimaryMonitor() {
      return 1;
    }

  
  function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var data = GLctx.getVertexAttrib(index, pname);
      if (typeof data == 'number' || typeof data == 'boolean') {
        switch (type) {
          case 'Integer': HEAP32[((params)>>2)]=data; break;
          case 'Float': HEAPF32[((params)>>2)]=data; break;
          case 'FloatToInteger': HEAP32[((params)>>2)]=Math.fround(data); break;
          default: throw 'internal emscriptenWebGLGetVertexAttrib() error, bad type: ' + type;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 'Integer': HEAP32[(((params)+(i))>>2)]=data[i]; break;
            case 'Float': HEAPF32[(((params)+(i))>>2)]=data[i]; break;
            case 'FloatToInteger': HEAP32[(((params)+(i))>>2)]=Math.fround(data[i]); break;
            default: throw 'internal emscriptenWebGLGetVertexAttrib() error, bad type: ' + type;
          }
        }
      }
    }function _emscripten_glGetVertexAttribfv(index, pname, params) {
      // N.B. This function may only be called if the vertex attribute was specified using the function glVertexAttrib*f(),
      // otherwise the results are undefined. (GLES3 spec 6.1.12)
      emscriptenWebGLGetVertexAttrib(index, pname, params, 'Float');
    }

  function _emscripten_glDeleteShader(id) {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) { // glDeleteShader actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }

  function _emscripten_glVertexPointer(){ throw 'Legacy GL function (glVertexPointer) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  function _emscripten_glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        var buffer = GL.buffers[id];
  
        // From spec: "glDeleteBuffers silently ignores 0's and names that do not
        // correspond to existing buffer objects."
        if (!buffer) continue;
  
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
  
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }

  function _emscripten_glTexParameteriv(target, pname, params) {
      var param = HEAP32[((params)>>2)];
      GLctx.texParameteri(target, pname, param);
    }

  function _glDrawElements(mode, count, type, indices) {
  
      GLctx.drawElements(mode, count, type, indices);
  
    }

  var _sinf=Math_sin;

  function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[3];
        for (var i = 0; i < 4; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      GLctx.uniformMatrix2fv(location, transpose, view);
    }

  function ___syscall6(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // close
      var stream = SYSCALLS.getStreamFromFD();
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());
      return self.LLVM_SAVEDSTACKS.length-1;
    }

  function _emscripten_glGetVertexAttribiv(index, pname, params) {
      // N.B. This function may only be called if the vertex attribute was specified using the function glVertexAttrib*f(),
      // otherwise the results are undefined. (GLES3 spec 6.1.12)
      emscriptenWebGLGetVertexAttrib(index, pname, params, 'FloatToInteger');
    }

  function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      GLctx.uniformMatrix4fv(location, transpose, view);
    }

  function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
      GLctx['drawArraysInstanced'](mode, first, count, primcount);
    }

  function _emscripten_glEnableClientState() {
  Module['printErr']('missing function: emscripten_glEnableClientState'); abort(-1);
  }

  function _emscripten_glGetPointerv() {
  Module['printErr']('missing function: emscripten_glGetPointerv'); abort(-1);
  }

  function ___syscall140(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // llseek
      var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
      var offset = offset_low;
      assert(offset_high === 0);
      FS.llseek(stream, offset, whence);
      HEAP32[((result)>>2)]=stream.position;
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function ___syscall146(which, varargs) {SYSCALLS.varargs = varargs;
  try {
   // writev
      var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
      return SYSCALLS.doWritev(stream, iov, iovcnt);
    } catch (e) {
    if (typeof FS === 'undefined' || !(e instanceof FS.ErrnoError)) abort(e);
    return -e.errno;
  }
  }

  function _emscripten_glUniform1i(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1i(location, v0);
    }

  function _emscripten_glStencilMask(x0) { GLctx.stencilMask(x0) }

  function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) { GLctx.stencilFuncSeparate(x0, x1, x2, x3) }

   
  Module["_i64Subtract"] = _i64Subtract;

   
  Module["_i64Add"] = _i64Add;

  function _glUseProgram(program) {
      GLctx.useProgram(program ? GL.programs[program] : null);
    }

  function _glfwTerminate() {
      window.removeEventListener("keydown", GLFW.onKeydown, true);
      window.removeEventListener("keypress", GLFW.onKeyPress, true);
      window.removeEventListener("keyup", GLFW.onKeyup, true);
      Module["canvas"].removeEventListener("mousemove", GLFW.onMousemove, true);
      Module["canvas"].removeEventListener("mousedown", GLFW.onMouseButtonDown, true);
      Module["canvas"].removeEventListener("mouseup", GLFW.onMouseButtonUp, true);
      Module["canvas"].removeEventListener('wheel', GLFW.onMouseWheel, true);
      Module["canvas"].removeEventListener('mousewheel', GLFW.onMouseWheel, true);
      Module["canvas"].width = Module["canvas"].height = 1;
      GLFW.windows = null;
      GLFW.active = null;
    }

  function _emscripten_glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }

  function _emscripten_glVertexAttrib1f(x0, x1) { GLctx.vertexAttrib1f(x0, x1) }

  function _emscripten_glFinish() { GLctx.finish() }

  function _glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue; // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }

  function _glDrawArrays(mode, first, count) {
  
      GLctx.drawArrays(mode, first, count);
  
    }

  function _emscripten_glDepthFunc(x0) { GLctx.depthFunc(x0) }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 85: return totalMemory / PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 79:
          return 0;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: {
          if (typeof navigator === 'object') return navigator['hardwareConcurrency'] || 1;
          return 1;
        }
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  function _emscripten_glUniform4iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 4;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform4iv(location, value);
    }

  function _glClear(x0) { GLctx.clear(x0) }

  function _emscripten_glLoadIdentity(){ throw 'Legacy GL function (glLoadIdentity) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  function _emscripten_glUniform3fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[2];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*12)>>2);
      }
      GLctx.uniform3fv(location, view);
    }

  function _emscripten_glIsTexture(texture) {
      var texture = GL.textures[texture];
      if (!texture) return 0;
      return GLctx.isTexture(texture);
    }

  function _glEnableVertexAttribArray(index) {
      GLctx.enableVertexAttribArray(index);
    }

  function _emscripten_glAttachShader(program, shader) {
      GLctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _glfwCreateWindow(width, height, title, monitor, share) {
      return GLFW.createWindow(width, height, title, monitor, share);
    }

  function _glfwDefaultWindowHints() {
      GLFW.hints = GLFW.defaultHints;
    }

  function _pthread_cleanup_pop() {
      assert(_pthread_cleanup_push.level == __ATEXIT__.length, 'cannot pop if something else added meanwhile!');
      __ATEXIT__.pop();
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  function _emscripten_glClearStencil(x0) { GLctx.clearStencil(x0) }

  function _emscripten_glDetachShader(program, shader) {
      GLctx.detachShader(GL.programs[program],
                              GL.shaders[shader]);
    }

  function _emscripten_glDeleteVertexArrays(n, vaos) {
      for(var i = 0; i < n; i++) {
        var id = HEAP32[(((vaos)+(i*4))>>2)];
        GLctx['deleteVertexArray'](GL.vaos[id]);
        GL.vaos[id] = null;
      }
    }

  function _glfwInit() {
      if (GLFW.windows) return 1; // GL_TRUE
  
      GLFW.initialTime = GLFW.getTime();
      GLFW.hints = GLFW.defaultHints;
      GLFW.windows = new Array()
      GLFW.active = null;
  
      window.addEventListener("keydown", GLFW.onKeydown, true);
      window.addEventListener("keypress", GLFW.onKeyPress, true);
      window.addEventListener("keyup", GLFW.onKeyup, true);
      Module["canvas"].addEventListener("mousemove", GLFW.onMousemove, true);
      Module["canvas"].addEventListener("mousedown", GLFW.onMouseButtonDown, true);
      Module["canvas"].addEventListener("mouseup", GLFW.onMouseButtonUp, true);
      Module["canvas"].addEventListener('wheel', GLFW.onMouseWheel, true);
      Module["canvas"].addEventListener('mousewheel', GLFW.onMouseWheel, true);
  
      Browser.resizeListeners.push(function(width, height) {
         GLFW.onFullScreenEventChange();
      });
      return 1; // GL_TRUE
    }

  function _emscripten_glGetTexParameteriv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((params)>>2)]=GLctx.getTexParameter(target, pname);
    }

  function _glfwSwapBuffers(winid) {
      GLFW.swapBuffers(winid);
    }

  function _emscripten_glGenerateMipmap(x0) { GLctx.generateMipmap(x0) }

  function _emscripten_glCullFace(x0) { GLctx.cullFace(x0) }

  function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
      location = GL.uniforms[location];
      GLctx.uniform4f(location, v0, v1, v2, v3);
    }

  function _glDisableVertexAttribArray(index) {
      GLctx.disableVertexAttribArray(index);
    }

  function _emscripten_glUseProgram(program) {
      GLctx.useProgram(program ? GL.programs[program] : null);
    }

  function _emscripten_glHint(x0, x1) { GLctx.hint(x0, x1) }

  function _emscripten_glUniform2fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[1];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*8)>>2);
      }
      GLctx.uniform2fv(location, view);
    }

  function _glfwSwapInterval(interval) {
      interval = Math.abs(interval); // GLFW uses negative values to enable GLX_EXT_swap_control_tear, which we don't have, so just treat negative and positive the same.
      if (interval == 0) _emscripten_set_main_loop_timing(0/*EM_TIMING_SETTIMEOUT*/, 0);
      else _emscripten_set_main_loop_timing(1/*EM_TIMING_RAF*/, interval);
    }

  function _glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = '(unknown error)';
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glMatrixMode(){ throw 'Legacy GL function (glMatrixMode) called. If you want legacy GL emulation, you need to compile with -s LEGACY_GL_EMULATION=1 to enable legacy GL emulation.'; }

  function _abort() {
      Module['abort']();
    }

  function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
      GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget,
                                         GL.renderbuffers[renderbuffer]);
    }

  function _emscripten_glDeleteFramebuffers(n, framebuffers) {
      for (var i = 0; i < n; ++i) {
        var id = HEAP32[(((framebuffers)+(i*4))>>2)];
        var framebuffer = GL.framebuffers[id];
        if (!framebuffer) continue; // GL spec: "glDeleteFramebuffers silently ignores 0s and names that do not correspond to existing framebuffer objects".
        GLctx.deleteFramebuffer(framebuffer);
        framebuffer.name = 0;
        GL.framebuffers[id] = null;
      }
    }

  function _emscripten_glIsBuffer(buffer) {
      var b = GL.buffers[buffer];
      if (!b) return 0;
      return GLctx.isBuffer(b);
    }

  function _emscripten_glUniform2iv(location, count, value) {
      location = GL.uniforms[location];
      count *= 2;
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform2iv(location, value);
    }

  function _emscripten_glVertexAttrib1fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+4)>>2);
      GLctx.vertexAttrib1fv(index, v);
    }

  function _glEnable(x0) { GLctx.enable(x0) }

  
  
  function emscriptenWebGLComputeImageSize(width, height, sizePerPixel, alignment) {
      function roundedToNextMultipleOf(x, y) {
        return Math.floor((x + y - 1) / y) * y
      }
      var plainRowSize = width * sizePerPixel;
      var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
      return (height <= 0) ? 0 :
               ((height - 1) * alignedRowSize + plainRowSize);
    }function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
      var sizePerPixel;
      var numChannels;
      switch(format) {
        case 0x1906 /* GL_ALPHA */:
        case 0x1909 /* GL_LUMINANCE */:
        case 0x1902 /* GL_DEPTH_COMPONENT */:
        case 0x1903 /* GL_RED */:
          numChannels = 1;
          break;
        case 0x190A /* GL_LUMINANCE_ALPHA */:
        case 0x8227 /* GL_RG */:
          numChannels = 2;
          break;
        case 0x1907 /* GL_RGB */:
        case 0x8C40 /* GL_SRGB_EXT */:
          numChannels = 3;
          break;
        case 0x1908 /* GL_RGBA */:
        case 0x8C42 /* GL_SRGB_ALPHA_EXT */:
          numChannels = 4;
          break;
        default:
          GL.recordError(0x0500); // GL_INVALID_ENUM
          return {
            pixels: null,
            internalFormat: 0x0
          };
      }
      switch (type) {
        case 0x1401 /* GL_UNSIGNED_BYTE */:
          sizePerPixel = numChannels*1;
          break;
        case 0x1403 /* GL_UNSIGNED_SHORT */:
        case 0x8D61 /* GL_HALF_FLOAT_OES */:
          sizePerPixel = numChannels*2;
          break;
        case 0x1405 /* GL_UNSIGNED_INT */:
        case 0x1406 /* GL_FLOAT */:
          sizePerPixel = numChannels*4;
          break;
        case 0x84FA /* UNSIGNED_INT_24_8_WEBGL/UNSIGNED_INT_24_8 */:
          sizePerPixel = 4;
          break;
        case 0x8363 /* GL_UNSIGNED_SHORT_5_6_5 */:
        case 0x8033 /* GL_UNSIGNED_SHORT_4_4_4_4 */:
        case 0x8034 /* GL_UNSIGNED_SHORT_5_5_5_1 */:
          sizePerPixel = 2;
          break;
        default:
          GL.recordError(0x0500); // GL_INVALID_ENUM
          return {
            pixels: null,
            internalFormat: 0x0
          };
      }
      var bytes = emscriptenWebGLComputeImageSize(width, height, sizePerPixel, GL.unpackAlignment);
      if (type == 0x1401 /* GL_UNSIGNED_BYTE */) {
        pixels = HEAPU8.subarray((pixels),(pixels+bytes));
      } else if (type == 0x1406 /* GL_FLOAT */) {
        pixels = HEAPF32.subarray((pixels)>>2,(pixels+bytes)>>2);
      } else if (type == 0x1405 /* GL_UNSIGNED_INT */ || type == 0x84FA /* UNSIGNED_INT_24_8_WEBGL */) {
        pixels = HEAPU32.subarray((pixels)>>2,(pixels+bytes)>>2);
      } else {
        pixels = HEAPU16.subarray((pixels)>>1,(pixels+bytes)>>1);
      }
      return {
        pixels: pixels,
        internalFormat: internalFormat
      };
    }function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
      var pixelData;
      if (pixels) {
        pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, -1).pixels;
      } else {
        pixelData = null;
      }
      GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
    }

  function _emscripten_glPolygonOffset(x0, x1) { GLctx.polygonOffset(x0, x1) }

  var _emscripten_asm_const_int=true;

  function _emscripten_glUniform2f(location, v0, v1) {
      location = GL.uniforms[location];
      GLctx.uniform2f(location, v0, v1);
    }

  function _glGetAttribLocation(program, name) {
      program = GL.programs[program];
      name = Pointer_stringify(name);
      return GLctx.getAttribLocation(program, name);
    }

  function _glfwWindowHint(target, hint) {
      GLFW.hints[target] = hint;
    }

  function _emscripten_glUniform2i(location, v0, v1) {
      location = GL.uniforms[location];
      GLctx.uniform2i(location, v0, v1);
    }

  function _glBlendFunc(x0, x1) { GLctx.blendFunc(x0, x1) }

  function _glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      GL.programs[id] = program;
      return id;
    }

  function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((renderbuffers)+(i*4))>>2)];
        var renderbuffer = GL.renderbuffers[id];
        if (!renderbuffer) continue; // GL spec: "glDeleteRenderbuffers silently ignores 0s and names that do not correspond to existing renderbuffer objects".
        GLctx.deleteRenderbuffer(renderbuffer);
        renderbuffer.name = 0;
        GL.renderbuffers[id] = null;
      }
    }

  function _emscripten_glGetBufferParameteriv(target, value, data) {
      if (!data) {
        // GLES2 specification does not specify how to behave if data is a null pointer. Since calling this function does not make sense
        // if data == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((data)>>2)]=GLctx.getBufferParameter(target, value);
    }

  
  function emscriptenWebGLGetUniform(program, location, params, type) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
      if (typeof data == 'number' || typeof data == 'boolean') {
        switch (type) {
          case 'Integer': HEAP32[((params)>>2)]=data; break;
          case 'Float': HEAPF32[((params)>>2)]=data; break;
          default: throw 'internal emscriptenWebGLGetUniform() error, bad type: ' + type;
        }
      } else {
        for (var i = 0; i < data.length; i++) {
          switch (type) {
            case 'Integer': HEAP32[(((params)+(i))>>2)]=data[i]; break;
            case 'Float': HEAPF32[(((params)+(i))>>2)]=data[i]; break;
            default: throw 'internal emscriptenWebGLGetUniform() error, bad type: ' + type;
          }
        }
      }
    }function _emscripten_glGetUniformiv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 'Integer');
    }

  function _emscripten_glDepthMask(x0) { GLctx.depthMask(x0) }


  function _emscripten_glDepthRangef(x0, x1) { GLctx.depthRange(x0, x1) }

  function _emscripten_glDepthRange(x0, x1) { GLctx.depthRange(x0, x1) }

  function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
      var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
      HEAP32[((range)>>2)]=result.rangeMin;
      HEAP32[(((range)+(4))>>2)]=result.rangeMax;
      HEAP32[((precision)>>2)]=result.precision;
    }

  function _emscripten_glUniform1fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[0];
        view[0] = HEAPF32[((value)>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*4)>>2);
      }
      GLctx.uniform1fv(location, view);
    }

  function _glDeleteBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((buffers)+(i*4))>>2)];
        var buffer = GL.buffers[id];
  
        // From spec: "glDeleteBuffers silently ignores 0's and names that do not
        // correspond to existing buffer objects."
        if (!buffer) continue;
  
        GLctx.deleteBuffer(buffer);
        buffer.name = 0;
        GL.buffers[id] = null;
  
        if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
        if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
      }
    }

  function _emscripten_glBindProgramARB() {
  Module['printErr']('missing function: emscripten_glBindProgramARB'); abort(-1);
  }

  function _emscripten_glBindTexture(target, texture) {
      GLctx.bindTexture(target, texture ? GL.textures[texture] : null);
    }

  function _emscripten_glCheckFramebufferStatus(x0) { return GLctx.checkFramebufferStatus(x0) }

  function _emscripten_glDeleteProgram(id) {
      if (!id) return;
      var program = GL.programs[id];
      if (!program) { // glDeleteProgram actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteProgram(program);
      program.name = 0;
      GL.programs[id] = null;
      GL.programInfos[id] = null;
    }

  function _emscripten_glDisable(x0) { GLctx.disable(x0) }

  function _emscripten_glVertexAttrib3fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+12)>>2);
      GLctx.vertexAttrib3fv(index, v);
    }

  function _glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = GLctx.getActiveAttrib(program, index);
      if (!info) return; // If an error occurs, nothing will be written to length, size and type and name.
  
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && name) {
        writeStringToMemory(infoname, name);
        if (length) HEAP32[((length)>>2)]=infoname.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
  
      if (size) HEAP32[((size)>>2)]=info.size;
      if (type) HEAP32[((type)>>2)]=info.type;
    }

  function _emscripten_glIsFramebuffer(framebuffer) {
      var fb = GL.framebuffers[framebuffer];
      if (!fb) return 0;
      return GLctx.isFramebuffer(fb);
    }

  function _emscripten_glLineWidth(x0) { GLctx.lineWidth(x0) }

  function _glfwGetCursorPos(winid, x, y) {
      GLFW.getCursorPos(winid, x, y);
    }

  function _emscripten_glGetString(name_) {
      if (GL.stringCache[name_]) return GL.stringCache[name_];
      var ret; 
      switch(name_) {
        case 0x1F00 /* GL_VENDOR */:
        case 0x1F01 /* GL_RENDERER */:
        case 0x1F02 /* GL_VERSION */:
          ret = allocate(intArrayFromString(GLctx.getParameter(name_)), 'i8', ALLOC_NORMAL);
          break;
        case 0x1F03 /* GL_EXTENSIONS */:
          var exts = GLctx.getSupportedExtensions();
          var gl_exts = [];
          for (var i in exts) {
            gl_exts.push(exts[i]);
            gl_exts.push("GL_" + exts[i]);
          }
          ret = allocate(intArrayFromString(gl_exts.join(' ')), 'i8', ALLOC_NORMAL);
          break;
        case 0x8B8C /* GL_SHADING_LANGUAGE_VERSION */:
          ret = allocate(intArrayFromString('OpenGL ES GLSL 1.00 (WebGL)'), 'i8', ALLOC_NORMAL);
          break;
        default:
          GL.recordError(0x0500/*GL_INVALID_ENUM*/);
          return 0;
      }
      GL.stringCache[name_] = ret;
      return ret;
    }

  function _emscripten_glGetAttribLocation(program, name) {
      program = GL.programs[program];
      name = Pointer_stringify(name);
      return GLctx.getAttribLocation(program, name);
    }

  function _emscripten_glRotatef() {
  Module['printErr']('missing function: emscripten_glRotatef'); abort(-1);
  }

  
  function emscriptenWebGLGet(name_, p, type) {
      // Guard against user passing a null pointer.
      // Note that GLES2 spec does not say anything about how passing a null pointer should be treated.
      // Testing on desktop core GL 3, the application crashes on glGetIntegerv to a null pointer, but
      // better to report an error instead of doing anything random.
      if (!p) {
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      var ret = undefined;
      switch(name_) { // Handle a few trivial GLES values
        case 0x8DFA: // GL_SHADER_COMPILER
          ret = 1;
          break;
        case 0x8DF8: // GL_SHADER_BINARY_FORMATS
          if (type !== 'Integer' && type !== 'Integer64') {
            GL.recordError(0x0500); // GL_INVALID_ENUM
          }
          return; // Do not write anything to the out pointer, since no binary formats are supported.
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          ret = 0;
          break;
        case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
          // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
          // so implement it ourselves to allow C++ GLES2 code get the length.
          var formats = GLctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
          ret = formats.length;
          break;
        case 0x8B9A: // GL_IMPLEMENTATION_COLOR_READ_TYPE
          ret = 0x1401; // GL_UNSIGNED_BYTE
          break;
        case 0x8B9B: // GL_IMPLEMENTATION_COLOR_READ_FORMAT
          ret = 0x1908; // GL_RGBA
          break;
      }
  
      if (ret === undefined) {
        var result = GLctx.getParameter(name_);
        switch (typeof(result)) {
          case "number":
            ret = result;
            break;
          case "boolean":
            ret = result ? 1 : 0;
            break;
          case "string":
            GL.recordError(0x0500); // GL_INVALID_ENUM
            return;
          case "object":
            if (result === null) {
              // null is a valid result for some (e.g., which buffer is bound - perhaps nothing is bound), but otherwise
              // can mean an invalid name_, which we need to report as an error
              switch(name_) {
                case 0x8894: // ARRAY_BUFFER_BINDING
                case 0x8B8D: // CURRENT_PROGRAM
                case 0x8895: // ELEMENT_ARRAY_BUFFER_BINDING
                case 0x8CA6: // FRAMEBUFFER_BINDING
                case 0x8CA7: // RENDERBUFFER_BINDING
                case 0x8069: // TEXTURE_BINDING_2D
                case 0x8514: { // TEXTURE_BINDING_CUBE_MAP
                  ret = 0;
                  break;
                }
                default: {
                  GL.recordError(0x0500); // GL_INVALID_ENUM
                  return;
                }
              }
            } else if (result instanceof Float32Array ||
                       result instanceof Uint32Array ||
                       result instanceof Int32Array ||
                       result instanceof Array) {
              for (var i = 0; i < result.length; ++i) {
                switch (type) {
                  case 'Integer': HEAP32[(((p)+(i*4))>>2)]=result[i];   break;
                  case 'Float':   HEAPF32[(((p)+(i*4))>>2)]=result[i]; break;
                  case 'Boolean': HEAP8[(((p)+(i))>>0)]=result[i] ? 1 : 0;    break;
                  default: throw 'internal glGet error, bad type: ' + type;
                }
              }
              return;
            } else if (result instanceof WebGLBuffer ||
                       result instanceof WebGLProgram ||
                       result instanceof WebGLFramebuffer ||
                       result instanceof WebGLRenderbuffer ||
                       result instanceof WebGLTexture) {
              ret = result.name | 0;
            } else {
              GL.recordError(0x0500); // GL_INVALID_ENUM
              return;
            }
            break;
          default:
            GL.recordError(0x0500); // GL_INVALID_ENUM
            return;
        }
      }
  
      switch (type) {
        case 'Integer64': (tempI64 = [ret>>>0,(tempDouble=ret,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((p)>>2)]=tempI64[0],HEAP32[(((p)+(4))>>2)]=tempI64[1]);    break;
        case 'Integer': HEAP32[((p)>>2)]=ret;    break;
        case 'Float':   HEAPF32[((p)>>2)]=ret;  break;
        case 'Boolean': HEAP8[((p)>>0)]=ret ? 1 : 0; break;
        default: throw 'internal glGet error, bad type: ' + type;
      }
    }function _emscripten_glGetIntegerv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Integer');
    }

  function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
      var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
      HEAP32[((params)>>2)]=result;
    }

  function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      Runtime.stackRestore(ret);
    }

  function _glfwSetWindowShouldClose(winid, value) {
      var win = GLFW.WindowFromId(winid);
      if (!win) return;
      win.shouldClose = value;
    }

  function _emscripten_glClientActiveTexture() {
  Module['printErr']('missing function: emscripten_glClientActiveTexture'); abort(-1);
  }

  function _glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx.createBuffer();
        if (!buffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((buffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.buffers);
        buffer.name = id;
        GL.buffers[id] = buffer;
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
      var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
      if (log === null) log = '(unknown error)';
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _glfwGetTime() {
      return GLFW.getTime() - GLFW.initialTime;
    }

  function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
      if (!params) {
        // GLES2 specification does not specify how to behave if params is a null pointer. Since calling this function does not make sense
        // if params == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      HEAP32[((params)>>2)]=GLctx.getRenderbufferParameter(target, pname);
    }

  function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) { GLctx.stencilOpSeparate(x0, x1, x2, x3) }

  function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
      var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
      if (!data.pixels) {
        GL.recordError(0x0500/*GL_INVALID_ENUM*/);
        return;
      }
      GLctx.readPixels(x, y, width, height, format, type, data.pixels);
    }

  function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
      var heapView;
      if (data) {
        heapView = HEAPU8.subarray((data),(data+imageSize));
      } else {
        heapView = null;
      }
      GLctx['compressedTexSubImage2D'](target, level, xoffset, yoffset, width, height, format, heapView);
    }

  function _emscripten_glGetError() {
      // First return any GL error generated by the emscripten library_gl.js interop layer.
      if (GL.lastError) {
        var error = GL.lastError;
        GL.lastError = 0/*GL_NO_ERROR*/;
        return error;
      } else { // If there were none, return the GL error from the browser GL context.
        return GLctx.getError();
      }
    }

  function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
      GLctx.framebufferTexture2D(target, attachment, textarget,
                                      GL.textures[texture], level);
    }

  function _pthread_cleanup_push(routine, arg) {
      __ATEXIT__.push(function() { Runtime.dynCall('vi', routine, [arg]) })
      _pthread_cleanup_push.level = __ATEXIT__.length;
    }

  function _emscripten_glIsEnabled(x0) { return GLctx.isEnabled(x0) }

   
  Module["_memmove"] = _memmove;

  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var texture = GLctx.createTexture();
        if (!texture) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */); // GLES + EGL specs don't specify what should happen here, so best to issue an error and create IDs with 0.
          while(i < n) HEAP32[(((textures)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.textures);
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) { GLctx.vertexAttrib4f(x0, x1, x2, x3, x4) }

  function _glDepthFunc(x0) { GLctx.depthFunc(x0) }

  function _emscripten_glClearDepthf(x0) { GLctx.clearDepth(x0) }

  function _emscripten_glClear(x0) { GLctx.clear(x0) }

  function _emscripten_glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
  
  
      GLctx.bindBuffer(target, bufferObj);
    }

  function _emscripten_glGetUniformfv(program, location, params) {
      emscriptenWebGLGetUniform(program, location, params, 'Float');
    }

  function _glGetProgramiv(program, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else if (pname == 0x8B87 /* GL_ACTIVE_UNIFORM_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          HEAP32[((p)>>2)]=ptable.maxUniformLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else if (pname == 0x8B8A /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          if (ptable.maxAttributeLength == -1) {
            var program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
            ptable.maxAttributeLength = 0; // Spec says if there are no active attribs, 0 must be returned.
            for(var i = 0; i < numAttribs; ++i) {
              var activeAttrib = GLctx.getActiveAttrib(program, i);
              ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length+1);
            }
          }
          HEAP32[((p)>>2)]=ptable.maxAttributeLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else {
        HEAP32[((p)>>2)]=GLctx.getProgramParameter(GL.programs[program], pname);
      }
    }

  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }

  function _emscripten_glGetProgramiv(program, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getProgramInfoLog(GL.programs[program]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else if (pname == 0x8B87 /* GL_ACTIVE_UNIFORM_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          HEAP32[((p)>>2)]=ptable.maxUniformLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else if (pname == 0x8B8A /* GL_ACTIVE_ATTRIBUTE_MAX_LENGTH */) {
        var ptable = GL.programInfos[program];
        if (ptable) {
          if (ptable.maxAttributeLength == -1) {
            var program = GL.programs[program];
            var numAttribs = GLctx.getProgramParameter(program, GLctx.ACTIVE_ATTRIBUTES);
            ptable.maxAttributeLength = 0; // Spec says if there are no active attribs, 0 must be returned.
            for(var i = 0; i < numAttribs; ++i) {
              var activeAttrib = GLctx.getActiveAttrib(program, i);
              ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length+1);
            }
          }
          HEAP32[((p)>>2)]=ptable.maxAttributeLength;
          return;
        } else if (program < GL.counter) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
        } else {
          GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        }
      } else {
        HEAP32[((p)>>2)]=GLctx.getProgramParameter(GL.programs[program], pname);
      }
    }

  function _glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
  
      var arrayOffset = 0;
      // If user passed an array accessor "[index]", parse the array index off the accessor.
      if (name.indexOf(']', name.length-1) !== -1) {
        var ls = name.lastIndexOf('[');
        var arrayIndex = name.slice(ls+1, -1);
        if (arrayIndex.length > 0) {
          arrayOffset = parseInt(arrayIndex);
          if (arrayOffset < 0) {
            return -1;
          }
        }
        name = name.slice(0, ls);
      }
  
      var ptable = GL.programInfos[program];
      if (!ptable) {
        return -1;
      }
      var utable = ptable.uniforms;
      var uniformInfo = utable[name]; // returns pair [ dimension_of_uniform_array, uniform_location ]
      if (uniformInfo && arrayOffset < uniformInfo[0]) { // Check if user asked for an out-of-bounds element, i.e. for 'vec4 colors[3];' user could ask for 'colors[10]' which should return -1.
        return uniformInfo[1]+arrayOffset;
      } else {
        return -1;
      }
    }

  function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
      var result = GLctx.getAttachedShaders(GL.programs[program]);
      var len = result.length;
      if (len > maxCount) {
        len = maxCount;
      }
      HEAP32[((count)>>2)]=len;
      for (var i = 0; i < len; ++i) {
        var id = GL.shaders.indexOf(result[i]);
        assert(id !== -1, 'shader not bound to local id');
        HEAP32[(((shaders)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glGenRenderbuffers(n, renderbuffers) {
      for (var i = 0; i < n; i++) {
        var renderbuffer = GLctx.createRenderbuffer();
        if (!renderbuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((renderbuffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.renderbuffers);
        renderbuffer.name = id;
        GL.renderbuffers[id] = renderbuffer;
        HEAP32[(((renderbuffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glFrontFace(x0) { GLctx.frontFace(x0) }

  function _emscripten_glActiveTexture(x0) { GLctx.activeTexture(x0) }

  function _emscripten_glUniform1iv(location, count, value) {
      location = GL.uniforms[location];
      value = HEAP32.subarray((value)>>2,(value+count*4)>>2);
      GLctx.uniform1iv(location, value);
    }

  function _glUniform4fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[3];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
        view[3] = HEAPF32[(((value)+(12))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      GLctx.uniform4fv(location, view);
    }

  function _emscripten_glTexCoordPointer() {
  Module['printErr']('missing function: emscripten_glTexCoordPointer'); abort(-1);
  }

  function _emscripten_glGetInfoLogARB() {
  Module['printErr']('missing function: emscripten_glGetInfoLogARB'); abort(-1);
  }

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) { GLctx.renderbufferStorage(x0, x1, x2, x3) }

  function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) { GLctx.copyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) }

  function _emscripten_glShaderBinary() {
      GL.recordError(0x0500/*GL_INVALID_ENUM*/);
    }

  function _emscripten_glIsProgram(program) {
      var program = GL.programs[program];
      if (!program) return 0;
      return GLctx.isProgram(program);
    }

  function _emscripten_glBlendColor(x0, x1, x2, x3) { GLctx.blendColor(x0, x1, x2, x3) }

  function _emscripten_glGetShaderiv(shader, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else {
        HEAP32[((p)>>2)]=GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }

  function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[8];
        for (var i = 0; i < 9; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*36)>>2);
      }
      GLctx.uniformMatrix3fv(location, transpose, view);
    }

  function _emscripten_glVertexAttrib2f(x0, x1, x2) { GLctx.vertexAttrib2f(x0, x1, x2) }

  function _emscripten_glUniform4fv(location, count, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform
        view = GL.miniTempBufferViews[3];
        view[0] = HEAPF32[((value)>>2)];
        view[1] = HEAPF32[(((value)+(4))>>2)];
        view[2] = HEAPF32[(((value)+(8))>>2)];
        view[3] = HEAPF32[(((value)+(12))>>2)];
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*16)>>2);
      }
      GLctx.uniform4fv(location, view);
    }

  function _glBufferSubData(target, offset, size, data) {
      GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data+size));
    }

  function _emscripten_glGenFramebuffers(n, ids) {
      for (var i = 0; i < n; ++i) {
        var framebuffer = GLctx.createFramebuffer();
        if (!framebuffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((ids)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.framebuffers);
        framebuffer.name = id;
        GL.framebuffers[id] = framebuffer;
        HEAP32[(((ids)+(i*4))>>2)]=id;
      }
    }

  function _glGetShaderiv(shader, pname, p) {
      if (!p) {
        // GLES2 specification does not specify how to behave if p is a null pointer. Since calling this function does not make sense
        // if p == null, issue a GL error to notify user about it. 
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      if (pname == 0x8B84) { // GL_INFO_LOG_LENGTH
        var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
        if (log === null) log = '(unknown error)';
        HEAP32[((p)>>2)]=log.length + 1;
      } else {
        HEAP32[((p)>>2)]=GLctx.getShaderParameter(GL.shaders[shader], pname);
      }
    }

  function _emscripten_glBlendEquationSeparate(x0, x1) { GLctx.blendEquationSeparate(x0, x1) }

  function _glfwSetWindowIconifyCallback(winid, cbfun) {
      var win = GLFW.WindowFromId(winid);
      if (!win) return;
      win.windowIconifyFunc = cbfun;
    }

  function _emscripten_glDrawRangeElements() {
  Module['printErr']('missing function: emscripten_glDrawRangeElements'); abort(-1);
  }

  function _emscripten_glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var texture = GLctx.createTexture();
        if (!texture) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */); // GLES + EGL specs don't specify what should happen here, so best to issue an error and create IDs with 0.
          while(i < n) HEAP32[(((textures)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.textures);
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glVertexAttrib2fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+8)>>2);
      GLctx.vertexAttrib2fv(index, v);
    }

  function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
      program = GL.programs[program];
      var info = GLctx.getActiveUniform(program, index);
      if (!info) return; // If an error occurs, nothing will be written to length, size, type and name.
  
      var infoname = info.name.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && name) {
        writeStringToMemory(infoname, name);
        if (length) HEAP32[((length)>>2)]=infoname.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
  
      if (size) HEAP32[((size)>>2)]=info.size;
      if (type) HEAP32[((type)>>2)]=info.type;
    }

  function _emscripten_glDeleteObjectARB() {
  Module['printErr']('missing function: emscripten_glDeleteObjectARB'); abort(-1);
  }

  function _emscripten_glUniform1f(location, v0) {
      location = GL.uniforms[location];
      GLctx.uniform1f(location, v0);
    }

  function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      GLctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }

  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      GLctx.shaderSource(GL.shaders[shader], source);
    }

  var _sqrtf=Math_sqrt;

  function _emscripten_glDrawArrays(mode, first, count) {
  
      GLctx.drawArrays(mode, first, count);
  
    }

  function _emscripten_glGenBuffers(n, buffers) {
      for (var i = 0; i < n; i++) {
        var buffer = GLctx.createBuffer();
        if (!buffer) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((buffers)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.buffers);
        buffer.name = id;
        GL.buffers[id] = buffer;
        HEAP32[(((buffers)+(i*4))>>2)]=id;
      }
    }

  function _emscripten_glClearDepth(x0) { GLctx.clearDepth(x0) }

  function _glfwSetCharCallback(winid, cbfun) {
      GLFW.setCharCallback(winid, cbfun);
    }

  function _emscripten_glGetUniformLocation(program, name) {
      name = Pointer_stringify(name);
  
      var arrayOffset = 0;
      // If user passed an array accessor "[index]", parse the array index off the accessor.
      if (name.indexOf(']', name.length-1) !== -1) {
        var ls = name.lastIndexOf('[');
        var arrayIndex = name.slice(ls+1, -1);
        if (arrayIndex.length > 0) {
          arrayOffset = parseInt(arrayIndex);
          if (arrayOffset < 0) {
            return -1;
          }
        }
        name = name.slice(0, ls);
      }
  
      var ptable = GL.programInfos[program];
      if (!ptable) {
        return -1;
      }
      var utable = ptable.uniforms;
      var uniformInfo = utable[name]; // returns pair [ dimension_of_uniform_array, uniform_location ]
      if (uniformInfo && arrayOffset < uniformInfo[0]) { // Check if user asked for an out-of-bounds element, i.e. for 'vec4 colors[3];' user could ask for 'colors[10]' which should return -1.
        return uniformInfo[1]+arrayOffset;
      } else {
        return -1;
      }
    }

  function _glActiveTexture(x0) { GLctx.activeTexture(x0) }

  function _glBindBuffer(target, buffer) {
      var bufferObj = buffer ? GL.buffers[buffer] : null;
  
  
      GLctx.bindBuffer(target, bufferObj);
    }

  function _emscripten_glVertexAttrib4fv(index, v) {
      v = HEAPF32.subarray((v)>>2,(v+16)>>2);
      GLctx.vertexAttrib4fv(index, v);
    }

  function _emscripten_glScissor(x0, x1, x2, x3) { GLctx.scissor(x0, x1, x2, x3) }

  function _glfwSetCursorEnterCallback(winid, cbfun) {
      var win = GLFW.WindowFromId(winid);
      if (!win) return;
      win.cursorEnterFunc = cbfun;
    }

   
  Module["_bitshift64Lshr"] = _bitshift64Lshr;

  function _glBufferData(target, size, data, usage) {
      switch (usage) { // fix usages, WebGL only has *_DRAW
        case 0x88E1: // GL_STREAM_READ
        case 0x88E2: // GL_STREAM_COPY
          usage = 0x88E0; // GL_STREAM_DRAW
          break;
        case 0x88E5: // GL_STATIC_READ
        case 0x88E6: // GL_STATIC_COPY
          usage = 0x88E4; // GL_STATIC_DRAW
          break;
        case 0x88E9: // GL_DYNAMIC_READ
        case 0x88EA: // GL_DYNAMIC_COPY
          usage = 0x88E8; // GL_DYNAMIC_DRAW
          break;
      }
      if (!data) {
        GLctx.bufferData(target, size, usage);
      } else {
        GLctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
      }
    }

  var _BDtoIHigh=true;

  function _emscripten_glIsShader(shader) {
      var s = GL.shaders[shader];
      if (!s) return 0;
      return GLctx.isShader(s);
    }

  function _emscripten_glDrawBuffers(n, bufs) {
      var bufArray = [];
      for (var i = 0; i < n; i++)
        bufArray.push(HEAP32[(((bufs)+(i*4))>>2)]);
  
      GLctx['drawBuffers'](bufArray);
    }

  function _emscripten_glBindFramebuffer(target, framebuffer) {
      GLctx.bindFramebuffer(target, framebuffer ? GL.framebuffers[framebuffer] : null);
    }

  function _emscripten_glBlendEquation(x0) { GLctx.blendEquation(x0) }

  function _emscripten_glBufferSubData(target, offset, size, data) {
      GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data+size));
    }

  function _emscripten_glBufferData(target, size, data, usage) {
      switch (usage) { // fix usages, WebGL only has *_DRAW
        case 0x88E1: // GL_STREAM_READ
        case 0x88E2: // GL_STREAM_COPY
          usage = 0x88E0; // GL_STREAM_DRAW
          break;
        case 0x88E5: // GL_STATIC_READ
        case 0x88E6: // GL_STATIC_COPY
          usage = 0x88E4; // GL_STATIC_DRAW
          break;
        case 0x88E9: // GL_DYNAMIC_READ
        case 0x88EA: // GL_DYNAMIC_COPY
          usage = 0x88E8; // GL_DYNAMIC_DRAW
          break;
      }
      if (!data) {
        GLctx.bufferData(target, size, usage);
      } else {
        GLctx.bufferData(target, HEAPU8.subarray(data, data+size), usage);
      }
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) {
        var success = self.alloc(bytes);
        if (!success) return -1 >>> 0; // sbrk failure code
      }
      return ret;  // Previous break location.
    }

   
  Module["_bitshift64Shl"] = _bitshift64Shl;

  var _BItoD=true;

  function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
      var result = GLctx.getShaderSource(GL.shaders[shader]);
      if (!result) return; // If an error occurs, nothing will be written to length or source.
      result = result.slice(0, Math.max(0, bufSize - 1));
      if (bufSize > 0 && source) {
        writeStringToMemory(result, source);
        if (length) HEAP32[((length)>>2)]=result.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glGetFloatv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Float');
    }

  function _glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      var pixelData;
      if (pixels) {
        var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
        pixelData = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixelData = null;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
    }

  function _glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = '(unknown error)';
  
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glVertexAttribDivisor(index, divisor) {
      GLctx['vertexAttribDivisor'](index, divisor);
    }

  function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
      GLctx['drawElementsInstanced'](mode, count, type, indices, primcount);
    }

  function _emscripten_glDrawElements(mode, count, type, indices) {
  
      GLctx.drawElements(mode, count, type, indices);
  
    }

  function _glfwSetMouseButtonCallback(winid, cbfun) {
      GLFW.setMouseButtonCallback(winid, cbfun);
    }

  function _emscripten_glCreateProgram() {
      var id = GL.getNewId(GL.programs);
      var program = GLctx.createProgram();
      program.name = id;
      GL.programs[id] = program;
      return id;
    }

  function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
      var heapView;
      if (data) {
        heapView = HEAPU8.subarray((data),(data+imageSize));
      } else {
        heapView = null;
      }
      GLctx['compressedTexImage2D'](target, level, internalFormat, width, height, border, heapView);
    }

  function _emscripten_glClearColor(x0, x1, x2, x3) { GLctx.clearColor(x0, x1, x2, x3) }

  function _emscripten_glBindVertexArray(vao) {
      GLctx['bindVertexArray'](GL.vaos[vao]);
    }

  function _emscripten_glLoadMatrixf() {
  Module['printErr']('missing function: emscripten_glLoadMatrixf'); abort(-1);
  }

  function _glDeleteShader(id) {
      if (!id) return;
      var shader = GL.shaders[id];
      if (!shader) { // glDeleteShader actually signals an error when deleting a nonexisting object, unlike some other GL delete functions.
        GL.recordError(0x0501 /* GL_INVALID_VALUE */);
        return;
      }
      GLctx.deleteShader(shader);
      GL.shaders[id] = null;
    }

  function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
      var log = GLctx.getProgramInfoLog(GL.programs[program]);
      if (log === null) log = '(unknown error)';
  
      log = log.substr(0, maxLength - 1);
      if (maxLength > 0 && infoLog) {
        writeStringToMemory(log, infoLog);
        if (length) HEAP32[((length)>>2)]=log.length;
      } else {
        if (length) HEAP32[((length)>>2)]=0;
      }
    }

  function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
      var pixelData;
      if (pixels) {
        var data = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat);
        pixelData = data.pixels;
        internalFormat = data.internalFormat;
      } else {
        pixelData = null;
      }
      GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixelData);
    }

  function _glPixelStorei(pname, param) {
      if (pname == 0x0D05 /* GL_PACK_ALIGNMENT */) {
        GL.packAlignment = param;
      } else if (pname == 0x0cf5 /* GL_UNPACK_ALIGNMENT */) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }

  function ___unlock() {}

  function _emscripten_glColorPointer() {
  Module['printErr']('missing function: emscripten_glColorPointer'); abort(-1);
  }

  function _glViewport(x0, x1, x2, x3) { GLctx.viewport(x0, x1, x2, x3) }

  function _glfwPollEvents() {}

  function _glfwDestroyWindow(winid) {
      return GLFW.destroyWindow(winid);
    }

  function _emscripten_glFlush() { GLctx.flush() }

  function _glfwSetErrorCallback(cbfun) {
      GLFW.errorFunc = cbfun;
    }

  function _emscripten_glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = GLctx.createShader(shaderType);
      return id;
    }

  function _glUniformMatrix4fv(location, count, transpose, value) {
      location = GL.uniforms[location];
      var view;
      if (count === 1) {
        // avoid allocation for the common case of uploading one uniform matrix
        view = GL.miniTempBufferViews[15];
        for (var i = 0; i < 16; i++) {
          view[i] = HEAPF32[(((value)+(i*4))>>2)];
        }
      } else {
        view = HEAPF32.subarray((value)>>2,(value+count*64)>>2);
      }
      GLctx.uniformMatrix4fv(location, transpose, view);
    }

  function _emscripten_glValidateProgram(program) {
      GLctx.validateProgram(GL.programs[program]);
    }

  function _glTexParameteri(x0, x1, x2) { GLctx.texParameteri(x0, x1, x2) }

  function _glfwSetKeyCallback(winid, cbfun) {
      GLFW.setKeyCallback(winid, cbfun);
    }

  function _emscripten_glColorMask(x0, x1, x2, x3) { GLctx.colorMask(x0, x1, x2, x3) }

  function _emscripten_glPixelStorei(pname, param) {
      if (pname == 0x0D05 /* GL_PACK_ALIGNMENT */) {
        GL.packAlignment = param;
      } else if (pname == 0x0cf5 /* GL_UNPACK_ALIGNMENT */) {
        GL.unpackAlignment = param;
      }
      GLctx.pixelStorei(pname, param);
    }

  function _emscripten_glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        if (!texture) continue; // GL spec: "glDeleteTextures silently ignores 0s and names that do not correspond to existing textures".
        GLctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }

  function _emscripten_glGenVertexArrays(n, arrays) {
  
      for(var i = 0; i < n; i++) {
        var vao = GLctx['createVertexArray']();
        if (!vao) {
          GL.recordError(0x0502 /* GL_INVALID_OPERATION */);
          while(i < n) HEAP32[(((arrays)+(i++*4))>>2)]=0;
          return;
        }
        var id = GL.getNewId(GL.vaos);
        vao.name = id;
        GL.vaos[id] = vao;
        HEAP32[(((arrays)+(i*4))>>2)]=id;
      }
    }

  function _time(ptr) {
      var ret = (Date.now()/1000)|0;
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  function _pthread_self() {
      //FIXME: assumes only a single thread
      return 0;
    }

  function _emscripten_glGetBooleanv(name_, p) {
      emscriptenWebGLGet(name_, p, 'Boolean');
    }

  function _emscripten_glCompileShader(shader) {
      GLctx.compileShader(GL.shaders[shader]);
    }
var GLctx; GL.init()
FS.staticInit();__ATINIT__.unshift(function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() });__ATMAIN__.push(function() { FS.ignorePermissions = false });__ATEXIT__.push(function() { FS.quit() });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;Module["FS_unlink"] = FS.unlink;
__ATINIT__.unshift(function() { TTY.init() });__ATEXIT__.push(function() { TTY.shutdown() });
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); var NODEJS_PATH = require("path"); NODEFS.staticInit(); }
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) { Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
  Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) { return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes) }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + TOTAL_STACK;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");

 var cttz_i8 = allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0], "i8", ALLOC_DYNAMIC);


function nullFunc_viiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vd(x) { Module["printErr"]("Invalid function pointer called with signature 'vd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vid(x) { Module["printErr"]("Invalid function pointer called with signature 'vid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vi(x) { Module["printErr"]("Invalid function pointer called with signature 'vi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vii(x) { Module["printErr"]("Invalid function pointer called with signature 'vii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_ii(x) { Module["printErr"]("Invalid function pointer called with signature 'ii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viddd(x) { Module["printErr"]("Invalid function pointer called with signature 'viddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vidd(x) { Module["printErr"]("Invalid function pointer called with signature 'vidd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iiii(x) { Module["printErr"]("Invalid function pointer called with signature 'iiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viii(x) { Module["printErr"]("Invalid function pointer called with signature 'viii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vidddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vidddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdi(x) { Module["printErr"]("Invalid function pointer called with signature 'vdi'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiiiiiiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiiiiiiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_iii(x) { Module["printErr"]("Invalid function pointer called with signature 'iii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_i(x) { Module["printErr"]("Invalid function pointer called with signature 'i'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdddddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdddddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdddd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdddd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_vdd(x) { Module["printErr"]("Invalid function pointer called with signature 'vdd'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_v(x) { Module["printErr"]("Invalid function pointer called with signature 'v'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viid(x) { Module["printErr"]("Invalid function pointer called with signature 'viid'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function nullFunc_viiii(x) { Module["printErr"]("Invalid function pointer called with signature 'viiii'. Perhaps this is an invalid value (e.g. caused by calling a virtual method on a NULL pointer)? Or calling a function with an incorrect type, which will fail? (it is worth building your source files with -Werror (warnings are errors), as warnings can indicate undefined behavior which can cause this)");  Module["printErr"]("Build with ASSERTIONS=2 for more info.");abort(x) }

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vd(index,a1) {
  try {
    Module["dynCall_vd"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vid(index,a1,a2) {
  try {
    Module["dynCall_vid"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  try {
    Module["dynCall_vii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viddd(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viddd"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vidd(index,a1,a2,a3) {
  try {
    Module["dynCall_vidd"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  try {
    return Module["dynCall_iiii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  try {
    Module["dynCall_viiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_viiiiii"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  try {
    Module["dynCall_viii"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vidddd(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_vidddd"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdi(index,a1,a2) {
  try {
    Module["dynCall_vdi"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  try {
    Module["dynCall_viiiiiii"](index,a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  try {
    Module["dynCall_viiiiiiiii"](index,a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_i(index) {
  try {
    return Module["dynCall_i"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdddddd(index,a1,a2,a3,a4,a5,a6) {
  try {
    Module["dynCall_vdddddd"](index,a1,a2,a3,a4,a5,a6);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdddd(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_vdddd"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vdd(index,a1,a2) {
  try {
    Module["dynCall_vdd"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viid(index,a1,a2,a3) {
  try {
    Module["dynCall_viid"](index,a1,a2,a3);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  try {
    Module["dynCall_viiii"](index,a1,a2,a3,a4);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

Module.asmGlobalArg = { "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array, "NaN": NaN, "Infinity": Infinity };

Module.asmLibraryArg = { "abort": abort, "assert": assert, "nullFunc_viiiii": nullFunc_viiiii, "nullFunc_vd": nullFunc_vd, "nullFunc_vid": nullFunc_vid, "nullFunc_vi": nullFunc_vi, "nullFunc_vii": nullFunc_vii, "nullFunc_ii": nullFunc_ii, "nullFunc_viddd": nullFunc_viddd, "nullFunc_vidd": nullFunc_vidd, "nullFunc_iiii": nullFunc_iiii, "nullFunc_viiiiiiii": nullFunc_viiiiiiii, "nullFunc_viiiiii": nullFunc_viiiiii, "nullFunc_viii": nullFunc_viii, "nullFunc_vidddd": nullFunc_vidddd, "nullFunc_vdi": nullFunc_vdi, "nullFunc_viiiiiii": nullFunc_viiiiiii, "nullFunc_viiiiiiiii": nullFunc_viiiiiiiii, "nullFunc_iii": nullFunc_iii, "nullFunc_i": nullFunc_i, "nullFunc_vdddddd": nullFunc_vdddddd, "nullFunc_vdddd": nullFunc_vdddd, "nullFunc_vdd": nullFunc_vdd, "nullFunc_v": nullFunc_v, "nullFunc_viid": nullFunc_viid, "nullFunc_viiii": nullFunc_viiii, "invoke_viiiii": invoke_viiiii, "invoke_vd": invoke_vd, "invoke_vid": invoke_vid, "invoke_vi": invoke_vi, "invoke_vii": invoke_vii, "invoke_ii": invoke_ii, "invoke_viddd": invoke_viddd, "invoke_vidd": invoke_vidd, "invoke_iiii": invoke_iiii, "invoke_viiiiiiii": invoke_viiiiiiii, "invoke_viiiiii": invoke_viiiiii, "invoke_viii": invoke_viii, "invoke_vidddd": invoke_vidddd, "invoke_vdi": invoke_vdi, "invoke_viiiiiii": invoke_viiiiiii, "invoke_viiiiiiiii": invoke_viiiiiiiii, "invoke_iii": invoke_iii, "invoke_i": invoke_i, "invoke_vdddddd": invoke_vdddddd, "invoke_vdddd": invoke_vdddd, "invoke_vdd": invoke_vdd, "invoke_v": invoke_v, "invoke_viid": invoke_viid, "invoke_viiii": invoke_viiii, "_emscripten_glGetTexParameterfv": _emscripten_glGetTexParameterfv, "_glUseProgram": _glUseProgram, "_emscripten_glShaderSource": _emscripten_glShaderSource, "_glfwCreateWindow": _glfwCreateWindow, "_emscripten_glReleaseShaderCompiler": _emscripten_glReleaseShaderCompiler, "_emscripten_glBlendFuncSeparate": _emscripten_glBlendFuncSeparate, "_emscripten_glVertexAttribPointer": _emscripten_glVertexAttribPointer, "_emscripten_glGetIntegerv": _emscripten_glGetIntegerv, "_emscripten_glCullFace": _emscripten_glCullFace, "_emscripten_glIsProgram": _emscripten_glIsProgram, "_emscripten_glStencilMaskSeparate": _emscripten_glStencilMaskSeparate, "_emscripten_glViewport": _emscripten_glViewport, "_emscripten_glFrontFace": _emscripten_glFrontFace, "_eglGetProcAddress": _eglGetProcAddress, "_glDeleteProgram": _glDeleteProgram, "_emscripten_glUniform3fv": _emscripten_glUniform3fv, "_emscripten_glPolygonOffset": _emscripten_glPolygonOffset, "_emscripten_glUseProgram": _emscripten_glUseProgram, "_emscripten_glBlendColor": _emscripten_glBlendColor, "_glBindBuffer": _glBindBuffer, "_emscripten_glDepthFunc": _emscripten_glDepthFunc, "_glGetShaderInfoLog": _glGetShaderInfoLog, "_glDrawArrays": _glDrawArrays, "_emscripten_set_main_loop_timing": _emscripten_set_main_loop_timing, "_sbrk": _sbrk, "_glBlendFunc": _glBlendFunc, "_emscripten_glDisableVertexAttribArray": _emscripten_glDisableVertexAttribArray, "_glGetAttribLocation": _glGetAttribLocation, "_glDisableVertexAttribArray": _glDisableVertexAttribArray, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_sysconf": _sysconf, "_emscripten_glSampleCoverage": _emscripten_glSampleCoverage, "_emscripten_glVertexPointer": _emscripten_glVertexPointer, "_emscripten_glBlendEquationSeparate": _emscripten_glBlendEquationSeparate, "emscriptenWebGLComputeImageSize": emscriptenWebGLComputeImageSize, "_emscripten_glGetBooleanv": _emscripten_glGetBooleanv, "_emscripten_glGetShaderSource": _emscripten_glGetShaderSource, "_llvm_stacksave": _llvm_stacksave, "_emscripten_glUniform1i": _emscripten_glUniform1i, "_emscripten_glGenBuffers": _emscripten_glGenBuffers, "_emscripten_glDeleteObjectARB": _emscripten_glDeleteObjectARB, "_glfwSetWindowSizeCallback": _glfwSetWindowSizeCallback, "_emscripten_glGetShaderPrecisionFormat": _emscripten_glGetShaderPrecisionFormat, "_glfwInit": _glfwInit, "_glGenBuffers": _glGenBuffers, "_glShaderSource": _glShaderSource, "_emscripten_glGetString": _emscripten_glGetString, "_emscripten_glIsFramebuffer": _emscripten_glIsFramebuffer, "_emscripten_glIsEnabled": _emscripten_glIsEnabled, "_emscripten_glScissor": _emscripten_glScissor, "_emscripten_glVertexAttrib4fv": _emscripten_glVertexAttrib4fv, "_emscripten_glTexParameteriv": _emscripten_glTexParameteriv, "_pthread_cleanup_push": _pthread_cleanup_push, "_emscripten_glBindProgramARB": _emscripten_glBindProgramARB, "_emscripten_glStencilOpSeparate": _emscripten_glStencilOpSeparate, "_emscripten_glHint": _emscripten_glHint, "_emscripten_glFramebufferRenderbuffer": _emscripten_glFramebufferRenderbuffer, "___syscall140": ___syscall140, "_glfwSetErrorCallback": _glfwSetErrorCallback, "_glfwDefaultWindowHints": _glfwDefaultWindowHints, "_glfwDestroyWindow": _glfwDestroyWindow, "_emscripten_glVertexAttrib1f": _emscripten_glVertexAttrib1f, "_pthread_cleanup_pop": _pthread_cleanup_pop, "_emscripten_glAttachShader": _emscripten_glAttachShader, "_glVertexAttribPointer": _glVertexAttribPointer, "_emscripten_glUniform2i": _emscripten_glUniform2i, "_emscripten_glUniform2f": _emscripten_glUniform2f, "_emscripten_glTexParameterfv": _emscripten_glTexParameterfv, "_emscripten_glIsBuffer": _emscripten_glIsBuffer, "_emscripten_glUniformMatrix2fv": _emscripten_glUniformMatrix2fv, "_glGetProgramInfoLog": _glGetProgramInfoLog, "_glfwSetScrollCallback": _glfwSetScrollCallback, "_emscripten_glTexParameterf": _emscripten_glTexParameterf, "_emscripten_glGetAttachedShaders": _emscripten_glGetAttachedShaders, "_emscripten_glGenTextures": _emscripten_glGenTextures, "_emscripten_glTexParameteri": _emscripten_glTexParameteri, "_llvm_stackrestore": _llvm_stackrestore, "_glfwMakeContextCurrent": _glfwMakeContextCurrent, "_emscripten_glClear": _emscripten_glClear, "_glDrawElements": _glDrawElements, "_glBufferSubData": _glBufferSubData, "_emscripten_glValidateProgram": _emscripten_glValidateProgram, "_emscripten_glVertexAttrib2fv": _emscripten_glVertexAttrib2fv, "_glViewport": _glViewport, "_emscripten_glUniform4iv": _emscripten_glUniform4iv, "_emscripten_glGetTexParameteriv": _emscripten_glGetTexParameteriv, "___setErrNo": ___setErrNo, "_emscripten_glDrawArrays": _emscripten_glDrawArrays, "_emscripten_glBindAttribLocation": _emscripten_glBindAttribLocation, "_glDeleteTextures": _glDeleteTextures, "_glDepthFunc": _glDepthFunc, "_emscripten_glClientActiveTexture": _emscripten_glClientActiveTexture, "_emscripten_glVertexAttrib2f": _emscripten_glVertexAttrib2f, "_emscripten_glFlush": _emscripten_glFlush, "_emscripten_glUniform4i": _emscripten_glUniform4i, "_emscripten_glCheckFramebufferStatus": _emscripten_glCheckFramebufferStatus, "_emscripten_glGenerateMipmap": _emscripten_glGenerateMipmap, "_emscripten_glGetError": _emscripten_glGetError, "_emscripten_glClearDepthf": _emscripten_glClearDepthf, "_emscripten_glBufferData": _emscripten_glBufferData, "_emscripten_glUniform3i": _emscripten_glUniform3i, "_emscripten_glRotatef": _emscripten_glRotatef, "_emscripten_glDeleteShader": _emscripten_glDeleteShader, "_glEnable": _glEnable, "_glGenTextures": _glGenTextures, "_emscripten_glMatrixMode": _emscripten_glMatrixMode, "_glGetString": _glGetString, "_emscripten_glClearStencil": _emscripten_glClearStencil, "_emscripten_glGetUniformLocation": _emscripten_glGetUniformLocation, "emscriptenWebGLGet": emscriptenWebGLGet, "_emscripten_glGetBufferParameteriv": _emscripten_glGetBufferParameteriv, "_emscripten_glEnableVertexAttribArray": _emscripten_glEnableVertexAttribArray, "_eglWaitClient": _eglWaitClient, "_emscripten_get_now": _emscripten_get_now, "_emscripten_glNormalPointer": _emscripten_glNormalPointer, "_glAttachShader": _glAttachShader, "_emscripten_glTexCoordPointer": _emscripten_glTexCoordPointer, "_emscripten_glEnable": _emscripten_glEnable, "_glCreateProgram": _glCreateProgram, "_glUniformMatrix4fv": _glUniformMatrix4fv, "_emscripten_glClearDepth": _emscripten_glClearDepth, "___lock": ___lock, "_emscripten_glBindFramebuffer": _emscripten_glBindFramebuffer, "_emscripten_glReadPixels": _emscripten_glReadPixels, "_emscripten_glStencilFuncSeparate": _emscripten_glStencilFuncSeparate, "_emscripten_glVertexAttrib3f": _emscripten_glVertexAttrib3f, "_time": _time, "_glBindFramebuffer": _glBindFramebuffer, "___syscall146": ___syscall146, "_emscripten_glGetFramebufferAttachmentParameteriv": _emscripten_glGetFramebufferAttachmentParameteriv, "_exit": _exit, "_emscripten_asm_const_2": _emscripten_asm_const_2, "_emscripten_glEnableClientState": _emscripten_glEnableClientState, "_emscripten_glGetActiveAttrib": _emscripten_glGetActiveAttrib, "_emscripten_glDrawRangeElements": _emscripten_glDrawRangeElements, "_emscripten_glGetPointerv": _emscripten_glGetPointerv, "_glDeleteFramebuffers": _glDeleteFramebuffers, "_glfwPollEvents": _glfwPollEvents, "_emscripten_glUniform4f": _emscripten_glUniform4f, "_emscripten_glUniform2fv": _emscripten_glUniform2fv, "_emscripten_glLoadMatrixf": _emscripten_glLoadMatrixf, "_emscripten_glFinish": _emscripten_glFinish, "_emscripten_glShaderBinary": _emscripten_glShaderBinary, "_emscripten_glDrawElements": _emscripten_glDrawElements, "_emscripten_glBlendFunc": _emscripten_glBlendFunc, "_emscripten_glGetShaderInfoLog": _emscripten_glGetShaderInfoLog, "_glCompressedTexImage2D": _glCompressedTexImage2D, "_emscripten_glUniform1iv": _emscripten_glUniform1iv, "_emscripten_glGetVertexAttribPointerv": _emscripten_glGetVertexAttribPointerv, "_emscripten_glCompressedTexSubImage2D": _emscripten_glCompressedTexSubImage2D, "emscriptenWebGLGetUniform": emscriptenWebGLGetUniform, "_emscripten_glGenRenderbuffers": _emscripten_glGenRenderbuffers, "_emscripten_glDeleteVertexArrays": _emscripten_glDeleteVertexArrays, "_glfwSetWindowShouldClose": _glfwSetWindowShouldClose, "_emscripten_glUniform1fv": _emscripten_glUniform1fv, "_emscripten_glGetActiveUniform": _emscripten_glGetActiveUniform, "_glBindTexture": _glBindTexture, "_emscripten_glUniform3iv": _emscripten_glUniform3iv, "_emscripten_glUniform2iv": _emscripten_glUniform2iv, "_emscripten_glDisable": _emscripten_glDisable, "_glfwSetCharCallback": _glfwSetCharCallback, "emscriptenWebGLGetVertexAttrib": emscriptenWebGLGetVertexAttrib, "_emscripten_glDeleteProgram": _emscripten_glDeleteProgram, "_emscripten_glDeleteRenderbuffers": _emscripten_glDeleteRenderbuffers, "_emscripten_glDrawElementsInstanced": _emscripten_glDrawElementsInstanced, "_emscripten_glVertexAttrib4f": _emscripten_glVertexAttrib4f, "___syscall6": ___syscall6, "_emscripten_glTexSubImage2D": _emscripten_glTexSubImage2D, "_emscripten_glGetProgramiv": _emscripten_glGetProgramiv, "_emscripten_glPixelStorei": _emscripten_glPixelStorei, "_glCompileShader": _glCompileShader, "_emscripten_glUniformMatrix3fv": _emscripten_glUniformMatrix3fv, "_emscripten_glDepthRange": _emscripten_glDepthRange, "_emscripten_glCompressedTexImage2D": _emscripten_glCompressedTexImage2D, "_sqrtf": _sqrtf, "_glActiveTexture": _glActiveTexture, "_glfwSwapBuffers": _glfwSwapBuffers, "_emscripten_glDepthMask": _emscripten_glDepthMask, "_glfwSetWindowIconifyCallback": _glfwSetWindowIconifyCallback, "_emscripten_glDrawBuffers": _emscripten_glDrawBuffers, "_emscripten_glLineWidth": _emscripten_glLineWidth, "_emscripten_glGetObjectParameterivARB": _emscripten_glGetObjectParameterivARB, "_emscripten_glFramebufferTexture2D": _emscripten_glFramebufferTexture2D, "_glfwSwapInterval": _glfwSwapInterval, "_glUniform1i": _glUniform1i, "_glEnableVertexAttribArray": _glEnableVertexAttribArray, "_emscripten_glStencilFunc": _emscripten_glStencilFunc, "_abort": _abort, "_emscripten_glGetUniformiv": _emscripten_glGetUniformiv, "_glDeleteBuffers": _glDeleteBuffers, "_glBufferData": _glBufferData, "_glTexImage2D": _glTexImage2D, "_emscripten_glGetShaderiv": _emscripten_glGetShaderiv, "_emscripten_glGenFramebuffers": _emscripten_glGenFramebuffers, "_emscripten_glUniformMatrix4fv": _emscripten_glUniformMatrix4fv, "_emscripten_glLoadIdentity": _emscripten_glLoadIdentity, "_glDeleteShader": _glDeleteShader, "_emscripten_glUniform1f": _emscripten_glUniform1f, "_glGetProgramiv": _glGetProgramiv, "emscriptenWebGLGetTexPixelData": emscriptenWebGLGetTexPixelData, "_emscripten_glIsRenderbuffer": _emscripten_glIsRenderbuffer, "_glfwGetTime": _glfwGetTime, "_emscripten_glRenderbufferStorage": _emscripten_glRenderbufferStorage, "_emscripten_glGetVertexAttribiv": _emscripten_glGetVertexAttribiv, "_emscripten_glBindVertexArray": _emscripten_glBindVertexArray, "_emscripten_glDrawArraysInstanced": _emscripten_glDrawArraysInstanced, "_emscripten_glCreateShader": _emscripten_glCreateShader, "_emscripten_glStencilMask": _emscripten_glStencilMask, "_emscripten_glDeleteTextures": _emscripten_glDeleteTextures, "_emscripten_glBindRenderbuffer": _emscripten_glBindRenderbuffer, "_glfwGetPrimaryMonitor": _glfwGetPrimaryMonitor, "_glLinkProgram": _glLinkProgram, "_emscripten_glVertexAttribDivisor": _emscripten_glVertexAttribDivisor, "_emscripten_glGetUniformfv": _emscripten_glGetUniformfv, "_emscripten_glGetVertexAttribfv": _emscripten_glGetVertexAttribfv, "_emscripten_glGetRenderbufferParameteriv": _emscripten_glGetRenderbufferParameteriv, "_emscripten_glDeleteFramebuffers": _emscripten_glDeleteFramebuffers, "_glGetShaderiv": _glGetShaderiv, "_emscripten_glVertexAttrib3fv": _emscripten_glVertexAttrib3fv, "_glGetUniformLocation": _glGetUniformLocation, "_emscripten_glGetInfoLogARB": _emscripten_glGetInfoLogARB, "_emscripten_glCompileShader": _emscripten_glCompileShader, "_glClear": _glClear, "_glUniform4fv": _glUniform4fv, "_emscripten_glFrustum": _emscripten_glFrustum, "_emscripten_glDepthRangef": _emscripten_glDepthRangef, "_sinf": _sinf, "__exit": __exit, "_glfwTerminate": _glfwTerminate, "_emscripten_glUniform3f": _emscripten_glUniform3f, "_emscripten_glStencilOp": _emscripten_glStencilOp, "_glPixelStorei": _glPixelStorei, "_emscripten_glColorMask": _emscripten_glColorMask, "_emscripten_glLinkProgram": _emscripten_glLinkProgram, "_emscripten_glBlendEquation": _emscripten_glBlendEquation, "_emscripten_glIsTexture": _emscripten_glIsTexture, "_pthread_self": _pthread_self, "_emscripten_glVertexAttrib1fv": _emscripten_glVertexAttrib1fv, "_emscripten_glBindTexture": _emscripten_glBindTexture, "_glfwSetMouseButtonCallback": _glfwSetMouseButtonCallback, "_glfwGetCursorPos": _glfwGetCursorPos, "_emscripten_glActiveTexture": _emscripten_glActiveTexture, "_emscripten_glDeleteBuffers": _emscripten_glDeleteBuffers, "___syscall54": ___syscall54, "___unlock": ___unlock, "_emscripten_glBufferSubData": _emscripten_glBufferSubData, "_emscripten_glColorPointer": _emscripten_glColorPointer, "_emscripten_set_main_loop": _emscripten_set_main_loop, "_emscripten_glGetProgramInfoLog": _emscripten_glGetProgramInfoLog, "_glfwWindowHint": _glfwWindowHint, "_emscripten_glIsShader": _emscripten_glIsShader, "_emscripten_glUniform4fv": _emscripten_glUniform4fv, "_emscripten_glGenVertexArrays": _emscripten_glGenVertexArrays, "_cosf": _cosf, "_glfwSetKeyCallback": _glfwSetKeyCallback, "_emscripten_glClearColor": _emscripten_glClearColor, "_emscripten_glCreateProgram": _emscripten_glCreateProgram, "_emscripten_glCopyTexSubImage2D": _emscripten_glCopyTexSubImage2D, "_emscripten_glGetAttribLocation": _emscripten_glGetAttribLocation, "_glTexParameteri": _glTexParameteri, "_emscripten_glBindBuffer": _emscripten_glBindBuffer, "_emscripten_glGetFloatv": _emscripten_glGetFloatv, "_emscripten_glDetachShader": _emscripten_glDetachShader, "_glClearColor": _glClearColor, "_glCreateShader": _glCreateShader, "_glfwSetCursorEnterCallback": _glfwSetCursorEnterCallback, "_emscripten_glCopyTexImage2D": _emscripten_glCopyTexImage2D, "_emscripten_glTexImage2D": _emscripten_glTexImage2D, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "cttz_i8": cttz_i8 };
// EMSCRIPTEN_START_ASM
var asm = (function(global, env, buffer) {
  'use asm';
  
  
  var HEAP8 = new global.Int8Array(buffer);
  var HEAP16 = new global.Int16Array(buffer);
  var HEAP32 = new global.Int32Array(buffer);
  var HEAPU8 = new global.Uint8Array(buffer);
  var HEAPU16 = new global.Uint16Array(buffer);
  var HEAPU32 = new global.Uint32Array(buffer);
  var HEAPF32 = new global.Float32Array(buffer);
  var HEAPF64 = new global.Float64Array(buffer);


  var STACKTOP=env.STACKTOP|0;
  var STACK_MAX=env.STACK_MAX|0;
  var tempDoublePtr=env.tempDoublePtr|0;
  var ABORT=env.ABORT|0;
  var cttz_i8=env.cttz_i8|0;

  var __THREW__ = 0;
  var threwValue = 0;
  var setjmpId = 0;
  var undef = 0;
  var nan = global.NaN, inf = global.Infinity;
  var tempInt = 0, tempBigInt = 0, tempBigIntP = 0, tempBigIntS = 0, tempBigIntR = 0.0, tempBigIntI = 0, tempBigIntD = 0, tempValue = 0, tempDouble = 0.0;

  var tempRet0 = 0;
  var tempRet1 = 0;
  var tempRet2 = 0;
  var tempRet3 = 0;
  var tempRet4 = 0;
  var tempRet5 = 0;
  var tempRet6 = 0;
  var tempRet7 = 0;
  var tempRet8 = 0;
  var tempRet9 = 0;
  var Math_floor=global.Math.floor;
  var Math_abs=global.Math.abs;
  var Math_sqrt=global.Math.sqrt;
  var Math_pow=global.Math.pow;
  var Math_cos=global.Math.cos;
  var Math_sin=global.Math.sin;
  var Math_tan=global.Math.tan;
  var Math_acos=global.Math.acos;
  var Math_asin=global.Math.asin;
  var Math_atan=global.Math.atan;
  var Math_atan2=global.Math.atan2;
  var Math_exp=global.Math.exp;
  var Math_log=global.Math.log;
  var Math_ceil=global.Math.ceil;
  var Math_imul=global.Math.imul;
  var Math_min=global.Math.min;
  var Math_clz32=global.Math.clz32;
  var abort=env.abort;
  var assert=env.assert;
  var nullFunc_viiiii=env.nullFunc_viiiii;
  var nullFunc_vd=env.nullFunc_vd;
  var nullFunc_vid=env.nullFunc_vid;
  var nullFunc_vi=env.nullFunc_vi;
  var nullFunc_vii=env.nullFunc_vii;
  var nullFunc_ii=env.nullFunc_ii;
  var nullFunc_viddd=env.nullFunc_viddd;
  var nullFunc_vidd=env.nullFunc_vidd;
  var nullFunc_iiii=env.nullFunc_iiii;
  var nullFunc_viiiiiiii=env.nullFunc_viiiiiiii;
  var nullFunc_viiiiii=env.nullFunc_viiiiii;
  var nullFunc_viii=env.nullFunc_viii;
  var nullFunc_vidddd=env.nullFunc_vidddd;
  var nullFunc_vdi=env.nullFunc_vdi;
  var nullFunc_viiiiiii=env.nullFunc_viiiiiii;
  var nullFunc_viiiiiiiii=env.nullFunc_viiiiiiiii;
  var nullFunc_iii=env.nullFunc_iii;
  var nullFunc_i=env.nullFunc_i;
  var nullFunc_vdddddd=env.nullFunc_vdddddd;
  var nullFunc_vdddd=env.nullFunc_vdddd;
  var nullFunc_vdd=env.nullFunc_vdd;
  var nullFunc_v=env.nullFunc_v;
  var nullFunc_viid=env.nullFunc_viid;
  var nullFunc_viiii=env.nullFunc_viiii;
  var invoke_viiiii=env.invoke_viiiii;
  var invoke_vd=env.invoke_vd;
  var invoke_vid=env.invoke_vid;
  var invoke_vi=env.invoke_vi;
  var invoke_vii=env.invoke_vii;
  var invoke_ii=env.invoke_ii;
  var invoke_viddd=env.invoke_viddd;
  var invoke_vidd=env.invoke_vidd;
  var invoke_iiii=env.invoke_iiii;
  var invoke_viiiiiiii=env.invoke_viiiiiiii;
  var invoke_viiiiii=env.invoke_viiiiii;
  var invoke_viii=env.invoke_viii;
  var invoke_vidddd=env.invoke_vidddd;
  var invoke_vdi=env.invoke_vdi;
  var invoke_viiiiiii=env.invoke_viiiiiii;
  var invoke_viiiiiiiii=env.invoke_viiiiiiiii;
  var invoke_iii=env.invoke_iii;
  var invoke_i=env.invoke_i;
  var invoke_vdddddd=env.invoke_vdddddd;
  var invoke_vdddd=env.invoke_vdddd;
  var invoke_vdd=env.invoke_vdd;
  var invoke_v=env.invoke_v;
  var invoke_viid=env.invoke_viid;
  var invoke_viiii=env.invoke_viiii;
  var _emscripten_glGetTexParameterfv=env._emscripten_glGetTexParameterfv;
  var _glUseProgram=env._glUseProgram;
  var _emscripten_glShaderSource=env._emscripten_glShaderSource;
  var _glfwCreateWindow=env._glfwCreateWindow;
  var _emscripten_glReleaseShaderCompiler=env._emscripten_glReleaseShaderCompiler;
  var _emscripten_glBlendFuncSeparate=env._emscripten_glBlendFuncSeparate;
  var _emscripten_glVertexAttribPointer=env._emscripten_glVertexAttribPointer;
  var _emscripten_glGetIntegerv=env._emscripten_glGetIntegerv;
  var _emscripten_glCullFace=env._emscripten_glCullFace;
  var _emscripten_glIsProgram=env._emscripten_glIsProgram;
  var _emscripten_glStencilMaskSeparate=env._emscripten_glStencilMaskSeparate;
  var _emscripten_glViewport=env._emscripten_glViewport;
  var _emscripten_glFrontFace=env._emscripten_glFrontFace;
  var _eglGetProcAddress=env._eglGetProcAddress;
  var _glDeleteProgram=env._glDeleteProgram;
  var _emscripten_glUniform3fv=env._emscripten_glUniform3fv;
  var _emscripten_glPolygonOffset=env._emscripten_glPolygonOffset;
  var _emscripten_glUseProgram=env._emscripten_glUseProgram;
  var _emscripten_glBlendColor=env._emscripten_glBlendColor;
  var _glBindBuffer=env._glBindBuffer;
  var _emscripten_glDepthFunc=env._emscripten_glDepthFunc;
  var _glGetShaderInfoLog=env._glGetShaderInfoLog;
  var _glDrawArrays=env._glDrawArrays;
  var _emscripten_set_main_loop_timing=env._emscripten_set_main_loop_timing;
  var _sbrk=env._sbrk;
  var _glBlendFunc=env._glBlendFunc;
  var _emscripten_glDisableVertexAttribArray=env._emscripten_glDisableVertexAttribArray;
  var _glGetAttribLocation=env._glGetAttribLocation;
  var _glDisableVertexAttribArray=env._glDisableVertexAttribArray;
  var _emscripten_memcpy_big=env._emscripten_memcpy_big;
  var _sysconf=env._sysconf;
  var _emscripten_glSampleCoverage=env._emscripten_glSampleCoverage;
  var _emscripten_glVertexPointer=env._emscripten_glVertexPointer;
  var _emscripten_glBlendEquationSeparate=env._emscripten_glBlendEquationSeparate;
  var emscriptenWebGLComputeImageSize=env.emscriptenWebGLComputeImageSize;
  var _emscripten_glGetBooleanv=env._emscripten_glGetBooleanv;
  var _emscripten_glGetShaderSource=env._emscripten_glGetShaderSource;
  var _llvm_stacksave=env._llvm_stacksave;
  var _emscripten_glUniform1i=env._emscripten_glUniform1i;
  var _emscripten_glGenBuffers=env._emscripten_glGenBuffers;
  var _emscripten_glDeleteObjectARB=env._emscripten_glDeleteObjectARB;
  var _glfwSetWindowSizeCallback=env._glfwSetWindowSizeCallback;
  var _emscripten_glGetShaderPrecisionFormat=env._emscripten_glGetShaderPrecisionFormat;
  var _glfwInit=env._glfwInit;
  var _glGenBuffers=env._glGenBuffers;
  var _glShaderSource=env._glShaderSource;
  var _emscripten_glGetString=env._emscripten_glGetString;
  var _emscripten_glIsFramebuffer=env._emscripten_glIsFramebuffer;
  var _emscripten_glIsEnabled=env._emscripten_glIsEnabled;
  var _emscripten_glScissor=env._emscripten_glScissor;
  var _emscripten_glVertexAttrib4fv=env._emscripten_glVertexAttrib4fv;
  var _emscripten_glTexParameteriv=env._emscripten_glTexParameteriv;
  var _pthread_cleanup_push=env._pthread_cleanup_push;
  var _emscripten_glBindProgramARB=env._emscripten_glBindProgramARB;
  var _emscripten_glStencilOpSeparate=env._emscripten_glStencilOpSeparate;
  var _emscripten_glHint=env._emscripten_glHint;
  var _emscripten_glFramebufferRenderbuffer=env._emscripten_glFramebufferRenderbuffer;
  var ___syscall140=env.___syscall140;
  var _glfwSetErrorCallback=env._glfwSetErrorCallback;
  var _glfwDefaultWindowHints=env._glfwDefaultWindowHints;
  var _glfwDestroyWindow=env._glfwDestroyWindow;
  var _emscripten_glVertexAttrib1f=env._emscripten_glVertexAttrib1f;
  var _pthread_cleanup_pop=env._pthread_cleanup_pop;
  var _emscripten_glAttachShader=env._emscripten_glAttachShader;
  var _glVertexAttribPointer=env._glVertexAttribPointer;
  var _emscripten_glUniform2i=env._emscripten_glUniform2i;
  var _emscripten_glUniform2f=env._emscripten_glUniform2f;
  var _emscripten_glTexParameterfv=env._emscripten_glTexParameterfv;
  var _emscripten_glIsBuffer=env._emscripten_glIsBuffer;
  var _emscripten_glUniformMatrix2fv=env._emscripten_glUniformMatrix2fv;
  var _glGetProgramInfoLog=env._glGetProgramInfoLog;
  var _glfwSetScrollCallback=env._glfwSetScrollCallback;
  var _emscripten_glTexParameterf=env._emscripten_glTexParameterf;
  var _emscripten_glGetAttachedShaders=env._emscripten_glGetAttachedShaders;
  var _emscripten_glGenTextures=env._emscripten_glGenTextures;
  var _emscripten_glTexParameteri=env._emscripten_glTexParameteri;
  var _llvm_stackrestore=env._llvm_stackrestore;
  var _glfwMakeContextCurrent=env._glfwMakeContextCurrent;
  var _emscripten_glClear=env._emscripten_glClear;
  var _glDrawElements=env._glDrawElements;
  var _glBufferSubData=env._glBufferSubData;
  var _emscripten_glValidateProgram=env._emscripten_glValidateProgram;
  var _emscripten_glVertexAttrib2fv=env._emscripten_glVertexAttrib2fv;
  var _glViewport=env._glViewport;
  var _emscripten_glUniform4iv=env._emscripten_glUniform4iv;
  var _emscripten_glGetTexParameteriv=env._emscripten_glGetTexParameteriv;
  var ___setErrNo=env.___setErrNo;
  var _emscripten_glDrawArrays=env._emscripten_glDrawArrays;
  var _emscripten_glBindAttribLocation=env._emscripten_glBindAttribLocation;
  var _glDeleteTextures=env._glDeleteTextures;
  var _glDepthFunc=env._glDepthFunc;
  var _emscripten_glClientActiveTexture=env._emscripten_glClientActiveTexture;
  var _emscripten_glVertexAttrib2f=env._emscripten_glVertexAttrib2f;
  var _emscripten_glFlush=env._emscripten_glFlush;
  var _emscripten_glUniform4i=env._emscripten_glUniform4i;
  var _emscripten_glCheckFramebufferStatus=env._emscripten_glCheckFramebufferStatus;
  var _emscripten_glGenerateMipmap=env._emscripten_glGenerateMipmap;
  var _emscripten_glGetError=env._emscripten_glGetError;
  var _emscripten_glClearDepthf=env._emscripten_glClearDepthf;
  var _emscripten_glBufferData=env._emscripten_glBufferData;
  var _emscripten_glUniform3i=env._emscripten_glUniform3i;
  var _emscripten_glRotatef=env._emscripten_glRotatef;
  var _emscripten_glDeleteShader=env._emscripten_glDeleteShader;
  var _glEnable=env._glEnable;
  var _glGenTextures=env._glGenTextures;
  var _emscripten_glMatrixMode=env._emscripten_glMatrixMode;
  var _glGetString=env._glGetString;
  var _emscripten_glClearStencil=env._emscripten_glClearStencil;
  var _emscripten_glGetUniformLocation=env._emscripten_glGetUniformLocation;
  var emscriptenWebGLGet=env.emscriptenWebGLGet;
  var _emscripten_glGetBufferParameteriv=env._emscripten_glGetBufferParameteriv;
  var _emscripten_glEnableVertexAttribArray=env._emscripten_glEnableVertexAttribArray;
  var _eglWaitClient=env._eglWaitClient;
  var _emscripten_get_now=env._emscripten_get_now;
  var _emscripten_glNormalPointer=env._emscripten_glNormalPointer;
  var _glAttachShader=env._glAttachShader;
  var _emscripten_glTexCoordPointer=env._emscripten_glTexCoordPointer;
  var _emscripten_glEnable=env._emscripten_glEnable;
  var _glCreateProgram=env._glCreateProgram;
  var _glUniformMatrix4fv=env._glUniformMatrix4fv;
  var _emscripten_glClearDepth=env._emscripten_glClearDepth;
  var ___lock=env.___lock;
  var _emscripten_glBindFramebuffer=env._emscripten_glBindFramebuffer;
  var _emscripten_glReadPixels=env._emscripten_glReadPixels;
  var _emscripten_glStencilFuncSeparate=env._emscripten_glStencilFuncSeparate;
  var _emscripten_glVertexAttrib3f=env._emscripten_glVertexAttrib3f;
  var _time=env._time;
  var _glBindFramebuffer=env._glBindFramebuffer;
  var ___syscall146=env.___syscall146;
  var _emscripten_glGetFramebufferAttachmentParameteriv=env._emscripten_glGetFramebufferAttachmentParameteriv;
  var _exit=env._exit;
  var _emscripten_asm_const_2=env._emscripten_asm_const_2;
  var _emscripten_glEnableClientState=env._emscripten_glEnableClientState;
  var _emscripten_glGetActiveAttrib=env._emscripten_glGetActiveAttrib;
  var _emscripten_glDrawRangeElements=env._emscripten_glDrawRangeElements;
  var _emscripten_glGetPointerv=env._emscripten_glGetPointerv;
  var _glDeleteFramebuffers=env._glDeleteFramebuffers;
  var _glfwPollEvents=env._glfwPollEvents;
  var _emscripten_glUniform4f=env._emscripten_glUniform4f;
  var _emscripten_glUniform2fv=env._emscripten_glUniform2fv;
  var _emscripten_glLoadMatrixf=env._emscripten_glLoadMatrixf;
  var _emscripten_glFinish=env._emscripten_glFinish;
  var _emscripten_glShaderBinary=env._emscripten_glShaderBinary;
  var _emscripten_glDrawElements=env._emscripten_glDrawElements;
  var _emscripten_glBlendFunc=env._emscripten_glBlendFunc;
  var _emscripten_glGetShaderInfoLog=env._emscripten_glGetShaderInfoLog;
  var _glCompressedTexImage2D=env._glCompressedTexImage2D;
  var _emscripten_glUniform1iv=env._emscripten_glUniform1iv;
  var _emscripten_glGetVertexAttribPointerv=env._emscripten_glGetVertexAttribPointerv;
  var _emscripten_glCompressedTexSubImage2D=env._emscripten_glCompressedTexSubImage2D;
  var emscriptenWebGLGetUniform=env.emscriptenWebGLGetUniform;
  var _emscripten_glGenRenderbuffers=env._emscripten_glGenRenderbuffers;
  var _emscripten_glDeleteVertexArrays=env._emscripten_glDeleteVertexArrays;
  var _glfwSetWindowShouldClose=env._glfwSetWindowShouldClose;
  var _emscripten_glUniform1fv=env._emscripten_glUniform1fv;
  var _emscripten_glGetActiveUniform=env._emscripten_glGetActiveUniform;
  var _glBindTexture=env._glBindTexture;
  var _emscripten_glUniform3iv=env._emscripten_glUniform3iv;
  var _emscripten_glUniform2iv=env._emscripten_glUniform2iv;
  var _emscripten_glDisable=env._emscripten_glDisable;
  var _glfwSetCharCallback=env._glfwSetCharCallback;
  var emscriptenWebGLGetVertexAttrib=env.emscriptenWebGLGetVertexAttrib;
  var _emscripten_glDeleteProgram=env._emscripten_glDeleteProgram;
  var _emscripten_glDeleteRenderbuffers=env._emscripten_glDeleteRenderbuffers;
  var _emscripten_glDrawElementsInstanced=env._emscripten_glDrawElementsInstanced;
  var _emscripten_glVertexAttrib4f=env._emscripten_glVertexAttrib4f;
  var ___syscall6=env.___syscall6;
  var _emscripten_glTexSubImage2D=env._emscripten_glTexSubImage2D;
  var _emscripten_glGetProgramiv=env._emscripten_glGetProgramiv;
  var _emscripten_glPixelStorei=env._emscripten_glPixelStorei;
  var _glCompileShader=env._glCompileShader;
  var _emscripten_glUniformMatrix3fv=env._emscripten_glUniformMatrix3fv;
  var _emscripten_glDepthRange=env._emscripten_glDepthRange;
  var _emscripten_glCompressedTexImage2D=env._emscripten_glCompressedTexImage2D;
  var _sqrtf=env._sqrtf;
  var _glActiveTexture=env._glActiveTexture;
  var _glfwSwapBuffers=env._glfwSwapBuffers;
  var _emscripten_glDepthMask=env._emscripten_glDepthMask;
  var _glfwSetWindowIconifyCallback=env._glfwSetWindowIconifyCallback;
  var _emscripten_glDrawBuffers=env._emscripten_glDrawBuffers;
  var _emscripten_glLineWidth=env._emscripten_glLineWidth;
  var _emscripten_glGetObjectParameterivARB=env._emscripten_glGetObjectParameterivARB;
  var _emscripten_glFramebufferTexture2D=env._emscripten_glFramebufferTexture2D;
  var _glfwSwapInterval=env._glfwSwapInterval;
  var _glUniform1i=env._glUniform1i;
  var _glEnableVertexAttribArray=env._glEnableVertexAttribArray;
  var _emscripten_glStencilFunc=env._emscripten_glStencilFunc;
  var _abort=env._abort;
  var _emscripten_glGetUniformiv=env._emscripten_glGetUniformiv;
  var _glDeleteBuffers=env._glDeleteBuffers;
  var _glBufferData=env._glBufferData;
  var _glTexImage2D=env._glTexImage2D;
  var _emscripten_glGetShaderiv=env._emscripten_glGetShaderiv;
  var _emscripten_glGenFramebuffers=env._emscripten_glGenFramebuffers;
  var _emscripten_glUniformMatrix4fv=env._emscripten_glUniformMatrix4fv;
  var _emscripten_glLoadIdentity=env._emscripten_glLoadIdentity;
  var _glDeleteShader=env._glDeleteShader;
  var _emscripten_glUniform1f=env._emscripten_glUniform1f;
  var _glGetProgramiv=env._glGetProgramiv;
  var emscriptenWebGLGetTexPixelData=env.emscriptenWebGLGetTexPixelData;
  var _emscripten_glIsRenderbuffer=env._emscripten_glIsRenderbuffer;
  var _glfwGetTime=env._glfwGetTime;
  var _emscripten_glRenderbufferStorage=env._emscripten_glRenderbufferStorage;
  var _emscripten_glGetVertexAttribiv=env._emscripten_glGetVertexAttribiv;
  var _emscripten_glBindVertexArray=env._emscripten_glBindVertexArray;
  var _emscripten_glDrawArraysInstanced=env._emscripten_glDrawArraysInstanced;
  var _emscripten_glCreateShader=env._emscripten_glCreateShader;
  var _emscripten_glStencilMask=env._emscripten_glStencilMask;
  var _emscripten_glDeleteTextures=env._emscripten_glDeleteTextures;
  var _emscripten_glBindRenderbuffer=env._emscripten_glBindRenderbuffer;
  var _glfwGetPrimaryMonitor=env._glfwGetPrimaryMonitor;
  var _glLinkProgram=env._glLinkProgram;
  var _emscripten_glVertexAttribDivisor=env._emscripten_glVertexAttribDivisor;
  var _emscripten_glGetUniformfv=env._emscripten_glGetUniformfv;
  var _emscripten_glGetVertexAttribfv=env._emscripten_glGetVertexAttribfv;
  var _emscripten_glGetRenderbufferParameteriv=env._emscripten_glGetRenderbufferParameteriv;
  var _emscripten_glDeleteFramebuffers=env._emscripten_glDeleteFramebuffers;
  var _glGetShaderiv=env._glGetShaderiv;
  var _emscripten_glVertexAttrib3fv=env._emscripten_glVertexAttrib3fv;
  var _glGetUniformLocation=env._glGetUniformLocation;
  var _emscripten_glGetInfoLogARB=env._emscripten_glGetInfoLogARB;
  var _emscripten_glCompileShader=env._emscripten_glCompileShader;
  var _glClear=env._glClear;
  var _glUniform4fv=env._glUniform4fv;
  var _emscripten_glFrustum=env._emscripten_glFrustum;
  var _emscripten_glDepthRangef=env._emscripten_glDepthRangef;
  var _sinf=env._sinf;
  var __exit=env.__exit;
  var _glfwTerminate=env._glfwTerminate;
  var _emscripten_glUniform3f=env._emscripten_glUniform3f;
  var _emscripten_glStencilOp=env._emscripten_glStencilOp;
  var _glPixelStorei=env._glPixelStorei;
  var _emscripten_glColorMask=env._emscripten_glColorMask;
  var _emscripten_glLinkProgram=env._emscripten_glLinkProgram;
  var _emscripten_glBlendEquation=env._emscripten_glBlendEquation;
  var _emscripten_glIsTexture=env._emscripten_glIsTexture;
  var _pthread_self=env._pthread_self;
  var _emscripten_glVertexAttrib1fv=env._emscripten_glVertexAttrib1fv;
  var _emscripten_glBindTexture=env._emscripten_glBindTexture;
  var _glfwSetMouseButtonCallback=env._glfwSetMouseButtonCallback;
  var _glfwGetCursorPos=env._glfwGetCursorPos;
  var _emscripten_glActiveTexture=env._emscripten_glActiveTexture;
  var _emscripten_glDeleteBuffers=env._emscripten_glDeleteBuffers;
  var ___syscall54=env.___syscall54;
  var ___unlock=env.___unlock;
  var _emscripten_glBufferSubData=env._emscripten_glBufferSubData;
  var _emscripten_glColorPointer=env._emscripten_glColorPointer;
  var _emscripten_set_main_loop=env._emscripten_set_main_loop;
  var _emscripten_glGetProgramInfoLog=env._emscripten_glGetProgramInfoLog;
  var _glfwWindowHint=env._glfwWindowHint;
  var _emscripten_glIsShader=env._emscripten_glIsShader;
  var _emscripten_glUniform4fv=env._emscripten_glUniform4fv;
  var _emscripten_glGenVertexArrays=env._emscripten_glGenVertexArrays;
  var _cosf=env._cosf;
  var _glfwSetKeyCallback=env._glfwSetKeyCallback;
  var _emscripten_glClearColor=env._emscripten_glClearColor;
  var _emscripten_glCreateProgram=env._emscripten_glCreateProgram;
  var _emscripten_glCopyTexSubImage2D=env._emscripten_glCopyTexSubImage2D;
  var _emscripten_glGetAttribLocation=env._emscripten_glGetAttribLocation;
  var _glTexParameteri=env._glTexParameteri;
  var _emscripten_glBindBuffer=env._emscripten_glBindBuffer;
  var _emscripten_glGetFloatv=env._emscripten_glGetFloatv;
  var _emscripten_glDetachShader=env._emscripten_glDetachShader;
  var _glClearColor=env._glClearColor;
  var _glCreateShader=env._glCreateShader;
  var _glfwSetCursorEnterCallback=env._glfwSetCursorEnterCallback;
  var _emscripten_glCopyTexImage2D=env._emscripten_glCopyTexImage2D;
  var _emscripten_glTexImage2D=env._emscripten_glTexImage2D;
  var tempFloat = 0.0;

// EMSCRIPTEN_START_FUNCS
function stackAlloc(size) {
  size = size|0;
  var ret = 0;
  ret = STACKTOP;
  STACKTOP = (STACKTOP + size)|0;
  STACKTOP = (STACKTOP + 15)&-16;
if ((STACKTOP|0) >= (STACK_MAX|0)) abort();

  return ret|0;
}
function stackSave() {
  return STACKTOP|0;
}
function stackRestore(top) {
  top = top|0;
  STACKTOP = top;
}
function establishStackSpace(stackBase, stackMax) {
  stackBase = stackBase|0;
  stackMax = stackMax|0;
  STACKTOP = stackBase;
  STACK_MAX = stackMax;
}

function setThrew(threw, value) {
  threw = threw|0;
  value = value|0;
  if ((__THREW__|0) == 0) {
    __THREW__ = threw;
    threwValue = value;
  }
}
function copyTempFloat(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
}
function copyTempDouble(ptr) {
  ptr = ptr|0;
  HEAP8[tempDoublePtr>>0] = HEAP8[ptr>>0];
  HEAP8[tempDoublePtr+1>>0] = HEAP8[ptr+1>>0];
  HEAP8[tempDoublePtr+2>>0] = HEAP8[ptr+2>>0];
  HEAP8[tempDoublePtr+3>>0] = HEAP8[ptr+3>>0];
  HEAP8[tempDoublePtr+4>>0] = HEAP8[ptr+4>>0];
  HEAP8[tempDoublePtr+5>>0] = HEAP8[ptr+5>>0];
  HEAP8[tempDoublePtr+6>>0] = HEAP8[ptr+6>>0];
  HEAP8[tempDoublePtr+7>>0] = HEAP8[ptr+7>>0];
}

function setTempRet0(value) {
  value = value|0;
  tempRet0 = value;
}
function getTempRet0() {
  return tempRet0|0;
}

function _main() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 _InitWindow(800,450,5660);
 HEAP32[92>>2] = 0;
 _InitLogoScreen();
 _emscripten_set_main_loop((1|0),0,1);
 _CloseWindow();
 return 0;
}
function _UpdateDrawFrame() {
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy = sp + 4|0;
 $0 = sp;
 $1 = HEAP32[76>>2]|0;
 $2 = ($1|0)==(0);
 L1: do {
  if ($2) {
   $3 = HEAP32[92>>2]|0;
   switch ($3|0) {
   case 0:  {
    _UpdateLogoScreen();
    $4 = (_FinishLogoScreen()|0);
    $5 = ($4|0)==(0);
    if ($5) {
     break L1;
    }
    _TransitionToScreen(1);
    break L1;
    break;
   }
   case 1:  {
    _UpdateTitleScreen();
    $6 = (_FinishTitleScreen()|0);
    $7 = ($6|0)==(1);
    if ($7) {
     _TransitionToScreen(2);
     break L1;
    }
    $8 = (_FinishTitleScreen()|0);
    $9 = ($8|0)==(2);
    if (!($9)) {
     break L1;
    }
    _TransitionToScreen(3);
    break L1;
    break;
   }
   case 2:  {
    $10 = (_FinishOptionsScreen()|0);
    $11 = ($10|0)==(0);
    if ($11) {
     break L1;
    }
    _TransitionToScreen(1);
    break L1;
    break;
   }
   case 3:  {
    _UpdateGameplayScreen();
    $12 = (_FinishGameplayScreen()|0);
    $13 = ($12|0)==(0);
    if ($13) {
     break L1;
    }
    _TransitionToScreen(4);
    break L1;
    break;
   }
   case 4:  {
    _UpdateEndingScreen();
    $14 = (_FinishEndingScreen()|0);
    $15 = ($14|0)==(0);
    if ($15) {
     break L1;
    }
    _TransitionToScreen(1);
    break L1;
    break;
   }
   default: {
    break L1;
   }
   }
  } else {
   _UpdateTransition();
  }
 } while(0);
 _BeginDrawing();
 HEAP8[$0>>0] = -11;
 $16 = ((($0)) + 1|0);
 HEAP8[$16>>0] = -11;
 $17 = ((($0)) + 2|0);
 HEAP8[$17>>0] = -11;
 $18 = ((($0)) + 3|0);
 HEAP8[$18>>0] = -1;
 ;HEAP8[$$byval_copy>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy+3>>0]=HEAP8[$0+3>>0]|0;
 _ClearBackground($$byval_copy);
 $19 = HEAP32[92>>2]|0;
 switch ($19|0) {
 case 0:  {
  _DrawLogoScreen();
  break;
 }
 case 1:  {
  _DrawTitleScreen();
  break;
 }
 case 2:  {
  break;
 }
 case 3:  {
  _DrawGameplayScreen();
  break;
 }
 case 4:  {
  _DrawEndingScreen();
  break;
 }
 default: {
 }
 }
 $20 = HEAP32[76>>2]|0;
 $21 = ($20|0)==(0);
 if ($21) {
  _EndDrawing();
  STACKTOP = sp;return;
 }
 _DrawTransition();
 _EndDrawing();
 STACKTOP = sp;return;
}
function _TransitionToScreen($screen) {
 $screen = $screen|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[76>>2] = 1;
 $0 = HEAP32[92>>2]|0;
 HEAP32[84>>2] = $0;
 HEAP32[88>>2] = $screen;
 return;
}
function _UpdateTransition() {
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0, $7 = 0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[80>>2]|0;
 $1 = ($0|0)==(0);
 $2 = +HEAPF32[72>>2];
 if (!($1)) {
  $9 = $2 + -0.0099999997764825821;
  HEAPF32[72>>2] = $9;
  $10 = !($9 <= 0.0);
  if ($10) {
   return;
  }
  HEAPF32[72>>2] = 0.0;
  HEAP32[80>>2] = 0;
  HEAP32[76>>2] = 0;
  HEAP32[84>>2] = -1;
  HEAP32[88>>2] = -1;
  return;
 }
 $3 = $2;
 $4 = $3 + 0.01;
 $5 = $4;
 HEAPF32[72>>2] = $5;
 $6 = !($5 >= 1.0);
 if ($6) {
  return;
 }
 HEAPF32[72>>2] = 1.0;
 $7 = HEAP32[84>>2]|0;
 switch ($7|0) {
 case 0:  {
  break;
 }
 case 1:  {
  break;
 }
 case 2:  {
  break;
 }
 case 3:  {
  break;
 }
 case 4:  {
  break;
 }
 default: {
 }
 }
 $8 = HEAP32[88>>2]|0;
 switch ($8|0) {
 case 0:  {
  _InitLogoScreen();
  HEAP32[92>>2] = 0;
  break;
 }
 case 1:  {
  _InitTitleScreen();
  HEAP32[92>>2] = 1;
  break;
 }
 case 2:  {
  HEAP32[92>>2] = 2;
  break;
 }
 case 3:  {
  _InitGameplayScreen();
  HEAP32[92>>2] = 3;
  break;
 }
 case 4:  {
  _InitEndingScreen();
  HEAP32[92>>2] = 4;
  break;
 }
 default: {
 }
 }
 HEAP32[80>>2] = 1;
 return;
}
function _DrawTransition() {
 var $$byval_copy1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy1 = sp + 8|0;
 $0 = sp + 4|0;
 $1 = sp;
 $2 = (_GetScreenWidth()|0);
 $3 = (_GetScreenHeight()|0);
 HEAP8[$1>>0] = 0;
 $4 = ((($1)) + 1|0);
 HEAP8[$4>>0] = 0;
 $5 = ((($1)) + 2|0);
 HEAP8[$5>>0] = 0;
 $6 = ((($1)) + 3|0);
 HEAP8[$6>>0] = -1;
 $7 = +HEAPF32[72>>2];
 ;HEAP8[$$byval_copy1>>0]=HEAP8[$1>>0]|0;HEAP8[$$byval_copy1+1>>0]=HEAP8[$1+1>>0]|0;HEAP8[$$byval_copy1+2>>0]=HEAP8[$1+2>>0]|0;HEAP8[$$byval_copy1+3>>0]=HEAP8[$1+3>>0]|0;
 _Fade($0,$$byval_copy1,$7);
 ;HEAP8[$$byval_copy1>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy1+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy1+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy1+3>>0]=HEAP8[$0+3>>0]|0;
 _DrawRectangle(0,0,$2,$3,$$byval_copy1);
 STACKTOP = sp;return;
}
function _InitLogoScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[96>>2] = 0;
 HEAP32[100>>2] = 0;
 return;
}
function _UpdateLogoScreen() {
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[96>>2]|0;
 $1 = (($0) + 1)|0;
 HEAP32[96>>2] = $1;
 $2 = ($0|0)>(119);
 if (!($2)) {
  return;
 }
 HEAP32[100>>2] = 1;
 return;
}
function _DrawLogoScreen() {
 var $$byval_copy1 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy1 = sp + 8|0;
 $0 = sp + 4|0;
 $1 = sp;
 HEAP8[$0>>0] = -56;
 $2 = ((($0)) + 1|0);
 HEAP8[$2>>0] = -56;
 $3 = ((($0)) + 2|0);
 HEAP8[$3>>0] = -56;
 $4 = ((($0)) + 3|0);
 HEAP8[$4>>0] = -1;
 ;HEAP8[$$byval_copy1>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy1+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy1+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy1+3>>0]=HEAP8[$0+3>>0]|0;
 _DrawText(5690,20,20,40,$$byval_copy1);
 HEAP8[$1>>0] = -126;
 $5 = ((($1)) + 1|0);
 HEAP8[$5>>0] = -126;
 $6 = ((($1)) + 2|0);
 HEAP8[$6>>0] = -126;
 $7 = ((($1)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy1>>0]=HEAP8[$1>>0]|0;HEAP8[$$byval_copy1+1>>0]=HEAP8[$1+1>>0]|0;HEAP8[$$byval_copy1+2>>0]=HEAP8[$1+2>>0]|0;HEAP8[$$byval_copy1+3>>0]=HEAP8[$1+3>>0]|0;
 _DrawText(5702,290,220,20,$$byval_copy1);
 STACKTOP = sp;return;
}
function _UnloadLogoScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _FinishLogoScreen() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[100>>2]|0;
 return ($0|0);
}
function _InitTitleScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[104>>2] = 0;
 return;
}
function _UpdateTitleScreen() {
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_IsKeyPressed(257)|0);
 $1 = ($0|0)==(0);
 if ($1) {
  return;
 }
 HEAP32[104>>2] = 2;
 return;
}
function _DrawTitleScreen() {
 var $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy2 = sp + 12|0;
 $0 = sp + 8|0;
 $1 = sp + 4|0;
 $2 = sp;
 $3 = (_GetScreenWidth()|0);
 $4 = (_GetScreenHeight()|0);
 HEAP8[$0>>0] = 0;
 $5 = ((($0)) + 1|0);
 HEAP8[$5>>0] = -28;
 $6 = ((($0)) + 2|0);
 HEAP8[$6>>0] = 48;
 $7 = ((($0)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$0+3>>0]|0;
 _DrawRectangle(0,0,$3,$4,$$byval_copy2);
 HEAP8[$1>>0] = 0;
 $8 = ((($1)) + 1|0);
 HEAP8[$8>>0] = 117;
 $9 = ((($1)) + 2|0);
 HEAP8[$9>>0] = 44;
 $10 = ((($1)) + 3|0);
 HEAP8[$10>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$1>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$1+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$1+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$1+3>>0]|0;
 _DrawText(5724,20,20,40,$$byval_copy2);
 HEAP8[$2>>0] = 0;
 $11 = ((($2)) + 1|0);
 HEAP8[$11>>0] = 117;
 $12 = ((($2)) + 2|0);
 HEAP8[$12>>0] = 44;
 $13 = ((($2)) + 3|0);
 HEAP8[$13>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$2>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$2+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$2+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$2+3>>0]|0;
 _DrawText(5737,160,220,20,$$byval_copy2);
 STACKTOP = sp;return;
}
function _UnloadTitleScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _FinishTitleScreen() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[104>>2]|0;
 return ($0|0);
}
function _InitOptionsScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _UpdateOptionsScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _DrawOptionsScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _UnloadOptionsScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _FinishOptionsScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}
function _InitGameplayScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[108>>2] = 0;
 return;
}
function _UpdateGameplayScreen() {
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_IsKeyPressed(257)|0);
 $1 = ($0|0)==(0);
 if ($1) {
  return;
 }
 HEAP32[108>>2] = 1;
 return;
}
function _DrawGameplayScreen() {
 var $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy2 = sp + 12|0;
 $0 = sp + 8|0;
 $1 = sp + 4|0;
 $2 = sp;
 $3 = (_GetScreenWidth()|0);
 $4 = (_GetScreenHeight()|0);
 HEAP8[$0>>0] = -56;
 $5 = ((($0)) + 1|0);
 HEAP8[$5>>0] = 122;
 $6 = ((($0)) + 2|0);
 HEAP8[$6>>0] = -1;
 $7 = ((($0)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$0+3>>0]|0;
 _DrawRectangle(0,0,$3,$4,$$byval_copy2);
 HEAP8[$1>>0] = -66;
 $8 = ((($1)) + 1|0);
 HEAP8[$8>>0] = 33;
 $9 = ((($1)) + 2|0);
 HEAP8[$9>>0] = 55;
 $10 = ((($1)) + 3|0);
 HEAP8[$10>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$1>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$1+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$1+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$1+3>>0]|0;
 _DrawText(5776,20,20,40,$$byval_copy2);
 HEAP8[$2>>0] = -66;
 $11 = ((($2)) + 1|0);
 HEAP8[$11>>0] = 33;
 $12 = ((($2)) + 2|0);
 HEAP8[$12>>0] = 55;
 $13 = ((($2)) + 3|0);
 HEAP8[$13>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$2>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$2+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$2+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$2+3>>0]|0;
 _DrawText(5792,170,220,20,$$byval_copy2);
 STACKTOP = sp;return;
}
function _UnloadGameplayScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _FinishGameplayScreen() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[108>>2]|0;
 return ($0|0);
}
function _InitEndingScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[112>>2] = 0;
 return;
}
function _UpdateEndingScreen() {
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_IsKeyPressed(257)|0);
 $1 = ($0|0)==(0);
 if ($1) {
  return;
 }
 HEAP32[112>>2] = 1;
 return;
}
function _DrawEndingScreen() {
 var $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy2 = sp + 12|0;
 $0 = sp + 8|0;
 $1 = sp + 4|0;
 $2 = sp;
 $3 = (_GetScreenWidth()|0);
 $4 = (_GetScreenHeight()|0);
 HEAP8[$0>>0] = 0;
 $5 = ((($0)) + 1|0);
 HEAP8[$5>>0] = 121;
 $6 = ((($0)) + 2|0);
 HEAP8[$6>>0] = -15;
 $7 = ((($0)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$0+3>>0]|0;
 _DrawRectangle(0,0,$3,$4,$$byval_copy2);
 HEAP8[$1>>0] = 0;
 $8 = ((($1)) + 1|0);
 HEAP8[$8>>0] = 82;
 $9 = ((($1)) + 2|0);
 HEAP8[$9>>0] = -84;
 $10 = ((($1)) + 3|0);
 HEAP8[$10>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$1>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$1+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$1+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$1+3>>0]|0;
 _DrawText(5829,20,20,40,$$byval_copy2);
 HEAP8[$2>>0] = 0;
 $11 = ((($2)) + 1|0);
 HEAP8[$11>>0] = 82;
 $12 = ((($2)) + 2|0);
 HEAP8[$12>>0] = -84;
 $13 = ((($2)) + 3|0);
 HEAP8[$13>>0] = -1;
 ;HEAP8[$$byval_copy2>>0]=HEAP8[$2>>0]|0;HEAP8[$$byval_copy2+1>>0]=HEAP8[$2+1>>0]|0;HEAP8[$$byval_copy2+2>>0]=HEAP8[$2+2>>0]|0;HEAP8[$$byval_copy2+3>>0]=HEAP8[$2+3>>0]|0;
 _DrawText(5843,160,220,20,$$byval_copy2);
 STACKTOP = sp;return;
}
function _UnloadEndingScreen() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _FinishEndingScreen() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[112>>2]|0;
 return ($0|0);
}
function _InitWindow($width,$height,$title) {
 $width = $width|0;
 $height = $height|0;
 $title = $title|0;
 var $0 = 0, $1 = 0, $2 = 0.0, $3 = 0, $4 = 0, $5 = 0.0, $6 = 0, $7 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 _TraceLog(0,5881,$vararg_buffer);
 HEAP32[120>>2] = $title;
 _InitDisplay($width,$height);
 _InitGraphics();
 _LoadDefaultFont();
 _InitTimer();
 $0 = HEAP32[124>>2]|0;
 $1 = (($0|0) / 2)&-1;
 $2 = (+($1|0));
 HEAPF32[8>>2] = $2;
 $3 = HEAP32[128>>2]|0;
 $4 = (($3|0) / 2)&-1;
 $5 = (+($4|0));
 HEAPF32[(12)>>2] = $5;
 $6 = HEAP32[132>>2]|0;
 $7 = ($6|0)==(0);
 if ($7) {
  STACKTOP = sp;return;
 }
 _SetTargetFPS(60);
 _LogoAnimation();
 STACKTOP = sp;return;
}
function _SetTargetFPS($fps) {
 $fps = $fps|0;
 var $0 = 0.0, $1 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = (+($fps|0));
 $1 = 1.0 / $0;
 HEAPF64[16>>3] = $1;
 $2 = $1;
 $3 = $2 * 1000.0;
 $4 = $3;
 HEAPF64[$vararg_buffer>>3] = $4;
 _TraceLog(0,5910,$vararg_buffer);
 STACKTOP = sp;return;
}
function _CloseWindow() {
 var $0 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 _UnloadDefaultFont();
 _rlglClose();
 $0 = HEAP32[136>>2]|0;
 _glfwDestroyWindow(($0|0));
 _glfwTerminate();
 _TraceLog(0,5954,$vararg_buffer);
 STACKTOP = sp;return;
}
function _GetScreenWidth() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[124>>2]|0;
 return ($0|0);
}
function _GetScreenHeight() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[128>>2]|0;
 return ($0|0);
}
function _ClearBackground($color) {
 $color = $color|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$color>>0]|0;
 $1 = ((($color)) + 1|0);
 $2 = HEAP8[$1>>0]|0;
 $3 = ((($color)) + 2|0);
 $4 = HEAP8[$3>>0]|0;
 $5 = ((($color)) + 3|0);
 $6 = HEAP8[$5>>0]|0;
 _rlClearColor($0,$2,$4,$6);
 return;
}
function _BeginDrawing() {
 var $0 = 0.0, $1 = 0.0, $2 = 0.0, $3 = 0, $4 = 0, $5 = 0, $downscaleView$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $downscaleView$byval_copy = sp;
 $0 = (+_GetTime());
 HEAPF64[24>>3] = $0;
 $1 = +HEAPF64[32>>3];
 $2 = $0 - $1;
 HEAPF64[40>>3] = $2;
 HEAPF64[32>>3] = $0;
 $3 = (_IsPosproShaderEnabled()|0);
 $4 = ($3|0)==(0);
 if (!($4)) {
  _rlEnableFBO();
 }
 _rlClearScreenBuffers();
 _rlLoadIdentity();
 dest=$downscaleView$byval_copy; src=148; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $5 = (_GetMatrixVector($downscaleView$byval_copy)|0);
 _rlMultMatrixf($5);
 STACKTOP = sp;return;
}
function _EndDrawing() {
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 _rlglDraw();
 $0 = (_IsPosproShaderEnabled()|0);
 $1 = ($0|0)==(0);
 if (!($1)) {
  _rlglDrawPostpro();
 }
 _SwapBuffers();
 _PollInputEvents();
 $2 = (+_GetTime());
 HEAPF64[24>>3] = $2;
 $3 = +HEAPF64[32>>3];
 $4 = $2 - $3;
 HEAPF64[48>>3] = $4;
 HEAPF64[32>>3] = $2;
 $5 = +HEAPF64[40>>3];
 $6 = $5 + $4;
 HEAPF64[56>>3] = $6;
 $7 = +HEAPF64[16>>3];
 $8 = $6 < $7;
 if (!($8)) {
  return;
 }
 while(1) {
  $9 = (+_GetTime());
  HEAPF64[24>>3] = $9;
  $10 = +HEAPF64[32>>3];
  $11 = $9 - $10;
  HEAPF64[32>>3] = $9;
  $12 = +HEAPF64[56>>3];
  $13 = $12 + $11;
  HEAPF64[56>>3] = $13;
  $14 = +HEAPF64[16>>3];
  $15 = $13 < $14;
  if (!($15)) {
   break;
  }
 }
 return;
}
function _Fade($agg$result,$color,$alpha) {
 $agg$result = $agg$result|0;
 $color = $color|0;
 $alpha = +$alpha;
 var $$0 = 0.0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $alpha < 0.0;
 if ($0) {
  $$0 = 0.0;
 } else {
  $1 = $alpha > 1.0;
  if ($1) {
   $$0 = 1.0;
  } else {
   $$0 = $alpha;
  }
 }
 $2 = HEAP8[$color>>0]|0;
 HEAP8[$agg$result>>0] = $2;
 $3 = ((($agg$result)) + 1|0);
 $4 = ((($color)) + 1|0);
 $5 = HEAP8[$4>>0]|0;
 HEAP8[$3>>0] = $5;
 $6 = ((($agg$result)) + 2|0);
 $7 = ((($color)) + 2|0);
 $8 = HEAP8[$7>>0]|0;
 HEAP8[$6>>0] = $8;
 $9 = ((($agg$result)) + 3|0);
 $10 = ((($color)) + 3|0);
 $11 = HEAP8[$10>>0]|0;
 $12 = $11&255;
 $13 = (+($12|0));
 $14 = $$0 * $13;
 $15 = (~~(($14))&255);
 HEAP8[$9>>0] = $15;
 return;
}
function _IsKeyPressed($key) {
 $key = $key|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $or$cond = 0, $pressed$0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (5982 + ($key)|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = (6494 + ($key)|0);
 $3 = HEAP8[$2>>0]|0;
 $4 = ($1<<24>>24)!=($3<<24>>24);
 $5 = ($1<<24>>24)==(1);
 $or$cond = $5 & $4;
 $pressed$0 = $or$cond&1;
 return ($pressed$0|0);
}
function _mystrdup($str) {
 $str = $str|0;
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_strlen($str)|0);
 $1 = (($0) + 1)|0;
 $2 = (_malloc($1)|0);
 $3 = ($2|0)==(0|0);
 if ($3) {
  $$0 = 0;
  return ($$0|0);
 }
 _memcpy(($2|0),($str|0),($1|0))|0;
 $$0 = $2;
 return ($$0|0);
}
function _rlMatrixMode($mode) {
 $mode = $mode|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 switch ($mode|0) {
 case 0:  {
  HEAP32[288>>2] = 224;
  break;
 }
 case 1:  {
  HEAP32[288>>2] = 292;
  break;
 }
 default: {
 }
 }
 HEAP32[356>>2] = $mode;
 return;
}
function _rlPushMatrix() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $vararg_buffer = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = HEAP32[360>>2]|0;
 $1 = ($0|0)==(15);
 if ($1) {
  HEAP32[$vararg_buffer>>2] = 16;
  _TraceLog(1,7012,$vararg_buffer);
 }
 $2 = HEAP32[360>>2]|0;
 $3 = (364 + ($2<<6)|0);
 $4 = HEAP32[288>>2]|0;
 dest=$3; src=$4; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _rlLoadIdentity();
 $5 = HEAP32[360>>2]|0;
 $6 = (($5) + 1)|0;
 HEAP32[360>>2] = $6;
 $7 = HEAP32[356>>2]|0;
 $8 = ($7|0)==(1);
 if (!($8)) {
  STACKTOP = sp;return;
 }
 HEAP32[1388>>2] = 1;
 STACKTOP = sp;return;
}
function _rlLoadIdentity() {
 var $0 = 0, $1 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = sp;
 $1 = HEAP32[288>>2]|0;
 _MatrixIdentity($0);
 dest=$1; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _rlPopMatrix() {
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[360>>2]|0;
 $1 = ($0|0)>(0);
 if (!($1)) {
  return;
 }
 $2 = HEAP32[360>>2]|0;
 $3 = (($2) + -1)|0;
 $4 = (364 + ($3<<6)|0);
 $5 = HEAP32[288>>2]|0;
 _memmove(($5|0),($4|0),64)|0;
 $6 = HEAP32[360>>2]|0;
 $7 = (($6) + -1)|0;
 HEAP32[360>>2] = $7;
 return;
}
function _rlTranslatef($x,$y,$z) {
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $mat = 0, $mat$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $mat$byval_copy = sp + 192|0;
 $$byval_copy = sp + 128|0;
 $mat = sp + 64|0;
 $0 = sp;
 _MatrixTranslate($mat,$x,$y,$z);
 _MatrixTranspose($mat);
 $1 = HEAP32[288>>2]|0;
 dest=$$byval_copy; src=$1; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$mat$byval_copy; src=$mat; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($0,$$byval_copy,$mat$byval_copy);
 dest=$1; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _rlRotatef($angleDeg,$x,$y,$z) {
 $angleDeg = +$angleDeg;
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0, $axis = 0, $rotation = 0, $rotation$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 336|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $rotation$byval_copy = sp + 272|0;
 $$byval_copy = sp + 208|0;
 $rotation = sp + 144|0;
 $axis = sp + 128|0;
 $0 = sp + 64|0;
 $1 = sp;
 _MatrixIdentity($rotation);
 HEAPF32[$axis>>2] = $x;
 $2 = ((($axis)) + 4|0);
 HEAPF32[$2>>2] = $y;
 $3 = ((($axis)) + 8|0);
 HEAPF32[$3>>2] = $z;
 _VectorNormalize($axis);
 $4 = $angleDeg;
 $5 = $4 * 0.017453292519943295;
 $6 = $5;
 ;HEAP32[$rotation$byval_copy>>2]=HEAP32[$axis>>2]|0;HEAP32[$rotation$byval_copy+4>>2]=HEAP32[$axis+4>>2]|0;HEAP32[$rotation$byval_copy+8>>2]=HEAP32[$axis+8>>2]|0;
 _MatrixRotate($0,$6,$rotation$byval_copy);
 dest=$rotation; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixTranspose($rotation);
 $7 = HEAP32[288>>2]|0;
 dest=$$byval_copy; src=$7; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$rotation$byval_copy; src=$rotation; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($1,$$byval_copy,$rotation$byval_copy);
 dest=$7; src=$1; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _rlMultMatrixf($m) {
 $m = $m|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $mat = 0, $mat$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $mat$byval_copy = sp + 192|0;
 $$byval_copy = sp + 128|0;
 $mat = sp + 64|0;
 $0 = sp;
 $1 = HEAP32[$m>>2]|0;
 HEAP32[$mat>>2] = $1;
 $2 = ((($mat)) + 4|0);
 $3 = ((($m)) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 HEAP32[$2>>2] = $4;
 $5 = ((($mat)) + 8|0);
 $6 = ((($m)) + 8|0);
 $7 = HEAP32[$6>>2]|0;
 HEAP32[$5>>2] = $7;
 $8 = ((($mat)) + 12|0);
 $9 = ((($m)) + 12|0);
 $10 = HEAP32[$9>>2]|0;
 HEAP32[$8>>2] = $10;
 $11 = ((($mat)) + 16|0);
 $12 = ((($m)) + 16|0);
 $13 = HEAP32[$12>>2]|0;
 HEAP32[$11>>2] = $13;
 $14 = ((($mat)) + 20|0);
 $15 = ((($m)) + 20|0);
 $16 = HEAP32[$15>>2]|0;
 HEAP32[$14>>2] = $16;
 $17 = ((($mat)) + 24|0);
 $18 = ((($m)) + 24|0);
 $19 = HEAP32[$18>>2]|0;
 HEAP32[$17>>2] = $19;
 $20 = ((($mat)) + 28|0);
 $21 = ((($m)) + 28|0);
 $22 = HEAP32[$21>>2]|0;
 HEAP32[$20>>2] = $22;
 $23 = ((($mat)) + 32|0);
 $24 = ((($m)) + 32|0);
 $25 = HEAP32[$24>>2]|0;
 HEAP32[$23>>2] = $25;
 $26 = ((($mat)) + 36|0);
 $27 = ((($m)) + 36|0);
 $28 = HEAP32[$27>>2]|0;
 HEAP32[$26>>2] = $28;
 $29 = ((($mat)) + 40|0);
 $30 = ((($m)) + 40|0);
 $31 = HEAP32[$30>>2]|0;
 HEAP32[$29>>2] = $31;
 $32 = ((($mat)) + 44|0);
 $33 = ((($m)) + 44|0);
 $34 = HEAP32[$33>>2]|0;
 HEAP32[$32>>2] = $34;
 $35 = ((($mat)) + 48|0);
 $36 = ((($m)) + 48|0);
 $37 = HEAP32[$36>>2]|0;
 HEAP32[$35>>2] = $37;
 $38 = ((($mat)) + 52|0);
 $39 = ((($m)) + 52|0);
 $40 = HEAP32[$39>>2]|0;
 HEAP32[$38>>2] = $40;
 $41 = ((($mat)) + 56|0);
 $42 = ((($m)) + 56|0);
 $43 = HEAP32[$42>>2]|0;
 HEAP32[$41>>2] = $43;
 $44 = ((($mat)) + 60|0);
 $45 = ((($m)) + 60|0);
 $46 = HEAP32[$45>>2]|0;
 HEAP32[$44>>2] = $46;
 $47 = HEAP32[288>>2]|0;
 dest=$$byval_copy; src=$47; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$mat$byval_copy; src=$mat; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($0,$$byval_copy,$mat$byval_copy);
 dest=$47; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _rlOrtho($left,$right,$bottom,$top,$near,$far) {
 $left = +$left;
 $right = +$right;
 $bottom = +$bottom;
 $top = +$top;
 $near = +$near;
 $far = +$far;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $matOrtho = 0, $matOrtho$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $matOrtho$byval_copy = sp + 192|0;
 $$byval_copy = sp + 128|0;
 $matOrtho = sp + 64|0;
 $0 = sp;
 _MatrixOrtho($matOrtho,$left,$right,$bottom,$top,$near,$far);
 _MatrixTranspose($matOrtho);
 $1 = HEAP32[288>>2]|0;
 dest=$$byval_copy; src=$1; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$matOrtho$byval_copy; src=$matOrtho; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($0,$$byval_copy,$matOrtho$byval_copy);
 dest=$1; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 STACKTOP = sp;return;
}
function _rlBegin($mode) {
 $mode = $mode|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[1392>>2] = $mode;
 return;
}
function _rlEnd() {
 var $$byval_copy = 0, $$lcssa = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0;
 var $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0.0, $130 = 0, $131 = 0;
 var $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0.0;
 var $150 = 0, $16 = 0, $17 = 0.0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0;
 var $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0;
 var $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0;
 var $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0;
 var $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $exitcond = 0, $exitcond16 = 0, $exitcond17 = 0, $exitcond18 = 0, $i$013 = 0, $i1$011 = 0, $i2$04 = 0;
 var $i4$05 = 0, $i6$09 = 0, $i7$07 = 0, $quads$1$promoted = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy = sp;
 $0 = HEAP32[1388>>2]|0;
 $1 = ($0|0)==(0);
 if (!($1)) {
  $2 = HEAP32[1396>>2]|0;
  $3 = ($2|0)>(0);
  if ($3) {
   $i$013 = 0;
   while(1) {
    $4 = HEAP32[1400>>2]|0;
    $5 = (($4) + (($i$013*12)|0)|0);
    $6 = HEAP32[288>>2]|0;
    dest=$$byval_copy; src=$6; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
    _VectorTransform($5,$$byval_copy);
    $7 = (($i$013) + 1)|0;
    $8 = HEAP32[1396>>2]|0;
    $9 = ($7|0)<($8|0);
    if ($9) {
     $i$013 = $7;
    } else {
     $$lcssa = $8;
     break;
    }
   }
   HEAP32[1388>>2] = 0;
   $10 = ($$lcssa|0)>(0);
   if ($10) {
    $i1$011 = 0;
    while(1) {
     $11 = HEAP32[1400>>2]|0;
     $12 = (($11) + (($i1$011*12)|0)|0);
     $13 = +HEAPF32[$12>>2];
     $14 = (((($11) + (($i1$011*12)|0)|0)) + 4|0);
     $15 = +HEAPF32[$14>>2];
     $16 = (((($11) + (($i1$011*12)|0)|0)) + 8|0);
     $17 = +HEAPF32[$16>>2];
     _rlVertex3f($13,$15,$17);
     $18 = (($i1$011) + 1)|0;
     $19 = HEAP32[1396>>2]|0;
     $20 = ($18|0)<($19|0);
     if ($20) {
      $i1$011 = $18;
     } else {
      break;
     }
    }
   }
  } else {
   HEAP32[1388>>2] = 0;
  }
  HEAP32[1396>>2] = 0;
 }
 $21 = HEAP32[1392>>2]|0;
 switch ($21|0) {
 case 0:  {
  $22 = HEAP32[1404>>2]|0;
  $23 = HEAP32[1408>>2]|0;
  $24 = ($22|0)>($23|0);
  if (!($24)) {
   STACKTOP = sp;return;
  }
  $25 = (($22) - ($23))|0;
  $i2$04 = 0;
  while(1) {
   $26 = HEAP32[1408>>2]|0;
   $27 = $26 << 2;
   $28 = (($27) + -4)|0;
   $29 = HEAP32[1412>>2]|0;
   $30 = (($29) + ($28)|0);
   $31 = HEAP8[$30>>0]|0;
   $32 = (($29) + ($27)|0);
   HEAP8[$32>>0] = $31;
   $33 = HEAP32[1408>>2]|0;
   $34 = $33 << 2;
   $35 = (($34) + -3)|0;
   $36 = HEAP32[1412>>2]|0;
   $37 = (($36) + ($35)|0);
   $38 = HEAP8[$37>>0]|0;
   $39 = $34 | 1;
   $40 = (($36) + ($39)|0);
   HEAP8[$40>>0] = $38;
   $41 = HEAP32[1408>>2]|0;
   $42 = $41 << 2;
   $43 = (($42) + -2)|0;
   $44 = HEAP32[1412>>2]|0;
   $45 = (($44) + ($43)|0);
   $46 = HEAP8[$45>>0]|0;
   $47 = $42 | 2;
   $48 = (($44) + ($47)|0);
   HEAP8[$48>>0] = $46;
   $49 = HEAP32[1408>>2]|0;
   $50 = $49 << 2;
   $51 = (($50) + -1)|0;
   $52 = HEAP32[1412>>2]|0;
   $53 = (($52) + ($51)|0);
   $54 = HEAP8[$53>>0]|0;
   $55 = $50 | 3;
   $56 = (($52) + ($55)|0);
   HEAP8[$56>>0] = $54;
   $57 = HEAP32[1408>>2]|0;
   $58 = (($57) + 1)|0;
   HEAP32[1408>>2] = $58;
   $59 = (($i2$04) + 1)|0;
   $exitcond = ($59|0)==($25|0);
   if ($exitcond) {
    break;
   } else {
    $i2$04 = $59;
   }
  }
  STACKTOP = sp;return;
  break;
 }
 case 1:  {
  $60 = HEAP32[1416>>2]|0;
  $61 = HEAP32[1420>>2]|0;
  $62 = ($60|0)>($61|0);
  if (!($62)) {
   STACKTOP = sp;return;
  }
  $63 = (($60) - ($61))|0;
  $i4$05 = 0;
  while(1) {
   $64 = HEAP32[1420>>2]|0;
   $65 = $64 << 2;
   $66 = (($65) + -4)|0;
   $67 = HEAP32[1424>>2]|0;
   $68 = (($67) + ($66)|0);
   $69 = HEAP8[$68>>0]|0;
   $70 = (($67) + ($65)|0);
   HEAP8[$70>>0] = $69;
   $71 = HEAP32[1420>>2]|0;
   $72 = $71 << 2;
   $73 = (($72) + -3)|0;
   $74 = HEAP32[1424>>2]|0;
   $75 = (($74) + ($73)|0);
   $76 = HEAP8[$75>>0]|0;
   $77 = $72 | 1;
   $78 = (($74) + ($77)|0);
   HEAP8[$78>>0] = $76;
   $79 = HEAP32[1420>>2]|0;
   $80 = $79 << 2;
   $81 = (($80) + -2)|0;
   $82 = HEAP32[1424>>2]|0;
   $83 = (($82) + ($81)|0);
   $84 = HEAP8[$83>>0]|0;
   $85 = $80 | 2;
   $86 = (($82) + ($85)|0);
   HEAP8[$86>>0] = $84;
   $87 = HEAP32[1420>>2]|0;
   $88 = $87 << 2;
   $89 = (($88) + -1)|0;
   $90 = HEAP32[1424>>2]|0;
   $91 = (($90) + ($89)|0);
   $92 = HEAP8[$91>>0]|0;
   $93 = $88 | 3;
   $94 = (($90) + ($93)|0);
   HEAP8[$94>>0] = $92;
   $95 = HEAP32[1420>>2]|0;
   $96 = (($95) + 1)|0;
   HEAP32[1420>>2] = $96;
   $97 = (($i4$05) + 1)|0;
   $exitcond16 = ($97|0)==($63|0);
   if ($exitcond16) {
    break;
   } else {
    $i4$05 = $97;
   }
  }
  STACKTOP = sp;return;
  break;
 }
 case 2:  {
  $98 = HEAP32[1428>>2]|0;
  $99 = HEAP32[1432>>2]|0;
  $100 = ($98|0)>($99|0);
  if ($100) {
   $101 = (($98) - ($99))|0;
   $i6$09 = 0;
   while(1) {
    $102 = HEAP32[1432>>2]|0;
    $103 = $102 << 2;
    $104 = (($103) + -4)|0;
    $105 = HEAP32[1436>>2]|0;
    $106 = (($105) + ($104)|0);
    $107 = HEAP8[$106>>0]|0;
    $108 = (($105) + ($103)|0);
    HEAP8[$108>>0] = $107;
    $109 = HEAP32[1432>>2]|0;
    $110 = $109 << 2;
    $111 = (($110) + -3)|0;
    $112 = HEAP32[1436>>2]|0;
    $113 = (($112) + ($111)|0);
    $114 = HEAP8[$113>>0]|0;
    $115 = $110 | 1;
    $116 = (($112) + ($115)|0);
    HEAP8[$116>>0] = $114;
    $117 = HEAP32[1432>>2]|0;
    $118 = $117 << 2;
    $119 = (($118) + -2)|0;
    $120 = HEAP32[1436>>2]|0;
    $121 = (($120) + ($119)|0);
    $122 = HEAP8[$121>>0]|0;
    $123 = $118 | 2;
    $124 = (($120) + ($123)|0);
    HEAP8[$124>>0] = $122;
    $125 = HEAP32[1432>>2]|0;
    $126 = $125 << 2;
    $127 = (($126) + -1)|0;
    $128 = HEAP32[1436>>2]|0;
    $129 = (($128) + ($127)|0);
    $130 = HEAP8[$129>>0]|0;
    $131 = $126 | 3;
    $132 = (($128) + ($131)|0);
    HEAP8[$132>>0] = $130;
    $133 = HEAP32[1432>>2]|0;
    $134 = (($133) + 1)|0;
    HEAP32[1432>>2] = $134;
    $135 = (($i6$09) + 1)|0;
    $exitcond18 = ($135|0)==($101|0);
    if ($exitcond18) {
     break;
    } else {
     $i6$09 = $135;
    }
   }
  }
  $136 = HEAP32[1428>>2]|0;
  $137 = HEAP32[1440>>2]|0;
  $138 = ($136|0)>($137|0);
  if (!($138)) {
   STACKTOP = sp;return;
  }
  $139 = HEAP32[1444>>2]|0;
  $quads$1$promoted = HEAP32[1440>>2]|0;
  $140 = (($136) + ($quads$1$promoted))|0;
  $141 = (($136) - ($137))|0;
  $143 = $quads$1$promoted;$i7$07 = 0;
  while(1) {
   $142 = $143 << 1;
   $144 = (($139) + ($142<<2)|0);
   HEAPF32[$144>>2] = 0.0;
   $145 = $143 << 1;
   $146 = $145 | 1;
   $147 = (($139) + ($146<<2)|0);
   HEAPF32[$147>>2] = 0.0;
   $148 = (($143) + 1)|0;
   $149 = (($i7$07) + 1)|0;
   $exitcond17 = ($149|0)==($141|0);
   if ($exitcond17) {
    break;
   } else {
    $143 = $148;$i7$07 = $149;
   }
  }
  $150 = (($140) - ($137))|0;
  HEAP32[1440>>2] = $150;
  STACKTOP = sp;return;
  break;
 }
 default: {
  STACKTOP = sp;return;
 }
 }
}
function _rlVertex3f($x,$y,$z) {
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = HEAP32[1388>>2]|0;
 $1 = ($0|0)==(0);
 if (!($1)) {
  $2 = HEAP32[1396>>2]|0;
  $3 = HEAP32[1400>>2]|0;
  $4 = (($3) + (($2*12)|0)|0);
  HEAPF32[$4>>2] = $x;
  $5 = HEAP32[1396>>2]|0;
  $6 = HEAP32[1400>>2]|0;
  $7 = (((($6) + (($5*12)|0)|0)) + 4|0);
  HEAPF32[$7>>2] = $y;
  $8 = HEAP32[1396>>2]|0;
  $9 = HEAP32[1400>>2]|0;
  $10 = (((($9) + (($8*12)|0)|0)) + 8|0);
  HEAPF32[$10>>2] = $z;
  $11 = HEAP32[1396>>2]|0;
  $12 = (($11) + 1)|0;
  HEAP32[1396>>2] = $12;
  STACKTOP = sp;return;
 }
 $13 = HEAP32[1392>>2]|0;
 switch ($13|0) {
 case 0:  {
  $14 = HEAP32[1404>>2]|0;
  $15 = ($14|0)<(2048);
  if ($15) {
   $16 = ($14*3)|0;
   $17 = HEAP32[1448>>2]|0;
   $18 = (($17) + ($16<<2)|0);
   HEAPF32[$18>>2] = $x;
   $19 = HEAP32[1404>>2]|0;
   $20 = ($19*3)|0;
   $21 = (($20) + 1)|0;
   $22 = HEAP32[1448>>2]|0;
   $23 = (($22) + ($21<<2)|0);
   HEAPF32[$23>>2] = $y;
   $24 = HEAP32[1404>>2]|0;
   $25 = ($24*3)|0;
   $26 = (($25) + 2)|0;
   $27 = HEAP32[1448>>2]|0;
   $28 = (($27) + ($26<<2)|0);
   HEAPF32[$28>>2] = $z;
   $29 = HEAP32[1404>>2]|0;
   $30 = (($29) + 1)|0;
   HEAP32[1404>>2] = $30;
   STACKTOP = sp;return;
  } else {
   _TraceLog(1,7050,$vararg_buffer);
   STACKTOP = sp;return;
  }
  break;
 }
 case 1:  {
  $31 = HEAP32[1416>>2]|0;
  $32 = ($31|0)<(6144);
  if ($32) {
   $33 = ($31*3)|0;
   $34 = HEAP32[1452>>2]|0;
   $35 = (($34) + ($33<<2)|0);
   HEAPF32[$35>>2] = $x;
   $36 = HEAP32[1416>>2]|0;
   $37 = ($36*3)|0;
   $38 = (($37) + 1)|0;
   $39 = HEAP32[1452>>2]|0;
   $40 = (($39) + ($38<<2)|0);
   HEAPF32[$40>>2] = $y;
   $41 = HEAP32[1416>>2]|0;
   $42 = ($41*3)|0;
   $43 = (($42) + 2)|0;
   $44 = HEAP32[1452>>2]|0;
   $45 = (($44) + ($43<<2)|0);
   HEAPF32[$45>>2] = $z;
   $46 = HEAP32[1416>>2]|0;
   $47 = (($46) + 1)|0;
   HEAP32[1416>>2] = $47;
   STACKTOP = sp;return;
  } else {
   _TraceLog(1,7075,$vararg_buffer1);
   STACKTOP = sp;return;
  }
  break;
 }
 case 2:  {
  $48 = HEAP32[1428>>2]|0;
  $49 = ($48|0)<(4096);
  if ($49) {
   $50 = ($48*3)|0;
   $51 = HEAP32[1456>>2]|0;
   $52 = (($51) + ($50<<2)|0);
   HEAPF32[$52>>2] = $x;
   $53 = HEAP32[1428>>2]|0;
   $54 = ($53*3)|0;
   $55 = (($54) + 1)|0;
   $56 = HEAP32[1456>>2]|0;
   $57 = (($56) + ($55<<2)|0);
   HEAPF32[$57>>2] = $y;
   $58 = HEAP32[1428>>2]|0;
   $59 = ($58*3)|0;
   $60 = (($59) + 2)|0;
   $61 = HEAP32[1456>>2]|0;
   $62 = (($61) + ($60<<2)|0);
   HEAPF32[$62>>2] = $z;
   $63 = HEAP32[1428>>2]|0;
   $64 = (($63) + 1)|0;
   HEAP32[1428>>2] = $64;
   $65 = HEAP32[1460>>2]|0;
   $66 = (($65) + -1)|0;
   $67 = HEAP32[1464>>2]|0;
   $68 = (((($67) + ($66<<3)|0)) + 4|0);
   $69 = HEAP32[$68>>2]|0;
   $70 = (($69) + 1)|0;
   HEAP32[$68>>2] = $70;
   STACKTOP = sp;return;
  } else {
   _TraceLog(1,7104,$vararg_buffer3);
   STACKTOP = sp;return;
  }
  break;
 }
 default: {
  STACKTOP = sp;return;
 }
 }
}
function _rlVertex2f($x,$y) {
 $x = +$x;
 $y = +$y;
 var label = 0, sp = 0;
 sp = STACKTOP;
 _rlVertex3f($x,$y,0.0);
 return;
}
function _rlVertex2i($x,$y) {
 $x = $x|0;
 $y = $y|0;
 var $0 = 0.0, $1 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+($x|0));
 $1 = (+($y|0));
 _rlVertex3f($0,$1,0.0);
 return;
}
function _rlTexCoord2f($x,$y) {
 $x = +$x;
 $y = +$y;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1392>>2]|0;
 $1 = ($0|0)==(2);
 if (!($1)) {
  return;
 }
 $2 = HEAP32[1440>>2]|0;
 $3 = $2 << 1;
 $4 = HEAP32[1444>>2]|0;
 $5 = (($4) + ($3<<2)|0);
 HEAPF32[$5>>2] = $x;
 $6 = HEAP32[1440>>2]|0;
 $7 = $6 << 1;
 $8 = $7 | 1;
 $9 = HEAP32[1444>>2]|0;
 $10 = (($9) + ($8<<2)|0);
 HEAPF32[$10>>2] = $y;
 $11 = HEAP32[1440>>2]|0;
 $12 = (($11) + 1)|0;
 HEAP32[1440>>2] = $12;
 return;
}
function _rlNormal3f($x,$y,$z) {
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _rlColor4ub($x,$y,$z,$w) {
 $x = $x|0;
 $y = $y|0;
 $z = $z|0;
 $w = $w|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1392>>2]|0;
 switch ($0|0) {
 case 0:  {
  $1 = HEAP32[1408>>2]|0;
  $2 = $1 << 2;
  $3 = HEAP32[1412>>2]|0;
  $4 = (($3) + ($2)|0);
  HEAP8[$4>>0] = $x;
  $5 = HEAP32[1408>>2]|0;
  $6 = $5 << 2;
  $7 = $6 | 1;
  $8 = HEAP32[1412>>2]|0;
  $9 = (($8) + ($7)|0);
  HEAP8[$9>>0] = $y;
  $10 = HEAP32[1408>>2]|0;
  $11 = $10 << 2;
  $12 = $11 | 2;
  $13 = HEAP32[1412>>2]|0;
  $14 = (($13) + ($12)|0);
  HEAP8[$14>>0] = $z;
  $15 = HEAP32[1408>>2]|0;
  $16 = $15 << 2;
  $17 = $16 | 3;
  $18 = HEAP32[1412>>2]|0;
  $19 = (($18) + ($17)|0);
  HEAP8[$19>>0] = $w;
  $20 = HEAP32[1408>>2]|0;
  $21 = (($20) + 1)|0;
  HEAP32[1408>>2] = $21;
  return;
  break;
 }
 case 1:  {
  $22 = HEAP32[1420>>2]|0;
  $23 = $22 << 2;
  $24 = HEAP32[1424>>2]|0;
  $25 = (($24) + ($23)|0);
  HEAP8[$25>>0] = $x;
  $26 = HEAP32[1420>>2]|0;
  $27 = $26 << 2;
  $28 = $27 | 1;
  $29 = HEAP32[1424>>2]|0;
  $30 = (($29) + ($28)|0);
  HEAP8[$30>>0] = $y;
  $31 = HEAP32[1420>>2]|0;
  $32 = $31 << 2;
  $33 = $32 | 2;
  $34 = HEAP32[1424>>2]|0;
  $35 = (($34) + ($33)|0);
  HEAP8[$35>>0] = $z;
  $36 = HEAP32[1420>>2]|0;
  $37 = $36 << 2;
  $38 = $37 | 3;
  $39 = HEAP32[1424>>2]|0;
  $40 = (($39) + ($38)|0);
  HEAP8[$40>>0] = $w;
  $41 = HEAP32[1420>>2]|0;
  $42 = (($41) + 1)|0;
  HEAP32[1420>>2] = $42;
  return;
  break;
 }
 case 2:  {
  $43 = HEAP32[1432>>2]|0;
  $44 = $43 << 2;
  $45 = HEAP32[1436>>2]|0;
  $46 = (($45) + ($44)|0);
  HEAP8[$46>>0] = $x;
  $47 = HEAP32[1432>>2]|0;
  $48 = $47 << 2;
  $49 = $48 | 1;
  $50 = HEAP32[1436>>2]|0;
  $51 = (($50) + ($49)|0);
  HEAP8[$51>>0] = $y;
  $52 = HEAP32[1432>>2]|0;
  $53 = $52 << 2;
  $54 = $53 | 2;
  $55 = HEAP32[1436>>2]|0;
  $56 = (($55) + ($54)|0);
  HEAP8[$56>>0] = $z;
  $57 = HEAP32[1432>>2]|0;
  $58 = $57 << 2;
  $59 = $58 | 3;
  $60 = HEAP32[1436>>2]|0;
  $61 = (($60) + ($59)|0);
  HEAP8[$61>>0] = $w;
  $62 = HEAP32[1432>>2]|0;
  $63 = (($62) + 1)|0;
  HEAP32[1432>>2] = $63;
  return;
  break;
 }
 default: {
  return;
 }
 }
}
function _rlEnableTexture($id) {
 $id = $id|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1460>>2]|0;
 $1 = (($0) + -1)|0;
 $2 = HEAP32[1464>>2]|0;
 $3 = (($2) + ($1<<3)|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ($4|0)==($id|0);
 if ($5) {
  return;
 }
 $6 = (((($2) + ($1<<3)|0)) + 4|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ($7|0)>(0);
 if ($8) {
  $9 = (($0) + 1)|0;
  HEAP32[1460>>2] = $9;
 }
 $10 = HEAP32[1460>>2]|0;
 $11 = (($10) + -1)|0;
 $12 = HEAP32[1464>>2]|0;
 $13 = (($12) + ($11<<3)|0);
 HEAP32[$13>>2] = $id;
 $14 = HEAP32[1460>>2]|0;
 $15 = (($14) + -1)|0;
 $16 = HEAP32[1464>>2]|0;
 $17 = (((($16) + ($15<<3)|0)) + 4|0);
 HEAP32[$17>>2] = 0;
 return;
}
function _rlDisableTexture() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _rlDeleteTextures($id) {
 $id = $id|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = sp;
 HEAP32[$0>>2] = $id;
 _glDeleteTextures(1,($0|0));
 STACKTOP = sp;return;
}
function _rlEnableFBO() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1468>>2]|0;
 _glBindFramebuffer(36160,($0|0));
 return;
}
function _rlDeleteVertexArrays($id) {
 $id = $id|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = sp;
 HEAP32[$0>>2] = $id;
 $1 = HEAP32[1472>>2]|0;
 $2 = ($1|0)==(0);
 if ($2) {
  STACKTOP = sp;return;
 }
 $3 = HEAP32[1476>>2]|0;
 FUNCTION_TABLE_vii[$3 & 63](1,$0);
 STACKTOP = sp;return;
}
function _rlDeleteBuffers($id) {
 $id = $id|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = sp;
 HEAP32[$0>>2] = $id;
 _glDeleteBuffers(1,($0|0));
 STACKTOP = sp;return;
}
function _rlClearColor($r,$g,$b,$a) {
 $r = $r|0;
 $g = $g|0;
 $b = $b|0;
 $a = $a|0;
 var $0 = 0.0, $1 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+($r&255));
 $1 = $0 / 255.0;
 $2 = (+($g&255));
 $3 = $2 / 255.0;
 $4 = (+($b&255));
 $5 = $4 / 255.0;
 $6 = (+($a&255));
 $7 = $6 / 255.0;
 _glClearColor((+$1),(+$3),(+$5),(+$7));
 return;
}
function _rlClearScreenBuffers() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 _glClear(16640);
 return;
}
function _rlGetVersion() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 3;
}
function _rlglInit() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $8 = 0, $9 = 0, $exitcond = 0, $exitcond10 = 0, $exitcond12 = 0, $i$04 = 0, $i2$02 = 0, $i3$01 = 0, $numExt$0$lcssa = 0, $numExt$05 = 0, $pixels = 0;
 var $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer13 = 0, $vararg_buffer15 = 0, $vararg_buffer17 = 0, $vararg_buffer19 = 0, $vararg_buffer21 = 0, $vararg_buffer23 = 0, $vararg_buffer25 = 0, $vararg_buffer27 = 0, $vararg_buffer29 = 0, $vararg_buffer31 = 0, $vararg_buffer34 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, dest = 0, label = 0, sp = 0, src = 0;
 var stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 2496|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer34 = sp + 2160|0;
 $vararg_buffer31 = sp + 2152|0;
 $vararg_buffer29 = sp + 2144|0;
 $vararg_buffer27 = sp + 2136|0;
 $vararg_buffer25 = sp + 2128|0;
 $vararg_buffer23 = sp + 2120|0;
 $vararg_buffer21 = sp + 2112|0;
 $vararg_buffer19 = sp + 2104|0;
 $vararg_buffer17 = sp + 2096|0;
 $vararg_buffer15 = sp + 2088|0;
 $vararg_buffer13 = sp + 2080|0;
 $vararg_buffer10 = sp + 2072|0;
 $vararg_buffer7 = sp + 24|0;
 $vararg_buffer4 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = sp + 2424|0;
 $1 = sp + 2360|0;
 $2 = sp + 2296|0;
 $pixels = sp + 2288|0;
 $3 = sp + 2232|0;
 $4 = sp + 2176|0;
 $5 = sp + 2164|0;
 $6 = (_glGetString(7936)|0);
 HEAP32[$vararg_buffer>>2] = $6;
 _TraceLog(0,7129,$vararg_buffer);
 $7 = (_glGetString(7937)|0);
 HEAP32[$vararg_buffer1>>2] = $7;
 _TraceLog(0,7147,$vararg_buffer1);
 $8 = (_glGetString(7938)|0);
 HEAP32[$vararg_buffer4>>2] = $8;
 _TraceLog(0,7165,$vararg_buffer4);
 $9 = (_glGetString(35724)|0);
 HEAP32[$vararg_buffer7>>2] = $9;
 _TraceLog(0,7183,$vararg_buffer7);
 $10 = (_glGetString(7939)|0);
 $11 = (_mystrdup($10)|0);
 $12 = (_strtok($11,7201)|0);
 HEAP32[$vararg_buffer7>>2] = $12;
 $13 = ($12|0)==(0|0);
 if ($13) {
  $numExt$0$lcssa = -1;
 } else {
  $numExt$05 = 0;
  while(1) {
   $14 = (($numExt$05) + 1)|0;
   $15 = (_strtok(0,7201)|0);
   $16 = (($vararg_buffer7) + ($14<<2)|0);
   HEAP32[$16>>2] = $15;
   $17 = ($15|0)==(0|0);
   if ($17) {
    $numExt$0$lcssa = $numExt$05;
    break;
   } else {
    $numExt$05 = $14;
   }
  }
 }
 _free($11);
 HEAP32[$vararg_buffer10>>2] = $numExt$0$lcssa;
 _TraceLog(0,7203,$vararg_buffer10);
 $18 = ($numExt$0$lcssa|0)>(0);
 if ($18) {
  $i$04 = 0;
  while(1) {
   $19 = (($vararg_buffer7) + ($i$04<<2)|0);
   $20 = HEAP32[$19>>2]|0;
   $21 = (_strcmp($20,7238)|0);
   $22 = ($21|0)==(0);
   if ($22) {
    HEAP32[1472>>2] = 1;
    $23 = (_eglGetProcAddress((7265|0))|0);
    HEAP32[1480>>2] = $23;
    $24 = (_eglGetProcAddress((7286|0))|0);
    HEAP32[1484>>2] = $24;
    $25 = (_eglGetProcAddress((7307|0))|0);
    HEAP32[1476>>2] = $25;
   }
   $26 = HEAP32[$19>>2]|0;
   $27 = (_strcmp($26,7331)|0);
   $28 = ($27|0)==(0);
   if ($28) {
    HEAP32[1488>>2] = 1;
   }
   $29 = HEAP32[$19>>2]|0;
   $30 = (_strcmp($29,7351)|0);
   $31 = ($30|0)==(0);
   if ($31) {
    HEAP32[1492>>2] = 1;
   }
   $32 = HEAP32[$19>>2]|0;
   $33 = (_strcmp($32,7383)|0);
   $34 = ($33|0)==(0);
   if ($34) {
    HEAP32[1496>>2] = 1;
   }
   $35 = HEAP32[$19>>2]|0;
   $36 = (_strcmp($35,7419)|0);
   $37 = ($36|0)==(0);
   if ($37) {
    HEAP32[1500>>2] = 1;
   }
   $38 = HEAP32[$19>>2]|0;
   $39 = (_strcmp($38,7444)|0);
   $40 = ($39|0)==(0);
   if ($40) {
    HEAP32[1504>>2] = 1;
   }
   $41 = HEAP32[$19>>2]|0;
   $42 = (_strcmp($41,7477)|0);
   $43 = ($42|0)==(0);
   if ($43) {
    HEAP32[1508>>2] = 1;
   }
   $44 = (($i$04) + 1)|0;
   $exitcond12 = ($44|0)==($numExt$0$lcssa|0);
   if ($exitcond12) {
    break;
   } else {
    $i$04 = $44;
   }
  }
 }
 $45 = HEAP32[1472>>2]|0;
 $46 = ($45|0)==(0);
 if ($46) {
  _TraceLog(2,7588,$vararg_buffer15);
 } else {
  _TraceLog(0,7513,$vararg_buffer13);
 }
 $47 = HEAP32[1488>>2]|0;
 $48 = ($47|0)==(0);
 if ($48) {
  _TraceLog(2,7724,$vararg_buffer19);
 } else {
  _TraceLog(0,7649,$vararg_buffer17);
 }
 $49 = HEAP32[1492>>2]|0;
 $50 = ($49|0)==(0);
 if (!($50)) {
  _TraceLog(0,7799,$vararg_buffer21);
 }
 $51 = HEAP32[1496>>2]|0;
 $52 = ($51|0)==(0);
 if (!($52)) {
  _TraceLog(0,7845,$vararg_buffer23);
 }
 $53 = HEAP32[1500>>2]|0;
 $54 = ($53|0)==(0);
 if (!($54)) {
  _TraceLog(0,7892,$vararg_buffer25);
 }
 $55 = HEAP32[1504>>2]|0;
 $56 = ($55|0)==(0);
 if (!($56)) {
  _TraceLog(0,7943,$vararg_buffer27);
 }
 $57 = HEAP32[1508>>2]|0;
 $58 = ($57|0)==(0);
 if (!($58)) {
  _TraceLog(0,7990,$vararg_buffer29);
 }
 HEAP32[1392>>2] = 1;
 _MatrixIdentity($0);
 dest=224; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($1);
 dest=292; src=$1; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 HEAP32[288>>2] = 292;
 _MatrixIdentity($2);
 dest=364; src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(428); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(492); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(556); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(620); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(684); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(748); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(812); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(876); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(940); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1004); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1068); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1132); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1196); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1260); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixIdentity($2);
 dest=(1324); src=$2; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 HEAP32[$pixels>>2] = -1;
 $59 = (_rlglLoadTexture($pixels,1,1,7,1)|0);
 HEAP32[116>>2] = $59;
 $60 = ($59|0)==(0);
 if ($60) {
  _TraceLog(2,8088,$vararg_buffer34);
 } else {
  HEAP32[$vararg_buffer31>>2] = $59;
  _TraceLog(0,8037,$vararg_buffer31);
 }
 _LoadDefaultShader($3);
 dest=1512; src=$3; stop=dest+56|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _LoadSimpleShader($4);
 dest=1568; src=$4; stop=dest+56|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=1624; src=1512; stop=dest+56|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _InitializeBuffers();
 _InitializeBuffersGPU();
 $61 = (_malloc(49152)|0);
 HEAP32[1400>>2] = $61;
 $i2$02 = 0;
 while(1) {
  $62 = HEAP32[1400>>2]|0;
  $63 = (($62) + (($i2$02*12)|0)|0);
  _VectorZero($5);
  ;HEAP32[$63>>2]=HEAP32[$5>>2]|0;HEAP32[$63+4>>2]=HEAP32[$5+4>>2]|0;HEAP32[$63+8>>2]=HEAP32[$5+8>>2]|0;
  $64 = (($i2$02) + 1)|0;
  $exitcond10 = ($64|0)==(4096);
  if ($exitcond10) {
   break;
  } else {
   $i2$02 = $64;
  }
 }
 $65 = (_malloc(2048)|0);
 HEAP32[1464>>2] = $65;
 $i3$01 = 0;
 while(1) {
  $66 = (($65) + ($i3$01<<3)|0);
  HEAP32[$66>>2] = 0;
  $67 = (((($65) + ($i3$01<<3)|0)) + 4|0);
  HEAP32[$67>>2] = 0;
  $68 = (($i3$01) + 1)|0;
  $exitcond = ($68|0)==(256);
  if ($exitcond) {
   break;
  } else {
   $i3$01 = $68;
  }
 }
 HEAP32[1460>>2] = 1;
 $69 = HEAP32[116>>2]|0;
 $70 = HEAP32[1464>>2]|0;
 HEAP32[$70>>2] = $69;
 STACKTOP = sp;return;
}
function _rlglLoadTexture($data,$width,$height,$textureFormat,$mipmapCount) {
 $data = $data|0;
 $width = $width|0;
 $height = $height|0;
 $textureFormat = $textureFormat|0;
 $mipmapCount = $mipmapCount|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $id = 0, $or$cond = 0, $or$cond20 = 0, $or$cond22 = 0, $or$cond24 = 0, $or$cond9 = 0, $switch = 0, $textureFormat$off = 0, $textureFormat$off16 = 0, $textureFormat$off17 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer11 = 0, $vararg_buffer15 = 0, $vararg_buffer3 = 0, $vararg_buffer5 = 0, $vararg_buffer7 = 0;
 var $vararg_buffer9 = 0, $vararg_ptr13 = 0, $vararg_ptr14 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer15 = sp + 64|0;
 $vararg_buffer11 = sp + 48|0;
 $vararg_buffer9 = sp + 40|0;
 $vararg_buffer7 = sp + 32|0;
 $vararg_buffer5 = sp + 24|0;
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $id = sp + 68|0;
 _glBindTexture(3553,0);
 HEAP32[$id>>2] = 0;
 $0 = HEAP32[1492>>2]|0;
 $1 = ($0|0)==(0);
 $2 = $textureFormat & -4;
 $switch = ($2|0)==(8);
 $or$cond24 = $switch & $1;
 if ($or$cond24) {
  _TraceLog(2,8127,$vararg_buffer);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 $3 = HEAP32[1496>>2]|0;
 $4 = ($3|0)==(0);
 $5 = ($textureFormat|0)==(12);
 $or$cond9 = $5 & $4;
 if ($or$cond9) {
  _TraceLog(2,8171,$vararg_buffer1);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 $6 = HEAP32[1500>>2]|0;
 $7 = ($6|0)==(0);
 $textureFormat$off = (($textureFormat) + -13)|0;
 $8 = ($textureFormat$off>>>0)<(2);
 $or$cond = $8 & $7;
 if ($or$cond) {
  _TraceLog(2,8216,$vararg_buffer3);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 $9 = HEAP32[1504>>2]|0;
 $10 = ($9|0)==(0);
 $textureFormat$off16 = (($textureFormat) + -15)|0;
 $11 = ($textureFormat$off16>>>0)<(2);
 $or$cond20 = $11 & $10;
 if ($or$cond20) {
  _TraceLog(2,8261,$vararg_buffer5);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 $12 = HEAP32[1508>>2]|0;
 $13 = ($12|0)==(0);
 $textureFormat$off17 = (($textureFormat) + -17)|0;
 $14 = ($textureFormat$off17>>>0)<(2);
 $or$cond22 = $14 & $13;
 if ($or$cond22) {
  _TraceLog(2,8306,$vararg_buffer7);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 _glGenTextures(1,($id|0));
 $15 = HEAP32[$id>>2]|0;
 _glBindTexture(3553,($15|0));
 do {
  switch ($textureFormat|0) {
  case 1:  {
   _glTexImage2D(3553,0,6409,($width|0),($height|0),0,6409,5121,($data|0));
   break;
  }
  case 2:  {
   _glTexImage2D(3553,0,6410,($width|0),($height|0),0,6410,5121,($data|0));
   break;
  }
  case 3:  {
   _glTexImage2D(3553,0,6407,($width|0),($height|0),0,6407,33635,($data|0));
   break;
  }
  case 4:  {
   _glTexImage2D(3553,0,6407,($width|0),($height|0),0,6407,5121,($data|0));
   break;
  }
  case 5:  {
   _glTexImage2D(3553,0,6408,($width|0),($height|0),0,6408,32820,($data|0));
   break;
  }
  case 6:  {
   _glTexImage2D(3553,0,6408,($width|0),($height|0),0,6408,32819,($data|0));
   break;
  }
  case 7:  {
   _glTexImage2D(3553,0,6408,($width|0),($height|0),0,6408,5121,($data|0));
   break;
  }
  case 8:  {
   $16 = HEAP32[1492>>2]|0;
   $17 = ($16|0)==(0);
   if (!($17)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,33776);
   }
   break;
  }
  case 9:  {
   $18 = HEAP32[1492>>2]|0;
   $19 = ($18|0)==(0);
   if (!($19)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,33777);
   }
   break;
  }
  case 10:  {
   $20 = HEAP32[1492>>2]|0;
   $21 = ($20|0)==(0);
   if (!($21)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,33778);
   }
   break;
  }
  case 11:  {
   $22 = HEAP32[1492>>2]|0;
   $23 = ($22|0)==(0);
   if (!($23)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,33779);
   }
   break;
  }
  case 12:  {
   $24 = HEAP32[1496>>2]|0;
   $25 = ($24|0)==(0);
   if (!($25)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,36196);
   }
   break;
  }
  case 13:  {
   $26 = HEAP32[1500>>2]|0;
   $27 = ($26|0)==(0);
   if (!($27)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,37492);
   }
   break;
  }
  case 14:  {
   $28 = HEAP32[1500>>2]|0;
   $29 = ($28|0)==(0);
   if (!($29)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,37496);
   }
   break;
  }
  case 15:  {
   $30 = HEAP32[1504>>2]|0;
   $31 = ($30|0)==(0);
   if (!($31)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,35840);
   }
   break;
  }
  case 16:  {
   $32 = HEAP32[1504>>2]|0;
   $33 = ($32|0)==(0);
   if (!($33)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,35842);
   }
   break;
  }
  case 17:  {
   $34 = HEAP32[1508>>2]|0;
   $35 = ($34|0)==(0);
   if (!($35)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,37808);
   }
   break;
  }
  case 18:  {
   $36 = HEAP32[1508>>2]|0;
   $37 = ($36|0)==(0);
   if (!($37)) {
    _LoadCompressedTexture($data,$width,$height,$mipmapCount,37815);
   }
   break;
  }
  default: {
   _TraceLog(2,8351,$vararg_buffer9);
  }
  }
 } while(0);
 $38 = HEAP32[1488>>2]|0;
 $39 = ($38|0)==(0);
 if ($39) {
  _glTexParameteri(3553,10242,33071);
  _glTexParameteri(3553,10243,33071);
 } else {
  _glTexParameteri(3553,10242,10497);
  _glTexParameteri(3553,10243,10497);
 }
 _glTexParameteri(3553,10240,9728);
 _glTexParameteri(3553,10241,9728);
 _glBindTexture(3553,0);
 $40 = HEAP32[$id>>2]|0;
 $41 = ($40|0)==(0);
 if ($41) {
  _TraceLog(2,8429,$vararg_buffer15);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 } else {
  HEAP32[$vararg_buffer11>>2] = $40;
  $vararg_ptr13 = ((($vararg_buffer11)) + 4|0);
  HEAP32[$vararg_ptr13>>2] = $width;
  $vararg_ptr14 = ((($vararg_buffer11)) + 8|0);
  HEAP32[$vararg_ptr14>>2] = $height;
  _TraceLog(0,8380,$vararg_buffer11);
  $$0 = HEAP32[$id>>2]|0;
  STACKTOP = sp;return ($$0|0);
 }
 return (0)|0;
}
function _rlglClose() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = HEAP32[1472>>2]|0;
 $1 = ($0|0)==(0);
 if (!($1)) {
  $2 = HEAP32[1484>>2]|0;
  FUNCTION_TABLE_vi[$2 & 31](0);
 }
 _glDisableVertexAttribArray(0);
 _glDisableVertexAttribArray(1);
 _glDisableVertexAttribArray(2);
 _glDisableVertexAttribArray(3);
 _glBindBuffer(34962,0);
 _glBindBuffer(34963,0);
 _glUseProgram(0);
 _glDeleteBuffers(1,(1868|0));
 _glDeleteBuffers(1,((1872)|0));
 _glDeleteBuffers(1,(1876|0));
 _glDeleteBuffers(1,((1880)|0));
 _glDeleteBuffers(1,(1884|0));
 _glDeleteBuffers(1,((1888)|0));
 _glDeleteBuffers(1,((1892)|0));
 _glDeleteBuffers(1,((1896)|0));
 $3 = HEAP32[1472>>2]|0;
 $4 = ($3|0)==(0);
 if (!($4)) {
  $5 = HEAP32[1476>>2]|0;
  FUNCTION_TABLE_vii[$5 & 63](1,1900);
  $6 = HEAP32[1476>>2]|0;
  FUNCTION_TABLE_vii[$6 & 63](1,1904);
  $7 = HEAP32[1476>>2]|0;
  FUNCTION_TABLE_vii[$7 & 63](1,1908);
 }
 $8 = HEAP32[1512>>2]|0;
 _glDeleteProgram(($8|0));
 $9 = HEAP32[1568>>2]|0;
 _glDeleteProgram(($9|0));
 $10 = HEAP32[1448>>2]|0;
 _free($10);
 $11 = HEAP32[1412>>2]|0;
 _free($11);
 $12 = HEAP32[1452>>2]|0;
 _free($12);
 $13 = HEAP32[1424>>2]|0;
 _free($13);
 $14 = HEAP32[1456>>2]|0;
 _free($14);
 $15 = HEAP32[1444>>2]|0;
 _free($15);
 $16 = HEAP32[1436>>2]|0;
 _free($16);
 $17 = HEAP32[1912>>2]|0;
 _free($17);
 _glDeleteTextures(1,(116|0));
 $18 = HEAP32[116>>2]|0;
 HEAP32[$vararg_buffer>>2] = $18;
 _TraceLog(0,8458,$vararg_buffer);
 $19 = HEAP32[1468>>2]|0;
 $20 = ($19|0)==(0);
 if ($20) {
  $26 = HEAP32[1464>>2]|0;
  _free($26);
  STACKTOP = sp;return;
 }
 _glDeleteFramebuffers(1,(1468|0));
 $21 = HEAP32[(1712)>>2]|0;
 _rlDeleteBuffers($21);
 $22 = HEAP32[(1716)>>2]|0;
 _rlDeleteBuffers($22);
 $23 = HEAP32[(1720)>>2]|0;
 _rlDeleteBuffers($23);
 $24 = HEAP32[(1708)>>2]|0;
 _rlDeleteVertexArrays($24);
 $25 = HEAP32[1468>>2]|0;
 HEAP32[$vararg_buffer1>>2] = $25;
 _TraceLog(0,8523,$vararg_buffer1);
 $26 = HEAP32[1464>>2]|0;
 _free($26);
 STACKTOP = sp;return;
}
function _rlglDraw() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $i$05 = 0, $indicesOffset$04 = 0, $modelview$byval_copy = 0, $or$cond = 0, $or$cond3 = 0;
 var dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $modelview$byval_copy = sp;
 _UpdateBuffers();
 $0 = HEAP32[1404>>2]|0;
 $1 = ($0|0)>(0);
 $2 = HEAP32[1416>>2]|0;
 $3 = ($2|0)>(0);
 $or$cond = $1 | $3;
 $4 = HEAP32[1428>>2]|0;
 $5 = ($4|0)>(0);
 $or$cond3 = $or$cond | $5;
 if ($or$cond3) {
  $6 = HEAP32[1624>>2]|0;
  _glUseProgram(($6|0));
  $7 = HEAP32[(1656)>>2]|0;
  dest=$modelview$byval_copy; src=224; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
  $8 = (_GetMatrixVector($modelview$byval_copy)|0);
  _glUniformMatrix4fv(($7|0),1,0,($8|0));
  $9 = HEAP32[(1660)>>2]|0;
  dest=$modelview$byval_copy; src=292; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
  $10 = (_GetMatrixVector($modelview$byval_copy)|0);
  _glUniformMatrix4fv(($9|0),1,0,($10|0));
  $11 = HEAP32[(1668)>>2]|0;
  _glUniform1i(($11|0),0);
 }
 $12 = HEAP32[1416>>2]|0;
 $13 = ($12|0)>(0);
 if ($13) {
  $14 = HEAP32[116>>2]|0;
  _glBindTexture(3553,($14|0));
  $15 = HEAP32[1472>>2]|0;
  $16 = ($15|0)==(0);
  if ($16) {
   $19 = HEAP32[1876>>2]|0;
   _glBindBuffer(34962,($19|0));
   $20 = HEAP32[(1640)>>2]|0;
   _glVertexAttribPointer(($20|0),3,5126,0,0,(0|0));
   $21 = HEAP32[(1640)>>2]|0;
   _glEnableVertexAttribArray(($21|0));
   $22 = HEAP32[(1652)>>2]|0;
   $23 = ($22|0)==(-1);
   if (!($23)) {
    $24 = HEAP32[(1880)>>2]|0;
    _glBindBuffer(34962,($24|0));
    $25 = HEAP32[(1652)>>2]|0;
    _glVertexAttribPointer(($25|0),4,5121,1,0,(0|0));
    $26 = HEAP32[(1652)>>2]|0;
    _glEnableVertexAttribArray(($26|0));
   }
  } else {
   $17 = HEAP32[1484>>2]|0;
   $18 = HEAP32[1904>>2]|0;
   FUNCTION_TABLE_vi[$17 & 31]($18);
  }
  $27 = HEAP32[1416>>2]|0;
  _glDrawArrays(4,0,($27|0));
  $28 = HEAP32[1472>>2]|0;
  $29 = ($28|0)==(0);
  if ($29) {
   _glBindBuffer(34962,0);
  }
  _glBindTexture(3553,0);
 }
 $30 = HEAP32[1428>>2]|0;
 $31 = ($30|0)>(0);
 if ($31) {
  $32 = HEAP32[1472>>2]|0;
  $33 = ($32|0)==(0);
  if ($33) {
   $36 = HEAP32[1884>>2]|0;
   _glBindBuffer(34962,($36|0));
   $37 = HEAP32[(1640)>>2]|0;
   _glVertexAttribPointer(($37|0),3,5126,0,0,(0|0));
   $38 = HEAP32[(1640)>>2]|0;
   _glEnableVertexAttribArray(($38|0));
   $39 = HEAP32[(1888)>>2]|0;
   _glBindBuffer(34962,($39|0));
   $40 = HEAP32[(1644)>>2]|0;
   _glVertexAttribPointer(($40|0),2,5126,0,0,(0|0));
   $41 = HEAP32[(1644)>>2]|0;
   _glEnableVertexAttribArray(($41|0));
   $42 = HEAP32[(1652)>>2]|0;
   $43 = ($42|0)==(-1);
   if (!($43)) {
    $44 = HEAP32[(1892)>>2]|0;
    _glBindBuffer(34962,($44|0));
    $45 = HEAP32[(1652)>>2]|0;
    _glVertexAttribPointer(($45|0),4,5121,1,0,(0|0));
    $46 = HEAP32[(1652)>>2]|0;
    _glEnableVertexAttribArray(($46|0));
   }
   $47 = HEAP32[(1896)>>2]|0;
   _glBindBuffer(34963,($47|0));
  } else {
   $34 = HEAP32[1484>>2]|0;
   $35 = HEAP32[1908>>2]|0;
   FUNCTION_TABLE_vi[$34 & 31]($35);
  }
  $48 = HEAP32[1460>>2]|0;
  $49 = ($48|0)>(0);
  if ($49) {
   $i$05 = 0;$indicesOffset$04 = 0;
   while(1) {
    $50 = HEAP32[1464>>2]|0;
    $51 = (((($50) + ($i$05<<3)|0)) + 4|0);
    $52 = HEAP32[$51>>2]|0;
    $53 = (($52|0) / 4)&-1;
    $54 = ($53*6)|0;
    $55 = (($50) + ($i$05<<3)|0);
    $56 = HEAP32[$55>>2]|0;
    _glBindTexture(3553,($56|0));
    $57 = $indicesOffset$04 << 1;
    $58 = $57;
    _glDrawElements(4,($54|0),5123,($58|0));
    $59 = HEAP32[1464>>2]|0;
    $60 = (((($59) + ($i$05<<3)|0)) + 4|0);
    $61 = HEAP32[$60>>2]|0;
    $62 = (($61|0) / 4)&-1;
    $63 = ($62*6)|0;
    $64 = (($63) + ($indicesOffset$04))|0;
    $65 = (($i$05) + 1)|0;
    $66 = HEAP32[1460>>2]|0;
    $67 = ($65|0)<($66|0);
    if ($67) {
     $i$05 = $65;$indicesOffset$04 = $64;
    } else {
     break;
    }
   }
  }
  $68 = HEAP32[1472>>2]|0;
  $69 = ($68|0)==(0);
  if ($69) {
   _glBindBuffer(34962,0);
   _glBindBuffer(34963,0);
  }
  _glBindTexture(3553,0);
 }
 $70 = HEAP32[1404>>2]|0;
 $71 = ($70|0)>(0);
 if ($71) {
  $72 = HEAP32[116>>2]|0;
  _glBindTexture(3553,($72|0));
  $73 = HEAP32[1472>>2]|0;
  $74 = ($73|0)==(0);
  if ($74) {
   $77 = HEAP32[1868>>2]|0;
   _glBindBuffer(34962,($77|0));
   $78 = HEAP32[(1640)>>2]|0;
   _glVertexAttribPointer(($78|0),3,5126,0,0,(0|0));
   $79 = HEAP32[(1640)>>2]|0;
   _glEnableVertexAttribArray(($79|0));
   $80 = HEAP32[(1652)>>2]|0;
   $81 = ($80|0)==(-1);
   if (!($81)) {
    $82 = HEAP32[(1872)>>2]|0;
    _glBindBuffer(34962,($82|0));
    $83 = HEAP32[(1652)>>2]|0;
    _glVertexAttribPointer(($83|0),4,5121,1,0,(0|0));
    $84 = HEAP32[(1652)>>2]|0;
    _glEnableVertexAttribArray(($84|0));
   }
  } else {
   $75 = HEAP32[1484>>2]|0;
   $76 = HEAP32[1900>>2]|0;
   FUNCTION_TABLE_vi[$75 & 31]($76);
  }
  $85 = HEAP32[1404>>2]|0;
  _glDrawArrays(1,0,($85|0));
  $86 = HEAP32[1472>>2]|0;
  $87 = ($86|0)==(0);
  if ($87) {
   _glBindBuffer(34962,0);
  }
  _glBindTexture(3553,0);
 }
 $88 = HEAP32[1472>>2]|0;
 $89 = ($88|0)==(0);
 if ($89) {
  _glUseProgram(0);
  HEAP32[1460>>2] = 1;
  $91 = HEAP32[116>>2]|0;
  $92 = HEAP32[1464>>2]|0;
  HEAP32[$92>>2] = $91;
  $93 = HEAP32[1464>>2]|0;
  $94 = ((($93)) + 4|0);
  HEAP32[$94>>2] = 0;
  HEAP32[1404>>2] = 0;
  HEAP32[1408>>2] = 0;
  HEAP32[1416>>2] = 0;
  HEAP32[1420>>2] = 0;
  HEAP32[1428>>2] = 0;
  HEAP32[1440>>2] = 0;
  HEAP32[1432>>2] = 0;
  STACKTOP = sp;return;
 }
 $90 = HEAP32[1484>>2]|0;
 FUNCTION_TABLE_vi[$90 & 31](0);
 _glUseProgram(0);
 HEAP32[1460>>2] = 1;
 $91 = HEAP32[116>>2]|0;
 $92 = HEAP32[1464>>2]|0;
 HEAP32[$92>>2] = $91;
 $93 = HEAP32[1464>>2]|0;
 $94 = ((($93)) + 4|0);
 HEAP32[$94>>2] = 0;
 HEAP32[1404>>2] = 0;
 HEAP32[1408>>2] = 0;
 HEAP32[1416>>2] = 0;
 HEAP32[1420>>2] = 0;
 HEAP32[1428>>2] = 0;
 HEAP32[1440>>2] = 0;
 HEAP32[1432>>2] = 0;
 STACKTOP = sp;return;
}
function _rlglDrawPostpro() {
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $postproQuad$byval_copy = 0, $tmpcast$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 272|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $tmpcast$byval_copy = sp + 256|0;
 $$byval_copy2 = sp + 244|0;
 $$byval_copy1 = sp + 232|0;
 $$byval_copy = sp + 220|0;
 $postproQuad$byval_copy = sp + 40|0;
 $0 = sp + 28|0;
 $1 = sp + 16|0;
 $2 = sp + 4|0;
 $3 = sp;
 _glBindFramebuffer(36160,0);
 HEAPF32[$0>>2] = 0.0;
 $4 = ((($0)) + 4|0);
 HEAPF32[$4>>2] = 0.0;
 $5 = ((($0)) + 8|0);
 HEAPF32[$5>>2] = 0.0;
 HEAPF32[$1>>2] = 0.0;
 $6 = ((($1)) + 4|0);
 HEAPF32[$6>>2] = 0.0;
 $7 = ((($1)) + 8|0);
 HEAPF32[$7>>2] = 0.0;
 HEAPF32[$2>>2] = 1.0;
 $8 = ((($2)) + 4|0);
 HEAPF32[$8>>2] = 1.0;
 $9 = ((($2)) + 8|0);
 HEAPF32[$9>>2] = 1.0;
 HEAP32[$3>>2] = -1;
 _memcpy(($postproQuad$byval_copy|0),(1688|0),180)|0;
 ;HEAP32[$$byval_copy>>2]=HEAP32[$0>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$0+8>>2]|0;
 ;HEAP32[$$byval_copy1>>2]=HEAP32[$1>>2]|0;HEAP32[$$byval_copy1+4>>2]=HEAP32[$1+4>>2]|0;HEAP32[$$byval_copy1+8>>2]=HEAP32[$1+8>>2]|0;
 ;HEAP32[$$byval_copy2>>2]=HEAP32[$2>>2]|0;HEAP32[$$byval_copy2+4>>2]=HEAP32[$2+4>>2]|0;HEAP32[$$byval_copy2+8>>2]=HEAP32[$2+8>>2]|0;
 ;HEAP8[$tmpcast$byval_copy>>0]=HEAP8[$3>>0]|0;HEAP8[$tmpcast$byval_copy+1>>0]=HEAP8[$3+1>>0]|0;HEAP8[$tmpcast$byval_copy+2>>0]=HEAP8[$3+2>>0]|0;HEAP8[$tmpcast$byval_copy+3>>0]=HEAP8[$3+3>>0]|0;
 _rlglDrawModel($postproQuad$byval_copy,$$byval_copy,0.0,$$byval_copy1,$$byval_copy2,$tmpcast$byval_copy,0);
 STACKTOP = sp;return;
}
function _rlglDrawModel($model,$position,$rotationAngle,$rotationAxis,$scale,$color,$wires) {
 $model = $model|0;
 $position = $position|0;
 $rotationAngle = +$rotationAngle;
 $rotationAxis = $rotationAxis|0;
 $scale = $scale|0;
 $color = $color|0;
 $wires = $wires|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0, $17 = 0.0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0.0, $26 = 0.0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0, $34 = 0, $35 = 0.0, $36 = 0.0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0.0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0.0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0.0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0.0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0.0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $9 = 0, $matScale = 0, $modelviewworld = 0, $modelviewworld$byval_copy = 0, $rotation = 0, $transform = 0, $transform$byval_copy = 0, $translation = 0, $vColor = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 592|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $modelviewworld$byval_copy = sp + 528|0;
 $transform$byval_copy = sp + 464|0;
 $modelviewworld = sp + 256|0;
 $rotation = sp + 192|0;
 $matScale = sp + 128|0;
 $translation = sp + 64|0;
 $transform = sp;
 $0 = sp + 400|0;
 $1 = sp + 336|0;
 $vColor = sp + 320|0;
 $2 = ((($model)) + 124|0);
 $3 = HEAP32[$2>>2]|0;
 _glUseProgram(($3|0));
 $4 = ((($model)) + 40|0);
 dest=$transform$byval_copy; src=$4; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$modelviewworld$byval_copy; src=292; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($modelviewworld,$transform$byval_copy,$modelviewworld$byval_copy);
 $5 = $rotationAngle;
 $6 = $5 * 0.017453292519943295;
 $7 = $6;
 ;HEAP32[$modelviewworld$byval_copy>>2]=HEAP32[$rotationAxis>>2]|0;HEAP32[$modelviewworld$byval_copy+4>>2]=HEAP32[$rotationAxis+4>>2]|0;HEAP32[$modelviewworld$byval_copy+8>>2]=HEAP32[$rotationAxis+8>>2]|0;
 _MatrixRotate($rotation,$7,$modelviewworld$byval_copy);
 $8 = +HEAPF32[$scale>>2];
 $9 = ((($scale)) + 4|0);
 $10 = +HEAPF32[$9>>2];
 $11 = ((($scale)) + 8|0);
 $12 = +HEAPF32[$11>>2];
 _MatrixScale($matScale,$8,$10,$12);
 $13 = +HEAPF32[$position>>2];
 $14 = ((($position)) + 4|0);
 $15 = +HEAPF32[$14>>2];
 $16 = ((($position)) + 8|0);
 $17 = +HEAPF32[$16>>2];
 _MatrixTranslate($translation,$13,$15,$17);
 dest=$transform$byval_copy; src=$rotation; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$modelviewworld$byval_copy; src=$matScale; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($0,$transform$byval_copy,$modelviewworld$byval_copy);
 dest=$transform$byval_copy; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$modelviewworld$byval_copy; src=$translation; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($transform,$transform$byval_copy,$modelviewworld$byval_copy);
 dest=$transform$byval_copy; src=$transform; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 dest=$modelviewworld$byval_copy; src=292; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 _MatrixMultiply($1,$transform$byval_copy,$modelviewworld$byval_copy);
 dest=$modelviewworld; src=$1; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $18 = ((($model)) + 156|0);
 $19 = HEAP32[$18>>2]|0;
 dest=$modelviewworld$byval_copy; src=224; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $20 = (_GetMatrixVector($modelviewworld$byval_copy)|0);
 _glUniformMatrix4fv(($19|0),1,0,($20|0));
 $21 = ((($model)) + 160|0);
 $22 = HEAP32[$21>>2]|0;
 dest=$modelviewworld$byval_copy; src=$modelviewworld; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 $23 = (_GetMatrixVector($modelviewworld$byval_copy)|0);
 _glUniformMatrix4fv(($22|0),1,0,($23|0));
 $24 = HEAP8[$color>>0]|0;
 $25 = (+($24&255));
 $26 = $25 / 255.0;
 HEAPF32[$vColor>>2] = $26;
 $27 = ((($vColor)) + 4|0);
 $28 = ((($color)) + 1|0);
 $29 = HEAP8[$28>>0]|0;
 $30 = (+($29&255));
 $31 = $30 / 255.0;
 HEAPF32[$27>>2] = $31;
 $32 = ((($vColor)) + 8|0);
 $33 = ((($color)) + 2|0);
 $34 = HEAP8[$33>>0]|0;
 $35 = (+($34&255));
 $36 = $35 / 255.0;
 HEAPF32[$32>>2] = $36;
 $37 = ((($vColor)) + 12|0);
 $38 = ((($color)) + 3|0);
 $39 = HEAP8[$38>>0]|0;
 $40 = (+($39&255));
 $41 = $40 / 255.0;
 HEAPF32[$37>>2] = $41;
 $42 = ((($model)) + 164|0);
 $43 = HEAP32[$42>>2]|0;
 _glUniform4fv(($43|0),1,($vColor|0));
 _glActiveTexture(33984);
 $44 = ((($model)) + 128|0);
 $45 = HEAP32[$44>>2]|0;
 _glBindTexture(3553,($45|0));
 $46 = ((($model)) + 168|0);
 $47 = HEAP32[$46>>2]|0;
 _glUniform1i(($47|0),0);
 $48 = ((($model)) + 132|0);
 $49 = HEAP32[$48>>2]|0;
 $50 = ($49|0)==(0);
 if (!($50)) {
  _glActiveTexture(33985);
  $51 = HEAP32[$48>>2]|0;
  _glBindTexture(3553,($51|0));
 }
 $52 = ((($model)) + 136|0);
 $53 = HEAP32[$52>>2]|0;
 $54 = ($53|0)==(0);
 if (!($54)) {
  _glActiveTexture(33986);
  $55 = HEAP32[$52>>2]|0;
  _glBindTexture(3553,($55|0));
 }
 $56 = HEAP32[1472>>2]|0;
 $57 = ($56|0)==(0);
 if ($57) {
  $61 = ((($model)) + 24|0);
  $62 = HEAP32[$61>>2]|0;
  _glBindBuffer(34962,($62|0));
  $63 = ((($model)) + 140|0);
  $64 = HEAP32[$63>>2]|0;
  _glVertexAttribPointer(($64|0),3,5126,0,0,(0|0));
  $65 = HEAP32[$63>>2]|0;
  _glEnableVertexAttribArray(($65|0));
  $66 = ((($model)) + 28|0);
  $67 = HEAP32[$66>>2]|0;
  _glBindBuffer(34962,($67|0));
  $68 = ((($model)) + 144|0);
  $69 = HEAP32[$68>>2]|0;
  _glVertexAttribPointer(($69|0),2,5126,0,0,(0|0));
  $70 = HEAP32[$68>>2]|0;
  _glEnableVertexAttribArray(($70|0));
  $71 = ((($model)) + 148|0);
  $72 = HEAP32[$71>>2]|0;
  $73 = ($72|0)==(-1);
  if (!($73)) {
   $74 = ((($model)) + 32|0);
   $75 = HEAP32[$74>>2]|0;
   _glBindBuffer(34962,($75|0));
   $76 = HEAP32[$71>>2]|0;
   _glVertexAttribPointer(($76|0),3,5126,0,0,(0|0));
   $77 = HEAP32[$71>>2]|0;
   _glEnableVertexAttribArray(($77|0));
  }
 } else {
  $58 = HEAP32[1484>>2]|0;
  $59 = ((($model)) + 20|0);
  $60 = HEAP32[$59>>2]|0;
  FUNCTION_TABLE_vi[$58 & 31]($60);
 }
 $78 = HEAP32[$model>>2]|0;
 _glDrawArrays(4,0,($78|0));
 $79 = HEAP32[$48>>2]|0;
 $80 = ($79|0)==(0);
 if (!($80)) {
  _glActiveTexture(33985);
  _glBindTexture(3553,0);
 }
 $81 = HEAP32[$52>>2]|0;
 $82 = ($81|0)==(0);
 if (!($82)) {
  _glActiveTexture(33986);
  _glBindTexture(3553,0);
 }
 _glActiveTexture(33984);
 _glBindTexture(3553,0);
 $83 = HEAP32[1472>>2]|0;
 $84 = ($83|0)==(0);
 if ($84) {
  _glBindBuffer(34962,0);
  _glUseProgram(0);
  STACKTOP = sp;return;
 } else {
  $85 = HEAP32[1484>>2]|0;
  FUNCTION_TABLE_vi[$85 & 31](0);
  _glUseProgram(0);
  STACKTOP = sp;return;
 }
}
function _rlglInitGraphics($offsetX,$offsetY,$width,$height) {
 $offsetX = $offsetX|0;
 $offsetY = $offsetY|0;
 $width = $width|0;
 $height = $height|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0.0, $5 = 0.0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 HEAP32[1680>>2] = $width;
 HEAP32[1684>>2] = $height;
 $0 = (($offsetX|0) / 2)&-1;
 $1 = (($offsetY|0) / 2)&-1;
 $2 = (($width) - ($offsetX))|0;
 $3 = (($height) - ($offsetY))|0;
 _glViewport(($0|0),($1|0),($2|0),($3|0));
 _glClearColor(0.0,0.0,0.0,1.0);
 _glClear(16640);
 _glEnable(2929);
 _glDepthFunc(515);
 _glEnable(3042);
 _glBlendFunc(770,771);
 _rlMatrixMode(0);
 _rlLoadIdentity();
 $4 = (+($2|0));
 $5 = (+($3|0));
 _rlOrtho(0.0,$4,$5,0.0,0.0,1.0);
 _rlMatrixMode(1);
 _rlLoadIdentity();
 _glEnable(2884);
 _TraceLog(0,8561,$vararg_buffer);
 STACKTOP = sp;return;
}
function _LoadShaderProgram($vShaderStr,$fShaderStr) {
 $vShaderStr = $vShaderStr|0;
 $fShaderStr = $fShaderStr|0;
 var $$alloca_mul = 0, $$alloca_mul25 = 0, $$alloca_mul27 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $length = 0, $length2 = 0, $length4 = 0, $maxLength = 0, $maxLength1 = 0, $maxLength3 = 0, $pfs = 0, $program$0 = 0, $pvs = 0, $success = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer13 = 0, $vararg_buffer16 = 0, $vararg_buffer19 = 0;
 var $vararg_buffer22 = 0, $vararg_buffer4 = 0, $vararg_buffer7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer22 = sp + 64|0;
 $vararg_buffer19 = sp + 56|0;
 $vararg_buffer16 = sp + 48|0;
 $vararg_buffer13 = sp + 40|0;
 $vararg_buffer10 = sp + 32|0;
 $vararg_buffer7 = sp + 24|0;
 $vararg_buffer4 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $pvs = sp + 100|0;
 $pfs = sp + 96|0;
 $success = sp + 92|0;
 $maxLength = sp + 88|0;
 $length = sp + 84|0;
 $maxLength1 = sp + 80|0;
 $length2 = sp + 76|0;
 $maxLength3 = sp + 72|0;
 $length4 = sp + 68|0;
 $0 = (_glCreateShader(35633)|0);
 $1 = (_glCreateShader(35632)|0);
 HEAP32[$pvs>>2] = $vShaderStr;
 HEAP32[$pfs>>2] = $fShaderStr;
 _glShaderSource(($0|0),1,($pvs|0),(0|0));
 _glShaderSource(($1|0),1,($pfs|0),(0|0));
 HEAP32[$success>>2] = 0;
 _glCompileShader(($0|0));
 _glGetShaderiv(($0|0),35713,($success|0));
 $2 = HEAP32[$success>>2]|0;
 $3 = ($2|0)==(1);
 if ($3) {
  HEAP32[$vararg_buffer4>>2] = $0;
  _TraceLog(0,8755,$vararg_buffer4);
 } else {
  HEAP32[$vararg_buffer>>2] = $0;
  _TraceLog(2,8703,$vararg_buffer);
  HEAP32[$maxLength>>2] = 0;
  _glGetShaderiv(($0|0),35716,($maxLength|0));
  $4 = HEAP32[$maxLength>>2]|0;
  $5 = (_llvm_stacksave()|0);
  $$alloca_mul = $4;
  $6 = STACKTOP; STACKTOP = STACKTOP + ((((1*$$alloca_mul)|0)+15)&-16)|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();;
  $7 = HEAP32[$maxLength>>2]|0;
  _glGetShaderInfoLog(($0|0),($7|0),($length|0),($6|0));
  HEAP32[$vararg_buffer1>>2] = $6;
  _TraceLog(0,8752,$vararg_buffer1);
  _llvm_stackrestore(($5|0));
 }
 _glCompileShader(($1|0));
 _glGetShaderiv(($1|0),35713,($success|0));
 $8 = HEAP32[$success>>2]|0;
 $9 = ($8|0)==(1);
 if ($9) {
  HEAP32[$vararg_buffer13>>2] = $1;
  _TraceLog(0,8856,$vararg_buffer13);
 } else {
  HEAP32[$vararg_buffer7>>2] = $1;
  _TraceLog(2,8805,$vararg_buffer7);
  HEAP32[$maxLength1>>2] = 0;
  _glGetShaderiv(($1|0),35716,($maxLength1|0));
  $10 = HEAP32[$maxLength1>>2]|0;
  $11 = (_llvm_stacksave()|0);
  $$alloca_mul25 = $10;
  $12 = STACKTOP; STACKTOP = STACKTOP + ((((1*$$alloca_mul25)|0)+15)&-16)|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();;
  $13 = HEAP32[$maxLength1>>2]|0;
  _glGetShaderInfoLog(($1|0),($13|0),($length2|0),($12|0));
  HEAP32[$vararg_buffer10>>2] = $12;
  _TraceLog(0,8752,$vararg_buffer10);
  _llvm_stackrestore(($11|0));
 }
 $14 = (_glCreateProgram()|0);
 _glAttachShader(($14|0),($0|0));
 _glAttachShader(($14|0),($1|0));
 _glLinkProgram(($14|0));
 _glGetProgramiv(($14|0),35714,($success|0));
 $15 = HEAP32[$success>>2]|0;
 $16 = ($15|0)==(0);
 if ($16) {
  HEAP32[$vararg_buffer16>>2] = $14;
  _TraceLog(2,8908,$vararg_buffer16);
  HEAP32[$maxLength3>>2] = 0;
  _glGetProgramiv(($14|0),35716,($maxLength3|0));
  $17 = HEAP32[$maxLength3>>2]|0;
  $18 = (_llvm_stacksave()|0);
  $$alloca_mul27 = $17;
  $19 = STACKTOP; STACKTOP = STACKTOP + ((((1*$$alloca_mul27)|0)+15)&-16)|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();;
  $20 = HEAP32[$maxLength3>>2]|0;
  _glGetProgramInfoLog(($14|0),($20|0),($length4|0),($19|0));
  HEAP32[$vararg_buffer19>>2] = $19;
  _TraceLog(0,8752,$vararg_buffer19);
  _glDeleteProgram(($14|0));
  _llvm_stackrestore(($18|0));
  $program$0 = 0;
  _glDeleteShader(($0|0));
  _glDeleteShader(($1|0));
  STACKTOP = sp;return ($program$0|0);
 } else {
  HEAP32[$vararg_buffer22>>2] = $14;
  _TraceLog(0,8954,$vararg_buffer22);
  $program$0 = $14;
  _glDeleteShader(($0|0));
  _glDeleteShader(($1|0));
  STACKTOP = sp;return ($program$0|0);
 }
 return (0)|0;
}
function _IsPosproShaderEnabled() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1916>>2]|0;
 return ($0|0);
}
function _DrawRectangle($posX,$posY,$width,$height,$color) {
 $posX = $posX|0;
 $posY = $posY|0;
 $width = $width|0;
 $height = $height|0;
 $color = $color|0;
 var $0 = 0.0, $1 = 0, $2 = 0.0, $3 = 0.0, $4 = 0, $5 = 0.0, $color$byval_copy = 0, $position = 0, $position$byval_copy = 0, $size = 0, $size$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $color$byval_copy = sp + 32|0;
 $size$byval_copy = sp + 24|0;
 $position$byval_copy = sp + 16|0;
 $position = sp + 8|0;
 $size = sp;
 $0 = (+($posX|0));
 HEAPF32[$position>>2] = $0;
 $1 = ((($position)) + 4|0);
 $2 = (+($posY|0));
 HEAPF32[$1>>2] = $2;
 $3 = (+($width|0));
 HEAPF32[$size>>2] = $3;
 $4 = ((($size)) + 4|0);
 $5 = (+($height|0));
 HEAPF32[$4>>2] = $5;
 ;HEAP32[$position$byval_copy>>2]=HEAP32[$position>>2]|0;HEAP32[$position$byval_copy+4>>2]=HEAP32[$position+4>>2]|0;
 ;HEAP32[$size$byval_copy>>2]=HEAP32[$size>>2]|0;HEAP32[$size$byval_copy+4>>2]=HEAP32[$size+4>>2]|0;
 ;HEAP8[$color$byval_copy>>0]=HEAP8[$color>>0]|0;HEAP8[$color$byval_copy+1>>0]=HEAP8[$color+1>>0]|0;HEAP8[$color$byval_copy+2>>0]=HEAP8[$color+2>>0]|0;HEAP8[$color$byval_copy+3>>0]=HEAP8[$color+3>>0]|0;
 _DrawRectangleV($position$byval_copy,$size$byval_copy,$color$byval_copy);
 STACKTOP = sp;return;
}
function _DrawRectangleV($position,$size,$color) {
 $position = $position|0;
 $size = $size|0;
 $color = $color|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0.0, $13 = 0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0, $18 = 0.0, $19 = 0.0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0.0, $26 = 0.0;
 var $27 = 0.0, $28 = 0, $29 = 0.0, $3 = 0, $30 = 0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0.0, $38 = 0.0, $39 = 0.0, $4 = 0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0;
 var $45 = 0.0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0.0, $6 = 0, $60 = 0, $61 = 0.0, $62 = 0.0;
 var $63 = 0.0, $64 = 0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0, $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $8 = 0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_rlGetVersion()|0);
 $1 = ($0|0)==(1);
 if ($1) {
  _rlBegin(1);
  $2 = HEAP8[$color>>0]|0;
  $3 = ((($color)) + 1|0);
  $4 = HEAP8[$3>>0]|0;
  $5 = ((($color)) + 2|0);
  $6 = HEAP8[$5>>0]|0;
  $7 = ((($color)) + 3|0);
  $8 = HEAP8[$7>>0]|0;
  _rlColor4ub($2,$4,$6,$8);
  $9 = +HEAPF32[$position>>2];
  $10 = (~~(($9)));
  $11 = ((($position)) + 4|0);
  $12 = +HEAPF32[$11>>2];
  $13 = (~~(($12)));
  _rlVertex2i($10,$13);
  $14 = +HEAPF32[$position>>2];
  $15 = (~~(($14)));
  $16 = +HEAPF32[$11>>2];
  $17 = ((($size)) + 4|0);
  $18 = +HEAPF32[$17>>2];
  $19 = $16 + $18;
  $20 = (~~(($19)));
  _rlVertex2i($15,$20);
  $21 = +HEAPF32[$position>>2];
  $22 = +HEAPF32[$size>>2];
  $23 = $21 + $22;
  $24 = (~~(($23)));
  $25 = +HEAPF32[$11>>2];
  $26 = +HEAPF32[$17>>2];
  $27 = $25 + $26;
  $28 = (~~(($27)));
  _rlVertex2i($24,$28);
  $29 = +HEAPF32[$position>>2];
  $30 = (~~(($29)));
  $31 = +HEAPF32[$11>>2];
  $32 = (~~(($31)));
  _rlVertex2i($30,$32);
  $33 = +HEAPF32[$position>>2];
  $34 = +HEAPF32[$size>>2];
  $35 = $33 + $34;
  $36 = (~~(($35)));
  $37 = +HEAPF32[$11>>2];
  $38 = +HEAPF32[$17>>2];
  $39 = $37 + $38;
  $40 = (~~(($39)));
  _rlVertex2i($36,$40);
  $41 = +HEAPF32[$position>>2];
  $42 = +HEAPF32[$size>>2];
  $43 = $41 + $42;
  $44 = (~~(($43)));
  $45 = +HEAPF32[$11>>2];
  $46 = (~~(($45)));
  _rlVertex2i($44,$46);
  _rlEnd();
  return;
 }
 $47 = (_rlGetVersion()|0);
 $48 = ($47|0)==(2);
 if (!($48)) {
  $49 = (_rlGetVersion()|0);
  $50 = ($49|0)==(3);
  if (!($50)) {
   return;
  }
 }
 $51 = HEAP32[116>>2]|0;
 _rlEnableTexture($51);
 _rlBegin(2);
 $52 = HEAP8[$color>>0]|0;
 $53 = ((($color)) + 1|0);
 $54 = HEAP8[$53>>0]|0;
 $55 = ((($color)) + 2|0);
 $56 = HEAP8[$55>>0]|0;
 $57 = ((($color)) + 3|0);
 $58 = HEAP8[$57>>0]|0;
 _rlColor4ub($52,$54,$56,$58);
 _rlTexCoord2f(0.0,0.0);
 $59 = +HEAPF32[$position>>2];
 $60 = ((($position)) + 4|0);
 $61 = +HEAPF32[$60>>2];
 _rlVertex2f($59,$61);
 _rlTexCoord2f(0.0,1.0);
 $62 = +HEAPF32[$position>>2];
 $63 = +HEAPF32[$60>>2];
 $64 = ((($size)) + 4|0);
 $65 = +HEAPF32[$64>>2];
 $66 = $63 + $65;
 _rlVertex2f($62,$66);
 _rlTexCoord2f(1.0,1.0);
 $67 = +HEAPF32[$position>>2];
 $68 = +HEAPF32[$size>>2];
 $69 = $67 + $68;
 $70 = +HEAPF32[$60>>2];
 $71 = +HEAPF32[$64>>2];
 $72 = $70 + $71;
 _rlVertex2f($69,$72);
 _rlTexCoord2f(1.0,0.0);
 $73 = +HEAPF32[$position>>2];
 $74 = +HEAPF32[$size>>2];
 $75 = $73 + $74;
 $76 = +HEAPF32[$60>>2];
 _rlVertex2f($75,$76);
 _rlEnd();
 return;
}
function _LoadImageEx($agg$result,$pixels,$width,$height) {
 $agg$result = $agg$result|0;
 $pixels = $pixels|0;
 $width = $width|0;
 $height = $height|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $i$02 = 0, $k$01 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $width << 2;
 $1 = Math_imul($0, $height)|0;
 $2 = (_malloc($1)|0);
 $3 = ($1|0)>(0);
 if ($3) {
  $4 = Math_imul($height, $width)|0;
  $5 = $4 << 2;
  $6 = (($5) + -1)|0;
  $7 = $6 >>> 2;
  $i$02 = 0;$k$01 = 0;
  while(1) {
   $8 = (($pixels) + ($k$01<<2)|0);
   $9 = HEAP8[$8>>0]|0;
   $10 = (($2) + ($i$02)|0);
   HEAP8[$10>>0] = $9;
   $11 = (((($pixels) + ($k$01<<2)|0)) + 1|0);
   $12 = HEAP8[$11>>0]|0;
   $13 = $i$02 | 1;
   $14 = (($2) + ($13)|0);
   HEAP8[$14>>0] = $12;
   $15 = (((($pixels) + ($k$01<<2)|0)) + 2|0);
   $16 = HEAP8[$15>>0]|0;
   $17 = $i$02 | 2;
   $18 = (($2) + ($17)|0);
   HEAP8[$18>>0] = $16;
   $19 = (((($pixels) + ($k$01<<2)|0)) + 3|0);
   $20 = HEAP8[$19>>0]|0;
   $21 = $i$02 | 3;
   $22 = (($2) + ($21)|0);
   HEAP8[$22>>0] = $20;
   $23 = (($k$01) + 1)|0;
   $24 = (($i$02) + 4)|0;
   $exitcond = ($k$01|0)==($7|0);
   if ($exitcond) {
    break;
   } else {
    $i$02 = $24;$k$01 = $23;
   }
  }
 }
 HEAP32[$agg$result>>2] = $2;
 $25 = ((($agg$result)) + 4|0);
 HEAP32[$25>>2] = $width;
 $26 = ((($agg$result)) + 8|0);
 HEAP32[$26>>2] = $height;
 $27 = ((($agg$result)) + 12|0);
 HEAP32[$27>>2] = 1;
 $28 = ((($agg$result)) + 16|0);
 HEAP32[$28>>2] = 7;
 return;
}
function _LoadTextureFromImage($agg$result,$image) {
 $agg$result = $agg$result|0;
 $image = $image|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$image>>2]|0;
 $1 = ((($image)) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = ((($image)) + 8|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = ((($image)) + 16|0);
 $6 = HEAP32[$5>>2]|0;
 $7 = ((($image)) + 12|0);
 $8 = HEAP32[$7>>2]|0;
 $9 = (_rlglLoadTexture($0,$2,$4,$6,$8)|0);
 $10 = HEAP32[$1>>2]|0;
 $11 = HEAP32[$3>>2]|0;
 $12 = HEAP32[$7>>2]|0;
 $13 = HEAP32[$5>>2]|0;
 HEAP32[$agg$result>>2] = $9;
 $14 = ((($agg$result)) + 4|0);
 HEAP32[$14>>2] = $10;
 $15 = ((($agg$result)) + 8|0);
 HEAP32[$15>>2] = $11;
 $16 = ((($agg$result)) + 12|0);
 HEAP32[$16>>2] = $12;
 $17 = ((($agg$result)) + 16|0);
 HEAP32[$17>>2] = $13;
 return;
}
function _UnloadImage($image) {
 $image = $image|0;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$image>>2]|0;
 _free($0);
 return;
}
function _UnloadTexture($texture) {
 $texture = $texture|0;
 var $0 = 0, $1 = 0, $2 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = HEAP32[$texture>>2]|0;
 $1 = ($0|0)==(0);
 if ($1) {
  STACKTOP = sp;return;
 }
 _rlDeleteTextures($0);
 $2 = HEAP32[$texture>>2]|0;
 HEAP32[$vararg_buffer>>2] = $2;
 _TraceLog(0,9002,$vararg_buffer);
 STACKTOP = sp;return;
}
function _GetImageData($image) {
 $image = $image|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0.0, $105 = 0.0, $106 = 0, $107 = 0, $108 = 0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0;
 var $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0.0, $47 = 0.0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0.0, $53 = 0.0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0.0;
 var $59 = 0.0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0.0, $72 = 0.0, $73 = 0, $74 = 0, $75 = 0, $76 = 0;
 var $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0.0, $83 = 0.0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0.0, $93 = 0.0, $94 = 0;
 var $95 = 0, $96 = 0, $97 = 0, $98 = 0.0, $99 = 0.0, $i$01 = 0, $k$02 = 0, $k$1 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = ((($image)) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ((($image)) + 8|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = $1 << 2;
 $5 = Math_imul($4, $3)|0;
 $6 = (_malloc($5)|0);
 $7 = HEAP32[$0>>2]|0;
 $8 = HEAP32[$2>>2]|0;
 $9 = Math_imul($8, $7)|0;
 $10 = ($9|0)>(0);
 if (!($10)) {
  STACKTOP = sp;return ($6|0);
 }
 $11 = ((($image)) + 16|0);
 $12 = HEAP32[$11>>2]|0;
 $13 = HEAP32[$0>>2]|0;
 $14 = HEAP32[$2>>2]|0;
 $15 = Math_imul($14, $13)|0;
 $16 = HEAP32[$image>>2]|0;
 $i$01 = 0;$k$02 = 0;
 while(1) {
  switch ($12|0) {
  case 1:  {
   $17 = (($16) + ($k$02)|0);
   $18 = HEAP8[$17>>0]|0;
   $19 = (($6) + ($i$01<<2)|0);
   HEAP8[$19>>0] = $18;
   $20 = (($16) + ($k$02)|0);
   $21 = HEAP8[$20>>0]|0;
   $22 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$22>>0] = $21;
   $23 = (($16) + ($k$02)|0);
   $24 = HEAP8[$23>>0]|0;
   $25 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$25>>0] = $24;
   $26 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$26>>0] = -1;
   $27 = (($k$02) + 1)|0;
   $k$1 = $27;
   break;
  }
  case 2:  {
   $28 = (($16) + ($k$02)|0);
   $29 = HEAP8[$28>>0]|0;
   $30 = (($6) + ($i$01<<2)|0);
   HEAP8[$30>>0] = $29;
   $31 = (($16) + ($k$02)|0);
   $32 = HEAP8[$31>>0]|0;
   $33 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$33>>0] = $32;
   $34 = (($16) + ($k$02)|0);
   $35 = HEAP8[$34>>0]|0;
   $36 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$36>>0] = $35;
   $37 = (($k$02) + 1)|0;
   $38 = (($16) + ($37)|0);
   $39 = HEAP8[$38>>0]|0;
   $40 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$40>>0] = $39;
   $41 = (($k$02) + 2)|0;
   $k$1 = $41;
   break;
  }
  case 5:  {
   $42 = (($16) + ($k$02<<1)|0);
   $43 = HEAP16[$42>>1]|0;
   $44 = $43&65535;
   $45 = $44 >>> 11;
   $46 = (+($45|0));
   $47 = $46 * 8.0;
   $48 = (~~(($47))&255);
   $49 = (($6) + ($i$01<<2)|0);
   HEAP8[$49>>0] = $48;
   $50 = $44 >>> 6;
   $51 = $50 & 31;
   $52 = (+($51|0));
   $53 = $52 * 8.0;
   $54 = (~~(($53))&255);
   $55 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$55>>0] = $54;
   $56 = $44 >>> 1;
   $57 = $56 & 31;
   $58 = (+($57|0));
   $59 = $58 * 8.0;
   $60 = (~~(($59))&255);
   $61 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$61>>0] = $60;
   $62 = $44 & 1;
   $63 = (0 - ($62))|0;
   $64 = $63&255;
   $65 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$65>>0] = $64;
   $66 = (($k$02) + 1)|0;
   $k$1 = $66;
   break;
  }
  case 3:  {
   $67 = (($16) + ($k$02<<1)|0);
   $68 = HEAP16[$67>>1]|0;
   $69 = $68&65535;
   $70 = $69 >>> 11;
   $71 = (+($70|0));
   $72 = $71 * 8.0;
   $73 = (~~(($72))&255);
   $74 = (($6) + ($i$01<<2)|0);
   HEAP8[$74>>0] = $73;
   $75 = $69 >>> 5;
   $76 = $75 & 63;
   $77 = (+($76|0));
   $78 = $77 * 4.0;
   $79 = (~~(($78))&255);
   $80 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$80>>0] = $79;
   $81 = $69 & 31;
   $82 = (+($81|0));
   $83 = $82 * 8.0;
   $84 = (~~(($83))&255);
   $85 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$85>>0] = $84;
   $86 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$86>>0] = -1;
   $87 = (($k$02) + 1)|0;
   $k$1 = $87;
   break;
  }
  case 6:  {
   $88 = (($16) + ($k$02<<1)|0);
   $89 = HEAP16[$88>>1]|0;
   $90 = $89&65535;
   $91 = $90 >>> 12;
   $92 = (+($91|0));
   $93 = $92 * 17.0;
   $94 = (~~(($93))&255);
   $95 = (($6) + ($i$01<<2)|0);
   HEAP8[$95>>0] = $94;
   $96 = $90 >>> 8;
   $97 = $96 & 15;
   $98 = (+($97|0));
   $99 = $98 * 17.0;
   $100 = (~~(($99))&255);
   $101 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$101>>0] = $100;
   $102 = $90 >>> 4;
   $103 = $102 & 15;
   $104 = (+($103|0));
   $105 = $104 * 17.0;
   $106 = (~~(($105))&255);
   $107 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$107>>0] = $106;
   $108 = $90 & 15;
   $109 = (+($108|0));
   $110 = $109 * 17.0;
   $111 = (~~(($110))&255);
   $112 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$112>>0] = $111;
   $113 = (($k$02) + 1)|0;
   $k$1 = $113;
   break;
  }
  case 7:  {
   $114 = (($16) + ($k$02)|0);
   $115 = HEAP8[$114>>0]|0;
   $116 = (($6) + ($i$01<<2)|0);
   HEAP8[$116>>0] = $115;
   $117 = (($k$02) + 1)|0;
   $118 = (($16) + ($117)|0);
   $119 = HEAP8[$118>>0]|0;
   $120 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$120>>0] = $119;
   $121 = (($k$02) + 2)|0;
   $122 = (($16) + ($121)|0);
   $123 = HEAP8[$122>>0]|0;
   $124 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$124>>0] = $123;
   $125 = (($k$02) + 3)|0;
   $126 = (($16) + ($125)|0);
   $127 = HEAP8[$126>>0]|0;
   $128 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$128>>0] = $127;
   $129 = (($k$02) + 4)|0;
   $k$1 = $129;
   break;
  }
  case 4:  {
   $130 = (($16) + ($k$02)|0);
   $131 = HEAP8[$130>>0]|0;
   $132 = (($6) + ($i$01<<2)|0);
   HEAP8[$132>>0] = $131;
   $133 = (($k$02) + 1)|0;
   $134 = (($16) + ($133)|0);
   $135 = HEAP8[$134>>0]|0;
   $136 = (((($6) + ($i$01<<2)|0)) + 1|0);
   HEAP8[$136>>0] = $135;
   $137 = (($k$02) + 2)|0;
   $138 = (($16) + ($137)|0);
   $139 = HEAP8[$138>>0]|0;
   $140 = (((($6) + ($i$01<<2)|0)) + 2|0);
   HEAP8[$140>>0] = $139;
   $141 = (((($6) + ($i$01<<2)|0)) + 3|0);
   HEAP8[$141>>0] = -1;
   $142 = (($k$02) + 3)|0;
   $k$1 = $142;
   break;
  }
  default: {
   _TraceLog(2,9052,$vararg_buffer);
   $k$1 = $k$02;
  }
  }
  $143 = (($i$01) + 1)|0;
  $144 = ($143|0)<($15|0);
  if ($144) {
   $i$01 = $143;$k$02 = $k$1;
  } else {
   break;
  }
 }
 STACKTOP = sp;return ($6|0);
}
function _ImageConvertFormat($image,$newFormat) {
 $image = $image|0;
 $newFormat = $newFormat|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0, $107 = 0, $108 = 0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0.0, $175 = 0.0, $176 = 0.0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0.0, $181 = 0.0, $182 = 0.0, $183 = 0, $184 = 0, $185 = 0, $186 = 0.0, $187 = 0.0, $188 = 0.0;
 var $189 = 0, $19 = 0.0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0.0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0.0, $225 = 0.0, $226 = 0.0, $227 = 0, $228 = 0, $229 = 0, $23 = 0.0, $230 = 0.0, $231 = 0.0, $232 = 0.0, $233 = 0, $234 = 0, $235 = 0, $236 = 0.0, $237 = 0.0, $238 = 0.0, $239 = 0, $24 = 0.0, $240 = 0, $241 = 0;
 var $242 = 0.0, $243 = 0.0, $244 = 0.0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0.0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0.0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0.0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0;
 var $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0.0, $54 = 0.0, $55 = 0, $56 = 0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0, $60 = 0, $61 = 0, $62 = 0.0, $63 = 0.0, $64 = 0.0;
 var $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0;
 var $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $i1$019 = 0, $i12$032 = 0;
 var $i13$035 = 0, $i3$025 = 0, $image$byval_copy = 0, $k$018 = 0, $k$120 = 0, $k$223 = 0, $k$326 = 0, $k$429 = 0, $k$634 = 0, $or$cond = 0, $roundf = 0.0, $roundf10 = 0.0, $roundf2 = 0.0, $roundf3 = 0.0, $roundf4 = 0.0, $roundf5 = 0.0, $roundf6 = 0.0, $roundf7 = 0.0, $roundf8 = 0.0, $roundf9 = 0.0;
 var $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $image$byval_copy = sp + 4|0;
 $vararg_buffer = sp;
 $0 = ((($image)) + 16|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==($newFormat|0);
 if ($2) {
  STACKTOP = sp;return;
 }
 $3 = ($1|0)<(8);
 $4 = ($newFormat|0)<(8);
 $or$cond = $4 & $3;
 if (!($or$cond)) {
  _TraceLog(2,9098,$vararg_buffer);
  STACKTOP = sp;return;
 }
 ;HEAP32[$image$byval_copy>>2]=HEAP32[$image>>2]|0;HEAP32[$image$byval_copy+4>>2]=HEAP32[$image+4>>2]|0;HEAP32[$image$byval_copy+8>>2]=HEAP32[$image+8>>2]|0;HEAP32[$image$byval_copy+12>>2]=HEAP32[$image+12>>2]|0;HEAP32[$image$byval_copy+16>>2]=HEAP32[$image+16>>2]|0;
 $5 = (_GetImageData($image$byval_copy)|0);
 $6 = HEAP32[$image>>2]|0;
 _free($6);
 HEAP32[$0>>2] = $newFormat;
 switch ($newFormat|0) {
 case 1:  {
  $7 = ((($image)) + 4|0);
  $8 = HEAP32[$7>>2]|0;
  $9 = ((($image)) + 8|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = Math_imul($10, $8)|0;
  $12 = (_malloc($11)|0);
  HEAP32[$image>>2] = $12;
  $13 = HEAP32[$7>>2]|0;
  $14 = HEAP32[$9>>2]|0;
  $15 = Math_imul($14, $13)|0;
  $16 = ($15|0)>(0);
  if ($16) {
   $k$018 = 0;
   while(1) {
    $17 = (($5) + ($k$018<<2)|0);
    $18 = HEAP8[$17>>0]|0;
    $19 = (+($18&255));
    $20 = $19 * 0.29899999499320984;
    $21 = (((($5) + ($k$018<<2)|0)) + 1|0);
    $22 = HEAP8[$21>>0]|0;
    $23 = (+($22&255));
    $24 = $23 * 0.58700001239776611;
    $25 = $20 + $24;
    $26 = (((($5) + ($k$018<<2)|0)) + 2|0);
    $27 = HEAP8[$26>>0]|0;
    $28 = (+($27&255));
    $29 = $28 * 0.11400000005960464;
    $30 = $25 + $29;
    $31 = (~~(($30))&255);
    $32 = HEAP32[$image>>2]|0;
    $33 = (($32) + ($k$018)|0);
    HEAP8[$33>>0] = $31;
    $34 = (($k$018) + 1)|0;
    $35 = HEAP32[$7>>2]|0;
    $36 = HEAP32[$9>>2]|0;
    $37 = Math_imul($36, $35)|0;
    $38 = ($34|0)<($37|0);
    if ($38) {
     $k$018 = $34;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 2:  {
  $39 = ((($image)) + 4|0);
  $40 = HEAP32[$39>>2]|0;
  $41 = ((($image)) + 8|0);
  $42 = HEAP32[$41>>2]|0;
  $43 = $40 << 1;
  $44 = Math_imul($43, $42)|0;
  $45 = (_malloc($44)|0);
  HEAP32[$image>>2] = $45;
  $46 = HEAP32[$39>>2]|0;
  $47 = HEAP32[$41>>2]|0;
  $48 = $46 << 1;
  $49 = Math_imul($48, $47)|0;
  $50 = ($49|0)>(0);
  if ($50) {
   $i1$019 = 0;$k$120 = 0;
   while(1) {
    $51 = (($5) + ($k$120<<2)|0);
    $52 = HEAP8[$51>>0]|0;
    $53 = (+($52&255));
    $54 = $53 * 0.29899999499320984;
    $55 = (((($5) + ($k$120<<2)|0)) + 1|0);
    $56 = HEAP8[$55>>0]|0;
    $57 = (+($56&255));
    $58 = $57 * 0.58700001239776611;
    $59 = $54 + $58;
    $60 = (((($5) + ($k$120<<2)|0)) + 2|0);
    $61 = HEAP8[$60>>0]|0;
    $62 = (+($61&255));
    $63 = $62 * 0.11400000005960464;
    $64 = $59 + $63;
    $65 = (~~(($64))&255);
    $66 = HEAP32[$image>>2]|0;
    $67 = (($66) + ($i1$019)|0);
    HEAP8[$67>>0] = $65;
    $68 = (((($5) + ($k$120<<2)|0)) + 3|0);
    $69 = HEAP8[$68>>0]|0;
    $70 = $i1$019 | 1;
    $71 = HEAP32[$image>>2]|0;
    $72 = (($71) + ($70)|0);
    HEAP8[$72>>0] = $69;
    $73 = (($k$120) + 1)|0;
    $74 = (($i1$019) + 2)|0;
    $75 = HEAP32[$39>>2]|0;
    $76 = HEAP32[$41>>2]|0;
    $77 = $75 << 1;
    $78 = Math_imul($77, $76)|0;
    $79 = ($74|0)<($78|0);
    if ($79) {
     $i1$019 = $74;$k$120 = $73;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 3:  {
  $80 = ((($image)) + 4|0);
  $81 = HEAP32[$80>>2]|0;
  $82 = ((($image)) + 8|0);
  $83 = HEAP32[$82>>2]|0;
  $84 = $81 << 1;
  $85 = Math_imul($84, $83)|0;
  $86 = (_malloc($85)|0);
  HEAP32[$image>>2] = $86;
  $87 = HEAP32[$80>>2]|0;
  $88 = HEAP32[$82>>2]|0;
  $89 = Math_imul($88, $87)|0;
  $90 = ($89|0)>(0);
  if ($90) {
   $91 = HEAP32[$image>>2]|0;
   $92 = HEAP32[$80>>2]|0;
   $93 = HEAP32[$82>>2]|0;
   $94 = Math_imul($93, $92)|0;
   $k$223 = 0;
   while(1) {
    $95 = (($5) + ($k$223<<2)|0);
    $96 = HEAP8[$95>>0]|0;
    $97 = (+($96&255));
    $98 = $97 * 31.0;
    $99 = $98 / 255.0;
    $roundf8 = (+_roundf($99));
    $100 = (~~(($roundf8))&255);
    $101 = (((($5) + ($k$223<<2)|0)) + 1|0);
    $102 = HEAP8[$101>>0]|0;
    $103 = (+($102&255));
    $104 = $103 * 63.0;
    $105 = $104 / 255.0;
    $roundf9 = (+_roundf($105));
    $106 = (~~(($roundf9))&255);
    $107 = (((($5) + ($k$223<<2)|0)) + 2|0);
    $108 = HEAP8[$107>>0]|0;
    $109 = (+($108&255));
    $110 = $109 * 31.0;
    $111 = $110 / 255.0;
    $roundf10 = (+_roundf($111));
    $112 = (~~(($roundf10))&255);
    $113 = $100&255;
    $114 = $113 << 11;
    $115 = $106&255;
    $116 = $115 << 5;
    $117 = $116 | $114;
    $118 = $112&255;
    $119 = $117 | $118;
    $120 = $119&65535;
    $121 = (($91) + ($k$223<<1)|0);
    HEAP16[$121>>1] = $120;
    $122 = (($k$223) + 1)|0;
    $123 = ($122|0)<($94|0);
    if ($123) {
     $k$223 = $122;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 4:  {
  $124 = ((($image)) + 4|0);
  $125 = HEAP32[$124>>2]|0;
  $126 = ((($image)) + 8|0);
  $127 = HEAP32[$126>>2]|0;
  $128 = ($125*3)|0;
  $129 = Math_imul($128, $127)|0;
  $130 = (_malloc($129)|0);
  HEAP32[$image>>2] = $130;
  $131 = HEAP32[$124>>2]|0;
  $132 = HEAP32[$126>>2]|0;
  $133 = ($131*3)|0;
  $134 = Math_imul($133, $132)|0;
  $135 = ($134|0)>(0);
  if ($135) {
   $i3$025 = 0;$k$326 = 0;
   while(1) {
    $136 = (($5) + ($k$326<<2)|0);
    $137 = HEAP8[$136>>0]|0;
    $138 = HEAP32[$image>>2]|0;
    $139 = (($138) + ($i3$025)|0);
    HEAP8[$139>>0] = $137;
    $140 = (((($5) + ($k$326<<2)|0)) + 1|0);
    $141 = HEAP8[$140>>0]|0;
    $142 = (($i3$025) + 1)|0;
    $143 = HEAP32[$image>>2]|0;
    $144 = (($143) + ($142)|0);
    HEAP8[$144>>0] = $141;
    $145 = (((($5) + ($k$326<<2)|0)) + 2|0);
    $146 = HEAP8[$145>>0]|0;
    $147 = (($i3$025) + 2)|0;
    $148 = HEAP32[$image>>2]|0;
    $149 = (($148) + ($147)|0);
    HEAP8[$149>>0] = $146;
    $150 = (($k$326) + 1)|0;
    $151 = (($i3$025) + 3)|0;
    $152 = HEAP32[$124>>2]|0;
    $153 = HEAP32[$126>>2]|0;
    $154 = ($152*3)|0;
    $155 = Math_imul($154, $153)|0;
    $156 = ($151|0)<($155|0);
    if ($156) {
     $i3$025 = $151;$k$326 = $150;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 5:  {
  $157 = ((($image)) + 4|0);
  $158 = HEAP32[$157>>2]|0;
  $159 = ((($image)) + 8|0);
  $160 = HEAP32[$159>>2]|0;
  $161 = $158 << 1;
  $162 = Math_imul($161, $160)|0;
  $163 = (_malloc($162)|0);
  HEAP32[$image>>2] = $163;
  $164 = HEAP32[$157>>2]|0;
  $165 = HEAP32[$159>>2]|0;
  $166 = Math_imul($165, $164)|0;
  $167 = ($166|0)>(0);
  if ($167) {
   $168 = HEAP32[$image>>2]|0;
   $169 = HEAP32[$157>>2]|0;
   $170 = HEAP32[$159>>2]|0;
   $171 = Math_imul($170, $169)|0;
   $k$429 = 0;
   while(1) {
    $172 = (($5) + ($k$429<<2)|0);
    $173 = HEAP8[$172>>0]|0;
    $174 = (+($173&255));
    $175 = $174 * 31.0;
    $176 = $175 / 255.0;
    $roundf5 = (+_roundf($176));
    $177 = (~~(($roundf5))&255);
    $178 = (((($5) + ($k$429<<2)|0)) + 1|0);
    $179 = HEAP8[$178>>0]|0;
    $180 = (+($179&255));
    $181 = $180 * 31.0;
    $182 = $181 / 255.0;
    $roundf6 = (+_roundf($182));
    $183 = (~~(($roundf6))&255);
    $184 = (((($5) + ($k$429<<2)|0)) + 2|0);
    $185 = HEAP8[$184>>0]|0;
    $186 = (+($185&255));
    $187 = $186 * 31.0;
    $188 = $187 / 255.0;
    $roundf7 = (+_roundf($188));
    $189 = (~~(($roundf7))&255);
    $190 = (((($5) + ($k$429<<2)|0)) + 3|0);
    $191 = HEAP8[$190>>0]|0;
    $192 = ($191&255)>(50);
    $193 = $177&255;
    $194 = $193 << 11;
    $195 = $183&255;
    $196 = $195 << 6;
    $197 = $196 | $194;
    $198 = $189&255;
    $199 = $198 << 1;
    $200 = $197 | $199;
    $201 = $192&1;
    $202 = $200 | $201;
    $203 = $202&65535;
    $204 = (($168) + ($k$429<<1)|0);
    HEAP16[$204>>1] = $203;
    $205 = (($k$429) + 1)|0;
    $206 = ($205|0)<($171|0);
    if ($206) {
     $k$429 = $205;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 6:  {
  $207 = ((($image)) + 4|0);
  $208 = HEAP32[$207>>2]|0;
  $209 = ((($image)) + 8|0);
  $210 = HEAP32[$209>>2]|0;
  $211 = $208 << 1;
  $212 = Math_imul($211, $210)|0;
  $213 = (_malloc($212)|0);
  HEAP32[$image>>2] = $213;
  $214 = HEAP32[$207>>2]|0;
  $215 = HEAP32[$209>>2]|0;
  $216 = Math_imul($215, $214)|0;
  $217 = ($216|0)>(0);
  if ($217) {
   $218 = HEAP32[$image>>2]|0;
   $219 = HEAP32[$207>>2]|0;
   $220 = HEAP32[$209>>2]|0;
   $221 = Math_imul($220, $219)|0;
   $i12$032 = 0;
   while(1) {
    $222 = (($5) + ($i12$032<<2)|0);
    $223 = HEAP8[$222>>0]|0;
    $224 = (+($223&255));
    $225 = $224 * 15.0;
    $226 = $225 / 255.0;
    $roundf = (+_roundf($226));
    $227 = (~~(($roundf))&255);
    $228 = (((($5) + ($i12$032<<2)|0)) + 1|0);
    $229 = HEAP8[$228>>0]|0;
    $230 = (+($229&255));
    $231 = $230 * 15.0;
    $232 = $231 / 255.0;
    $roundf2 = (+_roundf($232));
    $233 = (~~(($roundf2))&255);
    $234 = (((($5) + ($i12$032<<2)|0)) + 2|0);
    $235 = HEAP8[$234>>0]|0;
    $236 = (+($235&255));
    $237 = $236 * 15.0;
    $238 = $237 / 255.0;
    $roundf3 = (+_roundf($238));
    $239 = (~~(($roundf3))&255);
    $240 = (((($5) + ($i12$032<<2)|0)) + 3|0);
    $241 = HEAP8[$240>>0]|0;
    $242 = (+($241&255));
    $243 = $242 * 15.0;
    $244 = $243 / 255.0;
    $roundf4 = (+_roundf($244));
    $245 = (~~(($roundf4))&255);
    $246 = $227&255;
    $247 = $246 << 12;
    $248 = $233&255;
    $249 = $248 << 8;
    $250 = $249 | $247;
    $251 = $239&255;
    $252 = $251 << 4;
    $253 = $250 | $252;
    $254 = $245&255;
    $255 = $253 | $254;
    $256 = $255&65535;
    $257 = (($218) + ($i12$032<<1)|0);
    HEAP16[$257>>1] = $256;
    $258 = (($i12$032) + 1)|0;
    $259 = ($258|0)<($221|0);
    if ($259) {
     $i12$032 = $258;
    } else {
     break;
    }
   }
  }
  break;
 }
 case 7:  {
  $260 = ((($image)) + 4|0);
  $261 = HEAP32[$260>>2]|0;
  $262 = ((($image)) + 8|0);
  $263 = HEAP32[$262>>2]|0;
  $264 = $261 << 2;
  $265 = Math_imul($264, $263)|0;
  $266 = (_malloc($265)|0);
  HEAP32[$image>>2] = $266;
  $267 = HEAP32[$260>>2]|0;
  $268 = HEAP32[$262>>2]|0;
  $269 = $267 << 2;
  $270 = Math_imul($269, $268)|0;
  $271 = ($270|0)>(0);
  if ($271) {
   $i13$035 = 0;$k$634 = 0;
   while(1) {
    $272 = (($5) + ($k$634<<2)|0);
    $273 = HEAP8[$272>>0]|0;
    $274 = HEAP32[$image>>2]|0;
    $275 = (($274) + ($i13$035)|0);
    HEAP8[$275>>0] = $273;
    $276 = (((($5) + ($k$634<<2)|0)) + 1|0);
    $277 = HEAP8[$276>>0]|0;
    $278 = $i13$035 | 1;
    $279 = HEAP32[$image>>2]|0;
    $280 = (($279) + ($278)|0);
    HEAP8[$280>>0] = $277;
    $281 = (((($5) + ($k$634<<2)|0)) + 2|0);
    $282 = HEAP8[$281>>0]|0;
    $283 = $i13$035 | 2;
    $284 = HEAP32[$image>>2]|0;
    $285 = (($284) + ($283)|0);
    HEAP8[$285>>0] = $282;
    $286 = (((($5) + ($k$634<<2)|0)) + 3|0);
    $287 = HEAP8[$286>>0]|0;
    $288 = $i13$035 | 3;
    $289 = HEAP32[$image>>2]|0;
    $290 = (($289) + ($288)|0);
    HEAP8[$290>>0] = $287;
    $291 = (($k$634) + 1)|0;
    $292 = (($i13$035) + 4)|0;
    $293 = HEAP32[$260>>2]|0;
    $294 = HEAP32[$262>>2]|0;
    $295 = $293 << 2;
    $296 = Math_imul($295, $294)|0;
    $297 = ($292|0)<($296|0);
    if ($297) {
     $i13$035 = $292;$k$634 = $291;
    } else {
     break;
    }
   }
  }
  break;
 }
 default: {
 }
 }
 _free($5);
 STACKTOP = sp;return;
}
function _DrawTexturePro($texture,$sourceRec,$destRec,$origin,$rotation,$tint) {
 $texture = $texture|0;
 $sourceRec = $sourceRec|0;
 $destRec = $destRec|0;
 $origin = $origin|0;
 $rotation = +$rotation;
 $tint = $tint|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0.0, $2 = 0.0, $20 = 0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0, $26 = 0.0;
 var $27 = 0, $28 = 0, $29 = 0.0, $3 = 0, $30 = 0.0, $31 = 0, $32 = 0.0, $33 = 0, $34 = 0.0, $35 = 0.0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0.0, $41 = 0, $42 = 0.0, $43 = 0.0, $44 = 0;
 var $45 = 0, $46 = 0.0, $47 = 0, $48 = 0, $49 = 0, $5 = 0.0, $50 = 0, $51 = 0.0, $52 = 0, $53 = 0.0, $54 = 0.0, $55 = 0, $56 = 0, $57 = 0, $58 = 0.0, $59 = 0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0;
 var $63 = 0, $64 = 0.0, $65 = 0, $66 = 0.0, $67 = 0, $68 = 0, $69 = 0, $7 = 0.0, $70 = 0.0, $71 = 0, $72 = 0.0, $73 = 0.0, $74 = 0, $75 = 0.0, $76 = 0, $77 = 0.0, $78 = 0.0, $79 = 0, $8 = 0, $80 = 0.0;
 var $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$texture>>2]|0;
 _rlEnableTexture($0);
 _rlPushMatrix();
 $1 = HEAP32[$destRec>>2]|0;
 $2 = (+($1|0));
 $3 = ((($destRec)) + 4|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = (+($4|0));
 _rlTranslatef($2,$5,0.0);
 _rlRotatef($rotation,0.0,0.0,1.0);
 $6 = +HEAPF32[$origin>>2];
 $7 = -$6;
 $8 = ((($origin)) + 4|0);
 $9 = +HEAPF32[$8>>2];
 $10 = -$9;
 _rlTranslatef($7,$10,0.0);
 _rlBegin(2);
 $11 = HEAP8[$tint>>0]|0;
 $12 = ((($tint)) + 1|0);
 $13 = HEAP8[$12>>0]|0;
 $14 = ((($tint)) + 2|0);
 $15 = HEAP8[$14>>0]|0;
 $16 = ((($tint)) + 3|0);
 $17 = HEAP8[$16>>0]|0;
 _rlColor4ub($11,$13,$15,$17);
 $18 = HEAP32[$sourceRec>>2]|0;
 $19 = (+($18|0));
 $20 = ((($texture)) + 4|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = (+($21|0));
 $23 = $19 / $22;
 $24 = ((($sourceRec)) + 4|0);
 $25 = HEAP32[$24>>2]|0;
 $26 = (+($25|0));
 $27 = ((($texture)) + 8|0);
 $28 = HEAP32[$27>>2]|0;
 $29 = (+($28|0));
 $30 = $26 / $29;
 _rlTexCoord2f($23,$30);
 _rlVertex2f(0.0,0.0);
 $31 = HEAP32[$sourceRec>>2]|0;
 $32 = (+($31|0));
 $33 = HEAP32[$20>>2]|0;
 $34 = (+($33|0));
 $35 = $32 / $34;
 $36 = HEAP32[$24>>2]|0;
 $37 = ((($sourceRec)) + 12|0);
 $38 = HEAP32[$37>>2]|0;
 $39 = (($38) + ($36))|0;
 $40 = (+($39|0));
 $41 = HEAP32[$27>>2]|0;
 $42 = (+($41|0));
 $43 = $40 / $42;
 _rlTexCoord2f($35,$43);
 $44 = ((($destRec)) + 12|0);
 $45 = HEAP32[$44>>2]|0;
 $46 = (+($45|0));
 _rlVertex2f(0.0,$46);
 $47 = HEAP32[$sourceRec>>2]|0;
 $48 = ((($sourceRec)) + 8|0);
 $49 = HEAP32[$48>>2]|0;
 $50 = (($49) + ($47))|0;
 $51 = (+($50|0));
 $52 = HEAP32[$20>>2]|0;
 $53 = (+($52|0));
 $54 = $51 / $53;
 $55 = HEAP32[$24>>2]|0;
 $56 = HEAP32[$37>>2]|0;
 $57 = (($56) + ($55))|0;
 $58 = (+($57|0));
 $59 = HEAP32[$27>>2]|0;
 $60 = (+($59|0));
 $61 = $58 / $60;
 _rlTexCoord2f($54,$61);
 $62 = ((($destRec)) + 8|0);
 $63 = HEAP32[$62>>2]|0;
 $64 = (+($63|0));
 $65 = HEAP32[$44>>2]|0;
 $66 = (+($65|0));
 _rlVertex2f($64,$66);
 $67 = HEAP32[$sourceRec>>2]|0;
 $68 = HEAP32[$48>>2]|0;
 $69 = (($68) + ($67))|0;
 $70 = (+($69|0));
 $71 = HEAP32[$20>>2]|0;
 $72 = (+($71|0));
 $73 = $70 / $72;
 $74 = HEAP32[$24>>2]|0;
 $75 = (+($74|0));
 $76 = HEAP32[$27>>2]|0;
 $77 = (+($76|0));
 $78 = $75 / $77;
 _rlTexCoord2f($73,$78);
 $79 = HEAP32[$62>>2]|0;
 $80 = (+($79|0));
 _rlVertex2f($80,0.0);
 _rlEnd();
 _rlPopMatrix();
 return;
}
function _LoadDefaultFont() {
 var $$ = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $counter$011 = 0, $currentLine$06 = 0;
 var $currentLine$1 = 0, $currentPosX$07 = 0, $currentPosX$1 = 0, $exitcond = 0, $i$012 = 0, $i1$010 = 0, $i2$08 = 0, $image = 0, $image$byval_copy1 = 0, $j$09 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $image$byval_copy1 = sp + 44|0;
 $vararg_buffer = sp;
 $image = sp + 24|0;
 $0 = sp + 4|0;
 HEAP32[(1944)>>2] = 224;
 $1 = (_malloc(65536)|0);
 $i$012 = 0;
 while(1) {
  $2 = (($1) + ($i$012<<2)|0);
  $3 = (($i$012) + 1)|0;
  $exitcond = ($3|0)==(16384);
  HEAP8[$2>>0]=0&255;HEAP8[$2+1>>0]=(0>>8)&255;HEAP8[$2+2>>0]=(0>>16)&255;HEAP8[$2+3>>0]=0>>24;
  if ($exitcond) {
   $counter$011 = 0;$i1$010 = 0;
   break;
  } else {
   $i$012 = $3;
  }
 }
 while(1) {
  $4 = (1956 + ($counter$011<<2)|0);
  $5 = HEAP32[$4>>2]|0;
  $j$09 = 31;
  while(1) {
   $6 = 1 << $j$09;
   $7 = $5 & $6;
   $8 = ($7|0)==(0);
   if (!($8)) {
    $9 = (($j$09) + ($i1$010))|0;
    $10 = (($1) + ($9<<2)|0);
    HEAP8[$10>>0]=-1&255;HEAP8[$10+1>>0]=(-1>>8)&255;HEAP8[$10+2>>0]=(-1>>16)&255;HEAP8[$10+3>>0]=-1>>24;
   }
   $11 = (($j$09) + -1)|0;
   $12 = ($j$09|0)>(0);
   if ($12) {
    $j$09 = $11;
   } else {
    break;
   }
  }
  $13 = (($counter$011) + 1)|0;
  $14 = ($counter$011|0)>(511);
  $$ = $14 ? 0 : $13;
  $15 = (($i1$010) + 32)|0;
  $16 = ($15|0)<(16384);
  if ($16) {
   $counter$011 = $$;$i1$010 = $15;
  } else {
   break;
  }
 }
 _LoadImageEx($image,$1,128,128);
 _ImageConvertFormat($image,2);
 _free($1);
 ;HEAP32[$image$byval_copy1>>2]=HEAP32[$image>>2]|0;HEAP32[$image$byval_copy1+4>>2]=HEAP32[$image+4>>2]|0;HEAP32[$image$byval_copy1+8>>2]=HEAP32[$image+8>>2]|0;HEAP32[$image$byval_copy1+12>>2]=HEAP32[$image+12>>2]|0;HEAP32[$image$byval_copy1+16>>2]=HEAP32[$image+16>>2]|0;
 _LoadTextureFromImage($0,$image$byval_copy1);
 ;HEAP32[1920>>2]=HEAP32[$0>>2]|0;HEAP32[1920+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[1920+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[1920+12>>2]=HEAP32[$0+12>>2]|0;HEAP32[1920+16>>2]=HEAP32[$0+16>>2]|0;
 ;HEAP32[$image$byval_copy1>>2]=HEAP32[$image>>2]|0;HEAP32[$image$byval_copy1+4>>2]=HEAP32[$image+4>>2]|0;HEAP32[$image$byval_copy1+8>>2]=HEAP32[$image+8>>2]|0;HEAP32[$image$byval_copy1+12>>2]=HEAP32[$image+12>>2]|0;HEAP32[$image$byval_copy1+16>>2]=HEAP32[$image+16>>2]|0;
 _UnloadImage($image$byval_copy1);
 $17 = HEAP32[(1944)>>2]|0;
 $18 = $17 << 2;
 $19 = (_malloc($18)|0);
 HEAP32[(1948)>>2] = $19;
 $20 = HEAP32[(1944)>>2]|0;
 $21 = $20 << 4;
 $22 = (_malloc($21)|0);
 HEAP32[(1952)>>2] = $22;
 $23 = HEAP32[(1944)>>2]|0;
 $24 = ($23|0)>(0);
 if (!($24)) {
  $53 = HEAP32[(1952)>>2]|0;
  $54 = ((($53)) + 4|0);
  $55 = HEAP32[$54>>2]|0;
  HEAP32[(1940)>>2] = $55;
  $56 = HEAP32[1920>>2]|0;
  HEAP32[$vararg_buffer>>2] = $56;
  _TraceLog(0,9152,$vararg_buffer);
  STACKTOP = sp;return;
 }
 $25 = HEAP32[(1948)>>2]|0;
 $26 = HEAP32[(1952)>>2]|0;
 $currentLine$06 = 0;$currentPosX$07 = 1;$i2$08 = 0;
 while(1) {
  $27 = (($i2$08) + 32)|0;
  $28 = (($25) + ($i2$08<<2)|0);
  HEAP32[$28>>2] = $27;
  $29 = (($26) + ($i2$08<<4)|0);
  HEAP32[$29>>2] = $currentPosX$07;
  $30 = ($currentLine$06*11)|0;
  $31 = (($30) + 1)|0;
  $32 = (((($26) + ($i2$08<<4)|0)) + 4|0);
  HEAP32[$32>>2] = $31;
  $33 = (4004 + ($i2$08<<2)|0);
  $34 = HEAP32[$33>>2]|0;
  $35 = (((($26) + ($i2$08<<4)|0)) + 8|0);
  HEAP32[$35>>2] = $34;
  $36 = (((($26) + ($i2$08<<4)|0)) + 12|0);
  HEAP32[$36>>2] = 10;
  $37 = (((($26) + ($i2$08<<4)|0)) + 8|0);
  $38 = HEAP32[$37>>2]|0;
  $39 = (($currentPosX$07) + 1)|0;
  $40 = (($39) + ($38))|0;
  $41 = HEAP32[(1924)>>2]|0;
  $42 = ($40|0)<($41|0);
  if ($42) {
   $currentLine$1 = $currentLine$06;$currentPosX$1 = $40;
  } else {
   $43 = (($currentLine$06) + 1)|0;
   $44 = HEAP32[$33>>2]|0;
   $45 = (($44) + 2)|0;
   $46 = (($26) + ($i2$08<<4)|0);
   HEAP32[$46>>2] = 1;
   $47 = ($43*11)|0;
   $48 = (($47) + 1)|0;
   $49 = (((($26) + ($i2$08<<4)|0)) + 4|0);
   HEAP32[$49>>2] = $48;
   $currentLine$1 = $43;$currentPosX$1 = $45;
  }
  $50 = (($i2$08) + 1)|0;
  $51 = HEAP32[(1944)>>2]|0;
  $52 = ($50|0)<($51|0);
  if ($52) {
   $currentLine$06 = $currentLine$1;$currentPosX$07 = $currentPosX$1;$i2$08 = $50;
  } else {
   break;
  }
 }
 $53 = HEAP32[(1952)>>2]|0;
 $54 = ((($53)) + 4|0);
 $55 = HEAP32[$54>>2]|0;
 HEAP32[(1940)>>2] = $55;
 $56 = HEAP32[1920>>2]|0;
 HEAP32[$vararg_buffer>>2] = $56;
 _TraceLog(0,9152,$vararg_buffer);
 STACKTOP = sp;return;
}
function _UnloadDefaultFont() {
 var $$byval_copy = 0, $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy = sp;
 ;HEAP32[$$byval_copy>>2]=HEAP32[1920>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[1920+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[1920+8>>2]|0;HEAP32[$$byval_copy+12>>2]=HEAP32[1920+12>>2]|0;HEAP32[$$byval_copy+16>>2]=HEAP32[1920+16>>2]|0;
 _UnloadTexture($$byval_copy);
 $0 = HEAP32[(1948)>>2]|0;
 _free($0);
 $1 = HEAP32[(1952)>>2]|0;
 _free($1);
 STACKTOP = sp;return;
}
function _DrawText($text,$posX,$posY,$fontSize,$color) {
 $text = $text|0;
 $posX = $posX|0;
 $posY = $posY|0;
 $fontSize = $fontSize|0;
 $color = $color|0;
 var $$fontSize = 0, $0 = 0.0, $1 = 0, $2 = 0.0, $3 = 0, $4 = 0, $color$byval_copy = 0, $defaultFont$byval_copy = 0, $position = 0, $position$byval_copy = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $color$byval_copy = sp + 56|0;
 $position$byval_copy = sp + 48|0;
 $defaultFont$byval_copy = sp + 8|0;
 $position = sp;
 $0 = (+($posX|0));
 HEAPF32[$position>>2] = $0;
 $1 = ((($position)) + 4|0);
 $2 = (+($posY|0));
 HEAPF32[$1>>2] = $2;
 $3 = ($fontSize|0)<(10);
 $$fontSize = $3 ? 10 : $fontSize;
 $4 = (($$fontSize|0) / 10)&-1;
 dest=$defaultFont$byval_copy; src=1920; stop=dest+36|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 ;HEAP32[$position$byval_copy>>2]=HEAP32[$position>>2]|0;HEAP32[$position$byval_copy+4>>2]=HEAP32[$position+4>>2]|0;
 ;HEAP8[$color$byval_copy>>0]=HEAP8[$color>>0]|0;HEAP8[$color$byval_copy+1>>0]=HEAP8[$color+1>>0]|0;HEAP8[$color$byval_copy+2>>0]=HEAP8[$color+2>>0]|0;HEAP8[$color$byval_copy+3>>0]=HEAP8[$color+3>>0]|0;
 _DrawTextEx($defaultFont$byval_copy,$text,$position$byval_copy,$$fontSize,$4,$color$byval_copy);
 STACKTOP = sp;return;
}
function _DrawTextEx($spriteFont,$text,$position,$fontSize,$spacing,$tint) {
 $spriteFont = $spriteFont|0;
 $text = $text|0;
 $position = $position|0;
 $fontSize = $fontSize|0;
 $spacing = $spacing|0;
 $tint = $tint|0;
 var $$byval_copy = 0, $$byval_copy1 = 0, $$byval_copy2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0.0, $12 = 0, $13 = 0.0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0.0, $43 = 0.0, $44 = 0, $45 = 0, $46 = 0.0, $47 = 0.0, $48 = 0, $49 = 0, $5 = 0, $50 = 0.0, $51 = 0.0, $52 = 0, $53 = 0, $54 = 0.0, $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0, $59 = 0, $6 = 0;
 var $60 = 0, $7 = 0, $8 = 0.0, $9 = 0.0, $i$03 = 0, $i$1 = 0, $offsetX$04 = 0, $rec = 0, $rec$byval_copy = 0, $tint$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $tint$byval_copy = sp + 104|0;
 $$byval_copy2 = sp + 96|0;
 $$byval_copy1 = sp + 80|0;
 $rec$byval_copy = sp + 64|0;
 $$byval_copy = sp + 40|0;
 $rec = sp + 24|0;
 $0 = sp + 8|0;
 $1 = sp;
 $2 = (_strlen($text)|0);
 $3 = (+($fontSize|0));
 $4 = ((($spriteFont)) + 32|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ((($5)) + 12|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = (+($7|0));
 $9 = $3 / $8;
 $10 = ($2|0)>(0);
 if (!($10)) {
  STACKTOP = sp;return;
 }
 $11 = +HEAPF32[$position>>2];
 $12 = ((($position)) + 4|0);
 $13 = +HEAPF32[$12>>2];
 $14 = (~~(($13)));
 $15 = ((($rec)) + 8|0);
 $16 = ((($rec)) + 12|0);
 $17 = ((($0)) + 4|0);
 $18 = ((($0)) + 8|0);
 $19 = ((($0)) + 12|0);
 $20 = ((($1)) + 4|0);
 $21 = (+($spacing|0));
 $i$03 = 0;$offsetX$04 = 0;
 while(1) {
  $22 = (($text) + ($i$03)|0);
  $23 = HEAP8[$22>>0]|0;
  switch ($23<<24>>24) {
  case -62:  {
   $24 = (($i$03) + 1)|0;
   $25 = (($text) + ($24)|0);
   $26 = HEAP8[$25>>0]|0;
   $27 = $26&255;
   $28 = (($27) + -32)|0;
   $29 = HEAP32[$4>>2]|0;
   $30 = (($29) + ($28<<4)|0);
   ;HEAP32[$rec>>2]=HEAP32[$30>>2]|0;HEAP32[$rec+4>>2]=HEAP32[$30+4>>2]|0;HEAP32[$rec+8>>2]=HEAP32[$30+8>>2]|0;HEAP32[$rec+12>>2]=HEAP32[$30+12>>2]|0;
   $i$1 = $24;
   break;
  }
  case -61:  {
   $31 = (($i$03) + 1)|0;
   $32 = (($text) + ($31)|0);
   $33 = HEAP8[$32>>0]|0;
   $34 = $33&255;
   $35 = (($34) + 32)|0;
   $36 = HEAP32[$4>>2]|0;
   $37 = (($36) + ($35<<4)|0);
   ;HEAP32[$rec>>2]=HEAP32[$37>>2]|0;HEAP32[$rec+4>>2]=HEAP32[$37+4>>2]|0;HEAP32[$rec+8>>2]=HEAP32[$37+8>>2]|0;HEAP32[$rec+12>>2]=HEAP32[$37+12>>2]|0;
   $i$1 = $31;
   break;
  }
  default: {
   $38 = $23 << 24 >> 24;
   $39 = (($38) + -32)|0;
   $40 = HEAP32[$4>>2]|0;
   $41 = (($40) + ($39<<4)|0);
   ;HEAP32[$rec>>2]=HEAP32[$41>>2]|0;HEAP32[$rec+4>>2]=HEAP32[$41+4>>2]|0;HEAP32[$rec+8>>2]=HEAP32[$41+8>>2]|0;HEAP32[$rec+12>>2]=HEAP32[$41+12>>2]|0;
   $i$1 = $i$03;
  }
  }
  $42 = (+($offsetX$04|0));
  $43 = $42 + $11;
  $44 = (~~(($43)));
  $45 = HEAP32[$15>>2]|0;
  $46 = (+($45|0));
  $47 = $9 * $46;
  $48 = (~~(($47)));
  $49 = HEAP32[$16>>2]|0;
  $50 = (+($49|0));
  $51 = $9 * $50;
  $52 = (~~(($51)));
  HEAP32[$0>>2] = $44;
  HEAP32[$17>>2] = $14;
  HEAP32[$18>>2] = $48;
  HEAP32[$19>>2] = $52;
  HEAPF32[$1>>2] = 0.0;
  HEAPF32[$20>>2] = 0.0;
  ;HEAP32[$$byval_copy>>2]=HEAP32[$spriteFont>>2]|0;HEAP32[$$byval_copy+4>>2]=HEAP32[$spriteFont+4>>2]|0;HEAP32[$$byval_copy+8>>2]=HEAP32[$spriteFont+8>>2]|0;HEAP32[$$byval_copy+12>>2]=HEAP32[$spriteFont+12>>2]|0;HEAP32[$$byval_copy+16>>2]=HEAP32[$spriteFont+16>>2]|0;
  ;HEAP32[$rec$byval_copy>>2]=HEAP32[$rec>>2]|0;HEAP32[$rec$byval_copy+4>>2]=HEAP32[$rec+4>>2]|0;HEAP32[$rec$byval_copy+8>>2]=HEAP32[$rec+8>>2]|0;HEAP32[$rec$byval_copy+12>>2]=HEAP32[$rec+12>>2]|0;
  ;HEAP32[$$byval_copy1>>2]=HEAP32[$0>>2]|0;HEAP32[$$byval_copy1+4>>2]=HEAP32[$0+4>>2]|0;HEAP32[$$byval_copy1+8>>2]=HEAP32[$0+8>>2]|0;HEAP32[$$byval_copy1+12>>2]=HEAP32[$0+12>>2]|0;
  ;HEAP32[$$byval_copy2>>2]=HEAP32[$1>>2]|0;HEAP32[$$byval_copy2+4>>2]=HEAP32[$1+4>>2]|0;
  ;HEAP8[$tint$byval_copy>>0]=HEAP8[$tint>>0]|0;HEAP8[$tint$byval_copy+1>>0]=HEAP8[$tint+1>>0]|0;HEAP8[$tint$byval_copy+2>>0]=HEAP8[$tint+2>>0]|0;HEAP8[$tint$byval_copy+3>>0]=HEAP8[$tint+3>>0]|0;
  _DrawTexturePro($$byval_copy,$rec$byval_copy,$$byval_copy1,$$byval_copy2,0.0,$tint$byval_copy);
  $53 = HEAP32[$15>>2]|0;
  $54 = (+($53|0));
  $55 = $9 * $54;
  $56 = $21 + $55;
  $57 = $42 + $56;
  $58 = (~~(($57)));
  $59 = (($i$1) + 1)|0;
  $60 = ($59|0)<($2|0);
  if ($60) {
   $i$03 = $59;$offsetX$04 = $58;
  } else {
   break;
  }
 }
 STACKTOP = sp;return;
}
function _VectorLength($v) {
 $v = $v|0;
 var $0 = 0.0, $1 = 0.0, $2 = 0, $3 = 0.0, $4 = 0.0, $5 = 0.0, $6 = 0, $7 = 0.0, $8 = 0.0, $9 = 0.0, $sqrtf = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = +HEAPF32[$v>>2];
 $1 = $0 * $0;
 $2 = ((($v)) + 4|0);
 $3 = +HEAPF32[$2>>2];
 $4 = $3 * $3;
 $5 = $1 + $4;
 $6 = ((($v)) + 8|0);
 $7 = +HEAPF32[$6>>2];
 $8 = $7 * $7;
 $9 = $5 + $8;
 $sqrtf = (+Math_sqrt((+$9)));
 return (+$sqrtf);
}
function _VectorNormalize($v) {
 $v = $v|0;
 var $$op = 0.0, $0 = 0.0, $1 = 0, $10 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0.0, $v$byval_copy = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $v$byval_copy = sp;
 ;HEAP32[$v$byval_copy>>2]=HEAP32[$v>>2]|0;HEAP32[$v$byval_copy+4>>2]=HEAP32[$v+4>>2]|0;HEAP32[$v$byval_copy+8>>2]=HEAP32[$v+8>>2]|0;
 $0 = (+_VectorLength($v$byval_copy));
 $1 = $0 == 0.0;
 $$op = 1.0 / $0;
 $2 = $1 ? 1.0 : $$op;
 $3 = +HEAPF32[$v>>2];
 $4 = $3 * $2;
 HEAPF32[$v>>2] = $4;
 $5 = ((($v)) + 4|0);
 $6 = +HEAPF32[$5>>2];
 $7 = $2 * $6;
 HEAPF32[$5>>2] = $7;
 $8 = ((($v)) + 8|0);
 $9 = +HEAPF32[$8>>2];
 $10 = $2 * $9;
 HEAPF32[$8>>2] = $10;
 STACKTOP = sp;return;
}
function _VectorTransform($v,$mat) {
 $v = $v|0;
 $mat = $mat|0;
 var $0 = 0.0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0.0, $17 = 0.0, $18 = 0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0.0, $24 = 0.0, $25 = 0, $26 = 0.0;
 var $27 = 0.0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0.0, $35 = 0, $36 = 0.0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0.0, $40 = 0.0, $41 = 0.0, $42 = 0.0, $43 = 0, $44 = 0.0;
 var $45 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0, $8 = 0.0, $9 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = +HEAPF32[$v>>2];
 $1 = ((($v)) + 4|0);
 $2 = +HEAPF32[$1>>2];
 $3 = ((($v)) + 8|0);
 $4 = +HEAPF32[$3>>2];
 $5 = +HEAPF32[$mat>>2];
 $6 = $0 * $5;
 $7 = ((($mat)) + 4|0);
 $8 = +HEAPF32[$7>>2];
 $9 = $2 * $8;
 $10 = $6 + $9;
 $11 = ((($mat)) + 8|0);
 $12 = +HEAPF32[$11>>2];
 $13 = $4 * $12;
 $14 = $10 + $13;
 $15 = ((($mat)) + 12|0);
 $16 = +HEAPF32[$15>>2];
 $17 = $16 + $14;
 HEAPF32[$v>>2] = $17;
 $18 = ((($mat)) + 16|0);
 $19 = +HEAPF32[$18>>2];
 $20 = $0 * $19;
 $21 = ((($mat)) + 20|0);
 $22 = +HEAPF32[$21>>2];
 $23 = $2 * $22;
 $24 = $20 + $23;
 $25 = ((($mat)) + 24|0);
 $26 = +HEAPF32[$25>>2];
 $27 = $4 * $26;
 $28 = $24 + $27;
 $29 = ((($mat)) + 28|0);
 $30 = +HEAPF32[$29>>2];
 $31 = $30 + $28;
 HEAPF32[$1>>2] = $31;
 $32 = ((($mat)) + 32|0);
 $33 = +HEAPF32[$32>>2];
 $34 = $0 * $33;
 $35 = ((($mat)) + 36|0);
 $36 = +HEAPF32[$35>>2];
 $37 = $2 * $36;
 $38 = $34 + $37;
 $39 = ((($mat)) + 40|0);
 $40 = +HEAPF32[$39>>2];
 $41 = $4 * $40;
 $42 = $38 + $41;
 $43 = ((($mat)) + 44|0);
 $44 = +HEAPF32[$43>>2];
 $45 = $44 + $42;
 HEAPF32[$3>>2] = $45;
 return;
}
function _VectorZero($agg$result) {
 $agg$result = $agg$result|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 ;HEAP32[$agg$result>>2]=0|0;HEAP32[$agg$result+4>>2]=0|0;HEAP32[$agg$result+8>>2]=0|0;
 return;
}
function _GetMatrixVector($mat) {
 $mat = $mat|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[$mat>>2]|0;
 HEAP32[4900>>2] = $0;
 $1 = ((($mat)) + 4|0);
 $2 = HEAP32[$1>>2]|0;
 HEAP32[(4904)>>2] = $2;
 $3 = ((($mat)) + 8|0);
 $4 = HEAP32[$3>>2]|0;
 HEAP32[(4908)>>2] = $4;
 $5 = ((($mat)) + 12|0);
 $6 = HEAP32[$5>>2]|0;
 HEAP32[(4912)>>2] = $6;
 $7 = ((($mat)) + 16|0);
 $8 = HEAP32[$7>>2]|0;
 HEAP32[(4916)>>2] = $8;
 $9 = ((($mat)) + 20|0);
 $10 = HEAP32[$9>>2]|0;
 HEAP32[(4920)>>2] = $10;
 $11 = ((($mat)) + 24|0);
 $12 = HEAP32[$11>>2]|0;
 HEAP32[(4924)>>2] = $12;
 $13 = ((($mat)) + 28|0);
 $14 = HEAP32[$13>>2]|0;
 HEAP32[(4928)>>2] = $14;
 $15 = ((($mat)) + 32|0);
 $16 = HEAP32[$15>>2]|0;
 HEAP32[(4932)>>2] = $16;
 $17 = ((($mat)) + 36|0);
 $18 = HEAP32[$17>>2]|0;
 HEAP32[(4936)>>2] = $18;
 $19 = ((($mat)) + 40|0);
 $20 = HEAP32[$19>>2]|0;
 HEAP32[(4940)>>2] = $20;
 $21 = ((($mat)) + 44|0);
 $22 = HEAP32[$21>>2]|0;
 HEAP32[(4944)>>2] = $22;
 $23 = ((($mat)) + 48|0);
 $24 = HEAP32[$23>>2]|0;
 HEAP32[(4948)>>2] = $24;
 $25 = ((($mat)) + 52|0);
 $26 = HEAP32[$25>>2]|0;
 HEAP32[(4952)>>2] = $26;
 $27 = ((($mat)) + 56|0);
 $28 = HEAP32[$27>>2]|0;
 HEAP32[(4956)>>2] = $28;
 $29 = ((($mat)) + 60|0);
 $30 = HEAP32[$29>>2]|0;
 HEAP32[(4960)>>2] = $30;
 return (4900|0);
}
function _MatrixTranspose($mat) {
 $mat = $mat|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($mat)) + 4|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ((($mat)) + 8|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ((($mat)) + 12|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = ((($mat)) + 16|0);
 $7 = HEAP32[$6>>2]|0;
 $8 = ((($mat)) + 24|0);
 $9 = HEAP32[$8>>2]|0;
 $10 = ((($mat)) + 28|0);
 $11 = HEAP32[$10>>2]|0;
 $12 = ((($mat)) + 32|0);
 $13 = HEAP32[$12>>2]|0;
 $14 = ((($mat)) + 36|0);
 $15 = HEAP32[$14>>2]|0;
 $16 = ((($mat)) + 44|0);
 $17 = HEAP32[$16>>2]|0;
 $18 = ((($mat)) + 48|0);
 $19 = HEAP32[$18>>2]|0;
 $20 = ((($mat)) + 52|0);
 $21 = HEAP32[$20>>2]|0;
 $22 = ((($mat)) + 56|0);
 $23 = HEAP32[$22>>2]|0;
 HEAP32[$0>>2] = $7;
 HEAP32[$2>>2] = $13;
 HEAP32[$4>>2] = $19;
 HEAP32[$6>>2] = $1;
 HEAP32[$8>>2] = $15;
 HEAP32[$10>>2] = $21;
 HEAP32[$12>>2] = $3;
 HEAP32[$14>>2] = $9;
 HEAP32[$16>>2] = $23;
 HEAP32[$18>>2] = $5;
 HEAP32[$20>>2] = $11;
 HEAP32[$22>>2] = $17;
 return;
}
function _MatrixIdentity($agg$result) {
 $agg$result = $agg$result|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $result$sroa$5 = 0, $result$sroa$6 = 0, $result$sroa$7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $result$sroa$5 = sp + 32|0;
 $result$sroa$6 = sp + 16|0;
 $result$sroa$7 = sp;
 ;HEAP32[$result$sroa$5>>2]=0|0;HEAP32[$result$sroa$5+4>>2]=0|0;HEAP32[$result$sroa$5+8>>2]=0|0;HEAP32[$result$sroa$5+12>>2]=0|0;
 ;HEAP32[$result$sroa$6>>2]=0|0;HEAP32[$result$sroa$6+4>>2]=0|0;HEAP32[$result$sroa$6+8>>2]=0|0;HEAP32[$result$sroa$6+12>>2]=0|0;
 ;HEAP32[$result$sroa$7>>2]=0|0;HEAP32[$result$sroa$7+4>>2]=0|0;HEAP32[$result$sroa$7+8>>2]=0|0;HEAP32[$result$sroa$7+12>>2]=0|0;
 HEAPF32[$agg$result>>2] = 1.0;
 $0 = ((($agg$result)) + 4|0);
 ;HEAP32[$0>>2]=HEAP32[$result$sroa$5>>2]|0;HEAP32[$0+4>>2]=HEAP32[$result$sroa$5+4>>2]|0;HEAP32[$0+8>>2]=HEAP32[$result$sroa$5+8>>2]|0;HEAP32[$0+12>>2]=HEAP32[$result$sroa$5+12>>2]|0;
 $1 = ((($agg$result)) + 20|0);
 HEAPF32[$1>>2] = 1.0;
 $2 = ((($agg$result)) + 24|0);
 ;HEAP32[$2>>2]=HEAP32[$result$sroa$6>>2]|0;HEAP32[$2+4>>2]=HEAP32[$result$sroa$6+4>>2]|0;HEAP32[$2+8>>2]=HEAP32[$result$sroa$6+8>>2]|0;HEAP32[$2+12>>2]=HEAP32[$result$sroa$6+12>>2]|0;
 $3 = ((($agg$result)) + 40|0);
 HEAPF32[$3>>2] = 1.0;
 $4 = ((($agg$result)) + 44|0);
 ;HEAP32[$4>>2]=HEAP32[$result$sroa$7>>2]|0;HEAP32[$4+4>>2]=HEAP32[$result$sroa$7+4>>2]|0;HEAP32[$4+8>>2]=HEAP32[$result$sroa$7+8>>2]|0;HEAP32[$4+12>>2]=HEAP32[$result$sroa$7+12>>2]|0;
 $5 = ((($agg$result)) + 60|0);
 HEAPF32[$5>>2] = 1.0;
 STACKTOP = sp;return;
}
function _MatrixTranslate($agg$result,$x,$y,$z) {
 $agg$result = $agg$result|0;
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAPF32[$agg$result>>2] = 1.0;
 $0 = ((($agg$result)) + 4|0);
 $1 = ((($agg$result)) + 20|0);
 ;HEAP32[$0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;
 HEAPF32[$1>>2] = 1.0;
 $2 = ((($agg$result)) + 24|0);
 $3 = ((($agg$result)) + 40|0);
 ;HEAP32[$2>>2]=0|0;HEAP32[$2+4>>2]=0|0;HEAP32[$2+8>>2]=0|0;HEAP32[$2+12>>2]=0|0;
 HEAPF32[$3>>2] = 1.0;
 $4 = ((($agg$result)) + 44|0);
 HEAPF32[$4>>2] = 0.0;
 $5 = ((($agg$result)) + 48|0);
 HEAPF32[$5>>2] = $x;
 $6 = ((($agg$result)) + 52|0);
 HEAPF32[$6>>2] = $y;
 $7 = ((($agg$result)) + 56|0);
 HEAPF32[$7>>2] = $z;
 $8 = ((($agg$result)) + 60|0);
 HEAPF32[$8>>2] = 1.0;
 return;
}
function _MatrixRotate($agg$result,$angle,$axis) {
 $agg$result = $agg$result|0;
 $angle = +$angle;
 $axis = $axis|0;
 var $0 = 0.0, $1 = 0, $10 = 0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0.0, $118 = 0.0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0.0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0.0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0;
 var $19 = 0.0, $2 = 0.0, $20 = 0, $21 = 0.0, $22 = 0, $23 = 0.0, $24 = 0, $25 = 0.0, $26 = 0, $27 = 0.0, $28 = 0, $29 = 0.0, $3 = 0, $30 = 0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0;
 var $37 = 0.0, $38 = 0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0.0, $44 = 0.0, $45 = 0.0, $46 = 0.0, $47 = 0.0, $48 = 0.0, $49 = 0.0, $5 = 0.0, $50 = 0.0, $51 = 0.0, $52 = 0.0, $53 = 0.0, $54 = 0.0;
 var $55 = 0.0, $56 = 0.0, $57 = 0.0, $58 = 0.0, $59 = 0.0, $6 = 0.0, $60 = 0.0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0.0, $70 = 0.0, $71 = 0.0, $72 = 0.0;
 var $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0.0, $90 = 0.0;
 var $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, $mat = 0, $or$cond = 0, $sqrtf = 0.0, $x$0 = 0.0, $y$0 = 0.0, $z$0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $mat = sp;
 _MatrixIdentity($mat);
 $0 = +HEAPF32[$axis>>2];
 $1 = ((($axis)) + 4|0);
 $2 = +HEAPF32[$1>>2];
 $3 = ((($axis)) + 8|0);
 $4 = +HEAPF32[$3>>2];
 $5 = $0 * $0;
 $6 = $2 * $2;
 $7 = $5 + $6;
 $8 = $4 * $4;
 $9 = $7 + $8;
 $sqrtf = (+Math_sqrt((+$9)));
 $10 = $sqrtf != 1.0;
 $11 = $sqrtf != 0.0;
 $or$cond = $10 & $11;
 if ($or$cond) {
  $12 = 1.0 / $sqrtf;
  $13 = $0 * $12;
  $14 = $2 * $12;
  $15 = $4 * $12;
  $x$0 = $13;$y$0 = $14;$z$0 = $15;
 } else {
  $x$0 = $0;$y$0 = $2;$z$0 = $4;
 }
 $16 = (+Math_sin((+$angle)));
 $17 = (+Math_cos((+$angle)));
 $18 = 1.0 - $17;
 $19 = +HEAPF32[$mat>>2];
 $20 = ((($mat)) + 16|0);
 $21 = +HEAPF32[$20>>2];
 $22 = ((($mat)) + 32|0);
 $23 = +HEAPF32[$22>>2];
 $24 = ((($mat)) + 48|0);
 $25 = +HEAPF32[$24>>2];
 $26 = ((($mat)) + 4|0);
 $27 = +HEAPF32[$26>>2];
 $28 = ((($mat)) + 20|0);
 $29 = +HEAPF32[$28>>2];
 $30 = ((($mat)) + 36|0);
 $31 = +HEAPF32[$30>>2];
 $32 = ((($mat)) + 52|0);
 $33 = +HEAPF32[$32>>2];
 $34 = ((($mat)) + 8|0);
 $35 = +HEAPF32[$34>>2];
 $36 = ((($mat)) + 24|0);
 $37 = +HEAPF32[$36>>2];
 $38 = ((($mat)) + 40|0);
 $39 = +HEAPF32[$38>>2];
 $40 = ((($mat)) + 56|0);
 $41 = +HEAPF32[$40>>2];
 $42 = $x$0 * $x$0;
 $43 = $42 * $18;
 $44 = $17 + $43;
 $45 = $y$0 * $x$0;
 $46 = $45 * $18;
 $47 = $z$0 * $16;
 $48 = $47 + $46;
 $49 = $z$0 * $x$0;
 $50 = $49 * $18;
 $51 = $y$0 * $16;
 $52 = $50 - $51;
 $53 = $46 - $47;
 $54 = $y$0 * $y$0;
 $55 = $54 * $18;
 $56 = $17 + $55;
 $57 = $z$0 * $y$0;
 $58 = $57 * $18;
 $59 = $x$0 * $16;
 $60 = $59 + $58;
 $61 = $51 + $50;
 $62 = $58 - $59;
 $63 = $z$0 * $z$0;
 $64 = $63 * $18;
 $65 = $17 + $64;
 $66 = $19 * $44;
 $67 = $48 * $27;
 $68 = $66 + $67;
 $69 = $52 * $35;
 $70 = $68 + $69;
 $71 = $21 * $44;
 $72 = $48 * $29;
 $73 = $71 + $72;
 $74 = $52 * $37;
 $75 = $73 + $74;
 $76 = $23 * $44;
 $77 = $48 * $31;
 $78 = $76 + $77;
 $79 = $52 * $39;
 $80 = $78 + $79;
 $81 = $44 * $25;
 $82 = $48 * $33;
 $83 = $81 + $82;
 $84 = $52 * $41;
 $85 = $83 + $84;
 $86 = $19 * $53;
 $87 = $56 * $27;
 $88 = $86 + $87;
 $89 = $60 * $35;
 $90 = $88 + $89;
 $91 = $21 * $53;
 $92 = $56 * $29;
 $93 = $91 + $92;
 $94 = $60 * $37;
 $95 = $93 + $94;
 $96 = $23 * $53;
 $97 = $56 * $31;
 $98 = $96 + $97;
 $99 = $60 * $39;
 $100 = $98 + $99;
 $101 = $53 * $25;
 $102 = $56 * $33;
 $103 = $101 + $102;
 $104 = $60 * $41;
 $105 = $103 + $104;
 $106 = $19 * $61;
 $107 = $62 * $27;
 $108 = $106 + $107;
 $109 = $65 * $35;
 $110 = $108 + $109;
 $111 = $21 * $61;
 $112 = $62 * $29;
 $113 = $111 + $112;
 $114 = $65 * $37;
 $115 = $113 + $114;
 $116 = $23 * $61;
 $117 = $62 * $31;
 $118 = $116 + $117;
 $119 = $65 * $39;
 $120 = $118 + $119;
 $121 = $61 * $25;
 $122 = $62 * $33;
 $123 = $121 + $122;
 $124 = $65 * $41;
 $125 = $123 + $124;
 $126 = ((($mat)) + 12|0);
 $127 = HEAP32[$126>>2]|0;
 $128 = ((($mat)) + 28|0);
 $129 = HEAP32[$128>>2]|0;
 $130 = ((($mat)) + 44|0);
 $131 = HEAP32[$130>>2]|0;
 $132 = ((($mat)) + 60|0);
 $133 = HEAP32[$132>>2]|0;
 HEAPF32[$agg$result>>2] = $70;
 $134 = ((($agg$result)) + 4|0);
 HEAPF32[$134>>2] = $90;
 $135 = ((($agg$result)) + 8|0);
 HEAPF32[$135>>2] = $110;
 $136 = ((($agg$result)) + 12|0);
 HEAP32[$136>>2] = $127;
 $137 = ((($agg$result)) + 16|0);
 HEAPF32[$137>>2] = $75;
 $138 = ((($agg$result)) + 20|0);
 HEAPF32[$138>>2] = $95;
 $139 = ((($agg$result)) + 24|0);
 HEAPF32[$139>>2] = $115;
 $140 = ((($agg$result)) + 28|0);
 HEAP32[$140>>2] = $129;
 $141 = ((($agg$result)) + 32|0);
 HEAPF32[$141>>2] = $80;
 $142 = ((($agg$result)) + 36|0);
 HEAPF32[$142>>2] = $100;
 $143 = ((($agg$result)) + 40|0);
 HEAPF32[$143>>2] = $120;
 $144 = ((($agg$result)) + 44|0);
 HEAP32[$144>>2] = $131;
 $145 = ((($agg$result)) + 48|0);
 HEAPF32[$145>>2] = $85;
 $146 = ((($agg$result)) + 52|0);
 HEAPF32[$146>>2] = $105;
 $147 = ((($agg$result)) + 56|0);
 HEAPF32[$147>>2] = $125;
 $148 = ((($agg$result)) + 60|0);
 HEAP32[$148>>2] = $133;
 STACKTOP = sp;return;
}
function _MatrixScale($agg$result,$x,$y,$z) {
 $agg$result = $agg$result|0;
 $x = +$x;
 $y = +$y;
 $z = +$z;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAPF32[$agg$result>>2] = $x;
 $0 = ((($agg$result)) + 4|0);
 $1 = ((($agg$result)) + 20|0);
 ;HEAP32[$0>>2]=0|0;HEAP32[$0+4>>2]=0|0;HEAP32[$0+8>>2]=0|0;HEAP32[$0+12>>2]=0|0;
 HEAPF32[$1>>2] = $y;
 $2 = ((($agg$result)) + 24|0);
 $3 = ((($agg$result)) + 40|0);
 ;HEAP32[$2>>2]=0|0;HEAP32[$2+4>>2]=0|0;HEAP32[$2+8>>2]=0|0;HEAP32[$2+12>>2]=0|0;
 HEAPF32[$3>>2] = $z;
 $4 = ((($agg$result)) + 44|0);
 $5 = ((($agg$result)) + 60|0);
 ;HEAP32[$4>>2]=0|0;HEAP32[$4+4>>2]=0|0;HEAP32[$4+8>>2]=0|0;HEAP32[$4+12>>2]=0|0;
 HEAPF32[$5>>2] = 1.0;
 return;
}
function _MatrixMultiply($agg$result,$left,$right) {
 $agg$result = $agg$result|0;
 $left = $left|0;
 $right = $right|0;
 var $0 = 0.0, $1 = 0, $10 = 0.0, $100 = 0.0, $101 = 0.0, $102 = 0.0, $103 = 0.0, $104 = 0.0, $105 = 0.0, $106 = 0.0, $107 = 0.0, $108 = 0.0, $109 = 0.0, $11 = 0, $110 = 0.0, $111 = 0.0, $112 = 0.0, $113 = 0.0, $114 = 0.0, $115 = 0.0;
 var $116 = 0.0, $117 = 0.0, $118 = 0.0, $119 = 0.0, $12 = 0.0, $120 = 0.0, $121 = 0.0, $122 = 0.0, $123 = 0.0, $124 = 0.0, $125 = 0.0, $126 = 0.0, $127 = 0.0, $128 = 0.0, $129 = 0.0, $13 = 0, $130 = 0.0, $131 = 0.0, $132 = 0.0, $133 = 0.0;
 var $134 = 0.0, $135 = 0.0, $136 = 0.0, $137 = 0.0, $138 = 0.0, $139 = 0.0, $14 = 0.0, $140 = 0.0, $141 = 0.0, $142 = 0.0, $143 = 0.0, $144 = 0.0, $145 = 0.0, $146 = 0.0, $147 = 0.0, $148 = 0.0, $149 = 0.0, $15 = 0, $150 = 0.0, $151 = 0.0;
 var $152 = 0.0, $153 = 0.0, $154 = 0.0, $155 = 0.0, $156 = 0.0, $157 = 0.0, $158 = 0.0, $159 = 0.0, $16 = 0.0, $160 = 0.0, $161 = 0.0, $162 = 0.0, $163 = 0.0, $164 = 0.0, $165 = 0.0, $166 = 0.0, $167 = 0.0, $168 = 0.0, $169 = 0.0, $17 = 0;
 var $170 = 0.0, $171 = 0.0, $172 = 0.0, $173 = 0.0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0.0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $19 = 0, $2 = 0.0, $20 = 0.0, $21 = 0, $22 = 0.0, $23 = 0, $24 = 0.0, $25 = 0, $26 = 0.0, $27 = 0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0.0, $31 = 0.0, $32 = 0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0;
 var $37 = 0.0, $38 = 0, $39 = 0.0, $4 = 0.0, $40 = 0, $41 = 0.0, $42 = 0, $43 = 0.0, $44 = 0, $45 = 0.0, $46 = 0, $47 = 0.0, $48 = 0, $49 = 0.0, $5 = 0, $50 = 0, $51 = 0.0, $52 = 0, $53 = 0.0, $54 = 0;
 var $55 = 0.0, $56 = 0, $57 = 0.0, $58 = 0, $59 = 0.0, $6 = 0.0, $60 = 0, $61 = 0.0, $62 = 0.0, $63 = 0.0, $64 = 0.0, $65 = 0.0, $66 = 0.0, $67 = 0.0, $68 = 0.0, $69 = 0.0, $7 = 0, $70 = 0.0, $71 = 0.0, $72 = 0.0;
 var $73 = 0.0, $74 = 0.0, $75 = 0.0, $76 = 0.0, $77 = 0.0, $78 = 0.0, $79 = 0.0, $8 = 0.0, $80 = 0.0, $81 = 0.0, $82 = 0.0, $83 = 0.0, $84 = 0.0, $85 = 0.0, $86 = 0.0, $87 = 0.0, $88 = 0.0, $89 = 0.0, $9 = 0, $90 = 0.0;
 var $91 = 0.0, $92 = 0.0, $93 = 0.0, $94 = 0.0, $95 = 0.0, $96 = 0.0, $97 = 0.0, $98 = 0.0, $99 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = +HEAPF32[$left>>2];
 $1 = ((($left)) + 16|0);
 $2 = +HEAPF32[$1>>2];
 $3 = ((($left)) + 32|0);
 $4 = +HEAPF32[$3>>2];
 $5 = ((($left)) + 48|0);
 $6 = +HEAPF32[$5>>2];
 $7 = ((($left)) + 4|0);
 $8 = +HEAPF32[$7>>2];
 $9 = ((($left)) + 20|0);
 $10 = +HEAPF32[$9>>2];
 $11 = ((($left)) + 36|0);
 $12 = +HEAPF32[$11>>2];
 $13 = ((($left)) + 52|0);
 $14 = +HEAPF32[$13>>2];
 $15 = ((($left)) + 8|0);
 $16 = +HEAPF32[$15>>2];
 $17 = ((($left)) + 24|0);
 $18 = +HEAPF32[$17>>2];
 $19 = ((($left)) + 40|0);
 $20 = +HEAPF32[$19>>2];
 $21 = ((($left)) + 56|0);
 $22 = +HEAPF32[$21>>2];
 $23 = ((($left)) + 12|0);
 $24 = +HEAPF32[$23>>2];
 $25 = ((($left)) + 28|0);
 $26 = +HEAPF32[$25>>2];
 $27 = ((($left)) + 44|0);
 $28 = +HEAPF32[$27>>2];
 $29 = ((($left)) + 60|0);
 $30 = +HEAPF32[$29>>2];
 $31 = +HEAPF32[$right>>2];
 $32 = ((($right)) + 16|0);
 $33 = +HEAPF32[$32>>2];
 $34 = ((($right)) + 32|0);
 $35 = +HEAPF32[$34>>2];
 $36 = ((($right)) + 48|0);
 $37 = +HEAPF32[$36>>2];
 $38 = ((($right)) + 4|0);
 $39 = +HEAPF32[$38>>2];
 $40 = ((($right)) + 20|0);
 $41 = +HEAPF32[$40>>2];
 $42 = ((($right)) + 36|0);
 $43 = +HEAPF32[$42>>2];
 $44 = ((($right)) + 52|0);
 $45 = +HEAPF32[$44>>2];
 $46 = ((($right)) + 8|0);
 $47 = +HEAPF32[$46>>2];
 $48 = ((($right)) + 24|0);
 $49 = +HEAPF32[$48>>2];
 $50 = ((($right)) + 40|0);
 $51 = +HEAPF32[$50>>2];
 $52 = ((($right)) + 56|0);
 $53 = +HEAPF32[$52>>2];
 $54 = ((($right)) + 12|0);
 $55 = +HEAPF32[$54>>2];
 $56 = ((($right)) + 28|0);
 $57 = +HEAPF32[$56>>2];
 $58 = ((($right)) + 44|0);
 $59 = +HEAPF32[$58>>2];
 $60 = ((($right)) + 60|0);
 $61 = +HEAPF32[$60>>2];
 $62 = $0 * $31;
 $63 = $8 * $33;
 $64 = $62 + $63;
 $65 = $16 * $35;
 $66 = $64 + $65;
 $67 = $24 * $37;
 $68 = $66 + $67;
 $69 = $2 * $31;
 $70 = $10 * $33;
 $71 = $69 + $70;
 $72 = $18 * $35;
 $73 = $71 + $72;
 $74 = $26 * $37;
 $75 = $73 + $74;
 $76 = $4 * $31;
 $77 = $12 * $33;
 $78 = $76 + $77;
 $79 = $20 * $35;
 $80 = $78 + $79;
 $81 = $28 * $37;
 $82 = $80 + $81;
 $83 = $6 * $31;
 $84 = $14 * $33;
 $85 = $83 + $84;
 $86 = $22 * $35;
 $87 = $85 + $86;
 $88 = $30 * $37;
 $89 = $87 + $88;
 $90 = $0 * $39;
 $91 = $8 * $41;
 $92 = $90 + $91;
 $93 = $16 * $43;
 $94 = $92 + $93;
 $95 = $24 * $45;
 $96 = $94 + $95;
 $97 = $2 * $39;
 $98 = $10 * $41;
 $99 = $97 + $98;
 $100 = $18 * $43;
 $101 = $99 + $100;
 $102 = $26 * $45;
 $103 = $101 + $102;
 $104 = $4 * $39;
 $105 = $12 * $41;
 $106 = $104 + $105;
 $107 = $20 * $43;
 $108 = $106 + $107;
 $109 = $28 * $45;
 $110 = $108 + $109;
 $111 = $6 * $39;
 $112 = $14 * $41;
 $113 = $111 + $112;
 $114 = $22 * $43;
 $115 = $113 + $114;
 $116 = $30 * $45;
 $117 = $115 + $116;
 $118 = $0 * $47;
 $119 = $8 * $49;
 $120 = $118 + $119;
 $121 = $16 * $51;
 $122 = $120 + $121;
 $123 = $24 * $53;
 $124 = $122 + $123;
 $125 = $2 * $47;
 $126 = $10 * $49;
 $127 = $125 + $126;
 $128 = $18 * $51;
 $129 = $127 + $128;
 $130 = $26 * $53;
 $131 = $129 + $130;
 $132 = $4 * $47;
 $133 = $12 * $49;
 $134 = $132 + $133;
 $135 = $20 * $51;
 $136 = $134 + $135;
 $137 = $28 * $53;
 $138 = $136 + $137;
 $139 = $6 * $47;
 $140 = $14 * $49;
 $141 = $139 + $140;
 $142 = $22 * $51;
 $143 = $141 + $142;
 $144 = $30 * $53;
 $145 = $143 + $144;
 $146 = $0 * $55;
 $147 = $8 * $57;
 $148 = $146 + $147;
 $149 = $16 * $59;
 $150 = $148 + $149;
 $151 = $24 * $61;
 $152 = $150 + $151;
 $153 = $2 * $55;
 $154 = $10 * $57;
 $155 = $153 + $154;
 $156 = $18 * $59;
 $157 = $155 + $156;
 $158 = $26 * $61;
 $159 = $157 + $158;
 $160 = $4 * $55;
 $161 = $12 * $57;
 $162 = $160 + $161;
 $163 = $20 * $59;
 $164 = $162 + $163;
 $165 = $28 * $61;
 $166 = $164 + $165;
 $167 = $6 * $55;
 $168 = $14 * $57;
 $169 = $167 + $168;
 $170 = $22 * $59;
 $171 = $169 + $170;
 $172 = $30 * $61;
 $173 = $171 + $172;
 HEAPF32[$agg$result>>2] = $68;
 $174 = ((($agg$result)) + 4|0);
 HEAPF32[$174>>2] = $96;
 $175 = ((($agg$result)) + 8|0);
 HEAPF32[$175>>2] = $124;
 $176 = ((($agg$result)) + 12|0);
 HEAPF32[$176>>2] = $152;
 $177 = ((($agg$result)) + 16|0);
 HEAPF32[$177>>2] = $75;
 $178 = ((($agg$result)) + 20|0);
 HEAPF32[$178>>2] = $103;
 $179 = ((($agg$result)) + 24|0);
 HEAPF32[$179>>2] = $131;
 $180 = ((($agg$result)) + 28|0);
 HEAPF32[$180>>2] = $159;
 $181 = ((($agg$result)) + 32|0);
 HEAPF32[$181>>2] = $82;
 $182 = ((($agg$result)) + 36|0);
 HEAPF32[$182>>2] = $110;
 $183 = ((($agg$result)) + 40|0);
 HEAPF32[$183>>2] = $138;
 $184 = ((($agg$result)) + 44|0);
 HEAPF32[$184>>2] = $166;
 $185 = ((($agg$result)) + 48|0);
 HEAPF32[$185>>2] = $89;
 $186 = ((($agg$result)) + 52|0);
 HEAPF32[$186>>2] = $117;
 $187 = ((($agg$result)) + 56|0);
 HEAPF32[$187>>2] = $145;
 $188 = ((($agg$result)) + 60|0);
 HEAPF32[$188>>2] = $173;
 return;
}
function _MatrixOrtho($agg$result,$left,$right,$bottom,$top,$near,$far) {
 $agg$result = $agg$result|0;
 $left = +$left;
 $right = +$right;
 $bottom = +$bottom;
 $top = +$top;
 $near = +$near;
 $far = +$far;
 var $0 = 0.0, $1 = 0.0, $10 = 0.0, $11 = 0.0, $12 = 0.0, $13 = 0.0, $14 = 0.0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $18 = 0.0, $19 = 0.0, $2 = 0.0, $20 = 0.0, $21 = 0.0, $22 = 0.0, $23 = 0.0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0.0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $4 = 0.0, $5 = 0.0, $6 = 0.0, $7 = 0.0, $8 = 0.0, $9 = 0.0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = $right - $left;
 $1 = $0;
 $2 = $top - $bottom;
 $3 = $2;
 $4 = $far - $near;
 $5 = $4;
 $6 = 2.0 / $1;
 $7 = 2.0 / $3;
 $8 = -2.0 / $5;
 $9 = $left + $right;
 $10 = -$9;
 $11 = $1;
 $12 = $10 / $11;
 $13 = $12;
 $14 = $bottom + $top;
 $15 = -$14;
 $16 = $3;
 $17 = $15 / $16;
 $18 = $17;
 $19 = $near + $far;
 $20 = -$19;
 $21 = $5;
 $22 = $20 / $21;
 $23 = $22;
 HEAPF32[$agg$result>>2] = $6;
 $24 = ((($agg$result)) + 4|0);
 HEAPF32[$24>>2] = 0.0;
 $25 = ((($agg$result)) + 8|0);
 HEAPF32[$25>>2] = 0.0;
 $26 = ((($agg$result)) + 12|0);
 HEAPF32[$26>>2] = $13;
 $27 = ((($agg$result)) + 16|0);
 HEAPF32[$27>>2] = 0.0;
 $28 = ((($agg$result)) + 20|0);
 HEAPF32[$28>>2] = $7;
 $29 = ((($agg$result)) + 24|0);
 HEAPF32[$29>>2] = 0.0;
 $30 = ((($agg$result)) + 28|0);
 HEAPF32[$30>>2] = $18;
 $31 = ((($agg$result)) + 32|0);
 HEAPF32[$31>>2] = 0.0;
 $32 = ((($agg$result)) + 36|0);
 HEAPF32[$32>>2] = 0.0;
 $33 = ((($agg$result)) + 40|0);
 HEAPF32[$33>>2] = $8;
 $34 = ((($agg$result)) + 44|0);
 HEAPF32[$34>>2] = $23;
 $35 = ((($agg$result)) + 48|0);
 HEAPF32[$35>>2] = 0.0;
 $36 = ((($agg$result)) + 52|0);
 HEAPF32[$36>>2] = 0.0;
 $37 = ((($agg$result)) + 56|0);
 HEAPF32[$37>>2] = 0.0;
 $38 = ((($agg$result)) + 60|0);
 HEAPF32[$38>>2] = 1.0;
 return;
}
function _TraceLog($msgType,$text,$varargs) {
 $msgType = $msgType|0;
 $text = $text|0;
 $varargs = $varargs|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $args = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $args = sp;
 switch ($msgType|0) {
 case 0:  {
  $0 = HEAP32[5036>>2]|0;
  (_fwrite(9197,6,1,$0)|0);
  break;
 }
 case 1:  {
  $1 = HEAP32[5036>>2]|0;
  (_fwrite(9204,7,1,$1)|0);
  break;
 }
 case 2:  {
  $2 = HEAP32[5036>>2]|0;
  (_fwrite(9212,9,1,$2)|0);
  break;
 }
 case 3:  {
  STACKTOP = sp;return;
  break;
 }
 default: {
 }
 }
 HEAP32[$args>>2] = $varargs;
 $3 = HEAP32[5036>>2]|0;
 (_vfprintf($3,$text,$args)|0);
 $4 = HEAP32[5036>>2]|0;
 (_fputc(10,$4)|0);
 $5 = ($msgType|0)==(1);
 if ($5) {
  _exit(1);
  // unreachable;
 } else {
  STACKTOP = sp;return;
 }
}
function _InitDisplay($width,$height) {
 $width = $width|0;
 $height = $height|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer10 = 0, $vararg_buffer14 = 0, $vararg_buffer18 = 0, $vararg_buffer3 = 0, $vararg_buffer5 = 0, $vararg_buffer7 = 0, $vararg_ptr13 = 0, $vararg_ptr17 = 0, $vararg_ptr9 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 128|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer18 = sp + 56|0;
 $vararg_buffer14 = sp + 48|0;
 $vararg_buffer10 = sp + 40|0;
 $vararg_buffer7 = sp + 32|0;
 $vararg_buffer5 = sp + 24|0;
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = sp + 64|0;
 HEAP32[124>>2] = $width;
 HEAP32[128>>2] = $height;
 _MatrixIdentity($0);
 dest=148; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 (_glfwSetErrorCallback((1|0))|0);
 $1 = (_glfwInit()|0);
 $2 = ($1|0)==(0);
 if ($2) {
  _TraceLog(1,11573,$vararg_buffer);
 }
 $3 = HEAP32[124>>2]|0;
 HEAP32[4984>>2] = $3;
 $4 = HEAP32[128>>2]|0;
 HEAP32[4988>>2] = $4;
 _glfwDefaultWindowHints();
 _glfwWindowHint(131075,0);
 $5 = (_rlGetVersion()|0);
 $6 = ($5|0)==(2);
 if ($6) {
  $7 = HEAP8[5981>>0]|0;
  $8 = $7 & 16;
  $9 = ($8<<24>>24)==(0);
  if (!($9)) {
   _glfwWindowHint(135181,4);
   _TraceLog(0,11599,$vararg_buffer1);
  }
  _glfwWindowHint(139266,3);
  _glfwWindowHint(139267,3);
  _glfwWindowHint(139272,204801);
  _glfwWindowHint(139270,0);
 }
 $10 = HEAP32[212>>2]|0;
 $11 = ($10|0)==(0);
 if ($11) {
  $19 = HEAP32[124>>2]|0;
  $20 = HEAP32[128>>2]|0;
  $21 = HEAP32[120>>2]|0;
  $22 = (_glfwCreateWindow(($19|0),($20|0),($21|0),(0|0),(0|0))|0);
  HEAP32[136>>2] = $22;
  $23 = HEAP32[124>>2]|0;
  HEAP32[4976>>2] = $23;
  $24 = HEAP32[128>>2]|0;
  HEAP32[4980>>2] = $24;
  $25 = $22;
 } else {
  $12 = HEAP32[4984>>2]|0;
  $13 = HEAP32[4988>>2]|0;
  _SetupFramebufferSize($12,$13);
  $14 = HEAP32[4976>>2]|0;
  $15 = HEAP32[4980>>2]|0;
  $16 = HEAP32[120>>2]|0;
  $17 = (_glfwGetPrimaryMonitor()|0);
  $18 = (_glfwCreateWindow(($14|0),($15|0),($16|0),($17|0),(0|0))|0);
  HEAP32[136>>2] = $18;
  $25 = $18;
 }
 $26 = ($25|0)==(0|0);
 if ($26) {
  _glfwTerminate();
  _TraceLog(1,11624,$vararg_buffer3);
 } else {
  _TraceLog(0,11657,$vararg_buffer5);
  $27 = HEAP32[4976>>2]|0;
  $28 = HEAP32[4980>>2]|0;
  HEAP32[$vararg_buffer7>>2] = $27;
  $vararg_ptr9 = ((($vararg_buffer7)) + 4|0);
  HEAP32[$vararg_ptr9>>2] = $28;
  _TraceLog(0,11697,$vararg_buffer7);
  $29 = HEAP32[124>>2]|0;
  $30 = HEAP32[128>>2]|0;
  HEAP32[$vararg_buffer10>>2] = $29;
  $vararg_ptr13 = ((($vararg_buffer10)) + 4|0);
  HEAP32[$vararg_ptr13>>2] = $30;
  _TraceLog(0,11718,$vararg_buffer10);
  $31 = HEAP32[4968>>2]|0;
  $32 = HEAP32[4972>>2]|0;
  HEAP32[$vararg_buffer14>>2] = $31;
  $vararg_ptr17 = ((($vararg_buffer14)) + 4|0);
  HEAP32[$vararg_ptr17>>2] = $32;
  _TraceLog(0,11739,$vararg_buffer14);
 }
 $33 = HEAP32[136>>2]|0;
 (_glfwSetWindowSizeCallback(($33|0),(1|0))|0);
 $34 = HEAP32[136>>2]|0;
 (_glfwSetCursorEnterCallback(($34|0),(2|0))|0);
 $35 = HEAP32[136>>2]|0;
 (_glfwSetKeyCallback(($35|0),(1|0))|0);
 $36 = HEAP32[136>>2]|0;
 (_glfwSetMouseButtonCallback(($36|0),(1|0))|0);
 $37 = HEAP32[136>>2]|0;
 (_glfwSetCharCallback(($37|0),(3|0))|0);
 $38 = HEAP32[136>>2]|0;
 (_glfwSetScrollCallback(($38|0),(1|0))|0);
 $39 = HEAP32[136>>2]|0;
 (_glfwSetWindowIconifyCallback(($39|0),(4|0))|0);
 $40 = HEAP32[136>>2]|0;
 _glfwMakeContextCurrent(($40|0));
 $41 = HEAP8[5981>>0]|0;
 $42 = $41 & 32;
 $43 = ($42<<24>>24)==(0);
 if ($43) {
  STACKTOP = sp;return;
 }
 _glfwSwapInterval(1);
 _TraceLog(0,11764,$vararg_buffer18);
 STACKTOP = sp;return;
}
function _InitGraphics() {
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy = sp + 4|0;
 $0 = sp;
 _rlglInit();
 $1 = HEAP32[4968>>2]|0;
 $2 = HEAP32[4972>>2]|0;
 $3 = HEAP32[4976>>2]|0;
 $4 = HEAP32[4980>>2]|0;
 _rlglInitGraphics($1,$2,$3,$4);
 HEAP8[$0>>0] = -11;
 $5 = ((($0)) + 1|0);
 HEAP8[$5>>0] = -11;
 $6 = ((($0)) + 2|0);
 HEAP8[$6>>0] = -11;
 $7 = ((($0)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy+3>>0]=HEAP8[$0+3>>0]|0;
 _ClearBackground($$byval_copy);
 STACKTOP = sp;return;
}
function _InitTimer() {
 var $0 = 0, $1 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (_time((0|0))|0);
 _srand($0);
 $1 = (+_GetTime());
 HEAPF64[32>>3] = $1;
 return;
}
function _LogoAnimation() {
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[132>>2] = 0;
 return;
}
function _GetTime() {
 var $0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+_glfwGetTime());
 return (+$0);
}
function _SwapBuffers() {
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[136>>2]|0;
 _glfwSwapBuffers(($0|0));
 return;
}
function _PollInputEvents() {
 var $0 = 0, $1 = 0.0, $2 = 0.0, $3 = 0.0, $4 = 0.0, $5 = 0, $mouseX = 0, $mouseY = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $mouseX = sp + 8|0;
 $mouseY = sp;
 $0 = HEAP32[136>>2]|0;
 _glfwGetCursorPos(($0|0),($mouseX|0),($mouseY|0));
 $1 = +HEAPF64[$mouseX>>3];
 $2 = $1;
 HEAPF32[8>>2] = $2;
 $3 = +HEAPF64[$mouseY>>3];
 $4 = $3;
 HEAPF32[(12)>>2] = $4;
 HEAP32[216>>2] = -1;
 _memcpy((6494|0),(5982|0),512)|0;
 ;HEAP8[7009>>0]=HEAP8[7006>>0]|0;HEAP8[7009+1>>0]=HEAP8[7006+1>>0]|0;HEAP8[7009+2>>0]=HEAP8[7006+2>>0]|0;
 $5 = HEAP32[4964>>2]|0;
 HEAP32[220>>2] = $5;
 HEAP32[4964>>2] = 0;
 _glfwPollEvents();
 STACKTOP = sp;return;
}
function _LoadDefaultShader($agg$result) {
 $agg$result = $agg$result|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $fShaderStr = 0, $vShaderStr = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 928|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $vShaderStr = sp + 388|0;
 $fShaderStr = sp + 12|0;
 _memcpy(($vShaderStr|0),(10560|0),532)|0;
 _memcpy(($fShaderStr|0),(11092|0),373)|0;
 $0 = (_LoadShaderProgram($vShaderStr,$fShaderStr)|0);
 $1 = ($0|0)==(0);
 if ($1) {
  HEAP32[$vararg_buffer1>>2] = $0;
  _TraceLog(2,11513,$vararg_buffer1);
 } else {
  HEAP32[$vararg_buffer>>2] = $0;
  _TraceLog(0,11465,$vararg_buffer);
 }
 $2 = (_glGetAttribLocation(($0|0),(8608|0))|0);
 $3 = (_glGetAttribLocation(($0|0),(8623|0))|0);
 $4 = (_glGetAttribLocation(($0|0),(11561|0))|0);
 $5 = (_glGetUniformLocation(($0|0),(8651|0))|0);
 $6 = (_glGetUniformLocation(($0|0),(8667|0))|0);
 $7 = (_glGetUniformLocation(($0|0),(8694|0))|0);
 $8 = HEAP32[116>>2]|0;
 HEAP32[$agg$result>>2] = $0;
 $9 = ((($agg$result)) + 4|0);
 HEAP32[$9>>2] = $8;
 $10 = ((($agg$result)) + 8|0);
 HEAP32[$10>>2] = 0;
 $11 = ((($agg$result)) + 12|0);
 HEAP32[$11>>2] = 0;
 $12 = ((($agg$result)) + 16|0);
 HEAP32[$12>>2] = $2;
 $13 = ((($agg$result)) + 20|0);
 HEAP32[$13>>2] = $3;
 $14 = ((($agg$result)) + 24|0);
 HEAP32[$14>>2] = -1;
 $15 = ((($agg$result)) + 28|0);
 HEAP32[$15>>2] = $4;
 $16 = ((($agg$result)) + 32|0);
 HEAP32[$16>>2] = $6;
 $17 = ((($agg$result)) + 36|0);
 HEAP32[$17>>2] = $5;
 $18 = ((($agg$result)) + 40|0);
 HEAP32[$18>>2] = -1;
 $19 = ((($agg$result)) + 44|0);
 HEAP32[$19>>2] = $7;
 $20 = ((($agg$result)) + 48|0);
 HEAP32[$20>>2] = -1;
 $21 = ((($agg$result)) + 52|0);
 HEAP32[$21>>2] = -1;
 STACKTOP = sp;return;
}
function _LoadSimpleShader($agg$result) {
 $agg$result = $agg$result|0;
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $fShaderStr = 0, $vShaderStr = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 848|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $vShaderStr = sp + 388|0;
 $fShaderStr = sp + 12|0;
 _memcpy(($vShaderStr|0),(9633|0),460)|0;
 _memcpy(($fShaderStr|0),(10093|0),373)|0;
 $0 = (_LoadShaderProgram($vShaderStr,$fShaderStr)|0);
 $1 = ($0|0)==(0);
 if ($1) {
  HEAP32[$vararg_buffer1>>2] = $0;
  _TraceLog(2,10513,$vararg_buffer1);
 } else {
  HEAP32[$vararg_buffer>>2] = $0;
  _TraceLog(0,10466,$vararg_buffer);
 }
 $2 = (_glGetAttribLocation(($0|0),(8608|0))|0);
 $3 = (_glGetAttribLocation(($0|0),(8623|0))|0);
 $4 = (_glGetAttribLocation(($0|0),(8638|0))|0);
 $5 = (_glGetUniformLocation(($0|0),(8651|0))|0);
 $6 = (_glGetUniformLocation(($0|0),(8667|0))|0);
 $7 = (_glGetUniformLocation(($0|0),(8684|0))|0);
 $8 = (_glGetUniformLocation(($0|0),(8694|0))|0);
 $9 = HEAP32[116>>2]|0;
 HEAP32[$agg$result>>2] = $0;
 $10 = ((($agg$result)) + 4|0);
 HEAP32[$10>>2] = $9;
 $11 = ((($agg$result)) + 8|0);
 HEAP32[$11>>2] = 0;
 $12 = ((($agg$result)) + 12|0);
 HEAP32[$12>>2] = 0;
 $13 = ((($agg$result)) + 16|0);
 HEAP32[$13>>2] = $2;
 $14 = ((($agg$result)) + 20|0);
 HEAP32[$14>>2] = $3;
 $15 = ((($agg$result)) + 24|0);
 HEAP32[$15>>2] = $4;
 $16 = ((($agg$result)) + 28|0);
 HEAP32[$16>>2] = -1;
 $17 = ((($agg$result)) + 32|0);
 HEAP32[$17>>2] = $6;
 $18 = ((($agg$result)) + 36|0);
 HEAP32[$18>>2] = $5;
 $19 = ((($agg$result)) + 40|0);
 HEAP32[$19>>2] = $7;
 $20 = ((($agg$result)) + 44|0);
 HEAP32[$20>>2] = $8;
 $21 = ((($agg$result)) + 48|0);
 HEAP32[$21>>2] = -1;
 $22 = ((($agg$result)) + 52|0);
 HEAP32[$22>>2] = -1;
 STACKTOP = sp;return;
}
function _InitializeBuffers() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $exitcond = 0, $exitcond14 = 0, $exitcond17 = 0, $exitcond19 = 0, $i1$012 = 0, $i3$010 = 0, $i6$07 = 0, $i7$06 = 0, $k$05 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = (_malloc(24576)|0);
 HEAP32[1448>>2] = $0;
 $1 = (_malloc(8192)|0);
 HEAP32[1412>>2] = $1;
 $2 = HEAP32[1448>>2]|0;
 _memset(($2|0),0,24576)|0;
 $i1$012 = 0;
 while(1) {
  $3 = HEAP32[1412>>2]|0;
  $4 = (($3) + ($i1$012)|0);
  HEAP8[$4>>0] = 0;
  $5 = (($i1$012) + 1)|0;
  $exitcond19 = ($5|0)==(8192);
  if ($exitcond19) {
   break;
  } else {
   $i1$012 = $5;
  }
 }
 HEAP32[1404>>2] = 0;
 HEAP32[1408>>2] = 0;
 $6 = (_malloc(73728)|0);
 HEAP32[1452>>2] = $6;
 $7 = (_malloc(24576)|0);
 HEAP32[1424>>2] = $7;
 $8 = HEAP32[1452>>2]|0;
 _memset(($8|0),0,73728)|0;
 $i3$010 = 0;
 while(1) {
  $9 = HEAP32[1424>>2]|0;
  $10 = (($9) + ($i3$010)|0);
  HEAP8[$10>>0] = 0;
  $11 = (($i3$010) + 1)|0;
  $exitcond17 = ($11|0)==(24576);
  if ($exitcond17) {
   break;
  } else {
   $i3$010 = $11;
  }
 }
 HEAP32[1416>>2] = 0;
 HEAP32[1420>>2] = 0;
 $12 = (_malloc(49152)|0);
 HEAP32[1456>>2] = $12;
 $13 = (_malloc(32768)|0);
 HEAP32[1444>>2] = $13;
 $14 = (_malloc(16384)|0);
 HEAP32[1436>>2] = $14;
 $15 = (_malloc(12288)|0);
 HEAP32[1912>>2] = $15;
 $16 = HEAP32[1456>>2]|0;
 _memset(($16|0),0,49152)|0;
 $17 = HEAP32[1444>>2]|0;
 _memset(($17|0),0,32768)|0;
 $i6$07 = 0;
 while(1) {
  $19 = HEAP32[1436>>2]|0;
  $20 = (($19) + ($i6$07)|0);
  HEAP8[$20>>0] = 0;
  $21 = (($i6$07) + 1)|0;
  $exitcond14 = ($21|0)==(16384);
  if ($exitcond14) {
   break;
  } else {
   $i6$07 = $21;
  }
 }
 $18 = HEAP32[1912>>2]|0;
 $i7$06 = 0;$k$05 = 0;
 while(1) {
  $22 = $k$05 << 2;
  $23 = $22&65535;
  $24 = (($18) + ($i7$06<<1)|0);
  HEAP16[$24>>1] = $23;
  $25 = $22 | 1;
  $26 = $25&65535;
  $27 = $i7$06 | 1;
  $28 = (($18) + ($27<<1)|0);
  HEAP16[$28>>1] = $26;
  $29 = $22 | 2;
  $30 = $29&65535;
  $31 = (($i7$06) + 2)|0;
  $32 = (($18) + ($31<<1)|0);
  HEAP16[$32>>1] = $30;
  $33 = (($i7$06) + 3)|0;
  $34 = (($18) + ($33<<1)|0);
  HEAP16[$34>>1] = $23;
  $35 = (($i7$06) + 4)|0;
  $36 = (($18) + ($35<<1)|0);
  HEAP16[$36>>1] = $30;
  $37 = $22 | 3;
  $38 = $37&65535;
  $39 = (($i7$06) + 5)|0;
  $40 = (($18) + ($39<<1)|0);
  HEAP16[$40>>1] = $38;
  $41 = (($k$05) + 1)|0;
  $42 = (($i7$06) + 6)|0;
  $exitcond = ($41|0)==(1024);
  if ($exitcond) {
   break;
  } else {
   $i7$06 = $42;$k$05 = $41;
  }
 }
 HEAP32[1428>>2] = 0;
 HEAP32[1440>>2] = 0;
 HEAP32[1432>>2] = 0;
 _TraceLog(0,9570,$vararg_buffer);
 STACKTOP = sp;return;
}
function _InitializeBuffersGPU() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $7 = 0, $8 = 0, $9 = 0, $vararg_buffer = 0, $vararg_buffer1 = 0, $vararg_buffer12 = 0, $vararg_buffer15 = 0, $vararg_buffer5 = 0, $vararg_buffer8 = 0, $vararg_ptr11 = 0, $vararg_ptr18 = 0, $vararg_ptr19 = 0, $vararg_ptr20 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 64|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer15 = sp + 40|0;
 $vararg_buffer12 = sp + 32|0;
 $vararg_buffer8 = sp + 24|0;
 $vararg_buffer5 = sp + 16|0;
 $vararg_buffer1 = sp + 8|0;
 $vararg_buffer = sp;
 $0 = HEAP32[1472>>2]|0;
 $1 = ($0|0)==(0);
 if (!($1)) {
  $2 = HEAP32[1480>>2]|0;
  FUNCTION_TABLE_vii[$2 & 63](1,1900);
  $3 = HEAP32[1484>>2]|0;
  $4 = HEAP32[1900>>2]|0;
  FUNCTION_TABLE_vi[$3 & 31]($4);
 }
 _glGenBuffers(2,(1868|0));
 $5 = HEAP32[1868>>2]|0;
 _glBindBuffer(34962,($5|0));
 $6 = HEAP32[1448>>2]|0;
 _glBufferData(34962,24576,($6|0),35048);
 $7 = HEAP32[(1640)>>2]|0;
 _glEnableVertexAttribArray(($7|0));
 $8 = HEAP32[(1640)>>2]|0;
 _glVertexAttribPointer(($8|0),3,5126,0,0,(0|0));
 $9 = HEAP32[(1872)>>2]|0;
 _glBindBuffer(34962,($9|0));
 $10 = HEAP32[1412>>2]|0;
 _glBufferData(34962,8192,($10|0),35048);
 $11 = HEAP32[(1652)>>2]|0;
 _glEnableVertexAttribArray(($11|0));
 $12 = HEAP32[(1652)>>2]|0;
 _glVertexAttribPointer(($12|0),4,5121,1,0,(0|0));
 $13 = HEAP32[1472>>2]|0;
 $14 = ($13|0)==(0);
 if ($14) {
  $16 = HEAP32[1868>>2]|0;
  $17 = HEAP32[(1872)>>2]|0;
  HEAP32[$vararg_buffer1>>2] = $16;
  $vararg_ptr4 = ((($vararg_buffer1)) + 4|0);
  HEAP32[$vararg_ptr4>>2] = $17;
  _TraceLog(0,9269,$vararg_buffer1);
 } else {
  $15 = HEAP32[1900>>2]|0;
  HEAP32[$vararg_buffer>>2] = $15;
  _TraceLog(0,9222,$vararg_buffer);
 }
 $18 = HEAP32[1472>>2]|0;
 $19 = ($18|0)==(0);
 if (!($19)) {
  $20 = HEAP32[1480>>2]|0;
  FUNCTION_TABLE_vii[$20 & 63](1,1904);
  $21 = HEAP32[1484>>2]|0;
  $22 = HEAP32[1904>>2]|0;
  FUNCTION_TABLE_vi[$21 & 31]($22);
 }
 _glGenBuffers(2,(1876|0));
 $23 = HEAP32[1876>>2]|0;
 _glBindBuffer(34962,($23|0));
 $24 = HEAP32[1452>>2]|0;
 _glBufferData(34962,73728,($24|0),35048);
 $25 = HEAP32[(1640)>>2]|0;
 _glEnableVertexAttribArray(($25|0));
 $26 = HEAP32[(1640)>>2]|0;
 _glVertexAttribPointer(($26|0),3,5126,0,0,(0|0));
 $27 = HEAP32[(1880)>>2]|0;
 _glBindBuffer(34962,($27|0));
 $28 = HEAP32[1424>>2]|0;
 _glBufferData(34962,24576,($28|0),35048);
 $29 = HEAP32[(1652)>>2]|0;
 _glEnableVertexAttribArray(($29|0));
 $30 = HEAP32[(1652)>>2]|0;
 _glVertexAttribPointer(($30|0),4,5121,1,0,(0|0));
 $31 = HEAP32[1472>>2]|0;
 $32 = ($31|0)==(0);
 if ($32) {
  $34 = HEAP32[1876>>2]|0;
  $35 = HEAP32[(1880)>>2]|0;
  HEAP32[$vararg_buffer8>>2] = $34;
  $vararg_ptr11 = ((($vararg_buffer8)) + 4|0);
  HEAP32[$vararg_ptr11>>2] = $35;
  _TraceLog(0,9379,$vararg_buffer8);
 } else {
  $33 = HEAP32[1904>>2]|0;
  HEAP32[$vararg_buffer5>>2] = $33;
  _TraceLog(0,9328,$vararg_buffer5);
 }
 $36 = HEAP32[1472>>2]|0;
 $37 = ($36|0)==(0);
 if (!($37)) {
  $38 = HEAP32[1480>>2]|0;
  FUNCTION_TABLE_vii[$38 & 63](1,1908);
  $39 = HEAP32[1484>>2]|0;
  $40 = HEAP32[1908>>2]|0;
  FUNCTION_TABLE_vi[$39 & 31]($40);
 }
 _glGenBuffers(4,(1884|0));
 $41 = HEAP32[1884>>2]|0;
 _glBindBuffer(34962,($41|0));
 $42 = HEAP32[1456>>2]|0;
 _glBufferData(34962,49152,($42|0),35048);
 $43 = HEAP32[(1640)>>2]|0;
 _glEnableVertexAttribArray(($43|0));
 $44 = HEAP32[(1640)>>2]|0;
 _glVertexAttribPointer(($44|0),3,5126,0,0,(0|0));
 $45 = HEAP32[(1888)>>2]|0;
 _glBindBuffer(34962,($45|0));
 $46 = HEAP32[1444>>2]|0;
 _glBufferData(34962,32768,($46|0),35048);
 $47 = HEAP32[(1644)>>2]|0;
 _glEnableVertexAttribArray(($47|0));
 $48 = HEAP32[(1644)>>2]|0;
 _glVertexAttribPointer(($48|0),2,5126,0,0,(0|0));
 $49 = HEAP32[(1892)>>2]|0;
 _glBindBuffer(34962,($49|0));
 $50 = HEAP32[1436>>2]|0;
 _glBufferData(34962,16384,($50|0),35048);
 $51 = HEAP32[(1652)>>2]|0;
 _glEnableVertexAttribArray(($51|0));
 $52 = HEAP32[(1652)>>2]|0;
 _glVertexAttribPointer(($52|0),4,5121,1,0,(0|0));
 $53 = HEAP32[(1896)>>2]|0;
 _glBindBuffer(34963,($53|0));
 $54 = HEAP32[1912>>2]|0;
 _glBufferData(34963,12288,($54|0),35044);
 $55 = HEAP32[1472>>2]|0;
 $56 = ($55|0)==(0);
 if ($56) {
  $58 = HEAP32[1884>>2]|0;
  $59 = HEAP32[(1888)>>2]|0;
  $60 = HEAP32[(1892)>>2]|0;
  $61 = HEAP32[(1896)>>2]|0;
  HEAP32[$vararg_buffer15>>2] = $58;
  $vararg_ptr18 = ((($vararg_buffer15)) + 4|0);
  HEAP32[$vararg_ptr18>>2] = $59;
  $vararg_ptr19 = ((($vararg_buffer15)) + 8|0);
  HEAP32[$vararg_ptr19>>2] = $60;
  $vararg_ptr20 = ((($vararg_buffer15)) + 12|0);
  HEAP32[$vararg_ptr20>>2] = $61;
  _TraceLog(0,9489,$vararg_buffer15);
 } else {
  $57 = HEAP32[1908>>2]|0;
  HEAP32[$vararg_buffer12>>2] = $57;
  _TraceLog(0,9442,$vararg_buffer12);
 }
 $62 = HEAP32[1472>>2]|0;
 $63 = ($62|0)==(0);
 if ($63) {
  STACKTOP = sp;return;
 }
 $64 = HEAP32[1484>>2]|0;
 FUNCTION_TABLE_vi[$64 & 31](0);
 STACKTOP = sp;return;
}
function _LoadCompressedTexture($data,$width,$height,$mipmapCount,$compressedFormat) {
 $data = $data|0;
 $width = $width|0;
 $height = $height|0;
 $mipmapCount = $mipmapCount|0;
 $compressedFormat = $compressedFormat|0;
 var $$ = 0, $$013 = 0, $$0610 = 0, $$17 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0;
 var $7 = 0, $8 = 0, $9 = 0, $blockSize$0 = 0, $level$012 = 0, $offset$011 = 0, $or$cond = 0, $or$cond9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 _glPixelStorei(3317,1);
 switch ($compressedFormat|0) {
 case 33776: case 33777: case 36196: case 37492:  {
  $blockSize$0 = 8;
  break;
 }
 default: {
  $blockSize$0 = 16;
 }
 }
 $0 = ($mipmapCount|0)<(1);
 $1 = $width | $height;
 $2 = ($1|0)==(0);
 $or$cond9 = $0 | $2;
 if ($or$cond9) {
  return;
 } else {
  $$013 = $width;$$0610 = $height;$level$012 = 0;$offset$011 = 0;
 }
 while(1) {
  $3 = (($$013) + 3)|0;
  $4 = (($3|0) / 4)&-1;
  $5 = (($$0610) + 3)|0;
  $6 = (($5|0) / 4)&-1;
  $7 = Math_imul($4, $blockSize$0)|0;
  $8 = Math_imul($7, $6)|0;
  $9 = (($data) + ($offset$011)|0);
  _glCompressedTexImage2D(3553,($level$012|0),($compressedFormat|0),($$013|0),($$0610|0),0,($8|0),($9|0));
  $10 = (($8) + ($offset$011))|0;
  $11 = (($$013|0) / 2)&-1;
  $12 = (($$0610|0) / 2)&-1;
  $13 = ($$013|0)<(2);
  $$ = $13 ? 1 : $11;
  $14 = ($$0610|0)<(2);
  $$17 = $14 ? 1 : $12;
  $15 = (($level$012) + 1)|0;
  $16 = ($15|0)>=($mipmapCount|0);
  $17 = $$ | $$17;
  $18 = ($17|0)==(0);
  $or$cond = $16 | $18;
  if ($or$cond) {
   break;
  } else {
   $$013 = $$;$$0610 = $$17;$level$012 = $15;$offset$011 = $10;
  }
 }
 return;
}
function _UpdateBuffers() {
 var $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[1404>>2]|0;
 $1 = ($0|0)>(0);
 if ($1) {
  $2 = HEAP32[1472>>2]|0;
  $3 = ($2|0)==(0);
  if (!($3)) {
   $4 = HEAP32[1484>>2]|0;
   $5 = HEAP32[1900>>2]|0;
   FUNCTION_TABLE_vi[$4 & 31]($5);
  }
  $6 = HEAP32[1868>>2]|0;
  _glBindBuffer(34962,($6|0));
  $7 = HEAP32[1404>>2]|0;
  $8 = ($7*12)|0;
  $9 = HEAP32[1448>>2]|0;
  _glBufferSubData(34962,0,($8|0),($9|0));
  $10 = HEAP32[(1872)>>2]|0;
  _glBindBuffer(34962,($10|0));
  $11 = HEAP32[1408>>2]|0;
  $12 = $11 << 2;
  $13 = HEAP32[1412>>2]|0;
  _glBufferSubData(34962,0,($12|0),($13|0));
 }
 $14 = HEAP32[1416>>2]|0;
 $15 = ($14|0)>(0);
 if ($15) {
  $16 = HEAP32[1472>>2]|0;
  $17 = ($16|0)==(0);
  if (!($17)) {
   $18 = HEAP32[1484>>2]|0;
   $19 = HEAP32[1904>>2]|0;
   FUNCTION_TABLE_vi[$18 & 31]($19);
  }
  $20 = HEAP32[1876>>2]|0;
  _glBindBuffer(34962,($20|0));
  $21 = HEAP32[1416>>2]|0;
  $22 = ($21*12)|0;
  $23 = HEAP32[1452>>2]|0;
  _glBufferSubData(34962,0,($22|0),($23|0));
  $24 = HEAP32[(1880)>>2]|0;
  _glBindBuffer(34962,($24|0));
  $25 = HEAP32[1420>>2]|0;
  $26 = $25 << 2;
  $27 = HEAP32[1424>>2]|0;
  _glBufferSubData(34962,0,($26|0),($27|0));
 }
 $28 = HEAP32[1428>>2]|0;
 $29 = ($28|0)>(0);
 if ($29) {
  $30 = HEAP32[1472>>2]|0;
  $31 = ($30|0)==(0);
  if (!($31)) {
   $32 = HEAP32[1484>>2]|0;
   $33 = HEAP32[1908>>2]|0;
   FUNCTION_TABLE_vi[$32 & 31]($33);
  }
  $34 = HEAP32[1884>>2]|0;
  _glBindBuffer(34962,($34|0));
  $35 = HEAP32[1428>>2]|0;
  $36 = ($35*12)|0;
  $37 = HEAP32[1456>>2]|0;
  _glBufferSubData(34962,0,($36|0),($37|0));
  $38 = HEAP32[(1888)>>2]|0;
  _glBindBuffer(34962,($38|0));
  $39 = HEAP32[1428>>2]|0;
  $40 = $39 << 3;
  $41 = HEAP32[1444>>2]|0;
  _glBufferSubData(34962,0,($40|0),($41|0));
  $42 = HEAP32[(1892)>>2]|0;
  _glBindBuffer(34962,($42|0));
  $43 = HEAP32[1428>>2]|0;
  $44 = $43 << 2;
  $45 = HEAP32[1436>>2]|0;
  _glBufferSubData(34962,0,($44|0),($45|0));
 }
 $46 = HEAP32[1472>>2]|0;
 $47 = ($46|0)==(0);
 if ($47) {
  return;
 }
 $48 = HEAP32[1484>>2]|0;
 FUNCTION_TABLE_vi[$48 & 31](0);
 return;
}
function _ErrorCallback($error,$description) {
 $error = $error|0;
 $description = $description|0;
 var $vararg_buffer = 0, $vararg_ptr1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 HEAP32[$vararg_buffer>>2] = $error;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $description;
 _TraceLog(2,11996,$vararg_buffer);
 STACKTOP = sp;return;
}
function _SetupFramebufferSize($displayWidth,$displayHeight) {
 $displayWidth = $displayWidth|0;
 $displayHeight = $displayHeight|0;
 var $0 = 0, $1 = 0, $10 = 0.0, $11 = 0.0, $12 = 0, $13 = 0.0, $14 = 0.0, $15 = 0, $16 = 0, $17 = 0.0, $18 = 0.0, $19 = 0, $2 = 0, $20 = 0, $21 = 0.0, $22 = 0, $23 = 0, $24 = 0, $25 = 0.0, $26 = 0;
 var $27 = 0.0, $28 = 0.0, $29 = 0, $3 = 0, $30 = 0, $31 = 0.0, $32 = 0.0, $33 = 0.0, $34 = 0, $35 = 0.0, $36 = 0, $37 = 0.0, $38 = 0.0, $39 = 0, $4 = 0, $40 = 0, $41 = 0.0, $42 = 0.0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0.0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $6 = 0, $7 = 0.0, $8 = 0, $9 = 0.0, $or$cond = 0, $roundf = 0.0, $roundf1 = 0.0, $roundf2 = 0.0, $roundf3 = 0.0, $storemerge = 0, $vararg_buffer = 0, $vararg_buffer4 = 0;
 var $vararg_buffer8 = 0, $vararg_ptr1 = 0, $vararg_ptr11 = 0, $vararg_ptr12 = 0, $vararg_ptr13 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr7 = 0, dest = 0, label = 0, sp = 0, src = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 112|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer8 = sp + 24|0;
 $vararg_buffer4 = sp + 16|0;
 $vararg_buffer = sp;
 $0 = sp + 40|0;
 $1 = HEAP32[124>>2]|0;
 $2 = ($1|0)>($displayWidth|0);
 if (!($2)) {
  $3 = HEAP32[128>>2]|0;
  $4 = ($3|0)>($displayHeight|0);
  if (!($4)) {
   $29 = ($1|0)<($displayWidth|0);
   $30 = ($3|0)<($displayHeight|0);
   $or$cond = $29 | $30;
   if (!($or$cond)) {
    HEAP32[4976>>2] = $1;
    $51 = HEAP32[128>>2]|0;
    HEAP32[4980>>2] = $51;
    HEAP32[4968>>2] = 0;
    HEAP32[4972>>2] = 0;
    STACKTOP = sp;return;
   }
   HEAP32[$vararg_buffer8>>2] = $1;
   $vararg_ptr11 = ((($vararg_buffer8)) + 4|0);
   HEAP32[$vararg_ptr11>>2] = $3;
   $vararg_ptr12 = ((($vararg_buffer8)) + 8|0);
   HEAP32[$vararg_ptr12>>2] = $displayWidth;
   $vararg_ptr13 = ((($vararg_buffer8)) + 12|0);
   HEAP32[$vararg_ptr13>>2] = $displayHeight;
   _TraceLog(0,11930,$vararg_buffer8);
   $31 = (+($displayWidth|0));
   $32 = (+($displayHeight|0));
   $33 = $31 / $32;
   $34 = HEAP32[124>>2]|0;
   $35 = (+($34|0));
   $36 = HEAP32[128>>2]|0;
   $37 = (+($36|0));
   $38 = $35 / $37;
   $39 = !($33 <= $38);
   if ($39) {
    $46 = $33 * $37;
    $roundf = (+_roundf($46));
    $47 = (~~(($roundf)));
    HEAP32[4976>>2] = $47;
    $48 = HEAP32[128>>2]|0;
    HEAP32[4980>>2] = $48;
    $49 = HEAP32[124>>2]|0;
    $50 = (($47) - ($49))|0;
    HEAP32[4968>>2] = $50;
    HEAP32[4972>>2] = 0;
    STACKTOP = sp;return;
   } else {
    HEAP32[4976>>2] = $34;
    $40 = HEAP32[124>>2]|0;
    $41 = (+($40|0));
    $42 = $41 / $33;
    $roundf1 = (+_roundf($42));
    $43 = (~~(($roundf1)));
    HEAP32[4980>>2] = $43;
    HEAP32[4968>>2] = 0;
    $44 = HEAP32[128>>2]|0;
    $45 = (($43) - ($44))|0;
    HEAP32[4972>>2] = $45;
    STACKTOP = sp;return;
   }
  }
 }
 $5 = HEAP32[124>>2]|0;
 $6 = HEAP32[128>>2]|0;
 HEAP32[$vararg_buffer>>2] = $5;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = $6;
 $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $displayWidth;
 $vararg_ptr3 = ((($vararg_buffer)) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $displayHeight;
 _TraceLog(2,11787,$vararg_buffer);
 $7 = (+($displayWidth|0));
 $8 = HEAP32[124>>2]|0;
 $9 = (+($8|0));
 $10 = $7 / $9;
 $11 = (+($displayHeight|0));
 $12 = HEAP32[128>>2]|0;
 $13 = (+($12|0));
 $14 = $11 / $13;
 $15 = !($10 <= $14);
 if ($15) {
  $21 = $9 * $14;
  $roundf2 = (+_roundf($21));
  $22 = (~~(($roundf2)));
  HEAP32[4976>>2] = $22;
  HEAP32[4980>>2] = $displayHeight;
  $23 = (($displayWidth) - ($22))|0;
  HEAP32[4968>>2] = $23;
  $storemerge = 0;
 } else {
  HEAP32[4976>>2] = $displayWidth;
  $16 = HEAP32[128>>2]|0;
  $17 = (+($16|0));
  $18 = $10 * $17;
  $roundf3 = (+_roundf($18));
  $19 = (~~(($roundf3)));
  HEAP32[4980>>2] = $19;
  HEAP32[4968>>2] = 0;
  $20 = (($displayHeight) - ($19))|0;
  $storemerge = $20;
 }
 HEAP32[4972>>2] = $storemerge;
 $24 = HEAP32[4976>>2]|0;
 $25 = (+($24|0));
 $26 = HEAP32[124>>2]|0;
 $27 = (+($26|0));
 $28 = $25 / $27;
 _MatrixScale($0,$28,$28,$28);
 dest=148; src=$0; stop=dest+64|0; do { HEAP32[dest>>2]=HEAP32[src>>2]|0; dest=dest+4|0; src=src+4|0; } while ((dest|0) < (stop|0));
 HEAP32[4976>>2] = $displayWidth;
 HEAP32[4980>>2] = $displayHeight;
 HEAP32[$vararg_buffer4>>2] = $displayWidth;
 $vararg_ptr7 = ((($vararg_buffer4)) + 4|0);
 HEAP32[$vararg_ptr7>>2] = $displayHeight;
 _TraceLog(2,11865,$vararg_buffer4);
 STACKTOP = sp;return;
}
function _WindowSizeCallback($window,$width,$height) {
 $window = $window|0;
 $width = $width|0;
 $height = $height|0;
 var $$byval_copy = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $$byval_copy = sp + 4|0;
 $0 = sp;
 $1 = HEAP32[4968>>2]|0;
 $2 = HEAP32[4972>>2]|0;
 $3 = HEAP32[4976>>2]|0;
 $4 = HEAP32[4980>>2]|0;
 _rlglInitGraphics($1,$2,$3,$4);
 HEAP8[$0>>0] = -11;
 $5 = ((($0)) + 1|0);
 HEAP8[$5>>0] = -11;
 $6 = ((($0)) + 2|0);
 HEAP8[$6>>0] = -11;
 $7 = ((($0)) + 3|0);
 HEAP8[$7>>0] = -1;
 ;HEAP8[$$byval_copy>>0]=HEAP8[$0>>0]|0;HEAP8[$$byval_copy+1>>0]=HEAP8[$0+1>>0]|0;HEAP8[$$byval_copy+2>>0]=HEAP8[$0+2>>0]|0;HEAP8[$$byval_copy+3>>0]=HEAP8[$0+3>>0]|0;
 _ClearBackground($$byval_copy);
 STACKTOP = sp;return;
}
function _CursorEnterCallback($window,$enter) {
 $window = $window|0;
 $enter = $enter|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function _KeyCallback($window,$key,$scancode,$action,$mods) {
 $window = $window|0;
 $key = $key|0;
 $scancode = $scancode|0;
 $action = $action|0;
 $mods = $mods|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $or$cond = 0, $or$cond3 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[144>>2]|0;
 $1 = ($0|0)==($key|0);
 $2 = ($action|0)==(1);
 $or$cond = $2 & $1;
 if ($or$cond) {
  _glfwSetWindowShouldClose(($window|0),1);
 } else {
  $3 = $action&255;
  $4 = (5982 + ($key)|0);
  HEAP8[$4>>0] = $3;
 }
 $5 = ($key|0)==(259);
 $or$cond3 = $5 & $2;
 if (!($or$cond3)) {
  return;
 }
 HEAP32[216>>2] = 3;
 return;
}
function _MouseButtonCallback($window,$button,$action,$mods) {
 $window = $window|0;
 $button = $button|0;
 $action = $action|0;
 $mods = $mods|0;
 var $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $action&255;
 $1 = (7006 + ($button)|0);
 HEAP8[$1>>0] = $0;
 return;
}
function _CharCallback($window,$key) {
 $window = $window|0;
 $key = $key|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 HEAP32[216>>2] = $key;
 return;
}
function _ScrollCallback($window,$xoffset,$yoffset) {
 $window = $window|0;
 $xoffset = +$xoffset;
 $yoffset = +$yoffset;
 var $0 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (~~(($yoffset)));
 HEAP32[4964>>2] = $0;
 return;
}
function _WindowIconifyCallback($window,$iconified) {
 $window = $window|0;
 $iconified = $iconified|0;
 var $$ = 0, $not$ = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $not$ = ($iconified|0)!=(0);
 $$ = $not$&1;
 HEAP32[140>>2] = $$;
 return;
}
function _emscripten_GetProcAddress($name_) {
 $name_ = $name_|0;
 var $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0;
 var $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0;
 var $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0;
 var $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0;
 var $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0;
 var $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0;
 var $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0;
 var $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0;
 var $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0;
 var $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0;
 var $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0;
 var $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0;
 var $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0;
 var $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0;
 var $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0;
 var $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0;
 var $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0;
 var $404 = 0, $405 = 0, $406 = 0, $407 = 0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0;
 var $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0;
 var $440 = 0, $441 = 0, $442 = 0, $443 = 0, $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0;
 var $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0;
 var $477 = 0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0;
 var $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0;
 var $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0;
 var $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0;
 var $549 = 0, $55 = 0, $550 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0;
 var $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0;
 var $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $end = 0, $name = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $0 = sp + 12|0;
 $1 = sp + 8|0;
 $name = sp + 4|0;
 $end = sp;
 HEAP32[$1>>2] = $name_;
 $2 = HEAP32[$1>>2]|0;
 $3 = (_strlen($2)|0);
 $4 = (($3) + 1)|0;
 $5 = (_malloc($4)|0);
 HEAP32[$name>>2] = $5;
 $6 = HEAP32[$name>>2]|0;
 $7 = HEAP32[$1>>2]|0;
 (_strcpy($6,$7)|0);
 $8 = HEAP32[$name>>2]|0;
 $9 = (_strstr($8,12034)|0);
 HEAP32[$end>>2] = $9;
 $10 = HEAP32[$end>>2]|0;
 $11 = ($10|0)!=(0|0);
 if ($11) {
  $12 = HEAP32[$end>>2]|0;
  HEAP8[$12>>0] = 0;
 }
 $13 = HEAP32[$name>>2]|0;
 $14 = (_strstr($13,12038)|0);
 HEAP32[$end>>2] = $14;
 $15 = HEAP32[$end>>2]|0;
 $16 = ($15|0)!=(0|0);
 if ($16) {
  $17 = HEAP32[$end>>2]|0;
  HEAP8[$17>>0] = 0;
 }
 $18 = HEAP32[$name>>2]|0;
 $19 = (_strstr($18,12042)|0);
 HEAP32[$end>>2] = $19;
 $20 = HEAP32[$end>>2]|0;
 $21 = ($20|0)!=(0|0);
 if ($21) {
  $22 = HEAP32[$end>>2]|0;
  HEAP8[$22>>0] = 0;
 }
 $23 = HEAP32[$name>>2]|0;
 $24 = (_strstr($23,12046)|0);
 HEAP32[$end>>2] = $24;
 $25 = HEAP32[$end>>2]|0;
 $26 = ($25|0)!=(0|0);
 if ($26) {
  $27 = HEAP32[$end>>2]|0;
  HEAP8[$27>>0] = 0;
 }
 $28 = HEAP32[$name>>2]|0;
 $29 = (_strcmp($28,12052)|0);
 $30 = ($29|0)!=(0);
 do {
  if ($30) {
   $31 = HEAP32[$name>>2]|0;
   $32 = (_strcmp($31,12090)|0);
   $33 = ($32|0)!=(0);
   if (!($33)) {
    HEAP32[$name>>2] = 12109;
    break;
   }
   $34 = HEAP32[$name>>2]|0;
   $35 = (_strcmp($34,12122)|0);
   $36 = ($35|0)!=(0);
   if (!($36)) {
    HEAP32[$name>>2] = 12143;
    break;
   }
   $37 = HEAP32[$name>>2]|0;
   $38 = (_strcmp($37,12158)|0);
   $39 = ($38|0)!=(0);
   if (!($39)) {
    HEAP32[$name>>2] = 12173;
    break;
   }
   $40 = HEAP32[$name>>2]|0;
   $41 = (_strcmp($40,12188)|0);
   $42 = ($41|0)!=(0);
   if (!($42)) {
    HEAP32[$name>>2] = 12203;
   }
  } else {
   HEAP32[$name>>2] = 12074;
  }
 } while(0);
 $43 = HEAP32[$name>>2]|0;
 $44 = (_strcmp($43,12218)|0);
 $45 = ($44|0)!=(0);
 do {
  if ($45) {
   $46 = HEAP32[$name>>2]|0;
   $47 = (_strcmp($46,12232)|0);
   $48 = ($47|0)!=(0);
   if (!($48)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $49 = HEAP32[$name>>2]|0;
   $50 = (_strcmp($49,12244)|0);
   $51 = ($50|0)!=(0);
   if (!($51)) {
    HEAP32[$0>>2] = 6;
    break;
   }
   $52 = HEAP32[$name>>2]|0;
   $53 = (_strcmp($52,12258)|0);
   $54 = ($53|0)!=(0);
   if (!($54)) {
    HEAP32[$0>>2] = 7;
    break;
   }
   $55 = HEAP32[$name>>2]|0;
   $56 = (_strcmp($55,12270)|0);
   $57 = ($56|0)!=(0);
   if (!($57)) {
    HEAP32[$0>>2] = 8;
    break;
   }
   $58 = HEAP32[$name>>2]|0;
   $59 = (_strcmp($58,12284)|0);
   $60 = ($59|0)!=(0);
   if (!($60)) {
    HEAP32[$0>>2] = 9;
    break;
   }
   $61 = HEAP32[$name>>2]|0;
   $62 = (_strcmp($61,12298)|0);
   $63 = ($62|0)!=(0);
   if (!($63)) {
    HEAP32[$0>>2] = 10;
    break;
   }
   $64 = HEAP32[$name>>2]|0;
   $65 = (_strcmp($64,12315)|0);
   $66 = ($65|0)!=(0);
   if (!($66)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $67 = HEAP32[$name>>2]|0;
   $68 = (_strcmp($67,12338)|0);
   $69 = ($68|0)!=(0);
   if (!($69)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $70 = HEAP32[$name>>2]|0;
   $71 = (_strcmp($70,12364)|0);
   $72 = ($71|0)!=(0);
   if (!($72)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $73 = HEAP32[$name>>2]|0;
   $74 = (_strcmp($73,12377)|0);
   $75 = ($74|0)!=(0);
   if (!($75)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $76 = HEAP32[$name>>2]|0;
   $77 = (_strcmp($76,12393)|0);
   $78 = ($77|0)!=(0);
   if (!($78)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $79 = HEAP32[$name>>2]|0;
   $80 = (_strcmp($79,12406)|0);
   $81 = ($80|0)!=(0);
   if (!($81)) {
    HEAP32[$0>>2] = 11;
    break;
   }
   $82 = HEAP32[$name>>2]|0;
   $83 = (_strcmp($82,12420)|0);
   $84 = ($83|0)!=(0);
   if (!($84)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $85 = HEAP32[$name>>2]|0;
   $86 = (_strcmp($85,12440)|0);
   $87 = ($86|0)!=(0);
   if (!($87)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $88 = HEAP32[$name>>2]|0;
   $89 = (_strcmp($88,12460)|0);
   $90 = ($89|0)!=(0);
   if (!($90)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $91 = HEAP32[$name>>2]|0;
   $92 = (_strcmp($91,12477)|0);
   $93 = ($92|0)!=(0);
   if (!($93)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $94 = HEAP32[$name>>2]|0;
   $95 = (_strcmp($94,12494)|0);
   $96 = ($95|0)!=(0);
   if (!($96)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $97 = HEAP32[$name>>2]|0;
   $98 = (_strcmp($97,12506)|0);
   $99 = ($98|0)!=(0);
   if (!($99)) {
    HEAP32[$0>>2] = 12;
    break;
   }
   $100 = HEAP32[$name>>2]|0;
   $101 = (_strcmp($100,12519)|0);
   $102 = ($101|0)!=(0);
   if (!($102)) {
    HEAP32[$0>>2] = 13;
    break;
   }
   $103 = HEAP32[$name>>2]|0;
   $104 = (_strcmp($103,12535)|0);
   $105 = ($104|0)!=(0);
   if (!($105)) {
    HEAP32[$0>>2] = 6;
    break;
   }
   $106 = HEAP32[$name>>2]|0;
   $107 = (_strcmp($106,12558)|0);
   $108 = ($107|0)!=(0);
   if (!($108)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $109 = HEAP32[$name>>2]|0;
   $110 = (_strcmp($109,12571)|0);
   $111 = ($110|0)!=(0);
   if (!($111)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $112 = HEAP32[$name>>2]|0;
   $113 = (_strcmp($112,12587)|0);
   $114 = ($113|0)!=(0);
   if (!($114)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $115 = HEAP32[$name>>2]|0;
   $116 = (_strcmp($115,12598)|0);
   $117 = ($116|0)!=(0);
   if (!($117)) {
    HEAP32[$0>>2] = 14;
    break;
   }
   $118 = HEAP32[$name>>2]|0;
   $119 = (_strcmp($118,12617)|0);
   $120 = ($119|0)!=(0);
   if (!($120)) {
    HEAP32[$0>>2] = 15;
    break;
   }
   $121 = HEAP32[$name>>2]|0;
   $122 = (_strcmp($121,12639)|0);
   $123 = ($122|0)!=(0);
   if (!($123)) {
    HEAP32[$0>>2] = 16;
    break;
   }
   $124 = HEAP32[$name>>2]|0;
   $125 = (_strcmp($124,12658)|0);
   $126 = ($125|0)!=(0);
   if (!($126)) {
    HEAP32[$0>>2] = 7;
    break;
   }
   $127 = HEAP32[$name>>2]|0;
   $128 = (_strcmp($127,12687)|0);
   $129 = ($128|0)!=(0);
   if (!($129)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $130 = HEAP32[$name>>2]|0;
   $131 = (_strcmp($130,12704)|0);
   $132 = ($131|0)!=(0);
   if (!($132)) {
    HEAP32[$0>>2] = 8;
    break;
   }
   $133 = HEAP32[$name>>2]|0;
   $134 = (_strcmp($133,12719)|0);
   $135 = ($134|0)!=(0);
   if (!($135)) {
    HEAP32[$0>>2] = 9;
    break;
   }
   $136 = HEAP32[$name>>2]|0;
   $137 = (_strcmp($136,12734)|0);
   $138 = ($137|0)!=(0);
   if (!($138)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $139 = HEAP32[$name>>2]|0;
   $140 = (_strcmp($139,12755)|0);
   $141 = ($140|0)!=(0);
   if (!($141)) {
    HEAP32[$0>>2] = 10;
    break;
   }
   $142 = HEAP32[$name>>2]|0;
   $143 = (_strcmp($142,12775)|0);
   $144 = ($143|0)!=(0);
   if (!($144)) {
    HEAP32[$0>>2] = 11;
    break;
   }
   $145 = HEAP32[$name>>2]|0;
   $146 = (_strcmp($145,12795)|0);
   $147 = ($146|0)!=(0);
   if (!($147)) {
    HEAP32[$0>>2] = 12;
    break;
   }
   $148 = HEAP32[$name>>2]|0;
   $149 = (_strcmp($148,12821)|0);
   $150 = ($149|0)!=(0);
   if (!($150)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $151 = HEAP32[$name>>2]|0;
   $152 = (_strcmp($151,12840)|0);
   $153 = ($152|0)!=(0);
   if (!($153)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $154 = HEAP32[$name>>2]|0;
   $155 = (_strcmp($154,12852)|0);
   $156 = ($155|0)!=(0);
   if (!($156)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $157 = HEAP32[$name>>2]|0;
   $158 = (_strcmp($157,12864)|0);
   $159 = ($158|0)!=(0);
   if (!($159)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $160 = HEAP32[$name>>2]|0;
   $161 = (_strcmp($160,12876)|0);
   $162 = ($161|0)!=(0);
   if (!($162)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $163 = HEAP32[$name>>2]|0;
   $164 = (_strcmp($163,12888)|0);
   $165 = ($164|0)!=(0);
   if (!($165)) {
    HEAP32[$0>>2] = 17;
    break;
   }
   $166 = HEAP32[$name>>2]|0;
   $167 = (_strcmp($166,12900)|0);
   $168 = ($167|0)!=(0);
   if (!($168)) {
    HEAP32[$0>>2] = 13;
    break;
   }
   $169 = HEAP32[$name>>2]|0;
   $170 = (_strcmp($169,12912)|0);
   $171 = ($170|0)!=(0);
   if (!($171)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $172 = HEAP32[$name>>2]|0;
   $173 = (_strcmp($172,12924)|0);
   $174 = ($173|0)!=(0);
   if (!($174)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $175 = HEAP32[$name>>2]|0;
   $176 = (_strcmp($175,12936)|0);
   $177 = ($176|0)!=(0);
   if (!($177)) {
    HEAP32[$0>>2] = 14;
    break;
   }
   $178 = HEAP32[$name>>2]|0;
   $179 = (_strcmp($178,12949)|0);
   $180 = ($179|0)!=(0);
   if (!($180)) {
    HEAP32[$0>>2] = 15;
    break;
   }
   $181 = HEAP32[$name>>2]|0;
   $182 = (_strcmp($181,12962)|0);
   $183 = ($182|0)!=(0);
   if (!($183)) {
    HEAP32[$0>>2] = 16;
    break;
   }
   $184 = HEAP32[$name>>2]|0;
   $185 = (_strcmp($184,12975)|0);
   $186 = ($185|0)!=(0);
   if (!($186)) {
    HEAP32[$0>>2] = 17;
    break;
   }
   $187 = HEAP32[$name>>2]|0;
   $188 = (_strcmp($187,12988)|0);
   $189 = ($188|0)!=(0);
   if (!($189)) {
    HEAP32[$0>>2] = 18;
    break;
   }
   $190 = HEAP32[$name>>2]|0;
   $191 = (_strcmp($190,13001)|0);
   $192 = ($191|0)!=(0);
   if (!($192)) {
    HEAP32[$0>>2] = 19;
    break;
   }
   $193 = HEAP32[$name>>2]|0;
   $194 = (_strcmp($193,13014)|0);
   $195 = ($194|0)!=(0);
   if (!($195)) {
    HEAP32[$0>>2] = 20;
    break;
   }
   $196 = HEAP32[$name>>2]|0;
   $197 = (_strcmp($196,13027)|0);
   $198 = ($197|0)!=(0);
   if (!($198)) {
    HEAP32[$0>>2] = 21;
    break;
   }
   $199 = HEAP32[$name>>2]|0;
   $200 = (_strcmp($199,13040)|0);
   $201 = ($200|0)!=(0);
   if (!($201)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $202 = HEAP32[$name>>2]|0;
   $203 = (_strcmp($202,13059)|0);
   $204 = ($203|0)!=(0);
   if (!($204)) {
    HEAP32[$0>>2] = 6;
    break;
   }
   $205 = HEAP32[$name>>2]|0;
   $206 = (_strcmp($205,13078)|0);
   $207 = ($206|0)!=(0);
   if (!($207)) {
    HEAP32[$0>>2] = 7;
    break;
   }
   $208 = HEAP32[$name>>2]|0;
   $209 = (_strcmp($208,13097)|0);
   $210 = ($209|0)!=(0);
   if (!($210)) {
    HEAP32[$0>>2] = 18;
    break;
   }
   $211 = HEAP32[$name>>2]|0;
   $212 = (_strcmp($211,13110)|0);
   $213 = ($212|0)!=(0);
   if (!($213)) {
    HEAP32[$0>>2] = 19;
    break;
   }
   $214 = HEAP32[$name>>2]|0;
   $215 = (_strcmp($214,13128)|0);
   $216 = ($215|0)!=(0);
   if (!($216)) {
    HEAP32[$0>>2] = 20;
    break;
   }
   $217 = HEAP32[$name>>2]|0;
   $218 = (_strcmp($217,13146)|0);
   $219 = ($218|0)!=(0);
   if (!($219)) {
    HEAP32[$0>>2] = 21;
    break;
   }
   $220 = HEAP32[$name>>2]|0;
   $221 = (_strcmp($220,13164)|0);
   $222 = ($221|0)!=(0);
   if (!($222)) {
    HEAP32[$0>>2] = 22;
    break;
   }
   $223 = HEAP32[$name>>2]|0;
   $224 = (_strcmp($223,13182)|0);
   $225 = ($224|0)!=(0);
   if (!($225)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $226 = HEAP32[$name>>2]|0;
   $227 = (_strcmp($226,13202)|0);
   $228 = ($227|0)!=(0);
   if (!($228)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $229 = HEAP32[$name>>2]|0;
   $230 = (_strcmp($229,12143)|0);
   $231 = ($230|0)!=(0);
   if (!($231)) {
    HEAP32[$0>>2] = 6;
    break;
   }
   $232 = HEAP32[$name>>2]|0;
   $233 = (_strcmp($232,13220)|0);
   $234 = ($233|0)!=(0);
   if (!($234)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $235 = HEAP32[$name>>2]|0;
   $236 = (_strcmp($235,13235)|0);
   $237 = ($236|0)!=(0);
   if (!($237)) {
    HEAP32[$0>>2] = 8;
    break;
   }
   $238 = HEAP32[$name>>2]|0;
   $239 = (_strcmp($238,13256)|0);
   $240 = ($239|0)!=(0);
   if (!($240)) {
    HEAP32[$0>>2] = 9;
    break;
   }
   $241 = HEAP32[$name>>2]|0;
   $242 = (_strcmp($241,13271)|0);
   $243 = ($242|0)!=(0);
   if (!($243)) {
    HEAP32[$0>>2] = 10;
    break;
   }
   $244 = HEAP32[$name>>2]|0;
   $245 = (_strcmp($244,13289)|0);
   $246 = ($245|0)!=(0);
   if (!($246)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $247 = HEAP32[$name>>2]|0;
   $248 = (_strcmp($247,13305)|0);
   $249 = ($248|0)!=(0);
   if (!($249)) {
    HEAP32[$0>>2] = 11;
    break;
   }
   $250 = HEAP32[$name>>2]|0;
   $251 = (_strcmp($250,13324)|0);
   $252 = ($251|0)!=(0);
   if (!($252)) {
    HEAP32[$0>>2] = 22;
    break;
   }
   $253 = HEAP32[$name>>2]|0;
   $254 = (_strcmp($253,13338)|0);
   $255 = ($254|0)!=(0);
   if (!($255)) {
    HEAP32[$0>>2] = 23;
    break;
   }
   $256 = HEAP32[$name>>2]|0;
   $257 = (_strcmp($256,13353)|0);
   $258 = ($257|0)!=(0);
   if (!($258)) {
    HEAP32[$0>>2] = 7;
    break;
   }
   $259 = HEAP32[$name>>2]|0;
   $260 = (_strcmp($259,12074)|0);
   $261 = ($260|0)!=(0);
   if (!($261)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $262 = HEAP32[$name>>2]|0;
   $263 = (_strcmp($262,13364)|0);
   $264 = ($263|0)!=(0);
   if (!($264)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $265 = HEAP32[$name>>2]|0;
   $266 = (_strcmp($265,12173)|0);
   $267 = ($266|0)!=(0);
   if (!($267)) {
    HEAP32[$0>>2] = 23;
    break;
   }
   $268 = HEAP32[$name>>2]|0;
   $269 = (_strcmp($268,12203)|0);
   $270 = ($269|0)!=(0);
   if (!($270)) {
    HEAP32[$0>>2] = 24;
    break;
   }
   $271 = HEAP32[$name>>2]|0;
   $272 = (_strcmp($271,13380)|0);
   $273 = ($272|0)!=(0);
   if (!($273)) {
    HEAP32[$0>>2] = 12;
    break;
   }
   $274 = HEAP32[$name>>2]|0;
   $275 = (_strcmp($274,13407)|0);
   $276 = ($275|0)!=(0);
   if (!($276)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $277 = HEAP32[$name>>2]|0;
   $278 = (_strcmp($277,13421)|0);
   $279 = ($278|0)!=(0);
   if (!($279)) {
    HEAP32[$0>>2] = 13;
    break;
   }
   $280 = HEAP32[$name>>2]|0;
   $281 = (_strcmp($280,12109)|0);
   $282 = ($281|0)!=(0);
   if (!($282)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $283 = HEAP32[$name>>2]|0;
   $284 = (_strcmp($283,13441)|0);
   $285 = ($284|0)!=(0);
   if (!($285)) {
    HEAP32[$0>>2] = 6;
    break;
   }
   $286 = HEAP32[$name>>2]|0;
   $287 = (_strcmp($286,13459)|0);
   $288 = ($287|0)!=(0);
   if (!($288)) {
    HEAP32[$0>>2] = 8;
    break;
   }
   $289 = HEAP32[$name>>2]|0;
   $290 = (_strcmp($289,13471)|0);
   $291 = ($290|0)!=(0);
   if (!($291)) {
    HEAP32[$0>>2] = 24;
    break;
   }
   $292 = HEAP32[$name>>2]|0;
   $293 = (_strcmp($292,13492)|0);
   $294 = ($293|0)!=(0);
   if (!($294)) {
    HEAP32[$0>>2] = 25;
    break;
   }
   $295 = HEAP32[$name>>2]|0;
   $296 = (_strcmp($295,13510)|0);
   $297 = ($296|0)!=(0);
   if (!($297)) {
    HEAP32[$0>>2] = 26;
    break;
   }
   $298 = HEAP32[$name>>2]|0;
   $299 = (_strcmp($298,13528)|0);
   $300 = ($299|0)!=(0);
   if (!($300)) {
    HEAP32[$0>>2] = 27;
    break;
   }
   $301 = HEAP32[$name>>2]|0;
   $302 = (_strcmp($301,13549)|0);
   $303 = ($302|0)!=(0);
   if (!($303)) {
    HEAP32[$0>>2] = 14;
    break;
   }
   $304 = HEAP32[$name>>2]|0;
   $305 = (_strcmp($304,13575)|0);
   $306 = ($305|0)!=(0);
   if (!($306)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $307 = HEAP32[$name>>2]|0;
   $308 = (_strcmp($307,13598)|0);
   $309 = ($308|0)!=(0);
   if (!($309)) {
    HEAP32[$0>>2] = 15;
    break;
   }
   $310 = HEAP32[$name>>2]|0;
   $311 = (_strcmp($310,13636)|0);
   $312 = ($311|0)!=(0);
   if (!($312)) {
    HEAP32[$0>>2] = 9;
    break;
   }
   $313 = HEAP32[$name>>2]|0;
   $314 = (_strcmp($313,13652)|0);
   $315 = ($314|0)!=(0);
   if (!($315)) {
    HEAP32[$0>>2] = 7;
    break;
   }
   $316 = HEAP32[$name>>2]|0;
   $317 = (_strcmp($316,13667)|0);
   $318 = ($317|0)!=(0);
   if (!($318)) {
    HEAP32[$0>>2] = 25;
    break;
   }
   $319 = HEAP32[$name>>2]|0;
   $320 = (_strcmp($319,13690)|0);
   $321 = ($320|0)!=(0);
   if (!($321)) {
    HEAP32[$0>>2] = 16;
    break;
   }
   $322 = HEAP32[$name>>2]|0;
   $323 = (_strcmp($322,13703)|0);
   $324 = ($323|0)!=(0);
   if (!($324)) {
    HEAP32[$0>>2] = 28;
    break;
   }
   $325 = HEAP32[$name>>2]|0;
   $326 = (_strcmp($325,13717)|0);
   $327 = ($326|0)!=(0);
   if (!($327)) {
    HEAP32[$0>>2] = 29;
    break;
   }
   $328 = HEAP32[$name>>2]|0;
   $329 = (_strcmp($328,13731)|0);
   $330 = ($329|0)!=(0);
   if (!($330)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $331 = HEAP32[$name>>2]|0;
   $332 = (_strcmp($331,13751)|0);
   $333 = ($332|0)!=(0);
   if (!($333)) {
    HEAP32[$0>>2] = 8;
    break;
   }
   $334 = HEAP32[$name>>2]|0;
   $335 = (_strcmp($334,13771)|0);
   $336 = ($335|0)!=(0);
   if (!($336)) {
    HEAP32[$0>>2] = 17;
    break;
   }
   $337 = HEAP32[$name>>2]|0;
   $338 = (_strcmp($337,13787)|0);
   $339 = ($338|0)!=(0);
   if (!($339)) {
    HEAP32[$0>>2] = 18;
    break;
   }
   $340 = HEAP32[$name>>2]|0;
   $341 = (_strcmp($340,13805)|0);
   $342 = ($341|0)!=(0);
   if (!($342)) {
    HEAP32[$0>>2] = 26;
    break;
   }
   $343 = HEAP32[$name>>2]|0;
   $344 = (_strcmp($343,13821)|0);
   $345 = ($344|0)!=(0);
   if (!($345)) {
    HEAP32[$0>>2] = 19;
    break;
   }
   $346 = HEAP32[$name>>2]|0;
   $347 = (_strcmp($346,13836)|0);
   $348 = ($347|0)!=(0);
   if (!($348)) {
    HEAP32[$0>>2] = 9;
    break;
   }
   $349 = HEAP32[$name>>2]|0;
   $350 = (_strcmp($349,13858)|0);
   $351 = ($350|0)!=(0);
   if (!($351)) {
    HEAP32[$0>>2] = 30;
    break;
   }
   $352 = HEAP32[$name>>2]|0;
   $353 = (_strcmp($352,13876)|0);
   $354 = ($353|0)!=(0);
   if (!($354)) {
    HEAP32[$0>>2] = 31;
    break;
   }
   $355 = HEAP32[$name>>2]|0;
   $356 = (_strcmp($355,13897)|0);
   $357 = ($356|0)!=(0);
   if (!($357)) {
    HEAP32[$0>>2] = 10;
    break;
   }
   $358 = HEAP32[$name>>2]|0;
   $359 = (_strcmp($358,13915)|0);
   $360 = ($359|0)!=(0);
   if (!($360)) {
    HEAP32[$0>>2] = 11;
    break;
   }
   $361 = HEAP32[$name>>2]|0;
   $362 = (_strcmp($361,13928)|0);
   $363 = ($362|0)!=(0);
   if (!($363)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $364 = HEAP32[$name>>2]|0;
   $365 = (_strcmp($364,13943)|0);
   $366 = ($365|0)!=(0);
   if (!($366)) {
    HEAP32[$0>>2] = 12;
    break;
   }
   $367 = HEAP32[$name>>2]|0;
   $368 = (_strcmp($367,13957)|0);
   $369 = ($368|0)!=(0);
   if (!($369)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $370 = HEAP32[$name>>2]|0;
   $371 = (_strcmp($370,13967)|0);
   $372 = ($371|0)!=(0);
   if (!($372)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $373 = HEAP32[$name>>2]|0;
   $374 = (_strcmp($373,13977)|0);
   $375 = ($374|0)!=(0);
   if (!($375)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $376 = HEAP32[$name>>2]|0;
   $377 = (_strcmp($376,13999)|0);
   $378 = ($377|0)!=(0);
   if (!($378)) {
    HEAP32[$0>>2] = 13;
    break;
   }
   $379 = HEAP32[$name>>2]|0;
   $380 = (_strcmp($379,14025)|0);
   $381 = ($380|0)!=(0);
   if (!($381)) {
    HEAP32[$0>>2] = 14;
    break;
   }
   $382 = HEAP32[$name>>2]|0;
   $383 = (_strcmp($382,14052)|0);
   $384 = ($383|0)!=(0);
   if (!($384)) {
    HEAP32[$0>>2] = 27;
    break;
   }
   $385 = HEAP32[$name>>2]|0;
   $386 = (_strcmp($385,14065)|0);
   $387 = ($386|0)!=(0);
   if (!($387)) {
    HEAP32[$0>>2] = 20;
    break;
   }
   $388 = HEAP32[$name>>2]|0;
   $389 = (_strcmp($388,14080)|0);
   $390 = ($389|0)!=(0);
   if (!($390)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $391 = HEAP32[$name>>2]|0;
   $392 = (_strcmp($391,14095)|0);
   $393 = ($392|0)!=(0);
   if (!($393)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $394 = HEAP32[$name>>2]|0;
   $395 = (_strcmp($394,14119)|0);
   $396 = ($395|0)!=(0);
   if (!($396)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $397 = HEAP32[$name>>2]|0;
   $398 = (_strcmp($397,14130)|0);
   $399 = ($398|0)!=(0);
   if (!($399)) {
    HEAP32[$0>>2] = 32;
    break;
   }
   $400 = HEAP32[$name>>2]|0;
   $401 = (_strcmp($400,14152)|0);
   $402 = ($401|0)!=(0);
   if (!($402)) {
    HEAP32[$0>>2] = 21;
    break;
   }
   $403 = HEAP32[$name>>2]|0;
   $404 = (_strcmp($403,14174)|0);
   $405 = ($404|0)!=(0);
   if (!($405)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $406 = HEAP32[$name>>2]|0;
   $407 = (_strcmp($406,14198)|0);
   $408 = ($407|0)!=(0);
   if (!($408)) {
    HEAP32[$0>>2] = 4;
    break;
   }
   $409 = HEAP32[$name>>2]|0;
   $410 = (_strcmp($409,14207)|0);
   $411 = ($410|0)!=(0);
   if (!($411)) {
    HEAP32[$0>>2] = 5;
    break;
   }
   $412 = HEAP32[$name>>2]|0;
   $413 = (_strcmp($412,14215)|0);
   $414 = ($413|0)!=(0);
   if (!($414)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $415 = HEAP32[$name>>2]|0;
   $416 = (_strcmp($415,14228)|0);
   $417 = ($416|0)!=(0);
   if (!($417)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $418 = HEAP32[$name>>2]|0;
   $419 = (_strcmp($418,14242)|0);
   $420 = ($419|0)!=(0);
   if (!($420)) {
    HEAP32[$0>>2] = 15;
    break;
   }
   $421 = HEAP32[$name>>2]|0;
   $422 = (_strcmp($421,14254)|0);
   $423 = ($422|0)!=(0);
   if (!($423)) {
    HEAP32[$0>>2] = 16;
    break;
   }
   $424 = HEAP32[$name>>2]|0;
   $425 = (_strcmp($424,14263)|0);
   $426 = ($425|0)!=(0);
   if (!($426)) {
    HEAP32[$0>>2] = 17;
    break;
   }
   $427 = HEAP32[$name>>2]|0;
   $428 = (_strcmp($427,14273)|0);
   $429 = ($428|0)!=(0);
   if (!($429)) {
    HEAP32[$0>>2] = 18;
    break;
   }
   $430 = HEAP32[$name>>2]|0;
   $431 = (_strcmp($430,14285)|0);
   $432 = ($431|0)!=(0);
   if (!($432)) {
    HEAP32[$0>>2] = 19;
    break;
   }
   $433 = HEAP32[$name>>2]|0;
   $434 = (_strcmp($433,14296)|0);
   $435 = ($434|0)!=(0);
   if (!($435)) {
    HEAP32[$0>>2] = 20;
    break;
   }
   $436 = HEAP32[$name>>2]|0;
   $437 = (_strcmp($436,14304)|0);
   $438 = ($437|0)!=(0);
   if (!($438)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $439 = HEAP32[$name>>2]|0;
   $440 = (_strcmp($439,14316)|0);
   $441 = ($440|0)!=(0);
   if (!($441)) {
    HEAP32[$0>>2] = 21;
    break;
   }
   $442 = HEAP32[$name>>2]|0;
   $443 = (_strcmp($442,14331)|0);
   $444 = ($443|0)!=(0);
   if (!($444)) {
    HEAP32[$0>>2] = 22;
    break;
   }
   $445 = HEAP32[$name>>2]|0;
   $446 = (_strcmp($445,14343)|0);
   $447 = ($446|0)!=(0);
   if (!($447)) {
    HEAP32[$0>>2] = 23;
    break;
   }
   $448 = HEAP32[$name>>2]|0;
   $449 = (_strcmp($448,14357)|0);
   $450 = ($449|0)!=(0);
   if (!($450)) {
    HEAP32[$0>>2] = 10;
    break;
   }
   $451 = HEAP32[$name>>2]|0;
   $452 = (_strcmp($451,14382)|0);
   $453 = ($452|0)!=(0);
   if (!($453)) {
    HEAP32[$0>>2] = 24;
    break;
   }
   $454 = HEAP32[$name>>2]|0;
   $455 = (_strcmp($454,14399)|0);
   $456 = ($455|0)!=(0);
   if (!($456)) {
    HEAP32[$0>>2] = 25;
    break;
   }
   $457 = HEAP32[$name>>2]|0;
   $458 = (_strcmp($457,14415)|0);
   $459 = ($458|0)!=(0);
   if (!($459)) {
    HEAP32[$0>>2] = 26;
    break;
   }
   $460 = HEAP32[$name>>2]|0;
   $461 = (_strcmp($460,14431)|0);
   $462 = ($461|0)!=(0);
   if (!($462)) {
    HEAP32[$0>>2] = 11;
    break;
   }
   $463 = HEAP32[$name>>2]|0;
   $464 = (_strcmp($463,14443)|0);
   $465 = ($464|0)!=(0);
   if (!($465)) {
    HEAP32[$0>>2] = 33;
    break;
   }
   $466 = HEAP32[$name>>2]|0;
   $467 = (_strcmp($466,14455)|0);
   $468 = ($467|0)!=(0);
   if (!($468)) {
    HEAP32[$0>>2] = 34;
    break;
   }
   $469 = HEAP32[$name>>2]|0;
   $470 = (_strcmp($469,14479)|0);
   $471 = ($470|0)!=(0);
   if (!($471)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $472 = HEAP32[$name>>2]|0;
   $473 = (_strcmp($472,14492)|0);
   $474 = ($473|0)!=(0);
   if (!($474)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $475 = HEAP32[$name>>2]|0;
   $476 = (_strcmp($475,14506)|0);
   $477 = ($476|0)!=(0);
   if (!($477)) {
    HEAP32[$0>>2] = 35;
    break;
   }
   $478 = HEAP32[$name>>2]|0;
   $479 = (_strcmp($478,14528)|0);
   $480 = ($479|0)!=(0);
   if (!($480)) {
    HEAP32[$0>>2] = 36;
    break;
   }
   $481 = HEAP32[$name>>2]|0;
   $482 = (_strcmp($481,14535)|0);
   $483 = ($482|0)!=(0);
   if (!($483)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $484 = HEAP32[$name>>2]|0;
   $485 = (_strcmp($484,14551)|0);
   $486 = ($485|0)!=(0);
   if (!($486)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $487 = HEAP32[$name>>2]|0;
   $488 = (_strcmp($487,14568)|0);
   $489 = ($488|0)!=(0);
   if (!($489)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $490 = HEAP32[$name>>2]|0;
   $491 = (_strcmp($490,14585)|0);
   $492 = ($491|0)!=(0);
   if (!($492)) {
    HEAP32[$0>>2] = 28;
    break;
   }
   $493 = HEAP32[$name>>2]|0;
   $494 = (_strcmp($493,14601)|0);
   $495 = ($494|0)!=(0);
   if (!($495)) {
    HEAP32[$0>>2] = 1;
    break;
   }
   $496 = HEAP32[$name>>2]|0;
   $497 = (_strcmp($496,14617)|0);
   $498 = ($497|0)!=(0);
   if (!($498)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $499 = HEAP32[$name>>2]|0;
   $500 = (_strcmp($499,14634)|0);
   $501 = ($500|0)!=(0);
   if (!($501)) {
    HEAP32[$0>>2] = 29;
    break;
   }
   $502 = HEAP32[$name>>2]|0;
   $503 = (_strcmp($502,14648)|0);
   $504 = ($503|0)!=(0);
   if (!($504)) {
    HEAP32[$0>>2] = 30;
    break;
   }
   $505 = HEAP32[$name>>2]|0;
   $506 = (_strcmp($505,14660)|0);
   $507 = ($506|0)!=(0);
   if (!($507)) {
    HEAP32[$0>>2] = 22;
    break;
   }
   $508 = HEAP32[$name>>2]|0;
   $509 = (_strcmp($508,14671)|0);
   $510 = ($509|0)!=(0);
   if (!($510)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $511 = HEAP32[$name>>2]|0;
   $512 = (_strcmp($511,14684)|0);
   $513 = ($512|0)!=(0);
   if (!($513)) {
    HEAP32[$0>>2] = 23;
    break;
   }
   $514 = HEAP32[$name>>2]|0;
   $515 = (_strcmp($514,14694)|0);
   $516 = ($515|0)!=(0);
   if (!($516)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $517 = HEAP32[$name>>2]|0;
   $518 = (_strcmp($517,14711)|0);
   $519 = ($518|0)!=(0);
   if (!($519)) {
    HEAP32[$0>>2] = 24;
    break;
   }
   $520 = HEAP32[$name>>2]|0;
   $521 = (_strcmp($520,14723)|0);
   $522 = ($521|0)!=(0);
   if (!($522)) {
    HEAP32[$0>>2] = 25;
    break;
   }
   $523 = HEAP32[$name>>2]|0;
   $524 = (_strcmp($523,14745)|0);
   $525 = ($524|0)!=(0);
   if (!($525)) {
    HEAP32[$0>>2] = 26;
    break;
   }
   $526 = HEAP32[$name>>2]|0;
   $527 = (_strcmp($526,14765)|0);
   $528 = ($527|0)!=(0);
   if (!($528)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $529 = HEAP32[$name>>2]|0;
   $530 = (_strcmp($529,14778)|0);
   $531 = ($530|0)!=(0);
   if (!($531)) {
    HEAP32[$0>>2] = 27;
    break;
   }
   $532 = HEAP32[$name>>2]|0;
   $533 = (_strcmp($532,14800)|0);
   $534 = ($533|0)!=(0);
   if (!($534)) {
    HEAP32[$0>>2] = 28;
    break;
   }
   $535 = HEAP32[$name>>2]|0;
   $536 = (_strcmp($535,14820)|0);
   $537 = ($536|0)!=(0);
   if (!($537)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $538 = HEAP32[$name>>2]|0;
   $539 = (_strcmp($538,14837)|0);
   $540 = ($539|0)!=(0);
   if (!($540)) {
    HEAP32[$0>>2] = 2;
    break;
   }
   $541 = HEAP32[$name>>2]|0;
   $542 = (_strcmp($541,14854)|0);
   $543 = ($542|0)!=(0);
   if (!($543)) {
    HEAP32[$0>>2] = 3;
    break;
   }
   $544 = HEAP32[$name>>2]|0;
   $545 = (_strcmp($544,14874)|0);
   $546 = ($545|0)!=(0);
   if ($546) {
    $547 = HEAP32[$1>>2]|0;
    $548 = HEAP32[$name>>2]|0;
    $549 = _emscripten_asm_const_2(0, ($547|0), ($548|0))|0;
    HEAP32[$0>>2] = 0;
    break;
   } else {
    HEAP32[$0>>2] = 37;
    break;
   }
  } else {
   HEAP32[$0>>2] = 5;
  }
 } while(0);
 $550 = HEAP32[$0>>2]|0;
 STACKTOP = sp;return ($550|0);
}
function _strerror($e) {
 $e = $e|0;
 var $$lcssa = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$03 = 0, $i$03$lcssa = 0, $i$12 = 0, $s$0$lcssa = 0, $s$01 = 0, $s$1 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $i$03 = 0;
 while(1) {
  $1 = (14990 + ($i$03)|0);
  $2 = HEAP8[$1>>0]|0;
  $3 = $2&255;
  $4 = ($3|0)==($e|0);
  if ($4) {
   $i$03$lcssa = $i$03;
   label = 2;
   break;
  }
  $5 = (($i$03) + 1)|0;
  $6 = ($5|0)==(87);
  if ($6) {
   $i$12 = 87;$s$01 = 15078;
   label = 5;
   break;
  } else {
   $i$03 = $5;
  }
 }
 if ((label|0) == 2) {
  $0 = ($i$03$lcssa|0)==(0);
  if ($0) {
   $s$0$lcssa = 15078;
  } else {
   $i$12 = $i$03$lcssa;$s$01 = 15078;
   label = 5;
  }
 }
 if ((label|0) == 5) {
  while(1) {
   label = 0;
   $s$1 = $s$01;
   while(1) {
    $7 = HEAP8[$s$1>>0]|0;
    $8 = ($7<<24>>24)==(0);
    $9 = ((($s$1)) + 1|0);
    if ($8) {
     $$lcssa = $9;
     break;
    } else {
     $s$1 = $9;
    }
   }
   $10 = (($i$12) + -1)|0;
   $11 = ($10|0)==(0);
   if ($11) {
    $s$0$lcssa = $$lcssa;
    break;
   } else {
    $i$12 = $10;$s$01 = $$lcssa;
    label = 5;
   }
  }
 }
 return ($s$0$lcssa|0);
}
function ___errno_location() {
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = HEAP32[4992>>2]|0;
 $1 = ($0|0)==(0|0);
 if ($1) {
  $$0 = 5044;
 } else {
  $2 = (_pthread_self()|0);
  $3 = ((($2)) + 60|0);
  $4 = HEAP32[$3>>2]|0;
  $$0 = $4;
 }
 return ($$0|0);
}
function ___syscall_ret($r) {
 $r = $r|0;
 var $$0 = 0, $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($r>>>0)>(4294963200);
 if ($0) {
  $1 = (0 - ($r))|0;
  $2 = (___errno_location()|0);
  HEAP32[$2>>2] = $1;
  $$0 = -1;
 } else {
  $$0 = $r;
 }
 return ($$0|0);
}
function _frexp($x,$e) {
 $x = +$x;
 $e = $e|0;
 var $$0 = 0.0, $$01 = 0.0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0.0, $7 = 0.0, $8 = 0, $9 = 0, $storemerge = 0, label = 0, sp = 0;
 sp = STACKTOP;
 HEAPF64[tempDoublePtr>>3] = $x;$0 = HEAP32[tempDoublePtr>>2]|0;
 $1 = HEAP32[tempDoublePtr+4>>2]|0;
 $2 = (_bitshift64Lshr(($0|0),($1|0),52)|0);
 $3 = tempRet0;
 $4 = $2 & 2047;
 switch ($4|0) {
 case 0:  {
  $5 = $x != 0.0;
  if ($5) {
   $6 = $x * 1.8446744073709552E+19;
   $7 = (+_frexp($6,$e));
   $8 = HEAP32[$e>>2]|0;
   $9 = (($8) + -64)|0;
   $$01 = $7;$storemerge = $9;
  } else {
   $$01 = $x;$storemerge = 0;
  }
  HEAP32[$e>>2] = $storemerge;
  $$0 = $$01;
  break;
 }
 case 2047:  {
  $$0 = $x;
  break;
 }
 default: {
  $10 = (($4) + -1022)|0;
  HEAP32[$e>>2] = $10;
  $11 = $1 & -2146435073;
  $12 = $11 | 1071644672;
  HEAP32[tempDoublePtr>>2] = $0;HEAP32[tempDoublePtr+4>>2] = $12;$13 = +HEAPF64[tempDoublePtr>>3];
  $$0 = $13;
 }
 }
 return (+$$0);
}
function _frexpl($x,$e) {
 $x = +$x;
 $e = $e|0;
 var $0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (+_frexp($x,$e));
 return (+$0);
}
function _roundf($x) {
 $x = +$x;
 var $$0 = 0.0, $$x = 0.0, $$y$0 = 0.0, $0 = 0, $1 = 0, $10 = 0.0, $11 = 0, $12 = 0.0, $13 = 0.0, $14 = 0, $15 = 0.0, $16 = 0.0, $17 = 0.0, $2 = 0, $3 = 0, $4 = 0, $5 = 0.0, $6 = 0, $7 = 0.0, $8 = 0.0;
 var $9 = 0.0, $y$0 = 0.0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (HEAPF32[tempDoublePtr>>2]=$x,HEAP32[tempDoublePtr>>2]|0);
 $1 = $0 >>> 23;
 $2 = $1 & 255;
 $3 = ($2>>>0)>(149);
 do {
  if ($3) {
   $$0 = $x;
  } else {
   $4 = ($0|0)<(0);
   $5 = -$x;
   $$x = $4 ? $5 : $x;
   $6 = ($2>>>0)<(126);
   if ($6) {
    $7 = $x * 0.0;
    $$0 = $7;
    break;
   }
   $8 = $$x + 8388608.0;
   $9 = $8 + -8388608.0;
   $10 = $9 - $$x;
   $11 = $10 > 0.5;
   if ($11) {
    $12 = $$x + $10;
    $13 = $12 + -1.0;
    $y$0 = $13;
   } else {
    $14 = !($10 <= -0.5);
    $15 = $$x + $10;
    if ($14) {
     $y$0 = $15;
    } else {
     $16 = $15 + 1.0;
     $y$0 = $16;
    }
   }
   $17 = -$y$0;
   $$y$0 = $4 ? $17 : $y$0;
   $$0 = $$y$0;
  }
 } while(0);
 return (+$$0);
}
function _wcrtomb($s,$wc,$st) {
 $s = $s|0;
 $wc = $wc|0;
 $st = $st|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0;
 var $44 = 0, $45 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($s|0)==(0|0);
 do {
  if ($0) {
   $$0 = 1;
  } else {
   $1 = ($wc>>>0)<(128);
   if ($1) {
    $2 = $wc&255;
    HEAP8[$s>>0] = $2;
    $$0 = 1;
    break;
   }
   $3 = ($wc>>>0)<(2048);
   if ($3) {
    $4 = $wc >>> 6;
    $5 = $4 | 192;
    $6 = $5&255;
    $7 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $6;
    $8 = $wc & 63;
    $9 = $8 | 128;
    $10 = $9&255;
    HEAP8[$7>>0] = $10;
    $$0 = 2;
    break;
   }
   $11 = ($wc>>>0)<(55296);
   $12 = $wc & -8192;
   $13 = ($12|0)==(57344);
   $or$cond = $11 | $13;
   if ($or$cond) {
    $14 = $wc >>> 12;
    $15 = $14 | 224;
    $16 = $15&255;
    $17 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $16;
    $18 = $wc >>> 6;
    $19 = $18 & 63;
    $20 = $19 | 128;
    $21 = $20&255;
    $22 = ((($s)) + 2|0);
    HEAP8[$17>>0] = $21;
    $23 = $wc & 63;
    $24 = $23 | 128;
    $25 = $24&255;
    HEAP8[$22>>0] = $25;
    $$0 = 3;
    break;
   }
   $26 = (($wc) + -65536)|0;
   $27 = ($26>>>0)<(1048576);
   if ($27) {
    $28 = $wc >>> 18;
    $29 = $28 | 240;
    $30 = $29&255;
    $31 = ((($s)) + 1|0);
    HEAP8[$s>>0] = $30;
    $32 = $wc >>> 12;
    $33 = $32 & 63;
    $34 = $33 | 128;
    $35 = $34&255;
    $36 = ((($s)) + 2|0);
    HEAP8[$31>>0] = $35;
    $37 = $wc >>> 6;
    $38 = $37 & 63;
    $39 = $38 | 128;
    $40 = $39&255;
    $41 = ((($s)) + 3|0);
    HEAP8[$36>>0] = $40;
    $42 = $wc & 63;
    $43 = $42 | 128;
    $44 = $43&255;
    HEAP8[$41>>0] = $44;
    $$0 = 4;
    break;
   } else {
    $45 = (___errno_location()|0);
    HEAP32[$45>>2] = 84;
    $$0 = -1;
    break;
   }
  }
 } while(0);
 return ($$0|0);
}
function _wctomb($s,$wc) {
 $s = $s|0;
 $wc = $wc|0;
 var $$0 = 0, $0 = 0, $1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($s|0)==(0|0);
 if ($0) {
  $$0 = 0;
 } else {
  $1 = (_wcrtomb($s,$wc,0)|0);
  $$0 = $1;
 }
 return ($$0|0);
}
function _srand($s) {
 $s = $s|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (($s) + -1)|0;
 $1 = 64;
 $2 = $1;
 HEAP32[$2>>2] = $0;
 $3 = (($1) + 4)|0;
 $4 = $3;
 HEAP32[$4>>2] = 0;
 return;
}
function _fflush($f) {
 $f = $f|0;
 var $$0 = 0, $$01 = 0, $$012 = 0, $$014 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phitmp = 0, $r$0$lcssa = 0, $r$03 = 0, $r$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($f|0)==(0|0);
 do {
  if ($0) {
   $7 = HEAP32[5040>>2]|0;
   $8 = ($7|0)==(0|0);
   if ($8) {
    $27 = 0;
   } else {
    $9 = HEAP32[5040>>2]|0;
    $10 = (_fflush($9)|0);
    $27 = $10;
   }
   ___lock(((5020)|0));
   $$012 = HEAP32[(5016)>>2]|0;
   $11 = ($$012|0)==(0|0);
   if ($11) {
    $r$0$lcssa = $27;
   } else {
    $$014 = $$012;$r$03 = $27;
    while(1) {
     $12 = ((($$014)) + 76|0);
     $13 = HEAP32[$12>>2]|0;
     $14 = ($13|0)>(-1);
     if ($14) {
      $15 = (___lockfile($$014)|0);
      $23 = $15;
     } else {
      $23 = 0;
     }
     $16 = ((($$014)) + 20|0);
     $17 = HEAP32[$16>>2]|0;
     $18 = ((($$014)) + 28|0);
     $19 = HEAP32[$18>>2]|0;
     $20 = ($17>>>0)>($19>>>0);
     if ($20) {
      $21 = (___fflush_unlocked($$014)|0);
      $22 = $21 | $r$03;
      $r$1 = $22;
     } else {
      $r$1 = $r$03;
     }
     $24 = ($23|0)==(0);
     if (!($24)) {
      ___unlockfile($$014);
     }
     $25 = ((($$014)) + 56|0);
     $$01 = HEAP32[$25>>2]|0;
     $26 = ($$01|0)==(0|0);
     if ($26) {
      $r$0$lcssa = $r$1;
      break;
     } else {
      $$014 = $$01;$r$03 = $r$1;
     }
    }
   }
   ___unlock(((5020)|0));
   $$0 = $r$0$lcssa;
  } else {
   $1 = ((($f)) + 76|0);
   $2 = HEAP32[$1>>2]|0;
   $3 = ($2|0)>(-1);
   if (!($3)) {
    $4 = (___fflush_unlocked($f)|0);
    $$0 = $4;
    break;
   }
   $5 = (___lockfile($f)|0);
   $phitmp = ($5|0)==(0);
   $6 = (___fflush_unlocked($f)|0);
   if ($phitmp) {
    $$0 = $6;
   } else {
    ___unlockfile($f);
    $$0 = $6;
   }
  }
 } while(0);
 return ($$0|0);
}
function _fputc($c,$f) {
 $c = $c|0;
 $f = $f|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0;
 var $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 76|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)<(0);
 if ($2) {
  label = 3;
 } else {
  $3 = (___lockfile($f)|0);
  $4 = ($3|0)==(0);
  if ($4) {
   label = 3;
  } else {
   $18 = ((($f)) + 75|0);
   $19 = HEAP8[$18>>0]|0;
   $20 = $19 << 24 >> 24;
   $21 = ($20|0)==($c|0);
   if ($21) {
    label = 10;
   } else {
    $22 = ((($f)) + 20|0);
    $23 = HEAP32[$22>>2]|0;
    $24 = ((($f)) + 16|0);
    $25 = HEAP32[$24>>2]|0;
    $26 = ($23>>>0)<($25>>>0);
    if ($26) {
     $27 = $c&255;
     $28 = ((($23)) + 1|0);
     HEAP32[$22>>2] = $28;
     HEAP8[$23>>0] = $27;
     $29 = $c & 255;
     $31 = $29;
    } else {
     label = 10;
    }
   }
   if ((label|0) == 10) {
    $30 = (___overflow($f,$c)|0);
    $31 = $30;
   }
   ___unlockfile($f);
   $$0 = $31;
  }
 }
 do {
  if ((label|0) == 3) {
   $5 = ((($f)) + 75|0);
   $6 = HEAP8[$5>>0]|0;
   $7 = $6 << 24 >> 24;
   $8 = ($7|0)==($c|0);
   if (!($8)) {
    $9 = ((($f)) + 20|0);
    $10 = HEAP32[$9>>2]|0;
    $11 = ((($f)) + 16|0);
    $12 = HEAP32[$11>>2]|0;
    $13 = ($10>>>0)<($12>>>0);
    if ($13) {
     $14 = $c&255;
     $15 = ((($10)) + 1|0);
     HEAP32[$9>>2] = $15;
     HEAP8[$10>>0] = $14;
     $16 = $c & 255;
     $$0 = $16;
     break;
    }
   }
   $17 = (___overflow($f,$c)|0);
   $$0 = $17;
  }
 } while(0);
 return ($$0|0);
}
function ___fwritex($s,$l,$f) {
 $s = $s|0;
 $l = $l|0;
 $f = $f|0;
 var $$0 = 0, $$01 = 0, $$02 = 0, $$pre = 0, $$pre6 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0;
 var $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $i$0 = 0, $i$0$lcssa10 = 0;
 var $i$1 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 16|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0|0);
 if ($2) {
  $3 = (___towrite($f)|0);
  $4 = ($3|0)==(0);
  if ($4) {
   $$pre = HEAP32[$0>>2]|0;
   $7 = $$pre;
   label = 4;
  } else {
   $$0 = 0;
  }
 } else {
  $7 = $1;
  label = 4;
 }
 L4: do {
  if ((label|0) == 4) {
   $5 = ((($f)) + 20|0);
   $6 = HEAP32[$5>>2]|0;
   $8 = $7;
   $9 = $6;
   $10 = (($8) - ($9))|0;
   $11 = ($10>>>0)<($l>>>0);
   if ($11) {
    $12 = ((($f)) + 36|0);
    $13 = HEAP32[$12>>2]|0;
    $14 = (FUNCTION_TABLE_iiii[$13 & 3]($f,$s,$l)|0);
    $$0 = $14;
    break;
   }
   $15 = ((($f)) + 75|0);
   $16 = HEAP8[$15>>0]|0;
   $17 = ($16<<24>>24)>(-1);
   L9: do {
    if ($17) {
     $i$0 = $l;
     while(1) {
      $18 = ($i$0|0)==(0);
      if ($18) {
       $$01 = $l;$$02 = $s;$29 = $6;$i$1 = 0;
       break L9;
      }
      $19 = (($i$0) + -1)|0;
      $20 = (($s) + ($19)|0);
      $21 = HEAP8[$20>>0]|0;
      $22 = ($21<<24>>24)==(10);
      if ($22) {
       $i$0$lcssa10 = $i$0;
       break;
      } else {
       $i$0 = $19;
      }
     }
     $23 = ((($f)) + 36|0);
     $24 = HEAP32[$23>>2]|0;
     $25 = (FUNCTION_TABLE_iiii[$24 & 3]($f,$s,$i$0$lcssa10)|0);
     $26 = ($25>>>0)<($i$0$lcssa10>>>0);
     if ($26) {
      $$0 = $i$0$lcssa10;
      break L4;
     }
     $27 = (($s) + ($i$0$lcssa10)|0);
     $28 = (($l) - ($i$0$lcssa10))|0;
     $$pre6 = HEAP32[$5>>2]|0;
     $$01 = $28;$$02 = $27;$29 = $$pre6;$i$1 = $i$0$lcssa10;
    } else {
     $$01 = $l;$$02 = $s;$29 = $6;$i$1 = 0;
    }
   } while(0);
   _memcpy(($29|0),($$02|0),($$01|0))|0;
   $30 = HEAP32[$5>>2]|0;
   $31 = (($30) + ($$01)|0);
   HEAP32[$5>>2] = $31;
   $32 = (($i$1) + ($$01))|0;
   $$0 = $32;
  }
 } while(0);
 return ($$0|0);
}
function _fwrite($src,$size,$nmemb,$f) {
 $src = $src|0;
 $size = $size|0;
 $nmemb = $nmemb|0;
 $f = $f|0;
 var $0 = 0, $1 = 0, $10 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $phitmp = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = Math_imul($nmemb, $size)|0;
 $1 = ((($f)) + 76|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)>(-1);
 if ($3) {
  $5 = (___lockfile($f)|0);
  $phitmp = ($5|0)==(0);
  $6 = (___fwritex($src,$0,$f)|0);
  if ($phitmp) {
   $7 = $6;
  } else {
   ___unlockfile($f);
   $7 = $6;
  }
 } else {
  $4 = (___fwritex($src,$0,$f)|0);
  $7 = $4;
 }
 $8 = ($7|0)==($0|0);
 if ($8) {
  $10 = $nmemb;
 } else {
  $9 = (($7>>>0) / ($size>>>0))&-1;
  $10 = $9;
 }
 return ($10|0);
}
function _vfprintf($f,$fmt,$ap) {
 $f = $f|0;
 $fmt = $fmt|0;
 $ap = $ap|0;
 var $$ = 0, $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0;
 var $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $ap2 = 0, $internal_buf = 0, $nl_arg = 0, $nl_type = 0;
 var $ret$1 = 0, $ret$1$ = 0, $vacopy_currentptr = 0, dest = 0, label = 0, sp = 0, stop = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 224|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $ap2 = sp + 120|0;
 $nl_type = sp + 80|0;
 $nl_arg = sp;
 $internal_buf = sp + 136|0;
 dest=$nl_type; stop=dest+40|0; do { HEAP32[dest>>2]=0|0; dest=dest+4|0; } while ((dest|0) < (stop|0));
 $vacopy_currentptr = HEAP32[$ap>>2]|0;
 HEAP32[$ap2>>2] = $vacopy_currentptr;
 $0 = (_printf_core(0,$fmt,$ap2,$nl_arg,$nl_type)|0);
 $1 = ($0|0)<(0);
 if ($1) {
  $$0 = -1;
 } else {
  $2 = ((($f)) + 76|0);
  $3 = HEAP32[$2>>2]|0;
  $4 = ($3|0)>(-1);
  if ($4) {
   $5 = (___lockfile($f)|0);
   $32 = $5;
  } else {
   $32 = 0;
  }
  $6 = HEAP32[$f>>2]|0;
  $7 = $6 & 32;
  $8 = ((($f)) + 74|0);
  $9 = HEAP8[$8>>0]|0;
  $10 = ($9<<24>>24)<(1);
  if ($10) {
   $11 = $6 & -33;
   HEAP32[$f>>2] = $11;
  }
  $12 = ((($f)) + 48|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ($13|0)==(0);
  if ($14) {
   $16 = ((($f)) + 44|0);
   $17 = HEAP32[$16>>2]|0;
   HEAP32[$16>>2] = $internal_buf;
   $18 = ((($f)) + 28|0);
   HEAP32[$18>>2] = $internal_buf;
   $19 = ((($f)) + 20|0);
   HEAP32[$19>>2] = $internal_buf;
   HEAP32[$12>>2] = 80;
   $20 = ((($internal_buf)) + 80|0);
   $21 = ((($f)) + 16|0);
   HEAP32[$21>>2] = $20;
   $22 = (_printf_core($f,$fmt,$ap2,$nl_arg,$nl_type)|0);
   $23 = ($17|0)==(0|0);
   if ($23) {
    $ret$1 = $22;
   } else {
    $24 = ((($f)) + 36|0);
    $25 = HEAP32[$24>>2]|0;
    (FUNCTION_TABLE_iiii[$25 & 3]($f,0,0)|0);
    $26 = HEAP32[$19>>2]|0;
    $27 = ($26|0)==(0|0);
    $$ = $27 ? -1 : $22;
    HEAP32[$16>>2] = $17;
    HEAP32[$12>>2] = 0;
    HEAP32[$21>>2] = 0;
    HEAP32[$18>>2] = 0;
    HEAP32[$19>>2] = 0;
    $ret$1 = $$;
   }
  } else {
   $15 = (_printf_core($f,$fmt,$ap2,$nl_arg,$nl_type)|0);
   $ret$1 = $15;
  }
  $28 = HEAP32[$f>>2]|0;
  $29 = $28 & 32;
  $30 = ($29|0)==(0);
  $ret$1$ = $30 ? $ret$1 : -1;
  $31 = $28 | $7;
  HEAP32[$f>>2] = $31;
  $33 = ($32|0)==(0);
  if (!($33)) {
   ___unlockfile($f);
  }
  $$0 = $ret$1$;
 }
 STACKTOP = sp;return ($$0|0);
}
function ___lockfile($f) {
 $f = $f|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return 0;
}
function ___unlockfile($f) {
 $f = $f|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 return;
}
function ___overflow($f,$_c) {
 $f = $f|0;
 $_c = $_c|0;
 var $$0 = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $c = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $c = sp;
 $0 = $_c&255;
 HEAP8[$c>>0] = $0;
 $1 = ((($f)) + 16|0);
 $2 = HEAP32[$1>>2]|0;
 $3 = ($2|0)==(0|0);
 if ($3) {
  $4 = (___towrite($f)|0);
  $5 = ($4|0)==(0);
  if ($5) {
   $$pre = HEAP32[$1>>2]|0;
   $9 = $$pre;
   label = 4;
  } else {
   $$0 = -1;
  }
 } else {
  $9 = $2;
  label = 4;
 }
 do {
  if ((label|0) == 4) {
   $6 = ((($f)) + 20|0);
   $7 = HEAP32[$6>>2]|0;
   $8 = ($7>>>0)<($9>>>0);
   if ($8) {
    $10 = $_c & 255;
    $11 = ((($f)) + 75|0);
    $12 = HEAP8[$11>>0]|0;
    $13 = $12 << 24 >> 24;
    $14 = ($10|0)==($13|0);
    if (!($14)) {
     $15 = ((($7)) + 1|0);
     HEAP32[$6>>2] = $15;
     HEAP8[$7>>0] = $0;
     $$0 = $10;
     break;
    }
   }
   $16 = ((($f)) + 36|0);
   $17 = HEAP32[$16>>2]|0;
   $18 = (FUNCTION_TABLE_iiii[$17 & 3]($f,$c,1)|0);
   $19 = ($18|0)==(1);
   if ($19) {
    $20 = HEAP8[$c>>0]|0;
    $21 = $20&255;
    $$0 = $21;
   } else {
    $$0 = -1;
   }
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function ___stdio_close($f) {
 $f = $f|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $vararg_buffer = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 16|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $0 = ((($f)) + 60|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$vararg_buffer>>2] = $1;
 $2 = (___syscall6(6,($vararg_buffer|0))|0);
 $3 = (___syscall_ret($2)|0);
 STACKTOP = sp;return ($3|0);
}
function ___stdio_seek($f,$off,$whence) {
 $f = $f|0;
 $off = $off|0;
 $whence = $whence|0;
 var $$pre = 0, $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $ret = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr3 = 0, $vararg_ptr4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $ret = sp + 20|0;
 $0 = ((($f)) + 60|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$vararg_buffer>>2] = $1;
 $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
 HEAP32[$vararg_ptr1>>2] = 0;
 $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
 HEAP32[$vararg_ptr2>>2] = $off;
 $vararg_ptr3 = ((($vararg_buffer)) + 12|0);
 HEAP32[$vararg_ptr3>>2] = $ret;
 $vararg_ptr4 = ((($vararg_buffer)) + 16|0);
 HEAP32[$vararg_ptr4>>2] = $whence;
 $2 = (___syscall140(140,($vararg_buffer|0))|0);
 $3 = (___syscall_ret($2)|0);
 $4 = ($3|0)<(0);
 if ($4) {
  HEAP32[$ret>>2] = -1;
  $5 = -1;
 } else {
  $$pre = HEAP32[$ret>>2]|0;
  $5 = $$pre;
 }
 STACKTOP = sp;return ($5|0);
}
function ___stdio_write($f,$buf,$len) {
 $f = $f|0;
 $buf = $buf|0;
 $len = $len|0;
 var $$0 = 0, $$phi$trans$insert = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0;
 var $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0;
 var $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $cnt$0 = 0, $cnt$1 = 0, $iov$0 = 0, $iov$0$lcssa11 = 0, $iov$1 = 0, $iovcnt$0 = 0;
 var $iovcnt$0$lcssa12 = 0, $iovcnt$1 = 0, $iovs = 0, $rem$0 = 0, $vararg_buffer = 0, $vararg_buffer3 = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, $vararg_ptr6 = 0, $vararg_ptr7 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 48|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer3 = sp + 16|0;
 $vararg_buffer = sp;
 $iovs = sp + 32|0;
 $0 = ((($f)) + 28|0);
 $1 = HEAP32[$0>>2]|0;
 HEAP32[$iovs>>2] = $1;
 $2 = ((($iovs)) + 4|0);
 $3 = ((($f)) + 20|0);
 $4 = HEAP32[$3>>2]|0;
 $5 = $4;
 $6 = (($5) - ($1))|0;
 HEAP32[$2>>2] = $6;
 $7 = ((($iovs)) + 8|0);
 HEAP32[$7>>2] = $buf;
 $8 = ((($iovs)) + 12|0);
 HEAP32[$8>>2] = $len;
 $9 = (($6) + ($len))|0;
 $10 = ((($f)) + 60|0);
 $11 = ((($f)) + 44|0);
 $iov$0 = $iovs;$iovcnt$0 = 2;$rem$0 = $9;
 while(1) {
  $12 = HEAP32[4992>>2]|0;
  $13 = ($12|0)==(0|0);
  if ($13) {
   $17 = HEAP32[$10>>2]|0;
   HEAP32[$vararg_buffer3>>2] = $17;
   $vararg_ptr6 = ((($vararg_buffer3)) + 4|0);
   HEAP32[$vararg_ptr6>>2] = $iov$0;
   $vararg_ptr7 = ((($vararg_buffer3)) + 8|0);
   HEAP32[$vararg_ptr7>>2] = $iovcnt$0;
   $18 = (___syscall146(146,($vararg_buffer3|0))|0);
   $19 = (___syscall_ret($18)|0);
   $cnt$0 = $19;
  } else {
   _pthread_cleanup_push((27|0),($f|0));
   $14 = HEAP32[$10>>2]|0;
   HEAP32[$vararg_buffer>>2] = $14;
   $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
   HEAP32[$vararg_ptr1>>2] = $iov$0;
   $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
   HEAP32[$vararg_ptr2>>2] = $iovcnt$0;
   $15 = (___syscall146(146,($vararg_buffer|0))|0);
   $16 = (___syscall_ret($15)|0);
   _pthread_cleanup_pop(0);
   $cnt$0 = $16;
  }
  $20 = ($rem$0|0)==($cnt$0|0);
  if ($20) {
   label = 6;
   break;
  }
  $27 = ($cnt$0|0)<(0);
  if ($27) {
   $iov$0$lcssa11 = $iov$0;$iovcnt$0$lcssa12 = $iovcnt$0;
   label = 8;
   break;
  }
  $35 = (($rem$0) - ($cnt$0))|0;
  $36 = ((($iov$0)) + 4|0);
  $37 = HEAP32[$36>>2]|0;
  $38 = ($cnt$0>>>0)>($37>>>0);
  if ($38) {
   $39 = HEAP32[$11>>2]|0;
   HEAP32[$0>>2] = $39;
   HEAP32[$3>>2] = $39;
   $40 = (($cnt$0) - ($37))|0;
   $41 = ((($iov$0)) + 8|0);
   $42 = (($iovcnt$0) + -1)|0;
   $$phi$trans$insert = ((($iov$0)) + 12|0);
   $$pre = HEAP32[$$phi$trans$insert>>2]|0;
   $50 = $$pre;$cnt$1 = $40;$iov$1 = $41;$iovcnt$1 = $42;
  } else {
   $43 = ($iovcnt$0|0)==(2);
   if ($43) {
    $44 = HEAP32[$0>>2]|0;
    $45 = (($44) + ($cnt$0)|0);
    HEAP32[$0>>2] = $45;
    $50 = $37;$cnt$1 = $cnt$0;$iov$1 = $iov$0;$iovcnt$1 = 2;
   } else {
    $50 = $37;$cnt$1 = $cnt$0;$iov$1 = $iov$0;$iovcnt$1 = $iovcnt$0;
   }
  }
  $46 = HEAP32[$iov$1>>2]|0;
  $47 = (($46) + ($cnt$1)|0);
  HEAP32[$iov$1>>2] = $47;
  $48 = ((($iov$1)) + 4|0);
  $49 = (($50) - ($cnt$1))|0;
  HEAP32[$48>>2] = $49;
  $iov$0 = $iov$1;$iovcnt$0 = $iovcnt$1;$rem$0 = $35;
 }
 if ((label|0) == 6) {
  $21 = HEAP32[$11>>2]|0;
  $22 = ((($f)) + 48|0);
  $23 = HEAP32[$22>>2]|0;
  $24 = (($21) + ($23)|0);
  $25 = ((($f)) + 16|0);
  HEAP32[$25>>2] = $24;
  $26 = $21;
  HEAP32[$0>>2] = $26;
  HEAP32[$3>>2] = $26;
  $$0 = $len;
 }
 else if ((label|0) == 8) {
  $28 = ((($f)) + 16|0);
  HEAP32[$28>>2] = 0;
  HEAP32[$0>>2] = 0;
  HEAP32[$3>>2] = 0;
  $29 = HEAP32[$f>>2]|0;
  $30 = $29 | 32;
  HEAP32[$f>>2] = $30;
  $31 = ($iovcnt$0$lcssa12|0)==(2);
  if ($31) {
   $$0 = 0;
  } else {
   $32 = ((($iov$0$lcssa11)) + 4|0);
   $33 = HEAP32[$32>>2]|0;
   $34 = (($len) - ($33))|0;
   $$0 = $34;
  }
 }
 STACKTOP = sp;return ($$0|0);
}
function ___stdout_write($f,$buf,$len) {
 $f = $f|0;
 $buf = $buf|0;
 $len = $len|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $tio = 0, $vararg_buffer = 0, $vararg_ptr1 = 0, $vararg_ptr2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 80|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $vararg_buffer = sp;
 $tio = sp + 12|0;
 $0 = ((($f)) + 36|0);
 HEAP32[$0>>2] = 3;
 $1 = HEAP32[$f>>2]|0;
 $2 = $1 & 64;
 $3 = ($2|0)==(0);
 if ($3) {
  $4 = ((($f)) + 60|0);
  $5 = HEAP32[$4>>2]|0;
  HEAP32[$vararg_buffer>>2] = $5;
  $vararg_ptr1 = ((($vararg_buffer)) + 4|0);
  HEAP32[$vararg_ptr1>>2] = 21505;
  $vararg_ptr2 = ((($vararg_buffer)) + 8|0);
  HEAP32[$vararg_ptr2>>2] = $tio;
  $6 = (___syscall54(54,($vararg_buffer|0))|0);
  $7 = ($6|0)==(0);
  if (!($7)) {
   $8 = ((($f)) + 75|0);
   HEAP8[$8>>0] = -1;
  }
 }
 $9 = (___stdio_write($f,$buf,$len)|0);
 STACKTOP = sp;return ($9|0);
}
function ___towrite($f) {
 $f = $f|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 74|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $1 << 24 >> 24;
 $3 = (($2) + 255)|0;
 $4 = $3 | $2;
 $5 = $4&255;
 HEAP8[$0>>0] = $5;
 $6 = HEAP32[$f>>2]|0;
 $7 = $6 & 8;
 $8 = ($7|0)==(0);
 if ($8) {
  $10 = ((($f)) + 8|0);
  HEAP32[$10>>2] = 0;
  $11 = ((($f)) + 4|0);
  HEAP32[$11>>2] = 0;
  $12 = ((($f)) + 44|0);
  $13 = HEAP32[$12>>2]|0;
  $14 = ((($f)) + 28|0);
  HEAP32[$14>>2] = $13;
  $15 = ((($f)) + 20|0);
  HEAP32[$15>>2] = $13;
  $16 = $13;
  $17 = ((($f)) + 48|0);
  $18 = HEAP32[$17>>2]|0;
  $19 = (($16) + ($18)|0);
  $20 = ((($f)) + 16|0);
  HEAP32[$20>>2] = $19;
  $$0 = 0;
 } else {
  $9 = $6 | 32;
  HEAP32[$f>>2] = $9;
  $$0 = -1;
 }
 return ($$0|0);
}
function _memchr($src,$c,$n) {
 $src = $src|0;
 $c = $c|0;
 $n = $n|0;
 var $$0$lcssa = 0, $$0$lcssa44 = 0, $$019 = 0, $$1$lcssa = 0, $$110 = 0, $$110$lcssa = 0, $$24 = 0, $$3 = 0, $$lcssa = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0;
 var $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0;
 var $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond18 = 0, $s$0$lcssa = 0, $s$0$lcssa43 = 0, $s$020 = 0, $s$15 = 0, $s$2 = 0, $w$0$lcssa = 0, $w$011 = 0, $w$011$lcssa = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $c & 255;
 $1 = $src;
 $2 = $1 & 3;
 $3 = ($2|0)!=(0);
 $4 = ($n|0)!=(0);
 $or$cond18 = $4 & $3;
 L1: do {
  if ($or$cond18) {
   $5 = $c&255;
   $$019 = $n;$s$020 = $src;
   while(1) {
    $6 = HEAP8[$s$020>>0]|0;
    $7 = ($6<<24>>24)==($5<<24>>24);
    if ($7) {
     $$0$lcssa44 = $$019;$s$0$lcssa43 = $s$020;
     label = 6;
     break L1;
    }
    $8 = ((($s$020)) + 1|0);
    $9 = (($$019) + -1)|0;
    $10 = $8;
    $11 = $10 & 3;
    $12 = ($11|0)!=(0);
    $13 = ($9|0)!=(0);
    $or$cond = $13 & $12;
    if ($or$cond) {
     $$019 = $9;$s$020 = $8;
    } else {
     $$0$lcssa = $9;$$lcssa = $13;$s$0$lcssa = $8;
     label = 5;
     break;
    }
   }
  } else {
   $$0$lcssa = $n;$$lcssa = $4;$s$0$lcssa = $src;
   label = 5;
  }
 } while(0);
 if ((label|0) == 5) {
  if ($$lcssa) {
   $$0$lcssa44 = $$0$lcssa;$s$0$lcssa43 = $s$0$lcssa;
   label = 6;
  } else {
   $$3 = 0;$s$2 = $s$0$lcssa;
  }
 }
 L8: do {
  if ((label|0) == 6) {
   $14 = HEAP8[$s$0$lcssa43>>0]|0;
   $15 = $c&255;
   $16 = ($14<<24>>24)==($15<<24>>24);
   if ($16) {
    $$3 = $$0$lcssa44;$s$2 = $s$0$lcssa43;
   } else {
    $17 = Math_imul($0, 16843009)|0;
    $18 = ($$0$lcssa44>>>0)>(3);
    L11: do {
     if ($18) {
      $$110 = $$0$lcssa44;$w$011 = $s$0$lcssa43;
      while(1) {
       $19 = HEAP32[$w$011>>2]|0;
       $20 = $19 ^ $17;
       $21 = (($20) + -16843009)|0;
       $22 = $20 & -2139062144;
       $23 = $22 ^ -2139062144;
       $24 = $23 & $21;
       $25 = ($24|0)==(0);
       if (!($25)) {
        $$110$lcssa = $$110;$w$011$lcssa = $w$011;
        break;
       }
       $26 = ((($w$011)) + 4|0);
       $27 = (($$110) + -4)|0;
       $28 = ($27>>>0)>(3);
       if ($28) {
        $$110 = $27;$w$011 = $26;
       } else {
        $$1$lcssa = $27;$w$0$lcssa = $26;
        label = 11;
        break L11;
       }
      }
      $$24 = $$110$lcssa;$s$15 = $w$011$lcssa;
     } else {
      $$1$lcssa = $$0$lcssa44;$w$0$lcssa = $s$0$lcssa43;
      label = 11;
     }
    } while(0);
    if ((label|0) == 11) {
     $29 = ($$1$lcssa|0)==(0);
     if ($29) {
      $$3 = 0;$s$2 = $w$0$lcssa;
      break;
     } else {
      $$24 = $$1$lcssa;$s$15 = $w$0$lcssa;
     }
    }
    while(1) {
     $30 = HEAP8[$s$15>>0]|0;
     $31 = ($30<<24>>24)==($15<<24>>24);
     if ($31) {
      $$3 = $$24;$s$2 = $s$15;
      break L8;
     }
     $32 = ((($s$15)) + 1|0);
     $33 = (($$24) + -1)|0;
     $34 = ($33|0)==(0);
     if ($34) {
      $$3 = 0;$s$2 = $32;
      break;
     } else {
      $$24 = $33;$s$15 = $32;
     }
    }
   }
  }
 } while(0);
 $35 = ($$3|0)!=(0);
 $36 = $35 ? $s$2 : 0;
 return ($36|0);
}
function _memcmp($vl,$vr,$n) {
 $vl = $vl|0;
 $vr = $vr|0;
 $n = $n|0;
 var $$03 = 0, $$lcssa = 0, $$lcssa19 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $l$04 = 0, $r$05 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($n|0)==(0);
 L1: do {
  if ($0) {
   $11 = 0;
  } else {
   $$03 = $n;$l$04 = $vl;$r$05 = $vr;
   while(1) {
    $1 = HEAP8[$l$04>>0]|0;
    $2 = HEAP8[$r$05>>0]|0;
    $3 = ($1<<24>>24)==($2<<24>>24);
    if (!($3)) {
     $$lcssa = $1;$$lcssa19 = $2;
     break;
    }
    $4 = (($$03) + -1)|0;
    $5 = ((($l$04)) + 1|0);
    $6 = ((($r$05)) + 1|0);
    $7 = ($4|0)==(0);
    if ($7) {
     $11 = 0;
     break L1;
    } else {
     $$03 = $4;$l$04 = $5;$r$05 = $6;
    }
   }
   $8 = $$lcssa&255;
   $9 = $$lcssa19&255;
   $10 = (($8) - ($9))|0;
   $11 = $10;
  }
 } while(0);
 return ($11|0);
}
function ___stpcpy($d,$s) {
 $d = $d|0;
 $s = $s|0;
 var $$0$lcssa = 0, $$01$lcssa = 0, $$0115 = 0, $$016 = 0, $$03 = 0, $$1$ph = 0, $$12$ph = 0, $$128 = 0, $$19 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0;
 var $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $4 = 0, $5 = 0;
 var $6 = 0, $7 = 0, $8 = 0, $9 = 0, $wd$0$lcssa = 0, $wd$010 = 0, $ws$0$lcssa = 0, $ws$011 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $s;
 $1 = $d;
 $2 = $0 ^ $1;
 $3 = $2 & 3;
 $4 = ($3|0)==(0);
 L1: do {
  if ($4) {
   $5 = $0 & 3;
   $6 = ($5|0)==(0);
   if ($6) {
    $$0$lcssa = $s;$$01$lcssa = $d;
   } else {
    $$0115 = $d;$$016 = $s;
    while(1) {
     $7 = HEAP8[$$016>>0]|0;
     HEAP8[$$0115>>0] = $7;
     $8 = ($7<<24>>24)==(0);
     if ($8) {
      $$03 = $$0115;
      break L1;
     }
     $9 = ((($$016)) + 1|0);
     $10 = ((($$0115)) + 1|0);
     $11 = $9;
     $12 = $11 & 3;
     $13 = ($12|0)==(0);
     if ($13) {
      $$0$lcssa = $9;$$01$lcssa = $10;
      break;
     } else {
      $$0115 = $10;$$016 = $9;
     }
    }
   }
   $14 = HEAP32[$$0$lcssa>>2]|0;
   $15 = (($14) + -16843009)|0;
   $16 = $14 & -2139062144;
   $17 = $16 ^ -2139062144;
   $18 = $17 & $15;
   $19 = ($18|0)==(0);
   if ($19) {
    $22 = $14;$wd$010 = $$01$lcssa;$ws$011 = $$0$lcssa;
    while(1) {
     $20 = ((($ws$011)) + 4|0);
     $21 = ((($wd$010)) + 4|0);
     HEAP32[$wd$010>>2] = $22;
     $23 = HEAP32[$20>>2]|0;
     $24 = (($23) + -16843009)|0;
     $25 = $23 & -2139062144;
     $26 = $25 ^ -2139062144;
     $27 = $26 & $24;
     $28 = ($27|0)==(0);
     if ($28) {
      $22 = $23;$wd$010 = $21;$ws$011 = $20;
     } else {
      $wd$0$lcssa = $21;$ws$0$lcssa = $20;
      break;
     }
    }
   } else {
    $wd$0$lcssa = $$01$lcssa;$ws$0$lcssa = $$0$lcssa;
   }
   $$1$ph = $ws$0$lcssa;$$12$ph = $wd$0$lcssa;
   label = 8;
  } else {
   $$1$ph = $s;$$12$ph = $d;
   label = 8;
  }
 } while(0);
 if ((label|0) == 8) {
  $29 = HEAP8[$$1$ph>>0]|0;
  HEAP8[$$12$ph>>0] = $29;
  $30 = ($29<<24>>24)==(0);
  if ($30) {
   $$03 = $$12$ph;
  } else {
   $$128 = $$12$ph;$$19 = $$1$ph;
   while(1) {
    $31 = ((($$19)) + 1|0);
    $32 = ((($$128)) + 1|0);
    $33 = HEAP8[$31>>0]|0;
    HEAP8[$32>>0] = $33;
    $34 = ($33<<24>>24)==(0);
    if ($34) {
     $$03 = $32;
     break;
    } else {
     $$128 = $32;$$19 = $31;
    }
   }
  }
 }
 return ($$03|0);
}
function _strchr($s,$c) {
 $s = $s|0;
 $c = $c|0;
 var $0 = 0, $1 = 0, $2 = 0, $3 = 0, $4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = (___strchrnul($s,$c)|0);
 $1 = HEAP8[$0>>0]|0;
 $2 = $c&255;
 $3 = ($1<<24>>24)==($2<<24>>24);
 $4 = $3 ? $0 : 0;
 return ($4|0);
}
function ___strchrnul($s,$c) {
 $s = $s|0;
 $c = $c|0;
 var $$0 = 0, $$02$lcssa = 0, $$0211 = 0, $$1 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond5 = 0, $w$0$lcssa = 0, $w$08 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $c & 255;
 $1 = ($0|0)==(0);
 L1: do {
  if ($1) {
   $6 = (_strlen($s)|0);
   $7 = (($s) + ($6)|0);
   $$0 = $7;
  } else {
   $2 = $s;
   $3 = $2 & 3;
   $4 = ($3|0)==(0);
   if ($4) {
    $$02$lcssa = $s;
   } else {
    $5 = $c&255;
    $$0211 = $s;
    while(1) {
     $8 = HEAP8[$$0211>>0]|0;
     $9 = ($8<<24>>24)==(0);
     $10 = ($8<<24>>24)==($5<<24>>24);
     $or$cond = $9 | $10;
     if ($or$cond) {
      $$0 = $$0211;
      break L1;
     }
     $11 = ((($$0211)) + 1|0);
     $12 = $11;
     $13 = $12 & 3;
     $14 = ($13|0)==(0);
     if ($14) {
      $$02$lcssa = $11;
      break;
     } else {
      $$0211 = $11;
     }
    }
   }
   $15 = Math_imul($0, 16843009)|0;
   $16 = HEAP32[$$02$lcssa>>2]|0;
   $17 = (($16) + -16843009)|0;
   $18 = $16 & -2139062144;
   $19 = $18 ^ -2139062144;
   $20 = $19 & $17;
   $21 = ($20|0)==(0);
   L10: do {
    if ($21) {
     $23 = $16;$w$08 = $$02$lcssa;
     while(1) {
      $22 = $23 ^ $15;
      $24 = (($22) + -16843009)|0;
      $25 = $22 & -2139062144;
      $26 = $25 ^ -2139062144;
      $27 = $26 & $24;
      $28 = ($27|0)==(0);
      if (!($28)) {
       $w$0$lcssa = $w$08;
       break L10;
      }
      $29 = ((($w$08)) + 4|0);
      $30 = HEAP32[$29>>2]|0;
      $31 = (($30) + -16843009)|0;
      $32 = $30 & -2139062144;
      $33 = $32 ^ -2139062144;
      $34 = $33 & $31;
      $35 = ($34|0)==(0);
      if ($35) {
       $23 = $30;$w$08 = $29;
      } else {
       $w$0$lcssa = $29;
       break;
      }
     }
    } else {
     $w$0$lcssa = $$02$lcssa;
    }
   } while(0);
   $36 = $c&255;
   $$1 = $w$0$lcssa;
   while(1) {
    $37 = HEAP8[$$1>>0]|0;
    $38 = ($37<<24>>24)==(0);
    $39 = ($37<<24>>24)==($36<<24>>24);
    $or$cond5 = $38 | $39;
    $40 = ((($$1)) + 1|0);
    if ($or$cond5) {
     $$0 = $$1;
     break;
    } else {
     $$1 = $40;
    }
   }
  }
 } while(0);
 return ($$0|0);
}
function _strcmp($l,$r) {
 $l = $l|0;
 $r = $r|0;
 var $$014 = 0, $$05 = 0, $$lcssa = 0, $$lcssa2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $or$cond = 0, $or$cond3 = 0, label = 0;
 var sp = 0;
 sp = STACKTOP;
 $0 = HEAP8[$l>>0]|0;
 $1 = HEAP8[$r>>0]|0;
 $2 = ($0<<24>>24)!=($1<<24>>24);
 $3 = ($0<<24>>24)==(0);
 $or$cond3 = $3 | $2;
 if ($or$cond3) {
  $$lcssa = $0;$$lcssa2 = $1;
 } else {
  $$014 = $l;$$05 = $r;
  while(1) {
   $4 = ((($$014)) + 1|0);
   $5 = ((($$05)) + 1|0);
   $6 = HEAP8[$4>>0]|0;
   $7 = HEAP8[$5>>0]|0;
   $8 = ($6<<24>>24)!=($7<<24>>24);
   $9 = ($6<<24>>24)==(0);
   $or$cond = $9 | $8;
   if ($or$cond) {
    $$lcssa = $6;$$lcssa2 = $7;
    break;
   } else {
    $$014 = $4;$$05 = $5;
   }
  }
 }
 $10 = $$lcssa&255;
 $11 = $$lcssa2&255;
 $12 = (($10) - ($11))|0;
 return ($12|0);
}
function _strcpy($dest,$src) {
 $dest = $dest|0;
 $src = $src|0;
 var label = 0, sp = 0;
 sp = STACKTOP;
 (___stpcpy($dest,$src)|0);
 return ($dest|0);
}
function _strcspn($s,$c) {
 $s = $s|0;
 $c = $c|0;
 var $$0 = 0, $$027 = 0, $$03$lcssa = 0, $$035 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $byteset = 0, $div = 0, $div4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $byteset = sp;
 $0 = HEAP8[$c>>0]|0;
 $1 = ($0<<24>>24)==(0);
 if ($1) {
  label = 3;
 } else {
  $2 = ((($c)) + 1|0);
  $3 = HEAP8[$2>>0]|0;
  $4 = ($3<<24>>24)==(0);
  if ($4) {
   label = 3;
  } else {
   ;HEAP32[$byteset>>2]=0|0;HEAP32[$byteset+4>>2]=0|0;HEAP32[$byteset+8>>2]=0|0;HEAP32[$byteset+12>>2]=0|0;HEAP32[$byteset+16>>2]=0|0;HEAP32[$byteset+20>>2]=0|0;HEAP32[$byteset+24>>2]=0|0;HEAP32[$byteset+28>>2]=0|0;
   $$027 = $c;$13 = $0;
   while(1) {
    $12 = $13 & 31;
    $14 = $12&255;
    $15 = 1 << $14;
    $div4 = ($13&255) >>> 5;
    $16 = $div4&255;
    $17 = (($byteset) + ($16<<2)|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = $18 | $15;
    HEAP32[$17>>2] = $19;
    $20 = ((($$027)) + 1|0);
    $21 = HEAP8[$20>>0]|0;
    $22 = ($21<<24>>24)==(0);
    if ($22) {
     break;
    } else {
     $$027 = $20;$13 = $21;
    }
   }
   $10 = HEAP8[$s>>0]|0;
   $11 = ($10<<24>>24)==(0);
   L7: do {
    if ($11) {
     $$03$lcssa = $s;
    } else {
     $$035 = $s;$23 = $10;
     while(1) {
      $div = ($23&255) >>> 5;
      $24 = $div&255;
      $25 = (($byteset) + ($24<<2)|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = $23 & 31;
      $28 = $27&255;
      $29 = 1 << $28;
      $30 = $26 & $29;
      $31 = ($30|0)==(0);
      if (!($31)) {
       $$03$lcssa = $$035;
       break L7;
      }
      $32 = ((($$035)) + 1|0);
      $33 = HEAP8[$32>>0]|0;
      $34 = ($33<<24>>24)==(0);
      if ($34) {
       $$03$lcssa = $32;
       break;
      } else {
       $$035 = $32;$23 = $33;
      }
     }
    }
   } while(0);
   $35 = $$03$lcssa;
   $36 = $s;
   $37 = (($35) - ($36))|0;
   $$0 = $37;
  }
 }
 if ((label|0) == 3) {
  $5 = $0 << 24 >> 24;
  $6 = (___strchrnul($s,$5)|0);
  $7 = $6;
  $8 = $s;
  $9 = (($7) - ($8))|0;
  $$0 = $9;
 }
 STACKTOP = sp;return ($$0|0);
}
function _strlen($s) {
 $s = $s|0;
 var $$0 = 0, $$01$lcssa = 0, $$014 = 0, $$1$lcssa = 0, $$lcssa20 = 0, $$pn = 0, $$pn15 = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0;
 var $2 = 0, $20 = 0, $21 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $w$0 = 0, $w$0$lcssa = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = $s;
 $1 = $0 & 3;
 $2 = ($1|0)==(0);
 L1: do {
  if ($2) {
   $$01$lcssa = $s;
   label = 4;
  } else {
   $$014 = $s;$21 = $0;
   while(1) {
    $3 = HEAP8[$$014>>0]|0;
    $4 = ($3<<24>>24)==(0);
    if ($4) {
     $$pn = $21;
     break L1;
    }
    $5 = ((($$014)) + 1|0);
    $6 = $5;
    $7 = $6 & 3;
    $8 = ($7|0)==(0);
    if ($8) {
     $$01$lcssa = $5;
     label = 4;
     break;
    } else {
     $$014 = $5;$21 = $6;
    }
   }
  }
 } while(0);
 if ((label|0) == 4) {
  $w$0 = $$01$lcssa;
  while(1) {
   $9 = HEAP32[$w$0>>2]|0;
   $10 = (($9) + -16843009)|0;
   $11 = $9 & -2139062144;
   $12 = $11 ^ -2139062144;
   $13 = $12 & $10;
   $14 = ($13|0)==(0);
   $15 = ((($w$0)) + 4|0);
   if ($14) {
    $w$0 = $15;
   } else {
    $$lcssa20 = $9;$w$0$lcssa = $w$0;
    break;
   }
  }
  $16 = $$lcssa20&255;
  $17 = ($16<<24>>24)==(0);
  if ($17) {
   $$1$lcssa = $w$0$lcssa;
  } else {
   $$pn15 = $w$0$lcssa;
   while(1) {
    $18 = ((($$pn15)) + 1|0);
    $$pre = HEAP8[$18>>0]|0;
    $19 = ($$pre<<24>>24)==(0);
    if ($19) {
     $$1$lcssa = $18;
     break;
    } else {
     $$pn15 = $18;
    }
   }
  }
  $20 = $$1$lcssa;
  $$pn = $20;
 }
 $$0 = (($$pn) - ($0))|0;
 return ($$0|0);
}
function _strspn($s,$c) {
 $s = $s|0;
 $c = $c|0;
 var $$0 = 0, $$028 = 0, $$03 = 0, $$03$lcssa = 0, $$1$lcssa = 0, $$16 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0;
 var $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $4 = 0;
 var $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $byteset = 0, $div = 0, $div4 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 32|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $byteset = sp;
 ;HEAP32[$byteset>>2]=0|0;HEAP32[$byteset+4>>2]=0|0;HEAP32[$byteset+8>>2]=0|0;HEAP32[$byteset+12>>2]=0|0;HEAP32[$byteset+16>>2]=0|0;HEAP32[$byteset+20>>2]=0|0;HEAP32[$byteset+24>>2]=0|0;HEAP32[$byteset+28>>2]=0|0;
 $0 = HEAP8[$c>>0]|0;
 $1 = ($0<<24>>24)==(0);
 do {
  if ($1) {
   $$0 = 0;
  } else {
   $2 = ((($c)) + 1|0);
   $3 = HEAP8[$2>>0]|0;
   $4 = ($3<<24>>24)==(0);
   if ($4) {
    $$03 = $s;
    while(1) {
     $5 = HEAP8[$$03>>0]|0;
     $6 = ($5<<24>>24)==($0<<24>>24);
     $7 = ((($$03)) + 1|0);
     if ($6) {
      $$03 = $7;
     } else {
      $$03$lcssa = $$03;
      break;
     }
    }
    $8 = $$03$lcssa;
    $9 = $s;
    $10 = (($8) - ($9))|0;
    $$0 = $10;
    break;
   } else {
    $$028 = $c;$14 = $0;
   }
   while(1) {
    $13 = $14 & 31;
    $15 = $13&255;
    $16 = 1 << $15;
    $div4 = ($14&255) >>> 5;
    $17 = $div4&255;
    $18 = (($byteset) + ($17<<2)|0);
    $19 = HEAP32[$18>>2]|0;
    $20 = $19 | $16;
    HEAP32[$18>>2] = $20;
    $21 = ((($$028)) + 1|0);
    $22 = HEAP8[$21>>0]|0;
    $23 = ($22<<24>>24)==(0);
    if ($23) {
     break;
    } else {
     $$028 = $21;$14 = $22;
    }
   }
   $11 = HEAP8[$s>>0]|0;
   $12 = ($11<<24>>24)==(0);
   L10: do {
    if ($12) {
     $$1$lcssa = $s;
    } else {
     $$16 = $s;$24 = $11;
     while(1) {
      $div = ($24&255) >>> 5;
      $25 = $div&255;
      $26 = (($byteset) + ($25<<2)|0);
      $27 = HEAP32[$26>>2]|0;
      $28 = $24 & 31;
      $29 = $28&255;
      $30 = 1 << $29;
      $31 = $27 & $30;
      $32 = ($31|0)==(0);
      if ($32) {
       $$1$lcssa = $$16;
       break L10;
      }
      $33 = ((($$16)) + 1|0);
      $34 = HEAP8[$33>>0]|0;
      $35 = ($34<<24>>24)==(0);
      if ($35) {
       $$1$lcssa = $33;
       break;
      } else {
       $$16 = $33;$24 = $34;
      }
     }
    }
   } while(0);
   $36 = $$1$lcssa;
   $37 = $s;
   $38 = (($36) - ($37))|0;
   $$0 = $38;
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function _strstr($h,$n) {
 $h = $h|0;
 $n = $n|0;
 var $$0 = 0, $$0$i = 0, $$0$lcssa$i = 0, $$0$lcssa$i11 = 0, $$01$i = 0, $$02$i = 0, $$02$i7 = 0, $$03$i = 0, $$lcssa$i = 0, $$lcssa$i10 = 0, $$lcssa$i4 = 0, $$lcssa281 = 0, $$lcssa284 = 0, $$lcssa287 = 0, $$lcssa301 = 0, $$lcssa304 = 0, $$lcssa307 = 0, $$lcssa322 = 0, $$pr$i = 0, $0 = 0;
 var $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0;
 var $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0;
 var $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0;
 var $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0;
 var $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0;
 var $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0;
 var $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0;
 var $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $233$phi = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $25 = 0, $26 = 0;
 var $27 = 0, $28 = 0, $29 = 0, $3 = 0, $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0;
 var $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0;
 var $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0;
 var $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0;
 var $byteset$i = 0, $div$i = 0, $div4$i = 0, $hw$0$in2$i = 0, $hw$03$i = 0, $hw$03$i6 = 0, $ip$0$ph$lcssa$i = 0, $ip$0$ph$lcssa143$i = 0, $ip$0$ph76$i = 0, $ip$1$ip$0$$i = 0, $ip$1$ip$0$i = 0, $ip$1$ph$lcssa$i = 0, $ip$1$ph55$i = 0, $jp$0$ph13$ph70$i = 0, $jp$0$ph1365$i = 0, $jp$0$ph1365$i$lcssa = 0, $jp$0$ph1365$i$lcssa$lcssa = 0, $jp$0$ph77$i = 0, $jp$1$ph56$i = 0, $jp$1$ph9$ph49$i = 0;
 var $jp$1$ph944$i = 0, $jp$1$ph944$i$lcssa = 0, $jp$1$ph944$i$lcssa$lcssa = 0, $k$059$i = 0, $k$139$i = 0, $k$2$i = 0, $k$338$i = 0, $k$338$i$lcssa = 0, $k$4$i = 0, $l$080$i = 0, $l$080$i$lcssa321 = 0, $mem$0$i = 0, $mem0$0$i = 0, $or$cond$i = 0, $or$cond$i2 = 0, $or$cond$i8 = 0, $or$cond5$i = 0, $p$0$ph$ph$lcssa32$i = 0, $p$0$ph$ph$lcssa32147$i = 0, $p$0$ph$ph71$i = 0;
 var $p$1$p$0$i = 0, $p$1$ph$ph$lcssa23$i = 0, $p$1$ph$ph50$i = 0, $p$3$i = 0, $shift$i = 0, $z$0$i = 0, $z$1$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 1056|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $byteset$i = sp + 1024|0;
 $shift$i = sp;
 $0 = HEAP8[$n>>0]|0;
 $1 = ($0<<24>>24)==(0);
 do {
  if ($1) {
   $$0 = $h;
  } else {
   $2 = $0 << 24 >> 24;
   $3 = (_strchr($h,$2)|0);
   $4 = ($3|0)==(0|0);
   if ($4) {
    $$0 = 0;
   } else {
    $5 = ((($n)) + 1|0);
    $6 = HEAP8[$5>>0]|0;
    $7 = ($6<<24>>24)==(0);
    if ($7) {
     $$0 = $3;
    } else {
     $8 = ((($3)) + 1|0);
     $9 = HEAP8[$8>>0]|0;
     $10 = ($9<<24>>24)==(0);
     if ($10) {
      $$0 = 0;
     } else {
      $11 = ((($n)) + 2|0);
      $12 = HEAP8[$11>>0]|0;
      $13 = ($12<<24>>24)==(0);
      if ($13) {
       $14 = $0&255;
       $15 = $14 << 8;
       $16 = $6&255;
       $17 = $16 | $15;
       $18 = HEAP8[$3>>0]|0;
       $19 = $18&255;
       $20 = $19 << 8;
       $21 = $9&255;
       $22 = $20 | $21;
       $$01$i = $8;$232 = $9;$233 = $3;$hw$0$in2$i = $22;
       while(1) {
        $23 = $hw$0$in2$i & 65535;
        $24 = ($23|0)==($17|0);
        if ($24) {
         $$lcssa$i = $233;$31 = $232;
         break;
        }
        $25 = $23 << 8;
        $26 = ((($$01$i)) + 1|0);
        $27 = HEAP8[$26>>0]|0;
        $28 = $27&255;
        $29 = $28 | $25;
        $30 = ($27<<24>>24)==(0);
        if ($30) {
         $$lcssa$i = $$01$i;$31 = 0;
         break;
        } else {
         $233$phi = $$01$i;$$01$i = $26;$232 = $27;$hw$0$in2$i = $29;$233 = $233$phi;
        }
       }
       $32 = ($31<<24>>24)!=(0);
       $33 = $32 ? $$lcssa$i : 0;
       $$0 = $33;
       break;
      }
      $34 = ((($3)) + 2|0);
      $35 = HEAP8[$34>>0]|0;
      $36 = ($35<<24>>24)==(0);
      if ($36) {
       $$0 = 0;
      } else {
       $37 = ((($n)) + 3|0);
       $38 = HEAP8[$37>>0]|0;
       $39 = ($38<<24>>24)==(0);
       if ($39) {
        $40 = $0&255;
        $41 = $40 << 24;
        $42 = $6&255;
        $43 = $42 << 16;
        $44 = $43 | $41;
        $45 = $12&255;
        $46 = $45 << 8;
        $47 = $44 | $46;
        $48 = HEAP8[$3>>0]|0;
        $49 = $48&255;
        $50 = $49 << 24;
        $51 = $9&255;
        $52 = $51 << 16;
        $53 = $35&255;
        $54 = $53 << 8;
        $55 = $54 | $52;
        $56 = $55 | $50;
        $57 = ($56|0)==($47|0);
        if ($57) {
         $$0$lcssa$i = $34;$$lcssa$i4 = $35;
        } else {
         $$02$i = $34;$hw$03$i = $56;
         while(1) {
          $58 = ((($$02$i)) + 1|0);
          $59 = HEAP8[$58>>0]|0;
          $60 = $59&255;
          $61 = $60 | $hw$03$i;
          $62 = $61 << 8;
          $63 = ($59<<24>>24)==(0);
          $64 = ($62|0)==($47|0);
          $or$cond$i2 = $63 | $64;
          if ($or$cond$i2) {
           $$0$lcssa$i = $58;$$lcssa$i4 = $59;
           break;
          } else {
           $$02$i = $58;$hw$03$i = $62;
          }
         }
        }
        $65 = ($$lcssa$i4<<24>>24)!=(0);
        $66 = ((($$0$lcssa$i)) + -2|0);
        $67 = $65 ? $66 : 0;
        $$0 = $67;
        break;
       }
       $68 = ((($3)) + 3|0);
       $69 = HEAP8[$68>>0]|0;
       $70 = ($69<<24>>24)==(0);
       if ($70) {
        $$0 = 0;
       } else {
        $71 = ((($n)) + 4|0);
        $72 = HEAP8[$71>>0]|0;
        $73 = ($72<<24>>24)==(0);
        if ($73) {
         $74 = $0&255;
         $75 = $74 << 24;
         $76 = $6&255;
         $77 = $76 << 16;
         $78 = $77 | $75;
         $79 = $12&255;
         $80 = $79 << 8;
         $81 = $78 | $80;
         $82 = $38&255;
         $83 = $81 | $82;
         $84 = HEAP8[$3>>0]|0;
         $85 = $84&255;
         $86 = $85 << 24;
         $87 = $9&255;
         $88 = $87 << 16;
         $89 = $35&255;
         $90 = $89 << 8;
         $91 = $69&255;
         $92 = $90 | $88;
         $93 = $92 | $91;
         $94 = $93 | $86;
         $95 = ($94|0)==($83|0);
         if ($95) {
          $$0$lcssa$i11 = $68;$$lcssa$i10 = $69;
         } else {
          $$02$i7 = $68;$hw$03$i6 = $94;
          while(1) {
           $96 = $hw$03$i6 << 8;
           $97 = ((($$02$i7)) + 1|0);
           $98 = HEAP8[$97>>0]|0;
           $99 = $98&255;
           $100 = $99 | $96;
           $101 = ($98<<24>>24)==(0);
           $102 = ($100|0)==($83|0);
           $or$cond$i8 = $101 | $102;
           if ($or$cond$i8) {
            $$0$lcssa$i11 = $97;$$lcssa$i10 = $98;
            break;
           } else {
            $$02$i7 = $97;$hw$03$i6 = $100;
           }
          }
         }
         $103 = ($$lcssa$i10<<24>>24)!=(0);
         $104 = ((($$0$lcssa$i11)) + -3|0);
         $105 = $103 ? $104 : 0;
         $$0 = $105;
         break;
        }
        ;HEAP32[$byteset$i>>2]=0|0;HEAP32[$byteset$i+4>>2]=0|0;HEAP32[$byteset$i+8>>2]=0|0;HEAP32[$byteset$i+12>>2]=0|0;HEAP32[$byteset$i+16>>2]=0|0;HEAP32[$byteset$i+20>>2]=0|0;HEAP32[$byteset$i+24>>2]=0|0;HEAP32[$byteset$i+28>>2]=0|0;
        $110 = $0;$l$080$i = 0;
        while(1) {
         $106 = (($3) + ($l$080$i)|0);
         $107 = HEAP8[$106>>0]|0;
         $108 = ($107<<24>>24)==(0);
         if ($108) {
          $$0$i = 0;
          break;
         }
         $109 = $110 & 31;
         $111 = $109&255;
         $112 = 1 << $111;
         $div4$i = ($110&255) >>> 5;
         $113 = $div4$i&255;
         $114 = (($byteset$i) + ($113<<2)|0);
         $115 = HEAP32[$114>>2]|0;
         $116 = $115 | $112;
         HEAP32[$114>>2] = $116;
         $117 = (($l$080$i) + 1)|0;
         $118 = $110&255;
         $119 = (($shift$i) + ($118<<2)|0);
         HEAP32[$119>>2] = $117;
         $120 = (($n) + ($117)|0);
         $121 = HEAP8[$120>>0]|0;
         $122 = ($121<<24>>24)==(0);
         if ($122) {
          $$lcssa322 = $117;$l$080$i$lcssa321 = $l$080$i;
          label = 23;
          break;
         } else {
          $110 = $121;$l$080$i = $117;
         }
        }
        L32: do {
         if ((label|0) == 23) {
          $123 = ($$lcssa322>>>0)>(1);
          L34: do {
           if ($123) {
            $234 = 1;$ip$0$ph76$i = -1;$jp$0$ph77$i = 0;
            L35: while(1) {
             $235 = $234;$jp$0$ph13$ph70$i = $jp$0$ph77$i;$p$0$ph$ph71$i = 1;
             while(1) {
              $236 = $235;$jp$0$ph1365$i = $jp$0$ph13$ph70$i;
              L39: while(1) {
               $133 = $236;$k$059$i = 1;
               while(1) {
                $129 = (($k$059$i) + ($ip$0$ph76$i))|0;
                $130 = (($n) + ($129)|0);
                $131 = HEAP8[$130>>0]|0;
                $132 = (($n) + ($133)|0);
                $134 = HEAP8[$132>>0]|0;
                $135 = ($131<<24>>24)==($134<<24>>24);
                if (!($135)) {
                 $$lcssa301 = $133;$$lcssa304 = $131;$$lcssa307 = $134;$jp$0$ph1365$i$lcssa = $jp$0$ph1365$i;
                 break L39;
                }
                $136 = ($k$059$i|0)==($p$0$ph$ph71$i|0);
                $127 = (($k$059$i) + 1)|0;
                if ($136) {
                 break;
                }
                $126 = (($127) + ($jp$0$ph1365$i))|0;
                $128 = ($126>>>0)<($$lcssa322>>>0);
                if ($128) {
                 $133 = $126;$k$059$i = $127;
                } else {
                 $ip$0$ph$lcssa$i = $ip$0$ph76$i;$p$0$ph$ph$lcssa32$i = $p$0$ph$ph71$i;
                 break L35;
                }
               }
               $137 = (($jp$0$ph1365$i) + ($p$0$ph$ph71$i))|0;
               $138 = (($137) + 1)|0;
               $139 = ($138>>>0)<($$lcssa322>>>0);
               if ($139) {
                $236 = $138;$jp$0$ph1365$i = $137;
               } else {
                $ip$0$ph$lcssa$i = $ip$0$ph76$i;$p$0$ph$ph$lcssa32$i = $p$0$ph$ph71$i;
                break L35;
               }
              }
              $140 = ($$lcssa304&255)>($$lcssa307&255);
              $141 = (($$lcssa301) - ($ip$0$ph76$i))|0;
              if (!($140)) {
               $jp$0$ph1365$i$lcssa$lcssa = $jp$0$ph1365$i$lcssa;
               break;
              }
              $124 = (($$lcssa301) + 1)|0;
              $125 = ($124>>>0)<($$lcssa322>>>0);
              if ($125) {
               $235 = $124;$jp$0$ph13$ph70$i = $$lcssa301;$p$0$ph$ph71$i = $141;
              } else {
               $ip$0$ph$lcssa$i = $ip$0$ph76$i;$p$0$ph$ph$lcssa32$i = $141;
               break L35;
              }
             }
             $142 = (($jp$0$ph1365$i$lcssa$lcssa) + 1)|0;
             $143 = (($jp$0$ph1365$i$lcssa$lcssa) + 2)|0;
             $144 = ($143>>>0)<($$lcssa322>>>0);
             if ($144) {
              $234 = $143;$ip$0$ph76$i = $jp$0$ph1365$i$lcssa$lcssa;$jp$0$ph77$i = $142;
             } else {
              $ip$0$ph$lcssa$i = $jp$0$ph1365$i$lcssa$lcssa;$p$0$ph$ph$lcssa32$i = 1;
              break;
             }
            }
            $237 = 1;$ip$1$ph55$i = -1;$jp$1$ph56$i = 0;
            while(1) {
             $239 = $237;$jp$1$ph9$ph49$i = $jp$1$ph56$i;$p$1$ph$ph50$i = 1;
             while(1) {
              $238 = $239;$jp$1$ph944$i = $jp$1$ph9$ph49$i;
              L54: while(1) {
               $152 = $238;$k$139$i = 1;
               while(1) {
                $148 = (($k$139$i) + ($ip$1$ph55$i))|0;
                $149 = (($n) + ($148)|0);
                $150 = HEAP8[$149>>0]|0;
                $151 = (($n) + ($152)|0);
                $153 = HEAP8[$151>>0]|0;
                $154 = ($150<<24>>24)==($153<<24>>24);
                if (!($154)) {
                 $$lcssa281 = $152;$$lcssa284 = $150;$$lcssa287 = $153;$jp$1$ph944$i$lcssa = $jp$1$ph944$i;
                 break L54;
                }
                $155 = ($k$139$i|0)==($p$1$ph$ph50$i|0);
                $146 = (($k$139$i) + 1)|0;
                if ($155) {
                 break;
                }
                $145 = (($146) + ($jp$1$ph944$i))|0;
                $147 = ($145>>>0)<($$lcssa322>>>0);
                if ($147) {
                 $152 = $145;$k$139$i = $146;
                } else {
                 $ip$0$ph$lcssa143$i = $ip$0$ph$lcssa$i;$ip$1$ph$lcssa$i = $ip$1$ph55$i;$p$0$ph$ph$lcssa32147$i = $p$0$ph$ph$lcssa32$i;$p$1$ph$ph$lcssa23$i = $p$1$ph$ph50$i;
                 break L34;
                }
               }
               $156 = (($jp$1$ph944$i) + ($p$1$ph$ph50$i))|0;
               $157 = (($156) + 1)|0;
               $158 = ($157>>>0)<($$lcssa322>>>0);
               if ($158) {
                $238 = $157;$jp$1$ph944$i = $156;
               } else {
                $ip$0$ph$lcssa143$i = $ip$0$ph$lcssa$i;$ip$1$ph$lcssa$i = $ip$1$ph55$i;$p$0$ph$ph$lcssa32147$i = $p$0$ph$ph$lcssa32$i;$p$1$ph$ph$lcssa23$i = $p$1$ph$ph50$i;
                break L34;
               }
              }
              $159 = ($$lcssa284&255)<($$lcssa287&255);
              $160 = (($$lcssa281) - ($ip$1$ph55$i))|0;
              if (!($159)) {
               $jp$1$ph944$i$lcssa$lcssa = $jp$1$ph944$i$lcssa;
               break;
              }
              $164 = (($$lcssa281) + 1)|0;
              $165 = ($164>>>0)<($$lcssa322>>>0);
              if ($165) {
               $239 = $164;$jp$1$ph9$ph49$i = $$lcssa281;$p$1$ph$ph50$i = $160;
              } else {
               $ip$0$ph$lcssa143$i = $ip$0$ph$lcssa$i;$ip$1$ph$lcssa$i = $ip$1$ph55$i;$p$0$ph$ph$lcssa32147$i = $p$0$ph$ph$lcssa32$i;$p$1$ph$ph$lcssa23$i = $160;
               break L34;
              }
             }
             $161 = (($jp$1$ph944$i$lcssa$lcssa) + 1)|0;
             $162 = (($jp$1$ph944$i$lcssa$lcssa) + 2)|0;
             $163 = ($162>>>0)<($$lcssa322>>>0);
             if ($163) {
              $237 = $162;$ip$1$ph55$i = $jp$1$ph944$i$lcssa$lcssa;$jp$1$ph56$i = $161;
             } else {
              $ip$0$ph$lcssa143$i = $ip$0$ph$lcssa$i;$ip$1$ph$lcssa$i = $jp$1$ph944$i$lcssa$lcssa;$p$0$ph$ph$lcssa32147$i = $p$0$ph$ph$lcssa32$i;$p$1$ph$ph$lcssa23$i = 1;
              break;
             }
            }
           } else {
            $ip$0$ph$lcssa143$i = -1;$ip$1$ph$lcssa$i = -1;$p$0$ph$ph$lcssa32147$i = 1;$p$1$ph$ph$lcssa23$i = 1;
           }
          } while(0);
          $166 = (($ip$1$ph$lcssa$i) + 1)|0;
          $167 = (($ip$0$ph$lcssa143$i) + 1)|0;
          $168 = ($166>>>0)>($167>>>0);
          $p$1$p$0$i = $168 ? $p$1$ph$ph$lcssa23$i : $p$0$ph$ph$lcssa32147$i;
          $ip$1$ip$0$i = $168 ? $ip$1$ph$lcssa$i : $ip$0$ph$lcssa143$i;
          $169 = (($n) + ($p$1$p$0$i)|0);
          $170 = (($ip$1$ip$0$i) + 1)|0;
          $171 = (_memcmp($n,$169,$170)|0);
          $172 = ($171|0)==(0);
          if ($172) {
           $177 = (($$lcssa322) - ($p$1$p$0$i))|0;
           $mem0$0$i = $177;$p$3$i = $p$1$p$0$i;
          } else {
           $173 = (($$lcssa322) - ($ip$1$ip$0$i))|0;
           $174 = (($173) + -1)|0;
           $175 = ($ip$1$ip$0$i>>>0)>($174>>>0);
           $ip$1$ip$0$$i = $175 ? $ip$1$ip$0$i : $174;
           $176 = (($ip$1$ip$0$$i) + 1)|0;
           $mem0$0$i = 0;$p$3$i = $176;
          }
          $178 = $$lcssa322 | 63;
          $179 = ($mem0$0$i|0)!=(0);
          $180 = (($$lcssa322) - ($p$3$i))|0;
          $$03$i = $3;$mem$0$i = 0;$z$0$i = $3;
          L69: while(1) {
           $181 = $z$0$i;
           $182 = $$03$i;
           $183 = (($181) - ($182))|0;
           $184 = ($183>>>0)<($$lcssa322>>>0);
           do {
            if ($184) {
             $185 = (_memchr($z$0$i,0,$178)|0);
             $186 = ($185|0)==(0|0);
             if ($186) {
              $190 = (($z$0$i) + ($178)|0);
              $z$1$i = $190;
              break;
             } else {
              $187 = $185;
              $188 = (($187) - ($182))|0;
              $189 = ($188>>>0)<($$lcssa322>>>0);
              if ($189) {
               $$0$i = 0;
               break L32;
              } else {
               $z$1$i = $185;
               break;
              }
             }
            } else {
             $z$1$i = $z$0$i;
            }
           } while(0);
           $191 = (($$03$i) + ($l$080$i$lcssa321)|0);
           $192 = HEAP8[$191>>0]|0;
           $div$i = ($192&255) >>> 5;
           $193 = $div$i&255;
           $194 = (($byteset$i) + ($193<<2)|0);
           $195 = HEAP32[$194>>2]|0;
           $196 = $192 & 31;
           $197 = $196&255;
           $198 = 1 << $197;
           $199 = $198 & $195;
           $200 = ($199|0)==(0);
           if ($200) {
            $209 = (($$03$i) + ($$lcssa322)|0);
            $$03$i = $209;$mem$0$i = 0;$z$0$i = $z$1$i;
            continue;
           }
           $201 = $192&255;
           $202 = (($shift$i) + ($201<<2)|0);
           $203 = HEAP32[$202>>2]|0;
           $204 = (($$lcssa322) - ($203))|0;
           $205 = ($$lcssa322|0)==($203|0);
           if (!($205)) {
            $206 = ($mem$0$i|0)!=(0);
            $or$cond$i = $179 & $206;
            $207 = ($204>>>0)<($p$3$i>>>0);
            $or$cond5$i = $or$cond$i & $207;
            $k$2$i = $or$cond5$i ? $180 : $204;
            $208 = (($$03$i) + ($k$2$i)|0);
            $$03$i = $208;$mem$0$i = 0;$z$0$i = $z$1$i;
            continue;
           }
           $210 = ($170>>>0)>($mem$0$i>>>0);
           $211 = $210 ? $170 : $mem$0$i;
           $212 = (($n) + ($211)|0);
           $213 = HEAP8[$212>>0]|0;
           $214 = ($213<<24>>24)==(0);
           L83: do {
            if ($214) {
             $k$4$i = $170;
            } else {
             $$pr$i = $213;$k$338$i = $211;
             while(1) {
              $215 = (($$03$i) + ($k$338$i)|0);
              $216 = HEAP8[$215>>0]|0;
              $217 = ($$pr$i<<24>>24)==($216<<24>>24);
              if (!($217)) {
               $k$338$i$lcssa = $k$338$i;
               break;
              }
              $218 = (($k$338$i) + 1)|0;
              $219 = (($n) + ($218)|0);
              $220 = HEAP8[$219>>0]|0;
              $221 = ($220<<24>>24)==(0);
              if ($221) {
               $k$4$i = $170;
               break L83;
              } else {
               $$pr$i = $220;$k$338$i = $218;
              }
             }
             $222 = (($k$338$i$lcssa) - ($ip$1$ip$0$i))|0;
             $223 = (($$03$i) + ($222)|0);
             $$03$i = $223;$mem$0$i = 0;$z$0$i = $z$1$i;
             continue L69;
            }
           } while(0);
           while(1) {
            $224 = ($k$4$i>>>0)>($mem$0$i>>>0);
            if (!($224)) {
             $$0$i = $$03$i;
             break L32;
            }
            $225 = (($k$4$i) + -1)|0;
            $226 = (($n) + ($225)|0);
            $227 = HEAP8[$226>>0]|0;
            $228 = (($$03$i) + ($225)|0);
            $229 = HEAP8[$228>>0]|0;
            $230 = ($227<<24>>24)==($229<<24>>24);
            if ($230) {
             $k$4$i = $225;
            } else {
             break;
            }
           }
           $231 = (($$03$i) + ($p$3$i)|0);
           $$03$i = $231;$mem$0$i = $mem0$0$i;$z$0$i = $z$1$i;
          }
         }
        } while(0);
        $$0 = $$0$i;
       }
      }
     }
    }
   }
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function _strtok($s,$sep) {
 $s = $s|0;
 $sep = $sep|0;
 var $$0 = 0, $$01 = 0, $$sum = 0, $$sum2 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($s|0)==(0|0);
 if ($0) {
  $1 = HEAP32[5048>>2]|0;
  $2 = ($1|0)==(0|0);
  if ($2) {
   $$0 = 0;
  } else {
   $$01 = $1;
   label = 3;
  }
 } else {
  $$01 = $s;
  label = 3;
 }
 do {
  if ((label|0) == 3) {
   $3 = (_strspn($$01,$sep)|0);
   $4 = (($$01) + ($3)|0);
   $5 = HEAP8[$4>>0]|0;
   $6 = ($5<<24>>24)==(0);
   if ($6) {
    HEAP32[5048>>2] = 0;
    $$0 = 0;
    break;
   }
   $7 = (_strcspn($4,$sep)|0);
   $$sum = (($7) + ($3))|0;
   $8 = (($$01) + ($$sum)|0);
   HEAP32[5048>>2] = $8;
   $9 = HEAP8[$8>>0]|0;
   $10 = ($9<<24>>24)==(0);
   if ($10) {
    HEAP32[5048>>2] = 0;
    $$0 = $4;
    break;
   } else {
    $$sum2 = (($$sum) + 1)|0;
    $11 = (($$01) + ($$sum2)|0);
    HEAP32[5048>>2] = $11;
    HEAP8[$8>>0] = 0;
    $$0 = $4;
    break;
   }
  }
 } while(0);
 return ($$0|0);
}
function ___fflush_unlocked($f) {
 $f = $f|0;
 var $$0 = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0;
 var $9 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($f)) + 20|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ((($f)) + 28|0);
 $3 = HEAP32[$2>>2]|0;
 $4 = ($1>>>0)>($3>>>0);
 if ($4) {
  $5 = ((($f)) + 36|0);
  $6 = HEAP32[$5>>2]|0;
  (FUNCTION_TABLE_iiii[$6 & 3]($f,0,0)|0);
  $7 = HEAP32[$0>>2]|0;
  $8 = ($7|0)==(0|0);
  if ($8) {
   $$0 = -1;
  } else {
   label = 3;
  }
 } else {
  label = 3;
 }
 if ((label|0) == 3) {
  $9 = ((($f)) + 4|0);
  $10 = HEAP32[$9>>2]|0;
  $11 = ((($f)) + 8|0);
  $12 = HEAP32[$11>>2]|0;
  $13 = ($10>>>0)<($12>>>0);
  if ($13) {
   $14 = ((($f)) + 40|0);
   $15 = HEAP32[$14>>2]|0;
   $16 = $10;
   $17 = $12;
   $18 = (($16) - ($17))|0;
   (FUNCTION_TABLE_iiii[$15 & 3]($f,$18,1)|0);
  }
  $19 = ((($f)) + 16|0);
  HEAP32[$19>>2] = 0;
  HEAP32[$2>>2] = 0;
  HEAP32[$0>>2] = 0;
  HEAP32[$11>>2] = 0;
  HEAP32[$9>>2] = 0;
  $$0 = 0;
 }
 return ($$0|0);
}
function _printf_core($f,$fmt,$ap,$nl_arg,$nl_type) {
 $f = $f|0;
 $fmt = $fmt|0;
 $ap = $ap|0;
 $nl_arg = $nl_arg|0;
 $nl_type = $nl_type|0;
 var $$ = 0, $$$i = 0, $$0 = 0, $$0$i = 0, $$0$lcssa$i = 0, $$012$i = 0, $$013$i = 0, $$03$i33 = 0, $$07$i = 0.0, $$1$i = 0.0, $$114$i = 0, $$2$i = 0.0, $$20$i = 0.0, $$21$i = 0, $$210$$22$i = 0, $$210$$24$i = 0, $$210$i = 0, $$23$i = 0, $$3$i = 0.0, $$31$i = 0;
 var $$311$i = 0, $$4$i = 0.0, $$412$lcssa$i = 0, $$41276$i = 0, $$5$lcssa$i = 0, $$51 = 0, $$587$i = 0, $$a$3$i = 0, $$a$3185$i = 0, $$a$3186$i = 0, $$fl$4 = 0, $$l10n$0 = 0, $$lcssa = 0, $$lcssa159$i = 0, $$lcssa318 = 0, $$lcssa323 = 0, $$lcssa324 = 0, $$lcssa325 = 0, $$lcssa326 = 0, $$lcssa327 = 0;
 var $$lcssa329 = 0, $$lcssa339 = 0, $$lcssa342 = 0.0, $$lcssa344 = 0, $$neg52$i = 0, $$neg53$i = 0, $$p$$i = 0, $$p$0 = 0, $$p$5 = 0, $$p$i = 0, $$pn$i = 0, $$pr$i = 0, $$pr47$i = 0, $$pre = 0, $$pre$i = 0, $$pre$phi184$iZ2D = 0, $$pre179$i = 0, $$pre182$i = 0, $$pre183$i = 0, $$pre193 = 0;
 var $$sum$i = 0, $$sum15$i = 0, $$sum16$i = 0, $$z$3$i = 0, $$z$4$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0;
 var $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0;
 var $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0;
 var $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0;
 var $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0;
 var $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0;
 var $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0;
 var $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0;
 var $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0;
 var $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0;
 var $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0;
 var $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0;
 var $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0;
 var $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0, $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0;
 var $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0, $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0.0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0.0;
 var $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0, $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0;
 var $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0, $390 = 0, $391 = 0.0, $392 = 0.0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0;
 var $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0.0, $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0.0, $412 = 0.0, $413 = 0.0, $414 = 0.0, $415 = 0.0, $416 = 0.0, $417 = 0;
 var $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0, $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0;
 var $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0.0, $443 = 0.0, $444 = 0.0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0;
 var $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0, $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0;
 var $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0.0, $478 = 0, $479 = 0, $48 = 0, $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0.0, $486 = 0.0, $487 = 0.0, $488 = 0, $489 = 0, $49 = 0;
 var $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0, $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0;
 var $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0, $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0;
 var $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0, $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0;
 var $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0, $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0;
 var $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0, $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0;
 var $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0, $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0.0, $597 = 0.0, $598 = 0;
 var $599 = 0.0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0, $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0;
 var $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0, $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0;
 var $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0, $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0;
 var $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0, $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0;
 var $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0, $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0;
 var $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0, $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0;
 var $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0, $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0;
 var $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0, $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0;
 var $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0, $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0;
 var $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0, $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0;
 var $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0, $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0;
 var $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0;
 var $98 = 0, $99 = 0, $a$0 = 0, $a$1 = 0, $a$1$lcssa$i = 0, $a$1147$i = 0, $a$2 = 0, $a$2$ph$i = 0, $a$3$lcssa$i = 0, $a$3134$i = 0, $a$5$lcssa$i = 0, $a$5109$i = 0, $a$6$i = 0, $a$7$i = 0, $a$8$ph$i = 0, $arg = 0, $arglist_current = 0, $arglist_current2 = 0, $arglist_next = 0, $arglist_next3 = 0;
 var $argpos$0 = 0, $big$i = 0, $buf = 0, $buf$i = 0, $carry$0140$i = 0, $carry3$0128$i = 0, $cnt$0 = 0, $cnt$1 = 0, $cnt$1$lcssa = 0, $d$0$i = 0, $d$0139$i = 0, $d$0141$i = 0, $d$1127$i = 0, $d$2$lcssa$i = 0, $d$2108$i = 0, $d$3$i = 0, $d$482$i = 0, $d$575$i = 0, $d$686$i = 0, $e$0123$i = 0;
 var $e$1$i = 0, $e$2104$i = 0, $e$3$i = 0, $e$4$ph$i = 0, $e2$i = 0, $ebuf0$i = 0, $estr$0$i = 0, $estr$1$lcssa$i = 0, $estr$193$i = 0, $estr$2$i = 0, $exitcond$i = 0, $expanded = 0, $expanded10 = 0, $expanded11 = 0, $expanded13 = 0, $expanded14 = 0, $expanded15 = 0, $expanded4 = 0, $expanded6 = 0, $expanded7 = 0;
 var $expanded8 = 0, $fl$0109 = 0, $fl$062 = 0, $fl$1 = 0, $fl$1$ = 0, $fl$3 = 0, $fl$4 = 0, $fl$6 = 0, $fmt39$lcssa = 0, $fmt39101 = 0, $fmt40 = 0, $fmt41 = 0, $fmt42 = 0, $fmt44 = 0, $fmt44$lcssa321 = 0, $fmt45 = 0, $i$0$lcssa = 0, $i$0$lcssa200 = 0, $i$0114 = 0, $i$0122$i = 0;
 var $i$03$i = 0, $i$03$i25 = 0, $i$1$lcssa$i = 0, $i$1116$i = 0, $i$1125 = 0, $i$2100 = 0, $i$2100$lcssa = 0, $i$2103$i = 0, $i$398 = 0, $i$399$i = 0, $isdigit = 0, $isdigit$i = 0, $isdigit$i27 = 0, $isdigit10 = 0, $isdigit12 = 0, $isdigit2$i = 0, $isdigit2$i23 = 0, $isdigittmp = 0, $isdigittmp$ = 0, $isdigittmp$i = 0;
 var $isdigittmp$i26 = 0, $isdigittmp1$i = 0, $isdigittmp1$i22 = 0, $isdigittmp11 = 0, $isdigittmp4$i = 0, $isdigittmp4$i24 = 0, $isdigittmp9 = 0, $j$0$i = 0, $j$0115$i = 0, $j$0117$i = 0, $j$1100$i = 0, $j$2$i = 0, $l$0 = 0, $l$0$i = 0, $l$1$i = 0, $l$1113 = 0, $l$2 = 0, $l10n$0 = 0, $l10n$0$lcssa = 0, $l10n$0$phi = 0;
 var $l10n$1 = 0, $l10n$2 = 0, $l10n$3 = 0, $mb = 0, $notlhs$i = 0, $notrhs$i = 0, $or$cond = 0, $or$cond$i = 0, $or$cond15 = 0, $or$cond17 = 0, $or$cond20 = 0, $or$cond240 = 0, $or$cond29$i = 0, $or$cond3$not$i = 0, $or$cond6$i = 0, $p$0 = 0, $p$1 = 0, $p$2 = 0, $p$2$ = 0, $p$3 = 0;
 var $p$4198 = 0, $p$5 = 0, $pl$0 = 0, $pl$0$i = 0, $pl$1 = 0, $pl$1$i = 0, $pl$2 = 0, $prefix$0 = 0, $prefix$0$$i = 0, $prefix$0$i = 0, $prefix$1 = 0, $prefix$2 = 0, $r$0$a$8$i = 0, $re$169$i = 0, $round$068$i = 0.0, $round6$1$i = 0.0, $s$0$i = 0, $s$1$i = 0, $s$1$i$lcssa = 0, $s1$0$i = 0;
 var $s7$079$i = 0, $s7$1$i = 0, $s8$0$lcssa$i = 0, $s8$070$i = 0, $s9$0$i = 0, $s9$183$i = 0, $s9$2$i = 0, $small$0$i = 0.0, $small$1$i = 0.0, $st$0 = 0, $st$0$lcssa322 = 0, $storemerge = 0, $storemerge13 = 0, $storemerge8108 = 0, $storemerge860 = 0, $sum = 0, $t$0 = 0, $t$1 = 0, $w$$i = 0, $w$0 = 0;
 var $w$1 = 0, $w$2 = 0, $w$30$i = 0, $wc = 0, $ws$0115 = 0, $ws$1126 = 0, $z$0$i = 0, $z$0$lcssa = 0, $z$0102 = 0, $z$1 = 0, $z$1$lcssa$i = 0, $z$1146$i = 0, $z$2 = 0, $z$2$i = 0, $z$2$i$lcssa = 0, $z$3$lcssa$i = 0, $z$3133$i = 0, $z$4$i = 0, $z$6$$i = 0, $z$6$i = 0;
 var $z$6$i$lcssa = 0, $z$6$ph$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 624|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $big$i = sp + 24|0;
 $e2$i = sp + 16|0;
 $buf$i = sp + 588|0;
 $ebuf0$i = sp + 576|0;
 $arg = sp;
 $buf = sp + 536|0;
 $wc = sp + 8|0;
 $mb = sp + 528|0;
 $0 = ($f|0)!=(0|0);
 $1 = ((($buf)) + 40|0);
 $2 = $1;
 $3 = ((($buf)) + 39|0);
 $4 = ((($wc)) + 4|0);
 $5 = ((($ebuf0$i)) + 12|0);
 $6 = ((($ebuf0$i)) + 11|0);
 $7 = $buf$i;
 $8 = $5;
 $9 = (($8) - ($7))|0;
 $10 = (-2 - ($7))|0;
 $11 = (($8) + 2)|0;
 $12 = ((($big$i)) + 288|0);
 $13 = ((($buf$i)) + 9|0);
 $14 = $13;
 $15 = ((($buf$i)) + 8|0);
 $cnt$0 = 0;$fmt41 = $fmt;$l$0 = 0;$l10n$0 = 0;
 L1: while(1) {
  $16 = ($cnt$0|0)>(-1);
  do {
   if ($16) {
    $17 = (2147483647 - ($cnt$0))|0;
    $18 = ($l$0|0)>($17|0);
    if ($18) {
     $19 = (___errno_location()|0);
     HEAP32[$19>>2] = 75;
     $cnt$1 = -1;
     break;
    } else {
     $20 = (($l$0) + ($cnt$0))|0;
     $cnt$1 = $20;
     break;
    }
   } else {
    $cnt$1 = $cnt$0;
   }
  } while(0);
  $21 = HEAP8[$fmt41>>0]|0;
  $22 = ($21<<24>>24)==(0);
  if ($22) {
   $cnt$1$lcssa = $cnt$1;$l10n$0$lcssa = $l10n$0;
   label = 245;
   break;
  } else {
   $23 = $21;$fmt40 = $fmt41;
  }
  L9: while(1) {
   switch ($23<<24>>24) {
   case 37:  {
    $fmt39101 = $fmt40;$z$0102 = $fmt40;
    label = 9;
    break L9;
    break;
   }
   case 0:  {
    $fmt39$lcssa = $fmt40;$z$0$lcssa = $fmt40;
    break L9;
    break;
   }
   default: {
   }
   }
   $24 = ((($fmt40)) + 1|0);
   $$pre = HEAP8[$24>>0]|0;
   $23 = $$pre;$fmt40 = $24;
  }
  L12: do {
   if ((label|0) == 9) {
    while(1) {
     label = 0;
     $25 = ((($fmt39101)) + 1|0);
     $26 = HEAP8[$25>>0]|0;
     $27 = ($26<<24>>24)==(37);
     if (!($27)) {
      $fmt39$lcssa = $fmt39101;$z$0$lcssa = $z$0102;
      break L12;
     }
     $28 = ((($z$0102)) + 1|0);
     $29 = ((($fmt39101)) + 2|0);
     $30 = HEAP8[$29>>0]|0;
     $31 = ($30<<24>>24)==(37);
     if ($31) {
      $fmt39101 = $29;$z$0102 = $28;
      label = 9;
     } else {
      $fmt39$lcssa = $29;$z$0$lcssa = $28;
      break;
     }
    }
   }
  } while(0);
  $32 = $z$0$lcssa;
  $33 = $fmt41;
  $34 = (($32) - ($33))|0;
  if ($0) {
   $35 = HEAP32[$f>>2]|0;
   $36 = $35 & 32;
   $37 = ($36|0)==(0);
   if ($37) {
    (___fwritex($fmt41,$34,$f)|0);
   }
  }
  $38 = ($z$0$lcssa|0)==($fmt41|0);
  if (!($38)) {
   $l10n$0$phi = $l10n$0;$cnt$0 = $cnt$1;$fmt41 = $fmt39$lcssa;$l$0 = $34;$l10n$0 = $l10n$0$phi;
   continue;
  }
  $39 = ((($fmt39$lcssa)) + 1|0);
  $40 = HEAP8[$39>>0]|0;
  $41 = $40 << 24 >> 24;
  $isdigittmp = (($41) + -48)|0;
  $isdigit = ($isdigittmp>>>0)<(10);
  if ($isdigit) {
   $42 = ((($fmt39$lcssa)) + 2|0);
   $43 = HEAP8[$42>>0]|0;
   $44 = ($43<<24>>24)==(36);
   $45 = ((($fmt39$lcssa)) + 3|0);
   $$51 = $44 ? $45 : $39;
   $$l10n$0 = $44 ? 1 : $l10n$0;
   $isdigittmp$ = $44 ? $isdigittmp : -1;
   $$pre193 = HEAP8[$$51>>0]|0;
   $47 = $$pre193;$argpos$0 = $isdigittmp$;$l10n$1 = $$l10n$0;$storemerge = $$51;
  } else {
   $47 = $40;$argpos$0 = -1;$l10n$1 = $l10n$0;$storemerge = $39;
  }
  $46 = $47 << 24 >> 24;
  $48 = $46 & -32;
  $49 = ($48|0)==(32);
  L25: do {
   if ($49) {
    $51 = $46;$56 = $47;$fl$0109 = 0;$storemerge8108 = $storemerge;
    while(1) {
     $50 = (($51) + -32)|0;
     $52 = 1 << $50;
     $53 = $52 & 75913;
     $54 = ($53|0)==(0);
     if ($54) {
      $65 = $56;$fl$062 = $fl$0109;$storemerge860 = $storemerge8108;
      break L25;
     }
     $55 = $56 << 24 >> 24;
     $57 = (($55) + -32)|0;
     $58 = 1 << $57;
     $59 = $58 | $fl$0109;
     $60 = ((($storemerge8108)) + 1|0);
     $61 = HEAP8[$60>>0]|0;
     $62 = $61 << 24 >> 24;
     $63 = $62 & -32;
     $64 = ($63|0)==(32);
     if ($64) {
      $51 = $62;$56 = $61;$fl$0109 = $59;$storemerge8108 = $60;
     } else {
      $65 = $61;$fl$062 = $59;$storemerge860 = $60;
      break;
     }
    }
   } else {
    $65 = $47;$fl$062 = 0;$storemerge860 = $storemerge;
   }
  } while(0);
  $66 = ($65<<24>>24)==(42);
  do {
   if ($66) {
    $67 = ((($storemerge860)) + 1|0);
    $68 = HEAP8[$67>>0]|0;
    $69 = $68 << 24 >> 24;
    $isdigittmp11 = (($69) + -48)|0;
    $isdigit12 = ($isdigittmp11>>>0)<(10);
    if ($isdigit12) {
     $70 = ((($storemerge860)) + 2|0);
     $71 = HEAP8[$70>>0]|0;
     $72 = ($71<<24>>24)==(36);
     if ($72) {
      $73 = (($nl_type) + ($isdigittmp11<<2)|0);
      HEAP32[$73>>2] = 10;
      $74 = HEAP8[$67>>0]|0;
      $75 = $74 << 24 >> 24;
      $76 = (($75) + -48)|0;
      $77 = (($nl_arg) + ($76<<3)|0);
      $78 = $77;
      $79 = $78;
      $80 = HEAP32[$79>>2]|0;
      $81 = (($78) + 4)|0;
      $82 = $81;
      $83 = HEAP32[$82>>2]|0;
      $84 = ((($storemerge860)) + 3|0);
      $l10n$2 = 1;$storemerge13 = $84;$w$0 = $80;
     } else {
      label = 24;
     }
    } else {
     label = 24;
    }
    if ((label|0) == 24) {
     label = 0;
     $85 = ($l10n$1|0)==(0);
     if (!($85)) {
      $$0 = -1;
      break L1;
     }
     if (!($0)) {
      $fl$1 = $fl$062;$fmt42 = $67;$l10n$3 = 0;$w$1 = 0;
      break;
     }
     $arglist_current = HEAP32[$ap>>2]|0;
     $86 = $arglist_current;
     $87 = ((0) + 4|0);
     $expanded4 = $87;
     $expanded = (($expanded4) - 1)|0;
     $88 = (($86) + ($expanded))|0;
     $89 = ((0) + 4|0);
     $expanded8 = $89;
     $expanded7 = (($expanded8) - 1)|0;
     $expanded6 = $expanded7 ^ -1;
     $90 = $88 & $expanded6;
     $91 = $90;
     $92 = HEAP32[$91>>2]|0;
     $arglist_next = ((($91)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next;
     $l10n$2 = 0;$storemerge13 = $67;$w$0 = $92;
    }
    $93 = ($w$0|0)<(0);
    if ($93) {
     $94 = $fl$062 | 8192;
     $95 = (0 - ($w$0))|0;
     $fl$1 = $94;$fmt42 = $storemerge13;$l10n$3 = $l10n$2;$w$1 = $95;
    } else {
     $fl$1 = $fl$062;$fmt42 = $storemerge13;$l10n$3 = $l10n$2;$w$1 = $w$0;
    }
   } else {
    $96 = $65 << 24 >> 24;
    $isdigittmp1$i = (($96) + -48)|0;
    $isdigit2$i = ($isdigittmp1$i>>>0)<(10);
    if ($isdigit2$i) {
     $100 = $storemerge860;$i$03$i = 0;$isdigittmp4$i = $isdigittmp1$i;
     while(1) {
      $97 = ($i$03$i*10)|0;
      $98 = (($97) + ($isdigittmp4$i))|0;
      $99 = ((($100)) + 1|0);
      $101 = HEAP8[$99>>0]|0;
      $102 = $101 << 24 >> 24;
      $isdigittmp$i = (($102) + -48)|0;
      $isdigit$i = ($isdigittmp$i>>>0)<(10);
      if ($isdigit$i) {
       $100 = $99;$i$03$i = $98;$isdigittmp4$i = $isdigittmp$i;
      } else {
       $$lcssa = $98;$$lcssa318 = $99;
       break;
      }
     }
     $103 = ($$lcssa|0)<(0);
     if ($103) {
      $$0 = -1;
      break L1;
     } else {
      $fl$1 = $fl$062;$fmt42 = $$lcssa318;$l10n$3 = $l10n$1;$w$1 = $$lcssa;
     }
    } else {
     $fl$1 = $fl$062;$fmt42 = $storemerge860;$l10n$3 = $l10n$1;$w$1 = 0;
    }
   }
  } while(0);
  $104 = HEAP8[$fmt42>>0]|0;
  $105 = ($104<<24>>24)==(46);
  L46: do {
   if ($105) {
    $106 = ((($fmt42)) + 1|0);
    $107 = HEAP8[$106>>0]|0;
    $108 = ($107<<24>>24)==(42);
    if (!($108)) {
     $135 = $107 << 24 >> 24;
     $isdigittmp1$i22 = (($135) + -48)|0;
     $isdigit2$i23 = ($isdigittmp1$i22>>>0)<(10);
     if ($isdigit2$i23) {
      $139 = $106;$i$03$i25 = 0;$isdigittmp4$i24 = $isdigittmp1$i22;
     } else {
      $fmt45 = $106;$p$0 = 0;
      break;
     }
     while(1) {
      $136 = ($i$03$i25*10)|0;
      $137 = (($136) + ($isdigittmp4$i24))|0;
      $138 = ((($139)) + 1|0);
      $140 = HEAP8[$138>>0]|0;
      $141 = $140 << 24 >> 24;
      $isdigittmp$i26 = (($141) + -48)|0;
      $isdigit$i27 = ($isdigittmp$i26>>>0)<(10);
      if ($isdigit$i27) {
       $139 = $138;$i$03$i25 = $137;$isdigittmp4$i24 = $isdigittmp$i26;
      } else {
       $fmt45 = $138;$p$0 = $137;
       break L46;
      }
     }
    }
    $109 = ((($fmt42)) + 2|0);
    $110 = HEAP8[$109>>0]|0;
    $111 = $110 << 24 >> 24;
    $isdigittmp9 = (($111) + -48)|0;
    $isdigit10 = ($isdigittmp9>>>0)<(10);
    if ($isdigit10) {
     $112 = ((($fmt42)) + 3|0);
     $113 = HEAP8[$112>>0]|0;
     $114 = ($113<<24>>24)==(36);
     if ($114) {
      $115 = (($nl_type) + ($isdigittmp9<<2)|0);
      HEAP32[$115>>2] = 10;
      $116 = HEAP8[$109>>0]|0;
      $117 = $116 << 24 >> 24;
      $118 = (($117) + -48)|0;
      $119 = (($nl_arg) + ($118<<3)|0);
      $120 = $119;
      $121 = $120;
      $122 = HEAP32[$121>>2]|0;
      $123 = (($120) + 4)|0;
      $124 = $123;
      $125 = HEAP32[$124>>2]|0;
      $126 = ((($fmt42)) + 4|0);
      $fmt45 = $126;$p$0 = $122;
      break;
     }
    }
    $127 = ($l10n$3|0)==(0);
    if (!($127)) {
     $$0 = -1;
     break L1;
    }
    if ($0) {
     $arglist_current2 = HEAP32[$ap>>2]|0;
     $128 = $arglist_current2;
     $129 = ((0) + 4|0);
     $expanded11 = $129;
     $expanded10 = (($expanded11) - 1)|0;
     $130 = (($128) + ($expanded10))|0;
     $131 = ((0) + 4|0);
     $expanded15 = $131;
     $expanded14 = (($expanded15) - 1)|0;
     $expanded13 = $expanded14 ^ -1;
     $132 = $130 & $expanded13;
     $133 = $132;
     $134 = HEAP32[$133>>2]|0;
     $arglist_next3 = ((($133)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next3;
     $fmt45 = $109;$p$0 = $134;
    } else {
     $fmt45 = $109;$p$0 = 0;
    }
   } else {
    $fmt45 = $fmt42;$p$0 = -1;
   }
  } while(0);
  $fmt44 = $fmt45;$st$0 = 0;
  while(1) {
   $142 = HEAP8[$fmt44>>0]|0;
   $143 = $142 << 24 >> 24;
   $144 = (($143) + -65)|0;
   $145 = ($144>>>0)>(57);
   if ($145) {
    $$0 = -1;
    break L1;
   }
   $146 = ((($fmt44)) + 1|0);
   $147 = ((17914 + (($st$0*58)|0)|0) + ($144)|0);
   $148 = HEAP8[$147>>0]|0;
   $149 = $148&255;
   $150 = (($149) + -1)|0;
   $151 = ($150>>>0)<(8);
   if ($151) {
    $fmt44 = $146;$st$0 = $149;
   } else {
    $$lcssa323 = $146;$$lcssa324 = $148;$$lcssa325 = $149;$fmt44$lcssa321 = $fmt44;$st$0$lcssa322 = $st$0;
    break;
   }
  }
  $152 = ($$lcssa324<<24>>24)==(0);
  if ($152) {
   $$0 = -1;
   break;
  }
  $153 = ($$lcssa324<<24>>24)==(19);
  $154 = ($argpos$0|0)>(-1);
  do {
   if ($153) {
    if ($154) {
     $$0 = -1;
     break L1;
    } else {
     label = 52;
    }
   } else {
    if ($154) {
     $155 = (($nl_type) + ($argpos$0<<2)|0);
     HEAP32[$155>>2] = $$lcssa325;
     $156 = (($nl_arg) + ($argpos$0<<3)|0);
     $157 = $156;
     $158 = $157;
     $159 = HEAP32[$158>>2]|0;
     $160 = (($157) + 4)|0;
     $161 = $160;
     $162 = HEAP32[$161>>2]|0;
     $163 = $arg;
     $164 = $163;
     HEAP32[$164>>2] = $159;
     $165 = (($163) + 4)|0;
     $166 = $165;
     HEAP32[$166>>2] = $162;
     label = 52;
     break;
    }
    if (!($0)) {
     $$0 = 0;
     break L1;
    }
    _pop_arg($arg,$$lcssa325,$ap);
   }
  } while(0);
  if ((label|0) == 52) {
   label = 0;
   if (!($0)) {
    $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
    continue;
   }
  }
  $167 = HEAP8[$fmt44$lcssa321>>0]|0;
  $168 = $167 << 24 >> 24;
  $169 = ($st$0$lcssa322|0)!=(0);
  $170 = $168 & 15;
  $171 = ($170|0)==(3);
  $or$cond15 = $169 & $171;
  $172 = $168 & -33;
  $t$0 = $or$cond15 ? $172 : $168;
  $173 = $fl$1 & 8192;
  $174 = ($173|0)==(0);
  $175 = $fl$1 & -65537;
  $fl$1$ = $174 ? $fl$1 : $175;
  L75: do {
   switch ($t$0|0) {
   case 110:  {
    switch ($st$0$lcssa322|0) {
    case 0:  {
     $182 = HEAP32[$arg>>2]|0;
     HEAP32[$182>>2] = $cnt$1;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 1:  {
     $183 = HEAP32[$arg>>2]|0;
     HEAP32[$183>>2] = $cnt$1;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 2:  {
     $184 = ($cnt$1|0)<(0);
     $185 = $184 << 31 >> 31;
     $186 = HEAP32[$arg>>2]|0;
     $187 = $186;
     $188 = $187;
     HEAP32[$188>>2] = $cnt$1;
     $189 = (($187) + 4)|0;
     $190 = $189;
     HEAP32[$190>>2] = $185;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 3:  {
     $191 = $cnt$1&65535;
     $192 = HEAP32[$arg>>2]|0;
     HEAP16[$192>>1] = $191;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 4:  {
     $193 = $cnt$1&255;
     $194 = HEAP32[$arg>>2]|0;
     HEAP8[$194>>0] = $193;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 6:  {
     $195 = HEAP32[$arg>>2]|0;
     HEAP32[$195>>2] = $cnt$1;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    case 7:  {
     $196 = ($cnt$1|0)<(0);
     $197 = $196 << 31 >> 31;
     $198 = HEAP32[$arg>>2]|0;
     $199 = $198;
     $200 = $199;
     HEAP32[$200>>2] = $cnt$1;
     $201 = (($199) + 4)|0;
     $202 = $201;
     HEAP32[$202>>2] = $197;
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
     break;
    }
    default: {
     $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $34;$l10n$0 = $l10n$3;
     continue L1;
    }
    }
    break;
   }
   case 112:  {
    $203 = ($p$0>>>0)>(8);
    $204 = $203 ? $p$0 : 8;
    $205 = $fl$1$ | 8;
    $fl$3 = $205;$p$1 = $204;$t$1 = 120;
    label = 64;
    break;
   }
   case 88: case 120:  {
    $fl$3 = $fl$1$;$p$1 = $p$0;$t$1 = $t$0;
    label = 64;
    break;
   }
   case 111:  {
    $243 = $arg;
    $244 = $243;
    $245 = HEAP32[$244>>2]|0;
    $246 = (($243) + 4)|0;
    $247 = $246;
    $248 = HEAP32[$247>>2]|0;
    $249 = ($245|0)==(0);
    $250 = ($248|0)==(0);
    $251 = $249 & $250;
    if ($251) {
     $$0$lcssa$i = $1;
    } else {
     $$03$i33 = $1;$253 = $245;$257 = $248;
     while(1) {
      $252 = $253 & 7;
      $254 = $252 | 48;
      $255 = $254&255;
      $256 = ((($$03$i33)) + -1|0);
      HEAP8[$256>>0] = $255;
      $258 = (_bitshift64Lshr(($253|0),($257|0),3)|0);
      $259 = tempRet0;
      $260 = ($258|0)==(0);
      $261 = ($259|0)==(0);
      $262 = $260 & $261;
      if ($262) {
       $$0$lcssa$i = $256;
       break;
      } else {
       $$03$i33 = $256;$253 = $258;$257 = $259;
      }
     }
    }
    $263 = $fl$1$ & 8;
    $264 = ($263|0)==(0);
    if ($264) {
     $a$0 = $$0$lcssa$i;$fl$4 = $fl$1$;$p$2 = $p$0;$pl$1 = 0;$prefix$1 = 18394;
     label = 77;
    } else {
     $265 = $$0$lcssa$i;
     $266 = (($2) - ($265))|0;
     $267 = (($266) + 1)|0;
     $268 = ($p$0|0)<($267|0);
     $$p$0 = $268 ? $267 : $p$0;
     $a$0 = $$0$lcssa$i;$fl$4 = $fl$1$;$p$2 = $$p$0;$pl$1 = 0;$prefix$1 = 18394;
     label = 77;
    }
    break;
   }
   case 105: case 100:  {
    $269 = $arg;
    $270 = $269;
    $271 = HEAP32[$270>>2]|0;
    $272 = (($269) + 4)|0;
    $273 = $272;
    $274 = HEAP32[$273>>2]|0;
    $275 = ($274|0)<(0);
    if ($275) {
     $276 = (_i64Subtract(0,0,($271|0),($274|0))|0);
     $277 = tempRet0;
     $278 = $arg;
     $279 = $278;
     HEAP32[$279>>2] = $276;
     $280 = (($278) + 4)|0;
     $281 = $280;
     HEAP32[$281>>2] = $277;
     $286 = $276;$287 = $277;$pl$0 = 1;$prefix$0 = 18394;
     label = 76;
     break L75;
    }
    $282 = $fl$1$ & 2048;
    $283 = ($282|0)==(0);
    if ($283) {
     $284 = $fl$1$ & 1;
     $285 = ($284|0)==(0);
     $$ = $285 ? 18394 : (18396);
     $286 = $271;$287 = $274;$pl$0 = $284;$prefix$0 = $$;
     label = 76;
    } else {
     $286 = $271;$287 = $274;$pl$0 = 1;$prefix$0 = (18395);
     label = 76;
    }
    break;
   }
   case 117:  {
    $176 = $arg;
    $177 = $176;
    $178 = HEAP32[$177>>2]|0;
    $179 = (($176) + 4)|0;
    $180 = $179;
    $181 = HEAP32[$180>>2]|0;
    $286 = $178;$287 = $181;$pl$0 = 0;$prefix$0 = 18394;
    label = 76;
    break;
   }
   case 99:  {
    $307 = $arg;
    $308 = $307;
    $309 = HEAP32[$308>>2]|0;
    $310 = (($307) + 4)|0;
    $311 = $310;
    $312 = HEAP32[$311>>2]|0;
    $313 = $309&255;
    HEAP8[$3>>0] = $313;
    $a$2 = $3;$fl$6 = $175;$p$5 = 1;$pl$2 = 0;$prefix$2 = 18394;$z$2 = $1;
    break;
   }
   case 109:  {
    $314 = (___errno_location()|0);
    $315 = HEAP32[$314>>2]|0;
    $316 = (_strerror($315)|0);
    $a$1 = $316;
    label = 82;
    break;
   }
   case 115:  {
    $317 = HEAP32[$arg>>2]|0;
    $318 = ($317|0)!=(0|0);
    $319 = $318 ? $317 : 18404;
    $a$1 = $319;
    label = 82;
    break;
   }
   case 67:  {
    $326 = $arg;
    $327 = $326;
    $328 = HEAP32[$327>>2]|0;
    $329 = (($326) + 4)|0;
    $330 = $329;
    $331 = HEAP32[$330>>2]|0;
    HEAP32[$wc>>2] = $328;
    HEAP32[$4>>2] = 0;
    HEAP32[$arg>>2] = $wc;
    $p$4198 = -1;
    label = 86;
    break;
   }
   case 83:  {
    $332 = ($p$0|0)==(0);
    if ($332) {
     _pad($f,32,$w$1,0,$fl$1$);
     $i$0$lcssa200 = 0;
     label = 98;
    } else {
     $p$4198 = $p$0;
     label = 86;
    }
    break;
   }
   case 65: case 71: case 70: case 69: case 97: case 103: case 102: case 101:  {
    $359 = +HEAPF64[$arg>>3];
    HEAP32[$e2$i>>2] = 0;
    HEAPF64[tempDoublePtr>>3] = $359;$360 = HEAP32[tempDoublePtr>>2]|0;
    $361 = HEAP32[tempDoublePtr+4>>2]|0;
    $362 = ($361|0)<(0);
    if ($362) {
     $363 = -$359;
     $$07$i = $363;$pl$0$i = 1;$prefix$0$i = 18411;
    } else {
     $364 = $fl$1$ & 2048;
     $365 = ($364|0)==(0);
     if ($365) {
      $366 = $fl$1$ & 1;
      $367 = ($366|0)==(0);
      $$$i = $367 ? (18412) : (18417);
      $$07$i = $359;$pl$0$i = $366;$prefix$0$i = $$$i;
     } else {
      $$07$i = $359;$pl$0$i = 1;$prefix$0$i = (18414);
     }
    }
    HEAPF64[tempDoublePtr>>3] = $$07$i;$368 = HEAP32[tempDoublePtr>>2]|0;
    $369 = HEAP32[tempDoublePtr+4>>2]|0;
    $370 = $369 & 2146435072;
    $371 = ($370>>>0)<(2146435072);
    $372 = (0)<(0);
    $373 = ($370|0)==(2146435072);
    $374 = $373 & $372;
    $375 = $371 | $374;
    do {
     if ($375) {
      $391 = (+_frexpl($$07$i,$e2$i));
      $392 = $391 * 2.0;
      $393 = $392 != 0.0;
      if ($393) {
       $394 = HEAP32[$e2$i>>2]|0;
       $395 = (($394) + -1)|0;
       HEAP32[$e2$i>>2] = $395;
      }
      $396 = $t$0 | 32;
      $397 = ($396|0)==(97);
      if ($397) {
       $398 = $t$0 & 32;
       $399 = ($398|0)==(0);
       $400 = ((($prefix$0$i)) + 9|0);
       $prefix$0$$i = $399 ? $prefix$0$i : $400;
       $401 = $pl$0$i | 2;
       $402 = ($p$0>>>0)>(11);
       $403 = (12 - ($p$0))|0;
       $404 = ($403|0)==(0);
       $405 = $402 | $404;
       do {
        if ($405) {
         $$1$i = $392;
        } else {
         $re$169$i = $403;$round$068$i = 8.0;
         while(1) {
          $406 = (($re$169$i) + -1)|0;
          $407 = $round$068$i * 16.0;
          $408 = ($406|0)==(0);
          if ($408) {
           $$lcssa342 = $407;
           break;
          } else {
           $re$169$i = $406;$round$068$i = $407;
          }
         }
         $409 = HEAP8[$prefix$0$$i>>0]|0;
         $410 = ($409<<24>>24)==(45);
         if ($410) {
          $411 = -$392;
          $412 = $411 - $$lcssa342;
          $413 = $$lcssa342 + $412;
          $414 = -$413;
          $$1$i = $414;
          break;
         } else {
          $415 = $392 + $$lcssa342;
          $416 = $415 - $$lcssa342;
          $$1$i = $416;
          break;
         }
        }
       } while(0);
       $417 = HEAP32[$e2$i>>2]|0;
       $418 = ($417|0)<(0);
       $419 = (0 - ($417))|0;
       $420 = $418 ? $419 : $417;
       $421 = ($420|0)<(0);
       $422 = $421 << 31 >> 31;
       $423 = (_fmt_u($420,$422,$5)|0);
       $424 = ($423|0)==($5|0);
       if ($424) {
        HEAP8[$6>>0] = 48;
        $estr$0$i = $6;
       } else {
        $estr$0$i = $423;
       }
       $425 = $417 >> 31;
       $426 = $425 & 2;
       $427 = (($426) + 43)|0;
       $428 = $427&255;
       $429 = ((($estr$0$i)) + -1|0);
       HEAP8[$429>>0] = $428;
       $430 = (($t$0) + 15)|0;
       $431 = $430&255;
       $432 = ((($estr$0$i)) + -2|0);
       HEAP8[$432>>0] = $431;
       $notrhs$i = ($p$0|0)<(1);
       $433 = $fl$1$ & 8;
       $434 = ($433|0)==(0);
       $$2$i = $$1$i;$s$0$i = $buf$i;
       while(1) {
        $435 = (~~(($$2$i)));
        $436 = (18378 + ($435)|0);
        $437 = HEAP8[$436>>0]|0;
        $438 = $437&255;
        $439 = $438 | $398;
        $440 = $439&255;
        $441 = ((($s$0$i)) + 1|0);
        HEAP8[$s$0$i>>0] = $440;
        $442 = (+($435|0));
        $443 = $$2$i - $442;
        $444 = $443 * 16.0;
        $445 = $441;
        $446 = (($445) - ($7))|0;
        $447 = ($446|0)==(1);
        do {
         if ($447) {
          $notlhs$i = $444 == 0.0;
          $or$cond3$not$i = $notrhs$i & $notlhs$i;
          $or$cond$i = $434 & $or$cond3$not$i;
          if ($or$cond$i) {
           $s$1$i = $441;
           break;
          }
          $448 = ((($s$0$i)) + 2|0);
          HEAP8[$441>>0] = 46;
          $s$1$i = $448;
         } else {
          $s$1$i = $441;
         }
        } while(0);
        $449 = $444 != 0.0;
        if ($449) {
         $$2$i = $444;$s$0$i = $s$1$i;
        } else {
         $s$1$i$lcssa = $s$1$i;
         break;
        }
       }
       $450 = ($p$0|0)!=(0);
       $$pre182$i = $s$1$i$lcssa;
       $451 = (($10) + ($$pre182$i))|0;
       $452 = ($451|0)<($p$0|0);
       $or$cond240 = $450 & $452;
       $453 = $432;
       $454 = (($11) + ($p$0))|0;
       $455 = (($454) - ($453))|0;
       $456 = $432;
       $457 = (($9) - ($456))|0;
       $458 = (($457) + ($$pre182$i))|0;
       $l$0$i = $or$cond240 ? $455 : $458;
       $459 = (($l$0$i) + ($401))|0;
       _pad($f,32,$w$1,$459,$fl$1$);
       $460 = HEAP32[$f>>2]|0;
       $461 = $460 & 32;
       $462 = ($461|0)==(0);
       if ($462) {
        (___fwritex($prefix$0$$i,$401,$f)|0);
       }
       $463 = $fl$1$ ^ 65536;
       _pad($f,48,$w$1,$459,$463);
       $464 = (($$pre182$i) - ($7))|0;
       $465 = HEAP32[$f>>2]|0;
       $466 = $465 & 32;
       $467 = ($466|0)==(0);
       if ($467) {
        (___fwritex($buf$i,$464,$f)|0);
       }
       $468 = $432;
       $469 = (($8) - ($468))|0;
       $sum = (($464) + ($469))|0;
       $470 = (($l$0$i) - ($sum))|0;
       _pad($f,48,$470,0,0);
       $471 = HEAP32[$f>>2]|0;
       $472 = $471 & 32;
       $473 = ($472|0)==(0);
       if ($473) {
        (___fwritex($432,$469,$f)|0);
       }
       $474 = $fl$1$ ^ 8192;
       _pad($f,32,$w$1,$459,$474);
       $475 = ($459|0)<($w$1|0);
       $w$$i = $475 ? $w$1 : $459;
       $$0$i = $w$$i;
       break;
      }
      $476 = ($p$0|0)<(0);
      $$p$i = $476 ? 6 : $p$0;
      if ($393) {
       $477 = $392 * 268435456.0;
       $478 = HEAP32[$e2$i>>2]|0;
       $479 = (($478) + -28)|0;
       HEAP32[$e2$i>>2] = $479;
       $$3$i = $477;$480 = $479;
      } else {
       $$pre179$i = HEAP32[$e2$i>>2]|0;
       $$3$i = $392;$480 = $$pre179$i;
      }
      $481 = ($480|0)<(0);
      $$31$i = $481 ? $big$i : $12;
      $482 = $$31$i;
      $$4$i = $$3$i;$z$0$i = $$31$i;
      while(1) {
       $483 = (~~(($$4$i))>>>0);
       HEAP32[$z$0$i>>2] = $483;
       $484 = ((($z$0$i)) + 4|0);
       $485 = (+($483>>>0));
       $486 = $$4$i - $485;
       $487 = $486 * 1.0E+9;
       $488 = $487 != 0.0;
       if ($488) {
        $$4$i = $487;$z$0$i = $484;
       } else {
        $$lcssa326 = $484;
        break;
       }
      }
      $$pr$i = HEAP32[$e2$i>>2]|0;
      $489 = ($$pr$i|0)>(0);
      if ($489) {
       $490 = $$pr$i;$a$1147$i = $$31$i;$z$1146$i = $$lcssa326;
       while(1) {
        $491 = ($490|0)>(29);
        $492 = $491 ? 29 : $490;
        $d$0139$i = ((($z$1146$i)) + -4|0);
        $493 = ($d$0139$i>>>0)<($a$1147$i>>>0);
        do {
         if ($493) {
          $a$2$ph$i = $a$1147$i;
         } else {
          $carry$0140$i = 0;$d$0141$i = $d$0139$i;
          while(1) {
           $494 = HEAP32[$d$0141$i>>2]|0;
           $495 = (_bitshift64Shl(($494|0),0,($492|0))|0);
           $496 = tempRet0;
           $497 = (_i64Add(($495|0),($496|0),($carry$0140$i|0),0)|0);
           $498 = tempRet0;
           $499 = (___uremdi3(($497|0),($498|0),1000000000,0)|0);
           $500 = tempRet0;
           HEAP32[$d$0141$i>>2] = $499;
           $501 = (___udivdi3(($497|0),($498|0),1000000000,0)|0);
           $502 = tempRet0;
           $d$0$i = ((($d$0141$i)) + -4|0);
           $503 = ($d$0$i>>>0)<($a$1147$i>>>0);
           if ($503) {
            $$lcssa327 = $501;
            break;
           } else {
            $carry$0140$i = $501;$d$0141$i = $d$0$i;
           }
          }
          $504 = ($$lcssa327|0)==(0);
          if ($504) {
           $a$2$ph$i = $a$1147$i;
           break;
          }
          $505 = ((($a$1147$i)) + -4|0);
          HEAP32[$505>>2] = $$lcssa327;
          $a$2$ph$i = $505;
         }
        } while(0);
        $z$2$i = $z$1146$i;
        while(1) {
         $506 = ($z$2$i>>>0)>($a$2$ph$i>>>0);
         if (!($506)) {
          $z$2$i$lcssa = $z$2$i;
          break;
         }
         $507 = ((($z$2$i)) + -4|0);
         $508 = HEAP32[$507>>2]|0;
         $509 = ($508|0)==(0);
         if ($509) {
          $z$2$i = $507;
         } else {
          $z$2$i$lcssa = $z$2$i;
          break;
         }
        }
        $510 = HEAP32[$e2$i>>2]|0;
        $511 = (($510) - ($492))|0;
        HEAP32[$e2$i>>2] = $511;
        $512 = ($511|0)>(0);
        if ($512) {
         $490 = $511;$a$1147$i = $a$2$ph$i;$z$1146$i = $z$2$i$lcssa;
        } else {
         $$pr47$i = $511;$a$1$lcssa$i = $a$2$ph$i;$z$1$lcssa$i = $z$2$i$lcssa;
         break;
        }
       }
      } else {
       $$pr47$i = $$pr$i;$a$1$lcssa$i = $$31$i;$z$1$lcssa$i = $$lcssa326;
      }
      $513 = ($$pr47$i|0)<(0);
      if ($513) {
       $514 = (($$p$i) + 25)|0;
       $515 = (($514|0) / 9)&-1;
       $516 = (($515) + 1)|0;
       $517 = ($396|0)==(102);
       $519 = $$pr47$i;$a$3134$i = $a$1$lcssa$i;$z$3133$i = $z$1$lcssa$i;
       while(1) {
        $518 = (0 - ($519))|0;
        $520 = ($518|0)>(9);
        $521 = $520 ? 9 : $518;
        $522 = ($a$3134$i>>>0)<($z$3133$i>>>0);
        do {
         if ($522) {
          $526 = 1 << $521;
          $527 = (($526) + -1)|0;
          $528 = 1000000000 >>> $521;
          $carry3$0128$i = 0;$d$1127$i = $a$3134$i;
          while(1) {
           $529 = HEAP32[$d$1127$i>>2]|0;
           $530 = $529 & $527;
           $531 = $529 >>> $521;
           $532 = (($531) + ($carry3$0128$i))|0;
           HEAP32[$d$1127$i>>2] = $532;
           $533 = Math_imul($530, $528)|0;
           $534 = ((($d$1127$i)) + 4|0);
           $535 = ($534>>>0)<($z$3133$i>>>0);
           if ($535) {
            $carry3$0128$i = $533;$d$1127$i = $534;
           } else {
            $$lcssa329 = $533;
            break;
           }
          }
          $536 = HEAP32[$a$3134$i>>2]|0;
          $537 = ($536|0)==(0);
          $538 = ((($a$3134$i)) + 4|0);
          $$a$3$i = $537 ? $538 : $a$3134$i;
          $539 = ($$lcssa329|0)==(0);
          if ($539) {
           $$a$3186$i = $$a$3$i;$z$4$i = $z$3133$i;
           break;
          }
          $540 = ((($z$3133$i)) + 4|0);
          HEAP32[$z$3133$i>>2] = $$lcssa329;
          $$a$3186$i = $$a$3$i;$z$4$i = $540;
         } else {
          $523 = HEAP32[$a$3134$i>>2]|0;
          $524 = ($523|0)==(0);
          $525 = ((($a$3134$i)) + 4|0);
          $$a$3185$i = $524 ? $525 : $a$3134$i;
          $$a$3186$i = $$a$3185$i;$z$4$i = $z$3133$i;
         }
        } while(0);
        $541 = $517 ? $$31$i : $$a$3186$i;
        $542 = $z$4$i;
        $543 = $541;
        $544 = (($542) - ($543))|0;
        $545 = $544 >> 2;
        $546 = ($545|0)>($516|0);
        $547 = (($541) + ($516<<2)|0);
        $$z$4$i = $546 ? $547 : $z$4$i;
        $548 = HEAP32[$e2$i>>2]|0;
        $549 = (($548) + ($521))|0;
        HEAP32[$e2$i>>2] = $549;
        $550 = ($549|0)<(0);
        if ($550) {
         $519 = $549;$a$3134$i = $$a$3186$i;$z$3133$i = $$z$4$i;
        } else {
         $a$3$lcssa$i = $$a$3186$i;$z$3$lcssa$i = $$z$4$i;
         break;
        }
       }
      } else {
       $a$3$lcssa$i = $a$1$lcssa$i;$z$3$lcssa$i = $z$1$lcssa$i;
      }
      $551 = ($a$3$lcssa$i>>>0)<($z$3$lcssa$i>>>0);
      do {
       if ($551) {
        $552 = $a$3$lcssa$i;
        $553 = (($482) - ($552))|0;
        $554 = $553 >> 2;
        $555 = ($554*9)|0;
        $556 = HEAP32[$a$3$lcssa$i>>2]|0;
        $557 = ($556>>>0)<(10);
        if ($557) {
         $e$1$i = $555;
         break;
        } else {
         $e$0123$i = $555;$i$0122$i = 10;
        }
        while(1) {
         $558 = ($i$0122$i*10)|0;
         $559 = (($e$0123$i) + 1)|0;
         $560 = ($556>>>0)<($558>>>0);
         if ($560) {
          $e$1$i = $559;
          break;
         } else {
          $e$0123$i = $559;$i$0122$i = $558;
         }
        }
       } else {
        $e$1$i = 0;
       }
      } while(0);
      $561 = ($396|0)!=(102);
      $562 = $561 ? $e$1$i : 0;
      $563 = (($$p$i) - ($562))|0;
      $564 = ($396|0)==(103);
      $565 = ($$p$i|0)!=(0);
      $566 = $565 & $564;
      $$neg52$i = $566 << 31 >> 31;
      $567 = (($563) + ($$neg52$i))|0;
      $568 = $z$3$lcssa$i;
      $569 = (($568) - ($482))|0;
      $570 = $569 >> 2;
      $571 = ($570*9)|0;
      $572 = (($571) + -9)|0;
      $573 = ($567|0)<($572|0);
      if ($573) {
       $574 = (($567) + 9216)|0;
       $575 = (($574|0) / 9)&-1;
       $$sum$i = (($575) + -1023)|0;
       $576 = (($$31$i) + ($$sum$i<<2)|0);
       $577 = (($574|0) % 9)&-1;
       $j$0115$i = (($577) + 1)|0;
       $578 = ($j$0115$i|0)<(9);
       if ($578) {
        $i$1116$i = 10;$j$0117$i = $j$0115$i;
        while(1) {
         $579 = ($i$1116$i*10)|0;
         $j$0$i = (($j$0117$i) + 1)|0;
         $exitcond$i = ($j$0$i|0)==(9);
         if ($exitcond$i) {
          $i$1$lcssa$i = $579;
          break;
         } else {
          $i$1116$i = $579;$j$0117$i = $j$0$i;
         }
        }
       } else {
        $i$1$lcssa$i = 10;
       }
       $580 = HEAP32[$576>>2]|0;
       $581 = (($580>>>0) % ($i$1$lcssa$i>>>0))&-1;
       $582 = ($581|0)==(0);
       if ($582) {
        $$sum15$i = (($575) + -1022)|0;
        $583 = (($$31$i) + ($$sum15$i<<2)|0);
        $584 = ($583|0)==($z$3$lcssa$i|0);
        if ($584) {
         $a$7$i = $a$3$lcssa$i;$d$3$i = $576;$e$3$i = $e$1$i;
        } else {
         label = 163;
        }
       } else {
        label = 163;
       }
       do {
        if ((label|0) == 163) {
         label = 0;
         $585 = (($580>>>0) / ($i$1$lcssa$i>>>0))&-1;
         $586 = $585 & 1;
         $587 = ($586|0)==(0);
         $$20$i = $587 ? 9007199254740992.0 : 9007199254740994.0;
         $588 = (($i$1$lcssa$i|0) / 2)&-1;
         $589 = ($581>>>0)<($588>>>0);
         do {
          if ($589) {
           $small$0$i = 0.5;
          } else {
           $590 = ($581|0)==($588|0);
           if ($590) {
            $$sum16$i = (($575) + -1022)|0;
            $591 = (($$31$i) + ($$sum16$i<<2)|0);
            $592 = ($591|0)==($z$3$lcssa$i|0);
            if ($592) {
             $small$0$i = 1.0;
             break;
            }
           }
           $small$0$i = 1.5;
          }
         } while(0);
         $593 = ($pl$0$i|0)==(0);
         do {
          if ($593) {
           $round6$1$i = $$20$i;$small$1$i = $small$0$i;
          } else {
           $594 = HEAP8[$prefix$0$i>>0]|0;
           $595 = ($594<<24>>24)==(45);
           if (!($595)) {
            $round6$1$i = $$20$i;$small$1$i = $small$0$i;
            break;
           }
           $596 = -$$20$i;
           $597 = -$small$0$i;
           $round6$1$i = $596;$small$1$i = $597;
          }
         } while(0);
         $598 = (($580) - ($581))|0;
         HEAP32[$576>>2] = $598;
         $599 = $round6$1$i + $small$1$i;
         $600 = $599 != $round6$1$i;
         if (!($600)) {
          $a$7$i = $a$3$lcssa$i;$d$3$i = $576;$e$3$i = $e$1$i;
          break;
         }
         $601 = (($598) + ($i$1$lcssa$i))|0;
         HEAP32[$576>>2] = $601;
         $602 = ($601>>>0)>(999999999);
         if ($602) {
          $a$5109$i = $a$3$lcssa$i;$d$2108$i = $576;
          while(1) {
           $603 = ((($d$2108$i)) + -4|0);
           HEAP32[$d$2108$i>>2] = 0;
           $604 = ($603>>>0)<($a$5109$i>>>0);
           if ($604) {
            $605 = ((($a$5109$i)) + -4|0);
            HEAP32[$605>>2] = 0;
            $a$6$i = $605;
           } else {
            $a$6$i = $a$5109$i;
           }
           $606 = HEAP32[$603>>2]|0;
           $607 = (($606) + 1)|0;
           HEAP32[$603>>2] = $607;
           $608 = ($607>>>0)>(999999999);
           if ($608) {
            $a$5109$i = $a$6$i;$d$2108$i = $603;
           } else {
            $a$5$lcssa$i = $a$6$i;$d$2$lcssa$i = $603;
            break;
           }
          }
         } else {
          $a$5$lcssa$i = $a$3$lcssa$i;$d$2$lcssa$i = $576;
         }
         $609 = $a$5$lcssa$i;
         $610 = (($482) - ($609))|0;
         $611 = $610 >> 2;
         $612 = ($611*9)|0;
         $613 = HEAP32[$a$5$lcssa$i>>2]|0;
         $614 = ($613>>>0)<(10);
         if ($614) {
          $a$7$i = $a$5$lcssa$i;$d$3$i = $d$2$lcssa$i;$e$3$i = $612;
          break;
         } else {
          $e$2104$i = $612;$i$2103$i = 10;
         }
         while(1) {
          $615 = ($i$2103$i*10)|0;
          $616 = (($e$2104$i) + 1)|0;
          $617 = ($613>>>0)<($615>>>0);
          if ($617) {
           $a$7$i = $a$5$lcssa$i;$d$3$i = $d$2$lcssa$i;$e$3$i = $616;
           break;
          } else {
           $e$2104$i = $616;$i$2103$i = $615;
          }
         }
        }
       } while(0);
       $618 = ((($d$3$i)) + 4|0);
       $619 = ($z$3$lcssa$i>>>0)>($618>>>0);
       $$z$3$i = $619 ? $618 : $z$3$lcssa$i;
       $a$8$ph$i = $a$7$i;$e$4$ph$i = $e$3$i;$z$6$ph$i = $$z$3$i;
      } else {
       $a$8$ph$i = $a$3$lcssa$i;$e$4$ph$i = $e$1$i;$z$6$ph$i = $z$3$lcssa$i;
      }
      $620 = (0 - ($e$4$ph$i))|0;
      $z$6$i = $z$6$ph$i;
      while(1) {
       $621 = ($z$6$i>>>0)>($a$8$ph$i>>>0);
       if (!($621)) {
        $$lcssa159$i = 0;$z$6$i$lcssa = $z$6$i;
        break;
       }
       $622 = ((($z$6$i)) + -4|0);
       $623 = HEAP32[$622>>2]|0;
       $624 = ($623|0)==(0);
       if ($624) {
        $z$6$i = $622;
       } else {
        $$lcssa159$i = 1;$z$6$i$lcssa = $z$6$i;
        break;
       }
      }
      do {
       if ($564) {
        $625 = $565&1;
        $626 = $625 ^ 1;
        $$p$$i = (($626) + ($$p$i))|0;
        $627 = ($$p$$i|0)>($e$4$ph$i|0);
        $628 = ($e$4$ph$i|0)>(-5);
        $or$cond6$i = $627 & $628;
        if ($or$cond6$i) {
         $629 = (($t$0) + -1)|0;
         $$neg53$i = (($$p$$i) + -1)|0;
         $630 = (($$neg53$i) - ($e$4$ph$i))|0;
         $$013$i = $629;$$210$i = $630;
        } else {
         $631 = (($t$0) + -2)|0;
         $632 = (($$p$$i) + -1)|0;
         $$013$i = $631;$$210$i = $632;
        }
        $633 = $fl$1$ & 8;
        $634 = ($633|0)==(0);
        if (!($634)) {
         $$114$i = $$013$i;$$311$i = $$210$i;$$pre$phi184$iZ2D = $633;
         break;
        }
        do {
         if ($$lcssa159$i) {
          $635 = ((($z$6$i$lcssa)) + -4|0);
          $636 = HEAP32[$635>>2]|0;
          $637 = ($636|0)==(0);
          if ($637) {
           $j$2$i = 9;
           break;
          }
          $638 = (($636>>>0) % 10)&-1;
          $639 = ($638|0)==(0);
          if ($639) {
           $i$399$i = 10;$j$1100$i = 0;
          } else {
           $j$2$i = 0;
           break;
          }
          while(1) {
           $640 = ($i$399$i*10)|0;
           $641 = (($j$1100$i) + 1)|0;
           $642 = (($636>>>0) % ($640>>>0))&-1;
           $643 = ($642|0)==(0);
           if ($643) {
            $i$399$i = $640;$j$1100$i = $641;
           } else {
            $j$2$i = $641;
            break;
           }
          }
         } else {
          $j$2$i = 9;
         }
        } while(0);
        $644 = $$013$i | 32;
        $645 = ($644|0)==(102);
        $646 = $z$6$i$lcssa;
        $647 = (($646) - ($482))|0;
        $648 = $647 >> 2;
        $649 = ($648*9)|0;
        $650 = (($649) + -9)|0;
        if ($645) {
         $651 = (($650) - ($j$2$i))|0;
         $652 = ($651|0)<(0);
         $$21$i = $652 ? 0 : $651;
         $653 = ($$210$i|0)<($$21$i|0);
         $$210$$22$i = $653 ? $$210$i : $$21$i;
         $$114$i = $$013$i;$$311$i = $$210$$22$i;$$pre$phi184$iZ2D = 0;
         break;
        } else {
         $654 = (($650) + ($e$4$ph$i))|0;
         $655 = (($654) - ($j$2$i))|0;
         $656 = ($655|0)<(0);
         $$23$i = $656 ? 0 : $655;
         $657 = ($$210$i|0)<($$23$i|0);
         $$210$$24$i = $657 ? $$210$i : $$23$i;
         $$114$i = $$013$i;$$311$i = $$210$$24$i;$$pre$phi184$iZ2D = 0;
         break;
        }
       } else {
        $$pre183$i = $fl$1$ & 8;
        $$114$i = $t$0;$$311$i = $$p$i;$$pre$phi184$iZ2D = $$pre183$i;
       }
      } while(0);
      $658 = $$311$i | $$pre$phi184$iZ2D;
      $659 = ($658|0)!=(0);
      $660 = $659&1;
      $661 = $$114$i | 32;
      $662 = ($661|0)==(102);
      if ($662) {
       $663 = ($e$4$ph$i|0)>(0);
       $664 = $663 ? $e$4$ph$i : 0;
       $$pn$i = $664;$estr$2$i = 0;
      } else {
       $665 = ($e$4$ph$i|0)<(0);
       $666 = $665 ? $620 : $e$4$ph$i;
       $667 = ($666|0)<(0);
       $668 = $667 << 31 >> 31;
       $669 = (_fmt_u($666,$668,$5)|0);
       $670 = $669;
       $671 = (($8) - ($670))|0;
       $672 = ($671|0)<(2);
       if ($672) {
        $estr$193$i = $669;
        while(1) {
         $673 = ((($estr$193$i)) + -1|0);
         HEAP8[$673>>0] = 48;
         $674 = $673;
         $675 = (($8) - ($674))|0;
         $676 = ($675|0)<(2);
         if ($676) {
          $estr$193$i = $673;
         } else {
          $estr$1$lcssa$i = $673;
          break;
         }
        }
       } else {
        $estr$1$lcssa$i = $669;
       }
       $677 = $e$4$ph$i >> 31;
       $678 = $677 & 2;
       $679 = (($678) + 43)|0;
       $680 = $679&255;
       $681 = ((($estr$1$lcssa$i)) + -1|0);
       HEAP8[$681>>0] = $680;
       $682 = $$114$i&255;
       $683 = ((($estr$1$lcssa$i)) + -2|0);
       HEAP8[$683>>0] = $682;
       $684 = $683;
       $685 = (($8) - ($684))|0;
       $$pn$i = $685;$estr$2$i = $683;
      }
      $686 = (($pl$0$i) + 1)|0;
      $687 = (($686) + ($$311$i))|0;
      $l$1$i = (($687) + ($660))|0;
      $688 = (($l$1$i) + ($$pn$i))|0;
      _pad($f,32,$w$1,$688,$fl$1$);
      $689 = HEAP32[$f>>2]|0;
      $690 = $689 & 32;
      $691 = ($690|0)==(0);
      if ($691) {
       (___fwritex($prefix$0$i,$pl$0$i,$f)|0);
      }
      $692 = $fl$1$ ^ 65536;
      _pad($f,48,$w$1,$688,$692);
      do {
       if ($662) {
        $693 = ($a$8$ph$i>>>0)>($$31$i>>>0);
        $r$0$a$8$i = $693 ? $$31$i : $a$8$ph$i;
        $d$482$i = $r$0$a$8$i;
        while(1) {
         $694 = HEAP32[$d$482$i>>2]|0;
         $695 = (_fmt_u($694,0,$13)|0);
         $696 = ($d$482$i|0)==($r$0$a$8$i|0);
         do {
          if ($696) {
           $700 = ($695|0)==($13|0);
           if (!($700)) {
            $s7$1$i = $695;
            break;
           }
           HEAP8[$15>>0] = 48;
           $s7$1$i = $15;
          } else {
           $697 = ($695>>>0)>($buf$i>>>0);
           if ($697) {
            $s7$079$i = $695;
           } else {
            $s7$1$i = $695;
            break;
           }
           while(1) {
            $698 = ((($s7$079$i)) + -1|0);
            HEAP8[$698>>0] = 48;
            $699 = ($698>>>0)>($buf$i>>>0);
            if ($699) {
             $s7$079$i = $698;
            } else {
             $s7$1$i = $698;
             break;
            }
           }
          }
         } while(0);
         $701 = HEAP32[$f>>2]|0;
         $702 = $701 & 32;
         $703 = ($702|0)==(0);
         if ($703) {
          $704 = $s7$1$i;
          $705 = (($14) - ($704))|0;
          (___fwritex($s7$1$i,$705,$f)|0);
         }
         $706 = ((($d$482$i)) + 4|0);
         $707 = ($706>>>0)>($$31$i>>>0);
         if ($707) {
          $$lcssa339 = $706;
          break;
         } else {
          $d$482$i = $706;
         }
        }
        $708 = ($658|0)==(0);
        do {
         if (!($708)) {
          $709 = HEAP32[$f>>2]|0;
          $710 = $709 & 32;
          $711 = ($710|0)==(0);
          if (!($711)) {
           break;
          }
          (___fwritex(18446,1,$f)|0);
         }
        } while(0);
        $712 = ($$lcssa339>>>0)<($z$6$i$lcssa>>>0);
        $713 = ($$311$i|0)>(0);
        $714 = $713 & $712;
        if ($714) {
         $$41276$i = $$311$i;$d$575$i = $$lcssa339;
         while(1) {
          $715 = HEAP32[$d$575$i>>2]|0;
          $716 = (_fmt_u($715,0,$13)|0);
          $717 = ($716>>>0)>($buf$i>>>0);
          if ($717) {
           $s8$070$i = $716;
           while(1) {
            $718 = ((($s8$070$i)) + -1|0);
            HEAP8[$718>>0] = 48;
            $719 = ($718>>>0)>($buf$i>>>0);
            if ($719) {
             $s8$070$i = $718;
            } else {
             $s8$0$lcssa$i = $718;
             break;
            }
           }
          } else {
           $s8$0$lcssa$i = $716;
          }
          $720 = HEAP32[$f>>2]|0;
          $721 = $720 & 32;
          $722 = ($721|0)==(0);
          if ($722) {
           $723 = ($$41276$i|0)>(9);
           $724 = $723 ? 9 : $$41276$i;
           (___fwritex($s8$0$lcssa$i,$724,$f)|0);
          }
          $725 = ((($d$575$i)) + 4|0);
          $726 = (($$41276$i) + -9)|0;
          $727 = ($725>>>0)<($z$6$i$lcssa>>>0);
          $728 = ($$41276$i|0)>(9);
          $729 = $728 & $727;
          if ($729) {
           $$41276$i = $726;$d$575$i = $725;
          } else {
           $$412$lcssa$i = $726;
           break;
          }
         }
        } else {
         $$412$lcssa$i = $$311$i;
        }
        $730 = (($$412$lcssa$i) + 9)|0;
        _pad($f,48,$730,9,0);
       } else {
        $731 = ((($a$8$ph$i)) + 4|0);
        $z$6$$i = $$lcssa159$i ? $z$6$i$lcssa : $731;
        $732 = ($$311$i|0)>(-1);
        if ($732) {
         $733 = ($$pre$phi184$iZ2D|0)==(0);
         $$587$i = $$311$i;$d$686$i = $a$8$ph$i;
         while(1) {
          $734 = HEAP32[$d$686$i>>2]|0;
          $735 = (_fmt_u($734,0,$13)|0);
          $736 = ($735|0)==($13|0);
          if ($736) {
           HEAP8[$15>>0] = 48;
           $s9$0$i = $15;
          } else {
           $s9$0$i = $735;
          }
          $737 = ($d$686$i|0)==($a$8$ph$i|0);
          do {
           if ($737) {
            $741 = ((($s9$0$i)) + 1|0);
            $742 = HEAP32[$f>>2]|0;
            $743 = $742 & 32;
            $744 = ($743|0)==(0);
            if ($744) {
             (___fwritex($s9$0$i,1,$f)|0);
            }
            $745 = ($$587$i|0)<(1);
            $or$cond29$i = $733 & $745;
            if ($or$cond29$i) {
             $s9$2$i = $741;
             break;
            }
            $746 = HEAP32[$f>>2]|0;
            $747 = $746 & 32;
            $748 = ($747|0)==(0);
            if (!($748)) {
             $s9$2$i = $741;
             break;
            }
            (___fwritex(18446,1,$f)|0);
            $s9$2$i = $741;
           } else {
            $738 = ($s9$0$i>>>0)>($buf$i>>>0);
            if ($738) {
             $s9$183$i = $s9$0$i;
            } else {
             $s9$2$i = $s9$0$i;
             break;
            }
            while(1) {
             $739 = ((($s9$183$i)) + -1|0);
             HEAP8[$739>>0] = 48;
             $740 = ($739>>>0)>($buf$i>>>0);
             if ($740) {
              $s9$183$i = $739;
             } else {
              $s9$2$i = $739;
              break;
             }
            }
           }
          } while(0);
          $749 = $s9$2$i;
          $750 = (($14) - ($749))|0;
          $751 = HEAP32[$f>>2]|0;
          $752 = $751 & 32;
          $753 = ($752|0)==(0);
          if ($753) {
           $754 = ($$587$i|0)>($750|0);
           $755 = $754 ? $750 : $$587$i;
           (___fwritex($s9$2$i,$755,$f)|0);
          }
          $756 = (($$587$i) - ($750))|0;
          $757 = ((($d$686$i)) + 4|0);
          $758 = ($757>>>0)<($z$6$$i>>>0);
          $759 = ($756|0)>(-1);
          $760 = $758 & $759;
          if ($760) {
           $$587$i = $756;$d$686$i = $757;
          } else {
           $$5$lcssa$i = $756;
           break;
          }
         }
        } else {
         $$5$lcssa$i = $$311$i;
        }
        $761 = (($$5$lcssa$i) + 18)|0;
        _pad($f,48,$761,18,0);
        $762 = HEAP32[$f>>2]|0;
        $763 = $762 & 32;
        $764 = ($763|0)==(0);
        if (!($764)) {
         break;
        }
        $765 = $estr$2$i;
        $766 = (($8) - ($765))|0;
        (___fwritex($estr$2$i,$766,$f)|0);
       }
      } while(0);
      $767 = $fl$1$ ^ 8192;
      _pad($f,32,$w$1,$688,$767);
      $768 = ($688|0)<($w$1|0);
      $w$30$i = $768 ? $w$1 : $688;
      $$0$i = $w$30$i;
     } else {
      $376 = $t$0 & 32;
      $377 = ($376|0)!=(0);
      $378 = $377 ? 18430 : 18434;
      $379 = ($$07$i != $$07$i) | (0.0 != 0.0);
      $380 = $377 ? 18438 : 18442;
      $pl$1$i = $379 ? 0 : $pl$0$i;
      $s1$0$i = $379 ? $380 : $378;
      $381 = (($pl$1$i) + 3)|0;
      _pad($f,32,$w$1,$381,$175);
      $382 = HEAP32[$f>>2]|0;
      $383 = $382 & 32;
      $384 = ($383|0)==(0);
      if ($384) {
       (___fwritex($prefix$0$i,$pl$1$i,$f)|0);
       $$pre$i = HEAP32[$f>>2]|0;
       $386 = $$pre$i;
      } else {
       $386 = $382;
      }
      $385 = $386 & 32;
      $387 = ($385|0)==(0);
      if ($387) {
       (___fwritex($s1$0$i,3,$f)|0);
      }
      $388 = $fl$1$ ^ 8192;
      _pad($f,32,$w$1,$381,$388);
      $389 = ($381|0)<($w$1|0);
      $390 = $389 ? $w$1 : $381;
      $$0$i = $390;
     }
    } while(0);
    $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $$0$i;$l10n$0 = $l10n$3;
    continue L1;
    break;
   }
   default: {
    $a$2 = $fmt41;$fl$6 = $fl$1$;$p$5 = $p$0;$pl$2 = 0;$prefix$2 = 18394;$z$2 = $1;
   }
   }
  } while(0);
  L313: do {
   if ((label|0) == 64) {
    label = 0;
    $206 = $arg;
    $207 = $206;
    $208 = HEAP32[$207>>2]|0;
    $209 = (($206) + 4)|0;
    $210 = $209;
    $211 = HEAP32[$210>>2]|0;
    $212 = $t$1 & 32;
    $213 = ($208|0)==(0);
    $214 = ($211|0)==(0);
    $215 = $213 & $214;
    if ($215) {
     $a$0 = $1;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 0;$prefix$1 = 18394;
     label = 77;
    } else {
     $$012$i = $1;$217 = $208;$224 = $211;
     while(1) {
      $216 = $217 & 15;
      $218 = (18378 + ($216)|0);
      $219 = HEAP8[$218>>0]|0;
      $220 = $219&255;
      $221 = $220 | $212;
      $222 = $221&255;
      $223 = ((($$012$i)) + -1|0);
      HEAP8[$223>>0] = $222;
      $225 = (_bitshift64Lshr(($217|0),($224|0),4)|0);
      $226 = tempRet0;
      $227 = ($225|0)==(0);
      $228 = ($226|0)==(0);
      $229 = $227 & $228;
      if ($229) {
       $$lcssa344 = $223;
       break;
      } else {
       $$012$i = $223;$217 = $225;$224 = $226;
      }
     }
     $230 = $arg;
     $231 = $230;
     $232 = HEAP32[$231>>2]|0;
     $233 = (($230) + 4)|0;
     $234 = $233;
     $235 = HEAP32[$234>>2]|0;
     $236 = ($232|0)==(0);
     $237 = ($235|0)==(0);
     $238 = $236 & $237;
     $239 = $fl$3 & 8;
     $240 = ($239|0)==(0);
     $or$cond17 = $240 | $238;
     if ($or$cond17) {
      $a$0 = $$lcssa344;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 0;$prefix$1 = 18394;
      label = 77;
     } else {
      $241 = $t$1 >> 4;
      $242 = (18394 + ($241)|0);
      $a$0 = $$lcssa344;$fl$4 = $fl$3;$p$2 = $p$1;$pl$1 = 2;$prefix$1 = $242;
      label = 77;
     }
    }
   }
   else if ((label|0) == 76) {
    label = 0;
    $288 = (_fmt_u($286,$287,$1)|0);
    $a$0 = $288;$fl$4 = $fl$1$;$p$2 = $p$0;$pl$1 = $pl$0;$prefix$1 = $prefix$0;
    label = 77;
   }
   else if ((label|0) == 82) {
    label = 0;
    $320 = (_memchr($a$1,0,$p$0)|0);
    $321 = ($320|0)==(0|0);
    $322 = $320;
    $323 = $a$1;
    $324 = (($322) - ($323))|0;
    $325 = (($a$1) + ($p$0)|0);
    $z$1 = $321 ? $325 : $320;
    $p$3 = $321 ? $p$0 : $324;
    $a$2 = $a$1;$fl$6 = $175;$p$5 = $p$3;$pl$2 = 0;$prefix$2 = 18394;$z$2 = $z$1;
   }
   else if ((label|0) == 86) {
    label = 0;
    $333 = HEAP32[$arg>>2]|0;
    $i$0114 = 0;$l$1113 = 0;$ws$0115 = $333;
    while(1) {
     $334 = HEAP32[$ws$0115>>2]|0;
     $335 = ($334|0)==(0);
     if ($335) {
      $i$0$lcssa = $i$0114;$l$2 = $l$1113;
      break;
     }
     $336 = (_wctomb($mb,$334)|0);
     $337 = ($336|0)<(0);
     $338 = (($p$4198) - ($i$0114))|0;
     $339 = ($336>>>0)>($338>>>0);
     $or$cond20 = $337 | $339;
     if ($or$cond20) {
      $i$0$lcssa = $i$0114;$l$2 = $336;
      break;
     }
     $340 = ((($ws$0115)) + 4|0);
     $341 = (($336) + ($i$0114))|0;
     $342 = ($p$4198>>>0)>($341>>>0);
     if ($342) {
      $i$0114 = $341;$l$1113 = $336;$ws$0115 = $340;
     } else {
      $i$0$lcssa = $341;$l$2 = $336;
      break;
     }
    }
    $343 = ($l$2|0)<(0);
    if ($343) {
     $$0 = -1;
     break L1;
    }
    _pad($f,32,$w$1,$i$0$lcssa,$fl$1$);
    $344 = ($i$0$lcssa|0)==(0);
    if ($344) {
     $i$0$lcssa200 = 0;
     label = 98;
    } else {
     $345 = HEAP32[$arg>>2]|0;
     $i$1125 = 0;$ws$1126 = $345;
     while(1) {
      $346 = HEAP32[$ws$1126>>2]|0;
      $347 = ($346|0)==(0);
      if ($347) {
       $i$0$lcssa200 = $i$0$lcssa;
       label = 98;
       break L313;
      }
      $348 = ((($ws$1126)) + 4|0);
      $349 = (_wctomb($mb,$346)|0);
      $350 = (($349) + ($i$1125))|0;
      $351 = ($350|0)>($i$0$lcssa|0);
      if ($351) {
       $i$0$lcssa200 = $i$0$lcssa;
       label = 98;
       break L313;
      }
      $352 = HEAP32[$f>>2]|0;
      $353 = $352 & 32;
      $354 = ($353|0)==(0);
      if ($354) {
       (___fwritex($mb,$349,$f)|0);
      }
      $355 = ($350>>>0)<($i$0$lcssa>>>0);
      if ($355) {
       $i$1125 = $350;$ws$1126 = $348;
      } else {
       $i$0$lcssa200 = $i$0$lcssa;
       label = 98;
       break;
      }
     }
    }
   }
  } while(0);
  if ((label|0) == 98) {
   label = 0;
   $356 = $fl$1$ ^ 8192;
   _pad($f,32,$w$1,$i$0$lcssa200,$356);
   $357 = ($w$1|0)>($i$0$lcssa200|0);
   $358 = $357 ? $w$1 : $i$0$lcssa200;
   $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $358;$l10n$0 = $l10n$3;
   continue;
  }
  if ((label|0) == 77) {
   label = 0;
   $289 = ($p$2|0)>(-1);
   $290 = $fl$4 & -65537;
   $$fl$4 = $289 ? $290 : $fl$4;
   $291 = $arg;
   $292 = $291;
   $293 = HEAP32[$292>>2]|0;
   $294 = (($291) + 4)|0;
   $295 = $294;
   $296 = HEAP32[$295>>2]|0;
   $297 = ($293|0)!=(0);
   $298 = ($296|0)!=(0);
   $299 = $297 | $298;
   $300 = ($p$2|0)!=(0);
   $or$cond = $300 | $299;
   if ($or$cond) {
    $301 = $a$0;
    $302 = (($2) - ($301))|0;
    $303 = $299&1;
    $304 = $303 ^ 1;
    $305 = (($304) + ($302))|0;
    $306 = ($p$2|0)>($305|0);
    $p$2$ = $306 ? $p$2 : $305;
    $a$2 = $a$0;$fl$6 = $$fl$4;$p$5 = $p$2$;$pl$2 = $pl$1;$prefix$2 = $prefix$1;$z$2 = $1;
   } else {
    $a$2 = $1;$fl$6 = $$fl$4;$p$5 = 0;$pl$2 = $pl$1;$prefix$2 = $prefix$1;$z$2 = $1;
   }
  }
  $769 = $z$2;
  $770 = $a$2;
  $771 = (($769) - ($770))|0;
  $772 = ($p$5|0)<($771|0);
  $$p$5 = $772 ? $771 : $p$5;
  $773 = (($pl$2) + ($$p$5))|0;
  $774 = ($w$1|0)<($773|0);
  $w$2 = $774 ? $773 : $w$1;
  _pad($f,32,$w$2,$773,$fl$6);
  $775 = HEAP32[$f>>2]|0;
  $776 = $775 & 32;
  $777 = ($776|0)==(0);
  if ($777) {
   (___fwritex($prefix$2,$pl$2,$f)|0);
  }
  $778 = $fl$6 ^ 65536;
  _pad($f,48,$w$2,$773,$778);
  _pad($f,48,$$p$5,$771,0);
  $779 = HEAP32[$f>>2]|0;
  $780 = $779 & 32;
  $781 = ($780|0)==(0);
  if ($781) {
   (___fwritex($a$2,$771,$f)|0);
  }
  $782 = $fl$6 ^ 8192;
  _pad($f,32,$w$2,$773,$782);
  $cnt$0 = $cnt$1;$fmt41 = $$lcssa323;$l$0 = $w$2;$l10n$0 = $l10n$3;
 }
 L348: do {
  if ((label|0) == 245) {
   $783 = ($f|0)==(0|0);
   if ($783) {
    $784 = ($l10n$0$lcssa|0)==(0);
    if ($784) {
     $$0 = 0;
    } else {
     $i$2100 = 1;
     while(1) {
      $785 = (($nl_type) + ($i$2100<<2)|0);
      $786 = HEAP32[$785>>2]|0;
      $787 = ($786|0)==(0);
      if ($787) {
       $i$2100$lcssa = $i$2100;
       break;
      }
      $789 = (($nl_arg) + ($i$2100<<3)|0);
      _pop_arg($789,$786,$ap);
      $790 = (($i$2100) + 1)|0;
      $791 = ($790|0)<(10);
      if ($791) {
       $i$2100 = $790;
      } else {
       $$0 = 1;
       break L348;
      }
     }
     $788 = ($i$2100$lcssa|0)<(10);
     if ($788) {
      $i$398 = $i$2100$lcssa;
      while(1) {
       $794 = (($nl_type) + ($i$398<<2)|0);
       $795 = HEAP32[$794>>2]|0;
       $796 = ($795|0)==(0);
       $792 = (($i$398) + 1)|0;
       if (!($796)) {
        $$0 = -1;
        break L348;
       }
       $793 = ($792|0)<(10);
       if ($793) {
        $i$398 = $792;
       } else {
        $$0 = 1;
        break;
       }
      }
     } else {
      $$0 = 1;
     }
    }
   } else {
    $$0 = $cnt$1$lcssa;
   }
  }
 } while(0);
 STACKTOP = sp;return ($$0|0);
}
function _cleanup526($p) {
 $p = $p|0;
 var $0 = 0, $1 = 0, $2 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ((($p)) + 68|0);
 $1 = HEAP32[$0>>2]|0;
 $2 = ($1|0)==(0);
 if ($2) {
  ___unlockfile($p);
 }
 return;
}
function _pop_arg($arg,$type,$ap) {
 $arg = $arg|0;
 $type = $type|0;
 $ap = $ap|0;
 var $$mask = 0, $$mask1 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0, $105 = 0, $106 = 0.0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0.0;
 var $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0, $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0;
 var $30 = 0, $31 = 0, $32 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0;
 var $49 = 0, $5 = 0, $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0;
 var $67 = 0, $68 = 0, $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0;
 var $85 = 0, $86 = 0, $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $arglist_current = 0, $arglist_current11 = 0, $arglist_current14 = 0, $arglist_current17 = 0;
 var $arglist_current2 = 0, $arglist_current20 = 0, $arglist_current23 = 0, $arglist_current26 = 0, $arglist_current5 = 0, $arglist_current8 = 0, $arglist_next = 0, $arglist_next12 = 0, $arglist_next15 = 0, $arglist_next18 = 0, $arglist_next21 = 0, $arglist_next24 = 0, $arglist_next27 = 0, $arglist_next3 = 0, $arglist_next6 = 0, $arglist_next9 = 0, $expanded = 0, $expanded28 = 0, $expanded30 = 0, $expanded31 = 0;
 var $expanded32 = 0, $expanded34 = 0, $expanded35 = 0, $expanded37 = 0, $expanded38 = 0, $expanded39 = 0, $expanded41 = 0, $expanded42 = 0, $expanded44 = 0, $expanded45 = 0, $expanded46 = 0, $expanded48 = 0, $expanded49 = 0, $expanded51 = 0, $expanded52 = 0, $expanded53 = 0, $expanded55 = 0, $expanded56 = 0, $expanded58 = 0, $expanded59 = 0;
 var $expanded60 = 0, $expanded62 = 0, $expanded63 = 0, $expanded65 = 0, $expanded66 = 0, $expanded67 = 0, $expanded69 = 0, $expanded70 = 0, $expanded72 = 0, $expanded73 = 0, $expanded74 = 0, $expanded76 = 0, $expanded77 = 0, $expanded79 = 0, $expanded80 = 0, $expanded81 = 0, $expanded83 = 0, $expanded84 = 0, $expanded86 = 0, $expanded87 = 0;
 var $expanded88 = 0, $expanded90 = 0, $expanded91 = 0, $expanded93 = 0, $expanded94 = 0, $expanded95 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($type>>>0)>(20);
 L1: do {
  if (!($0)) {
   do {
    switch ($type|0) {
    case 9:  {
     $arglist_current = HEAP32[$ap>>2]|0;
     $1 = $arglist_current;
     $2 = ((0) + 4|0);
     $expanded28 = $2;
     $expanded = (($expanded28) - 1)|0;
     $3 = (($1) + ($expanded))|0;
     $4 = ((0) + 4|0);
     $expanded32 = $4;
     $expanded31 = (($expanded32) - 1)|0;
     $expanded30 = $expanded31 ^ -1;
     $5 = $3 & $expanded30;
     $6 = $5;
     $7 = HEAP32[$6>>2]|0;
     $arglist_next = ((($6)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next;
     HEAP32[$arg>>2] = $7;
     break L1;
     break;
    }
    case 10:  {
     $arglist_current2 = HEAP32[$ap>>2]|0;
     $8 = $arglist_current2;
     $9 = ((0) + 4|0);
     $expanded35 = $9;
     $expanded34 = (($expanded35) - 1)|0;
     $10 = (($8) + ($expanded34))|0;
     $11 = ((0) + 4|0);
     $expanded39 = $11;
     $expanded38 = (($expanded39) - 1)|0;
     $expanded37 = $expanded38 ^ -1;
     $12 = $10 & $expanded37;
     $13 = $12;
     $14 = HEAP32[$13>>2]|0;
     $arglist_next3 = ((($13)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next3;
     $15 = ($14|0)<(0);
     $16 = $15 << 31 >> 31;
     $17 = $arg;
     $18 = $17;
     HEAP32[$18>>2] = $14;
     $19 = (($17) + 4)|0;
     $20 = $19;
     HEAP32[$20>>2] = $16;
     break L1;
     break;
    }
    case 11:  {
     $arglist_current5 = HEAP32[$ap>>2]|0;
     $21 = $arglist_current5;
     $22 = ((0) + 4|0);
     $expanded42 = $22;
     $expanded41 = (($expanded42) - 1)|0;
     $23 = (($21) + ($expanded41))|0;
     $24 = ((0) + 4|0);
     $expanded46 = $24;
     $expanded45 = (($expanded46) - 1)|0;
     $expanded44 = $expanded45 ^ -1;
     $25 = $23 & $expanded44;
     $26 = $25;
     $27 = HEAP32[$26>>2]|0;
     $arglist_next6 = ((($26)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next6;
     $28 = $arg;
     $29 = $28;
     HEAP32[$29>>2] = $27;
     $30 = (($28) + 4)|0;
     $31 = $30;
     HEAP32[$31>>2] = 0;
     break L1;
     break;
    }
    case 12:  {
     $arglist_current8 = HEAP32[$ap>>2]|0;
     $32 = $arglist_current8;
     $33 = ((0) + 8|0);
     $expanded49 = $33;
     $expanded48 = (($expanded49) - 1)|0;
     $34 = (($32) + ($expanded48))|0;
     $35 = ((0) + 8|0);
     $expanded53 = $35;
     $expanded52 = (($expanded53) - 1)|0;
     $expanded51 = $expanded52 ^ -1;
     $36 = $34 & $expanded51;
     $37 = $36;
     $38 = $37;
     $39 = $38;
     $40 = HEAP32[$39>>2]|0;
     $41 = (($38) + 4)|0;
     $42 = $41;
     $43 = HEAP32[$42>>2]|0;
     $arglist_next9 = ((($37)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next9;
     $44 = $arg;
     $45 = $44;
     HEAP32[$45>>2] = $40;
     $46 = (($44) + 4)|0;
     $47 = $46;
     HEAP32[$47>>2] = $43;
     break L1;
     break;
    }
    case 13:  {
     $arglist_current11 = HEAP32[$ap>>2]|0;
     $48 = $arglist_current11;
     $49 = ((0) + 4|0);
     $expanded56 = $49;
     $expanded55 = (($expanded56) - 1)|0;
     $50 = (($48) + ($expanded55))|0;
     $51 = ((0) + 4|0);
     $expanded60 = $51;
     $expanded59 = (($expanded60) - 1)|0;
     $expanded58 = $expanded59 ^ -1;
     $52 = $50 & $expanded58;
     $53 = $52;
     $54 = HEAP32[$53>>2]|0;
     $arglist_next12 = ((($53)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next12;
     $55 = $54&65535;
     $56 = $55 << 16 >> 16;
     $57 = ($56|0)<(0);
     $58 = $57 << 31 >> 31;
     $59 = $arg;
     $60 = $59;
     HEAP32[$60>>2] = $56;
     $61 = (($59) + 4)|0;
     $62 = $61;
     HEAP32[$62>>2] = $58;
     break L1;
     break;
    }
    case 14:  {
     $arglist_current14 = HEAP32[$ap>>2]|0;
     $63 = $arglist_current14;
     $64 = ((0) + 4|0);
     $expanded63 = $64;
     $expanded62 = (($expanded63) - 1)|0;
     $65 = (($63) + ($expanded62))|0;
     $66 = ((0) + 4|0);
     $expanded67 = $66;
     $expanded66 = (($expanded67) - 1)|0;
     $expanded65 = $expanded66 ^ -1;
     $67 = $65 & $expanded65;
     $68 = $67;
     $69 = HEAP32[$68>>2]|0;
     $arglist_next15 = ((($68)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next15;
     $$mask1 = $69 & 65535;
     $70 = $arg;
     $71 = $70;
     HEAP32[$71>>2] = $$mask1;
     $72 = (($70) + 4)|0;
     $73 = $72;
     HEAP32[$73>>2] = 0;
     break L1;
     break;
    }
    case 15:  {
     $arglist_current17 = HEAP32[$ap>>2]|0;
     $74 = $arglist_current17;
     $75 = ((0) + 4|0);
     $expanded70 = $75;
     $expanded69 = (($expanded70) - 1)|0;
     $76 = (($74) + ($expanded69))|0;
     $77 = ((0) + 4|0);
     $expanded74 = $77;
     $expanded73 = (($expanded74) - 1)|0;
     $expanded72 = $expanded73 ^ -1;
     $78 = $76 & $expanded72;
     $79 = $78;
     $80 = HEAP32[$79>>2]|0;
     $arglist_next18 = ((($79)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next18;
     $81 = $80&255;
     $82 = $81 << 24 >> 24;
     $83 = ($82|0)<(0);
     $84 = $83 << 31 >> 31;
     $85 = $arg;
     $86 = $85;
     HEAP32[$86>>2] = $82;
     $87 = (($85) + 4)|0;
     $88 = $87;
     HEAP32[$88>>2] = $84;
     break L1;
     break;
    }
    case 16:  {
     $arglist_current20 = HEAP32[$ap>>2]|0;
     $89 = $arglist_current20;
     $90 = ((0) + 4|0);
     $expanded77 = $90;
     $expanded76 = (($expanded77) - 1)|0;
     $91 = (($89) + ($expanded76))|0;
     $92 = ((0) + 4|0);
     $expanded81 = $92;
     $expanded80 = (($expanded81) - 1)|0;
     $expanded79 = $expanded80 ^ -1;
     $93 = $91 & $expanded79;
     $94 = $93;
     $95 = HEAP32[$94>>2]|0;
     $arglist_next21 = ((($94)) + 4|0);
     HEAP32[$ap>>2] = $arglist_next21;
     $$mask = $95 & 255;
     $96 = $arg;
     $97 = $96;
     HEAP32[$97>>2] = $$mask;
     $98 = (($96) + 4)|0;
     $99 = $98;
     HEAP32[$99>>2] = 0;
     break L1;
     break;
    }
    case 17:  {
     $arglist_current23 = HEAP32[$ap>>2]|0;
     $100 = $arglist_current23;
     $101 = ((0) + 8|0);
     $expanded84 = $101;
     $expanded83 = (($expanded84) - 1)|0;
     $102 = (($100) + ($expanded83))|0;
     $103 = ((0) + 8|0);
     $expanded88 = $103;
     $expanded87 = (($expanded88) - 1)|0;
     $expanded86 = $expanded87 ^ -1;
     $104 = $102 & $expanded86;
     $105 = $104;
     $106 = +HEAPF64[$105>>3];
     $arglist_next24 = ((($105)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next24;
     HEAPF64[$arg>>3] = $106;
     break L1;
     break;
    }
    case 18:  {
     $arglist_current26 = HEAP32[$ap>>2]|0;
     $107 = $arglist_current26;
     $108 = ((0) + 8|0);
     $expanded91 = $108;
     $expanded90 = (($expanded91) - 1)|0;
     $109 = (($107) + ($expanded90))|0;
     $110 = ((0) + 8|0);
     $expanded95 = $110;
     $expanded94 = (($expanded95) - 1)|0;
     $expanded93 = $expanded94 ^ -1;
     $111 = $109 & $expanded93;
     $112 = $111;
     $113 = +HEAPF64[$112>>3];
     $arglist_next27 = ((($112)) + 8|0);
     HEAP32[$ap>>2] = $arglist_next27;
     HEAPF64[$arg>>3] = $113;
     break L1;
     break;
    }
    default: {
     break L1;
    }
    }
   } while(0);
  }
 } while(0);
 return;
}
function _fmt_u($0,$1,$s) {
 $0 = $0|0;
 $1 = $1|0;
 $s = $s|0;
 var $$0$lcssa = 0, $$01$lcssa$off0 = 0, $$05 = 0, $$1$lcssa = 0, $$12 = 0, $$lcssa20 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $19 = 0, $2 = 0, $20 = 0, $21 = 0, $22 = 0;
 var $23 = 0, $24 = 0, $25 = 0, $26 = 0, $27 = 0, $28 = 0, $29 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0, $8 = 0, $9 = 0, $y$03 = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $2 = ($1>>>0)>(0);
 $3 = ($0>>>0)>(4294967295);
 $4 = ($1|0)==(0);
 $5 = $4 & $3;
 $6 = $2 | $5;
 if ($6) {
  $$05 = $s;$7 = $0;$8 = $1;
  while(1) {
   $9 = (___uremdi3(($7|0),($8|0),10,0)|0);
   $10 = tempRet0;
   $11 = $9 | 48;
   $12 = $11&255;
   $13 = ((($$05)) + -1|0);
   HEAP8[$13>>0] = $12;
   $14 = (___udivdi3(($7|0),($8|0),10,0)|0);
   $15 = tempRet0;
   $16 = ($8>>>0)>(9);
   $17 = ($7>>>0)>(4294967295);
   $18 = ($8|0)==(9);
   $19 = $18 & $17;
   $20 = $16 | $19;
   if ($20) {
    $$05 = $13;$7 = $14;$8 = $15;
   } else {
    $$lcssa20 = $13;$28 = $14;$29 = $15;
    break;
   }
  }
  $$0$lcssa = $$lcssa20;$$01$lcssa$off0 = $28;
 } else {
  $$0$lcssa = $s;$$01$lcssa$off0 = $0;
 }
 $21 = ($$01$lcssa$off0|0)==(0);
 if ($21) {
  $$1$lcssa = $$0$lcssa;
 } else {
  $$12 = $$0$lcssa;$y$03 = $$01$lcssa$off0;
  while(1) {
   $22 = (($y$03>>>0) % 10)&-1;
   $23 = $22 | 48;
   $24 = $23&255;
   $25 = ((($$12)) + -1|0);
   HEAP8[$25>>0] = $24;
   $26 = (($y$03>>>0) / 10)&-1;
   $27 = ($y$03>>>0)<(10);
   if ($27) {
    $$1$lcssa = $25;
    break;
   } else {
    $$12 = $25;$y$03 = $26;
   }
  }
 }
 return ($$1$lcssa|0);
}
function _pad($f,$c,$w,$l,$fl) {
 $f = $f|0;
 $c = $c|0;
 $w = $w|0;
 $l = $l|0;
 $fl = $fl|0;
 var $$0$lcssa6 = 0, $$02 = 0, $$pre = 0, $0 = 0, $1 = 0, $10 = 0, $11 = 0, $12 = 0, $13 = 0, $14 = 0, $15 = 0, $16 = 0, $17 = 0, $18 = 0, $2 = 0, $3 = 0, $4 = 0, $5 = 0, $6 = 0, $7 = 0;
 var $8 = 0, $9 = 0, $or$cond = 0, $pad = 0, label = 0, sp = 0;
 sp = STACKTOP;
 STACKTOP = STACKTOP + 256|0; if ((STACKTOP|0) >= (STACK_MAX|0)) abort();
 $pad = sp;
 $0 = $fl & 73728;
 $1 = ($0|0)==(0);
 $2 = ($w|0)>($l|0);
 $or$cond = $2 & $1;
 do {
  if ($or$cond) {
   $3 = (($w) - ($l))|0;
   $4 = ($3>>>0)>(256);
   $5 = $4 ? 256 : $3;
   _memset(($pad|0),($c|0),($5|0))|0;
   $6 = ($3>>>0)>(255);
   $7 = HEAP32[$f>>2]|0;
   $8 = $7 & 32;
   $9 = ($8|0)==(0);
   if ($6) {
    $10 = (($w) - ($l))|0;
    $$02 = $3;$17 = $7;$18 = $9;
    while(1) {
     if ($18) {
      (___fwritex($pad,256,$f)|0);
      $$pre = HEAP32[$f>>2]|0;
      $14 = $$pre;
     } else {
      $14 = $17;
     }
     $11 = (($$02) + -256)|0;
     $12 = ($11>>>0)>(255);
     $13 = $14 & 32;
     $15 = ($13|0)==(0);
     if ($12) {
      $$02 = $11;$17 = $14;$18 = $15;
     } else {
      break;
     }
    }
    $16 = $10 & 255;
    if ($15) {
     $$0$lcssa6 = $16;
    } else {
     break;
    }
   } else {
    if ($9) {
     $$0$lcssa6 = $3;
    } else {
     break;
    }
   }
   (___fwritex($pad,$$0$lcssa6,$f)|0);
  }
 } while(0);
 STACKTOP = sp;return;
}
function _malloc($bytes) {
 $bytes = $bytes|0;
 var $$3$i = 0, $$lcssa = 0, $$lcssa211 = 0, $$lcssa215 = 0, $$lcssa216 = 0, $$lcssa217 = 0, $$lcssa219 = 0, $$lcssa222 = 0, $$lcssa224 = 0, $$lcssa226 = 0, $$lcssa228 = 0, $$lcssa230 = 0, $$lcssa232 = 0, $$pre = 0, $$pre$i = 0, $$pre$i$i = 0, $$pre$i22$i = 0, $$pre$i25 = 0, $$pre$phi$i$iZ2D = 0, $$pre$phi$i23$iZ2D = 0;
 var $$pre$phi$i26Z2D = 0, $$pre$phi$iZ2D = 0, $$pre$phi58$i$iZ2D = 0, $$pre$phiZ2D = 0, $$pre105 = 0, $$pre106 = 0, $$pre14$i$i = 0, $$pre43$i = 0, $$pre56$i$i = 0, $$pre57$i$i = 0, $$pre8$i = 0, $$rsize$0$i = 0, $$rsize$3$i = 0, $$sum = 0, $$sum$i$i = 0, $$sum$i$i$i = 0, $$sum$i13$i = 0, $$sum$i14$i = 0, $$sum$i17$i = 0, $$sum$i19$i = 0;
 var $$sum$i2334 = 0, $$sum$i32 = 0, $$sum$i35 = 0, $$sum1 = 0, $$sum1$i = 0, $$sum1$i$i = 0, $$sum1$i15$i = 0, $$sum1$i20$i = 0, $$sum1$i24 = 0, $$sum10 = 0, $$sum10$i = 0, $$sum10$i$i = 0, $$sum11$i = 0, $$sum11$i$i = 0, $$sum1112 = 0, $$sum112$i = 0, $$sum113$i = 0, $$sum114$i = 0, $$sum115$i = 0, $$sum116$i = 0;
 var $$sum117$i = 0, $$sum118$i = 0, $$sum119$i = 0, $$sum12$i = 0, $$sum12$i$i = 0, $$sum120$i = 0, $$sum121$i = 0, $$sum122$i = 0, $$sum123$i = 0, $$sum124$i = 0, $$sum125$i = 0, $$sum13$i = 0, $$sum13$i$i = 0, $$sum14$i$i = 0, $$sum15$i = 0, $$sum15$i$i = 0, $$sum16$i = 0, $$sum16$i$i = 0, $$sum17$i = 0, $$sum17$i$i = 0;
 var $$sum18$i = 0, $$sum1819$i$i = 0, $$sum2 = 0, $$sum2$i = 0, $$sum2$i$i = 0, $$sum2$i$i$i = 0, $$sum2$i16$i = 0, $$sum2$i18$i = 0, $$sum2$i21$i = 0, $$sum20$i$i = 0, $$sum21$i$i = 0, $$sum22$i$i = 0, $$sum23$i$i = 0, $$sum24$i$i = 0, $$sum25$i$i = 0, $$sum27$i$i = 0, $$sum28$i$i = 0, $$sum29$i$i = 0, $$sum3$i = 0, $$sum3$i27 = 0;
 var $$sum30$i$i = 0, $$sum3132$i$i = 0, $$sum34$i$i = 0, $$sum3536$i$i = 0, $$sum3738$i$i = 0, $$sum39$i$i = 0, $$sum4 = 0, $$sum4$i = 0, $$sum4$i$i = 0, $$sum4$i28 = 0, $$sum40$i$i = 0, $$sum41$i$i = 0, $$sum42$i$i = 0, $$sum5$i = 0, $$sum5$i$i = 0, $$sum56 = 0, $$sum6$i = 0, $$sum67$i$i = 0, $$sum7$i = 0, $$sum8$i = 0;
 var $$sum9 = 0, $$sum9$i = 0, $$sum9$i$i = 0, $$tsize$1$i = 0, $$v$0$i = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $1000 = 0, $1001 = 0, $1002 = 0, $1003 = 0, $1004 = 0, $1005 = 0, $1006 = 0, $1007 = 0, $1008 = 0, $1009 = 0, $101 = 0;
 var $1010 = 0, $1011 = 0, $1012 = 0, $1013 = 0, $1014 = 0, $1015 = 0, $1016 = 0, $1017 = 0, $1018 = 0, $1019 = 0, $102 = 0, $1020 = 0, $1021 = 0, $1022 = 0, $1023 = 0, $1024 = 0, $1025 = 0, $1026 = 0, $1027 = 0, $1028 = 0;
 var $1029 = 0, $103 = 0, $1030 = 0, $1031 = 0, $1032 = 0, $1033 = 0, $1034 = 0, $1035 = 0, $1036 = 0, $1037 = 0, $1038 = 0, $1039 = 0, $104 = 0, $1040 = 0, $1041 = 0, $1042 = 0, $1043 = 0, $1044 = 0, $1045 = 0, $1046 = 0;
 var $1047 = 0, $1048 = 0, $1049 = 0, $105 = 0, $1050 = 0, $1051 = 0, $1052 = 0, $1053 = 0, $1054 = 0, $1055 = 0, $1056 = 0, $1057 = 0, $1058 = 0, $1059 = 0, $106 = 0, $1060 = 0, $1061 = 0, $1062 = 0, $1063 = 0, $1064 = 0;
 var $1065 = 0, $1066 = 0, $1067 = 0, $1068 = 0, $1069 = 0, $107 = 0, $1070 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0;
 var $12 = 0, $120 = 0, $121 = 0, $122 = 0, $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0;
 var $138 = 0, $139 = 0, $14 = 0, $140 = 0, $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0;
 var $156 = 0, $157 = 0, $158 = 0, $159 = 0, $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0;
 var $174 = 0, $175 = 0, $176 = 0, $177 = 0, $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0;
 var $192 = 0, $193 = 0, $194 = 0, $195 = 0, $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0;
 var $21 = 0, $210 = 0, $211 = 0, $212 = 0, $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0;
 var $228 = 0, $229 = 0, $23 = 0, $230 = 0, $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0;
 var $246 = 0, $247 = 0, $248 = 0, $249 = 0, $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0;
 var $264 = 0, $265 = 0, $266 = 0, $267 = 0, $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0;
 var $282 = 0, $283 = 0, $284 = 0, $285 = 0, $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0;
 var $30 = 0, $300 = 0, $301 = 0, $302 = 0, $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0;
 var $318 = 0, $319 = 0, $32 = 0, $320 = 0, $321 = 0, $322 = 0, $323 = 0, $324 = 0, $325 = 0, $326 = 0, $327 = 0, $328 = 0, $329 = 0, $33 = 0, $330 = 0, $331 = 0, $332 = 0, $333 = 0, $334 = 0, $335 = 0;
 var $336 = 0, $337 = 0, $338 = 0, $339 = 0, $34 = 0, $340 = 0, $341 = 0, $342 = 0, $343 = 0, $344 = 0, $345 = 0, $346 = 0, $347 = 0, $348 = 0, $349 = 0, $35 = 0, $350 = 0, $351 = 0, $352 = 0, $353 = 0;
 var $354 = 0, $355 = 0, $356 = 0, $357 = 0, $358 = 0, $359 = 0, $36 = 0, $360 = 0, $361 = 0, $362 = 0, $363 = 0, $364 = 0, $365 = 0, $366 = 0, $367 = 0, $368 = 0, $369 = 0, $37 = 0, $370 = 0, $371 = 0;
 var $372 = 0, $373 = 0, $374 = 0, $375 = 0, $376 = 0, $377 = 0, $378 = 0, $379 = 0, $38 = 0, $380 = 0, $381 = 0, $382 = 0, $383 = 0, $384 = 0, $385 = 0, $386 = 0, $387 = 0, $388 = 0, $389 = 0, $39 = 0;
 var $390 = 0, $391 = 0, $392 = 0, $393 = 0, $394 = 0, $395 = 0, $396 = 0, $397 = 0, $398 = 0, $399 = 0, $4 = 0, $40 = 0, $400 = 0, $401 = 0, $402 = 0, $403 = 0, $404 = 0, $405 = 0, $406 = 0, $407 = 0;
 var $408 = 0, $409 = 0, $41 = 0, $410 = 0, $411 = 0, $412 = 0, $413 = 0, $414 = 0, $415 = 0, $416 = 0, $417 = 0, $418 = 0, $419 = 0, $42 = 0, $420 = 0, $421 = 0, $422 = 0, $423 = 0, $424 = 0, $425 = 0;
 var $426 = 0, $427 = 0, $428 = 0, $429 = 0, $43 = 0, $430 = 0, $431 = 0, $432 = 0, $433 = 0, $434 = 0, $435 = 0, $436 = 0, $437 = 0, $438 = 0, $439 = 0, $44 = 0, $440 = 0, $441 = 0, $442 = 0, $443 = 0;
 var $444 = 0, $445 = 0, $446 = 0, $447 = 0, $448 = 0, $449 = 0, $45 = 0, $450 = 0, $451 = 0, $452 = 0, $453 = 0, $454 = 0, $455 = 0, $456 = 0, $457 = 0, $458 = 0, $459 = 0, $46 = 0, $460 = 0, $461 = 0;
 var $462 = 0, $463 = 0, $464 = 0, $465 = 0, $466 = 0, $467 = 0, $468 = 0, $469 = 0, $47 = 0, $470 = 0, $471 = 0, $472 = 0, $473 = 0, $474 = 0, $475 = 0, $476 = 0, $477 = 0, $478 = 0, $479 = 0, $48 = 0;
 var $480 = 0, $481 = 0, $482 = 0, $483 = 0, $484 = 0, $485 = 0, $486 = 0, $487 = 0, $488 = 0, $489 = 0, $49 = 0, $490 = 0, $491 = 0, $492 = 0, $493 = 0, $494 = 0, $495 = 0, $496 = 0, $497 = 0, $498 = 0;
 var $499 = 0, $5 = 0, $50 = 0, $500 = 0, $501 = 0, $502 = 0, $503 = 0, $504 = 0, $505 = 0, $506 = 0, $507 = 0, $508 = 0, $509 = 0, $51 = 0, $510 = 0, $511 = 0, $512 = 0, $513 = 0, $514 = 0, $515 = 0;
 var $516 = 0, $517 = 0, $518 = 0, $519 = 0, $52 = 0, $520 = 0, $521 = 0, $522 = 0, $523 = 0, $524 = 0, $525 = 0, $526 = 0, $527 = 0, $528 = 0, $529 = 0, $53 = 0, $530 = 0, $531 = 0, $532 = 0, $533 = 0;
 var $534 = 0, $535 = 0, $536 = 0, $537 = 0, $538 = 0, $539 = 0, $54 = 0, $540 = 0, $541 = 0, $542 = 0, $543 = 0, $544 = 0, $545 = 0, $546 = 0, $547 = 0, $548 = 0, $549 = 0, $55 = 0, $550 = 0, $551 = 0;
 var $552 = 0, $553 = 0, $554 = 0, $555 = 0, $556 = 0, $557 = 0, $558 = 0, $559 = 0, $56 = 0, $560 = 0, $561 = 0, $562 = 0, $563 = 0, $564 = 0, $565 = 0, $566 = 0, $567 = 0, $568 = 0, $569 = 0, $57 = 0;
 var $570 = 0, $571 = 0, $572 = 0, $573 = 0, $574 = 0, $575 = 0, $576 = 0, $577 = 0, $578 = 0, $579 = 0, $58 = 0, $580 = 0, $581 = 0, $582 = 0, $583 = 0, $584 = 0, $585 = 0, $586 = 0, $587 = 0, $588 = 0;
 var $589 = 0, $59 = 0, $590 = 0, $591 = 0, $592 = 0, $593 = 0, $594 = 0, $595 = 0, $596 = 0, $597 = 0, $598 = 0, $599 = 0, $6 = 0, $60 = 0, $600 = 0, $601 = 0, $602 = 0, $603 = 0, $604 = 0, $605 = 0;
 var $606 = 0, $607 = 0, $608 = 0, $609 = 0, $61 = 0, $610 = 0, $611 = 0, $612 = 0, $613 = 0, $614 = 0, $615 = 0, $616 = 0, $617 = 0, $618 = 0, $619 = 0, $62 = 0, $620 = 0, $621 = 0, $622 = 0, $623 = 0;
 var $624 = 0, $625 = 0, $626 = 0, $627 = 0, $628 = 0, $629 = 0, $63 = 0, $630 = 0, $631 = 0, $632 = 0, $633 = 0, $634 = 0, $635 = 0, $636 = 0, $637 = 0, $638 = 0, $639 = 0, $64 = 0, $640 = 0, $641 = 0;
 var $642 = 0, $643 = 0, $644 = 0, $645 = 0, $646 = 0, $647 = 0, $648 = 0, $649 = 0, $65 = 0, $650 = 0, $651 = 0, $652 = 0, $653 = 0, $654 = 0, $655 = 0, $656 = 0, $657 = 0, $658 = 0, $659 = 0, $66 = 0;
 var $660 = 0, $661 = 0, $662 = 0, $663 = 0, $664 = 0, $665 = 0, $666 = 0, $667 = 0, $668 = 0, $669 = 0, $67 = 0, $670 = 0, $671 = 0, $672 = 0, $673 = 0, $674 = 0, $675 = 0, $676 = 0, $677 = 0, $678 = 0;
 var $679 = 0, $68 = 0, $680 = 0, $681 = 0, $682 = 0, $683 = 0, $684 = 0, $685 = 0, $686 = 0, $687 = 0, $688 = 0, $689 = 0, $69 = 0, $690 = 0, $691 = 0, $692 = 0, $693 = 0, $694 = 0, $695 = 0, $696 = 0;
 var $697 = 0, $698 = 0, $699 = 0, $7 = 0, $70 = 0, $700 = 0, $701 = 0, $702 = 0, $703 = 0, $704 = 0, $705 = 0, $706 = 0, $707 = 0, $708 = 0, $709 = 0, $71 = 0, $710 = 0, $711 = 0, $712 = 0, $713 = 0;
 var $714 = 0, $715 = 0, $716 = 0, $717 = 0, $718 = 0, $719 = 0, $72 = 0, $720 = 0, $721 = 0, $722 = 0, $723 = 0, $724 = 0, $725 = 0, $726 = 0, $727 = 0, $728 = 0, $729 = 0, $73 = 0, $730 = 0, $731 = 0;
 var $732 = 0, $733 = 0, $734 = 0, $735 = 0, $736 = 0, $737 = 0, $738 = 0, $739 = 0, $74 = 0, $740 = 0, $741 = 0, $742 = 0, $743 = 0, $744 = 0, $745 = 0, $746 = 0, $747 = 0, $748 = 0, $749 = 0, $75 = 0;
 var $750 = 0, $751 = 0, $752 = 0, $753 = 0, $754 = 0, $755 = 0, $756 = 0, $757 = 0, $758 = 0, $759 = 0, $76 = 0, $760 = 0, $761 = 0, $762 = 0, $763 = 0, $764 = 0, $765 = 0, $766 = 0, $767 = 0, $768 = 0;
 var $769 = 0, $77 = 0, $770 = 0, $771 = 0, $772 = 0, $773 = 0, $774 = 0, $775 = 0, $776 = 0, $777 = 0, $778 = 0, $779 = 0, $78 = 0, $780 = 0, $781 = 0, $782 = 0, $783 = 0, $784 = 0, $785 = 0, $786 = 0;
 var $787 = 0, $788 = 0, $789 = 0, $79 = 0, $790 = 0, $791 = 0, $792 = 0, $793 = 0, $794 = 0, $795 = 0, $796 = 0, $797 = 0, $798 = 0, $799 = 0, $8 = 0, $80 = 0, $800 = 0, $801 = 0, $802 = 0, $803 = 0;
 var $804 = 0, $805 = 0, $806 = 0, $807 = 0, $808 = 0, $809 = 0, $81 = 0, $810 = 0, $811 = 0, $812 = 0, $813 = 0, $814 = 0, $815 = 0, $816 = 0, $817 = 0, $818 = 0, $819 = 0, $82 = 0, $820 = 0, $821 = 0;
 var $822 = 0, $823 = 0, $824 = 0, $825 = 0, $826 = 0, $827 = 0, $828 = 0, $829 = 0, $83 = 0, $830 = 0, $831 = 0, $832 = 0, $833 = 0, $834 = 0, $835 = 0, $836 = 0, $837 = 0, $838 = 0, $839 = 0, $84 = 0;
 var $840 = 0, $841 = 0, $842 = 0, $843 = 0, $844 = 0, $845 = 0, $846 = 0, $847 = 0, $848 = 0, $849 = 0, $85 = 0, $850 = 0, $851 = 0, $852 = 0, $853 = 0, $854 = 0, $855 = 0, $856 = 0, $857 = 0, $858 = 0;
 var $859 = 0, $86 = 0, $860 = 0, $861 = 0, $862 = 0, $863 = 0, $864 = 0, $865 = 0, $866 = 0, $867 = 0, $868 = 0, $869 = 0, $87 = 0, $870 = 0, $871 = 0, $872 = 0, $873 = 0, $874 = 0, $875 = 0, $876 = 0;
 var $877 = 0, $878 = 0, $879 = 0, $88 = 0, $880 = 0, $881 = 0, $882 = 0, $883 = 0, $884 = 0, $885 = 0, $886 = 0, $887 = 0, $888 = 0, $889 = 0, $89 = 0, $890 = 0, $891 = 0, $892 = 0, $893 = 0, $894 = 0;
 var $895 = 0, $896 = 0, $897 = 0, $898 = 0, $899 = 0, $9 = 0, $90 = 0, $900 = 0, $901 = 0, $902 = 0, $903 = 0, $904 = 0, $905 = 0, $906 = 0, $907 = 0, $908 = 0, $909 = 0, $91 = 0, $910 = 0, $911 = 0;
 var $912 = 0, $913 = 0, $914 = 0, $915 = 0, $916 = 0, $917 = 0, $918 = 0, $919 = 0, $92 = 0, $920 = 0, $921 = 0, $922 = 0, $923 = 0, $924 = 0, $925 = 0, $926 = 0, $927 = 0, $928 = 0, $929 = 0, $93 = 0;
 var $930 = 0, $931 = 0, $932 = 0, $933 = 0, $934 = 0, $935 = 0, $936 = 0, $937 = 0, $938 = 0, $939 = 0, $94 = 0, $940 = 0, $941 = 0, $942 = 0, $943 = 0, $944 = 0, $945 = 0, $946 = 0, $947 = 0, $948 = 0;
 var $949 = 0, $95 = 0, $950 = 0, $951 = 0, $952 = 0, $953 = 0, $954 = 0, $955 = 0, $956 = 0, $957 = 0, $958 = 0, $959 = 0, $96 = 0, $960 = 0, $961 = 0, $962 = 0, $963 = 0, $964 = 0, $965 = 0, $966 = 0;
 var $967 = 0, $968 = 0, $969 = 0, $97 = 0, $970 = 0, $971 = 0, $972 = 0, $973 = 0, $974 = 0, $975 = 0, $976 = 0, $977 = 0, $978 = 0, $979 = 0, $98 = 0, $980 = 0, $981 = 0, $982 = 0, $983 = 0, $984 = 0;
 var $985 = 0, $986 = 0, $987 = 0, $988 = 0, $989 = 0, $99 = 0, $990 = 0, $991 = 0, $992 = 0, $993 = 0, $994 = 0, $995 = 0, $996 = 0, $997 = 0, $998 = 0, $999 = 0, $F$0$i$i = 0, $F1$0$i = 0, $F4$0 = 0, $F4$0$i$i = 0;
 var $F5$0$i = 0, $I1$0$i$i = 0, $I7$0$i = 0, $I7$0$i$i = 0, $K12$029$i = 0, $K2$07$i$i = 0, $K8$051$i$i = 0, $R$0$i = 0, $R$0$i$i = 0, $R$0$i$i$lcssa = 0, $R$0$i$lcssa = 0, $R$0$i18 = 0, $R$0$i18$lcssa = 0, $R$1$i = 0, $R$1$i$i = 0, $R$1$i20 = 0, $RP$0$i = 0, $RP$0$i$i = 0, $RP$0$i$i$lcssa = 0, $RP$0$i$lcssa = 0;
 var $RP$0$i17 = 0, $RP$0$i17$lcssa = 0, $T$0$lcssa$i = 0, $T$0$lcssa$i$i = 0, $T$0$lcssa$i25$i = 0, $T$028$i = 0, $T$028$i$lcssa = 0, $T$050$i$i = 0, $T$050$i$i$lcssa = 0, $T$06$i$i = 0, $T$06$i$i$lcssa = 0, $br$0$ph$i = 0, $cond$i = 0, $cond$i$i = 0, $cond$i21 = 0, $exitcond$i$i = 0, $i$02$i$i = 0, $idx$0$i = 0, $mem$0 = 0, $nb$0 = 0;
 var $not$$i = 0, $not$$i$i = 0, $not$$i26$i = 0, $oldfirst$0$i$i = 0, $or$cond$i = 0, $or$cond$i30 = 0, $or$cond1$i = 0, $or$cond19$i = 0, $or$cond2$i = 0, $or$cond3$i = 0, $or$cond5$i = 0, $or$cond57$i = 0, $or$cond6$i = 0, $or$cond8$i = 0, $or$cond9$i = 0, $qsize$0$i$i = 0, $rsize$0$i = 0, $rsize$0$i$lcssa = 0, $rsize$0$i15 = 0, $rsize$1$i = 0;
 var $rsize$2$i = 0, $rsize$3$lcssa$i = 0, $rsize$331$i = 0, $rst$0$i = 0, $rst$1$i = 0, $sizebits$0$i = 0, $sp$0$i$i = 0, $sp$0$i$i$i = 0, $sp$084$i = 0, $sp$084$i$lcssa = 0, $sp$183$i = 0, $sp$183$i$lcssa = 0, $ssize$0$$i = 0, $ssize$0$i = 0, $ssize$1$ph$i = 0, $ssize$2$i = 0, $t$0$i = 0, $t$0$i14 = 0, $t$1$i = 0, $t$2$ph$i = 0;
 var $t$2$v$3$i = 0, $t$230$i = 0, $tbase$255$i = 0, $tsize$0$ph$i = 0, $tsize$0323944$i = 0, $tsize$1$i = 0, $tsize$254$i = 0, $v$0$i = 0, $v$0$i$lcssa = 0, $v$0$i16 = 0, $v$1$i = 0, $v$2$i = 0, $v$3$lcssa$i = 0, $v$3$ph$i = 0, $v$332$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($bytes>>>0)<(245);
 do {
  if ($0) {
   $1 = ($bytes>>>0)<(11);
   $2 = (($bytes) + 11)|0;
   $3 = $2 & -8;
   $4 = $1 ? 16 : $3;
   $5 = $4 >>> 3;
   $6 = HEAP32[5164>>2]|0;
   $7 = $6 >>> $5;
   $8 = $7 & 3;
   $9 = ($8|0)==(0);
   if (!($9)) {
    $10 = $7 & 1;
    $11 = $10 ^ 1;
    $12 = (($11) + ($5))|0;
    $13 = $12 << 1;
    $14 = (5204 + ($13<<2)|0);
    $$sum10 = (($13) + 2)|0;
    $15 = (5204 + ($$sum10<<2)|0);
    $16 = HEAP32[$15>>2]|0;
    $17 = ((($16)) + 8|0);
    $18 = HEAP32[$17>>2]|0;
    $19 = ($14|0)==($18|0);
    do {
     if ($19) {
      $20 = 1 << $12;
      $21 = $20 ^ -1;
      $22 = $6 & $21;
      HEAP32[5164>>2] = $22;
     } else {
      $23 = HEAP32[(5180)>>2]|0;
      $24 = ($18>>>0)<($23>>>0);
      if ($24) {
       _abort();
       // unreachable;
      }
      $25 = ((($18)) + 12|0);
      $26 = HEAP32[$25>>2]|0;
      $27 = ($26|0)==($16|0);
      if ($27) {
       HEAP32[$25>>2] = $14;
       HEAP32[$15>>2] = $18;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $28 = $12 << 3;
    $29 = $28 | 3;
    $30 = ((($16)) + 4|0);
    HEAP32[$30>>2] = $29;
    $$sum1112 = $28 | 4;
    $31 = (($16) + ($$sum1112)|0);
    $32 = HEAP32[$31>>2]|0;
    $33 = $32 | 1;
    HEAP32[$31>>2] = $33;
    $mem$0 = $17;
    return ($mem$0|0);
   }
   $34 = HEAP32[(5172)>>2]|0;
   $35 = ($4>>>0)>($34>>>0);
   if ($35) {
    $36 = ($7|0)==(0);
    if (!($36)) {
     $37 = $7 << $5;
     $38 = 2 << $5;
     $39 = (0 - ($38))|0;
     $40 = $38 | $39;
     $41 = $37 & $40;
     $42 = (0 - ($41))|0;
     $43 = $41 & $42;
     $44 = (($43) + -1)|0;
     $45 = $44 >>> 12;
     $46 = $45 & 16;
     $47 = $44 >>> $46;
     $48 = $47 >>> 5;
     $49 = $48 & 8;
     $50 = $49 | $46;
     $51 = $47 >>> $49;
     $52 = $51 >>> 2;
     $53 = $52 & 4;
     $54 = $50 | $53;
     $55 = $51 >>> $53;
     $56 = $55 >>> 1;
     $57 = $56 & 2;
     $58 = $54 | $57;
     $59 = $55 >>> $57;
     $60 = $59 >>> 1;
     $61 = $60 & 1;
     $62 = $58 | $61;
     $63 = $59 >>> $61;
     $64 = (($62) + ($63))|0;
     $65 = $64 << 1;
     $66 = (5204 + ($65<<2)|0);
     $$sum4 = (($65) + 2)|0;
     $67 = (5204 + ($$sum4<<2)|0);
     $68 = HEAP32[$67>>2]|0;
     $69 = ((($68)) + 8|0);
     $70 = HEAP32[$69>>2]|0;
     $71 = ($66|0)==($70|0);
     do {
      if ($71) {
       $72 = 1 << $64;
       $73 = $72 ^ -1;
       $74 = $6 & $73;
       HEAP32[5164>>2] = $74;
       $88 = $34;
      } else {
       $75 = HEAP32[(5180)>>2]|0;
       $76 = ($70>>>0)<($75>>>0);
       if ($76) {
        _abort();
        // unreachable;
       }
       $77 = ((($70)) + 12|0);
       $78 = HEAP32[$77>>2]|0;
       $79 = ($78|0)==($68|0);
       if ($79) {
        HEAP32[$77>>2] = $66;
        HEAP32[$67>>2] = $70;
        $$pre = HEAP32[(5172)>>2]|0;
        $88 = $$pre;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $80 = $64 << 3;
     $81 = (($80) - ($4))|0;
     $82 = $4 | 3;
     $83 = ((($68)) + 4|0);
     HEAP32[$83>>2] = $82;
     $84 = (($68) + ($4)|0);
     $85 = $81 | 1;
     $$sum56 = $4 | 4;
     $86 = (($68) + ($$sum56)|0);
     HEAP32[$86>>2] = $85;
     $87 = (($68) + ($80)|0);
     HEAP32[$87>>2] = $81;
     $89 = ($88|0)==(0);
     if (!($89)) {
      $90 = HEAP32[(5184)>>2]|0;
      $91 = $88 >>> 3;
      $92 = $91 << 1;
      $93 = (5204 + ($92<<2)|0);
      $94 = HEAP32[5164>>2]|0;
      $95 = 1 << $91;
      $96 = $94 & $95;
      $97 = ($96|0)==(0);
      if ($97) {
       $98 = $94 | $95;
       HEAP32[5164>>2] = $98;
       $$pre105 = (($92) + 2)|0;
       $$pre106 = (5204 + ($$pre105<<2)|0);
       $$pre$phiZ2D = $$pre106;$F4$0 = $93;
      } else {
       $$sum9 = (($92) + 2)|0;
       $99 = (5204 + ($$sum9<<2)|0);
       $100 = HEAP32[$99>>2]|0;
       $101 = HEAP32[(5180)>>2]|0;
       $102 = ($100>>>0)<($101>>>0);
       if ($102) {
        _abort();
        // unreachable;
       } else {
        $$pre$phiZ2D = $99;$F4$0 = $100;
       }
      }
      HEAP32[$$pre$phiZ2D>>2] = $90;
      $103 = ((($F4$0)) + 12|0);
      HEAP32[$103>>2] = $90;
      $104 = ((($90)) + 8|0);
      HEAP32[$104>>2] = $F4$0;
      $105 = ((($90)) + 12|0);
      HEAP32[$105>>2] = $93;
     }
     HEAP32[(5172)>>2] = $81;
     HEAP32[(5184)>>2] = $84;
     $mem$0 = $69;
     return ($mem$0|0);
    }
    $106 = HEAP32[(5168)>>2]|0;
    $107 = ($106|0)==(0);
    if ($107) {
     $nb$0 = $4;
    } else {
     $108 = (0 - ($106))|0;
     $109 = $106 & $108;
     $110 = (($109) + -1)|0;
     $111 = $110 >>> 12;
     $112 = $111 & 16;
     $113 = $110 >>> $112;
     $114 = $113 >>> 5;
     $115 = $114 & 8;
     $116 = $115 | $112;
     $117 = $113 >>> $115;
     $118 = $117 >>> 2;
     $119 = $118 & 4;
     $120 = $116 | $119;
     $121 = $117 >>> $119;
     $122 = $121 >>> 1;
     $123 = $122 & 2;
     $124 = $120 | $123;
     $125 = $121 >>> $123;
     $126 = $125 >>> 1;
     $127 = $126 & 1;
     $128 = $124 | $127;
     $129 = $125 >>> $127;
     $130 = (($128) + ($129))|0;
     $131 = (5468 + ($130<<2)|0);
     $132 = HEAP32[$131>>2]|0;
     $133 = ((($132)) + 4|0);
     $134 = HEAP32[$133>>2]|0;
     $135 = $134 & -8;
     $136 = (($135) - ($4))|0;
     $rsize$0$i = $136;$t$0$i = $132;$v$0$i = $132;
     while(1) {
      $137 = ((($t$0$i)) + 16|0);
      $138 = HEAP32[$137>>2]|0;
      $139 = ($138|0)==(0|0);
      if ($139) {
       $140 = ((($t$0$i)) + 20|0);
       $141 = HEAP32[$140>>2]|0;
       $142 = ($141|0)==(0|0);
       if ($142) {
        $rsize$0$i$lcssa = $rsize$0$i;$v$0$i$lcssa = $v$0$i;
        break;
       } else {
        $144 = $141;
       }
      } else {
       $144 = $138;
      }
      $143 = ((($144)) + 4|0);
      $145 = HEAP32[$143>>2]|0;
      $146 = $145 & -8;
      $147 = (($146) - ($4))|0;
      $148 = ($147>>>0)<($rsize$0$i>>>0);
      $$rsize$0$i = $148 ? $147 : $rsize$0$i;
      $$v$0$i = $148 ? $144 : $v$0$i;
      $rsize$0$i = $$rsize$0$i;$t$0$i = $144;$v$0$i = $$v$0$i;
     }
     $149 = HEAP32[(5180)>>2]|0;
     $150 = ($v$0$i$lcssa>>>0)<($149>>>0);
     if ($150) {
      _abort();
      // unreachable;
     }
     $151 = (($v$0$i$lcssa) + ($4)|0);
     $152 = ($v$0$i$lcssa>>>0)<($151>>>0);
     if (!($152)) {
      _abort();
      // unreachable;
     }
     $153 = ((($v$0$i$lcssa)) + 24|0);
     $154 = HEAP32[$153>>2]|0;
     $155 = ((($v$0$i$lcssa)) + 12|0);
     $156 = HEAP32[$155>>2]|0;
     $157 = ($156|0)==($v$0$i$lcssa|0);
     do {
      if ($157) {
       $167 = ((($v$0$i$lcssa)) + 20|0);
       $168 = HEAP32[$167>>2]|0;
       $169 = ($168|0)==(0|0);
       if ($169) {
        $170 = ((($v$0$i$lcssa)) + 16|0);
        $171 = HEAP32[$170>>2]|0;
        $172 = ($171|0)==(0|0);
        if ($172) {
         $R$1$i = 0;
         break;
        } else {
         $R$0$i = $171;$RP$0$i = $170;
        }
       } else {
        $R$0$i = $168;$RP$0$i = $167;
       }
       while(1) {
        $173 = ((($R$0$i)) + 20|0);
        $174 = HEAP32[$173>>2]|0;
        $175 = ($174|0)==(0|0);
        if (!($175)) {
         $R$0$i = $174;$RP$0$i = $173;
         continue;
        }
        $176 = ((($R$0$i)) + 16|0);
        $177 = HEAP32[$176>>2]|0;
        $178 = ($177|0)==(0|0);
        if ($178) {
         $R$0$i$lcssa = $R$0$i;$RP$0$i$lcssa = $RP$0$i;
         break;
        } else {
         $R$0$i = $177;$RP$0$i = $176;
        }
       }
       $179 = ($RP$0$i$lcssa>>>0)<($149>>>0);
       if ($179) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$RP$0$i$lcssa>>2] = 0;
        $R$1$i = $R$0$i$lcssa;
        break;
       }
      } else {
       $158 = ((($v$0$i$lcssa)) + 8|0);
       $159 = HEAP32[$158>>2]|0;
       $160 = ($159>>>0)<($149>>>0);
       if ($160) {
        _abort();
        // unreachable;
       }
       $161 = ((($159)) + 12|0);
       $162 = HEAP32[$161>>2]|0;
       $163 = ($162|0)==($v$0$i$lcssa|0);
       if (!($163)) {
        _abort();
        // unreachable;
       }
       $164 = ((($156)) + 8|0);
       $165 = HEAP32[$164>>2]|0;
       $166 = ($165|0)==($v$0$i$lcssa|0);
       if ($166) {
        HEAP32[$161>>2] = $156;
        HEAP32[$164>>2] = $159;
        $R$1$i = $156;
        break;
       } else {
        _abort();
        // unreachable;
       }
      }
     } while(0);
     $180 = ($154|0)==(0|0);
     do {
      if (!($180)) {
       $181 = ((($v$0$i$lcssa)) + 28|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = (5468 + ($182<<2)|0);
       $184 = HEAP32[$183>>2]|0;
       $185 = ($v$0$i$lcssa|0)==($184|0);
       if ($185) {
        HEAP32[$183>>2] = $R$1$i;
        $cond$i = ($R$1$i|0)==(0|0);
        if ($cond$i) {
         $186 = 1 << $182;
         $187 = $186 ^ -1;
         $188 = HEAP32[(5168)>>2]|0;
         $189 = $188 & $187;
         HEAP32[(5168)>>2] = $189;
         break;
        }
       } else {
        $190 = HEAP32[(5180)>>2]|0;
        $191 = ($154>>>0)<($190>>>0);
        if ($191) {
         _abort();
         // unreachable;
        }
        $192 = ((($154)) + 16|0);
        $193 = HEAP32[$192>>2]|0;
        $194 = ($193|0)==($v$0$i$lcssa|0);
        if ($194) {
         HEAP32[$192>>2] = $R$1$i;
        } else {
         $195 = ((($154)) + 20|0);
         HEAP32[$195>>2] = $R$1$i;
        }
        $196 = ($R$1$i|0)==(0|0);
        if ($196) {
         break;
        }
       }
       $197 = HEAP32[(5180)>>2]|0;
       $198 = ($R$1$i>>>0)<($197>>>0);
       if ($198) {
        _abort();
        // unreachable;
       }
       $199 = ((($R$1$i)) + 24|0);
       HEAP32[$199>>2] = $154;
       $200 = ((($v$0$i$lcssa)) + 16|0);
       $201 = HEAP32[$200>>2]|0;
       $202 = ($201|0)==(0|0);
       do {
        if (!($202)) {
         $203 = ($201>>>0)<($197>>>0);
         if ($203) {
          _abort();
          // unreachable;
         } else {
          $204 = ((($R$1$i)) + 16|0);
          HEAP32[$204>>2] = $201;
          $205 = ((($201)) + 24|0);
          HEAP32[$205>>2] = $R$1$i;
          break;
         }
        }
       } while(0);
       $206 = ((($v$0$i$lcssa)) + 20|0);
       $207 = HEAP32[$206>>2]|0;
       $208 = ($207|0)==(0|0);
       if (!($208)) {
        $209 = HEAP32[(5180)>>2]|0;
        $210 = ($207>>>0)<($209>>>0);
        if ($210) {
         _abort();
         // unreachable;
        } else {
         $211 = ((($R$1$i)) + 20|0);
         HEAP32[$211>>2] = $207;
         $212 = ((($207)) + 24|0);
         HEAP32[$212>>2] = $R$1$i;
         break;
        }
       }
      }
     } while(0);
     $213 = ($rsize$0$i$lcssa>>>0)<(16);
     if ($213) {
      $214 = (($rsize$0$i$lcssa) + ($4))|0;
      $215 = $214 | 3;
      $216 = ((($v$0$i$lcssa)) + 4|0);
      HEAP32[$216>>2] = $215;
      $$sum4$i = (($214) + 4)|0;
      $217 = (($v$0$i$lcssa) + ($$sum4$i)|0);
      $218 = HEAP32[$217>>2]|0;
      $219 = $218 | 1;
      HEAP32[$217>>2] = $219;
     } else {
      $220 = $4 | 3;
      $221 = ((($v$0$i$lcssa)) + 4|0);
      HEAP32[$221>>2] = $220;
      $222 = $rsize$0$i$lcssa | 1;
      $$sum$i35 = $4 | 4;
      $223 = (($v$0$i$lcssa) + ($$sum$i35)|0);
      HEAP32[$223>>2] = $222;
      $$sum1$i = (($rsize$0$i$lcssa) + ($4))|0;
      $224 = (($v$0$i$lcssa) + ($$sum1$i)|0);
      HEAP32[$224>>2] = $rsize$0$i$lcssa;
      $225 = HEAP32[(5172)>>2]|0;
      $226 = ($225|0)==(0);
      if (!($226)) {
       $227 = HEAP32[(5184)>>2]|0;
       $228 = $225 >>> 3;
       $229 = $228 << 1;
       $230 = (5204 + ($229<<2)|0);
       $231 = HEAP32[5164>>2]|0;
       $232 = 1 << $228;
       $233 = $231 & $232;
       $234 = ($233|0)==(0);
       if ($234) {
        $235 = $231 | $232;
        HEAP32[5164>>2] = $235;
        $$pre$i = (($229) + 2)|0;
        $$pre8$i = (5204 + ($$pre$i<<2)|0);
        $$pre$phi$iZ2D = $$pre8$i;$F1$0$i = $230;
       } else {
        $$sum3$i = (($229) + 2)|0;
        $236 = (5204 + ($$sum3$i<<2)|0);
        $237 = HEAP32[$236>>2]|0;
        $238 = HEAP32[(5180)>>2]|0;
        $239 = ($237>>>0)<($238>>>0);
        if ($239) {
         _abort();
         // unreachable;
        } else {
         $$pre$phi$iZ2D = $236;$F1$0$i = $237;
        }
       }
       HEAP32[$$pre$phi$iZ2D>>2] = $227;
       $240 = ((($F1$0$i)) + 12|0);
       HEAP32[$240>>2] = $227;
       $241 = ((($227)) + 8|0);
       HEAP32[$241>>2] = $F1$0$i;
       $242 = ((($227)) + 12|0);
       HEAP32[$242>>2] = $230;
      }
      HEAP32[(5172)>>2] = $rsize$0$i$lcssa;
      HEAP32[(5184)>>2] = $151;
     }
     $243 = ((($v$0$i$lcssa)) + 8|0);
     $mem$0 = $243;
     return ($mem$0|0);
    }
   } else {
    $nb$0 = $4;
   }
  } else {
   $244 = ($bytes>>>0)>(4294967231);
   if ($244) {
    $nb$0 = -1;
   } else {
    $245 = (($bytes) + 11)|0;
    $246 = $245 & -8;
    $247 = HEAP32[(5168)>>2]|0;
    $248 = ($247|0)==(0);
    if ($248) {
     $nb$0 = $246;
    } else {
     $249 = (0 - ($246))|0;
     $250 = $245 >>> 8;
     $251 = ($250|0)==(0);
     if ($251) {
      $idx$0$i = 0;
     } else {
      $252 = ($246>>>0)>(16777215);
      if ($252) {
       $idx$0$i = 31;
      } else {
       $253 = (($250) + 1048320)|0;
       $254 = $253 >>> 16;
       $255 = $254 & 8;
       $256 = $250 << $255;
       $257 = (($256) + 520192)|0;
       $258 = $257 >>> 16;
       $259 = $258 & 4;
       $260 = $259 | $255;
       $261 = $256 << $259;
       $262 = (($261) + 245760)|0;
       $263 = $262 >>> 16;
       $264 = $263 & 2;
       $265 = $260 | $264;
       $266 = (14 - ($265))|0;
       $267 = $261 << $264;
       $268 = $267 >>> 15;
       $269 = (($266) + ($268))|0;
       $270 = $269 << 1;
       $271 = (($269) + 7)|0;
       $272 = $246 >>> $271;
       $273 = $272 & 1;
       $274 = $273 | $270;
       $idx$0$i = $274;
      }
     }
     $275 = (5468 + ($idx$0$i<<2)|0);
     $276 = HEAP32[$275>>2]|0;
     $277 = ($276|0)==(0|0);
     L123: do {
      if ($277) {
       $rsize$2$i = $249;$t$1$i = 0;$v$2$i = 0;
       label = 86;
      } else {
       $278 = ($idx$0$i|0)==(31);
       $279 = $idx$0$i >>> 1;
       $280 = (25 - ($279))|0;
       $281 = $278 ? 0 : $280;
       $282 = $246 << $281;
       $rsize$0$i15 = $249;$rst$0$i = 0;$sizebits$0$i = $282;$t$0$i14 = $276;$v$0$i16 = 0;
       while(1) {
        $283 = ((($t$0$i14)) + 4|0);
        $284 = HEAP32[$283>>2]|0;
        $285 = $284 & -8;
        $286 = (($285) - ($246))|0;
        $287 = ($286>>>0)<($rsize$0$i15>>>0);
        if ($287) {
         $288 = ($285|0)==($246|0);
         if ($288) {
          $rsize$331$i = $286;$t$230$i = $t$0$i14;$v$332$i = $t$0$i14;
          label = 90;
          break L123;
         } else {
          $rsize$1$i = $286;$v$1$i = $t$0$i14;
         }
        } else {
         $rsize$1$i = $rsize$0$i15;$v$1$i = $v$0$i16;
        }
        $289 = ((($t$0$i14)) + 20|0);
        $290 = HEAP32[$289>>2]|0;
        $291 = $sizebits$0$i >>> 31;
        $292 = (((($t$0$i14)) + 16|0) + ($291<<2)|0);
        $293 = HEAP32[$292>>2]|0;
        $294 = ($290|0)==(0|0);
        $295 = ($290|0)==($293|0);
        $or$cond19$i = $294 | $295;
        $rst$1$i = $or$cond19$i ? $rst$0$i : $290;
        $296 = ($293|0)==(0|0);
        $297 = $sizebits$0$i << 1;
        if ($296) {
         $rsize$2$i = $rsize$1$i;$t$1$i = $rst$1$i;$v$2$i = $v$1$i;
         label = 86;
         break;
        } else {
         $rsize$0$i15 = $rsize$1$i;$rst$0$i = $rst$1$i;$sizebits$0$i = $297;$t$0$i14 = $293;$v$0$i16 = $v$1$i;
        }
       }
      }
     } while(0);
     if ((label|0) == 86) {
      $298 = ($t$1$i|0)==(0|0);
      $299 = ($v$2$i|0)==(0|0);
      $or$cond$i = $298 & $299;
      if ($or$cond$i) {
       $300 = 2 << $idx$0$i;
       $301 = (0 - ($300))|0;
       $302 = $300 | $301;
       $303 = $247 & $302;
       $304 = ($303|0)==(0);
       if ($304) {
        $nb$0 = $246;
        break;
       }
       $305 = (0 - ($303))|0;
       $306 = $303 & $305;
       $307 = (($306) + -1)|0;
       $308 = $307 >>> 12;
       $309 = $308 & 16;
       $310 = $307 >>> $309;
       $311 = $310 >>> 5;
       $312 = $311 & 8;
       $313 = $312 | $309;
       $314 = $310 >>> $312;
       $315 = $314 >>> 2;
       $316 = $315 & 4;
       $317 = $313 | $316;
       $318 = $314 >>> $316;
       $319 = $318 >>> 1;
       $320 = $319 & 2;
       $321 = $317 | $320;
       $322 = $318 >>> $320;
       $323 = $322 >>> 1;
       $324 = $323 & 1;
       $325 = $321 | $324;
       $326 = $322 >>> $324;
       $327 = (($325) + ($326))|0;
       $328 = (5468 + ($327<<2)|0);
       $329 = HEAP32[$328>>2]|0;
       $t$2$ph$i = $329;$v$3$ph$i = 0;
      } else {
       $t$2$ph$i = $t$1$i;$v$3$ph$i = $v$2$i;
      }
      $330 = ($t$2$ph$i|0)==(0|0);
      if ($330) {
       $rsize$3$lcssa$i = $rsize$2$i;$v$3$lcssa$i = $v$3$ph$i;
      } else {
       $rsize$331$i = $rsize$2$i;$t$230$i = $t$2$ph$i;$v$332$i = $v$3$ph$i;
       label = 90;
      }
     }
     if ((label|0) == 90) {
      while(1) {
       label = 0;
       $331 = ((($t$230$i)) + 4|0);
       $332 = HEAP32[$331>>2]|0;
       $333 = $332 & -8;
       $334 = (($333) - ($246))|0;
       $335 = ($334>>>0)<($rsize$331$i>>>0);
       $$rsize$3$i = $335 ? $334 : $rsize$331$i;
       $t$2$v$3$i = $335 ? $t$230$i : $v$332$i;
       $336 = ((($t$230$i)) + 16|0);
       $337 = HEAP32[$336>>2]|0;
       $338 = ($337|0)==(0|0);
       if (!($338)) {
        $rsize$331$i = $$rsize$3$i;$t$230$i = $337;$v$332$i = $t$2$v$3$i;
        label = 90;
        continue;
       }
       $339 = ((($t$230$i)) + 20|0);
       $340 = HEAP32[$339>>2]|0;
       $341 = ($340|0)==(0|0);
       if ($341) {
        $rsize$3$lcssa$i = $$rsize$3$i;$v$3$lcssa$i = $t$2$v$3$i;
        break;
       } else {
        $rsize$331$i = $$rsize$3$i;$t$230$i = $340;$v$332$i = $t$2$v$3$i;
        label = 90;
       }
      }
     }
     $342 = ($v$3$lcssa$i|0)==(0|0);
     if ($342) {
      $nb$0 = $246;
     } else {
      $343 = HEAP32[(5172)>>2]|0;
      $344 = (($343) - ($246))|0;
      $345 = ($rsize$3$lcssa$i>>>0)<($344>>>0);
      if ($345) {
       $346 = HEAP32[(5180)>>2]|0;
       $347 = ($v$3$lcssa$i>>>0)<($346>>>0);
       if ($347) {
        _abort();
        // unreachable;
       }
       $348 = (($v$3$lcssa$i) + ($246)|0);
       $349 = ($v$3$lcssa$i>>>0)<($348>>>0);
       if (!($349)) {
        _abort();
        // unreachable;
       }
       $350 = ((($v$3$lcssa$i)) + 24|0);
       $351 = HEAP32[$350>>2]|0;
       $352 = ((($v$3$lcssa$i)) + 12|0);
       $353 = HEAP32[$352>>2]|0;
       $354 = ($353|0)==($v$3$lcssa$i|0);
       do {
        if ($354) {
         $364 = ((($v$3$lcssa$i)) + 20|0);
         $365 = HEAP32[$364>>2]|0;
         $366 = ($365|0)==(0|0);
         if ($366) {
          $367 = ((($v$3$lcssa$i)) + 16|0);
          $368 = HEAP32[$367>>2]|0;
          $369 = ($368|0)==(0|0);
          if ($369) {
           $R$1$i20 = 0;
           break;
          } else {
           $R$0$i18 = $368;$RP$0$i17 = $367;
          }
         } else {
          $R$0$i18 = $365;$RP$0$i17 = $364;
         }
         while(1) {
          $370 = ((($R$0$i18)) + 20|0);
          $371 = HEAP32[$370>>2]|0;
          $372 = ($371|0)==(0|0);
          if (!($372)) {
           $R$0$i18 = $371;$RP$0$i17 = $370;
           continue;
          }
          $373 = ((($R$0$i18)) + 16|0);
          $374 = HEAP32[$373>>2]|0;
          $375 = ($374|0)==(0|0);
          if ($375) {
           $R$0$i18$lcssa = $R$0$i18;$RP$0$i17$lcssa = $RP$0$i17;
           break;
          } else {
           $R$0$i18 = $374;$RP$0$i17 = $373;
          }
         }
         $376 = ($RP$0$i17$lcssa>>>0)<($346>>>0);
         if ($376) {
          _abort();
          // unreachable;
         } else {
          HEAP32[$RP$0$i17$lcssa>>2] = 0;
          $R$1$i20 = $R$0$i18$lcssa;
          break;
         }
        } else {
         $355 = ((($v$3$lcssa$i)) + 8|0);
         $356 = HEAP32[$355>>2]|0;
         $357 = ($356>>>0)<($346>>>0);
         if ($357) {
          _abort();
          // unreachable;
         }
         $358 = ((($356)) + 12|0);
         $359 = HEAP32[$358>>2]|0;
         $360 = ($359|0)==($v$3$lcssa$i|0);
         if (!($360)) {
          _abort();
          // unreachable;
         }
         $361 = ((($353)) + 8|0);
         $362 = HEAP32[$361>>2]|0;
         $363 = ($362|0)==($v$3$lcssa$i|0);
         if ($363) {
          HEAP32[$358>>2] = $353;
          HEAP32[$361>>2] = $356;
          $R$1$i20 = $353;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $377 = ($351|0)==(0|0);
       do {
        if (!($377)) {
         $378 = ((($v$3$lcssa$i)) + 28|0);
         $379 = HEAP32[$378>>2]|0;
         $380 = (5468 + ($379<<2)|0);
         $381 = HEAP32[$380>>2]|0;
         $382 = ($v$3$lcssa$i|0)==($381|0);
         if ($382) {
          HEAP32[$380>>2] = $R$1$i20;
          $cond$i21 = ($R$1$i20|0)==(0|0);
          if ($cond$i21) {
           $383 = 1 << $379;
           $384 = $383 ^ -1;
           $385 = HEAP32[(5168)>>2]|0;
           $386 = $385 & $384;
           HEAP32[(5168)>>2] = $386;
           break;
          }
         } else {
          $387 = HEAP32[(5180)>>2]|0;
          $388 = ($351>>>0)<($387>>>0);
          if ($388) {
           _abort();
           // unreachable;
          }
          $389 = ((($351)) + 16|0);
          $390 = HEAP32[$389>>2]|0;
          $391 = ($390|0)==($v$3$lcssa$i|0);
          if ($391) {
           HEAP32[$389>>2] = $R$1$i20;
          } else {
           $392 = ((($351)) + 20|0);
           HEAP32[$392>>2] = $R$1$i20;
          }
          $393 = ($R$1$i20|0)==(0|0);
          if ($393) {
           break;
          }
         }
         $394 = HEAP32[(5180)>>2]|0;
         $395 = ($R$1$i20>>>0)<($394>>>0);
         if ($395) {
          _abort();
          // unreachable;
         }
         $396 = ((($R$1$i20)) + 24|0);
         HEAP32[$396>>2] = $351;
         $397 = ((($v$3$lcssa$i)) + 16|0);
         $398 = HEAP32[$397>>2]|0;
         $399 = ($398|0)==(0|0);
         do {
          if (!($399)) {
           $400 = ($398>>>0)<($394>>>0);
           if ($400) {
            _abort();
            // unreachable;
           } else {
            $401 = ((($R$1$i20)) + 16|0);
            HEAP32[$401>>2] = $398;
            $402 = ((($398)) + 24|0);
            HEAP32[$402>>2] = $R$1$i20;
            break;
           }
          }
         } while(0);
         $403 = ((($v$3$lcssa$i)) + 20|0);
         $404 = HEAP32[$403>>2]|0;
         $405 = ($404|0)==(0|0);
         if (!($405)) {
          $406 = HEAP32[(5180)>>2]|0;
          $407 = ($404>>>0)<($406>>>0);
          if ($407) {
           _abort();
           // unreachable;
          } else {
           $408 = ((($R$1$i20)) + 20|0);
           HEAP32[$408>>2] = $404;
           $409 = ((($404)) + 24|0);
           HEAP32[$409>>2] = $R$1$i20;
           break;
          }
         }
        }
       } while(0);
       $410 = ($rsize$3$lcssa$i>>>0)<(16);
       L199: do {
        if ($410) {
         $411 = (($rsize$3$lcssa$i) + ($246))|0;
         $412 = $411 | 3;
         $413 = ((($v$3$lcssa$i)) + 4|0);
         HEAP32[$413>>2] = $412;
         $$sum18$i = (($411) + 4)|0;
         $414 = (($v$3$lcssa$i) + ($$sum18$i)|0);
         $415 = HEAP32[$414>>2]|0;
         $416 = $415 | 1;
         HEAP32[$414>>2] = $416;
        } else {
         $417 = $246 | 3;
         $418 = ((($v$3$lcssa$i)) + 4|0);
         HEAP32[$418>>2] = $417;
         $419 = $rsize$3$lcssa$i | 1;
         $$sum$i2334 = $246 | 4;
         $420 = (($v$3$lcssa$i) + ($$sum$i2334)|0);
         HEAP32[$420>>2] = $419;
         $$sum1$i24 = (($rsize$3$lcssa$i) + ($246))|0;
         $421 = (($v$3$lcssa$i) + ($$sum1$i24)|0);
         HEAP32[$421>>2] = $rsize$3$lcssa$i;
         $422 = $rsize$3$lcssa$i >>> 3;
         $423 = ($rsize$3$lcssa$i>>>0)<(256);
         if ($423) {
          $424 = $422 << 1;
          $425 = (5204 + ($424<<2)|0);
          $426 = HEAP32[5164>>2]|0;
          $427 = 1 << $422;
          $428 = $426 & $427;
          $429 = ($428|0)==(0);
          if ($429) {
           $430 = $426 | $427;
           HEAP32[5164>>2] = $430;
           $$pre$i25 = (($424) + 2)|0;
           $$pre43$i = (5204 + ($$pre$i25<<2)|0);
           $$pre$phi$i26Z2D = $$pre43$i;$F5$0$i = $425;
          } else {
           $$sum17$i = (($424) + 2)|0;
           $431 = (5204 + ($$sum17$i<<2)|0);
           $432 = HEAP32[$431>>2]|0;
           $433 = HEAP32[(5180)>>2]|0;
           $434 = ($432>>>0)<($433>>>0);
           if ($434) {
            _abort();
            // unreachable;
           } else {
            $$pre$phi$i26Z2D = $431;$F5$0$i = $432;
           }
          }
          HEAP32[$$pre$phi$i26Z2D>>2] = $348;
          $435 = ((($F5$0$i)) + 12|0);
          HEAP32[$435>>2] = $348;
          $$sum15$i = (($246) + 8)|0;
          $436 = (($v$3$lcssa$i) + ($$sum15$i)|0);
          HEAP32[$436>>2] = $F5$0$i;
          $$sum16$i = (($246) + 12)|0;
          $437 = (($v$3$lcssa$i) + ($$sum16$i)|0);
          HEAP32[$437>>2] = $425;
          break;
         }
         $438 = $rsize$3$lcssa$i >>> 8;
         $439 = ($438|0)==(0);
         if ($439) {
          $I7$0$i = 0;
         } else {
          $440 = ($rsize$3$lcssa$i>>>0)>(16777215);
          if ($440) {
           $I7$0$i = 31;
          } else {
           $441 = (($438) + 1048320)|0;
           $442 = $441 >>> 16;
           $443 = $442 & 8;
           $444 = $438 << $443;
           $445 = (($444) + 520192)|0;
           $446 = $445 >>> 16;
           $447 = $446 & 4;
           $448 = $447 | $443;
           $449 = $444 << $447;
           $450 = (($449) + 245760)|0;
           $451 = $450 >>> 16;
           $452 = $451 & 2;
           $453 = $448 | $452;
           $454 = (14 - ($453))|0;
           $455 = $449 << $452;
           $456 = $455 >>> 15;
           $457 = (($454) + ($456))|0;
           $458 = $457 << 1;
           $459 = (($457) + 7)|0;
           $460 = $rsize$3$lcssa$i >>> $459;
           $461 = $460 & 1;
           $462 = $461 | $458;
           $I7$0$i = $462;
          }
         }
         $463 = (5468 + ($I7$0$i<<2)|0);
         $$sum2$i = (($246) + 28)|0;
         $464 = (($v$3$lcssa$i) + ($$sum2$i)|0);
         HEAP32[$464>>2] = $I7$0$i;
         $$sum3$i27 = (($246) + 16)|0;
         $465 = (($v$3$lcssa$i) + ($$sum3$i27)|0);
         $$sum4$i28 = (($246) + 20)|0;
         $466 = (($v$3$lcssa$i) + ($$sum4$i28)|0);
         HEAP32[$466>>2] = 0;
         HEAP32[$465>>2] = 0;
         $467 = HEAP32[(5168)>>2]|0;
         $468 = 1 << $I7$0$i;
         $469 = $467 & $468;
         $470 = ($469|0)==(0);
         if ($470) {
          $471 = $467 | $468;
          HEAP32[(5168)>>2] = $471;
          HEAP32[$463>>2] = $348;
          $$sum5$i = (($246) + 24)|0;
          $472 = (($v$3$lcssa$i) + ($$sum5$i)|0);
          HEAP32[$472>>2] = $463;
          $$sum6$i = (($246) + 12)|0;
          $473 = (($v$3$lcssa$i) + ($$sum6$i)|0);
          HEAP32[$473>>2] = $348;
          $$sum7$i = (($246) + 8)|0;
          $474 = (($v$3$lcssa$i) + ($$sum7$i)|0);
          HEAP32[$474>>2] = $348;
          break;
         }
         $475 = HEAP32[$463>>2]|0;
         $476 = ((($475)) + 4|0);
         $477 = HEAP32[$476>>2]|0;
         $478 = $477 & -8;
         $479 = ($478|0)==($rsize$3$lcssa$i|0);
         L217: do {
          if ($479) {
           $T$0$lcssa$i = $475;
          } else {
           $480 = ($I7$0$i|0)==(31);
           $481 = $I7$0$i >>> 1;
           $482 = (25 - ($481))|0;
           $483 = $480 ? 0 : $482;
           $484 = $rsize$3$lcssa$i << $483;
           $K12$029$i = $484;$T$028$i = $475;
           while(1) {
            $491 = $K12$029$i >>> 31;
            $492 = (((($T$028$i)) + 16|0) + ($491<<2)|0);
            $487 = HEAP32[$492>>2]|0;
            $493 = ($487|0)==(0|0);
            if ($493) {
             $$lcssa232 = $492;$T$028$i$lcssa = $T$028$i;
             break;
            }
            $485 = $K12$029$i << 1;
            $486 = ((($487)) + 4|0);
            $488 = HEAP32[$486>>2]|0;
            $489 = $488 & -8;
            $490 = ($489|0)==($rsize$3$lcssa$i|0);
            if ($490) {
             $T$0$lcssa$i = $487;
             break L217;
            } else {
             $K12$029$i = $485;$T$028$i = $487;
            }
           }
           $494 = HEAP32[(5180)>>2]|0;
           $495 = ($$lcssa232>>>0)<($494>>>0);
           if ($495) {
            _abort();
            // unreachable;
           } else {
            HEAP32[$$lcssa232>>2] = $348;
            $$sum11$i = (($246) + 24)|0;
            $496 = (($v$3$lcssa$i) + ($$sum11$i)|0);
            HEAP32[$496>>2] = $T$028$i$lcssa;
            $$sum12$i = (($246) + 12)|0;
            $497 = (($v$3$lcssa$i) + ($$sum12$i)|0);
            HEAP32[$497>>2] = $348;
            $$sum13$i = (($246) + 8)|0;
            $498 = (($v$3$lcssa$i) + ($$sum13$i)|0);
            HEAP32[$498>>2] = $348;
            break L199;
           }
          }
         } while(0);
         $499 = ((($T$0$lcssa$i)) + 8|0);
         $500 = HEAP32[$499>>2]|0;
         $501 = HEAP32[(5180)>>2]|0;
         $502 = ($500>>>0)>=($501>>>0);
         $not$$i = ($T$0$lcssa$i>>>0)>=($501>>>0);
         $503 = $502 & $not$$i;
         if ($503) {
          $504 = ((($500)) + 12|0);
          HEAP32[$504>>2] = $348;
          HEAP32[$499>>2] = $348;
          $$sum8$i = (($246) + 8)|0;
          $505 = (($v$3$lcssa$i) + ($$sum8$i)|0);
          HEAP32[$505>>2] = $500;
          $$sum9$i = (($246) + 12)|0;
          $506 = (($v$3$lcssa$i) + ($$sum9$i)|0);
          HEAP32[$506>>2] = $T$0$lcssa$i;
          $$sum10$i = (($246) + 24)|0;
          $507 = (($v$3$lcssa$i) + ($$sum10$i)|0);
          HEAP32[$507>>2] = 0;
          break;
         } else {
          _abort();
          // unreachable;
         }
        }
       } while(0);
       $508 = ((($v$3$lcssa$i)) + 8|0);
       $mem$0 = $508;
       return ($mem$0|0);
      } else {
       $nb$0 = $246;
      }
     }
    }
   }
  }
 } while(0);
 $509 = HEAP32[(5172)>>2]|0;
 $510 = ($509>>>0)<($nb$0>>>0);
 if (!($510)) {
  $511 = (($509) - ($nb$0))|0;
  $512 = HEAP32[(5184)>>2]|0;
  $513 = ($511>>>0)>(15);
  if ($513) {
   $514 = (($512) + ($nb$0)|0);
   HEAP32[(5184)>>2] = $514;
   HEAP32[(5172)>>2] = $511;
   $515 = $511 | 1;
   $$sum2 = (($nb$0) + 4)|0;
   $516 = (($512) + ($$sum2)|0);
   HEAP32[$516>>2] = $515;
   $517 = (($512) + ($509)|0);
   HEAP32[$517>>2] = $511;
   $518 = $nb$0 | 3;
   $519 = ((($512)) + 4|0);
   HEAP32[$519>>2] = $518;
  } else {
   HEAP32[(5172)>>2] = 0;
   HEAP32[(5184)>>2] = 0;
   $520 = $509 | 3;
   $521 = ((($512)) + 4|0);
   HEAP32[$521>>2] = $520;
   $$sum1 = (($509) + 4)|0;
   $522 = (($512) + ($$sum1)|0);
   $523 = HEAP32[$522>>2]|0;
   $524 = $523 | 1;
   HEAP32[$522>>2] = $524;
  }
  $525 = ((($512)) + 8|0);
  $mem$0 = $525;
  return ($mem$0|0);
 }
 $526 = HEAP32[(5176)>>2]|0;
 $527 = ($526>>>0)>($nb$0>>>0);
 if ($527) {
  $528 = (($526) - ($nb$0))|0;
  HEAP32[(5176)>>2] = $528;
  $529 = HEAP32[(5188)>>2]|0;
  $530 = (($529) + ($nb$0)|0);
  HEAP32[(5188)>>2] = $530;
  $531 = $528 | 1;
  $$sum = (($nb$0) + 4)|0;
  $532 = (($529) + ($$sum)|0);
  HEAP32[$532>>2] = $531;
  $533 = $nb$0 | 3;
  $534 = ((($529)) + 4|0);
  HEAP32[$534>>2] = $533;
  $535 = ((($529)) + 8|0);
  $mem$0 = $535;
  return ($mem$0|0);
 }
 $536 = HEAP32[5636>>2]|0;
 $537 = ($536|0)==(0);
 do {
  if ($537) {
   $538 = (_sysconf(30)|0);
   $539 = (($538) + -1)|0;
   $540 = $539 & $538;
   $541 = ($540|0)==(0);
   if ($541) {
    HEAP32[(5644)>>2] = $538;
    HEAP32[(5640)>>2] = $538;
    HEAP32[(5648)>>2] = -1;
    HEAP32[(5652)>>2] = -1;
    HEAP32[(5656)>>2] = 0;
    HEAP32[(5608)>>2] = 0;
    $542 = (_time((0|0))|0);
    $543 = $542 & -16;
    $544 = $543 ^ 1431655768;
    HEAP32[5636>>2] = $544;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $545 = (($nb$0) + 48)|0;
 $546 = HEAP32[(5644)>>2]|0;
 $547 = (($nb$0) + 47)|0;
 $548 = (($546) + ($547))|0;
 $549 = (0 - ($546))|0;
 $550 = $548 & $549;
 $551 = ($550>>>0)>($nb$0>>>0);
 if (!($551)) {
  $mem$0 = 0;
  return ($mem$0|0);
 }
 $552 = HEAP32[(5604)>>2]|0;
 $553 = ($552|0)==(0);
 if (!($553)) {
  $554 = HEAP32[(5596)>>2]|0;
  $555 = (($554) + ($550))|0;
  $556 = ($555>>>0)<=($554>>>0);
  $557 = ($555>>>0)>($552>>>0);
  $or$cond1$i = $556 | $557;
  if ($or$cond1$i) {
   $mem$0 = 0;
   return ($mem$0|0);
  }
 }
 $558 = HEAP32[(5608)>>2]|0;
 $559 = $558 & 4;
 $560 = ($559|0)==(0);
 L258: do {
  if ($560) {
   $561 = HEAP32[(5188)>>2]|0;
   $562 = ($561|0)==(0|0);
   L260: do {
    if ($562) {
     label = 174;
    } else {
     $sp$0$i$i = (5612);
     while(1) {
      $563 = HEAP32[$sp$0$i$i>>2]|0;
      $564 = ($563>>>0)>($561>>>0);
      if (!($564)) {
       $565 = ((($sp$0$i$i)) + 4|0);
       $566 = HEAP32[$565>>2]|0;
       $567 = (($563) + ($566)|0);
       $568 = ($567>>>0)>($561>>>0);
       if ($568) {
        $$lcssa228 = $sp$0$i$i;$$lcssa230 = $565;
        break;
       }
      }
      $569 = ((($sp$0$i$i)) + 8|0);
      $570 = HEAP32[$569>>2]|0;
      $571 = ($570|0)==(0|0);
      if ($571) {
       label = 174;
       break L260;
      } else {
       $sp$0$i$i = $570;
      }
     }
     $594 = HEAP32[(5176)>>2]|0;
     $595 = (($548) - ($594))|0;
     $596 = $595 & $549;
     $597 = ($596>>>0)<(2147483647);
     if ($597) {
      $598 = (_sbrk(($596|0))|0);
      $599 = HEAP32[$$lcssa228>>2]|0;
      $600 = HEAP32[$$lcssa230>>2]|0;
      $601 = (($599) + ($600)|0);
      $602 = ($598|0)==($601|0);
      $$3$i = $602 ? $596 : 0;
      if ($602) {
       $603 = ($598|0)==((-1)|0);
       if ($603) {
        $tsize$0323944$i = $$3$i;
       } else {
        $tbase$255$i = $598;$tsize$254$i = $$3$i;
        label = 194;
        break L258;
       }
      } else {
       $br$0$ph$i = $598;$ssize$1$ph$i = $596;$tsize$0$ph$i = $$3$i;
       label = 184;
      }
     } else {
      $tsize$0323944$i = 0;
     }
    }
   } while(0);
   do {
    if ((label|0) == 174) {
     $572 = (_sbrk(0)|0);
     $573 = ($572|0)==((-1)|0);
     if ($573) {
      $tsize$0323944$i = 0;
     } else {
      $574 = $572;
      $575 = HEAP32[(5640)>>2]|0;
      $576 = (($575) + -1)|0;
      $577 = $576 & $574;
      $578 = ($577|0)==(0);
      if ($578) {
       $ssize$0$i = $550;
      } else {
       $579 = (($576) + ($574))|0;
       $580 = (0 - ($575))|0;
       $581 = $579 & $580;
       $582 = (($550) - ($574))|0;
       $583 = (($582) + ($581))|0;
       $ssize$0$i = $583;
      }
      $584 = HEAP32[(5596)>>2]|0;
      $585 = (($584) + ($ssize$0$i))|0;
      $586 = ($ssize$0$i>>>0)>($nb$0>>>0);
      $587 = ($ssize$0$i>>>0)<(2147483647);
      $or$cond$i30 = $586 & $587;
      if ($or$cond$i30) {
       $588 = HEAP32[(5604)>>2]|0;
       $589 = ($588|0)==(0);
       if (!($589)) {
        $590 = ($585>>>0)<=($584>>>0);
        $591 = ($585>>>0)>($588>>>0);
        $or$cond2$i = $590 | $591;
        if ($or$cond2$i) {
         $tsize$0323944$i = 0;
         break;
        }
       }
       $592 = (_sbrk(($ssize$0$i|0))|0);
       $593 = ($592|0)==($572|0);
       $ssize$0$$i = $593 ? $ssize$0$i : 0;
       if ($593) {
        $tbase$255$i = $572;$tsize$254$i = $ssize$0$$i;
        label = 194;
        break L258;
       } else {
        $br$0$ph$i = $592;$ssize$1$ph$i = $ssize$0$i;$tsize$0$ph$i = $ssize$0$$i;
        label = 184;
       }
      } else {
       $tsize$0323944$i = 0;
      }
     }
    }
   } while(0);
   L280: do {
    if ((label|0) == 184) {
     $604 = (0 - ($ssize$1$ph$i))|0;
     $605 = ($br$0$ph$i|0)!=((-1)|0);
     $606 = ($ssize$1$ph$i>>>0)<(2147483647);
     $or$cond5$i = $606 & $605;
     $607 = ($545>>>0)>($ssize$1$ph$i>>>0);
     $or$cond6$i = $607 & $or$cond5$i;
     do {
      if ($or$cond6$i) {
       $608 = HEAP32[(5644)>>2]|0;
       $609 = (($547) - ($ssize$1$ph$i))|0;
       $610 = (($609) + ($608))|0;
       $611 = (0 - ($608))|0;
       $612 = $610 & $611;
       $613 = ($612>>>0)<(2147483647);
       if ($613) {
        $614 = (_sbrk(($612|0))|0);
        $615 = ($614|0)==((-1)|0);
        if ($615) {
         (_sbrk(($604|0))|0);
         $tsize$0323944$i = $tsize$0$ph$i;
         break L280;
        } else {
         $616 = (($612) + ($ssize$1$ph$i))|0;
         $ssize$2$i = $616;
         break;
        }
       } else {
        $ssize$2$i = $ssize$1$ph$i;
       }
      } else {
       $ssize$2$i = $ssize$1$ph$i;
      }
     } while(0);
     $617 = ($br$0$ph$i|0)==((-1)|0);
     if ($617) {
      $tsize$0323944$i = $tsize$0$ph$i;
     } else {
      $tbase$255$i = $br$0$ph$i;$tsize$254$i = $ssize$2$i;
      label = 194;
      break L258;
     }
    }
   } while(0);
   $618 = HEAP32[(5608)>>2]|0;
   $619 = $618 | 4;
   HEAP32[(5608)>>2] = $619;
   $tsize$1$i = $tsize$0323944$i;
   label = 191;
  } else {
   $tsize$1$i = 0;
   label = 191;
  }
 } while(0);
 if ((label|0) == 191) {
  $620 = ($550>>>0)<(2147483647);
  if ($620) {
   $621 = (_sbrk(($550|0))|0);
   $622 = (_sbrk(0)|0);
   $623 = ($621|0)!=((-1)|0);
   $624 = ($622|0)!=((-1)|0);
   $or$cond3$i = $623 & $624;
   $625 = ($621>>>0)<($622>>>0);
   $or$cond8$i = $625 & $or$cond3$i;
   if ($or$cond8$i) {
    $626 = $622;
    $627 = $621;
    $628 = (($626) - ($627))|0;
    $629 = (($nb$0) + 40)|0;
    $630 = ($628>>>0)>($629>>>0);
    $$tsize$1$i = $630 ? $628 : $tsize$1$i;
    if ($630) {
     $tbase$255$i = $621;$tsize$254$i = $$tsize$1$i;
     label = 194;
    }
   }
  }
 }
 if ((label|0) == 194) {
  $631 = HEAP32[(5596)>>2]|0;
  $632 = (($631) + ($tsize$254$i))|0;
  HEAP32[(5596)>>2] = $632;
  $633 = HEAP32[(5600)>>2]|0;
  $634 = ($632>>>0)>($633>>>0);
  if ($634) {
   HEAP32[(5600)>>2] = $632;
  }
  $635 = HEAP32[(5188)>>2]|0;
  $636 = ($635|0)==(0|0);
  L299: do {
   if ($636) {
    $637 = HEAP32[(5180)>>2]|0;
    $638 = ($637|0)==(0|0);
    $639 = ($tbase$255$i>>>0)<($637>>>0);
    $or$cond9$i = $638 | $639;
    if ($or$cond9$i) {
     HEAP32[(5180)>>2] = $tbase$255$i;
    }
    HEAP32[(5612)>>2] = $tbase$255$i;
    HEAP32[(5616)>>2] = $tsize$254$i;
    HEAP32[(5624)>>2] = 0;
    $640 = HEAP32[5636>>2]|0;
    HEAP32[(5200)>>2] = $640;
    HEAP32[(5196)>>2] = -1;
    $i$02$i$i = 0;
    while(1) {
     $641 = $i$02$i$i << 1;
     $642 = (5204 + ($641<<2)|0);
     $$sum$i$i = (($641) + 3)|0;
     $643 = (5204 + ($$sum$i$i<<2)|0);
     HEAP32[$643>>2] = $642;
     $$sum1$i$i = (($641) + 2)|0;
     $644 = (5204 + ($$sum1$i$i<<2)|0);
     HEAP32[$644>>2] = $642;
     $645 = (($i$02$i$i) + 1)|0;
     $exitcond$i$i = ($645|0)==(32);
     if ($exitcond$i$i) {
      break;
     } else {
      $i$02$i$i = $645;
     }
    }
    $646 = (($tsize$254$i) + -40)|0;
    $647 = ((($tbase$255$i)) + 8|0);
    $648 = $647;
    $649 = $648 & 7;
    $650 = ($649|0)==(0);
    $651 = (0 - ($648))|0;
    $652 = $651 & 7;
    $653 = $650 ? 0 : $652;
    $654 = (($tbase$255$i) + ($653)|0);
    $655 = (($646) - ($653))|0;
    HEAP32[(5188)>>2] = $654;
    HEAP32[(5176)>>2] = $655;
    $656 = $655 | 1;
    $$sum$i13$i = (($653) + 4)|0;
    $657 = (($tbase$255$i) + ($$sum$i13$i)|0);
    HEAP32[$657>>2] = $656;
    $$sum2$i$i = (($tsize$254$i) + -36)|0;
    $658 = (($tbase$255$i) + ($$sum2$i$i)|0);
    HEAP32[$658>>2] = 40;
    $659 = HEAP32[(5652)>>2]|0;
    HEAP32[(5192)>>2] = $659;
   } else {
    $sp$084$i = (5612);
    while(1) {
     $660 = HEAP32[$sp$084$i>>2]|0;
     $661 = ((($sp$084$i)) + 4|0);
     $662 = HEAP32[$661>>2]|0;
     $663 = (($660) + ($662)|0);
     $664 = ($tbase$255$i|0)==($663|0);
     if ($664) {
      $$lcssa222 = $660;$$lcssa224 = $661;$$lcssa226 = $662;$sp$084$i$lcssa = $sp$084$i;
      label = 204;
      break;
     }
     $665 = ((($sp$084$i)) + 8|0);
     $666 = HEAP32[$665>>2]|0;
     $667 = ($666|0)==(0|0);
     if ($667) {
      break;
     } else {
      $sp$084$i = $666;
     }
    }
    if ((label|0) == 204) {
     $668 = ((($sp$084$i$lcssa)) + 12|0);
     $669 = HEAP32[$668>>2]|0;
     $670 = $669 & 8;
     $671 = ($670|0)==(0);
     if ($671) {
      $672 = ($635>>>0)>=($$lcssa222>>>0);
      $673 = ($635>>>0)<($tbase$255$i>>>0);
      $or$cond57$i = $673 & $672;
      if ($or$cond57$i) {
       $674 = (($$lcssa226) + ($tsize$254$i))|0;
       HEAP32[$$lcssa224>>2] = $674;
       $675 = HEAP32[(5176)>>2]|0;
       $676 = (($675) + ($tsize$254$i))|0;
       $677 = ((($635)) + 8|0);
       $678 = $677;
       $679 = $678 & 7;
       $680 = ($679|0)==(0);
       $681 = (0 - ($678))|0;
       $682 = $681 & 7;
       $683 = $680 ? 0 : $682;
       $684 = (($635) + ($683)|0);
       $685 = (($676) - ($683))|0;
       HEAP32[(5188)>>2] = $684;
       HEAP32[(5176)>>2] = $685;
       $686 = $685 | 1;
       $$sum$i17$i = (($683) + 4)|0;
       $687 = (($635) + ($$sum$i17$i)|0);
       HEAP32[$687>>2] = $686;
       $$sum2$i18$i = (($676) + 4)|0;
       $688 = (($635) + ($$sum2$i18$i)|0);
       HEAP32[$688>>2] = 40;
       $689 = HEAP32[(5652)>>2]|0;
       HEAP32[(5192)>>2] = $689;
       break;
      }
     }
    }
    $690 = HEAP32[(5180)>>2]|0;
    $691 = ($tbase$255$i>>>0)<($690>>>0);
    if ($691) {
     HEAP32[(5180)>>2] = $tbase$255$i;
     $755 = $tbase$255$i;
    } else {
     $755 = $690;
    }
    $692 = (($tbase$255$i) + ($tsize$254$i)|0);
    $sp$183$i = (5612);
    while(1) {
     $693 = HEAP32[$sp$183$i>>2]|0;
     $694 = ($693|0)==($692|0);
     if ($694) {
      $$lcssa219 = $sp$183$i;$sp$183$i$lcssa = $sp$183$i;
      label = 212;
      break;
     }
     $695 = ((($sp$183$i)) + 8|0);
     $696 = HEAP32[$695>>2]|0;
     $697 = ($696|0)==(0|0);
     if ($697) {
      $sp$0$i$i$i = (5612);
      break;
     } else {
      $sp$183$i = $696;
     }
    }
    if ((label|0) == 212) {
     $698 = ((($sp$183$i$lcssa)) + 12|0);
     $699 = HEAP32[$698>>2]|0;
     $700 = $699 & 8;
     $701 = ($700|0)==(0);
     if ($701) {
      HEAP32[$$lcssa219>>2] = $tbase$255$i;
      $702 = ((($sp$183$i$lcssa)) + 4|0);
      $703 = HEAP32[$702>>2]|0;
      $704 = (($703) + ($tsize$254$i))|0;
      HEAP32[$702>>2] = $704;
      $705 = ((($tbase$255$i)) + 8|0);
      $706 = $705;
      $707 = $706 & 7;
      $708 = ($707|0)==(0);
      $709 = (0 - ($706))|0;
      $710 = $709 & 7;
      $711 = $708 ? 0 : $710;
      $712 = (($tbase$255$i) + ($711)|0);
      $$sum112$i = (($tsize$254$i) + 8)|0;
      $713 = (($tbase$255$i) + ($$sum112$i)|0);
      $714 = $713;
      $715 = $714 & 7;
      $716 = ($715|0)==(0);
      $717 = (0 - ($714))|0;
      $718 = $717 & 7;
      $719 = $716 ? 0 : $718;
      $$sum113$i = (($719) + ($tsize$254$i))|0;
      $720 = (($tbase$255$i) + ($$sum113$i)|0);
      $721 = $720;
      $722 = $712;
      $723 = (($721) - ($722))|0;
      $$sum$i19$i = (($711) + ($nb$0))|0;
      $724 = (($tbase$255$i) + ($$sum$i19$i)|0);
      $725 = (($723) - ($nb$0))|0;
      $726 = $nb$0 | 3;
      $$sum1$i20$i = (($711) + 4)|0;
      $727 = (($tbase$255$i) + ($$sum1$i20$i)|0);
      HEAP32[$727>>2] = $726;
      $728 = ($720|0)==($635|0);
      L324: do {
       if ($728) {
        $729 = HEAP32[(5176)>>2]|0;
        $730 = (($729) + ($725))|0;
        HEAP32[(5176)>>2] = $730;
        HEAP32[(5188)>>2] = $724;
        $731 = $730 | 1;
        $$sum42$i$i = (($$sum$i19$i) + 4)|0;
        $732 = (($tbase$255$i) + ($$sum42$i$i)|0);
        HEAP32[$732>>2] = $731;
       } else {
        $733 = HEAP32[(5184)>>2]|0;
        $734 = ($720|0)==($733|0);
        if ($734) {
         $735 = HEAP32[(5172)>>2]|0;
         $736 = (($735) + ($725))|0;
         HEAP32[(5172)>>2] = $736;
         HEAP32[(5184)>>2] = $724;
         $737 = $736 | 1;
         $$sum40$i$i = (($$sum$i19$i) + 4)|0;
         $738 = (($tbase$255$i) + ($$sum40$i$i)|0);
         HEAP32[$738>>2] = $737;
         $$sum41$i$i = (($736) + ($$sum$i19$i))|0;
         $739 = (($tbase$255$i) + ($$sum41$i$i)|0);
         HEAP32[$739>>2] = $736;
         break;
        }
        $$sum2$i21$i = (($tsize$254$i) + 4)|0;
        $$sum114$i = (($$sum2$i21$i) + ($719))|0;
        $740 = (($tbase$255$i) + ($$sum114$i)|0);
        $741 = HEAP32[$740>>2]|0;
        $742 = $741 & 3;
        $743 = ($742|0)==(1);
        if ($743) {
         $744 = $741 & -8;
         $745 = $741 >>> 3;
         $746 = ($741>>>0)<(256);
         L332: do {
          if ($746) {
           $$sum3738$i$i = $719 | 8;
           $$sum124$i = (($$sum3738$i$i) + ($tsize$254$i))|0;
           $747 = (($tbase$255$i) + ($$sum124$i)|0);
           $748 = HEAP32[$747>>2]|0;
           $$sum39$i$i = (($tsize$254$i) + 12)|0;
           $$sum125$i = (($$sum39$i$i) + ($719))|0;
           $749 = (($tbase$255$i) + ($$sum125$i)|0);
           $750 = HEAP32[$749>>2]|0;
           $751 = $745 << 1;
           $752 = (5204 + ($751<<2)|0);
           $753 = ($748|0)==($752|0);
           do {
            if (!($753)) {
             $754 = ($748>>>0)<($755>>>0);
             if ($754) {
              _abort();
              // unreachable;
             }
             $756 = ((($748)) + 12|0);
             $757 = HEAP32[$756>>2]|0;
             $758 = ($757|0)==($720|0);
             if ($758) {
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $759 = ($750|0)==($748|0);
           if ($759) {
            $760 = 1 << $745;
            $761 = $760 ^ -1;
            $762 = HEAP32[5164>>2]|0;
            $763 = $762 & $761;
            HEAP32[5164>>2] = $763;
            break;
           }
           $764 = ($750|0)==($752|0);
           do {
            if ($764) {
             $$pre57$i$i = ((($750)) + 8|0);
             $$pre$phi58$i$iZ2D = $$pre57$i$i;
            } else {
             $765 = ($750>>>0)<($755>>>0);
             if ($765) {
              _abort();
              // unreachable;
             }
             $766 = ((($750)) + 8|0);
             $767 = HEAP32[$766>>2]|0;
             $768 = ($767|0)==($720|0);
             if ($768) {
              $$pre$phi58$i$iZ2D = $766;
              break;
             }
             _abort();
             // unreachable;
            }
           } while(0);
           $769 = ((($748)) + 12|0);
           HEAP32[$769>>2] = $750;
           HEAP32[$$pre$phi58$i$iZ2D>>2] = $748;
          } else {
           $$sum34$i$i = $719 | 24;
           $$sum115$i = (($$sum34$i$i) + ($tsize$254$i))|0;
           $770 = (($tbase$255$i) + ($$sum115$i)|0);
           $771 = HEAP32[$770>>2]|0;
           $$sum5$i$i = (($tsize$254$i) + 12)|0;
           $$sum116$i = (($$sum5$i$i) + ($719))|0;
           $772 = (($tbase$255$i) + ($$sum116$i)|0);
           $773 = HEAP32[$772>>2]|0;
           $774 = ($773|0)==($720|0);
           do {
            if ($774) {
             $$sum67$i$i = $719 | 16;
             $$sum122$i = (($$sum2$i21$i) + ($$sum67$i$i))|0;
             $784 = (($tbase$255$i) + ($$sum122$i)|0);
             $785 = HEAP32[$784>>2]|0;
             $786 = ($785|0)==(0|0);
             if ($786) {
              $$sum123$i = (($$sum67$i$i) + ($tsize$254$i))|0;
              $787 = (($tbase$255$i) + ($$sum123$i)|0);
              $788 = HEAP32[$787>>2]|0;
              $789 = ($788|0)==(0|0);
              if ($789) {
               $R$1$i$i = 0;
               break;
              } else {
               $R$0$i$i = $788;$RP$0$i$i = $787;
              }
             } else {
              $R$0$i$i = $785;$RP$0$i$i = $784;
             }
             while(1) {
              $790 = ((($R$0$i$i)) + 20|0);
              $791 = HEAP32[$790>>2]|0;
              $792 = ($791|0)==(0|0);
              if (!($792)) {
               $R$0$i$i = $791;$RP$0$i$i = $790;
               continue;
              }
              $793 = ((($R$0$i$i)) + 16|0);
              $794 = HEAP32[$793>>2]|0;
              $795 = ($794|0)==(0|0);
              if ($795) {
               $R$0$i$i$lcssa = $R$0$i$i;$RP$0$i$i$lcssa = $RP$0$i$i;
               break;
              } else {
               $R$0$i$i = $794;$RP$0$i$i = $793;
              }
             }
             $796 = ($RP$0$i$i$lcssa>>>0)<($755>>>0);
             if ($796) {
              _abort();
              // unreachable;
             } else {
              HEAP32[$RP$0$i$i$lcssa>>2] = 0;
              $R$1$i$i = $R$0$i$i$lcssa;
              break;
             }
            } else {
             $$sum3536$i$i = $719 | 8;
             $$sum117$i = (($$sum3536$i$i) + ($tsize$254$i))|0;
             $775 = (($tbase$255$i) + ($$sum117$i)|0);
             $776 = HEAP32[$775>>2]|0;
             $777 = ($776>>>0)<($755>>>0);
             if ($777) {
              _abort();
              // unreachable;
             }
             $778 = ((($776)) + 12|0);
             $779 = HEAP32[$778>>2]|0;
             $780 = ($779|0)==($720|0);
             if (!($780)) {
              _abort();
              // unreachable;
             }
             $781 = ((($773)) + 8|0);
             $782 = HEAP32[$781>>2]|0;
             $783 = ($782|0)==($720|0);
             if ($783) {
              HEAP32[$778>>2] = $773;
              HEAP32[$781>>2] = $776;
              $R$1$i$i = $773;
              break;
             } else {
              _abort();
              // unreachable;
             }
            }
           } while(0);
           $797 = ($771|0)==(0|0);
           if ($797) {
            break;
           }
           $$sum30$i$i = (($tsize$254$i) + 28)|0;
           $$sum118$i = (($$sum30$i$i) + ($719))|0;
           $798 = (($tbase$255$i) + ($$sum118$i)|0);
           $799 = HEAP32[$798>>2]|0;
           $800 = (5468 + ($799<<2)|0);
           $801 = HEAP32[$800>>2]|0;
           $802 = ($720|0)==($801|0);
           do {
            if ($802) {
             HEAP32[$800>>2] = $R$1$i$i;
             $cond$i$i = ($R$1$i$i|0)==(0|0);
             if (!($cond$i$i)) {
              break;
             }
             $803 = 1 << $799;
             $804 = $803 ^ -1;
             $805 = HEAP32[(5168)>>2]|0;
             $806 = $805 & $804;
             HEAP32[(5168)>>2] = $806;
             break L332;
            } else {
             $807 = HEAP32[(5180)>>2]|0;
             $808 = ($771>>>0)<($807>>>0);
             if ($808) {
              _abort();
              // unreachable;
             }
             $809 = ((($771)) + 16|0);
             $810 = HEAP32[$809>>2]|0;
             $811 = ($810|0)==($720|0);
             if ($811) {
              HEAP32[$809>>2] = $R$1$i$i;
             } else {
              $812 = ((($771)) + 20|0);
              HEAP32[$812>>2] = $R$1$i$i;
             }
             $813 = ($R$1$i$i|0)==(0|0);
             if ($813) {
              break L332;
             }
            }
           } while(0);
           $814 = HEAP32[(5180)>>2]|0;
           $815 = ($R$1$i$i>>>0)<($814>>>0);
           if ($815) {
            _abort();
            // unreachable;
           }
           $816 = ((($R$1$i$i)) + 24|0);
           HEAP32[$816>>2] = $771;
           $$sum3132$i$i = $719 | 16;
           $$sum119$i = (($$sum3132$i$i) + ($tsize$254$i))|0;
           $817 = (($tbase$255$i) + ($$sum119$i)|0);
           $818 = HEAP32[$817>>2]|0;
           $819 = ($818|0)==(0|0);
           do {
            if (!($819)) {
             $820 = ($818>>>0)<($814>>>0);
             if ($820) {
              _abort();
              // unreachable;
             } else {
              $821 = ((($R$1$i$i)) + 16|0);
              HEAP32[$821>>2] = $818;
              $822 = ((($818)) + 24|0);
              HEAP32[$822>>2] = $R$1$i$i;
              break;
             }
            }
           } while(0);
           $$sum120$i = (($$sum2$i21$i) + ($$sum3132$i$i))|0;
           $823 = (($tbase$255$i) + ($$sum120$i)|0);
           $824 = HEAP32[$823>>2]|0;
           $825 = ($824|0)==(0|0);
           if ($825) {
            break;
           }
           $826 = HEAP32[(5180)>>2]|0;
           $827 = ($824>>>0)<($826>>>0);
           if ($827) {
            _abort();
            // unreachable;
           } else {
            $828 = ((($R$1$i$i)) + 20|0);
            HEAP32[$828>>2] = $824;
            $829 = ((($824)) + 24|0);
            HEAP32[$829>>2] = $R$1$i$i;
            break;
           }
          }
         } while(0);
         $$sum9$i$i = $744 | $719;
         $$sum121$i = (($$sum9$i$i) + ($tsize$254$i))|0;
         $830 = (($tbase$255$i) + ($$sum121$i)|0);
         $831 = (($744) + ($725))|0;
         $oldfirst$0$i$i = $830;$qsize$0$i$i = $831;
        } else {
         $oldfirst$0$i$i = $720;$qsize$0$i$i = $725;
        }
        $832 = ((($oldfirst$0$i$i)) + 4|0);
        $833 = HEAP32[$832>>2]|0;
        $834 = $833 & -2;
        HEAP32[$832>>2] = $834;
        $835 = $qsize$0$i$i | 1;
        $$sum10$i$i = (($$sum$i19$i) + 4)|0;
        $836 = (($tbase$255$i) + ($$sum10$i$i)|0);
        HEAP32[$836>>2] = $835;
        $$sum11$i$i = (($qsize$0$i$i) + ($$sum$i19$i))|0;
        $837 = (($tbase$255$i) + ($$sum11$i$i)|0);
        HEAP32[$837>>2] = $qsize$0$i$i;
        $838 = $qsize$0$i$i >>> 3;
        $839 = ($qsize$0$i$i>>>0)<(256);
        if ($839) {
         $840 = $838 << 1;
         $841 = (5204 + ($840<<2)|0);
         $842 = HEAP32[5164>>2]|0;
         $843 = 1 << $838;
         $844 = $842 & $843;
         $845 = ($844|0)==(0);
         do {
          if ($845) {
           $846 = $842 | $843;
           HEAP32[5164>>2] = $846;
           $$pre$i22$i = (($840) + 2)|0;
           $$pre56$i$i = (5204 + ($$pre$i22$i<<2)|0);
           $$pre$phi$i23$iZ2D = $$pre56$i$i;$F4$0$i$i = $841;
          } else {
           $$sum29$i$i = (($840) + 2)|0;
           $847 = (5204 + ($$sum29$i$i<<2)|0);
           $848 = HEAP32[$847>>2]|0;
           $849 = HEAP32[(5180)>>2]|0;
           $850 = ($848>>>0)<($849>>>0);
           if (!($850)) {
            $$pre$phi$i23$iZ2D = $847;$F4$0$i$i = $848;
            break;
           }
           _abort();
           // unreachable;
          }
         } while(0);
         HEAP32[$$pre$phi$i23$iZ2D>>2] = $724;
         $851 = ((($F4$0$i$i)) + 12|0);
         HEAP32[$851>>2] = $724;
         $$sum27$i$i = (($$sum$i19$i) + 8)|0;
         $852 = (($tbase$255$i) + ($$sum27$i$i)|0);
         HEAP32[$852>>2] = $F4$0$i$i;
         $$sum28$i$i = (($$sum$i19$i) + 12)|0;
         $853 = (($tbase$255$i) + ($$sum28$i$i)|0);
         HEAP32[$853>>2] = $841;
         break;
        }
        $854 = $qsize$0$i$i >>> 8;
        $855 = ($854|0)==(0);
        do {
         if ($855) {
          $I7$0$i$i = 0;
         } else {
          $856 = ($qsize$0$i$i>>>0)>(16777215);
          if ($856) {
           $I7$0$i$i = 31;
           break;
          }
          $857 = (($854) + 1048320)|0;
          $858 = $857 >>> 16;
          $859 = $858 & 8;
          $860 = $854 << $859;
          $861 = (($860) + 520192)|0;
          $862 = $861 >>> 16;
          $863 = $862 & 4;
          $864 = $863 | $859;
          $865 = $860 << $863;
          $866 = (($865) + 245760)|0;
          $867 = $866 >>> 16;
          $868 = $867 & 2;
          $869 = $864 | $868;
          $870 = (14 - ($869))|0;
          $871 = $865 << $868;
          $872 = $871 >>> 15;
          $873 = (($870) + ($872))|0;
          $874 = $873 << 1;
          $875 = (($873) + 7)|0;
          $876 = $qsize$0$i$i >>> $875;
          $877 = $876 & 1;
          $878 = $877 | $874;
          $I7$0$i$i = $878;
         }
        } while(0);
        $879 = (5468 + ($I7$0$i$i<<2)|0);
        $$sum12$i$i = (($$sum$i19$i) + 28)|0;
        $880 = (($tbase$255$i) + ($$sum12$i$i)|0);
        HEAP32[$880>>2] = $I7$0$i$i;
        $$sum13$i$i = (($$sum$i19$i) + 16)|0;
        $881 = (($tbase$255$i) + ($$sum13$i$i)|0);
        $$sum14$i$i = (($$sum$i19$i) + 20)|0;
        $882 = (($tbase$255$i) + ($$sum14$i$i)|0);
        HEAP32[$882>>2] = 0;
        HEAP32[$881>>2] = 0;
        $883 = HEAP32[(5168)>>2]|0;
        $884 = 1 << $I7$0$i$i;
        $885 = $883 & $884;
        $886 = ($885|0)==(0);
        if ($886) {
         $887 = $883 | $884;
         HEAP32[(5168)>>2] = $887;
         HEAP32[$879>>2] = $724;
         $$sum15$i$i = (($$sum$i19$i) + 24)|0;
         $888 = (($tbase$255$i) + ($$sum15$i$i)|0);
         HEAP32[$888>>2] = $879;
         $$sum16$i$i = (($$sum$i19$i) + 12)|0;
         $889 = (($tbase$255$i) + ($$sum16$i$i)|0);
         HEAP32[$889>>2] = $724;
         $$sum17$i$i = (($$sum$i19$i) + 8)|0;
         $890 = (($tbase$255$i) + ($$sum17$i$i)|0);
         HEAP32[$890>>2] = $724;
         break;
        }
        $891 = HEAP32[$879>>2]|0;
        $892 = ((($891)) + 4|0);
        $893 = HEAP32[$892>>2]|0;
        $894 = $893 & -8;
        $895 = ($894|0)==($qsize$0$i$i|0);
        L418: do {
         if ($895) {
          $T$0$lcssa$i25$i = $891;
         } else {
          $896 = ($I7$0$i$i|0)==(31);
          $897 = $I7$0$i$i >>> 1;
          $898 = (25 - ($897))|0;
          $899 = $896 ? 0 : $898;
          $900 = $qsize$0$i$i << $899;
          $K8$051$i$i = $900;$T$050$i$i = $891;
          while(1) {
           $907 = $K8$051$i$i >>> 31;
           $908 = (((($T$050$i$i)) + 16|0) + ($907<<2)|0);
           $903 = HEAP32[$908>>2]|0;
           $909 = ($903|0)==(0|0);
           if ($909) {
            $$lcssa = $908;$T$050$i$i$lcssa = $T$050$i$i;
            break;
           }
           $901 = $K8$051$i$i << 1;
           $902 = ((($903)) + 4|0);
           $904 = HEAP32[$902>>2]|0;
           $905 = $904 & -8;
           $906 = ($905|0)==($qsize$0$i$i|0);
           if ($906) {
            $T$0$lcssa$i25$i = $903;
            break L418;
           } else {
            $K8$051$i$i = $901;$T$050$i$i = $903;
           }
          }
          $910 = HEAP32[(5180)>>2]|0;
          $911 = ($$lcssa>>>0)<($910>>>0);
          if ($911) {
           _abort();
           // unreachable;
          } else {
           HEAP32[$$lcssa>>2] = $724;
           $$sum23$i$i = (($$sum$i19$i) + 24)|0;
           $912 = (($tbase$255$i) + ($$sum23$i$i)|0);
           HEAP32[$912>>2] = $T$050$i$i$lcssa;
           $$sum24$i$i = (($$sum$i19$i) + 12)|0;
           $913 = (($tbase$255$i) + ($$sum24$i$i)|0);
           HEAP32[$913>>2] = $724;
           $$sum25$i$i = (($$sum$i19$i) + 8)|0;
           $914 = (($tbase$255$i) + ($$sum25$i$i)|0);
           HEAP32[$914>>2] = $724;
           break L324;
          }
         }
        } while(0);
        $915 = ((($T$0$lcssa$i25$i)) + 8|0);
        $916 = HEAP32[$915>>2]|0;
        $917 = HEAP32[(5180)>>2]|0;
        $918 = ($916>>>0)>=($917>>>0);
        $not$$i26$i = ($T$0$lcssa$i25$i>>>0)>=($917>>>0);
        $919 = $918 & $not$$i26$i;
        if ($919) {
         $920 = ((($916)) + 12|0);
         HEAP32[$920>>2] = $724;
         HEAP32[$915>>2] = $724;
         $$sum20$i$i = (($$sum$i19$i) + 8)|0;
         $921 = (($tbase$255$i) + ($$sum20$i$i)|0);
         HEAP32[$921>>2] = $916;
         $$sum21$i$i = (($$sum$i19$i) + 12)|0;
         $922 = (($tbase$255$i) + ($$sum21$i$i)|0);
         HEAP32[$922>>2] = $T$0$lcssa$i25$i;
         $$sum22$i$i = (($$sum$i19$i) + 24)|0;
         $923 = (($tbase$255$i) + ($$sum22$i$i)|0);
         HEAP32[$923>>2] = 0;
         break;
        } else {
         _abort();
         // unreachable;
        }
       }
      } while(0);
      $$sum1819$i$i = $711 | 8;
      $924 = (($tbase$255$i) + ($$sum1819$i$i)|0);
      $mem$0 = $924;
      return ($mem$0|0);
     } else {
      $sp$0$i$i$i = (5612);
     }
    }
    while(1) {
     $925 = HEAP32[$sp$0$i$i$i>>2]|0;
     $926 = ($925>>>0)>($635>>>0);
     if (!($926)) {
      $927 = ((($sp$0$i$i$i)) + 4|0);
      $928 = HEAP32[$927>>2]|0;
      $929 = (($925) + ($928)|0);
      $930 = ($929>>>0)>($635>>>0);
      if ($930) {
       $$lcssa215 = $925;$$lcssa216 = $928;$$lcssa217 = $929;
       break;
      }
     }
     $931 = ((($sp$0$i$i$i)) + 8|0);
     $932 = HEAP32[$931>>2]|0;
     $sp$0$i$i$i = $932;
    }
    $$sum$i14$i = (($$lcssa216) + -47)|0;
    $$sum1$i15$i = (($$lcssa216) + -39)|0;
    $933 = (($$lcssa215) + ($$sum1$i15$i)|0);
    $934 = $933;
    $935 = $934 & 7;
    $936 = ($935|0)==(0);
    $937 = (0 - ($934))|0;
    $938 = $937 & 7;
    $939 = $936 ? 0 : $938;
    $$sum2$i16$i = (($$sum$i14$i) + ($939))|0;
    $940 = (($$lcssa215) + ($$sum2$i16$i)|0);
    $941 = ((($635)) + 16|0);
    $942 = ($940>>>0)<($941>>>0);
    $943 = $942 ? $635 : $940;
    $944 = ((($943)) + 8|0);
    $945 = (($tsize$254$i) + -40)|0;
    $946 = ((($tbase$255$i)) + 8|0);
    $947 = $946;
    $948 = $947 & 7;
    $949 = ($948|0)==(0);
    $950 = (0 - ($947))|0;
    $951 = $950 & 7;
    $952 = $949 ? 0 : $951;
    $953 = (($tbase$255$i) + ($952)|0);
    $954 = (($945) - ($952))|0;
    HEAP32[(5188)>>2] = $953;
    HEAP32[(5176)>>2] = $954;
    $955 = $954 | 1;
    $$sum$i$i$i = (($952) + 4)|0;
    $956 = (($tbase$255$i) + ($$sum$i$i$i)|0);
    HEAP32[$956>>2] = $955;
    $$sum2$i$i$i = (($tsize$254$i) + -36)|0;
    $957 = (($tbase$255$i) + ($$sum2$i$i$i)|0);
    HEAP32[$957>>2] = 40;
    $958 = HEAP32[(5652)>>2]|0;
    HEAP32[(5192)>>2] = $958;
    $959 = ((($943)) + 4|0);
    HEAP32[$959>>2] = 27;
    ;HEAP32[$944>>2]=HEAP32[(5612)>>2]|0;HEAP32[$944+4>>2]=HEAP32[(5612)+4>>2]|0;HEAP32[$944+8>>2]=HEAP32[(5612)+8>>2]|0;HEAP32[$944+12>>2]=HEAP32[(5612)+12>>2]|0;
    HEAP32[(5612)>>2] = $tbase$255$i;
    HEAP32[(5616)>>2] = $tsize$254$i;
    HEAP32[(5624)>>2] = 0;
    HEAP32[(5620)>>2] = $944;
    $960 = ((($943)) + 28|0);
    HEAP32[$960>>2] = 7;
    $961 = ((($943)) + 32|0);
    $962 = ($961>>>0)<($$lcssa217>>>0);
    if ($962) {
     $964 = $960;
     while(1) {
      $963 = ((($964)) + 4|0);
      HEAP32[$963>>2] = 7;
      $965 = ((($964)) + 8|0);
      $966 = ($965>>>0)<($$lcssa217>>>0);
      if ($966) {
       $964 = $963;
      } else {
       break;
      }
     }
    }
    $967 = ($943|0)==($635|0);
    if (!($967)) {
     $968 = $943;
     $969 = $635;
     $970 = (($968) - ($969))|0;
     $971 = HEAP32[$959>>2]|0;
     $972 = $971 & -2;
     HEAP32[$959>>2] = $972;
     $973 = $970 | 1;
     $974 = ((($635)) + 4|0);
     HEAP32[$974>>2] = $973;
     HEAP32[$943>>2] = $970;
     $975 = $970 >>> 3;
     $976 = ($970>>>0)<(256);
     if ($976) {
      $977 = $975 << 1;
      $978 = (5204 + ($977<<2)|0);
      $979 = HEAP32[5164>>2]|0;
      $980 = 1 << $975;
      $981 = $979 & $980;
      $982 = ($981|0)==(0);
      if ($982) {
       $983 = $979 | $980;
       HEAP32[5164>>2] = $983;
       $$pre$i$i = (($977) + 2)|0;
       $$pre14$i$i = (5204 + ($$pre$i$i<<2)|0);
       $$pre$phi$i$iZ2D = $$pre14$i$i;$F$0$i$i = $978;
      } else {
       $$sum4$i$i = (($977) + 2)|0;
       $984 = (5204 + ($$sum4$i$i<<2)|0);
       $985 = HEAP32[$984>>2]|0;
       $986 = HEAP32[(5180)>>2]|0;
       $987 = ($985>>>0)<($986>>>0);
       if ($987) {
        _abort();
        // unreachable;
       } else {
        $$pre$phi$i$iZ2D = $984;$F$0$i$i = $985;
       }
      }
      HEAP32[$$pre$phi$i$iZ2D>>2] = $635;
      $988 = ((($F$0$i$i)) + 12|0);
      HEAP32[$988>>2] = $635;
      $989 = ((($635)) + 8|0);
      HEAP32[$989>>2] = $F$0$i$i;
      $990 = ((($635)) + 12|0);
      HEAP32[$990>>2] = $978;
      break;
     }
     $991 = $970 >>> 8;
     $992 = ($991|0)==(0);
     if ($992) {
      $I1$0$i$i = 0;
     } else {
      $993 = ($970>>>0)>(16777215);
      if ($993) {
       $I1$0$i$i = 31;
      } else {
       $994 = (($991) + 1048320)|0;
       $995 = $994 >>> 16;
       $996 = $995 & 8;
       $997 = $991 << $996;
       $998 = (($997) + 520192)|0;
       $999 = $998 >>> 16;
       $1000 = $999 & 4;
       $1001 = $1000 | $996;
       $1002 = $997 << $1000;
       $1003 = (($1002) + 245760)|0;
       $1004 = $1003 >>> 16;
       $1005 = $1004 & 2;
       $1006 = $1001 | $1005;
       $1007 = (14 - ($1006))|0;
       $1008 = $1002 << $1005;
       $1009 = $1008 >>> 15;
       $1010 = (($1007) + ($1009))|0;
       $1011 = $1010 << 1;
       $1012 = (($1010) + 7)|0;
       $1013 = $970 >>> $1012;
       $1014 = $1013 & 1;
       $1015 = $1014 | $1011;
       $I1$0$i$i = $1015;
      }
     }
     $1016 = (5468 + ($I1$0$i$i<<2)|0);
     $1017 = ((($635)) + 28|0);
     HEAP32[$1017>>2] = $I1$0$i$i;
     $1018 = ((($635)) + 20|0);
     HEAP32[$1018>>2] = 0;
     HEAP32[$941>>2] = 0;
     $1019 = HEAP32[(5168)>>2]|0;
     $1020 = 1 << $I1$0$i$i;
     $1021 = $1019 & $1020;
     $1022 = ($1021|0)==(0);
     if ($1022) {
      $1023 = $1019 | $1020;
      HEAP32[(5168)>>2] = $1023;
      HEAP32[$1016>>2] = $635;
      $1024 = ((($635)) + 24|0);
      HEAP32[$1024>>2] = $1016;
      $1025 = ((($635)) + 12|0);
      HEAP32[$1025>>2] = $635;
      $1026 = ((($635)) + 8|0);
      HEAP32[$1026>>2] = $635;
      break;
     }
     $1027 = HEAP32[$1016>>2]|0;
     $1028 = ((($1027)) + 4|0);
     $1029 = HEAP32[$1028>>2]|0;
     $1030 = $1029 & -8;
     $1031 = ($1030|0)==($970|0);
     L459: do {
      if ($1031) {
       $T$0$lcssa$i$i = $1027;
      } else {
       $1032 = ($I1$0$i$i|0)==(31);
       $1033 = $I1$0$i$i >>> 1;
       $1034 = (25 - ($1033))|0;
       $1035 = $1032 ? 0 : $1034;
       $1036 = $970 << $1035;
       $K2$07$i$i = $1036;$T$06$i$i = $1027;
       while(1) {
        $1043 = $K2$07$i$i >>> 31;
        $1044 = (((($T$06$i$i)) + 16|0) + ($1043<<2)|0);
        $1039 = HEAP32[$1044>>2]|0;
        $1045 = ($1039|0)==(0|0);
        if ($1045) {
         $$lcssa211 = $1044;$T$06$i$i$lcssa = $T$06$i$i;
         break;
        }
        $1037 = $K2$07$i$i << 1;
        $1038 = ((($1039)) + 4|0);
        $1040 = HEAP32[$1038>>2]|0;
        $1041 = $1040 & -8;
        $1042 = ($1041|0)==($970|0);
        if ($1042) {
         $T$0$lcssa$i$i = $1039;
         break L459;
        } else {
         $K2$07$i$i = $1037;$T$06$i$i = $1039;
        }
       }
       $1046 = HEAP32[(5180)>>2]|0;
       $1047 = ($$lcssa211>>>0)<($1046>>>0);
       if ($1047) {
        _abort();
        // unreachable;
       } else {
        HEAP32[$$lcssa211>>2] = $635;
        $1048 = ((($635)) + 24|0);
        HEAP32[$1048>>2] = $T$06$i$i$lcssa;
        $1049 = ((($635)) + 12|0);
        HEAP32[$1049>>2] = $635;
        $1050 = ((($635)) + 8|0);
        HEAP32[$1050>>2] = $635;
        break L299;
       }
      }
     } while(0);
     $1051 = ((($T$0$lcssa$i$i)) + 8|0);
     $1052 = HEAP32[$1051>>2]|0;
     $1053 = HEAP32[(5180)>>2]|0;
     $1054 = ($1052>>>0)>=($1053>>>0);
     $not$$i$i = ($T$0$lcssa$i$i>>>0)>=($1053>>>0);
     $1055 = $1054 & $not$$i$i;
     if ($1055) {
      $1056 = ((($1052)) + 12|0);
      HEAP32[$1056>>2] = $635;
      HEAP32[$1051>>2] = $635;
      $1057 = ((($635)) + 8|0);
      HEAP32[$1057>>2] = $1052;
      $1058 = ((($635)) + 12|0);
      HEAP32[$1058>>2] = $T$0$lcssa$i$i;
      $1059 = ((($635)) + 24|0);
      HEAP32[$1059>>2] = 0;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   }
  } while(0);
  $1060 = HEAP32[(5176)>>2]|0;
  $1061 = ($1060>>>0)>($nb$0>>>0);
  if ($1061) {
   $1062 = (($1060) - ($nb$0))|0;
   HEAP32[(5176)>>2] = $1062;
   $1063 = HEAP32[(5188)>>2]|0;
   $1064 = (($1063) + ($nb$0)|0);
   HEAP32[(5188)>>2] = $1064;
   $1065 = $1062 | 1;
   $$sum$i32 = (($nb$0) + 4)|0;
   $1066 = (($1063) + ($$sum$i32)|0);
   HEAP32[$1066>>2] = $1065;
   $1067 = $nb$0 | 3;
   $1068 = ((($1063)) + 4|0);
   HEAP32[$1068>>2] = $1067;
   $1069 = ((($1063)) + 8|0);
   $mem$0 = $1069;
   return ($mem$0|0);
  }
 }
 $1070 = (___errno_location()|0);
 HEAP32[$1070>>2] = 12;
 $mem$0 = 0;
 return ($mem$0|0);
}
function _free($mem) {
 $mem = $mem|0;
 var $$lcssa = 0, $$pre = 0, $$pre$phi59Z2D = 0, $$pre$phi61Z2D = 0, $$pre$phiZ2D = 0, $$pre57 = 0, $$pre58 = 0, $$pre60 = 0, $$sum = 0, $$sum11 = 0, $$sum12 = 0, $$sum13 = 0, $$sum14 = 0, $$sum1718 = 0, $$sum19 = 0, $$sum2 = 0, $$sum20 = 0, $$sum22 = 0, $$sum23 = 0, $$sum24 = 0;
 var $$sum25 = 0, $$sum26 = 0, $$sum27 = 0, $$sum28 = 0, $$sum29 = 0, $$sum3 = 0, $$sum30 = 0, $$sum31 = 0, $$sum5 = 0, $$sum67 = 0, $$sum8 = 0, $$sum9 = 0, $0 = 0, $1 = 0, $10 = 0, $100 = 0, $101 = 0, $102 = 0, $103 = 0, $104 = 0;
 var $105 = 0, $106 = 0, $107 = 0, $108 = 0, $109 = 0, $11 = 0, $110 = 0, $111 = 0, $112 = 0, $113 = 0, $114 = 0, $115 = 0, $116 = 0, $117 = 0, $118 = 0, $119 = 0, $12 = 0, $120 = 0, $121 = 0, $122 = 0;
 var $123 = 0, $124 = 0, $125 = 0, $126 = 0, $127 = 0, $128 = 0, $129 = 0, $13 = 0, $130 = 0, $131 = 0, $132 = 0, $133 = 0, $134 = 0, $135 = 0, $136 = 0, $137 = 0, $138 = 0, $139 = 0, $14 = 0, $140 = 0;
 var $141 = 0, $142 = 0, $143 = 0, $144 = 0, $145 = 0, $146 = 0, $147 = 0, $148 = 0, $149 = 0, $15 = 0, $150 = 0, $151 = 0, $152 = 0, $153 = 0, $154 = 0, $155 = 0, $156 = 0, $157 = 0, $158 = 0, $159 = 0;
 var $16 = 0, $160 = 0, $161 = 0, $162 = 0, $163 = 0, $164 = 0, $165 = 0, $166 = 0, $167 = 0, $168 = 0, $169 = 0, $17 = 0, $170 = 0, $171 = 0, $172 = 0, $173 = 0, $174 = 0, $175 = 0, $176 = 0, $177 = 0;
 var $178 = 0, $179 = 0, $18 = 0, $180 = 0, $181 = 0, $182 = 0, $183 = 0, $184 = 0, $185 = 0, $186 = 0, $187 = 0, $188 = 0, $189 = 0, $19 = 0, $190 = 0, $191 = 0, $192 = 0, $193 = 0, $194 = 0, $195 = 0;
 var $196 = 0, $197 = 0, $198 = 0, $199 = 0, $2 = 0, $20 = 0, $200 = 0, $201 = 0, $202 = 0, $203 = 0, $204 = 0, $205 = 0, $206 = 0, $207 = 0, $208 = 0, $209 = 0, $21 = 0, $210 = 0, $211 = 0, $212 = 0;
 var $213 = 0, $214 = 0, $215 = 0, $216 = 0, $217 = 0, $218 = 0, $219 = 0, $22 = 0, $220 = 0, $221 = 0, $222 = 0, $223 = 0, $224 = 0, $225 = 0, $226 = 0, $227 = 0, $228 = 0, $229 = 0, $23 = 0, $230 = 0;
 var $231 = 0, $232 = 0, $233 = 0, $234 = 0, $235 = 0, $236 = 0, $237 = 0, $238 = 0, $239 = 0, $24 = 0, $240 = 0, $241 = 0, $242 = 0, $243 = 0, $244 = 0, $245 = 0, $246 = 0, $247 = 0, $248 = 0, $249 = 0;
 var $25 = 0, $250 = 0, $251 = 0, $252 = 0, $253 = 0, $254 = 0, $255 = 0, $256 = 0, $257 = 0, $258 = 0, $259 = 0, $26 = 0, $260 = 0, $261 = 0, $262 = 0, $263 = 0, $264 = 0, $265 = 0, $266 = 0, $267 = 0;
 var $268 = 0, $269 = 0, $27 = 0, $270 = 0, $271 = 0, $272 = 0, $273 = 0, $274 = 0, $275 = 0, $276 = 0, $277 = 0, $278 = 0, $279 = 0, $28 = 0, $280 = 0, $281 = 0, $282 = 0, $283 = 0, $284 = 0, $285 = 0;
 var $286 = 0, $287 = 0, $288 = 0, $289 = 0, $29 = 0, $290 = 0, $291 = 0, $292 = 0, $293 = 0, $294 = 0, $295 = 0, $296 = 0, $297 = 0, $298 = 0, $299 = 0, $3 = 0, $30 = 0, $300 = 0, $301 = 0, $302 = 0;
 var $303 = 0, $304 = 0, $305 = 0, $306 = 0, $307 = 0, $308 = 0, $309 = 0, $31 = 0, $310 = 0, $311 = 0, $312 = 0, $313 = 0, $314 = 0, $315 = 0, $316 = 0, $317 = 0, $318 = 0, $319 = 0, $32 = 0, $320 = 0;
 var $321 = 0, $33 = 0, $34 = 0, $35 = 0, $36 = 0, $37 = 0, $38 = 0, $39 = 0, $4 = 0, $40 = 0, $41 = 0, $42 = 0, $43 = 0, $44 = 0, $45 = 0, $46 = 0, $47 = 0, $48 = 0, $49 = 0, $5 = 0;
 var $50 = 0, $51 = 0, $52 = 0, $53 = 0, $54 = 0, $55 = 0, $56 = 0, $57 = 0, $58 = 0, $59 = 0, $6 = 0, $60 = 0, $61 = 0, $62 = 0, $63 = 0, $64 = 0, $65 = 0, $66 = 0, $67 = 0, $68 = 0;
 var $69 = 0, $7 = 0, $70 = 0, $71 = 0, $72 = 0, $73 = 0, $74 = 0, $75 = 0, $76 = 0, $77 = 0, $78 = 0, $79 = 0, $8 = 0, $80 = 0, $81 = 0, $82 = 0, $83 = 0, $84 = 0, $85 = 0, $86 = 0;
 var $87 = 0, $88 = 0, $89 = 0, $9 = 0, $90 = 0, $91 = 0, $92 = 0, $93 = 0, $94 = 0, $95 = 0, $96 = 0, $97 = 0, $98 = 0, $99 = 0, $F16$0 = 0, $I18$0 = 0, $K19$052 = 0, $R$0 = 0, $R$0$lcssa = 0, $R$1 = 0;
 var $R7$0 = 0, $R7$0$lcssa = 0, $R7$1 = 0, $RP$0 = 0, $RP$0$lcssa = 0, $RP9$0 = 0, $RP9$0$lcssa = 0, $T$0$lcssa = 0, $T$051 = 0, $T$051$lcssa = 0, $cond = 0, $cond47 = 0, $not$ = 0, $p$0 = 0, $psize$0 = 0, $psize$1 = 0, $sp$0$i = 0, $sp$0$in$i = 0, label = 0, sp = 0;
 sp = STACKTOP;
 $0 = ($mem|0)==(0|0);
 if ($0) {
  return;
 }
 $1 = ((($mem)) + -8|0);
 $2 = HEAP32[(5180)>>2]|0;
 $3 = ($1>>>0)<($2>>>0);
 if ($3) {
  _abort();
  // unreachable;
 }
 $4 = ((($mem)) + -4|0);
 $5 = HEAP32[$4>>2]|0;
 $6 = $5 & 3;
 $7 = ($6|0)==(1);
 if ($7) {
  _abort();
  // unreachable;
 }
 $8 = $5 & -8;
 $$sum = (($8) + -8)|0;
 $9 = (($mem) + ($$sum)|0);
 $10 = $5 & 1;
 $11 = ($10|0)==(0);
 do {
  if ($11) {
   $12 = HEAP32[$1>>2]|0;
   $13 = ($6|0)==(0);
   if ($13) {
    return;
   }
   $$sum2 = (-8 - ($12))|0;
   $14 = (($mem) + ($$sum2)|0);
   $15 = (($12) + ($8))|0;
   $16 = ($14>>>0)<($2>>>0);
   if ($16) {
    _abort();
    // unreachable;
   }
   $17 = HEAP32[(5184)>>2]|0;
   $18 = ($14|0)==($17|0);
   if ($18) {
    $$sum3 = (($8) + -4)|0;
    $103 = (($mem) + ($$sum3)|0);
    $104 = HEAP32[$103>>2]|0;
    $105 = $104 & 3;
    $106 = ($105|0)==(3);
    if (!($106)) {
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    HEAP32[(5172)>>2] = $15;
    $107 = $104 & -2;
    HEAP32[$103>>2] = $107;
    $108 = $15 | 1;
    $$sum20 = (($$sum2) + 4)|0;
    $109 = (($mem) + ($$sum20)|0);
    HEAP32[$109>>2] = $108;
    HEAP32[$9>>2] = $15;
    return;
   }
   $19 = $12 >>> 3;
   $20 = ($12>>>0)<(256);
   if ($20) {
    $$sum30 = (($$sum2) + 8)|0;
    $21 = (($mem) + ($$sum30)|0);
    $22 = HEAP32[$21>>2]|0;
    $$sum31 = (($$sum2) + 12)|0;
    $23 = (($mem) + ($$sum31)|0);
    $24 = HEAP32[$23>>2]|0;
    $25 = $19 << 1;
    $26 = (5204 + ($25<<2)|0);
    $27 = ($22|0)==($26|0);
    if (!($27)) {
     $28 = ($22>>>0)<($2>>>0);
     if ($28) {
      _abort();
      // unreachable;
     }
     $29 = ((($22)) + 12|0);
     $30 = HEAP32[$29>>2]|0;
     $31 = ($30|0)==($14|0);
     if (!($31)) {
      _abort();
      // unreachable;
     }
    }
    $32 = ($24|0)==($22|0);
    if ($32) {
     $33 = 1 << $19;
     $34 = $33 ^ -1;
     $35 = HEAP32[5164>>2]|0;
     $36 = $35 & $34;
     HEAP32[5164>>2] = $36;
     $p$0 = $14;$psize$0 = $15;
     break;
    }
    $37 = ($24|0)==($26|0);
    if ($37) {
     $$pre60 = ((($24)) + 8|0);
     $$pre$phi61Z2D = $$pre60;
    } else {
     $38 = ($24>>>0)<($2>>>0);
     if ($38) {
      _abort();
      // unreachable;
     }
     $39 = ((($24)) + 8|0);
     $40 = HEAP32[$39>>2]|0;
     $41 = ($40|0)==($14|0);
     if ($41) {
      $$pre$phi61Z2D = $39;
     } else {
      _abort();
      // unreachable;
     }
    }
    $42 = ((($22)) + 12|0);
    HEAP32[$42>>2] = $24;
    HEAP32[$$pre$phi61Z2D>>2] = $22;
    $p$0 = $14;$psize$0 = $15;
    break;
   }
   $$sum22 = (($$sum2) + 24)|0;
   $43 = (($mem) + ($$sum22)|0);
   $44 = HEAP32[$43>>2]|0;
   $$sum23 = (($$sum2) + 12)|0;
   $45 = (($mem) + ($$sum23)|0);
   $46 = HEAP32[$45>>2]|0;
   $47 = ($46|0)==($14|0);
   do {
    if ($47) {
     $$sum25 = (($$sum2) + 20)|0;
     $57 = (($mem) + ($$sum25)|0);
     $58 = HEAP32[$57>>2]|0;
     $59 = ($58|0)==(0|0);
     if ($59) {
      $$sum24 = (($$sum2) + 16)|0;
      $60 = (($mem) + ($$sum24)|0);
      $61 = HEAP32[$60>>2]|0;
      $62 = ($61|0)==(0|0);
      if ($62) {
       $R$1 = 0;
       break;
      } else {
       $R$0 = $61;$RP$0 = $60;
      }
     } else {
      $R$0 = $58;$RP$0 = $57;
     }
     while(1) {
      $63 = ((($R$0)) + 20|0);
      $64 = HEAP32[$63>>2]|0;
      $65 = ($64|0)==(0|0);
      if (!($65)) {
       $R$0 = $64;$RP$0 = $63;
       continue;
      }
      $66 = ((($R$0)) + 16|0);
      $67 = HEAP32[$66>>2]|0;
      $68 = ($67|0)==(0|0);
      if ($68) {
       $R$0$lcssa = $R$0;$RP$0$lcssa = $RP$0;
       break;
      } else {
       $R$0 = $67;$RP$0 = $66;
      }
     }
     $69 = ($RP$0$lcssa>>>0)<($2>>>0);
     if ($69) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$RP$0$lcssa>>2] = 0;
      $R$1 = $R$0$lcssa;
      break;
     }
    } else {
     $$sum29 = (($$sum2) + 8)|0;
     $48 = (($mem) + ($$sum29)|0);
     $49 = HEAP32[$48>>2]|0;
     $50 = ($49>>>0)<($2>>>0);
     if ($50) {
      _abort();
      // unreachable;
     }
     $51 = ((($49)) + 12|0);
     $52 = HEAP32[$51>>2]|0;
     $53 = ($52|0)==($14|0);
     if (!($53)) {
      _abort();
      // unreachable;
     }
     $54 = ((($46)) + 8|0);
     $55 = HEAP32[$54>>2]|0;
     $56 = ($55|0)==($14|0);
     if ($56) {
      HEAP32[$51>>2] = $46;
      HEAP32[$54>>2] = $49;
      $R$1 = $46;
      break;
     } else {
      _abort();
      // unreachable;
     }
    }
   } while(0);
   $70 = ($44|0)==(0|0);
   if ($70) {
    $p$0 = $14;$psize$0 = $15;
   } else {
    $$sum26 = (($$sum2) + 28)|0;
    $71 = (($mem) + ($$sum26)|0);
    $72 = HEAP32[$71>>2]|0;
    $73 = (5468 + ($72<<2)|0);
    $74 = HEAP32[$73>>2]|0;
    $75 = ($14|0)==($74|0);
    if ($75) {
     HEAP32[$73>>2] = $R$1;
     $cond = ($R$1|0)==(0|0);
     if ($cond) {
      $76 = 1 << $72;
      $77 = $76 ^ -1;
      $78 = HEAP32[(5168)>>2]|0;
      $79 = $78 & $77;
      HEAP32[(5168)>>2] = $79;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    } else {
     $80 = HEAP32[(5180)>>2]|0;
     $81 = ($44>>>0)<($80>>>0);
     if ($81) {
      _abort();
      // unreachable;
     }
     $82 = ((($44)) + 16|0);
     $83 = HEAP32[$82>>2]|0;
     $84 = ($83|0)==($14|0);
     if ($84) {
      HEAP32[$82>>2] = $R$1;
     } else {
      $85 = ((($44)) + 20|0);
      HEAP32[$85>>2] = $R$1;
     }
     $86 = ($R$1|0)==(0|0);
     if ($86) {
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
    $87 = HEAP32[(5180)>>2]|0;
    $88 = ($R$1>>>0)<($87>>>0);
    if ($88) {
     _abort();
     // unreachable;
    }
    $89 = ((($R$1)) + 24|0);
    HEAP32[$89>>2] = $44;
    $$sum27 = (($$sum2) + 16)|0;
    $90 = (($mem) + ($$sum27)|0);
    $91 = HEAP32[$90>>2]|0;
    $92 = ($91|0)==(0|0);
    do {
     if (!($92)) {
      $93 = ($91>>>0)<($87>>>0);
      if ($93) {
       _abort();
       // unreachable;
      } else {
       $94 = ((($R$1)) + 16|0);
       HEAP32[$94>>2] = $91;
       $95 = ((($91)) + 24|0);
       HEAP32[$95>>2] = $R$1;
       break;
      }
     }
    } while(0);
    $$sum28 = (($$sum2) + 20)|0;
    $96 = (($mem) + ($$sum28)|0);
    $97 = HEAP32[$96>>2]|0;
    $98 = ($97|0)==(0|0);
    if ($98) {
     $p$0 = $14;$psize$0 = $15;
    } else {
     $99 = HEAP32[(5180)>>2]|0;
     $100 = ($97>>>0)<($99>>>0);
     if ($100) {
      _abort();
      // unreachable;
     } else {
      $101 = ((($R$1)) + 20|0);
      HEAP32[$101>>2] = $97;
      $102 = ((($97)) + 24|0);
      HEAP32[$102>>2] = $R$1;
      $p$0 = $14;$psize$0 = $15;
      break;
     }
    }
   }
  } else {
   $p$0 = $1;$psize$0 = $8;
  }
 } while(0);
 $110 = ($p$0>>>0)<($9>>>0);
 if (!($110)) {
  _abort();
  // unreachable;
 }
 $$sum19 = (($8) + -4)|0;
 $111 = (($mem) + ($$sum19)|0);
 $112 = HEAP32[$111>>2]|0;
 $113 = $112 & 1;
 $114 = ($113|0)==(0);
 if ($114) {
  _abort();
  // unreachable;
 }
 $115 = $112 & 2;
 $116 = ($115|0)==(0);
 if ($116) {
  $117 = HEAP32[(5188)>>2]|0;
  $118 = ($9|0)==($117|0);
  if ($118) {
   $119 = HEAP32[(5176)>>2]|0;
   $120 = (($119) + ($psize$0))|0;
   HEAP32[(5176)>>2] = $120;
   HEAP32[(5188)>>2] = $p$0;
   $121 = $120 | 1;
   $122 = ((($p$0)) + 4|0);
   HEAP32[$122>>2] = $121;
   $123 = HEAP32[(5184)>>2]|0;
   $124 = ($p$0|0)==($123|0);
   if (!($124)) {
    return;
   }
   HEAP32[(5184)>>2] = 0;
   HEAP32[(5172)>>2] = 0;
   return;
  }
  $125 = HEAP32[(5184)>>2]|0;
  $126 = ($9|0)==($125|0);
  if ($126) {
   $127 = HEAP32[(5172)>>2]|0;
   $128 = (($127) + ($psize$0))|0;
   HEAP32[(5172)>>2] = $128;
   HEAP32[(5184)>>2] = $p$0;
   $129 = $128 | 1;
   $130 = ((($p$0)) + 4|0);
   HEAP32[$130>>2] = $129;
   $131 = (($p$0) + ($128)|0);
   HEAP32[$131>>2] = $128;
   return;
  }
  $132 = $112 & -8;
  $133 = (($132) + ($psize$0))|0;
  $134 = $112 >>> 3;
  $135 = ($112>>>0)<(256);
  do {
   if ($135) {
    $136 = (($mem) + ($8)|0);
    $137 = HEAP32[$136>>2]|0;
    $$sum1718 = $8 | 4;
    $138 = (($mem) + ($$sum1718)|0);
    $139 = HEAP32[$138>>2]|0;
    $140 = $134 << 1;
    $141 = (5204 + ($140<<2)|0);
    $142 = ($137|0)==($141|0);
    if (!($142)) {
     $143 = HEAP32[(5180)>>2]|0;
     $144 = ($137>>>0)<($143>>>0);
     if ($144) {
      _abort();
      // unreachable;
     }
     $145 = ((($137)) + 12|0);
     $146 = HEAP32[$145>>2]|0;
     $147 = ($146|0)==($9|0);
     if (!($147)) {
      _abort();
      // unreachable;
     }
    }
    $148 = ($139|0)==($137|0);
    if ($148) {
     $149 = 1 << $134;
     $150 = $149 ^ -1;
     $151 = HEAP32[5164>>2]|0;
     $152 = $151 & $150;
     HEAP32[5164>>2] = $152;
     break;
    }
    $153 = ($139|0)==($141|0);
    if ($153) {
     $$pre58 = ((($139)) + 8|0);
     $$pre$phi59Z2D = $$pre58;
    } else {
     $154 = HEAP32[(5180)>>2]|0;
     $155 = ($139>>>0)<($154>>>0);
     if ($155) {
      _abort();
      // unreachable;
     }
     $156 = ((($139)) + 8|0);
     $157 = HEAP32[$156>>2]|0;
     $158 = ($157|0)==($9|0);
     if ($158) {
      $$pre$phi59Z2D = $156;
     } else {
      _abort();
      // unreachable;
     }
    }
    $159 = ((($137)) + 12|0);
    HEAP32[$159>>2] = $139;
    HEAP32[$$pre$phi59Z2D>>2] = $137;
   } else {
    $$sum5 = (($8) + 16)|0;
    $160 = (($mem) + ($$sum5)|0);
    $161 = HEAP32[$160>>2]|0;
    $$sum67 = $8 | 4;
    $162 = (($mem) + ($$sum67)|0);
    $163 = HEAP32[$162>>2]|0;
    $164 = ($163|0)==($9|0);
    do {
     if ($164) {
      $$sum9 = (($8) + 12)|0;
      $175 = (($mem) + ($$sum9)|0);
      $176 = HEAP32[$175>>2]|0;
      $177 = ($176|0)==(0|0);
      if ($177) {
       $$sum8 = (($8) + 8)|0;
       $178 = (($mem) + ($$sum8)|0);
       $179 = HEAP32[$178>>2]|0;
       $180 = ($179|0)==(0|0);
       if ($180) {
        $R7$1 = 0;
        break;
       } else {
        $R7$0 = $179;$RP9$0 = $178;
       }
      } else {
       $R7$0 = $176;$RP9$0 = $175;
      }
      while(1) {
       $181 = ((($R7$0)) + 20|0);
       $182 = HEAP32[$181>>2]|0;
       $183 = ($182|0)==(0|0);
       if (!($183)) {
        $R7$0 = $182;$RP9$0 = $181;
        continue;
       }
       $184 = ((($R7$0)) + 16|0);
       $185 = HEAP32[$184>>2]|0;
       $186 = ($185|0)==(0|0);
       if ($186) {
        $R7$0$lcssa = $R7$0;$RP9$0$lcssa = $RP9$0;
        break;
       } else {
        $R7$0 = $185;$RP9$0 = $184;
       }
      }
      $187 = HEAP32[(5180)>>2]|0;
      $188 = ($RP9$0$lcssa>>>0)<($187>>>0);
      if ($188) {
       _abort();
       // unreachable;
      } else {
       HEAP32[$RP9$0$lcssa>>2] = 0;
       $R7$1 = $R7$0$lcssa;
       break;
      }
     } else {
      $165 = (($mem) + ($8)|0);
      $166 = HEAP32[$165>>2]|0;
      $167 = HEAP32[(5180)>>2]|0;
      $168 = ($166>>>0)<($167>>>0);
      if ($168) {
       _abort();
       // unreachable;
      }
      $169 = ((($166)) + 12|0);
      $170 = HEAP32[$169>>2]|0;
      $171 = ($170|0)==($9|0);
      if (!($171)) {
       _abort();
       // unreachable;
      }
      $172 = ((($163)) + 8|0);
      $173 = HEAP32[$172>>2]|0;
      $174 = ($173|0)==($9|0);
      if ($174) {
       HEAP32[$169>>2] = $163;
       HEAP32[$172>>2] = $166;
       $R7$1 = $163;
       break;
      } else {
       _abort();
       // unreachable;
      }
     }
    } while(0);
    $189 = ($161|0)==(0|0);
    if (!($189)) {
     $$sum12 = (($8) + 20)|0;
     $190 = (($mem) + ($$sum12)|0);
     $191 = HEAP32[$190>>2]|0;
     $192 = (5468 + ($191<<2)|0);
     $193 = HEAP32[$192>>2]|0;
     $194 = ($9|0)==($193|0);
     if ($194) {
      HEAP32[$192>>2] = $R7$1;
      $cond47 = ($R7$1|0)==(0|0);
      if ($cond47) {
       $195 = 1 << $191;
       $196 = $195 ^ -1;
       $197 = HEAP32[(5168)>>2]|0;
       $198 = $197 & $196;
       HEAP32[(5168)>>2] = $198;
       break;
      }
     } else {
      $199 = HEAP32[(5180)>>2]|0;
      $200 = ($161>>>0)<($199>>>0);
      if ($200) {
       _abort();
       // unreachable;
      }
      $201 = ((($161)) + 16|0);
      $202 = HEAP32[$201>>2]|0;
      $203 = ($202|0)==($9|0);
      if ($203) {
       HEAP32[$201>>2] = $R7$1;
      } else {
       $204 = ((($161)) + 20|0);
       HEAP32[$204>>2] = $R7$1;
      }
      $205 = ($R7$1|0)==(0|0);
      if ($205) {
       break;
      }
     }
     $206 = HEAP32[(5180)>>2]|0;
     $207 = ($R7$1>>>0)<($206>>>0);
     if ($207) {
      _abort();
      // unreachable;
     }
     $208 = ((($R7$1)) + 24|0);
     HEAP32[$208>>2] = $161;
     $$sum13 = (($8) + 8)|0;
     $209 = (($mem) + ($$sum13)|0);
     $210 = HEAP32[$209>>2]|0;
     $211 = ($210|0)==(0|0);
     do {
      if (!($211)) {
       $212 = ($210>>>0)<($206>>>0);
       if ($212) {
        _abort();
        // unreachable;
       } else {
        $213 = ((($R7$1)) + 16|0);
        HEAP32[$213>>2] = $210;
        $214 = ((($210)) + 24|0);
        HEAP32[$214>>2] = $R7$1;
        break;
       }
      }
     } while(0);
     $$sum14 = (($8) + 12)|0;
     $215 = (($mem) + ($$sum14)|0);
     $216 = HEAP32[$215>>2]|0;
     $217 = ($216|0)==(0|0);
     if (!($217)) {
      $218 = HEAP32[(5180)>>2]|0;
      $219 = ($216>>>0)<($218>>>0);
      if ($219) {
       _abort();
       // unreachable;
      } else {
       $220 = ((($R7$1)) + 20|0);
       HEAP32[$220>>2] = $216;
       $221 = ((($216)) + 24|0);
       HEAP32[$221>>2] = $R7$1;
       break;
      }
     }
    }
   }
  } while(0);
  $222 = $133 | 1;
  $223 = ((($p$0)) + 4|0);
  HEAP32[$223>>2] = $222;
  $224 = (($p$0) + ($133)|0);
  HEAP32[$224>>2] = $133;
  $225 = HEAP32[(5184)>>2]|0;
  $226 = ($p$0|0)==($225|0);
  if ($226) {
   HEAP32[(5172)>>2] = $133;
   return;
  } else {
   $psize$1 = $133;
  }
 } else {
  $227 = $112 & -2;
  HEAP32[$111>>2] = $227;
  $228 = $psize$0 | 1;
  $229 = ((($p$0)) + 4|0);
  HEAP32[$229>>2] = $228;
  $230 = (($p$0) + ($psize$0)|0);
  HEAP32[$230>>2] = $psize$0;
  $psize$1 = $psize$0;
 }
 $231 = $psize$1 >>> 3;
 $232 = ($psize$1>>>0)<(256);
 if ($232) {
  $233 = $231 << 1;
  $234 = (5204 + ($233<<2)|0);
  $235 = HEAP32[5164>>2]|0;
  $236 = 1 << $231;
  $237 = $235 & $236;
  $238 = ($237|0)==(0);
  if ($238) {
   $239 = $235 | $236;
   HEAP32[5164>>2] = $239;
   $$pre = (($233) + 2)|0;
   $$pre57 = (5204 + ($$pre<<2)|0);
   $$pre$phiZ2D = $$pre57;$F16$0 = $234;
  } else {
   $$sum11 = (($233) + 2)|0;
   $240 = (5204 + ($$sum11<<2)|0);
   $241 = HEAP32[$240>>2]|0;
   $242 = HEAP32[(5180)>>2]|0;
   $243 = ($241>>>0)<($242>>>0);
   if ($243) {
    _abort();
    // unreachable;
   } else {
    $$pre$phiZ2D = $240;$F16$0 = $241;
   }
  }
  HEAP32[$$pre$phiZ2D>>2] = $p$0;
  $244 = ((($F16$0)) + 12|0);
  HEAP32[$244>>2] = $p$0;
  $245 = ((($p$0)) + 8|0);
  HEAP32[$245>>2] = $F16$0;
  $246 = ((($p$0)) + 12|0);
  HEAP32[$246>>2] = $234;
  return;
 }
 $247 = $psize$1 >>> 8;
 $248 = ($247|0)==(0);
 if ($248) {
  $I18$0 = 0;
 } else {
  $249 = ($psize$1>>>0)>(16777215);
  if ($249) {
   $I18$0 = 31;
  } else {
   $250 = (($247) + 1048320)|0;
   $251 = $250 >>> 16;
   $252 = $251 & 8;
   $253 = $247 << $252;
   $254 = (($253) + 520192)|0;
   $255 = $254 >>> 16;
   $256 = $255 & 4;
   $257 = $256 | $252;
   $258 = $253 << $256;
   $259 = (($258) + 245760)|0;
   $260 = $259 >>> 16;
   $261 = $260 & 2;
   $262 = $257 | $261;
   $263 = (14 - ($262))|0;
   $264 = $258 << $261;
   $265 = $264 >>> 15;
   $266 = (($263) + ($265))|0;
   $267 = $266 << 1;
   $268 = (($266) + 7)|0;
   $269 = $psize$1 >>> $268;
   $270 = $269 & 1;
   $271 = $270 | $267;
   $I18$0 = $271;
  }
 }
 $272 = (5468 + ($I18$0<<2)|0);
 $273 = ((($p$0)) + 28|0);
 HEAP32[$273>>2] = $I18$0;
 $274 = ((($p$0)) + 16|0);
 $275 = ((($p$0)) + 20|0);
 HEAP32[$275>>2] = 0;
 HEAP32[$274>>2] = 0;
 $276 = HEAP32[(5168)>>2]|0;
 $277 = 1 << $I18$0;
 $278 = $276 & $277;
 $279 = ($278|0)==(0);
 L199: do {
  if ($279) {
   $280 = $276 | $277;
   HEAP32[(5168)>>2] = $280;
   HEAP32[$272>>2] = $p$0;
   $281 = ((($p$0)) + 24|0);
   HEAP32[$281>>2] = $272;
   $282 = ((($p$0)) + 12|0);
   HEAP32[$282>>2] = $p$0;
   $283 = ((($p$0)) + 8|0);
   HEAP32[$283>>2] = $p$0;
  } else {
   $284 = HEAP32[$272>>2]|0;
   $285 = ((($284)) + 4|0);
   $286 = HEAP32[$285>>2]|0;
   $287 = $286 & -8;
   $288 = ($287|0)==($psize$1|0);
   L202: do {
    if ($288) {
     $T$0$lcssa = $284;
    } else {
     $289 = ($I18$0|0)==(31);
     $290 = $I18$0 >>> 1;
     $291 = (25 - ($290))|0;
     $292 = $289 ? 0 : $291;
     $293 = $psize$1 << $292;
     $K19$052 = $293;$T$051 = $284;
     while(1) {
      $300 = $K19$052 >>> 31;
      $301 = (((($T$051)) + 16|0) + ($300<<2)|0);
      $296 = HEAP32[$301>>2]|0;
      $302 = ($296|0)==(0|0);
      if ($302) {
       $$lcssa = $301;$T$051$lcssa = $T$051;
       break;
      }
      $294 = $K19$052 << 1;
      $295 = ((($296)) + 4|0);
      $297 = HEAP32[$295>>2]|0;
      $298 = $297 & -8;
      $299 = ($298|0)==($psize$1|0);
      if ($299) {
       $T$0$lcssa = $296;
       break L202;
      } else {
       $K19$052 = $294;$T$051 = $296;
      }
     }
     $303 = HEAP32[(5180)>>2]|0;
     $304 = ($$lcssa>>>0)<($303>>>0);
     if ($304) {
      _abort();
      // unreachable;
     } else {
      HEAP32[$$lcssa>>2] = $p$0;
      $305 = ((($p$0)) + 24|0);
      HEAP32[$305>>2] = $T$051$lcssa;
      $306 = ((($p$0)) + 12|0);
      HEAP32[$306>>2] = $p$0;
      $307 = ((($p$0)) + 8|0);
      HEAP32[$307>>2] = $p$0;
      break L199;
     }
    }
   } while(0);
   $308 = ((($T$0$lcssa)) + 8|0);
   $309 = HEAP32[$308>>2]|0;
   $310 = HEAP32[(5180)>>2]|0;
   $311 = ($309>>>0)>=($310>>>0);
   $not$ = ($T$0$lcssa>>>0)>=($310>>>0);
   $312 = $311 & $not$;
   if ($312) {
    $313 = ((($309)) + 12|0);
    HEAP32[$313>>2] = $p$0;
    HEAP32[$308>>2] = $p$0;
    $314 = ((($p$0)) + 8|0);
    HEAP32[$314>>2] = $309;
    $315 = ((($p$0)) + 12|0);
    HEAP32[$315>>2] = $T$0$lcssa;
    $316 = ((($p$0)) + 24|0);
    HEAP32[$316>>2] = 0;
    break;
   } else {
    _abort();
    // unreachable;
   }
  }
 } while(0);
 $317 = HEAP32[(5196)>>2]|0;
 $318 = (($317) + -1)|0;
 HEAP32[(5196)>>2] = $318;
 $319 = ($318|0)==(0);
 if ($319) {
  $sp$0$in$i = (5620);
 } else {
  return;
 }
 while(1) {
  $sp$0$i = HEAP32[$sp$0$in$i>>2]|0;
  $320 = ($sp$0$i|0)==(0|0);
  $321 = ((($sp$0$i)) + 8|0);
  if ($320) {
   break;
  } else {
   $sp$0$in$i = $321;
  }
 }
 HEAP32[(5196)>>2] = -1;
 return;
}
function runPostSets() {
}
function _memcpy(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if ((num|0) >= 4096) return _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
    ret = dest|0;
    if ((dest&3) == (src&3)) {
      while (dest & 3) {
        if ((num|0) == 0) return ret|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      while ((num|0) >= 4) {
        HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
        dest = (dest+4)|0;
        src = (src+4)|0;
        num = (num-4)|0;
      }
    }
    while ((num|0) > 0) {
      HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      dest = (dest+1)|0;
      src = (src+1)|0;
      num = (num-1)|0;
    }
    return ret|0;
}
function _memset(ptr, value, num) {
    ptr = ptr|0; value = value|0; num = num|0;
    var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
    stop = (ptr + num)|0;
    if ((num|0) >= 20) {
      // This is unaligned, but quite large, so work hard to get to aligned settings
      value = value & 0xff;
      unaligned = ptr & 3;
      value4 = value | (value << 8) | (value << 16) | (value << 24);
      stop4 = stop & ~3;
      if (unaligned) {
        unaligned = (ptr + 4 - unaligned)|0;
        while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
      }
      while ((ptr|0) < (stop4|0)) {
        HEAP32[((ptr)>>2)]=value4;
        ptr = (ptr+4)|0;
      }
    }
    while ((ptr|0) < (stop|0)) {
      HEAP8[((ptr)>>0)]=value;
      ptr = (ptr+1)|0;
    }
    return (ptr-num)|0;
}
function _i64Subtract(a, b, c, d) {
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a - c)>>>0;
    h = (b - d)>>>0;
    h = (b - d - (((c>>>0) > (a>>>0))|0))>>>0; // Borrow one from high word to low word on underflow.
    return ((tempRet0 = h,l|0)|0);
}
function _i64Add(a, b, c, d) {
    /*
      x = a + b*2^32
      y = c + d*2^32
      result = l + h*2^32
    */
    a = a|0; b = b|0; c = c|0; d = d|0;
    var l = 0, h = 0;
    l = (a + c)>>>0;
    h = (b + d + (((l>>>0) < (a>>>0))|0))>>>0; // Add carry from low word to high word on overflow.
    return ((tempRet0 = h,l|0)|0);
}
function _memmove(dest, src, num) {
    dest = dest|0; src = src|0; num = num|0;
    var ret = 0;
    if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
      // Unlikely case: Copy backwards in a safe manner
      ret = dest;
      src = (src + num)|0;
      dest = (dest + num)|0;
      while ((num|0) > 0) {
        dest = (dest - 1)|0;
        src = (src - 1)|0;
        num = (num - 1)|0;
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
      }
      dest = ret;
    } else {
      _memcpy(dest, src, num) | 0;
    }
    return dest | 0;
}
function _bitshift64Lshr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >>> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = 0;
    return (high >>> (bits - 32))|0;
}
function _bitshift64Shl(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = (high << bits) | ((low&(ander << (32 - bits))) >>> (32 - bits));
      return low << bits;
    }
    tempRet0 = low << (bits - 32);
    return 0;
}
function _bitshift64Ashr(low, high, bits) {
    low = low|0; high = high|0; bits = bits|0;
    var ander = 0;
    if ((bits|0) < 32) {
      ander = ((1 << bits) - 1)|0;
      tempRet0 = high >> bits;
      return (low >>> bits) | ((high&ander) << (32 - bits));
    }
    tempRet0 = (high|0) < 0 ? -1 : 0;
    return (high >> (bits - 32))|0;
  }
function _llvm_cttz_i32(x) {
    x = x|0;
    var ret = 0;
    ret = ((HEAP8[(((cttz_i8)+(x & 0xff))>>0)])|0);
    if ((ret|0) < 8) return ret|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 8)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 8)|0;
    ret = ((HEAP8[(((cttz_i8)+((x >> 16)&0xff))>>0)])|0);
    if ((ret|0) < 8) return (ret + 16)|0;
    return (((HEAP8[(((cttz_i8)+(x >>> 24))>>0)])|0) + 24)|0;
  }

// ======== compiled code from system/lib/compiler-rt , see readme therein
function ___muldsi3($a, $b) {
  $a = $a | 0;
  $b = $b | 0;
  var $1 = 0, $2 = 0, $3 = 0, $6 = 0, $8 = 0, $11 = 0, $12 = 0;
  $1 = $a & 65535;
  $2 = $b & 65535;
  $3 = Math_imul($2, $1) | 0;
  $6 = $a >>> 16;
  $8 = ($3 >>> 16) + (Math_imul($2, $6) | 0) | 0;
  $11 = $b >>> 16;
  $12 = Math_imul($11, $1) | 0;
  return (tempRet0 = (($8 >>> 16) + (Math_imul($11, $6) | 0) | 0) + ((($8 & 65535) + $12 | 0) >>> 16) | 0, 0 | ($8 + $12 << 16 | $3 & 65535)) | 0;
}
function ___divdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $7$0 = 0, $7$1 = 0, $8$0 = 0, $10$0 = 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  $7$0 = $2$0 ^ $1$0;
  $7$1 = $2$1 ^ $1$1;
  $8$0 = ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, 0) | 0;
  $10$0 = _i64Subtract($8$0 ^ $7$0, tempRet0 ^ $7$1, $7$0, $7$1) | 0;
  return $10$0 | 0;
}
function ___remdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, $1$0 = 0, $1$1 = 0, $2$0 = 0, $2$1 = 0, $4$0 = 0, $4$1 = 0, $6$0 = 0, $10$0 = 0, $10$1 = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 16 | 0;
  $rem = __stackBase__ | 0;
  $1$0 = $a$1 >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $1$1 = (($a$1 | 0) < 0 ? -1 : 0) >> 31 | (($a$1 | 0) < 0 ? -1 : 0) << 1;
  $2$0 = $b$1 >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $2$1 = (($b$1 | 0) < 0 ? -1 : 0) >> 31 | (($b$1 | 0) < 0 ? -1 : 0) << 1;
  $4$0 = _i64Subtract($1$0 ^ $a$0, $1$1 ^ $a$1, $1$0, $1$1) | 0;
  $4$1 = tempRet0;
  $6$0 = _i64Subtract($2$0 ^ $b$0, $2$1 ^ $b$1, $2$0, $2$1) | 0;
  ___udivmoddi4($4$0, $4$1, $6$0, tempRet0, $rem) | 0;
  $10$0 = _i64Subtract(HEAP32[$rem >> 2] ^ $1$0, HEAP32[$rem + 4 >> 2] ^ $1$1, $1$0, $1$1) | 0;
  $10$1 = tempRet0;
  STACKTOP = __stackBase__;
  return (tempRet0 = $10$1, $10$0) | 0;
}
function ___muldi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $x_sroa_0_0_extract_trunc = 0, $y_sroa_0_0_extract_trunc = 0, $1$0 = 0, $1$1 = 0, $2 = 0;
  $x_sroa_0_0_extract_trunc = $a$0;
  $y_sroa_0_0_extract_trunc = $b$0;
  $1$0 = ___muldsi3($x_sroa_0_0_extract_trunc, $y_sroa_0_0_extract_trunc) | 0;
  $1$1 = tempRet0;
  $2 = Math_imul($a$1, $y_sroa_0_0_extract_trunc) | 0;
  return (tempRet0 = ((Math_imul($b$1, $x_sroa_0_0_extract_trunc) | 0) + $2 | 0) + $1$1 | $1$1 & 0, 0 | $1$0 & -1) | 0;
}
function ___udivdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $1$0 = 0;
  $1$0 = ___udivmoddi4($a$0, $a$1, $b$0, $b$1, 0) | 0;
  return $1$0 | 0;
}
function ___uremdi3($a$0, $a$1, $b$0, $b$1) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  var $rem = 0, __stackBase__ = 0;
  __stackBase__ = STACKTOP;
  STACKTOP = STACKTOP + 16 | 0;
  $rem = __stackBase__ | 0;
  ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) | 0;
  STACKTOP = __stackBase__;
  return (tempRet0 = HEAP32[$rem + 4 >> 2] | 0, HEAP32[$rem >> 2] | 0) | 0;
}
function ___udivmoddi4($a$0, $a$1, $b$0, $b$1, $rem) {
  $a$0 = $a$0 | 0;
  $a$1 = $a$1 | 0;
  $b$0 = $b$0 | 0;
  $b$1 = $b$1 | 0;
  $rem = $rem | 0;
  var $n_sroa_0_0_extract_trunc = 0, $n_sroa_1_4_extract_shift$0 = 0, $n_sroa_1_4_extract_trunc = 0, $d_sroa_0_0_extract_trunc = 0, $d_sroa_1_4_extract_shift$0 = 0, $d_sroa_1_4_extract_trunc = 0, $4 = 0, $17 = 0, $37 = 0, $49 = 0, $51 = 0, $57 = 0, $58 = 0, $66 = 0, $78 = 0, $86 = 0, $88 = 0, $89 = 0, $91 = 0, $92 = 0, $95 = 0, $105 = 0, $117 = 0, $119 = 0, $125 = 0, $126 = 0, $130 = 0, $q_sroa_1_1_ph = 0, $q_sroa_0_1_ph = 0, $r_sroa_1_1_ph = 0, $r_sroa_0_1_ph = 0, $sr_1_ph = 0, $d_sroa_0_0_insert_insert99$0 = 0, $d_sroa_0_0_insert_insert99$1 = 0, $137$0 = 0, $137$1 = 0, $carry_0203 = 0, $sr_1202 = 0, $r_sroa_0_1201 = 0, $r_sroa_1_1200 = 0, $q_sroa_0_1199 = 0, $q_sroa_1_1198 = 0, $147 = 0, $149 = 0, $r_sroa_0_0_insert_insert42$0 = 0, $r_sroa_0_0_insert_insert42$1 = 0, $150$1 = 0, $151$0 = 0, $152 = 0, $154$0 = 0, $r_sroa_0_0_extract_trunc = 0, $r_sroa_1_4_extract_trunc = 0, $155 = 0, $carry_0_lcssa$0 = 0, $carry_0_lcssa$1 = 0, $r_sroa_0_1_lcssa = 0, $r_sroa_1_1_lcssa = 0, $q_sroa_0_1_lcssa = 0, $q_sroa_1_1_lcssa = 0, $q_sroa_0_0_insert_ext75$0 = 0, $q_sroa_0_0_insert_ext75$1 = 0, $q_sroa_0_0_insert_insert77$1 = 0, $_0$0 = 0, $_0$1 = 0;
  $n_sroa_0_0_extract_trunc = $a$0;
  $n_sroa_1_4_extract_shift$0 = $a$1;
  $n_sroa_1_4_extract_trunc = $n_sroa_1_4_extract_shift$0;
  $d_sroa_0_0_extract_trunc = $b$0;
  $d_sroa_1_4_extract_shift$0 = $b$1;
  $d_sroa_1_4_extract_trunc = $d_sroa_1_4_extract_shift$0;
  if (($n_sroa_1_4_extract_trunc | 0) == 0) {
    $4 = ($rem | 0) != 0;
    if (($d_sroa_1_4_extract_trunc | 0) == 0) {
      if ($4) {
        HEAP32[$rem >> 2] = ($n_sroa_0_0_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
        HEAP32[$rem + 4 >> 2] = 0;
      }
      $_0$1 = 0;
      $_0$0 = ($n_sroa_0_0_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$4) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    }
  }
  $17 = ($d_sroa_1_4_extract_trunc | 0) == 0;
  do {
    if (($d_sroa_0_0_extract_trunc | 0) == 0) {
      if ($17) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_0_0_extract_trunc >>> 0);
          HEAP32[$rem + 4 >> 2] = 0;
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_0_0_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      if (($n_sroa_0_0_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0;
          HEAP32[$rem + 4 >> 2] = ($n_sroa_1_4_extract_trunc >>> 0) % ($d_sroa_1_4_extract_trunc >>> 0);
        }
        $_0$1 = 0;
        $_0$0 = ($n_sroa_1_4_extract_trunc >>> 0) / ($d_sroa_1_4_extract_trunc >>> 0) >>> 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $37 = $d_sroa_1_4_extract_trunc - 1 | 0;
      if (($37 & $d_sroa_1_4_extract_trunc | 0) == 0) {
        if (($rem | 0) != 0) {
          HEAP32[$rem >> 2] = 0 | $a$0 & -1;
          HEAP32[$rem + 4 >> 2] = $37 & $n_sroa_1_4_extract_trunc | $a$1 & 0;
        }
        $_0$1 = 0;
        $_0$0 = $n_sroa_1_4_extract_trunc >>> ((_llvm_cttz_i32($d_sroa_1_4_extract_trunc | 0) | 0) >>> 0);
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $49 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
      $51 = $49 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
      if ($51 >>> 0 <= 30) {
        $57 = $51 + 1 | 0;
        $58 = 31 - $51 | 0;
        $sr_1_ph = $57;
        $r_sroa_0_1_ph = $n_sroa_1_4_extract_trunc << $58 | $n_sroa_0_0_extract_trunc >>> ($57 >>> 0);
        $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($57 >>> 0);
        $q_sroa_0_1_ph = 0;
        $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $58;
        break;
      }
      if (($rem | 0) == 0) {
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      HEAP32[$rem >> 2] = 0 | $a$0 & -1;
      HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
      $_0$1 = 0;
      $_0$0 = 0;
      return (tempRet0 = $_0$1, $_0$0) | 0;
    } else {
      if (!$17) {
        $117 = Math_clz32($d_sroa_1_4_extract_trunc | 0) | 0;
        $119 = $117 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        if ($119 >>> 0 <= 31) {
          $125 = $119 + 1 | 0;
          $126 = 31 - $119 | 0;
          $130 = $119 - 31 >> 31;
          $sr_1_ph = $125;
          $r_sroa_0_1_ph = $n_sroa_0_0_extract_trunc >>> ($125 >>> 0) & $130 | $n_sroa_1_4_extract_trunc << $126;
          $r_sroa_1_1_ph = $n_sroa_1_4_extract_trunc >>> ($125 >>> 0) & $130;
          $q_sroa_0_1_ph = 0;
          $q_sroa_1_1_ph = $n_sroa_0_0_extract_trunc << $126;
          break;
        }
        if (($rem | 0) == 0) {
          $_0$1 = 0;
          $_0$0 = 0;
          return (tempRet0 = $_0$1, $_0$0) | 0;
        }
        HEAP32[$rem >> 2] = 0 | $a$0 & -1;
        HEAP32[$rem + 4 >> 2] = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$1 = 0;
        $_0$0 = 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
      $66 = $d_sroa_0_0_extract_trunc - 1 | 0;
      if (($66 & $d_sroa_0_0_extract_trunc | 0) != 0) {
        $86 = (Math_clz32($d_sroa_0_0_extract_trunc | 0) | 0) + 33 | 0;
        $88 = $86 - (Math_clz32($n_sroa_1_4_extract_trunc | 0) | 0) | 0;
        $89 = 64 - $88 | 0;
        $91 = 32 - $88 | 0;
        $92 = $91 >> 31;
        $95 = $88 - 32 | 0;
        $105 = $95 >> 31;
        $sr_1_ph = $88;
        $r_sroa_0_1_ph = $91 - 1 >> 31 & $n_sroa_1_4_extract_trunc >>> ($95 >>> 0) | ($n_sroa_1_4_extract_trunc << $91 | $n_sroa_0_0_extract_trunc >>> ($88 >>> 0)) & $105;
        $r_sroa_1_1_ph = $105 & $n_sroa_1_4_extract_trunc >>> ($88 >>> 0);
        $q_sroa_0_1_ph = $n_sroa_0_0_extract_trunc << $89 & $92;
        $q_sroa_1_1_ph = ($n_sroa_1_4_extract_trunc << $89 | $n_sroa_0_0_extract_trunc >>> ($95 >>> 0)) & $92 | $n_sroa_0_0_extract_trunc << $91 & $88 - 33 >> 31;
        break;
      }
      if (($rem | 0) != 0) {
        HEAP32[$rem >> 2] = $66 & $n_sroa_0_0_extract_trunc;
        HEAP32[$rem + 4 >> 2] = 0;
      }
      if (($d_sroa_0_0_extract_trunc | 0) == 1) {
        $_0$1 = $n_sroa_1_4_extract_shift$0 | $a$1 & 0;
        $_0$0 = 0 | $a$0 & -1;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      } else {
        $78 = _llvm_cttz_i32($d_sroa_0_0_extract_trunc | 0) | 0;
        $_0$1 = 0 | $n_sroa_1_4_extract_trunc >>> ($78 >>> 0);
        $_0$0 = $n_sroa_1_4_extract_trunc << 32 - $78 | $n_sroa_0_0_extract_trunc >>> ($78 >>> 0) | 0;
        return (tempRet0 = $_0$1, $_0$0) | 0;
      }
    }
  } while (0);
  if (($sr_1_ph | 0) == 0) {
    $q_sroa_1_1_lcssa = $q_sroa_1_1_ph;
    $q_sroa_0_1_lcssa = $q_sroa_0_1_ph;
    $r_sroa_1_1_lcssa = $r_sroa_1_1_ph;
    $r_sroa_0_1_lcssa = $r_sroa_0_1_ph;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = 0;
  } else {
    $d_sroa_0_0_insert_insert99$0 = 0 | $b$0 & -1;
    $d_sroa_0_0_insert_insert99$1 = $d_sroa_1_4_extract_shift$0 | $b$1 & 0;
    $137$0 = _i64Add($d_sroa_0_0_insert_insert99$0 | 0, $d_sroa_0_0_insert_insert99$1 | 0, -1, -1) | 0;
    $137$1 = tempRet0;
    $q_sroa_1_1198 = $q_sroa_1_1_ph;
    $q_sroa_0_1199 = $q_sroa_0_1_ph;
    $r_sroa_1_1200 = $r_sroa_1_1_ph;
    $r_sroa_0_1201 = $r_sroa_0_1_ph;
    $sr_1202 = $sr_1_ph;
    $carry_0203 = 0;
    while (1) {
      $147 = $q_sroa_0_1199 >>> 31 | $q_sroa_1_1198 << 1;
      $149 = $carry_0203 | $q_sroa_0_1199 << 1;
      $r_sroa_0_0_insert_insert42$0 = 0 | ($r_sroa_0_1201 << 1 | $q_sroa_1_1198 >>> 31);
      $r_sroa_0_0_insert_insert42$1 = $r_sroa_0_1201 >>> 31 | $r_sroa_1_1200 << 1 | 0;
      _i64Subtract($137$0, $137$1, $r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1) | 0;
      $150$1 = tempRet0;
      $151$0 = $150$1 >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1;
      $152 = $151$0 & 1;
      $154$0 = _i64Subtract($r_sroa_0_0_insert_insert42$0, $r_sroa_0_0_insert_insert42$1, $151$0 & $d_sroa_0_0_insert_insert99$0, ((($150$1 | 0) < 0 ? -1 : 0) >> 31 | (($150$1 | 0) < 0 ? -1 : 0) << 1) & $d_sroa_0_0_insert_insert99$1) | 0;
      $r_sroa_0_0_extract_trunc = $154$0;
      $r_sroa_1_4_extract_trunc = tempRet0;
      $155 = $sr_1202 - 1 | 0;
      if (($155 | 0) == 0) {
        break;
      } else {
        $q_sroa_1_1198 = $147;
        $q_sroa_0_1199 = $149;
        $r_sroa_1_1200 = $r_sroa_1_4_extract_trunc;
        $r_sroa_0_1201 = $r_sroa_0_0_extract_trunc;
        $sr_1202 = $155;
        $carry_0203 = $152;
      }
    }
    $q_sroa_1_1_lcssa = $147;
    $q_sroa_0_1_lcssa = $149;
    $r_sroa_1_1_lcssa = $r_sroa_1_4_extract_trunc;
    $r_sroa_0_1_lcssa = $r_sroa_0_0_extract_trunc;
    $carry_0_lcssa$1 = 0;
    $carry_0_lcssa$0 = $152;
  }
  $q_sroa_0_0_insert_ext75$0 = $q_sroa_0_1_lcssa;
  $q_sroa_0_0_insert_ext75$1 = 0;
  $q_sroa_0_0_insert_insert77$1 = $q_sroa_1_1_lcssa | $q_sroa_0_0_insert_ext75$1;
  if (($rem | 0) != 0) {
    HEAP32[$rem >> 2] = 0 | $r_sroa_0_1_lcssa;
    HEAP32[$rem + 4 >> 2] = $r_sroa_1_1_lcssa | 0;
  }
  $_0$1 = (0 | $q_sroa_0_0_insert_ext75$0) >>> 31 | $q_sroa_0_0_insert_insert77$1 << 1 | ($q_sroa_0_0_insert_ext75$1 << 1 | $q_sroa_0_0_insert_ext75$0 >>> 31) & 0 | $carry_0_lcssa$1;
  $_0$0 = ($q_sroa_0_0_insert_ext75$0 << 1 | 0 >>> 31) & -2 | $carry_0_lcssa$0;
  return (tempRet0 = $_0$1, $_0$0) | 0;
}
// =======================================================================



  
function dynCall_viiiii(index,a1,a2,a3,a4,a5) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0;
  FUNCTION_TABLE_viiiii[index&7](a1|0,a2|0,a3|0,a4|0,a5|0);
}


function dynCall_vd(index,a1) {
  index = index|0;
  a1=+a1;
  FUNCTION_TABLE_vd[index&3](+a1);
}


function dynCall_vid(index,a1,a2) {
  index = index|0;
  a1=a1|0; a2=+a2;
  FUNCTION_TABLE_vid[index&3](a1|0,+a2);
}


function dynCall_vi(index,a1) {
  index = index|0;
  a1=a1|0;
  FUNCTION_TABLE_vi[index&31](a1|0);
}


function dynCall_vii(index,a1,a2) {
  index = index|0;
  a1=a1|0; a2=a2|0;
  FUNCTION_TABLE_vii[index&63](a1|0,a2|0);
}


function dynCall_ii(index,a1) {
  index = index|0;
  a1=a1|0;
  return FUNCTION_TABLE_ii[index&15](a1|0)|0;
}


function dynCall_viddd(index,a1,a2,a3,a4) {
  index = index|0;
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4;
  FUNCTION_TABLE_viddd[index&3](a1|0,+a2,+a3,+a4);
}


function dynCall_vidd(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=+a2; a3=+a3;
  FUNCTION_TABLE_vidd[index&3](a1|0,+a2,+a3);
}


function dynCall_iiii(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0;
  return FUNCTION_TABLE_iiii[index&3](a1|0,a2|0,a3|0)|0;
}


function dynCall_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0;
  FUNCTION_TABLE_viiiiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0);
}


function dynCall_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0;
  FUNCTION_TABLE_viiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0);
}


function dynCall_viii(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0;
  FUNCTION_TABLE_viii[index&31](a1|0,a2|0,a3|0);
}


function dynCall_vidddd(index,a1,a2,a3,a4,a5) {
  index = index|0;
  a1=a1|0; a2=+a2; a3=+a3; a4=+a4; a5=+a5;
  FUNCTION_TABLE_vidddd[index&3](a1|0,+a2,+a3,+a4,+a5);
}


function dynCall_vdi(index,a1,a2) {
  index = index|0;
  a1=+a1; a2=a2|0;
  FUNCTION_TABLE_vdi[index&1](+a1,a2|0);
}


function dynCall_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0;
  FUNCTION_TABLE_viiiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0);
}


function dynCall_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0; a5=a5|0; a6=a6|0; a7=a7|0; a8=a8|0; a9=a9|0;
  FUNCTION_TABLE_viiiiiiiii[index&3](a1|0,a2|0,a3|0,a4|0,a5|0,a6|0,a7|0,a8|0,a9|0);
}


function dynCall_iii(index,a1,a2) {
  index = index|0;
  a1=a1|0; a2=a2|0;
  return FUNCTION_TABLE_iii[index&3](a1|0,a2|0)|0;
}


function dynCall_i(index) {
  index = index|0;
  
  return FUNCTION_TABLE_i[index&3]()|0;
}


function dynCall_vdddddd(index,a1,a2,a3,a4,a5,a6) {
  index = index|0;
  a1=+a1; a2=+a2; a3=+a3; a4=+a4; a5=+a5; a6=+a6;
  FUNCTION_TABLE_vdddddd[index&1](+a1,+a2,+a3,+a4,+a5,+a6);
}


function dynCall_vdddd(index,a1,a2,a3,a4) {
  index = index|0;
  a1=+a1; a2=+a2; a3=+a3; a4=+a4;
  FUNCTION_TABLE_vdddd[index&3](+a1,+a2,+a3,+a4);
}


function dynCall_vdd(index,a1,a2) {
  index = index|0;
  a1=+a1; a2=+a2;
  FUNCTION_TABLE_vdd[index&3](+a1,+a2);
}


function dynCall_v(index) {
  index = index|0;
  
  FUNCTION_TABLE_v[index&7]();
}


function dynCall_viid(index,a1,a2,a3) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=+a3;
  FUNCTION_TABLE_viid[index&1](a1|0,a2|0,+a3);
}


function dynCall_viiii(index,a1,a2,a3,a4) {
  index = index|0;
  a1=a1|0; a2=a2|0; a3=a3|0; a4=a4|0;
  FUNCTION_TABLE_viiii[index&31](a1|0,a2|0,a3|0,a4|0);
}

function b0(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; nullFunc_viiiii(0);
}
function _emscripten_glUniform4i__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; _emscripten_glUniform4i(p0|0,p1|0,p2|0,p3|0,p4|0);
}
function _emscripten_glFramebufferTexture2D__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; _emscripten_glFramebufferTexture2D(p0|0,p1|0,p2|0,p3|0,p4|0);
}
function _emscripten_glShaderBinary__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; _emscripten_glShaderBinary(p0|0,p1|0,p2|0,p3|0,p4|0);
}
function _emscripten_glDrawElementsInstanced__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0; _emscripten_glDrawElementsInstanced(p0|0,p1|0,p2|0,p3|0,p4|0);
}
function b1(p0) {
 p0 = +p0; nullFunc_vd(1);
}
function _emscripten_glClearDepth__wrapper(p0) {
 p0 = +p0; _emscripten_glClearDepth(+p0);
}
function _emscripten_glClearDepthf__wrapper(p0) {
 p0 = +p0; _emscripten_glClearDepthf(+p0);
}
function _emscripten_glLineWidth__wrapper(p0) {
 p0 = +p0; _emscripten_glLineWidth(+p0);
}
function b2(p0,p1) {
 p0 = p0|0;p1 = +p1; nullFunc_vid(2);
}
function _emscripten_glUniform1f__wrapper(p0,p1) {
 p0 = p0|0;p1 = +p1; _emscripten_glUniform1f(p0|0,+p1);
}
function _emscripten_glVertexAttrib1f__wrapper(p0,p1) {
 p0 = p0|0;p1 = +p1; _emscripten_glVertexAttrib1f(p0|0,+p1);
}
function b3(p0) {
 p0 = p0|0; nullFunc_vi(3);
}
function _emscripten_glDeleteShader__wrapper(p0) {
 p0 = p0|0; _emscripten_glDeleteShader(p0|0);
}
function _emscripten_glCompileShader__wrapper(p0) {
 p0 = p0|0; _emscripten_glCompileShader(p0|0);
}
function _emscripten_glDeleteProgram__wrapper(p0) {
 p0 = p0|0; _emscripten_glDeleteProgram(p0|0);
}
function _emscripten_glLinkProgram__wrapper(p0) {
 p0 = p0|0; _emscripten_glLinkProgram(p0|0);
}
function _emscripten_glUseProgram__wrapper(p0) {
 p0 = p0|0; _emscripten_glUseProgram(p0|0);
}
function _emscripten_glValidateProgram__wrapper(p0) {
 p0 = p0|0; _emscripten_glValidateProgram(p0|0);
}
function _emscripten_glDeleteObjectARB__wrapper(p0) {
 p0 = p0|0; _emscripten_glDeleteObjectARB(p0|0);
}
function _emscripten_glEnableClientState__wrapper(p0) {
 p0 = p0|0; _emscripten_glEnableClientState(p0|0);
}
function _emscripten_glClientActiveTexture__wrapper(p0) {
 p0 = p0|0; _emscripten_glClientActiveTexture(p0|0);
}
function _emscripten_glBindVertexArray__wrapper(p0) {
 p0 = p0|0; _emscripten_glBindVertexArray(p0|0);
}
function _emscripten_glMatrixMode__wrapper(p0) {
 p0 = p0|0; _emscripten_glMatrixMode(p0|0);
}
function _emscripten_glLoadMatrixf__wrapper(p0) {
 p0 = p0|0; _emscripten_glLoadMatrixf(p0|0);
}
function _emscripten_glEnableVertexAttribArray__wrapper(p0) {
 p0 = p0|0; _emscripten_glEnableVertexAttribArray(p0|0);
}
function _emscripten_glDisableVertexAttribArray__wrapper(p0) {
 p0 = p0|0; _emscripten_glDisableVertexAttribArray(p0|0);
}
function _emscripten_glDepthFunc__wrapper(p0) {
 p0 = p0|0; _emscripten_glDepthFunc(p0|0);
}
function _emscripten_glEnable__wrapper(p0) {
 p0 = p0|0; _emscripten_glEnable(p0|0);
}
function _emscripten_glDisable__wrapper(p0) {
 p0 = p0|0; _emscripten_glDisable(p0|0);
}
function _emscripten_glFrontFace__wrapper(p0) {
 p0 = p0|0; _emscripten_glFrontFace(p0|0);
}
function _emscripten_glCullFace__wrapper(p0) {
 p0 = p0|0; _emscripten_glCullFace(p0|0);
}
function _emscripten_glClear__wrapper(p0) {
 p0 = p0|0; _emscripten_glClear(p0|0);
}
function _emscripten_glClearStencil__wrapper(p0) {
 p0 = p0|0; _emscripten_glClearStencil(p0|0);
}
function _emscripten_glDepthMask__wrapper(p0) {
 p0 = p0|0; _emscripten_glDepthMask(p0|0);
}
function _emscripten_glStencilMask__wrapper(p0) {
 p0 = p0|0; _emscripten_glStencilMask(p0|0);
}
function _emscripten_glGenerateMipmap__wrapper(p0) {
 p0 = p0|0; _emscripten_glGenerateMipmap(p0|0);
}
function _emscripten_glActiveTexture__wrapper(p0) {
 p0 = p0|0; _emscripten_glActiveTexture(p0|0);
}
function _emscripten_glBlendEquation__wrapper(p0) {
 p0 = p0|0; _emscripten_glBlendEquation(p0|0);
}
function b4(p0,p1) {
 p0 = p0|0;p1 = p1|0; nullFunc_vii(4);
}
function _emscripten_glPixelStorei__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glPixelStorei(p0|0,p1|0);
}
function _emscripten_glGetIntegerv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGetIntegerv(p0|0,p1|0);
}
function _emscripten_glGetFloatv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGetFloatv(p0|0,p1|0);
}
function _emscripten_glGetBooleanv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGetBooleanv(p0|0,p1|0);
}
function _emscripten_glGenTextures__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGenTextures(p0|0,p1|0);
}
function _emscripten_glDeleteTextures__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDeleteTextures(p0|0,p1|0);
}
function _emscripten_glBindTexture__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBindTexture(p0|0,p1|0);
}
function _emscripten_glGenBuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGenBuffers(p0|0,p1|0);
}
function _emscripten_glDeleteBuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDeleteBuffers(p0|0,p1|0);
}
function _emscripten_glGenRenderbuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGenRenderbuffers(p0|0,p1|0);
}
function _emscripten_glDeleteRenderbuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDeleteRenderbuffers(p0|0,p1|0);
}
function _emscripten_glBindRenderbuffer__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBindRenderbuffer(p0|0,p1|0);
}
function _emscripten_glUniform1i__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glUniform1i(p0|0,p1|0);
}
function _emscripten_glBindBuffer__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBindBuffer(p0|0,p1|0);
}
function _emscripten_glVertexAttrib1fv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glVertexAttrib1fv(p0|0,p1|0);
}
function _emscripten_glVertexAttrib2fv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glVertexAttrib2fv(p0|0,p1|0);
}
function _emscripten_glVertexAttrib3fv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glVertexAttrib3fv(p0|0,p1|0);
}
function _emscripten_glVertexAttrib4fv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glVertexAttrib4fv(p0|0,p1|0);
}
function _emscripten_glAttachShader__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glAttachShader(p0|0,p1|0);
}
function _emscripten_glDetachShader__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDetachShader(p0|0,p1|0);
}
function _emscripten_glBindFramebuffer__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBindFramebuffer(p0|0,p1|0);
}
function _emscripten_glGenFramebuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGenFramebuffers(p0|0,p1|0);
}
function _emscripten_glDeleteFramebuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDeleteFramebuffers(p0|0,p1|0);
}
function _emscripten_glBindProgramARB__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBindProgramARB(p0|0,p1|0);
}
function _emscripten_glGetPointerv__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGetPointerv(p0|0,p1|0);
}
function _emscripten_glGenVertexArrays__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glGenVertexArrays(p0|0,p1|0);
}
function _emscripten_glDeleteVertexArrays__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDeleteVertexArrays(p0|0,p1|0);
}
function _emscripten_glVertexAttribDivisor__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glVertexAttribDivisor(p0|0,p1|0);
}
function _emscripten_glBlendFunc__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBlendFunc(p0|0,p1|0);
}
function _emscripten_glBlendEquationSeparate__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glBlendEquationSeparate(p0|0,p1|0);
}
function _emscripten_glStencilMaskSeparate__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glStencilMaskSeparate(p0|0,p1|0);
}
function _emscripten_glHint__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glHint(p0|0,p1|0);
}
function _emscripten_glDrawBuffers__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; _emscripten_glDrawBuffers(p0|0,p1|0);
}
function b5(p0) {
 p0 = p0|0; nullFunc_ii(5);return 0;
}
function _emscripten_glGetString__wrapper(p0) {
 p0 = p0|0; return _emscripten_glGetString(p0|0)|0;
}
function _emscripten_glIsTexture__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsTexture(p0|0)|0;
}
function _emscripten_glIsBuffer__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsBuffer(p0|0)|0;
}
function _emscripten_glIsRenderbuffer__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsRenderbuffer(p0|0)|0;
}
function _emscripten_glCreateShader__wrapper(p0) {
 p0 = p0|0; return _emscripten_glCreateShader(p0|0)|0;
}
function _emscripten_glIsShader__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsShader(p0|0)|0;
}
function _emscripten_glIsProgram__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsProgram(p0|0)|0;
}
function _emscripten_glIsFramebuffer__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsFramebuffer(p0|0)|0;
}
function _emscripten_glCheckFramebufferStatus__wrapper(p0) {
 p0 = p0|0; return _emscripten_glCheckFramebufferStatus(p0|0)|0;
}
function _emscripten_glIsEnabled__wrapper(p0) {
 p0 = p0|0; return _emscripten_glIsEnabled(p0|0)|0;
}
function b6(p0,p1,p2,p3) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3; nullFunc_viddd(6);
}
function _emscripten_glUniform3f__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3; _emscripten_glUniform3f(p0|0,+p1,+p2,+p3);
}
function _emscripten_glVertexAttrib3f__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3; _emscripten_glVertexAttrib3f(p0|0,+p1,+p2,+p3);
}
function b7(p0,p1,p2) {
 p0 = p0|0;p1 = +p1;p2 = +p2; nullFunc_vidd(7);
}
function _emscripten_glUniform2f__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = +p1;p2 = +p2; _emscripten_glUniform2f(p0|0,+p1,+p2);
}
function _emscripten_glVertexAttrib2f__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = +p1;p2 = +p2; _emscripten_glVertexAttrib2f(p0|0,+p1,+p2);
}
function b8(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_iiii(8);return 0;
}
function b9(p0,p1,p2,p3,p4,p5,p6,p7) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0; nullFunc_viiiiiiii(9);
}
function _emscripten_glCompressedTexImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0; _emscripten_glCompressedTexImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0);
}
function _emscripten_glCopyTexImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0; _emscripten_glCopyTexImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0);
}
function _emscripten_glCopyTexSubImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0; _emscripten_glCopyTexSubImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0);
}
function b10(p0,p1,p2,p3,p4,p5) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0; nullFunc_viiiiii(10);
}
function _emscripten_glDrawRangeElements__wrapper(p0,p1,p2,p3,p4,p5) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0; _emscripten_glDrawRangeElements(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0);
}
function _emscripten_glVertexAttribPointer__wrapper(p0,p1,p2,p3,p4,p5) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0; _emscripten_glVertexAttribPointer(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0);
}
function b11(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; nullFunc_viii(11);
}
function _emscripten_glGetTexParameterfv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetTexParameterfv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetTexParameteriv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetTexParameteriv(p0|0,p1|0,p2|0);
}
function _emscripten_glTexParameterfv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glTexParameterfv(p0|0,p1|0,p2|0);
}
function _emscripten_glTexParameteriv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glTexParameteriv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetBufferParameteriv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetBufferParameteriv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetRenderbufferParameteriv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetRenderbufferParameteriv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetUniformfv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetUniformfv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetUniformiv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetUniformiv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetVertexAttribfv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetVertexAttribfv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetVertexAttribiv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetVertexAttribiv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetVertexAttribPointerv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetVertexAttribPointerv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform2i__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform2i(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform1iv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform1iv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform2iv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform2iv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform3iv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform3iv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform4iv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform4iv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform1fv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform1fv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform2fv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform2fv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform3fv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform3fv(p0|0,p1|0,p2|0);
}
function _emscripten_glUniform4fv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glUniform4fv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetShaderiv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetShaderiv(p0|0,p1|0,p2|0);
}
function _emscripten_glGetProgramiv__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetProgramiv(p0|0,p1|0,p2|0);
}
function _emscripten_glBindAttribLocation__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glBindAttribLocation(p0|0,p1|0,p2|0);
}
function _emscripten_glGetObjectParameterivARB__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glGetObjectParameterivARB(p0|0,p1|0,p2|0);
}
function _emscripten_glNormalPointer__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glNormalPointer(p0|0,p1|0,p2|0);
}
function _emscripten_glDrawArrays__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glDrawArrays(p0|0,p1|0,p2|0);
}
function _emscripten_glTexParameteri__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glTexParameteri(p0|0,p1|0,p2|0);
}
function _emscripten_glStencilFunc__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glStencilFunc(p0|0,p1|0,p2|0);
}
function _emscripten_glStencilOp__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0; _emscripten_glStencilOp(p0|0,p1|0,p2|0);
}
function b12(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4; nullFunc_vidddd(12);
}
function _emscripten_glUniform4f__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4; _emscripten_glUniform4f(p0|0,+p1,+p2,+p3,+p4);
}
function _emscripten_glVertexAttrib4f__wrapper(p0,p1,p2,p3,p4) {
 p0 = p0|0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4; _emscripten_glVertexAttrib4f(p0|0,+p1,+p2,+p3,+p4);
}
function b13(p0,p1) {
 p0 = +p0;p1 = p1|0; nullFunc_vdi(13);
}
function _emscripten_glSampleCoverage__wrapper(p0,p1) {
 p0 = +p0;p1 = p1|0; _emscripten_glSampleCoverage(+p0,p1|0);
}
function b14(p0,p1,p2,p3,p4,p5,p6) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0; nullFunc_viiiiiii(14);
}
function _emscripten_glReadPixels__wrapper(p0,p1,p2,p3,p4,p5,p6) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0; _emscripten_glReadPixels(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0);
}
function _emscripten_glGetActiveUniform__wrapper(p0,p1,p2,p3,p4,p5,p6) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0; _emscripten_glGetActiveUniform(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0);
}
function _emscripten_glGetActiveAttrib__wrapper(p0,p1,p2,p3,p4,p5,p6) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0; _emscripten_glGetActiveAttrib(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0);
}
function b15(p0,p1,p2,p3,p4,p5,p6,p7,p8) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0; nullFunc_viiiiiiiii(15);
}
function _emscripten_glCompressedTexSubImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7,p8) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0; _emscripten_glCompressedTexSubImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0,p8|0);
}
function _emscripten_glTexImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7,p8) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0; _emscripten_glTexImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0,p8|0);
}
function _emscripten_glTexSubImage2D__wrapper(p0,p1,p2,p3,p4,p5,p6,p7,p8) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0;p4 = p4|0;p5 = p5|0;p6 = p6|0;p7 = p7|0;p8 = p8|0; _emscripten_glTexSubImage2D(p0|0,p1|0,p2|0,p3|0,p4|0,p5|0,p6|0,p7|0,p8|0);
}
function b16(p0,p1) {
 p0 = p0|0;p1 = p1|0; nullFunc_iii(16);return 0;
}
function _emscripten_glGetUniformLocation__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; return _emscripten_glGetUniformLocation(p0|0,p1|0)|0;
}
function _emscripten_glGetAttribLocation__wrapper(p0,p1) {
 p0 = p0|0;p1 = p1|0; return _emscripten_glGetAttribLocation(p0|0,p1|0)|0;
}
function b17() {
 ; nullFunc_i(17);return 0;
}
function _emscripten_glCreateProgram__wrapper() {
 ; return _emscripten_glCreateProgram()|0;
}
function _emscripten_glGetError__wrapper() {
 ; return _emscripten_glGetError()|0;
}
function b18(p0,p1,p2,p3,p4,p5) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4;p5 = +p5; nullFunc_vdddddd(18);
}
function _emscripten_glFrustum__wrapper(p0,p1,p2,p3,p4,p5) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3;p4 = +p4;p5 = +p5; _emscripten_glFrustum(+p0,+p1,+p2,+p3,+p4,+p5);
}
function b19(p0,p1,p2,p3) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3; nullFunc_vdddd(19);
}
function _emscripten_glRotatef__wrapper(p0,p1,p2,p3) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3; _emscripten_glRotatef(+p0,+p1,+p2,+p3);
}
function _emscripten_glClearColor__wrapper(p0,p1,p2,p3) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3; _emscripten_glClearColor(+p0,+p1,+p2,+p3);
}
function _emscripten_glBlendColor__wrapper(p0,p1,p2,p3) {
 p0 = +p0;p1 = +p1;p2 = +p2;p3 = +p3; _emscripten_glBlendColor(+p0,+p1,+p2,+p3);
}
function b20(p0,p1) {
 p0 = +p0;p1 = +p1; nullFunc_vdd(20);
}
function _emscripten_glDepthRange__wrapper(p0,p1) {
 p0 = +p0;p1 = +p1; _emscripten_glDepthRange(+p0,+p1);
}
function _emscripten_glDepthRangef__wrapper(p0,p1) {
 p0 = +p0;p1 = +p1; _emscripten_glDepthRangef(+p0,+p1);
}
function _emscripten_glPolygonOffset__wrapper(p0,p1) {
 p0 = +p0;p1 = +p1; _emscripten_glPolygonOffset(+p0,+p1);
}
function b21() {
 ; nullFunc_v(21);
}
function _emscripten_glLoadIdentity__wrapper() {
 ; _emscripten_glLoadIdentity();
}
function _emscripten_glReleaseShaderCompiler__wrapper() {
 ; _emscripten_glReleaseShaderCompiler();
}
function _emscripten_glFinish__wrapper() {
 ; _emscripten_glFinish();
}
function _emscripten_glFlush__wrapper() {
 ; _emscripten_glFlush();
}
function b22(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = +p2; nullFunc_viid(22);
}
function _emscripten_glTexParameterf__wrapper(p0,p1,p2) {
 p0 = p0|0;p1 = p1|0;p2 = +p2; _emscripten_glTexParameterf(p0|0,p1|0,+p2);
}
function b23(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; nullFunc_viiii(23);
}
function _emscripten_glBufferData__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glBufferData(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glBufferSubData__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glBufferSubData(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glUniform3i__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glUniform3i(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glUniformMatrix2fv__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glUniformMatrix2fv(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glUniformMatrix3fv__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glUniformMatrix3fv(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glUniformMatrix4fv__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glUniformMatrix4fv(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetAttachedShaders__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetAttachedShaders(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glShaderSource__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glShaderSource(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetShaderSource__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetShaderSource(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetShaderInfoLog__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetShaderInfoLog(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetShaderPrecisionFormat__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetShaderPrecisionFormat(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetProgramInfoLog__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetProgramInfoLog(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glFramebufferRenderbuffer__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glFramebufferRenderbuffer(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetFramebufferAttachmentParameteriv__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetFramebufferAttachmentParameteriv(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glGetInfoLogARB__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glGetInfoLogARB(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glVertexPointer__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glVertexPointer(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glTexCoordPointer__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glTexCoordPointer(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glColorPointer__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glColorPointer(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glDrawElements__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glDrawElements(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glDrawArraysInstanced__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glDrawArraysInstanced(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glViewport__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glViewport(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glScissor__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glScissor(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glColorMask__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glColorMask(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glRenderbufferStorage__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glRenderbufferStorage(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glBlendFuncSeparate__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glBlendFuncSeparate(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glStencilFuncSeparate__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glStencilFuncSeparate(p0|0,p1|0,p2|0,p3|0);
}
function _emscripten_glStencilOpSeparate__wrapper(p0,p1,p2,p3) {
 p0 = p0|0;p1 = p1|0;p2 = p2|0;p3 = p3|0; _emscripten_glStencilOpSeparate(p0|0,p1|0,p2|0,p3|0);
}

// EMSCRIPTEN_END_FUNCS
var FUNCTION_TABLE_viiiii = [b0,_KeyCallback,_emscripten_glUniform4i__wrapper,_emscripten_glFramebufferTexture2D__wrapper,_emscripten_glShaderBinary__wrapper,_emscripten_glDrawElementsInstanced__wrapper,b0,b0];
var FUNCTION_TABLE_vd = [b1,_emscripten_glClearDepth__wrapper,_emscripten_glClearDepthf__wrapper,_emscripten_glLineWidth__wrapper];
var FUNCTION_TABLE_vid = [b2,_emscripten_glUniform1f__wrapper,_emscripten_glVertexAttrib1f__wrapper,b2];
var FUNCTION_TABLE_vi = [b3,_emscripten_glDeleteShader__wrapper,_emscripten_glCompileShader__wrapper,_emscripten_glDeleteProgram__wrapper,_emscripten_glLinkProgram__wrapper,_emscripten_glUseProgram__wrapper,_emscripten_glValidateProgram__wrapper,_emscripten_glDeleteObjectARB__wrapper,_emscripten_glEnableClientState__wrapper,_emscripten_glClientActiveTexture__wrapper,_emscripten_glBindVertexArray__wrapper,_emscripten_glMatrixMode__wrapper,_emscripten_glLoadMatrixf__wrapper,_emscripten_glEnableVertexAttribArray__wrapper,_emscripten_glDisableVertexAttribArray__wrapper,_emscripten_glDepthFunc__wrapper,_emscripten_glEnable__wrapper,_emscripten_glDisable__wrapper,_emscripten_glFrontFace__wrapper,_emscripten_glCullFace__wrapper,_emscripten_glClear__wrapper,_emscripten_glClearStencil__wrapper,_emscripten_glDepthMask__wrapper,_emscripten_glStencilMask__wrapper,_emscripten_glGenerateMipmap__wrapper,_emscripten_glActiveTexture__wrapper,_emscripten_glBlendEquation__wrapper,_cleanup526,b3
,b3,b3,b3];
var FUNCTION_TABLE_vii = [b4,_ErrorCallback,_CursorEnterCallback,_CharCallback,_WindowIconifyCallback,_emscripten_glPixelStorei__wrapper,_emscripten_glGetIntegerv__wrapper,_emscripten_glGetFloatv__wrapper,_emscripten_glGetBooleanv__wrapper,_emscripten_glGenTextures__wrapper,_emscripten_glDeleteTextures__wrapper,_emscripten_glBindTexture__wrapper,_emscripten_glGenBuffers__wrapper,_emscripten_glDeleteBuffers__wrapper,_emscripten_glGenRenderbuffers__wrapper,_emscripten_glDeleteRenderbuffers__wrapper,_emscripten_glBindRenderbuffer__wrapper,_emscripten_glUniform1i__wrapper,_emscripten_glBindBuffer__wrapper,_emscripten_glVertexAttrib1fv__wrapper,_emscripten_glVertexAttrib2fv__wrapper,_emscripten_glVertexAttrib3fv__wrapper,_emscripten_glVertexAttrib4fv__wrapper,_emscripten_glAttachShader__wrapper,_emscripten_glDetachShader__wrapper,_emscripten_glBindFramebuffer__wrapper,_emscripten_glGenFramebuffers__wrapper,_emscripten_glDeleteFramebuffers__wrapper,_emscripten_glBindProgramARB__wrapper,_emscripten_glGetPointerv__wrapper,_emscripten_glGenVertexArrays__wrapper,_emscripten_glDeleteVertexArrays__wrapper,_emscripten_glVertexAttribDivisor__wrapper,_emscripten_glBlendFunc__wrapper,_emscripten_glBlendEquationSeparate__wrapper,_emscripten_glStencilMaskSeparate__wrapper,_emscripten_glHint__wrapper,_emscripten_glDrawBuffers__wrapper,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4,b4
,b4,b4,b4,b4,b4];
var FUNCTION_TABLE_ii = [b5,___stdio_close,_emscripten_glGetString__wrapper,_emscripten_glIsTexture__wrapper,_emscripten_glIsBuffer__wrapper,_emscripten_glIsRenderbuffer__wrapper,_emscripten_glCreateShader__wrapper,_emscripten_glIsShader__wrapper,_emscripten_glIsProgram__wrapper,_emscripten_glIsFramebuffer__wrapper,_emscripten_glCheckFramebufferStatus__wrapper,_emscripten_glIsEnabled__wrapper,b5,b5,b5,b5];
var FUNCTION_TABLE_viddd = [b6,_emscripten_glUniform3f__wrapper,_emscripten_glVertexAttrib3f__wrapper,b6];
var FUNCTION_TABLE_vidd = [b7,_ScrollCallback,_emscripten_glUniform2f__wrapper,_emscripten_glVertexAttrib2f__wrapper];
var FUNCTION_TABLE_iiii = [b8,___stdout_write,___stdio_seek,___stdio_write];
var FUNCTION_TABLE_viiiiiiii = [b9,_emscripten_glCompressedTexImage2D__wrapper,_emscripten_glCopyTexImage2D__wrapper,_emscripten_glCopyTexSubImage2D__wrapper];
var FUNCTION_TABLE_viiiiii = [b10,_emscripten_glDrawRangeElements__wrapper,_emscripten_glVertexAttribPointer__wrapper,b10];
var FUNCTION_TABLE_viii = [b11,_WindowSizeCallback,_emscripten_glGetTexParameterfv__wrapper,_emscripten_glGetTexParameteriv__wrapper,_emscripten_glTexParameterfv__wrapper,_emscripten_glTexParameteriv__wrapper,_emscripten_glGetBufferParameteriv__wrapper,_emscripten_glGetRenderbufferParameteriv__wrapper,_emscripten_glGetUniformfv__wrapper,_emscripten_glGetUniformiv__wrapper,_emscripten_glGetVertexAttribfv__wrapper,_emscripten_glGetVertexAttribiv__wrapper,_emscripten_glGetVertexAttribPointerv__wrapper,_emscripten_glUniform2i__wrapper,_emscripten_glUniform1iv__wrapper,_emscripten_glUniform2iv__wrapper,_emscripten_glUniform3iv__wrapper,_emscripten_glUniform4iv__wrapper,_emscripten_glUniform1fv__wrapper,_emscripten_glUniform2fv__wrapper,_emscripten_glUniform3fv__wrapper,_emscripten_glUniform4fv__wrapper,_emscripten_glGetShaderiv__wrapper,_emscripten_glGetProgramiv__wrapper,_emscripten_glBindAttribLocation__wrapper,_emscripten_glGetObjectParameterivARB__wrapper,_emscripten_glNormalPointer__wrapper,_emscripten_glDrawArrays__wrapper,_emscripten_glTexParameteri__wrapper,_emscripten_glStencilFunc__wrapper,_emscripten_glStencilOp__wrapper,b11];
var FUNCTION_TABLE_vidddd = [b12,_emscripten_glUniform4f__wrapper,_emscripten_glVertexAttrib4f__wrapper,b12];
var FUNCTION_TABLE_vdi = [b13,_emscripten_glSampleCoverage__wrapper];
var FUNCTION_TABLE_viiiiiii = [b14,_emscripten_glReadPixels__wrapper,_emscripten_glGetActiveUniform__wrapper,_emscripten_glGetActiveAttrib__wrapper];
var FUNCTION_TABLE_viiiiiiiii = [b15,_emscripten_glCompressedTexSubImage2D__wrapper,_emscripten_glTexImage2D__wrapper,_emscripten_glTexSubImage2D__wrapper];
var FUNCTION_TABLE_iii = [b16,_emscripten_glGetUniformLocation__wrapper,_emscripten_glGetAttribLocation__wrapper,b16];
var FUNCTION_TABLE_i = [b17,_emscripten_glCreateProgram__wrapper,_emscripten_glGetError__wrapper,b17];
var FUNCTION_TABLE_vdddddd = [b18,_emscripten_glFrustum__wrapper];
var FUNCTION_TABLE_vdddd = [b19,_emscripten_glRotatef__wrapper,_emscripten_glClearColor__wrapper,_emscripten_glBlendColor__wrapper];
var FUNCTION_TABLE_vdd = [b20,_emscripten_glDepthRange__wrapper,_emscripten_glDepthRangef__wrapper,_emscripten_glPolygonOffset__wrapper];
var FUNCTION_TABLE_v = [b21,_UpdateDrawFrame,_emscripten_glLoadIdentity__wrapper,_emscripten_glReleaseShaderCompiler__wrapper,_emscripten_glFinish__wrapper,_emscripten_glFlush__wrapper,b21,b21];
var FUNCTION_TABLE_viid = [b22,_emscripten_glTexParameterf__wrapper];
var FUNCTION_TABLE_viiii = [b23,_MouseButtonCallback,_emscripten_glBufferData__wrapper,_emscripten_glBufferSubData__wrapper,_emscripten_glUniform3i__wrapper,_emscripten_glUniformMatrix2fv__wrapper,_emscripten_glUniformMatrix3fv__wrapper,_emscripten_glUniformMatrix4fv__wrapper,_emscripten_glGetAttachedShaders__wrapper,_emscripten_glShaderSource__wrapper,_emscripten_glGetShaderSource__wrapper,_emscripten_glGetShaderInfoLog__wrapper,_emscripten_glGetShaderPrecisionFormat__wrapper,_emscripten_glGetProgramInfoLog__wrapper,_emscripten_glFramebufferRenderbuffer__wrapper,_emscripten_glGetFramebufferAttachmentParameteriv__wrapper,_emscripten_glGetInfoLogARB__wrapper,_emscripten_glVertexPointer__wrapper,_emscripten_glTexCoordPointer__wrapper,_emscripten_glColorPointer__wrapper,_emscripten_glDrawElements__wrapper,_emscripten_glDrawArraysInstanced__wrapper,_emscripten_glViewport__wrapper,_emscripten_glScissor__wrapper,_emscripten_glColorMask__wrapper,_emscripten_glRenderbufferStorage__wrapper,_emscripten_glBlendFuncSeparate__wrapper,_emscripten_glStencilFuncSeparate__wrapper,_emscripten_glStencilOpSeparate__wrapper,b23,b23,b23];

  return { _i64Subtract: _i64Subtract, _fflush: _fflush, _main: _main, _i64Add: _i64Add, _memmove: _memmove, _strstr: _strstr, _memset: _memset, _malloc: _malloc, _memcpy: _memcpy, _bitshift64Lshr: _bitshift64Lshr, _free: _free, _emscripten_GetProcAddress: _emscripten_GetProcAddress, ___errno_location: ___errno_location, _bitshift64Shl: _bitshift64Shl, runPostSets: runPostSets, stackAlloc: stackAlloc, stackSave: stackSave, stackRestore: stackRestore, establishStackSpace: establishStackSpace, setThrew: setThrew, setTempRet0: setTempRet0, getTempRet0: getTempRet0, dynCall_viiiii: dynCall_viiiii, dynCall_vd: dynCall_vd, dynCall_vid: dynCall_vid, dynCall_vi: dynCall_vi, dynCall_vii: dynCall_vii, dynCall_ii: dynCall_ii, dynCall_viddd: dynCall_viddd, dynCall_vidd: dynCall_vidd, dynCall_iiii: dynCall_iiii, dynCall_viiiiiiii: dynCall_viiiiiiii, dynCall_viiiiii: dynCall_viiiiii, dynCall_viii: dynCall_viii, dynCall_vidddd: dynCall_vidddd, dynCall_vdi: dynCall_vdi, dynCall_viiiiiii: dynCall_viiiiiii, dynCall_viiiiiiiii: dynCall_viiiiiiiii, dynCall_iii: dynCall_iii, dynCall_i: dynCall_i, dynCall_vdddddd: dynCall_vdddddd, dynCall_vdddd: dynCall_vdddd, dynCall_vdd: dynCall_vdd, dynCall_v: dynCall_v, dynCall_viid: dynCall_viid, dynCall_viiii: dynCall_viiii };
})
// EMSCRIPTEN_END_ASM
(Module.asmGlobalArg, Module.asmLibraryArg, buffer);
var real__i64Subtract = asm["_i64Subtract"]; asm["_i64Subtract"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Subtract.apply(null, arguments);
};

var real__fflush = asm["_fflush"]; asm["_fflush"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__fflush.apply(null, arguments);
};

var real__main = asm["_main"]; asm["_main"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__main.apply(null, arguments);
};

var real__i64Add = asm["_i64Add"]; asm["_i64Add"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__i64Add.apply(null, arguments);
};

var real__memmove = asm["_memmove"]; asm["_memmove"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__memmove.apply(null, arguments);
};

var real__strstr = asm["_strstr"]; asm["_strstr"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__strstr.apply(null, arguments);
};

var real__malloc = asm["_malloc"]; asm["_malloc"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__malloc.apply(null, arguments);
};

var real__bitshift64Lshr = asm["_bitshift64Lshr"]; asm["_bitshift64Lshr"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Lshr.apply(null, arguments);
};

var real__free = asm["_free"]; asm["_free"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__free.apply(null, arguments);
};

var real__emscripten_GetProcAddress = asm["_emscripten_GetProcAddress"]; asm["_emscripten_GetProcAddress"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__emscripten_GetProcAddress.apply(null, arguments);
};

var real____errno_location = asm["___errno_location"]; asm["___errno_location"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real____errno_location.apply(null, arguments);
};

var real__bitshift64Shl = asm["_bitshift64Shl"]; asm["_bitshift64Shl"] = function() {
assert(runtimeInitialized, 'you need to wait for the runtime to be ready (e.g. wait for main() to be called)');
assert(!runtimeExited, 'the runtime was exited (use NO_EXIT_RUNTIME to keep it alive after main() exits)');
return real__bitshift64Shl.apply(null, arguments);
};
var _i64Subtract = Module["_i64Subtract"] = asm["_i64Subtract"];
var _fflush = Module["_fflush"] = asm["_fflush"];
var _main = Module["_main"] = asm["_main"];
var _i64Add = Module["_i64Add"] = asm["_i64Add"];
var _memmove = Module["_memmove"] = asm["_memmove"];
var _strstr = Module["_strstr"] = asm["_strstr"];
var _memset = Module["_memset"] = asm["_memset"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _bitshift64Lshr = Module["_bitshift64Lshr"] = asm["_bitshift64Lshr"];
var _free = Module["_free"] = asm["_free"];
var _emscripten_GetProcAddress = Module["_emscripten_GetProcAddress"] = asm["_emscripten_GetProcAddress"];
var ___errno_location = Module["___errno_location"] = asm["___errno_location"];
var _bitshift64Shl = Module["_bitshift64Shl"] = asm["_bitshift64Shl"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_vd = Module["dynCall_vd"] = asm["dynCall_vd"];
var dynCall_vid = Module["dynCall_vid"] = asm["dynCall_vid"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_viddd = Module["dynCall_viddd"] = asm["dynCall_viddd"];
var dynCall_vidd = Module["dynCall_vidd"] = asm["dynCall_vidd"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = asm["dynCall_viiiiiiii"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_vidddd = Module["dynCall_vidddd"] = asm["dynCall_vidddd"];
var dynCall_vdi = Module["dynCall_vdi"] = asm["dynCall_vdi"];
var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = asm["dynCall_viiiiiii"];
var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = asm["dynCall_viiiiiiiii"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_vdddddd = Module["dynCall_vdddddd"] = asm["dynCall_vdddddd"];
var dynCall_vdddd = Module["dynCall_vdddd"] = asm["dynCall_vdddd"];
var dynCall_vdd = Module["dynCall_vdd"] = asm["dynCall_vdd"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_viid = Module["dynCall_viid"] = asm["dynCall_viid"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
;

Runtime.stackAlloc = asm['stackAlloc'];
Runtime.stackSave = asm['stackSave'];
Runtime.stackRestore = asm['stackRestore'];
Runtime.establishStackSpace = asm['establishStackSpace'];

Runtime.setTempRet0 = asm['setTempRet0'];
Runtime.getTempRet0 = asm['getTempRet0'];



// === Auto-generated postamble setup entry stuff ===


function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun']) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString(Module['thisProgram']), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);


  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    exit(ret, /* implicit = */ true);
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return; 

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

    if (Module['_main'] && shouldRunNow) Module['callMain'](args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status, implicit) {
  if (implicit && Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') implicitly called by end of main(), but noExitRuntime, so not exiting the runtime (you can use emscripten_force_exit, if you want to force a true shutdown)');
    return;
  }

  if (Module['noExitRuntime']) {
    Module.printErr('exit(' + status + ') called, but noExitRuntime, so halting execution but not exiting the runtime or preventing further async execution (you can use emscripten_force_exit, if you want to force a true shutdown)');
  } else {

    ABORT = true;
    EXITSTATUS = status;
    STACKTOP = initialStackTop;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  if (ENVIRONMENT_IS_NODE) {
    // Work around a node.js bug where stdout buffer is not flushed at process exit:
    // Instead of process.exit() directly, wait for stdout flush event.
    // See https://github.com/joyent/node/issues/1669 and https://github.com/kripken/emscripten/issues/2582
    // Workaround is based on https://github.com/RReverser/acorn/commit/50ab143cecc9ed71a2d66f78b4aec3bb2e9844f6
    process['stdout']['once']('drain', function () {
      process['exit'](status);
    });
    console.log(' '); // Make sure to print something to force the drain event to occur, in case the stdout buffer was empty.
    // Work around another node bug where sometimes 'drain' is never fired - make another effort
    // to emit the exit status, after a significant delay (if node hasn't fired drain by then, give up)
    setTimeout(function() {
      process['exit'](status);
    }, 500);
  } else
  if (ENVIRONMENT_IS_SHELL && typeof quit === 'function') {
    quit(status);
  }
  // if we reach here, we must throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

var abortDecorators = [];

function abort(what) {
  if (what !== undefined) {
    Module.print(what);
    Module.printErr(what);
    what = JSON.stringify(what)
  } else {
    what = '';
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '';

  var output = 'abort(' + what + ') at ' + stackTrace() + extra;
  if (abortDecorators) {
    abortDecorators.forEach(function(decorator) {
      output = decorator(output, what);
    });
  }
  throw output;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}



