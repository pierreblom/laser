var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/jsbarcode/bin/barcodes/Barcode.js
var require_Barcode = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/Barcode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var Barcode = function Barcode2(data, options) {
      _classCallCheck(this, Barcode2);
      this.data = data;
      this.text = options.text || data;
      this.options = options;
    };
    exports.default = Barcode;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE39/index.js
var require_CODE39 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE39/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CODE39 = void 0;
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE39 = (function(_Barcode) {
      _inherits(CODE392, _Barcode);
      function CODE392(data, options) {
        _classCallCheck(this, CODE392);
        data = data.toUpperCase();
        if (options.mod43) {
          data += getCharacter(mod43checksum(data));
        }
        return _possibleConstructorReturn(this, (CODE392.__proto__ || Object.getPrototypeOf(CODE392)).call(this, data, options));
      }
      _createClass(CODE392, [{
        key: "encode",
        value: function encode() {
          var result = getEncoding("*");
          for (var i = 0; i < this.data.length; i++) {
            result += getEncoding(this.data[i]) + "0";
          }
          result += getEncoding("*");
          return {
            data: result,
            text: this.text
          };
        }
      }, {
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/) !== -1;
        }
      }]);
      return CODE392;
    })(_Barcode3.default);
    var characters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "-", ".", " ", "$", "/", "+", "%", "*"];
    var encodings = [20957, 29783, 23639, 30485, 20951, 29813, 23669, 20855, 29789, 23645, 29975, 23831, 30533, 22295, 30149, 24005, 21623, 29981, 23837, 22301, 30023, 23879, 30545, 22343, 30161, 24017, 21959, 30065, 23921, 22385, 29015, 18263, 29141, 17879, 29045, 18293, 17783, 29021, 18269, 17477, 17489, 17681, 20753, 35770];
    function getEncoding(character) {
      return getBinary(characterValue(character));
    }
    function getBinary(characterValue2) {
      return encodings[characterValue2].toString(2);
    }
    function getCharacter(characterValue2) {
      return characters[characterValue2];
    }
    function characterValue(character) {
      return characters.indexOf(character);
    }
    function mod43checksum(data) {
      var checksum = 0;
      for (var i = 0; i < data.length; i++) {
        checksum += characterValue(data[i]);
      }
      checksum = checksum % 43;
      return checksum;
    }
    exports.CODE39 = CODE39;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/constants.js
var require_constants = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _SET_BY_CODE;
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var SET_A = exports.SET_A = 0;
    var SET_B = exports.SET_B = 1;
    var SET_C = exports.SET_C = 2;
    var SHIFT = exports.SHIFT = 98;
    var START_A = exports.START_A = 103;
    var START_B = exports.START_B = 104;
    var START_C = exports.START_C = 105;
    var MODULO = exports.MODULO = 103;
    var STOP = exports.STOP = 106;
    var FNC1 = exports.FNC1 = 207;
    var SET_BY_CODE = exports.SET_BY_CODE = (_SET_BY_CODE = {}, _defineProperty(_SET_BY_CODE, START_A, SET_A), _defineProperty(_SET_BY_CODE, START_B, SET_B), _defineProperty(_SET_BY_CODE, START_C, SET_C), _SET_BY_CODE);
    var SWAP = exports.SWAP = {
      101: SET_A,
      100: SET_B,
      99: SET_C
    };
    var A_START_CHAR = exports.A_START_CHAR = String.fromCharCode(208);
    var B_START_CHAR = exports.B_START_CHAR = String.fromCharCode(209);
    var C_START_CHAR = exports.C_START_CHAR = String.fromCharCode(210);
    var A_CHARS = exports.A_CHARS = "[\0-_\xC8-\xCF]";
    var B_CHARS = exports.B_CHARS = "[ -\x7F\xC8-\xCF]";
    var C_CHARS = exports.C_CHARS = "(\xCF*[0-9]{2}\xCF*)";
    var BARS = exports.BARS = [11011001100, 11001101100, 11001100110, 10010011e3, 10010001100, 10001001100, 10011001e3, 10011000100, 10001100100, 11001001e3, 11001000100, 11000100100, 10110011100, 10011011100, 10011001110, 10111001100, 10011101100, 10011100110, 11001110010, 11001011100, 11001001110, 11011100100, 11001110100, 11101101110, 11101001100, 11100101100, 11100100110, 11101100100, 11100110100, 11100110010, 11011011e3, 11011000110, 11000110110, 10100011e3, 10001011e3, 10001000110, 10110001e3, 10001101e3, 10001100010, 11010001e3, 11000101e3, 11000100010, 10110111e3, 10110001110, 10001101110, 10111011e3, 10111000110, 10001110110, 11101110110, 11010001110, 11000101110, 11011101e3, 11011100010, 11011101110, 11101011e3, 11101000110, 11100010110, 11101101e3, 11101100010, 11100011010, 11101111010, 11001000010, 11110001010, 1010011e4, 10100001100, 1001011e4, 10010000110, 10000101100, 10000100110, 1011001e4, 10110000100, 1001101e4, 10011000010, 10000110100, 10000110010, 11000010010, 1100101e4, 11110111010, 11000010100, 10001111010, 10100111100, 10010111100, 10010011110, 10111100100, 10011110100, 10011110010, 11110100100, 11110010100, 11110010010, 11011011110, 11011110110, 11110110110, 10101111e3, 10100011110, 10001011110, 10111101e3, 10111100010, 11110101e3, 11110100010, 10111011110, 10111101110, 11101011110, 11110101110, 11010000100, 1101001e4, 11010011100, 1100011101011];
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js
var require_CODE128 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/CODE128.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    var _constants = require_constants();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE128 = (function(_Barcode) {
      _inherits(CODE1282, _Barcode);
      function CODE1282(data, options) {
        _classCallCheck(this, CODE1282);
        var _this = _possibleConstructorReturn(this, (CODE1282.__proto__ || Object.getPrototypeOf(CODE1282)).call(this, data.substring(1), options));
        _this.bytes = data.split("").map(function(char) {
          return char.charCodeAt(0);
        });
        return _this;
      }
      _createClass(CODE1282, [{
        key: "valid",
        value: function valid() {
          return /^[\x00-\x7F\xC8-\xD3]+$/.test(this.data);
        }
        // The public encoding function
      }, {
        key: "encode",
        value: function encode() {
          var bytes = this.bytes;
          var startIndex = bytes.shift() - 105;
          var startSet = _constants.SET_BY_CODE[startIndex];
          if (startSet === void 0) {
            throw new RangeError("The encoding does not start with a start character.");
          }
          if (this.shouldEncodeAsEan128() === true) {
            bytes.unshift(_constants.FNC1);
          }
          var encodingResult = CODE1282.next(bytes, 1, startSet);
          return {
            text: this.text === this.data ? this.text.replace(/[^\x20-\x7E]/g, "") : this.text,
            data: (
              // Add the start bits
              CODE1282.getBar(startIndex) + // Add the encoded bits
              encodingResult.result + // Add the checksum
              CODE1282.getBar((encodingResult.checksum + startIndex) % _constants.MODULO) + // Add the end bits
              CODE1282.getBar(_constants.STOP)
            )
          };
        }
        // GS1-128/EAN-128
      }, {
        key: "shouldEncodeAsEan128",
        value: function shouldEncodeAsEan128() {
          var isEAN128 = this.options.ean128 || false;
          if (typeof isEAN128 === "string") {
            isEAN128 = isEAN128.toLowerCase() === "true";
          }
          return isEAN128;
        }
        // Get a bar symbol by index
      }], [{
        key: "getBar",
        value: function getBar(index) {
          return _constants.BARS[index] ? _constants.BARS[index].toString() : "";
        }
        // Correct an index by a set and shift it from the bytes array
      }, {
        key: "correctIndex",
        value: function correctIndex(bytes, set) {
          if (set === _constants.SET_A) {
            var charCode = bytes.shift();
            return charCode < 32 ? charCode + 64 : charCode - 32;
          } else if (set === _constants.SET_B) {
            return bytes.shift() - 32;
          } else {
            return (bytes.shift() - 48) * 10 + bytes.shift() - 48;
          }
        }
      }, {
        key: "next",
        value: function next(bytes, pos, set) {
          if (!bytes.length) {
            return { result: "", checksum: 0 };
          }
          var nextCode = void 0, index = void 0;
          if (bytes[0] >= 200) {
            index = bytes.shift() - 105;
            var nextSet = _constants.SWAP[index];
            if (nextSet !== void 0) {
              nextCode = CODE1282.next(bytes, pos + 1, nextSet);
            } else {
              if ((set === _constants.SET_A || set === _constants.SET_B) && index === _constants.SHIFT) {
                bytes[0] = set === _constants.SET_A ? bytes[0] > 95 ? bytes[0] - 96 : bytes[0] : bytes[0] < 32 ? bytes[0] + 96 : bytes[0];
              }
              nextCode = CODE1282.next(bytes, pos + 1, set);
            }
          } else {
            index = CODE1282.correctIndex(bytes, set);
            nextCode = CODE1282.next(bytes, pos + 1, set);
          }
          var enc = CODE1282.getBar(index);
          var weight = index * pos;
          return {
            result: enc + nextCode.result,
            checksum: weight + nextCode.checksum
          };
        }
      }]);
      return CODE1282;
    })(_Barcode3.default);
    exports.default = CODE128;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/auto.js
var require_auto = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/auto.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _constants = require_constants();
    var matchSetALength = function matchSetALength2(string) {
      return string.match(new RegExp("^" + _constants.A_CHARS + "*"))[0].length;
    };
    var matchSetBLength = function matchSetBLength2(string) {
      return string.match(new RegExp("^" + _constants.B_CHARS + "*"))[0].length;
    };
    var matchSetC = function matchSetC2(string) {
      return string.match(new RegExp("^" + _constants.C_CHARS + "*"))[0];
    };
    function autoSelectFromAB(string, isA) {
      var ranges = isA ? _constants.A_CHARS : _constants.B_CHARS;
      var untilC = string.match(new RegExp("^(" + ranges + "+?)(([0-9]{2}){2,})([^0-9]|$)"));
      if (untilC) {
        return untilC[1] + String.fromCharCode(204) + autoSelectFromC(string.substring(untilC[1].length));
      }
      var chars = string.match(new RegExp("^" + ranges + "+"))[0];
      if (chars.length === string.length) {
        return string;
      }
      return chars + String.fromCharCode(isA ? 205 : 206) + autoSelectFromAB(string.substring(chars.length), !isA);
    }
    function autoSelectFromC(string) {
      var cMatch = matchSetC(string);
      var length = cMatch.length;
      if (length === string.length) {
        return string;
      }
      string = string.substring(length);
      var isA = matchSetALength(string) >= matchSetBLength(string);
      return cMatch + String.fromCharCode(isA ? 206 : 205) + autoSelectFromAB(string, isA);
    }
    exports.default = function(string) {
      var newString = void 0;
      var cLength = matchSetC(string).length;
      if (cLength >= 2) {
        newString = _constants.C_START_CHAR + autoSelectFromC(string);
      } else {
        var isA = matchSetALength(string) > matchSetBLength(string);
        newString = (isA ? _constants.A_START_CHAR : _constants.B_START_CHAR) + autoSelectFromAB(string, isA);
      }
      return newString.replace(
        /[\xCD\xCE]([^])[\xCD\xCE]/,
        // Any sequence between 205 and 206 characters
        function(match, char) {
          return String.fromCharCode(203) + char;
        }
      );
    };
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js
var require_CODE128_AUTO = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/CODE128_AUTO.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _CODE2 = require_CODE128();
    var _CODE3 = _interopRequireDefault(_CODE2);
    var _auto = require_auto();
    var _auto2 = _interopRequireDefault(_auto);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE128AUTO = (function(_CODE) {
      _inherits(CODE128AUTO2, _CODE);
      function CODE128AUTO2(data, options) {
        _classCallCheck(this, CODE128AUTO2);
        if (/^[\x00-\x7F\xC8-\xD3]+$/.test(data)) {
          var _this = _possibleConstructorReturn(this, (CODE128AUTO2.__proto__ || Object.getPrototypeOf(CODE128AUTO2)).call(this, (0, _auto2.default)(data), options));
        } else {
          var _this = _possibleConstructorReturn(this, (CODE128AUTO2.__proto__ || Object.getPrototypeOf(CODE128AUTO2)).call(this, data, options));
        }
        return _possibleConstructorReturn(_this);
      }
      return CODE128AUTO2;
    })(_CODE3.default);
    exports.default = CODE128AUTO;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/CODE128A.js
var require_CODE128A = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/CODE128A.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _CODE2 = require_CODE128();
    var _CODE3 = _interopRequireDefault(_CODE2);
    var _constants = require_constants();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE128A = (function(_CODE) {
      _inherits(CODE128A2, _CODE);
      function CODE128A2(string, options) {
        _classCallCheck(this, CODE128A2);
        return _possibleConstructorReturn(this, (CODE128A2.__proto__ || Object.getPrototypeOf(CODE128A2)).call(this, _constants.A_START_CHAR + string, options));
      }
      _createClass(CODE128A2, [{
        key: "valid",
        value: function valid() {
          return new RegExp("^" + _constants.A_CHARS + "+$").test(this.data);
        }
      }]);
      return CODE128A2;
    })(_CODE3.default);
    exports.default = CODE128A;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/CODE128B.js
var require_CODE128B = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/CODE128B.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _CODE2 = require_CODE128();
    var _CODE3 = _interopRequireDefault(_CODE2);
    var _constants = require_constants();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE128B = (function(_CODE) {
      _inherits(CODE128B2, _CODE);
      function CODE128B2(string, options) {
        _classCallCheck(this, CODE128B2);
        return _possibleConstructorReturn(this, (CODE128B2.__proto__ || Object.getPrototypeOf(CODE128B2)).call(this, _constants.B_START_CHAR + string, options));
      }
      _createClass(CODE128B2, [{
        key: "valid",
        value: function valid() {
          return new RegExp("^" + _constants.B_CHARS + "+$").test(this.data);
        }
      }]);
      return CODE128B2;
    })(_CODE3.default);
    exports.default = CODE128B;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/CODE128C.js
var require_CODE128C = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/CODE128C.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _CODE2 = require_CODE128();
    var _CODE3 = _interopRequireDefault(_CODE2);
    var _constants = require_constants();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE128C = (function(_CODE) {
      _inherits(CODE128C2, _CODE);
      function CODE128C2(string, options) {
        _classCallCheck(this, CODE128C2);
        return _possibleConstructorReturn(this, (CODE128C2.__proto__ || Object.getPrototypeOf(CODE128C2)).call(this, _constants.C_START_CHAR + string, options));
      }
      _createClass(CODE128C2, [{
        key: "valid",
        value: function valid() {
          return new RegExp("^" + _constants.C_CHARS + "+$").test(this.data);
        }
      }]);
      return CODE128C2;
    })(_CODE3.default);
    exports.default = CODE128C;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE128/index.js
var require_CODE1282 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE128/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CODE128C = exports.CODE128B = exports.CODE128A = exports.CODE128 = void 0;
    var _CODE128_AUTO = require_CODE128_AUTO();
    var _CODE128_AUTO2 = _interopRequireDefault(_CODE128_AUTO);
    var _CODE128A = require_CODE128A();
    var _CODE128A2 = _interopRequireDefault(_CODE128A);
    var _CODE128B = require_CODE128B();
    var _CODE128B2 = _interopRequireDefault(_CODE128B);
    var _CODE128C = require_CODE128C();
    var _CODE128C2 = _interopRequireDefault(_CODE128C);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.CODE128 = _CODE128_AUTO2.default;
    exports.CODE128A = _CODE128A2.default;
    exports.CODE128B = _CODE128B2.default;
    exports.CODE128C = _CODE128C2.default;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js
var require_constants2 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SIDE_BIN = exports.SIDE_BIN = "101";
    var MIDDLE_BIN = exports.MIDDLE_BIN = "01010";
    var BINARIES = exports.BINARIES = {
      "L": [
        // The L (left) type of encoding
        "0001101",
        "0011001",
        "0010011",
        "0111101",
        "0100011",
        "0110001",
        "0101111",
        "0111011",
        "0110111",
        "0001011"
      ],
      "G": [
        // The G type of encoding
        "0100111",
        "0110011",
        "0011011",
        "0100001",
        "0011101",
        "0111001",
        "0000101",
        "0010001",
        "0001001",
        "0010111"
      ],
      "R": [
        // The R (right) type of encoding
        "1110010",
        "1100110",
        "1101100",
        "1000010",
        "1011100",
        "1001110",
        "1010000",
        "1000100",
        "1001000",
        "1110100"
      ],
      "O": [
        // The O (odd) encoding for UPC-E
        "0001101",
        "0011001",
        "0010011",
        "0111101",
        "0100011",
        "0110001",
        "0101111",
        "0111011",
        "0110111",
        "0001011"
      ],
      "E": [
        // The E (even) encoding for UPC-E
        "0100111",
        "0110011",
        "0011011",
        "0100001",
        "0011101",
        "0111001",
        "0000101",
        "0010001",
        "0001001",
        "0010111"
      ]
    };
    var EAN2_STRUCTURE = exports.EAN2_STRUCTURE = ["LL", "LG", "GL", "GG"];
    var EAN5_STRUCTURE = exports.EAN5_STRUCTURE = ["GGLLL", "GLGLL", "GLLGL", "GLLLG", "LGGLL", "LLGGL", "LLLGG", "LGLGL", "LGLLG", "LLGLG"];
    var EAN13_STRUCTURE = exports.EAN13_STRUCTURE = ["LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"];
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js
var require_encoder = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/encoder.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _constants = require_constants2();
    var encode = function encode2(data, structure, separator) {
      var encoded = data.split("").map(function(val, idx) {
        return _constants.BINARIES[structure[idx]];
      }).map(function(val, idx) {
        return val ? val[data[idx]] : "";
      });
      if (separator) {
        var last = data.length - 1;
        encoded = encoded.map(function(val, idx) {
          return idx < last ? val + separator : val;
        });
      }
      return encoded.join("");
    };
    exports.default = encode;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js
var require_EAN = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _constants = require_constants2();
    var _encoder = require_encoder();
    var _encoder2 = _interopRequireDefault(_encoder);
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var EAN = (function(_Barcode) {
      _inherits(EAN2, _Barcode);
      function EAN2(data, options) {
        _classCallCheck(this, EAN2);
        var _this = _possibleConstructorReturn(this, (EAN2.__proto__ || Object.getPrototypeOf(EAN2)).call(this, data, options));
        _this.fontSize = !options.flat && options.fontSize > options.width * 10 ? options.width * 10 : options.fontSize;
        _this.guardHeight = options.height + _this.fontSize / 2 + options.textMargin;
        return _this;
      }
      _createClass(EAN2, [{
        key: "encode",
        value: function encode() {
          return this.options.flat ? this.encodeFlat() : this.encodeGuarded();
        }
      }, {
        key: "leftText",
        value: function leftText(from, to) {
          return this.text.substr(from, to);
        }
      }, {
        key: "leftEncode",
        value: function leftEncode(data, structure) {
          return (0, _encoder2.default)(data, structure);
        }
      }, {
        key: "rightText",
        value: function rightText(from, to) {
          return this.text.substr(from, to);
        }
      }, {
        key: "rightEncode",
        value: function rightEncode(data, structure) {
          return (0, _encoder2.default)(data, structure);
        }
      }, {
        key: "encodeGuarded",
        value: function encodeGuarded() {
          var textOptions = { fontSize: this.fontSize };
          var guardOptions = { height: this.guardHeight };
          return [{ data: _constants.SIDE_BIN, options: guardOptions }, { data: this.leftEncode(), text: this.leftText(), options: textOptions }, { data: _constants.MIDDLE_BIN, options: guardOptions }, { data: this.rightEncode(), text: this.rightText(), options: textOptions }, { data: _constants.SIDE_BIN, options: guardOptions }];
        }
      }, {
        key: "encodeFlat",
        value: function encodeFlat() {
          var data = [_constants.SIDE_BIN, this.leftEncode(), _constants.MIDDLE_BIN, this.rightEncode(), _constants.SIDE_BIN];
          return {
            data: data.join(""),
            text: this.text
          };
        }
      }]);
      return EAN2;
    })(_Barcode3.default);
    exports.default = EAN;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN13.js
var require_EAN13 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN13.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === void 0) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return void 0;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === void 0) {
          return void 0;
        }
        return getter.call(receiver);
      }
    };
    var _constants = require_constants2();
    var _EAN2 = require_EAN();
    var _EAN3 = _interopRequireDefault(_EAN2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var checksum = function checksum2(number) {
      var res = number.substr(0, 12).split("").map(function(n) {
        return +n;
      }).reduce(function(sum, a, idx) {
        return idx % 2 ? sum + a * 3 : sum + a;
      }, 0);
      return (10 - res % 10) % 10;
    };
    var EAN13 = (function(_EAN) {
      _inherits(EAN132, _EAN);
      function EAN132(data, options) {
        _classCallCheck(this, EAN132);
        if (data.search(/^[0-9]{12}$/) !== -1) {
          data += checksum(data);
        }
        var _this = _possibleConstructorReturn(this, (EAN132.__proto__ || Object.getPrototypeOf(EAN132)).call(this, data, options));
        _this.lastChar = options.lastChar;
        return _this;
      }
      _createClass(EAN132, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{13}$/) !== -1 && +this.data[12] === checksum(this.data);
        }
      }, {
        key: "leftText",
        value: function leftText() {
          return _get(EAN132.prototype.__proto__ || Object.getPrototypeOf(EAN132.prototype), "leftText", this).call(this, 1, 6);
        }
      }, {
        key: "leftEncode",
        value: function leftEncode() {
          var data = this.data.substr(1, 6);
          var structure = _constants.EAN13_STRUCTURE[this.data[0]];
          return _get(EAN132.prototype.__proto__ || Object.getPrototypeOf(EAN132.prototype), "leftEncode", this).call(this, data, structure);
        }
      }, {
        key: "rightText",
        value: function rightText() {
          return _get(EAN132.prototype.__proto__ || Object.getPrototypeOf(EAN132.prototype), "rightText", this).call(this, 7, 6);
        }
      }, {
        key: "rightEncode",
        value: function rightEncode() {
          var data = this.data.substr(7, 6);
          return _get(EAN132.prototype.__proto__ || Object.getPrototypeOf(EAN132.prototype), "rightEncode", this).call(this, data, "RRRRRR");
        }
        // The "standard" way of printing EAN13 barcodes with guard bars
      }, {
        key: "encodeGuarded",
        value: function encodeGuarded() {
          var data = _get(EAN132.prototype.__proto__ || Object.getPrototypeOf(EAN132.prototype), "encodeGuarded", this).call(this);
          if (this.options.displayValue) {
            data.unshift({
              data: "000000000000",
              text: this.text.substr(0, 1),
              options: { textAlign: "left", fontSize: this.fontSize }
            });
            if (this.options.lastChar) {
              data.push({
                data: "00"
              });
              data.push({
                data: "00000",
                text: this.options.lastChar,
                options: { fontSize: this.fontSize }
              });
            }
          }
          return data;
        }
      }]);
      return EAN132;
    })(_EAN3.default);
    exports.default = EAN13;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN8.js
var require_EAN8 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN8.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _get = function get(object, property, receiver) {
      if (object === null) object = Function.prototype;
      var desc = Object.getOwnPropertyDescriptor(object, property);
      if (desc === void 0) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return void 0;
        } else {
          return get(parent, property, receiver);
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === void 0) {
          return void 0;
        }
        return getter.call(receiver);
      }
    };
    var _EAN2 = require_EAN();
    var _EAN3 = _interopRequireDefault(_EAN2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var checksum = function checksum2(number) {
      var res = number.substr(0, 7).split("").map(function(n) {
        return +n;
      }).reduce(function(sum, a, idx) {
        return idx % 2 ? sum + a : sum + a * 3;
      }, 0);
      return (10 - res % 10) % 10;
    };
    var EAN8 = (function(_EAN) {
      _inherits(EAN82, _EAN);
      function EAN82(data, options) {
        _classCallCheck(this, EAN82);
        if (data.search(/^[0-9]{7}$/) !== -1) {
          data += checksum(data);
        }
        return _possibleConstructorReturn(this, (EAN82.__proto__ || Object.getPrototypeOf(EAN82)).call(this, data, options));
      }
      _createClass(EAN82, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{8}$/) !== -1 && +this.data[7] === checksum(this.data);
        }
      }, {
        key: "leftText",
        value: function leftText() {
          return _get(EAN82.prototype.__proto__ || Object.getPrototypeOf(EAN82.prototype), "leftText", this).call(this, 0, 4);
        }
      }, {
        key: "leftEncode",
        value: function leftEncode() {
          var data = this.data.substr(0, 4);
          return _get(EAN82.prototype.__proto__ || Object.getPrototypeOf(EAN82.prototype), "leftEncode", this).call(this, data, "LLLL");
        }
      }, {
        key: "rightText",
        value: function rightText() {
          return _get(EAN82.prototype.__proto__ || Object.getPrototypeOf(EAN82.prototype), "rightText", this).call(this, 4, 4);
        }
      }, {
        key: "rightEncode",
        value: function rightEncode() {
          var data = this.data.substr(4, 4);
          return _get(EAN82.prototype.__proto__ || Object.getPrototypeOf(EAN82.prototype), "rightEncode", this).call(this, data, "RRRR");
        }
      }]);
      return EAN82;
    })(_EAN3.default);
    exports.default = EAN8;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN5.js
var require_EAN5 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN5.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _constants = require_constants2();
    var _encoder = require_encoder();
    var _encoder2 = _interopRequireDefault(_encoder);
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var checksum = function checksum2(data) {
      var result = data.split("").map(function(n) {
        return +n;
      }).reduce(function(sum, a, idx) {
        return idx % 2 ? sum + a * 9 : sum + a * 3;
      }, 0);
      return result % 10;
    };
    var EAN5 = (function(_Barcode) {
      _inherits(EAN52, _Barcode);
      function EAN52(data, options) {
        _classCallCheck(this, EAN52);
        return _possibleConstructorReturn(this, (EAN52.__proto__ || Object.getPrototypeOf(EAN52)).call(this, data, options));
      }
      _createClass(EAN52, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{5}$/) !== -1;
        }
      }, {
        key: "encode",
        value: function encode() {
          var structure = _constants.EAN5_STRUCTURE[checksum(this.data)];
          return {
            data: "1011" + (0, _encoder2.default)(this.data, structure, "01"),
            text: this.text
          };
        }
      }]);
      return EAN52;
    })(_Barcode3.default);
    exports.default = EAN5;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN2.js
var require_EAN2 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/EAN2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _constants = require_constants2();
    var _encoder = require_encoder();
    var _encoder2 = _interopRequireDefault(_encoder);
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var EAN2 = (function(_Barcode) {
      _inherits(EAN22, _Barcode);
      function EAN22(data, options) {
        _classCallCheck(this, EAN22);
        return _possibleConstructorReturn(this, (EAN22.__proto__ || Object.getPrototypeOf(EAN22)).call(this, data, options));
      }
      _createClass(EAN22, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{2}$/) !== -1;
        }
      }, {
        key: "encode",
        value: function encode() {
          var structure = _constants.EAN2_STRUCTURE[parseInt(this.data) % 4];
          return {
            // Start bits + Encode the two digits with 01 in between
            data: "1011" + (0, _encoder2.default)(this.data, structure, "01"),
            text: this.text
          };
        }
      }]);
      return EAN22;
    })(_Barcode3.default);
    exports.default = EAN2;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js
var require_UPC = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPC.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    exports.checksum = checksum;
    var _encoder = require_encoder();
    var _encoder2 = _interopRequireDefault(_encoder);
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var UPC = (function(_Barcode) {
      _inherits(UPC2, _Barcode);
      function UPC2(data, options) {
        _classCallCheck(this, UPC2);
        if (data.search(/^[0-9]{11}$/) !== -1) {
          data += checksum(data);
        }
        var _this = _possibleConstructorReturn(this, (UPC2.__proto__ || Object.getPrototypeOf(UPC2)).call(this, data, options));
        _this.displayValue = options.displayValue;
        if (options.fontSize > options.width * 10) {
          _this.fontSize = options.width * 10;
        } else {
          _this.fontSize = options.fontSize;
        }
        _this.guardHeight = options.height + _this.fontSize / 2 + options.textMargin;
        return _this;
      }
      _createClass(UPC2, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{12}$/) !== -1 && this.data[11] == checksum(this.data);
        }
      }, {
        key: "encode",
        value: function encode() {
          if (this.options.flat) {
            return this.flatEncoding();
          } else {
            return this.guardedEncoding();
          }
        }
      }, {
        key: "flatEncoding",
        value: function flatEncoding() {
          var result = "";
          result += "101";
          result += (0, _encoder2.default)(this.data.substr(0, 6), "LLLLLL");
          result += "01010";
          result += (0, _encoder2.default)(this.data.substr(6, 6), "RRRRRR");
          result += "101";
          return {
            data: result,
            text: this.text
          };
        }
      }, {
        key: "guardedEncoding",
        value: function guardedEncoding() {
          var result = [];
          if (this.displayValue) {
            result.push({
              data: "00000000",
              text: this.text.substr(0, 1),
              options: { textAlign: "left", fontSize: this.fontSize }
            });
          }
          result.push({
            data: "101" + (0, _encoder2.default)(this.data[0], "L"),
            options: { height: this.guardHeight }
          });
          result.push({
            data: (0, _encoder2.default)(this.data.substr(1, 5), "LLLLL"),
            text: this.text.substr(1, 5),
            options: { fontSize: this.fontSize }
          });
          result.push({
            data: "01010",
            options: { height: this.guardHeight }
          });
          result.push({
            data: (0, _encoder2.default)(this.data.substr(6, 5), "RRRRR"),
            text: this.text.substr(6, 5),
            options: { fontSize: this.fontSize }
          });
          result.push({
            data: (0, _encoder2.default)(this.data[11], "R") + "101",
            options: { height: this.guardHeight }
          });
          if (this.displayValue) {
            result.push({
              data: "00000000",
              text: this.text.substr(11, 1),
              options: { textAlign: "right", fontSize: this.fontSize }
            });
          }
          return result;
        }
      }]);
      return UPC2;
    })(_Barcode3.default);
    function checksum(number) {
      var result = 0;
      var i;
      for (i = 1; i < 11; i += 2) {
        result += parseInt(number[i]);
      }
      for (i = 0; i < 11; i += 2) {
        result += parseInt(number[i]) * 3;
      }
      return (10 - result % 10) % 10;
    }
    exports.default = UPC;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPCE.js
var require_UPCE = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/UPCE.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _encoder = require_encoder();
    var _encoder2 = _interopRequireDefault(_encoder);
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    var _UPC = require_UPC();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var EXPANSIONS = ["XX00000XXX", "XX10000XXX", "XX20000XXX", "XXX00000XX", "XXXX00000X", "XXXXX00005", "XXXXX00006", "XXXXX00007", "XXXXX00008", "XXXXX00009"];
    var PARITIES = [["EEEOOO", "OOOEEE"], ["EEOEOO", "OOEOEE"], ["EEOOEO", "OOEEOE"], ["EEOOOE", "OOEEEO"], ["EOEEOO", "OEOOEE"], ["EOOEEO", "OEEOOE"], ["EOOOEE", "OEEEOO"], ["EOEOEO", "OEOEOE"], ["EOEOOE", "OEOEEO"], ["EOOEOE", "OEEOEO"]];
    var UPCE = (function(_Barcode) {
      _inherits(UPCE2, _Barcode);
      function UPCE2(data, options) {
        _classCallCheck(this, UPCE2);
        var _this = _possibleConstructorReturn(this, (UPCE2.__proto__ || Object.getPrototypeOf(UPCE2)).call(this, data, options));
        _this.isValid = false;
        if (data.search(/^[0-9]{6}$/) !== -1) {
          _this.middleDigits = data;
          _this.upcA = expandToUPCA(data, "0");
          _this.text = options.text || "" + _this.upcA[0] + data + _this.upcA[_this.upcA.length - 1];
          _this.isValid = true;
        } else if (data.search(/^[01][0-9]{7}$/) !== -1) {
          _this.middleDigits = data.substring(1, data.length - 1);
          _this.upcA = expandToUPCA(_this.middleDigits, data[0]);
          if (_this.upcA[_this.upcA.length - 1] === data[data.length - 1]) {
            _this.isValid = true;
          } else {
            return _possibleConstructorReturn(_this);
          }
        } else {
          return _possibleConstructorReturn(_this);
        }
        _this.displayValue = options.displayValue;
        if (options.fontSize > options.width * 10) {
          _this.fontSize = options.width * 10;
        } else {
          _this.fontSize = options.fontSize;
        }
        _this.guardHeight = options.height + _this.fontSize / 2 + options.textMargin;
        return _this;
      }
      _createClass(UPCE2, [{
        key: "valid",
        value: function valid() {
          return this.isValid;
        }
      }, {
        key: "encode",
        value: function encode() {
          if (this.options.flat) {
            return this.flatEncoding();
          } else {
            return this.guardedEncoding();
          }
        }
      }, {
        key: "flatEncoding",
        value: function flatEncoding() {
          var result = "";
          result += "101";
          result += this.encodeMiddleDigits();
          result += "010101";
          return {
            data: result,
            text: this.text
          };
        }
      }, {
        key: "guardedEncoding",
        value: function guardedEncoding() {
          var result = [];
          if (this.displayValue) {
            result.push({
              data: "00000000",
              text: this.text[0],
              options: { textAlign: "left", fontSize: this.fontSize }
            });
          }
          result.push({
            data: "101",
            options: { height: this.guardHeight }
          });
          result.push({
            data: this.encodeMiddleDigits(),
            text: this.text.substring(1, 7),
            options: { fontSize: this.fontSize }
          });
          result.push({
            data: "010101",
            options: { height: this.guardHeight }
          });
          if (this.displayValue) {
            result.push({
              data: "00000000",
              text: this.text[7],
              options: { textAlign: "right", fontSize: this.fontSize }
            });
          }
          return result;
        }
      }, {
        key: "encodeMiddleDigits",
        value: function encodeMiddleDigits() {
          var numberSystem = this.upcA[0];
          var checkDigit = this.upcA[this.upcA.length - 1];
          var parity = PARITIES[parseInt(checkDigit)][parseInt(numberSystem)];
          return (0, _encoder2.default)(this.middleDigits, parity);
        }
      }]);
      return UPCE2;
    })(_Barcode3.default);
    function expandToUPCA(middleDigits, numberSystem) {
      var lastUpcE = parseInt(middleDigits[middleDigits.length - 1]);
      var expansion = EXPANSIONS[lastUpcE];
      var result = "";
      var digitIndex = 0;
      for (var i = 0; i < expansion.length; i++) {
        var c = expansion[i];
        if (c === "X") {
          result += middleDigits[digitIndex++];
        } else {
          result += c;
        }
      }
      result = "" + numberSystem + result;
      return "" + result + (0, _UPC.checksum)(result);
    }
    exports.default = UPCE;
  }
});

// node_modules/jsbarcode/bin/barcodes/EAN_UPC/index.js
var require_EAN_UPC = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/EAN_UPC/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.UPCE = exports.UPC = exports.EAN2 = exports.EAN5 = exports.EAN8 = exports.EAN13 = void 0;
    var _EAN = require_EAN13();
    var _EAN2 = _interopRequireDefault(_EAN);
    var _EAN3 = require_EAN8();
    var _EAN4 = _interopRequireDefault(_EAN3);
    var _EAN5 = require_EAN5();
    var _EAN6 = _interopRequireDefault(_EAN5);
    var _EAN7 = require_EAN2();
    var _EAN8 = _interopRequireDefault(_EAN7);
    var _UPC = require_UPC();
    var _UPC2 = _interopRequireDefault(_UPC);
    var _UPCE = require_UPCE();
    var _UPCE2 = _interopRequireDefault(_UPCE);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.EAN13 = _EAN2.default;
    exports.EAN8 = _EAN4.default;
    exports.EAN5 = _EAN6.default;
    exports.EAN2 = _EAN8.default;
    exports.UPC = _UPC2.default;
    exports.UPCE = _UPCE2.default;
  }
});

// node_modules/jsbarcode/bin/barcodes/ITF/constants.js
var require_constants3 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/ITF/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var START_BIN = exports.START_BIN = "1010";
    var END_BIN = exports.END_BIN = "11101";
    var BINARIES = exports.BINARIES = ["00110", "10001", "01001", "11000", "00101", "10100", "01100", "00011", "10010", "01010"];
  }
});

// node_modules/jsbarcode/bin/barcodes/ITF/ITF.js
var require_ITF = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/ITF/ITF.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _constants = require_constants3();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var ITF = (function(_Barcode) {
      _inherits(ITF2, _Barcode);
      function ITF2() {
        _classCallCheck(this, ITF2);
        return _possibleConstructorReturn(this, (ITF2.__proto__ || Object.getPrototypeOf(ITF2)).apply(this, arguments));
      }
      _createClass(ITF2, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^([0-9]{2})+$/) !== -1;
        }
      }, {
        key: "encode",
        value: function encode() {
          var _this2 = this;
          var encoded = this.data.match(/.{2}/g).map(function(pair) {
            return _this2.encodePair(pair);
          }).join("");
          return {
            data: _constants.START_BIN + encoded + _constants.END_BIN,
            text: this.text
          };
        }
        // Calculate the data of a number pair
      }, {
        key: "encodePair",
        value: function encodePair(pair) {
          var second = _constants.BINARIES[pair[1]];
          return _constants.BINARIES[pair[0]].split("").map(function(first, idx) {
            return (first === "1" ? "111" : "1") + (second[idx] === "1" ? "000" : "0");
          }).join("");
        }
      }]);
      return ITF2;
    })(_Barcode3.default);
    exports.default = ITF;
  }
});

// node_modules/jsbarcode/bin/barcodes/ITF/ITF14.js
var require_ITF14 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/ITF/ITF14.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _ITF2 = require_ITF();
    var _ITF3 = _interopRequireDefault(_ITF2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var checksum = function checksum2(data) {
      var res = data.substr(0, 13).split("").map(function(num) {
        return parseInt(num, 10);
      }).reduce(function(sum, n, idx) {
        return sum + n * (3 - idx % 2 * 2);
      }, 0);
      return Math.ceil(res / 10) * 10 - res;
    };
    var ITF14 = (function(_ITF) {
      _inherits(ITF142, _ITF);
      function ITF142(data, options) {
        _classCallCheck(this, ITF142);
        if (data.search(/^[0-9]{13}$/) !== -1) {
          data += checksum(data);
        }
        return _possibleConstructorReturn(this, (ITF142.__proto__ || Object.getPrototypeOf(ITF142)).call(this, data, options));
      }
      _createClass(ITF142, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]{14}$/) !== -1 && +this.data[13] === checksum(this.data);
        }
      }]);
      return ITF142;
    })(_ITF3.default);
    exports.default = ITF14;
  }
});

// node_modules/jsbarcode/bin/barcodes/ITF/index.js
var require_ITF2 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/ITF/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ITF14 = exports.ITF = void 0;
    var _ITF = require_ITF();
    var _ITF2 = _interopRequireDefault(_ITF);
    var _ITF3 = require_ITF14();
    var _ITF4 = _interopRequireDefault(_ITF3);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.ITF = _ITF2.default;
    exports.ITF14 = _ITF4.default;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/MSI.js
var require_MSI = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/MSI.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var MSI = (function(_Barcode) {
      _inherits(MSI2, _Barcode);
      function MSI2(data, options) {
        _classCallCheck(this, MSI2);
        return _possibleConstructorReturn(this, (MSI2.__proto__ || Object.getPrototypeOf(MSI2)).call(this, data, options));
      }
      _createClass(MSI2, [{
        key: "encode",
        value: function encode() {
          var ret = "110";
          for (var i = 0; i < this.data.length; i++) {
            var digit = parseInt(this.data[i]);
            var bin = digit.toString(2);
            bin = addZeroes(bin, 4 - bin.length);
            for (var b = 0; b < bin.length; b++) {
              ret += bin[b] == "0" ? "100" : "110";
            }
          }
          ret += "1001";
          return {
            data: ret,
            text: this.text
          };
        }
      }, {
        key: "valid",
        value: function valid() {
          return this.data.search(/^[0-9]+$/) !== -1;
        }
      }]);
      return MSI2;
    })(_Barcode3.default);
    function addZeroes(number, n) {
      for (var i = 0; i < n; i++) {
        number = "0" + number;
      }
      return number;
    }
    exports.default = MSI;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/checksums.js
var require_checksums = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/checksums.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.mod10 = mod10;
    exports.mod11 = mod11;
    function mod10(number) {
      var sum = 0;
      for (var i = 0; i < number.length; i++) {
        var n = parseInt(number[i]);
        if ((i + number.length) % 2 === 0) {
          sum += n;
        } else {
          sum += n * 2 % 10 + Math.floor(n * 2 / 10);
        }
      }
      return (10 - sum % 10) % 10;
    }
    function mod11(number) {
      var sum = 0;
      var weights = [2, 3, 4, 5, 6, 7];
      for (var i = 0; i < number.length; i++) {
        var n = parseInt(number[number.length - 1 - i]);
        sum += weights[i % weights.length] * n;
      }
      return (11 - sum % 11) % 11;
    }
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/MSI10.js
var require_MSI10 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/MSI10.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _MSI2 = require_MSI();
    var _MSI3 = _interopRequireDefault(_MSI2);
    var _checksums = require_checksums();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var MSI10 = (function(_MSI) {
      _inherits(MSI102, _MSI);
      function MSI102(data, options) {
        _classCallCheck(this, MSI102);
        return _possibleConstructorReturn(this, (MSI102.__proto__ || Object.getPrototypeOf(MSI102)).call(this, data + (0, _checksums.mod10)(data), options));
      }
      return MSI102;
    })(_MSI3.default);
    exports.default = MSI10;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/MSI11.js
var require_MSI11 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/MSI11.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _MSI2 = require_MSI();
    var _MSI3 = _interopRequireDefault(_MSI2);
    var _checksums = require_checksums();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var MSI11 = (function(_MSI) {
      _inherits(MSI112, _MSI);
      function MSI112(data, options) {
        _classCallCheck(this, MSI112);
        return _possibleConstructorReturn(this, (MSI112.__proto__ || Object.getPrototypeOf(MSI112)).call(this, data + (0, _checksums.mod11)(data), options));
      }
      return MSI112;
    })(_MSI3.default);
    exports.default = MSI11;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/MSI1010.js
var require_MSI1010 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/MSI1010.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _MSI2 = require_MSI();
    var _MSI3 = _interopRequireDefault(_MSI2);
    var _checksums = require_checksums();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var MSI1010 = (function(_MSI) {
      _inherits(MSI10102, _MSI);
      function MSI10102(data, options) {
        _classCallCheck(this, MSI10102);
        data += (0, _checksums.mod10)(data);
        data += (0, _checksums.mod10)(data);
        return _possibleConstructorReturn(this, (MSI10102.__proto__ || Object.getPrototypeOf(MSI10102)).call(this, data, options));
      }
      return MSI10102;
    })(_MSI3.default);
    exports.default = MSI1010;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/MSI1110.js
var require_MSI1110 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/MSI1110.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _MSI2 = require_MSI();
    var _MSI3 = _interopRequireDefault(_MSI2);
    var _checksums = require_checksums();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var MSI1110 = (function(_MSI) {
      _inherits(MSI11102, _MSI);
      function MSI11102(data, options) {
        _classCallCheck(this, MSI11102);
        data += (0, _checksums.mod11)(data);
        data += (0, _checksums.mod10)(data);
        return _possibleConstructorReturn(this, (MSI11102.__proto__ || Object.getPrototypeOf(MSI11102)).call(this, data, options));
      }
      return MSI11102;
    })(_MSI3.default);
    exports.default = MSI1110;
  }
});

// node_modules/jsbarcode/bin/barcodes/MSI/index.js
var require_MSI2 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/MSI/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.MSI1110 = exports.MSI1010 = exports.MSI11 = exports.MSI10 = exports.MSI = void 0;
    var _MSI = require_MSI();
    var _MSI2 = _interopRequireDefault(_MSI);
    var _MSI3 = require_MSI10();
    var _MSI4 = _interopRequireDefault(_MSI3);
    var _MSI5 = require_MSI11();
    var _MSI6 = _interopRequireDefault(_MSI5);
    var _MSI7 = require_MSI1010();
    var _MSI8 = _interopRequireDefault(_MSI7);
    var _MSI9 = require_MSI1110();
    var _MSI10 = _interopRequireDefault(_MSI9);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.MSI = _MSI2.default;
    exports.MSI10 = _MSI4.default;
    exports.MSI11 = _MSI6.default;
    exports.MSI1010 = _MSI8.default;
    exports.MSI1110 = _MSI10.default;
  }
});

// node_modules/jsbarcode/bin/barcodes/pharmacode/index.js
var require_pharmacode = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/pharmacode/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.pharmacode = void 0;
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var pharmacode = (function(_Barcode) {
      _inherits(pharmacode2, _Barcode);
      function pharmacode2(data, options) {
        _classCallCheck(this, pharmacode2);
        var _this = _possibleConstructorReturn(this, (pharmacode2.__proto__ || Object.getPrototypeOf(pharmacode2)).call(this, data, options));
        _this.number = parseInt(data, 10);
        return _this;
      }
      _createClass(pharmacode2, [{
        key: "encode",
        value: function encode() {
          var z = this.number;
          var result = "";
          while (!isNaN(z) && z != 0) {
            if (z % 2 === 0) {
              result = "11100" + result;
              z = (z - 2) / 2;
            } else {
              result = "100" + result;
              z = (z - 1) / 2;
            }
          }
          result = result.slice(0, -2);
          return {
            data: result,
            text: this.text
          };
        }
      }, {
        key: "valid",
        value: function valid() {
          return this.number >= 3 && this.number <= 131070;
        }
      }]);
      return pharmacode2;
    })(_Barcode3.default);
    exports.pharmacode = pharmacode;
  }
});

// node_modules/jsbarcode/bin/barcodes/codabar/index.js
var require_codabar = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/codabar/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.codabar = void 0;
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var codabar = (function(_Barcode) {
      _inherits(codabar2, _Barcode);
      function codabar2(data, options) {
        _classCallCheck(this, codabar2);
        if (data.search(/^[0-9\-\$\:\.\+\/]+$/) === 0) {
          data = "A" + data + "A";
        }
        var _this = _possibleConstructorReturn(this, (codabar2.__proto__ || Object.getPrototypeOf(codabar2)).call(this, data.toUpperCase(), options));
        _this.text = _this.options.text || _this.text.replace(/[A-D]/g, "");
        return _this;
      }
      _createClass(codabar2, [{
        key: "valid",
        value: function valid() {
          return this.data.search(/^[A-D][0-9\-\$\:\.\+\/]+[A-D]$/) !== -1;
        }
      }, {
        key: "encode",
        value: function encode() {
          var result = [];
          var encodings = this.getEncodings();
          for (var i = 0; i < this.data.length; i++) {
            result.push(encodings[this.data.charAt(i)]);
            if (i !== this.data.length - 1) {
              result.push("0");
            }
          }
          return {
            text: this.text,
            data: result.join("")
          };
        }
      }, {
        key: "getEncodings",
        value: function getEncodings() {
          return {
            "0": "101010011",
            "1": "101011001",
            "2": "101001011",
            "3": "110010101",
            "4": "101101001",
            "5": "110101001",
            "6": "100101011",
            "7": "100101101",
            "8": "100110101",
            "9": "110100101",
            "-": "101001101",
            "$": "101100101",
            ":": "1101011011",
            "/": "1101101011",
            ".": "1101101101",
            "+": "1011011011",
            "A": "1011001001",
            "B": "1001001011",
            "C": "1010010011",
            "D": "1010011001"
          };
        }
      }]);
      return codabar2;
    })(_Barcode3.default);
    exports.codabar = codabar;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE93/constants.js
var require_constants4 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE93/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var SYMBOLS = exports.SYMBOLS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "-",
      ".",
      " ",
      "$",
      "/",
      "+",
      "%",
      // Only used for csum and multi-symbols character encodings
      "($)",
      "(%)",
      "(/)",
      "(+)",
      // Start/Stop
      "\xFF"
    ];
    var BINARIES = exports.BINARIES = ["100010100", "101001000", "101000100", "101000010", "100101000", "100100100", "100100010", "101010000", "100010010", "100001010", "110101000", "110100100", "110100010", "110010100", "110010010", "110001010", "101101000", "101100100", "101100010", "100110100", "100011010", "101011000", "101001100", "101000110", "100101100", "100010110", "110110100", "110110010", "110101100", "110100110", "110010110", "110011010", "101101100", "101100110", "100110110", "100111010", "100101110", "111010100", "111010010", "111001010", "101101110", "101110110", "110101110", "100100110", "111011010", "111010110", "100110010", "101011110"];
    var MULTI_SYMBOLS = exports.MULTI_SYMBOLS = {
      "\0": ["(%)", "U"],
      "": ["($)", "A"],
      "": ["($)", "B"],
      "": ["($)", "C"],
      "": ["($)", "D"],
      "": ["($)", "E"],
      "": ["($)", "F"],
      "\x07": ["($)", "G"],
      "\b": ["($)", "H"],
      "	": ["($)", "I"],
      "\n": ["($)", "J"],
      "\v": ["($)", "K"],
      "\f": ["($)", "L"],
      "\r": ["($)", "M"],
      "": ["($)", "N"],
      "": ["($)", "O"],
      "": ["($)", "P"],
      "": ["($)", "Q"],
      "": ["($)", "R"],
      "": ["($)", "S"],
      "": ["($)", "T"],
      "": ["($)", "U"],
      "": ["($)", "V"],
      "": ["($)", "W"],
      "": ["($)", "X"],
      "": ["($)", "Y"],
      "": ["($)", "Z"],
      "\x1B": ["(%)", "A"],
      "": ["(%)", "B"],
      "": ["(%)", "C"],
      "": ["(%)", "D"],
      "": ["(%)", "E"],
      "!": ["(/)", "A"],
      '"': ["(/)", "B"],
      "#": ["(/)", "C"],
      "&": ["(/)", "F"],
      "'": ["(/)", "G"],
      "(": ["(/)", "H"],
      ")": ["(/)", "I"],
      "*": ["(/)", "J"],
      ",": ["(/)", "L"],
      ":": ["(/)", "Z"],
      ";": ["(%)", "F"],
      "<": ["(%)", "G"],
      "=": ["(%)", "H"],
      ">": ["(%)", "I"],
      "?": ["(%)", "J"],
      "@": ["(%)", "V"],
      "[": ["(%)", "K"],
      "\\": ["(%)", "L"],
      "]": ["(%)", "M"],
      "^": ["(%)", "N"],
      "_": ["(%)", "O"],
      "`": ["(%)", "W"],
      "a": ["(+)", "A"],
      "b": ["(+)", "B"],
      "c": ["(+)", "C"],
      "d": ["(+)", "D"],
      "e": ["(+)", "E"],
      "f": ["(+)", "F"],
      "g": ["(+)", "G"],
      "h": ["(+)", "H"],
      "i": ["(+)", "I"],
      "j": ["(+)", "J"],
      "k": ["(+)", "K"],
      "l": ["(+)", "L"],
      "m": ["(+)", "M"],
      "n": ["(+)", "N"],
      "o": ["(+)", "O"],
      "p": ["(+)", "P"],
      "q": ["(+)", "Q"],
      "r": ["(+)", "R"],
      "s": ["(+)", "S"],
      "t": ["(+)", "T"],
      "u": ["(+)", "U"],
      "v": ["(+)", "V"],
      "w": ["(+)", "W"],
      "x": ["(+)", "X"],
      "y": ["(+)", "Y"],
      "z": ["(+)", "Z"],
      "{": ["(%)", "P"],
      "|": ["(%)", "Q"],
      "}": ["(%)", "R"],
      "~": ["(%)", "S"],
      "\x7F": ["(%)", "T"]
    };
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE93/CODE93.js
var require_CODE93 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE93/CODE93.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _constants = require_constants4();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE93 = (function(_Barcode) {
      _inherits(CODE932, _Barcode);
      function CODE932(data, options) {
        _classCallCheck(this, CODE932);
        return _possibleConstructorReturn(this, (CODE932.__proto__ || Object.getPrototypeOf(CODE932)).call(this, data, options));
      }
      _createClass(CODE932, [{
        key: "valid",
        value: function valid() {
          return /^[0-9A-Z\-. $/+%]+$/.test(this.data);
        }
      }, {
        key: "encode",
        value: function encode() {
          var symbols = this.data.split("").flatMap(function(c) {
            return _constants.MULTI_SYMBOLS[c] || c;
          });
          var encoded = symbols.map(function(s) {
            return CODE932.getEncoding(s);
          }).join("");
          var csumC = CODE932.checksum(symbols, 20);
          var csumK = CODE932.checksum(symbols.concat(csumC), 15);
          return {
            text: this.text,
            data: (
              // Add the start bits
              CODE932.getEncoding("\xFF") + // Add the encoded bits
              encoded + // Add the checksum
              CODE932.getEncoding(csumC) + CODE932.getEncoding(csumK) + // Add the stop bits
              CODE932.getEncoding("\xFF") + // Add the termination bit
              "1"
            )
          };
        }
        // Get the binary encoding of a symbol
      }], [{
        key: "getEncoding",
        value: function getEncoding(symbol) {
          return _constants.BINARIES[CODE932.symbolValue(symbol)];
        }
        // Get the symbol for a symbol value
      }, {
        key: "getSymbol",
        value: function getSymbol(symbolValue) {
          return _constants.SYMBOLS[symbolValue];
        }
        // Get the symbol value of a symbol
      }, {
        key: "symbolValue",
        value: function symbolValue(symbol) {
          return _constants.SYMBOLS.indexOf(symbol);
        }
        // Calculate a checksum symbol
      }, {
        key: "checksum",
        value: function checksum(symbols, maxWeight) {
          var csum = symbols.slice().reverse().reduce(function(sum, symbol, idx) {
            var weight = idx % maxWeight + 1;
            return sum + CODE932.symbolValue(symbol) * weight;
          }, 0);
          return CODE932.getSymbol(csum % 47);
        }
      }]);
      return CODE932;
    })(_Barcode3.default);
    exports.default = CODE93;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE93/CODE93FullASCII.js
var require_CODE93FullASCII = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE93/CODE93FullASCII.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _CODE2 = require_CODE93();
    var _CODE3 = _interopRequireDefault(_CODE2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var CODE93FullASCII = (function(_CODE) {
      _inherits(CODE93FullASCII2, _CODE);
      function CODE93FullASCII2(data, options) {
        _classCallCheck(this, CODE93FullASCII2);
        return _possibleConstructorReturn(this, (CODE93FullASCII2.__proto__ || Object.getPrototypeOf(CODE93FullASCII2)).call(this, data, options));
      }
      _createClass(CODE93FullASCII2, [{
        key: "valid",
        value: function valid() {
          return /^[\x00-\x7f]+$/.test(this.data);
        }
      }]);
      return CODE93FullASCII2;
    })(_CODE3.default);
    exports.default = CODE93FullASCII;
  }
});

// node_modules/jsbarcode/bin/barcodes/CODE93/index.js
var require_CODE932 = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/CODE93/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.CODE93FullASCII = exports.CODE93 = void 0;
    var _CODE = require_CODE93();
    var _CODE2 = _interopRequireDefault(_CODE);
    var _CODE93FullASCII = require_CODE93FullASCII();
    var _CODE93FullASCII2 = _interopRequireDefault(_CODE93FullASCII);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.CODE93 = _CODE2.default;
    exports.CODE93FullASCII = _CODE93FullASCII2.default;
  }
});

// node_modules/jsbarcode/bin/barcodes/GenericBarcode/index.js
var require_GenericBarcode = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/GenericBarcode/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.GenericBarcode = void 0;
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _Barcode2 = require_Barcode();
    var _Barcode3 = _interopRequireDefault(_Barcode2);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var GenericBarcode = (function(_Barcode) {
      _inherits(GenericBarcode2, _Barcode);
      function GenericBarcode2(data, options) {
        _classCallCheck(this, GenericBarcode2);
        return _possibleConstructorReturn(this, (GenericBarcode2.__proto__ || Object.getPrototypeOf(GenericBarcode2)).call(this, data, options));
      }
      _createClass(GenericBarcode2, [{
        key: "encode",
        value: function encode() {
          return {
            data: "10101010101010101010101010101010101010101",
            text: this.text
          };
        }
        // Resturn true/false if the string provided is valid for this encoder
      }, {
        key: "valid",
        value: function valid() {
          return true;
        }
      }]);
      return GenericBarcode2;
    })(_Barcode3.default);
    exports.GenericBarcode = GenericBarcode;
  }
});

// node_modules/jsbarcode/bin/barcodes/index.js
var require_barcodes = __commonJS({
  "node_modules/jsbarcode/bin/barcodes/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _CODE = require_CODE39();
    var _CODE2 = require_CODE1282();
    var _EAN_UPC = require_EAN_UPC();
    var _ITF = require_ITF2();
    var _MSI = require_MSI2();
    var _pharmacode = require_pharmacode();
    var _codabar = require_codabar();
    var _CODE3 = require_CODE932();
    var _GenericBarcode = require_GenericBarcode();
    exports.default = {
      CODE39: _CODE.CODE39,
      CODE128: _CODE2.CODE128,
      CODE128A: _CODE2.CODE128A,
      CODE128B: _CODE2.CODE128B,
      CODE128C: _CODE2.CODE128C,
      EAN13: _EAN_UPC.EAN13,
      EAN8: _EAN_UPC.EAN8,
      EAN5: _EAN_UPC.EAN5,
      EAN2: _EAN_UPC.EAN2,
      UPC: _EAN_UPC.UPC,
      UPCE: _EAN_UPC.UPCE,
      ITF14: _ITF.ITF14,
      ITF: _ITF.ITF,
      MSI: _MSI.MSI,
      MSI10: _MSI.MSI10,
      MSI11: _MSI.MSI11,
      MSI1010: _MSI.MSI1010,
      MSI1110: _MSI.MSI1110,
      pharmacode: _pharmacode.pharmacode,
      codabar: _codabar.codabar,
      CODE93: _CODE3.CODE93,
      CODE93FullASCII: _CODE3.CODE93FullASCII,
      GenericBarcode: _GenericBarcode.GenericBarcode
    };
  }
});

// node_modules/jsbarcode/bin/help/merge.js
var require_merge = __commonJS({
  "node_modules/jsbarcode/bin/help/merge.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _extends = Object.assign || function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    exports.default = function(old, replaceObj) {
      return _extends({}, old, replaceObj);
    };
  }
});

// node_modules/jsbarcode/bin/help/linearizeEncodings.js
var require_linearizeEncodings = __commonJS({
  "node_modules/jsbarcode/bin/help/linearizeEncodings.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = linearizeEncodings;
    function linearizeEncodings(encodings) {
      var linearEncodings = [];
      function nextLevel(encoded) {
        if (Array.isArray(encoded)) {
          for (var i = 0; i < encoded.length; i++) {
            nextLevel(encoded[i]);
          }
        } else {
          encoded.text = encoded.text || "";
          encoded.data = encoded.data || "";
          linearEncodings.push(encoded);
        }
      }
      nextLevel(encodings);
      return linearEncodings;
    }
  }
});

// node_modules/jsbarcode/bin/help/fixOptions.js
var require_fixOptions = __commonJS({
  "node_modules/jsbarcode/bin/help/fixOptions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = fixOptions;
    function fixOptions(options) {
      options.marginTop = options.marginTop || options.margin;
      options.marginBottom = options.marginBottom || options.margin;
      options.marginRight = options.marginRight || options.margin;
      options.marginLeft = options.marginLeft || options.margin;
      return options;
    }
  }
});

// node_modules/jsbarcode/bin/help/optionsFromStrings.js
var require_optionsFromStrings = __commonJS({
  "node_modules/jsbarcode/bin/help/optionsFromStrings.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = optionsFromStrings;
    function optionsFromStrings(options) {
      var intOptions = ["width", "height", "textMargin", "fontSize", "margin", "marginTop", "marginBottom", "marginLeft", "marginRight"];
      for (var intOption in intOptions) {
        if (intOptions.hasOwnProperty(intOption)) {
          intOption = intOptions[intOption];
          if (typeof options[intOption] === "string") {
            options[intOption] = parseInt(options[intOption], 10);
          }
        }
      }
      if (typeof options["displayValue"] === "string") {
        options["displayValue"] = options["displayValue"] != "false";
      }
      return options;
    }
  }
});

// node_modules/jsbarcode/bin/options/defaults.js
var require_defaults = __commonJS({
  "node_modules/jsbarcode/bin/options/defaults.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var defaults = {
      width: 2,
      height: 100,
      format: "auto",
      displayValue: true,
      fontOptions: "",
      font: "monospace",
      text: void 0,
      textAlign: "center",
      textPosition: "bottom",
      textMargin: 2,
      fontSize: 20,
      background: "#ffffff",
      lineColor: "#000000",
      margin: 10,
      marginTop: void 0,
      marginBottom: void 0,
      marginLeft: void 0,
      marginRight: void 0,
      valid: function valid() {
      }
    };
    exports.default = defaults;
  }
});

// node_modules/jsbarcode/bin/help/getOptionsFromElement.js
var require_getOptionsFromElement = __commonJS({
  "node_modules/jsbarcode/bin/help/getOptionsFromElement.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _optionsFromStrings = require_optionsFromStrings();
    var _optionsFromStrings2 = _interopRequireDefault(_optionsFromStrings);
    var _defaults = require_defaults();
    var _defaults2 = _interopRequireDefault(_defaults);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getOptionsFromElement(element) {
      var options = {};
      for (var property in _defaults2.default) {
        if (_defaults2.default.hasOwnProperty(property)) {
          if (element.hasAttribute("jsbarcode-" + property.toLowerCase())) {
            options[property] = element.getAttribute("jsbarcode-" + property.toLowerCase());
          }
          if (element.hasAttribute("data-" + property.toLowerCase())) {
            options[property] = element.getAttribute("data-" + property.toLowerCase());
          }
        }
      }
      options["value"] = element.getAttribute("jsbarcode-value") || element.getAttribute("data-value");
      options = (0, _optionsFromStrings2.default)(options);
      return options;
    }
    exports.default = getOptionsFromElement;
  }
});

// node_modules/jsbarcode/bin/renderers/shared.js
var require_shared = __commonJS({
  "node_modules/jsbarcode/bin/renderers/shared.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.getTotalWidthOfEncodings = exports.calculateEncodingAttributes = exports.getBarcodePadding = exports.getEncodingHeight = exports.getMaximumHeightOfEncodings = void 0;
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getEncodingHeight(encoding, options) {
      return options.height + (options.displayValue && encoding.text.length > 0 ? options.fontSize + options.textMargin : 0) + options.marginTop + options.marginBottom;
    }
    function getBarcodePadding(textWidth, barcodeWidth, options) {
      if (options.displayValue && barcodeWidth < textWidth) {
        if (options.textAlign == "center") {
          return Math.floor((textWidth - barcodeWidth) / 2);
        } else if (options.textAlign == "left") {
          return 0;
        } else if (options.textAlign == "right") {
          return Math.floor(textWidth - barcodeWidth);
        }
      }
      return 0;
    }
    function calculateEncodingAttributes(encodings, barcodeOptions, context) {
      for (var i = 0; i < encodings.length; i++) {
        var encoding = encodings[i];
        var options = (0, _merge2.default)(barcodeOptions, encoding.options);
        var textWidth;
        if (options.displayValue) {
          textWidth = messureText(encoding.text, options, context);
        } else {
          textWidth = 0;
        }
        var barcodeWidth = encoding.data.length * options.width;
        encoding.width = Math.ceil(Math.max(textWidth, barcodeWidth));
        encoding.height = getEncodingHeight(encoding, options);
        encoding.barcodePadding = getBarcodePadding(textWidth, barcodeWidth, options);
      }
    }
    function getTotalWidthOfEncodings(encodings) {
      var totalWidth = 0;
      for (var i = 0; i < encodings.length; i++) {
        totalWidth += encodings[i].width;
      }
      return totalWidth;
    }
    function getMaximumHeightOfEncodings(encodings) {
      var maxHeight = 0;
      for (var i = 0; i < encodings.length; i++) {
        if (encodings[i].height > maxHeight) {
          maxHeight = encodings[i].height;
        }
      }
      return maxHeight;
    }
    function messureText(string, options, context) {
      var ctx2;
      if (context) {
        ctx2 = context;
      } else if (typeof document !== "undefined") {
        ctx2 = document.createElement("canvas").getContext("2d");
      } else {
        return 0;
      }
      ctx2.font = options.fontOptions + " " + options.fontSize + "px " + options.font;
      var measureTextResult = ctx2.measureText(string);
      if (!measureTextResult) {
        return 0;
      }
      var size = measureTextResult.width;
      return size;
    }
    exports.getMaximumHeightOfEncodings = getMaximumHeightOfEncodings;
    exports.getEncodingHeight = getEncodingHeight;
    exports.getBarcodePadding = getBarcodePadding;
    exports.calculateEncodingAttributes = calculateEncodingAttributes;
    exports.getTotalWidthOfEncodings = getTotalWidthOfEncodings;
  }
});

// node_modules/jsbarcode/bin/renderers/canvas.js
var require_canvas = __commonJS({
  "node_modules/jsbarcode/bin/renderers/canvas.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    var _shared = require_shared();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var CanvasRenderer = (function() {
      function CanvasRenderer2(canvas2, encodings, options) {
        _classCallCheck(this, CanvasRenderer2);
        this.canvas = canvas2;
        this.encodings = encodings;
        this.options = options;
      }
      _createClass(CanvasRenderer2, [{
        key: "render",
        value: function render2() {
          if (!this.canvas.getContext) {
            throw new Error("The browser does not support canvas.");
          }
          this.prepareCanvas();
          for (var i = 0; i < this.encodings.length; i++) {
            var encodingOptions = (0, _merge2.default)(this.options, this.encodings[i].options);
            this.drawCanvasBarcode(encodingOptions, this.encodings[i]);
            this.drawCanvasText(encodingOptions, this.encodings[i]);
            this.moveCanvasDrawing(this.encodings[i]);
          }
          this.restoreCanvas();
        }
      }, {
        key: "prepareCanvas",
        value: function prepareCanvas() {
          var ctx2 = this.canvas.getContext("2d");
          ctx2.save();
          (0, _shared.calculateEncodingAttributes)(this.encodings, this.options, ctx2);
          var totalWidth = (0, _shared.getTotalWidthOfEncodings)(this.encodings);
          var maxHeight = (0, _shared.getMaximumHeightOfEncodings)(this.encodings);
          this.canvas.width = totalWidth + this.options.marginLeft + this.options.marginRight;
          this.canvas.height = maxHeight;
          ctx2.clearRect(0, 0, this.canvas.width, this.canvas.height);
          if (this.options.background) {
            ctx2.fillStyle = this.options.background;
            ctx2.fillRect(0, 0, this.canvas.width, this.canvas.height);
          }
          ctx2.translate(this.options.marginLeft, 0);
        }
      }, {
        key: "drawCanvasBarcode",
        value: function drawCanvasBarcode(options, encoding) {
          var ctx2 = this.canvas.getContext("2d");
          var binary = encoding.data;
          var yFrom;
          if (options.textPosition == "top") {
            yFrom = options.marginTop + options.fontSize + options.textMargin;
          } else {
            yFrom = options.marginTop;
          }
          ctx2.fillStyle = options.lineColor;
          for (var b = 0; b < binary.length; b++) {
            var x = b * options.width + encoding.barcodePadding;
            if (binary[b] === "1") {
              ctx2.fillRect(x, yFrom, options.width, options.height);
            } else if (binary[b]) {
              ctx2.fillRect(x, yFrom, options.width, options.height * binary[b]);
            }
          }
        }
      }, {
        key: "drawCanvasText",
        value: function drawCanvasText(options, encoding) {
          var ctx2 = this.canvas.getContext("2d");
          var font = options.fontOptions + " " + options.fontSize + "px " + options.font;
          if (options.displayValue) {
            var x, y;
            if (options.textPosition == "top") {
              y = options.marginTop + options.fontSize - options.textMargin;
            } else {
              y = options.height + options.textMargin + options.marginTop + options.fontSize;
            }
            ctx2.font = font;
            if (options.textAlign == "left" || encoding.barcodePadding > 0) {
              x = 0;
              ctx2.textAlign = "left";
            } else if (options.textAlign == "right") {
              x = encoding.width - 1;
              ctx2.textAlign = "right";
            } else {
              x = encoding.width / 2;
              ctx2.textAlign = "center";
            }
            ctx2.fillText(encoding.text, x, y);
          }
        }
      }, {
        key: "moveCanvasDrawing",
        value: function moveCanvasDrawing(encoding) {
          var ctx2 = this.canvas.getContext("2d");
          ctx2.translate(encoding.width, 0);
        }
      }, {
        key: "restoreCanvas",
        value: function restoreCanvas() {
          var ctx2 = this.canvas.getContext("2d");
          ctx2.restore();
        }
      }]);
      return CanvasRenderer2;
    })();
    exports.default = CanvasRenderer;
  }
});

// node_modules/jsbarcode/bin/renderers/svg.js
var require_svg = __commonJS({
  "node_modules/jsbarcode/bin/renderers/svg.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    var _shared = require_shared();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var svgns = "http://www.w3.org/2000/svg";
    var SVGRenderer = (function() {
      function SVGRenderer2(svg, encodings, options) {
        _classCallCheck(this, SVGRenderer2);
        this.svg = svg;
        this.encodings = encodings;
        this.options = options;
        this.document = options.xmlDocument || document;
      }
      _createClass(SVGRenderer2, [{
        key: "render",
        value: function render2() {
          var currentX = this.options.marginLeft;
          this.prepareSVG();
          for (var i = 0; i < this.encodings.length; i++) {
            var encoding = this.encodings[i];
            var encodingOptions = (0, _merge2.default)(this.options, encoding.options);
            var group = this.createGroup(currentX, encodingOptions.marginTop, this.svg);
            this.setGroupOptions(group, encodingOptions);
            this.drawSvgBarcode(group, encodingOptions, encoding);
            this.drawSVGText(group, encodingOptions, encoding);
            currentX += encoding.width;
          }
        }
      }, {
        key: "prepareSVG",
        value: function prepareSVG() {
          while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
          }
          (0, _shared.calculateEncodingAttributes)(this.encodings, this.options);
          var totalWidth = (0, _shared.getTotalWidthOfEncodings)(this.encodings);
          var maxHeight = (0, _shared.getMaximumHeightOfEncodings)(this.encodings);
          var width = totalWidth + this.options.marginLeft + this.options.marginRight;
          this.setSvgAttributes(width, maxHeight);
          if (this.options.background) {
            this.drawRect(0, 0, width, maxHeight, this.svg).setAttribute("fill", this.options.background);
          }
        }
      }, {
        key: "drawSvgBarcode",
        value: function drawSvgBarcode(parent, options, encoding) {
          var binary = encoding.data;
          var yFrom;
          if (options.textPosition == "top") {
            yFrom = options.fontSize + options.textMargin;
          } else {
            yFrom = 0;
          }
          var barWidth = 0;
          var x = 0;
          for (var b = 0; b < binary.length; b++) {
            x = b * options.width + encoding.barcodePadding;
            if (binary[b] === "1") {
              barWidth++;
            } else if (barWidth > 0) {
              this.drawRect(x - options.width * barWidth, yFrom, options.width * barWidth, options.height, parent);
              barWidth = 0;
            }
          }
          if (barWidth > 0) {
            this.drawRect(x - options.width * (barWidth - 1), yFrom, options.width * barWidth, options.height, parent);
          }
        }
      }, {
        key: "drawSVGText",
        value: function drawSVGText(parent, options, encoding) {
          var textElem = this.document.createElementNS(svgns, "text");
          if (options.displayValue) {
            var x, y;
            textElem.setAttribute("font-family", options.font);
            textElem.setAttribute("font-size", options.fontSize);
            if (options.fontOptions.includes("bold")) {
              textElem.setAttribute("font-weight", "bold");
            }
            if (options.fontOptions.includes("italic")) {
              textElem.setAttribute("font-style", "italic");
            }
            if (options.textPosition == "top") {
              y = options.fontSize - options.textMargin;
            } else {
              y = options.height + options.textMargin + options.fontSize;
            }
            if (options.textAlign == "left" || encoding.barcodePadding > 0) {
              x = 0;
              textElem.setAttribute("text-anchor", "start");
            } else if (options.textAlign == "right") {
              x = encoding.width - 1;
              textElem.setAttribute("text-anchor", "end");
            } else {
              x = encoding.width / 2;
              textElem.setAttribute("text-anchor", "middle");
            }
            textElem.setAttribute("x", x);
            textElem.setAttribute("y", y);
            textElem.appendChild(this.document.createTextNode(encoding.text));
            parent.appendChild(textElem);
          }
        }
      }, {
        key: "setSvgAttributes",
        value: function setSvgAttributes(width, height) {
          var svg = this.svg;
          svg.setAttribute("width", width + "px");
          svg.setAttribute("height", height + "px");
          svg.setAttribute("x", "0px");
          svg.setAttribute("y", "0px");
          svg.setAttribute("viewBox", "0 0 " + width + " " + height);
          svg.setAttribute("xmlns", svgns);
          svg.setAttribute("version", "1.1");
        }
      }, {
        key: "createGroup",
        value: function createGroup(x, y, parent) {
          var group = this.document.createElementNS(svgns, "g");
          group.setAttribute("transform", "translate(" + x + ", " + y + ")");
          parent.appendChild(group);
          return group;
        }
      }, {
        key: "setGroupOptions",
        value: function setGroupOptions(group, options) {
          group.setAttribute("fill", options.lineColor);
        }
      }, {
        key: "drawRect",
        value: function drawRect(x, y, width, height, parent) {
          var rect = this.document.createElementNS(svgns, "rect");
          rect.setAttribute("x", x);
          rect.setAttribute("y", y);
          rect.setAttribute("width", width);
          rect.setAttribute("height", height);
          parent.appendChild(rect);
          return rect;
        }
      }]);
      return SVGRenderer2;
    })();
    exports.default = SVGRenderer;
  }
});

// node_modules/jsbarcode/bin/renderers/object.js
var require_object = __commonJS({
  "node_modules/jsbarcode/bin/renderers/object.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var ObjectRenderer = (function() {
      function ObjectRenderer2(object, encodings, options) {
        _classCallCheck(this, ObjectRenderer2);
        this.object = object;
        this.encodings = encodings;
        this.options = options;
      }
      _createClass(ObjectRenderer2, [{
        key: "render",
        value: function render2() {
          this.object.encodings = this.encodings;
        }
      }]);
      return ObjectRenderer2;
    })();
    exports.default = ObjectRenderer;
  }
});

// node_modules/jsbarcode/bin/renderers/index.js
var require_renderers = __commonJS({
  "node_modules/jsbarcode/bin/renderers/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _canvas = require_canvas();
    var _canvas2 = _interopRequireDefault(_canvas);
    var _svg = require_svg();
    var _svg2 = _interopRequireDefault(_svg);
    var _object = require_object();
    var _object2 = _interopRequireDefault(_object);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports.default = { CanvasRenderer: _canvas2.default, SVGRenderer: _svg2.default, ObjectRenderer: _object2.default };
  }
});

// node_modules/jsbarcode/bin/exceptions/exceptions.js
var require_exceptions = __commonJS({
  "node_modules/jsbarcode/bin/exceptions/exceptions.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    var InvalidInputException = (function(_Error) {
      _inherits(InvalidInputException2, _Error);
      function InvalidInputException2(symbology, input) {
        _classCallCheck(this, InvalidInputException2);
        var _this = _possibleConstructorReturn(this, (InvalidInputException2.__proto__ || Object.getPrototypeOf(InvalidInputException2)).call(this));
        _this.name = "InvalidInputException";
        _this.symbology = symbology;
        _this.input = input;
        _this.message = '"' + _this.input + '" is not a valid input for ' + _this.symbology;
        return _this;
      }
      return InvalidInputException2;
    })(Error);
    var InvalidElementException = (function(_Error2) {
      _inherits(InvalidElementException2, _Error2);
      function InvalidElementException2() {
        _classCallCheck(this, InvalidElementException2);
        var _this2 = _possibleConstructorReturn(this, (InvalidElementException2.__proto__ || Object.getPrototypeOf(InvalidElementException2)).call(this));
        _this2.name = "InvalidElementException";
        _this2.message = "Not supported type to render on";
        return _this2;
      }
      return InvalidElementException2;
    })(Error);
    var NoElementException = (function(_Error3) {
      _inherits(NoElementException2, _Error3);
      function NoElementException2() {
        _classCallCheck(this, NoElementException2);
        var _this3 = _possibleConstructorReturn(this, (NoElementException2.__proto__ || Object.getPrototypeOf(NoElementException2)).call(this));
        _this3.name = "NoElementException";
        _this3.message = "No element to render on.";
        return _this3;
      }
      return NoElementException2;
    })(Error);
    exports.InvalidInputException = InvalidInputException;
    exports.InvalidElementException = InvalidElementException;
    exports.NoElementException = NoElementException;
  }
});

// node_modules/jsbarcode/bin/help/getRenderProperties.js
var require_getRenderProperties = __commonJS({
  "node_modules/jsbarcode/bin/help/getRenderProperties.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
      return typeof obj;
    } : function(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
    var _getOptionsFromElement = require_getOptionsFromElement();
    var _getOptionsFromElement2 = _interopRequireDefault(_getOptionsFromElement);
    var _renderers = require_renderers();
    var _renderers2 = _interopRequireDefault(_renderers);
    var _exceptions = require_exceptions();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function getRenderProperties(element) {
      if (typeof element === "string") {
        return querySelectedRenderProperties(element);
      } else if (Array.isArray(element)) {
        var returnArray = [];
        for (var i = 0; i < element.length; i++) {
          returnArray.push(getRenderProperties(element[i]));
        }
        return returnArray;
      } else if (typeof HTMLCanvasElement !== "undefined" && element instanceof HTMLImageElement) {
        return newCanvasRenderProperties(element);
      } else if (element && element.nodeName && element.nodeName.toLowerCase() === "svg" || typeof SVGElement !== "undefined" && element instanceof SVGElement) {
        return {
          element,
          options: (0, _getOptionsFromElement2.default)(element),
          renderer: _renderers2.default.SVGRenderer
        };
      } else if (typeof HTMLCanvasElement !== "undefined" && element instanceof HTMLCanvasElement) {
        return {
          element,
          options: (0, _getOptionsFromElement2.default)(element),
          renderer: _renderers2.default.CanvasRenderer
        };
      } else if (element && element.getContext) {
        return {
          element,
          renderer: _renderers2.default.CanvasRenderer
        };
      } else if (element && (typeof element === "undefined" ? "undefined" : _typeof(element)) === "object" && !element.nodeName) {
        return {
          element,
          renderer: _renderers2.default.ObjectRenderer
        };
      } else {
        throw new _exceptions.InvalidElementException();
      }
    }
    function querySelectedRenderProperties(string) {
      var selector = document.querySelectorAll(string);
      if (selector.length === 0) {
        return void 0;
      } else {
        var returnArray = [];
        for (var i = 0; i < selector.length; i++) {
          returnArray.push(getRenderProperties(selector[i]));
        }
        return returnArray;
      }
    }
    function newCanvasRenderProperties(imgElement) {
      var canvas2 = document.createElement("canvas");
      return {
        element: canvas2,
        options: (0, _getOptionsFromElement2.default)(imgElement),
        renderer: _renderers2.default.CanvasRenderer,
        afterRender: function afterRender() {
          imgElement.setAttribute("src", canvas2.toDataURL());
        }
      };
    }
    exports.default = getRenderProperties;
  }
});

// node_modules/jsbarcode/bin/exceptions/ErrorHandler.js
var require_ErrorHandler = __commonJS({
  "node_modules/jsbarcode/bin/exceptions/ErrorHandler.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ (function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    })();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var ErrorHandler = (function() {
      function ErrorHandler2(api) {
        _classCallCheck(this, ErrorHandler2);
        this.api = api;
      }
      _createClass(ErrorHandler2, [{
        key: "handleCatch",
        value: function handleCatch(e) {
          if (e.name === "InvalidInputException") {
            if (this.api._options.valid !== this.api._defaults.valid) {
              this.api._options.valid(false);
            } else {
              throw e.message;
            }
          } else {
            throw e;
          }
          this.api.render = function() {
          };
        }
      }, {
        key: "wrapBarcodeCall",
        value: function wrapBarcodeCall(func) {
          try {
            var result = func.apply(void 0, arguments);
            this.api._options.valid(true);
            return result;
          } catch (e) {
            this.handleCatch(e);
            return this.api;
          }
        }
      }]);
      return ErrorHandler2;
    })();
    exports.default = ErrorHandler;
  }
});

// node_modules/jsbarcode/bin/JsBarcode.js
var require_JsBarcode = __commonJS({
  "node_modules/jsbarcode/bin/JsBarcode.js"(exports, module) {
    "use strict";
    var _barcodes = require_barcodes();
    var _barcodes2 = _interopRequireDefault(_barcodes);
    var _merge = require_merge();
    var _merge2 = _interopRequireDefault(_merge);
    var _linearizeEncodings = require_linearizeEncodings();
    var _linearizeEncodings2 = _interopRequireDefault(_linearizeEncodings);
    var _fixOptions = require_fixOptions();
    var _fixOptions2 = _interopRequireDefault(_fixOptions);
    var _getRenderProperties = require_getRenderProperties();
    var _getRenderProperties2 = _interopRequireDefault(_getRenderProperties);
    var _optionsFromStrings = require_optionsFromStrings();
    var _optionsFromStrings2 = _interopRequireDefault(_optionsFromStrings);
    var _ErrorHandler = require_ErrorHandler();
    var _ErrorHandler2 = _interopRequireDefault(_ErrorHandler);
    var _exceptions = require_exceptions();
    var _defaults = require_defaults();
    var _defaults2 = _interopRequireDefault(_defaults);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var API = function API2() {
    };
    var JsBarcode2 = function JsBarcode3(element, text, options) {
      var api = new API();
      if (typeof element === "undefined") {
        throw Error("No element to render on was provided.");
      }
      api._renderProperties = (0, _getRenderProperties2.default)(element);
      api._encodings = [];
      api._options = _defaults2.default;
      api._errorHandler = new _ErrorHandler2.default(api);
      if (typeof text !== "undefined") {
        options = options || {};
        if (!options.format) {
          options.format = autoSelectBarcode();
        }
        api.options(options)[options.format](text, options).render();
      }
      return api;
    };
    JsBarcode2.getModule = function(name2) {
      return _barcodes2.default[name2];
    };
    for (name in _barcodes2.default) {
      if (_barcodes2.default.hasOwnProperty(name)) {
        registerBarcode(_barcodes2.default, name);
      }
    }
    var name;
    function registerBarcode(barcodes, name2) {
      API.prototype[name2] = API.prototype[name2.toUpperCase()] = API.prototype[name2.toLowerCase()] = function(text, options) {
        var api = this;
        return api._errorHandler.wrapBarcodeCall(function() {
          options.text = typeof options.text === "undefined" ? void 0 : "" + options.text;
          var newOptions = (0, _merge2.default)(api._options, options);
          newOptions = (0, _optionsFromStrings2.default)(newOptions);
          var Encoder = barcodes[name2];
          var encoded = encode(text, Encoder, newOptions);
          api._encodings.push(encoded);
          return api;
        });
      };
    }
    function encode(text, Encoder, options) {
      text = "" + text;
      var encoder = new Encoder(text, options);
      if (!encoder.valid()) {
        throw new _exceptions.InvalidInputException(encoder.constructor.name, text);
      }
      var encoded = encoder.encode();
      encoded = (0, _linearizeEncodings2.default)(encoded);
      for (var i = 0; i < encoded.length; i++) {
        encoded[i].options = (0, _merge2.default)(options, encoded[i].options);
      }
      return encoded;
    }
    function autoSelectBarcode() {
      if (_barcodes2.default["CODE128"]) {
        return "CODE128";
      }
      return Object.keys(_barcodes2.default)[0];
    }
    API.prototype.options = function(options) {
      this._options = (0, _merge2.default)(this._options, options);
      return this;
    };
    API.prototype.blank = function(size) {
      var zeroes = new Array(size + 1).join("0");
      this._encodings.push({ data: zeroes });
      return this;
    };
    API.prototype.init = function() {
      if (!this._renderProperties) {
        return;
      }
      if (!Array.isArray(this._renderProperties)) {
        this._renderProperties = [this._renderProperties];
      }
      var renderProperty;
      for (var i in this._renderProperties) {
        renderProperty = this._renderProperties[i];
        var options = (0, _merge2.default)(this._options, renderProperty.options);
        if (options.format == "auto") {
          options.format = autoSelectBarcode();
        }
        this._errorHandler.wrapBarcodeCall(function() {
          var text = options.value;
          var Encoder = _barcodes2.default[options.format.toUpperCase()];
          var encoded = encode(text, Encoder, options);
          render2(renderProperty, encoded, options);
        });
      }
    };
    API.prototype.render = function() {
      if (!this._renderProperties) {
        throw new _exceptions.NoElementException();
      }
      if (Array.isArray(this._renderProperties)) {
        for (var i = 0; i < this._renderProperties.length; i++) {
          render2(this._renderProperties[i], this._encodings, this._options);
        }
      } else {
        render2(this._renderProperties, this._encodings, this._options);
      }
      return this;
    };
    API.prototype._defaults = _defaults2.default;
    function render2(renderProperties, encodings, options) {
      encodings = (0, _linearizeEncodings2.default)(encodings);
      for (var i = 0; i < encodings.length; i++) {
        encodings[i].options = (0, _merge2.default)(options, encodings[i].options);
        (0, _fixOptions2.default)(encodings[i].options);
      }
      (0, _fixOptions2.default)(options);
      var Renderer = renderProperties.renderer;
      var renderer = new Renderer(renderProperties.element, encodings, options);
      renderer.render();
      if (renderProperties.afterRender) {
        renderProperties.afterRender();
      }
    }
    if (typeof window !== "undefined") {
      window.JsBarcode = JsBarcode2;
    }
    if (typeof jQuery !== "undefined") {
      jQuery.fn.JsBarcode = function(content, options) {
        var elementArray = [];
        jQuery(this).each(function() {
          elementArray.push(this);
        });
        return JsBarcode2(elementArray, content, options);
      };
    }
    module.exports = JsBarcode2;
  }
});

// node_modules/qrcode-generator/dist/qrcode.mjs
var qrcode = function(typeNumber, errorCorrectionLevel) {
  const PAD0 = 236;
  const PAD1 = 17;
  let _typeNumber = typeNumber;
  const _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
  let _modules = null;
  let _moduleCount = 0;
  let _dataCache = null;
  const _dataList = [];
  const _this = {};
  const makeImpl = function(test, maskPattern) {
    _moduleCount = _typeNumber * 4 + 17;
    _modules = (function(moduleCount) {
      const modules = new Array(moduleCount);
      for (let row = 0; row < moduleCount; row += 1) {
        modules[row] = new Array(moduleCount);
        for (let col = 0; col < moduleCount; col += 1) {
          modules[row][col] = null;
        }
      }
      return modules;
    })(_moduleCount);
    setupPositionProbePattern(0, 0);
    setupPositionProbePattern(_moduleCount - 7, 0);
    setupPositionProbePattern(0, _moduleCount - 7);
    setupPositionAdjustPattern();
    setupTimingPattern();
    setupTypeInfo(test, maskPattern);
    if (_typeNumber >= 7) {
      setupTypeNumber(test);
    }
    if (_dataCache == null) {
      _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
    }
    mapData(_dataCache, maskPattern);
  };
  const setupPositionProbePattern = function(row, col) {
    for (let r = -1; r <= 7; r += 1) {
      if (row + r <= -1 || _moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c += 1) {
        if (col + c <= -1 || _moduleCount <= col + c) continue;
        if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
          _modules[row + r][col + c] = true;
        } else {
          _modules[row + r][col + c] = false;
        }
      }
    }
  };
  const getBestMaskPattern = function() {
    let minLostPoint = 0;
    let pattern = 0;
    for (let i = 0; i < 8; i += 1) {
      makeImpl(true, i);
      const lostPoint = QRUtil.getLostPoint(_this);
      if (i == 0 || minLostPoint > lostPoint) {
        minLostPoint = lostPoint;
        pattern = i;
      }
    }
    return pattern;
  };
  const setupTimingPattern = function() {
    for (let r = 8; r < _moduleCount - 8; r += 1) {
      if (_modules[r][6] != null) {
        continue;
      }
      _modules[r][6] = r % 2 == 0;
    }
    for (let c = 8; c < _moduleCount - 8; c += 1) {
      if (_modules[6][c] != null) {
        continue;
      }
      _modules[6][c] = c % 2 == 0;
    }
  };
  const setupPositionAdjustPattern = function() {
    const pos = QRUtil.getPatternPosition(_typeNumber);
    for (let i = 0; i < pos.length; i += 1) {
      for (let j = 0; j < pos.length; j += 1) {
        const row = pos[i];
        const col = pos[j];
        if (_modules[row][col] != null) {
          continue;
        }
        for (let r = -2; r <= 2; r += 1) {
          for (let c = -2; c <= 2; c += 1) {
            if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
              _modules[row + r][col + c] = true;
            } else {
              _modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  };
  const setupTypeNumber = function(test) {
    const bits = QRUtil.getBCHTypeNumber(_typeNumber);
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && (bits >> i & 1) == 1;
      _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
    }
    for (let i = 0; i < 18; i += 1) {
      const mod = !test && (bits >> i & 1) == 1;
      _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  };
  const setupTypeInfo = function(test, maskPattern) {
    const data = _errorCorrectionLevel << 3 | maskPattern;
    const bits = QRUtil.getBCHTypeInfo(data);
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && (bits >> i & 1) == 1;
      if (i < 6) {
        _modules[i][8] = mod;
      } else if (i < 8) {
        _modules[i + 1][8] = mod;
      } else {
        _modules[_moduleCount - 15 + i][8] = mod;
      }
    }
    for (let i = 0; i < 15; i += 1) {
      const mod = !test && (bits >> i & 1) == 1;
      if (i < 8) {
        _modules[8][_moduleCount - i - 1] = mod;
      } else if (i < 9) {
        _modules[8][15 - i - 1 + 1] = mod;
      } else {
        _modules[8][15 - i - 1] = mod;
      }
    }
    _modules[_moduleCount - 8][8] = !test;
  };
  const mapData = function(data, maskPattern) {
    let inc = -1;
    let row = _moduleCount - 1;
    let bitIndex = 7;
    let byteIndex = 0;
    const maskFunc = QRUtil.getMaskFunction(maskPattern);
    for (let col = _moduleCount - 1; col > 0; col -= 2) {
      if (col == 6) col -= 1;
      while (true) {
        for (let c = 0; c < 2; c += 1) {
          if (_modules[row][col - c] == null) {
            let dark = false;
            if (byteIndex < data.length) {
              dark = (data[byteIndex] >>> bitIndex & 1) == 1;
            }
            const mask = maskFunc(row, col - c);
            if (mask) {
              dark = !dark;
            }
            _modules[row][col - c] = dark;
            bitIndex -= 1;
            if (bitIndex == -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }
        row += inc;
        if (row < 0 || _moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  };
  const createBytes = function(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcdata = new Array(rsBlocks.length);
    const ecdata = new Array(rsBlocks.length);
    for (let r = 0; r < rsBlocks.length; r += 1) {
      const dcCount = rsBlocks[r].dataCount;
      const ecCount = rsBlocks[r].totalCount - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcdata[r] = new Array(dcCount);
      for (let i = 0; i < dcdata[r].length; i += 1) {
        dcdata[r][i] = 255 & buffer.getBuffer()[i + offset];
      }
      offset += dcCount;
      const rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly = rawPoly.mod(rsPoly);
      ecdata[r] = new Array(rsPoly.getLength() - 1);
      for (let i = 0; i < ecdata[r].length; i += 1) {
        const modIndex = i + modPoly.getLength() - ecdata[r].length;
        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }
    let totalCodeCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalCodeCount += rsBlocks[i].totalCount;
    }
    const data = new Array(totalCodeCount);
    let index = 0;
    for (let i = 0; i < maxDcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i];
          index += 1;
        }
      }
    }
    for (let i = 0; i < maxEcCount; i += 1) {
      for (let r = 0; r < rsBlocks.length; r += 1) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i];
          index += 1;
        }
      }
    }
    return data;
  };
  const createData = function(typeNumber2, errorCorrectionLevel2, dataList) {
    const rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, errorCorrectionLevel2);
    const buffer = qrBitBuffer();
    for (let i = 0; i < dataList.length; i += 1) {
      const data = dataList[i];
      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
      data.write(buffer);
    }
    let totalDataCount = 0;
    for (let i = 0; i < rsBlocks.length; i += 1) {
      totalDataCount += rsBlocks[i].dataCount;
    }
    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
    }
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }
    while (buffer.getLengthInBits() % 8 != 0) {
      buffer.putBit(false);
    }
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(PAD0, 8);
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }
      buffer.put(PAD1, 8);
    }
    return createBytes(buffer, rsBlocks);
  };
  _this.addData = function(data, mode) {
    mode = mode || "Byte";
    let newData = null;
    switch (mode) {
      case "Numeric":
        newData = qrNumber(data);
        break;
      case "Alphanumeric":
        newData = qrAlphaNum(data);
        break;
      case "Byte":
        newData = qr8BitByte(data);
        break;
      case "Kanji":
        newData = qrKanji(data);
        break;
      default:
        throw "mode:" + mode;
    }
    _dataList.push(newData);
    _dataCache = null;
  };
  _this.isDark = function(row, col) {
    if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
      throw row + "," + col;
    }
    return _modules[row][col];
  };
  _this.getModuleCount = function() {
    return _moduleCount;
  };
  _this.make = function() {
    if (_typeNumber < 1) {
      let typeNumber2 = 1;
      for (; typeNumber2 < 40; typeNumber2++) {
        const rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, _errorCorrectionLevel);
        const buffer = qrBitBuffer();
        for (let i = 0; i < _dataList.length; i++) {
          const data = _dataList[i];
          buffer.put(data.getMode(), 4);
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
          data.write(buffer);
        }
        let totalDataCount = 0;
        for (let i = 0; i < rsBlocks.length; i++) {
          totalDataCount += rsBlocks[i].dataCount;
        }
        if (buffer.getLengthInBits() <= totalDataCount * 8) {
          break;
        }
      }
      _typeNumber = typeNumber2;
    }
    makeImpl(false, getBestMaskPattern());
  };
  _this.createTableTag = function(cellSize, margin) {
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;
    let qrHtml = "";
    qrHtml += '<table style="';
    qrHtml += " border-width: 0px; border-style: none;";
    qrHtml += " border-collapse: collapse;";
    qrHtml += " padding: 0px; margin: " + margin + "px;";
    qrHtml += '">';
    qrHtml += "<tbody>";
    for (let r = 0; r < _this.getModuleCount(); r += 1) {
      qrHtml += "<tr>";
      for (let c = 0; c < _this.getModuleCount(); c += 1) {
        qrHtml += '<td style="';
        qrHtml += " border-width: 0px; border-style: none;";
        qrHtml += " border-collapse: collapse;";
        qrHtml += " padding: 0px; margin: 0px;";
        qrHtml += " width: " + cellSize + "px;";
        qrHtml += " height: " + cellSize + "px;";
        qrHtml += " background-color: ";
        qrHtml += _this.isDark(r, c) ? "#000000" : "#ffffff";
        qrHtml += ";";
        qrHtml += '"/>';
      }
      qrHtml += "</tr>";
    }
    qrHtml += "</tbody>";
    qrHtml += "</table>";
    return qrHtml;
  };
  _this.createSvgTag = function(cellSize, margin, alt, title) {
    let opts = {};
    if (typeof arguments[0] == "object") {
      opts = arguments[0];
      cellSize = opts.cellSize;
      margin = opts.margin;
      alt = opts.alt;
      title = opts.title;
    }
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;
    alt = typeof alt === "string" ? { text: alt } : alt || {};
    alt.text = alt.text || null;
    alt.id = alt.text ? alt.id || "qrcode-description" : null;
    title = typeof title === "string" ? { text: title } : title || {};
    title.text = title.text || null;
    title.id = title.text ? title.id || "qrcode-title" : null;
    const size = _this.getModuleCount() * cellSize + margin * 2;
    let c, mc, r, mr, qrSvg = "", rect;
    rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
    qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
    qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
    qrSvg += ' viewBox="0 0 ' + size + " " + size + '" ';
    qrSvg += ' preserveAspectRatio="xMinYMin meet"';
    qrSvg += title.text || alt.text ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"' : "";
    qrSvg += ">";
    qrSvg += title.text ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + "</title>" : "";
    qrSvg += alt.text ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + "</description>" : "";
    qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
    qrSvg += '<path d="';
    for (r = 0; r < _this.getModuleCount(); r += 1) {
      mr = r * cellSize + margin;
      for (c = 0; c < _this.getModuleCount(); c += 1) {
        if (_this.isDark(r, c)) {
          mc = c * cellSize + margin;
          qrSvg += "M" + mc + "," + mr + rect;
        }
      }
    }
    qrSvg += '" stroke="transparent" fill="black"/>';
    qrSvg += "</svg>";
    return qrSvg;
  };
  _this.createDataURL = function(cellSize, margin) {
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;
    const size = _this.getModuleCount() * cellSize + margin * 2;
    const min = margin;
    const max = size - margin;
    return createDataURL(size, size, function(x, y) {
      if (min <= x && x < max && min <= y && y < max) {
        const c = Math.floor((x - min) / cellSize);
        const r = Math.floor((y - min) / cellSize);
        return _this.isDark(r, c) ? 0 : 1;
      } else {
        return 1;
      }
    });
  };
  _this.createImgTag = function(cellSize, margin, alt) {
    cellSize = cellSize || 2;
    margin = typeof margin == "undefined" ? cellSize * 4 : margin;
    const size = _this.getModuleCount() * cellSize + margin * 2;
    let img = "";
    img += "<img";
    img += ' src="';
    img += _this.createDataURL(cellSize, margin);
    img += '"';
    img += ' width="';
    img += size;
    img += '"';
    img += ' height="';
    img += size;
    img += '"';
    if (alt) {
      img += ' alt="';
      img += escapeXml(alt);
      img += '"';
    }
    img += "/>";
    return img;
  };
  const escapeXml = function(s) {
    let escaped = "";
    for (let i = 0; i < s.length; i += 1) {
      const c = s.charAt(i);
      switch (c) {
        case "<":
          escaped += "&lt;";
          break;
        case ">":
          escaped += "&gt;";
          break;
        case "&":
          escaped += "&amp;";
          break;
        case '"':
          escaped += "&quot;";
          break;
        default:
          escaped += c;
          break;
      }
    }
    return escaped;
  };
  const _createHalfASCII = function(margin) {
    const cellSize = 1;
    margin = typeof margin == "undefined" ? cellSize * 2 : margin;
    const size = _this.getModuleCount() * cellSize + margin * 2;
    const min = margin;
    const max = size - margin;
    let y, x, r1, r2, p;
    const blocks = {
      "\u2588\u2588": "\u2588",
      "\u2588 ": "\u2580",
      " \u2588": "\u2584",
      "  ": " "
    };
    const blocksLastLineNoMargin = {
      "\u2588\u2588": "\u2580",
      "\u2588 ": "\u2580",
      " \u2588": " ",
      "  ": " "
    };
    let ascii = "";
    for (y = 0; y < size; y += 2) {
      r1 = Math.floor((y - min) / cellSize);
      r2 = Math.floor((y + 1 - min) / cellSize);
      for (x = 0; x < size; x += 1) {
        p = "\u2588";
        if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
          p = " ";
        }
        if (min <= x && x < max && min <= y + 1 && y + 1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
          p += " ";
        } else {
          p += "\u2588";
        }
        ascii += margin < 1 && y + 1 >= max ? blocksLastLineNoMargin[p] : blocks[p];
      }
      ascii += "\n";
    }
    if (size % 2 && margin > 0) {
      return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("\u2580");
    }
    return ascii.substring(0, ascii.length - 1);
  };
  _this.createASCII = function(cellSize, margin) {
    cellSize = cellSize || 1;
    if (cellSize < 2) {
      return _createHalfASCII(margin);
    }
    cellSize -= 1;
    margin = typeof margin == "undefined" ? cellSize * 2 : margin;
    const size = _this.getModuleCount() * cellSize + margin * 2;
    const min = margin;
    const max = size - margin;
    let y, x, r, p;
    const white = Array(cellSize + 1).join("\u2588\u2588");
    const black = Array(cellSize + 1).join("  ");
    let ascii = "";
    let line = "";
    for (y = 0; y < size; y += 1) {
      r = Math.floor((y - min) / cellSize);
      line = "";
      for (x = 0; x < size; x += 1) {
        p = 1;
        if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
          p = 0;
        }
        line += p ? white : black;
      }
      for (r = 0; r < cellSize; r += 1) {
        ascii += line + "\n";
      }
    }
    return ascii.substring(0, ascii.length - 1);
  };
  _this.renderTo2dContext = function(context, cellSize) {
    cellSize = cellSize || 2;
    const length = _this.getModuleCount();
    for (let row = 0; row < length; row++) {
      for (let col = 0; col < length; col++) {
        context.fillStyle = _this.isDark(row, col) ? "black" : "white";
        context.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  };
  return _this;
};
qrcode.stringToBytes = function(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    bytes.push(c & 255);
  }
  return bytes;
};
qrcode.createStringToBytes = function(unicodeData, numChars) {
  const unicodeMap = (function() {
    const bin = base64DecodeInputStream(unicodeData);
    const read = function() {
      const b = bin.read();
      if (b == -1) throw "eof";
      return b;
    };
    let count = 0;
    const unicodeMap2 = {};
    while (true) {
      const b0 = bin.read();
      if (b0 == -1) break;
      const b1 = read();
      const b2 = read();
      const b3 = read();
      const k = String.fromCharCode(b0 << 8 | b1);
      const v = b2 << 8 | b3;
      unicodeMap2[k] = v;
      count += 1;
    }
    if (count != numChars) {
      throw count + " != " + numChars;
    }
    return unicodeMap2;
  })();
  const unknownChar = "?".charCodeAt(0);
  return function(s) {
    const bytes = [];
    for (let i = 0; i < s.length; i += 1) {
      const c = s.charCodeAt(i);
      if (c < 128) {
        bytes.push(c);
      } else {
        const b = unicodeMap[s.charAt(i)];
        if (typeof b == "number") {
          if ((b & 255) == b) {
            bytes.push(b);
          } else {
            bytes.push(b >>> 8);
            bytes.push(b & 255);
          }
        } else {
          bytes.push(unknownChar);
        }
      }
    }
    return bytes;
  };
};
var QRMode = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3
};
var QRErrorCorrectionLevel = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
};
var QRMaskPattern = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7
};
var QRUtil = (function() {
  const PATTERN_POSITION_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
  ];
  const G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
  const G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
  const G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
  const _this = {};
  const getBCHDigit = function(data) {
    let digit = 0;
    while (data != 0) {
      digit += 1;
      data >>>= 1;
    }
    return digit;
  };
  _this.getBCHTypeInfo = function(data) {
    let d = data << 10;
    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
      d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
    }
    return (data << 10 | d) ^ G15_MASK;
  };
  _this.getBCHTypeNumber = function(data) {
    let d = data << 12;
    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
      d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
    }
    return data << 12 | d;
  };
  _this.getPatternPosition = function(typeNumber) {
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  };
  _this.getMaskFunction = function(maskPattern) {
    switch (maskPattern) {
      case QRMaskPattern.PATTERN000:
        return function(i, j) {
          return (i + j) % 2 == 0;
        };
      case QRMaskPattern.PATTERN001:
        return function(i, j) {
          return i % 2 == 0;
        };
      case QRMaskPattern.PATTERN010:
        return function(i, j) {
          return j % 3 == 0;
        };
      case QRMaskPattern.PATTERN011:
        return function(i, j) {
          return (i + j) % 3 == 0;
        };
      case QRMaskPattern.PATTERN100:
        return function(i, j) {
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
        };
      case QRMaskPattern.PATTERN101:
        return function(i, j) {
          return i * j % 2 + i * j % 3 == 0;
        };
      case QRMaskPattern.PATTERN110:
        return function(i, j) {
          return (i * j % 2 + i * j % 3) % 2 == 0;
        };
      case QRMaskPattern.PATTERN111:
        return function(i, j) {
          return (i * j % 3 + (i + j) % 2) % 2 == 0;
        };
      default:
        throw "bad maskPattern:" + maskPattern;
    }
  };
  _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
    let a = qrPolynomial([1], 0);
    for (let i = 0; i < errorCorrectLength; i += 1) {
      a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
    }
    return a;
  };
  _this.getLengthInBits = function(mode, type) {
    if (1 <= type && type < 10) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 10;
        case QRMode.MODE_ALPHA_NUM:
          return 9;
        case QRMode.MODE_8BIT_BYTE:
          return 8;
        case QRMode.MODE_KANJI:
          return 8;
        default:
          throw "mode:" + mode;
      }
    } else if (type < 27) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 12;
        case QRMode.MODE_ALPHA_NUM:
          return 11;
        case QRMode.MODE_8BIT_BYTE:
          return 16;
        case QRMode.MODE_KANJI:
          return 10;
        default:
          throw "mode:" + mode;
      }
    } else if (type < 41) {
      switch (mode) {
        case QRMode.MODE_NUMBER:
          return 14;
        case QRMode.MODE_ALPHA_NUM:
          return 13;
        case QRMode.MODE_8BIT_BYTE:
          return 16;
        case QRMode.MODE_KANJI:
          return 12;
        default:
          throw "mode:" + mode;
      }
    } else {
      throw "type:" + type;
    }
  };
  _this.getLostPoint = function(qrcode2) {
    const moduleCount = qrcode2.getModuleCount();
    let lostPoint = 0;
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        let sameCount = 0;
        const dark = qrcode2.isDark(row, col);
        for (let r = -1; r <= 1; r += 1) {
          if (row + r < 0 || moduleCount <= row + r) {
            continue;
          }
          for (let c = -1; c <= 1; c += 1) {
            if (col + c < 0 || moduleCount <= col + c) {
              continue;
            }
            if (r == 0 && c == 0) {
              continue;
            }
            if (dark == qrcode2.isDark(row + r, col + c)) {
              sameCount += 1;
            }
          }
        }
        if (sameCount > 5) {
          lostPoint += 3 + sameCount - 5;
        }
      }
    }
    ;
    for (let row = 0; row < moduleCount - 1; row += 1) {
      for (let col = 0; col < moduleCount - 1; col += 1) {
        let count = 0;
        if (qrcode2.isDark(row, col)) count += 1;
        if (qrcode2.isDark(row + 1, col)) count += 1;
        if (qrcode2.isDark(row, col + 1)) count += 1;
        if (qrcode2.isDark(row + 1, col + 1)) count += 1;
        if (count == 0 || count == 4) {
          lostPoint += 3;
        }
      }
    }
    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount - 6; col += 1) {
        if (qrcode2.isDark(row, col) && !qrcode2.isDark(row, col + 1) && qrcode2.isDark(row, col + 2) && qrcode2.isDark(row, col + 3) && qrcode2.isDark(row, col + 4) && !qrcode2.isDark(row, col + 5) && qrcode2.isDark(row, col + 6)) {
          lostPoint += 40;
        }
      }
    }
    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount - 6; row += 1) {
        if (qrcode2.isDark(row, col) && !qrcode2.isDark(row + 1, col) && qrcode2.isDark(row + 2, col) && qrcode2.isDark(row + 3, col) && qrcode2.isDark(row + 4, col) && !qrcode2.isDark(row + 5, col) && qrcode2.isDark(row + 6, col)) {
          lostPoint += 40;
        }
      }
    }
    let darkCount = 0;
    for (let col = 0; col < moduleCount; col += 1) {
      for (let row = 0; row < moduleCount; row += 1) {
        if (qrcode2.isDark(row, col)) {
          darkCount += 1;
        }
      }
    }
    const ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
    lostPoint += ratio * 10;
    return lostPoint;
  };
  return _this;
})();
var QRMath = (function() {
  const EXP_TABLE = new Array(256);
  const LOG_TABLE = new Array(256);
  for (let i = 0; i < 8; i += 1) {
    EXP_TABLE[i] = 1 << i;
  }
  for (let i = 8; i < 256; i += 1) {
    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
  }
  for (let i = 0; i < 255; i += 1) {
    LOG_TABLE[EXP_TABLE[i]] = i;
  }
  const _this = {};
  _this.glog = function(n) {
    if (n < 1) {
      throw "glog(" + n + ")";
    }
    return LOG_TABLE[n];
  };
  _this.gexp = function(n) {
    while (n < 0) {
      n += 255;
    }
    while (n >= 256) {
      n -= 255;
    }
    return EXP_TABLE[n];
  };
  return _this;
})();
var qrPolynomial = function(num, shift) {
  if (typeof num.length == "undefined") {
    throw num.length + "/" + shift;
  }
  const _num = (function() {
    let offset = 0;
    while (offset < num.length && num[offset] == 0) {
      offset += 1;
    }
    const _num2 = new Array(num.length - offset + shift);
    for (let i = 0; i < num.length - offset; i += 1) {
      _num2[i] = num[i + offset];
    }
    return _num2;
  })();
  const _this = {};
  _this.getAt = function(index) {
    return _num[index];
  };
  _this.getLength = function() {
    return _num.length;
  };
  _this.multiply = function(e) {
    const num2 = new Array(_this.getLength() + e.getLength() - 1);
    for (let i = 0; i < _this.getLength(); i += 1) {
      for (let j = 0; j < e.getLength(); j += 1) {
        num2[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }
    return qrPolynomial(num2, 0);
  };
  _this.mod = function(e) {
    if (_this.getLength() - e.getLength() < 0) {
      return _this;
    }
    const ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e.getAt(0));
    const num2 = new Array(_this.getLength());
    for (let i = 0; i < _this.getLength(); i += 1) {
      num2[i] = _this.getAt(i);
    }
    for (let i = 0; i < e.getLength(); i += 1) {
      num2[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }
    return qrPolynomial(num2, 0).mod(e);
  };
  return _this;
};
var QRRSBlock = (function() {
  const RS_BLOCK_TABLE = [
    // L
    // M
    // Q
    // H
    // 1
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    // 2
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    // 3
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    // 4
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    // 5
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    // 6
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    // 7
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    // 8
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    // 9
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    // 10
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    // 11
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    // 12
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    // 13
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    // 14
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    // 15
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12, 7, 37, 13],
    // 16
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    // 17
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    // 18
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    // 19
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    // 20
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    // 21
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    // 22
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    // 23
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    // 24
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    // 25
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    // 26
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    // 27
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    // 28
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    // 29
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    // 30
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    // 31
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    // 32
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    // 33
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    // 34
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    // 35
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    // 36
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    // 37
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    // 38
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    // 39
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    // 40
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
  ];
  const qrRSBlock = function(totalCount, dataCount) {
    const _this2 = {};
    _this2.totalCount = totalCount;
    _this2.dataCount = dataCount;
    return _this2;
  };
  const _this = {};
  const getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
    switch (errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L:
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M:
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q:
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H:
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default:
        return void 0;
    }
  };
  _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
    const rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
    if (typeof rsBlock == "undefined") {
      throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
    }
    const length = rsBlock.length / 3;
    const list = [];
    for (let i = 0; i < length; i += 1) {
      const count = rsBlock[i * 3 + 0];
      const totalCount = rsBlock[i * 3 + 1];
      const dataCount = rsBlock[i * 3 + 2];
      for (let j = 0; j < count; j += 1) {
        list.push(qrRSBlock(totalCount, dataCount));
      }
    }
    return list;
  };
  return _this;
})();
var qrBitBuffer = function() {
  const _buffer = [];
  let _length = 0;
  const _this = {};
  _this.getBuffer = function() {
    return _buffer;
  };
  _this.getAt = function(index) {
    const bufIndex = Math.floor(index / 8);
    return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
  };
  _this.put = function(num, length) {
    for (let i = 0; i < length; i += 1) {
      _this.putBit((num >>> length - i - 1 & 1) == 1);
    }
  };
  _this.getLengthInBits = function() {
    return _length;
  };
  _this.putBit = function(bit) {
    const bufIndex = Math.floor(_length / 8);
    if (_buffer.length <= bufIndex) {
      _buffer.push(0);
    }
    if (bit) {
      _buffer[bufIndex] |= 128 >>> _length % 8;
    }
    _length += 1;
  };
  return _this;
};
var qrNumber = function(data) {
  const _mode = QRMode.MODE_NUMBER;
  const _data = data;
  const _this = {};
  _this.getMode = function() {
    return _mode;
  };
  _this.getLength = function(buffer) {
    return _data.length;
  };
  _this.write = function(buffer) {
    const data2 = _data;
    let i = 0;
    while (i + 2 < data2.length) {
      buffer.put(strToNum(data2.substring(i, i + 3)), 10);
      i += 3;
    }
    if (i < data2.length) {
      if (data2.length - i == 1) {
        buffer.put(strToNum(data2.substring(i, i + 1)), 4);
      } else if (data2.length - i == 2) {
        buffer.put(strToNum(data2.substring(i, i + 2)), 7);
      }
    }
  };
  const strToNum = function(s) {
    let num = 0;
    for (let i = 0; i < s.length; i += 1) {
      num = num * 10 + chatToNum(s.charAt(i));
    }
    return num;
  };
  const chatToNum = function(c) {
    if ("0" <= c && c <= "9") {
      return c.charCodeAt(0) - "0".charCodeAt(0);
    }
    throw "illegal char :" + c;
  };
  return _this;
};
var qrAlphaNum = function(data) {
  const _mode = QRMode.MODE_ALPHA_NUM;
  const _data = data;
  const _this = {};
  _this.getMode = function() {
    return _mode;
  };
  _this.getLength = function(buffer) {
    return _data.length;
  };
  _this.write = function(buffer) {
    const s = _data;
    let i = 0;
    while (i + 1 < s.length) {
      buffer.put(
        getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)),
        11
      );
      i += 2;
    }
    if (i < s.length) {
      buffer.put(getCode(s.charAt(i)), 6);
    }
  };
  const getCode = function(c) {
    if ("0" <= c && c <= "9") {
      return c.charCodeAt(0) - "0".charCodeAt(0);
    } else if ("A" <= c && c <= "Z") {
      return c.charCodeAt(0) - "A".charCodeAt(0) + 10;
    } else {
      switch (c) {
        case " ":
          return 36;
        case "$":
          return 37;
        case "%":
          return 38;
        case "*":
          return 39;
        case "+":
          return 40;
        case "-":
          return 41;
        case ".":
          return 42;
        case "/":
          return 43;
        case ":":
          return 44;
        default:
          throw "illegal char :" + c;
      }
    }
  };
  return _this;
};
var qr8BitByte = function(data) {
  const _mode = QRMode.MODE_8BIT_BYTE;
  const _data = data;
  const _bytes = qrcode.stringToBytes(data);
  const _this = {};
  _this.getMode = function() {
    return _mode;
  };
  _this.getLength = function(buffer) {
    return _bytes.length;
  };
  _this.write = function(buffer) {
    for (let i = 0; i < _bytes.length; i += 1) {
      buffer.put(_bytes[i], 8);
    }
  };
  return _this;
};
var qrKanji = function(data) {
  const _mode = QRMode.MODE_KANJI;
  const _data = data;
  const stringToBytes2 = qrcode.stringToBytes;
  !(function(c, code) {
    const test = stringToBytes2(c);
    if (test.length != 2 || (test[0] << 8 | test[1]) != code) {
      throw "sjis not supported.";
    }
  })("\u53CB", 38726);
  const _bytes = stringToBytes2(data);
  const _this = {};
  _this.getMode = function() {
    return _mode;
  };
  _this.getLength = function(buffer) {
    return ~~(_bytes.length / 2);
  };
  _this.write = function(buffer) {
    const data2 = _bytes;
    let i = 0;
    while (i + 1 < data2.length) {
      let c = (255 & data2[i]) << 8 | 255 & data2[i + 1];
      if (33088 <= c && c <= 40956) {
        c -= 33088;
      } else if (57408 <= c && c <= 60351) {
        c -= 49472;
      } else {
        throw "illegal char at " + (i + 1) + "/" + c;
      }
      c = (c >>> 8 & 255) * 192 + (c & 255);
      buffer.put(c, 13);
      i += 2;
    }
    if (i < data2.length) {
      throw "illegal char at " + (i + 1);
    }
  };
  return _this;
};
var byteArrayOutputStream = function() {
  const _bytes = [];
  const _this = {};
  _this.writeByte = function(b) {
    _bytes.push(b & 255);
  };
  _this.writeShort = function(i) {
    _this.writeByte(i);
    _this.writeByte(i >>> 8);
  };
  _this.writeBytes = function(b, off, len) {
    off = off || 0;
    len = len || b.length;
    for (let i = 0; i < len; i += 1) {
      _this.writeByte(b[i + off]);
    }
  };
  _this.writeString = function(s) {
    for (let i = 0; i < s.length; i += 1) {
      _this.writeByte(s.charCodeAt(i));
    }
  };
  _this.toByteArray = function() {
    return _bytes;
  };
  _this.toString = function() {
    let s = "";
    s += "[";
    for (let i = 0; i < _bytes.length; i += 1) {
      if (i > 0) {
        s += ",";
      }
      s += _bytes[i];
    }
    s += "]";
    return s;
  };
  return _this;
};
var base64EncodeOutputStream = function() {
  let _buffer = 0;
  let _buflen = 0;
  let _length = 0;
  let _base64 = "";
  const _this = {};
  const writeEncoded = function(b) {
    _base64 += String.fromCharCode(encode(b & 63));
  };
  const encode = function(n) {
    if (n < 0) {
      throw "n:" + n;
    } else if (n < 26) {
      return 65 + n;
    } else if (n < 52) {
      return 97 + (n - 26);
    } else if (n < 62) {
      return 48 + (n - 52);
    } else if (n == 62) {
      return 43;
    } else if (n == 63) {
      return 47;
    } else {
      throw "n:" + n;
    }
  };
  _this.writeByte = function(n) {
    _buffer = _buffer << 8 | n & 255;
    _buflen += 8;
    _length += 1;
    while (_buflen >= 6) {
      writeEncoded(_buffer >>> _buflen - 6);
      _buflen -= 6;
    }
  };
  _this.flush = function() {
    if (_buflen > 0) {
      writeEncoded(_buffer << 6 - _buflen);
      _buffer = 0;
      _buflen = 0;
    }
    if (_length % 3 != 0) {
      const padlen = 3 - _length % 3;
      for (let i = 0; i < padlen; i += 1) {
        _base64 += "=";
      }
    }
  };
  _this.toString = function() {
    return _base64;
  };
  return _this;
};
var base64DecodeInputStream = function(str) {
  const _str = str;
  let _pos = 0;
  let _buffer = 0;
  let _buflen = 0;
  const _this = {};
  _this.read = function() {
    while (_buflen < 8) {
      if (_pos >= _str.length) {
        if (_buflen == 0) {
          return -1;
        }
        throw "unexpected end of file./" + _buflen;
      }
      const c = _str.charAt(_pos);
      _pos += 1;
      if (c == "=") {
        _buflen = 0;
        return -1;
      } else if (c.match(/^\s$/)) {
        continue;
      }
      _buffer = _buffer << 6 | decode(c.charCodeAt(0));
      _buflen += 6;
    }
    const n = _buffer >>> _buflen - 8 & 255;
    _buflen -= 8;
    return n;
  };
  const decode = function(c) {
    if (65 <= c && c <= 90) {
      return c - 65;
    } else if (97 <= c && c <= 122) {
      return c - 97 + 26;
    } else if (48 <= c && c <= 57) {
      return c - 48 + 52;
    } else if (c == 43) {
      return 62;
    } else if (c == 47) {
      return 63;
    } else {
      throw "c:" + c;
    }
  };
  return _this;
};
var gifImage = function(width, height) {
  const _width = width;
  const _height = height;
  const _data = new Array(width * height);
  const _this = {};
  _this.setPixel = function(x, y, pixel) {
    _data[y * _width + x] = pixel;
  };
  _this.write = function(out) {
    out.writeString("GIF87a");
    out.writeShort(_width);
    out.writeShort(_height);
    out.writeByte(128);
    out.writeByte(0);
    out.writeByte(0);
    out.writeByte(0);
    out.writeByte(0);
    out.writeByte(0);
    out.writeByte(255);
    out.writeByte(255);
    out.writeByte(255);
    out.writeString(",");
    out.writeShort(0);
    out.writeShort(0);
    out.writeShort(_width);
    out.writeShort(_height);
    out.writeByte(0);
    const lzwMinCodeSize = 2;
    const raster = getLZWRaster(lzwMinCodeSize);
    out.writeByte(lzwMinCodeSize);
    let offset = 0;
    while (raster.length - offset > 255) {
      out.writeByte(255);
      out.writeBytes(raster, offset, 255);
      offset += 255;
    }
    out.writeByte(raster.length - offset);
    out.writeBytes(raster, offset, raster.length - offset);
    out.writeByte(0);
    out.writeString(";");
  };
  const bitOutputStream = function(out) {
    const _out = out;
    let _bitLength = 0;
    let _bitBuffer = 0;
    const _this2 = {};
    _this2.write = function(data, length) {
      if (data >>> length != 0) {
        throw "length over";
      }
      while (_bitLength + length >= 8) {
        _out.writeByte(255 & (data << _bitLength | _bitBuffer));
        length -= 8 - _bitLength;
        data >>>= 8 - _bitLength;
        _bitBuffer = 0;
        _bitLength = 0;
      }
      _bitBuffer = data << _bitLength | _bitBuffer;
      _bitLength = _bitLength + length;
    };
    _this2.flush = function() {
      if (_bitLength > 0) {
        _out.writeByte(_bitBuffer);
      }
    };
    return _this2;
  };
  const getLZWRaster = function(lzwMinCodeSize) {
    const clearCode = 1 << lzwMinCodeSize;
    const endCode = (1 << lzwMinCodeSize) + 1;
    let bitLength = lzwMinCodeSize + 1;
    const table = lzwTable();
    for (let i = 0; i < clearCode; i += 1) {
      table.add(String.fromCharCode(i));
    }
    table.add(String.fromCharCode(clearCode));
    table.add(String.fromCharCode(endCode));
    const byteOut = byteArrayOutputStream();
    const bitOut = bitOutputStream(byteOut);
    bitOut.write(clearCode, bitLength);
    let dataIndex = 0;
    let s = String.fromCharCode(_data[dataIndex]);
    dataIndex += 1;
    while (dataIndex < _data.length) {
      const c = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;
      if (table.contains(s + c)) {
        s = s + c;
      } else {
        bitOut.write(table.indexOf(s), bitLength);
        if (table.size() < 4095) {
          if (table.size() == 1 << bitLength) {
            bitLength += 1;
          }
          table.add(s + c);
        }
        s = c;
      }
    }
    bitOut.write(table.indexOf(s), bitLength);
    bitOut.write(endCode, bitLength);
    bitOut.flush();
    return byteOut.toByteArray();
  };
  const lzwTable = function() {
    const _map = {};
    let _size = 0;
    const _this2 = {};
    _this2.add = function(key) {
      if (_this2.contains(key)) {
        throw "dup key:" + key;
      }
      _map[key] = _size;
      _size += 1;
    };
    _this2.size = function() {
      return _size;
    };
    _this2.indexOf = function(key) {
      return _map[key];
    };
    _this2.contains = function(key) {
      return typeof _map[key] != "undefined";
    };
    return _this2;
  };
  return _this;
};
var createDataURL = function(width, height, getPixel) {
  const gif = gifImage(width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      gif.setPixel(x, y, getPixel(x, y));
    }
  }
  const b = byteArrayOutputStream();
  gif.write(b);
  const base64 = base64EncodeOutputStream();
  const bytes = b.toByteArray();
  for (let i = 0; i < bytes.length; i += 1) {
    base64.writeByte(bytes[i]);
  }
  base64.flush();
  return "data:image/gif;base64," + base64;
};
var qrcode_default = qrcode;
var stringToBytes = qrcode.stringToBytes;

// browser/editor-src.mjs
var import_jsbarcode = __toESM(require_JsBarcode(), 1);

// browser/gcode.mjs
var fmt = (value) => Number(value.toFixed(3)).toString();
function rasterToGcode({
  pixels,
  width,
  height,
  stepMm,
  bedMm = 300,
  powerPercent,
  speedMmMin,
  passes,
  sMax,
  airAssist = false,
  originX = 0,
  originY = 0
}) {
  if (!(pixels instanceof Uint8Array) || pixels.length !== width * height) throw new Error("Invalid raster data.");
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) throw new Error("Invalid raster size.");
  if (!(stepMm >= 0.1 && stepMm <= 1)) throw new Error("Resolution must be 0.1\u20131 mm per pixel.");
  if (width * stepMm > bedMm + 1e-3 || height * stepMm > bedMm + 1e-3) throw new Error("Design exceeds the bed.");
  if (!(powerPercent > 0 && powerPercent <= 100)) throw new Error("Power must be between 1% and 100%.");
  if (!(speedMmMin >= 100 && speedMmMin <= 12e3)) throw new Error("Speed must be 100\u201312000 mm/min.");
  if (!Number.isInteger(passes) || passes < 1 || passes > 10) throw new Error("Passes must be 1\u201310.");
  if (!(sMax > 0 && sMax <= 1e5)) throw new Error("Enter the controller\u2019s verified $30 maximum S value.");
  if (![originX, originY].every(Number.isFinite)) throw new Error("Jig origin is unavailable.");
  const sValue = Math.max(1, Math.round(sMax * powerPercent / 100));
  const lines = [
    "; Laser Link raster job",
    `; ${fmt(width * stepMm)} x ${fmt(height * stepMm)} mm, ${fmt(stepMm)} mm/pixel`,
    `; Power ${fmt(powerPercent)}%, feed ${fmt(speedMmMin)} mm/min, ${passes} pass(es)`,
    "G21",
    "G90",
    "G54",
    "M5"
  ];
  let segments = 0;
  let blackPixels = 0;
  let minCol = width, maxCol = -1, minRow = height, maxRow = -1;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (!pixels[row * width + col]) continue;
      blackPixels++;
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
    }
  }
  if (!blackPixels) throw new Error("The workspace contains no dark pixels to engrave.");
  for (let pass = 0; pass < passes; pass++) {
    if (airAssist) lines.push("M8");
    lines.push("M4", `G1 F${fmt(speedMmMin)}`);
    for (let row = 0; row < height; row++) {
      const runs = [];
      let col = 0;
      while (col < width) {
        while (col < width && !pixels[row * width + col]) col++;
        if (col >= width) break;
        const start = col;
        while (col < width && pixels[row * width + col]) col++;
        runs.push([start, col]);
      }
      const y = fmt(originY + (height - row - 0.5) * stepMm);
      const reverse = row % 2 === 1;
      if (reverse) runs.reverse();
      for (const [start, end] of runs) {
        const x0 = fmt(originX + (reverse ? end : start) * stepMm);
        const x1 = fmt(originX + (reverse ? start : end) * stepMm);
        lines.push(`G0 X${x0} Y${y}`);
        lines.push(`G1 X${x1} Y${y} S${sValue}`);
        segments++;
      }
    }
    lines.push("M5");
    if (airAssist) lines.push("M9");
  }
  return { lines, segments, blackPixels, sValue, bounds: {
    minX: originX + minCol * stepMm,
    maxX: originX + (maxCol + 1) * stepMm,
    minY: originY + (height - maxRow - 1) * stepMm,
    maxY: originY + (height - minRow) * stepMm
  } };
}

// browser/vector-gcode.mjs
var fmt2 = (value) => Number(value.toFixed(3)).toString();
var OPERATIONS = ["score", "cutInner", "cutOuter"];
function validateSetting(name, setting) {
  if (!setting || typeof setting !== "object") throw new Error(`${name} settings are missing.`);
  if (!(setting.powerPercent > 0 && setting.powerPercent <= 100)) {
    throw new Error(`${name} power must be between 1% and 100%.`);
  }
  if (!(setting.speedMmMin >= 100 && setting.speedMmMin <= 12e3)) {
    throw new Error(`${name} speed must be 100\u201312000 mm/min.`);
  }
  if (!Number.isInteger(setting.passes) || setting.passes < 1 || setting.passes > 10) {
    throw new Error(`${name} passes must be 1\u201310.`);
  }
}
function validatePath(path) {
  if (!Array.isArray(path) || path.length < 2 || path.length > 1e5) {
    throw new Error("Every vector path must contain 2\u2013100000 points.");
  }
  for (const point of path) {
    if (!point || ![point.x, point.y].every(Number.isFinite)) {
      throw new Error("Vector path contains an invalid point.");
    }
  }
}
function pathBounds(paths) {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const path of paths) for (const point of path) {
    bounds.minX = Math.min(bounds.minX, point.x);
    bounds.minY = Math.min(bounds.minY, point.y);
    bounds.maxX = Math.max(bounds.maxX, point.x);
    bounds.maxY = Math.max(bounds.maxY, point.y);
  }
  return Number.isFinite(bounds.minX) ? bounds : null;
}
function vectorLayersToGcode({
  layers,
  settings,
  sMax,
  originX = 0,
  originY = 0,
  includePreamble = true
}) {
  if (!layers || typeof layers !== "object") throw new Error("Vector layers are missing.");
  if (!(sMax > 0 && sMax <= 1e5)) throw new Error("Enter the controller\u2019s verified $30 maximum S value.");
  if (![originX, originY].every(Number.isFinite)) throw new Error("Job origin is unavailable.");
  const present = OPERATIONS.filter((operation) => Array.isArray(layers[operation]) && layers[operation].length);
  if (!present.length) throw new Error("This layered SVG contains no score or cut paths.");
  for (const operation of present) {
    validateSetting(operation === "score" ? "Score" : "Cut", settings[operation === "score" ? "score" : "cut"]);
    for (const path of layers[operation]) validatePath(path);
  }
  const lines = includePreamble ? ["; Laser Link layered SVG vector job", "G21", "G90", "G54", "M5"] : ["; Laser Link layered SVG vector operations", "M5"];
  let segments = 0;
  let maxSValue = 0;
  const allPaths = [];
  const operationCounts = {};
  for (const operation of OPERATIONS) {
    const paths = layers[operation] || [];
    if (!paths.length) continue;
    const setting = settings[operation === "score" ? "score" : "cut"];
    const sValue = Math.max(1, Math.round(sMax * setting.powerPercent / 100));
    maxSValue = Math.max(maxSValue, sValue);
    operationCounts[operation] = paths.length;
    lines.push(`; ${operation}: ${fmt2(setting.powerPercent)}% at ${fmt2(setting.speedMmMin)} mm/min, ${setting.passes} pass(es)`);
    for (let pass = 0; pass < setting.passes; pass++) {
      if (setting.airAssist) lines.push("M8");
      for (const path of paths) {
        const shifted = path.map((point) => ({ x: point.x + originX, y: point.y + originY }));
        allPaths.push(shifted);
        const [start, ...rest] = shifted;
        lines.push("M5");
        lines.push(`G0 X${fmt2(start.x)} Y${fmt2(start.y)}`);
        lines.push(`M4 S${sValue}`);
        lines.push(`G1 F${fmt2(setting.speedMmMin)}`);
        for (const point of rest) {
          lines.push(`G1 X${fmt2(point.x)} Y${fmt2(point.y)}`);
          segments++;
        }
      }
      lines.push("M5");
      if (setting.airAssist) lines.push("M9");
    }
  }
  lines.push("M5");
  const bounds = pathBounds(allPaths);
  return { lines, segments, sValue: maxSValue, bounds, operationCounts };
}
function mergeLayeredJobs({ raster = null, vector = null }) {
  if (!raster && !vector) throw new Error("The layered SVG produced no engraving, score, or cut output.");
  const lines = [];
  if (raster) lines.push(...raster.lines);
  if (vector) lines.push(...vector.lines);
  const availableBounds = [raster?.bounds, vector?.bounds].filter(Boolean);
  const bounds = {
    minX: Math.min(...availableBounds.map((item) => item.minX)),
    minY: Math.min(...availableBounds.map((item) => item.minY)),
    maxX: Math.max(...availableBounds.map((item) => item.maxX)),
    maxY: Math.max(...availableBounds.map((item) => item.maxY))
  };
  return {
    lines,
    bounds,
    segments: (raster?.segments || 0) + (vector?.segments || 0),
    sValue: Math.max(raster?.sValue || 0, vector?.sValue || 0),
    operationCounts: vector?.operationCounts || {}
  };
}

// browser/geometry.mjs
function pointInRotatedRect(point, object) {
  const centerX = object.x + object.w / 2;
  const centerY = object.y + object.h / 2;
  const dx = point.x - centerX;
  const dy = point.y - centerY;
  const angle = (object.rotation || 0) * Math.PI / 180;
  const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
  const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);
  return Math.abs(localX) <= object.w / 2 && Math.abs(localY) <= object.h / 2;
}
var CORNER_SIGNS = {
  topLeft: [-1, 1],
  topRight: [1, 1],
  bottomRight: [1, -1],
  bottomLeft: [-1, -1]
};
function rotatedCorner(object, corner) {
  const signs = CORNER_SIGNS[corner];
  if (!signs) throw new Error("Unknown resize corner.");
  const [sx, sy] = signs;
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const centerX = object.x + object.w / 2, centerY = object.y + object.h / 2;
  return {
    x: centerX + sx * object.w / 2 * c - sy * object.h / 2 * s,
    y: centerY + sx * object.w / 2 * s + sy * object.h / 2 * c
  };
}
function rotatedBounds(object, margin = 0) {
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
  const width = (object.w + 2 * margin) * c + (object.h + 2 * margin) * s;
  const height = (object.w + 2 * margin) * s + (object.h + 2 * margin) * c;
  const centerX = object.x + object.w / 2, centerY = object.y + object.h / 2;
  return {
    minX: centerX - width / 2,
    minY: centerY - height / 2,
    maxX: centerX + width / 2,
    maxY: centerY + height / 2,
    width,
    height
  };
}
function moveRotatedBounds(object, x, y, bed = 300, margin = 0) {
  const bounds = rotatedBounds(object, margin);
  if (bounds.width > bed + 1e-3 || bounds.height > bed + 1e-3) {
    throw new Error("The rotated artwork is larger than the machine bed. Reduce its size.");
  }
  const nextX = Math.max(0, Math.min(x, bed - bounds.width));
  const nextY = Math.max(0, Math.min(y, bed - bounds.height));
  return { x: object.x + nextX - bounds.minX, y: object.y + nextY - bounds.minY };
}
function hitResizeCorner(point, object, radius) {
  if (!object || !Number.isFinite(radius) || radius <= 0) return null;
  return Object.keys(CORNER_SIGNS).find((corner) => {
    const handle = rotatedCorner(object, corner);
    return Math.hypot(point.x - handle.x, point.y - handle.y) <= radius;
  }) || null;
}
function resizeFromCorner(object, corner, pointer, bed = 300) {
  const signs = CORNER_SIGNS[corner];
  if (!signs || !Number.isFinite(pointer?.x) || !Number.isFinite(pointer?.y) || !Number.isFinite(bed) || bed <= 0 || object.w <= 0 || object.h <= 0) {
    throw new Error("Cannot resize this object.");
  }
  const [sx, sy] = signs;
  const opposite = Object.keys(CORNER_SIGNS).find((name) => CORNER_SIGNS[name][0] === -sx && CORNER_SIGNS[name][1] === -sy);
  const anchor = rotatedCorner(object, opposite);
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const dx = pointer.x - anchor.x, dy = pointer.y - anchor.y;
  const projectedW = sx * (dx * c + dy * s);
  const projectedH = sy * (-dx * s + dy * c);
  const desiredScale = (projectedW * object.w + projectedH * object.h) / (object.w ** 2 + object.h ** 2);
  const geometryAt = (scale2) => {
    const w = object.w * scale2, h = object.h * scale2;
    const centerX = anchor.x + (sx * w * c - sy * h * s) / 2;
    const centerY = anchor.y + (sx * w * s + sy * h * c) / 2;
    return { x: centerX - w / 2, y: centerY - h / 2, w, h };
  };
  const atOne = geometryAt(1);
  const candidates = Object.keys(CORNER_SIGNS).map((name) => rotatedCorner({ ...atOne, rotation: object.rotation }, name));
  let maxScale = Math.min(bed / object.w, bed / object.h);
  for (const candidate of candidates) {
    const vx = candidate.x - anchor.x, vy = candidate.y - anchor.y;
    if (vx > 0) maxScale = Math.min(maxScale, (bed - anchor.x) / vx);
    if (vx < 0) maxScale = Math.min(maxScale, -anchor.x / vx);
    if (vy > 0) maxScale = Math.min(maxScale, (bed - anchor.y) / vy);
    if (vy < 0) maxScale = Math.min(maxScale, -anchor.y / vy);
  }
  const minScale = Math.max(0.2 / object.w, 0.2 / object.h);
  const scale = Math.max(minScale, Math.min(desiredScale, maxScale));
  return geometryAt(scale);
}

// browser/project-store.mjs
var DATABASE = "laser-link-local-projects";
var STORE = "projects";
var connection;
function database() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("Browser project storage is unavailable."));
  if (!connection) {
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return connection;
}
async function saveLocalProject(record) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(record);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
async function listLocalProjects() {
  const db = await database();
  const records = await new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return records.sort((a, b) => b.updatedAt - a.updatedAt);
}
async function removeLocalProjects(ids) {
  const db = await database();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    for (const id of ids) transaction.objectStore(STORE).delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

// browser/alignment.mjs
var finite = (value) => Number.isFinite(value);
var round = (value) => Number(value.toFixed(3));
function transformContour(object, points) {
  if (!Array.isArray(points) || points.length < 2) throw new Error("A contour needs at least two points.");
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle), s = Math.sin(angle);
  const centerX = object.x + object.w / 2, centerY = object.y + object.h / 2;
  return points.map(([u, v]) => {
    if (![u, v].every(finite)) throw new Error("Contour contains an invalid point.");
    const x = (u - 0.5) * object.w * (object.flipX ? -1 : 1);
    const y = (0.5 - v) * object.h * (object.flipY ? -1 : 1);
    return { x: round(centerX + x * c - y * s), y: round(centerY + x * s + y * c) };
  });
}
function collectContourPaths(objects) {
  const paths = [];
  for (const object of objects) {
    if (object.type === "image" && (!Array.isArray(object.contours) || !object.contours.length)) {
      throw new Error(`${object.kind || "An image"} has no contour. Use an SVG with supported geometry or a text object.`);
    }
    if (object.type === "image" && object.kind !== "Text" && ((object.crop || []).some((value) => value !== 0) || object.mask && object.mask !== "rectangle" || object.filter && object.filter !== "original" || object.brightness && object.brightness !== 100 || object.contrast && object.contrast !== 100)) {
      throw new Error("An SVG has visual filters, cropping, or a mask. Reset them before exact contour tracing.");
    }
    const source = object.type === "path" ? [object.points.map(([x, y]) => [x / object.sourceW, y / object.sourceH])] : object.contours || [];
    for (const points of source) paths.push(transformContour(object, points));
  }
  if (!paths.length) throw new Error("This design has no retained vector contours. Import an SVG or add a freehand drawing.");
  if (paths.reduce((count, path) => count + path.length, 0) > 12e3) {
    throw new Error("Contour has too many points. Simplify the SVG before tracing.");
  }
  return paths;
}
function translateBounds(bounds, offset) {
  if (!bounds || !offset || ![bounds.minX, bounds.minY, bounds.maxX, bounds.maxY, offset.x, offset.y].every(finite)) {
    throw new Error("Frame bounds are unavailable.");
  }
  return {
    minX: round(bounds.minX + offset.x),
    minY: round(bounds.minY + offset.y),
    maxX: round(bounds.maxX + offset.x),
    maxY: round(bounds.maxY + offset.y)
  };
}
function assertMachineBounds(bounds, wco, limits, pocket = null) {
  if (!wco || !limits || ![wco.x, wco.y, limits.x, limits.y].every(finite) || limits.x <= 0 || limits.y <= 0) throw new Error("Machine offset or travel limits are unavailable.");
  const machine = translateBounds(bounds, wco);
  if (machine.minX < -1e-3 || machine.minY < -1e-3 || machine.maxX > limits.x + 1e-3 || machine.maxY > limits.y + 1e-3) {
    throw new Error("The path exceeds the verified machine travel limits.");
  }
  if (pocket && (machine.minX < pocket.origin_x - 1e-3 || machine.minY < pocket.origin_y - 1e-3 || machine.maxX > pocket.origin_x + pocket.max_width + 1e-3 || machine.maxY > pocket.origin_y + pocket.max_height + 1e-3)) {
    throw new Error("The path extends outside the active jig pocket.");
  }
  return machine;
}

// browser/contour-trace.mjs
function traceBinaryContours(pixels, width, height, maxPoints = 12e3) {
  if (!(pixels instanceof Uint8Array) || pixels.length !== width * height || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error("Invalid text raster for contour tracing.");
  }
  const dark = (x, y) => x >= 0 && x < width && y >= 0 && y < height && pixels[y * width + x] !== 0;
  const edges = /* @__PURE__ */ new Map();
  const key = (x, y) => `${x},${y}`;
  const edge = (x0, y0, x1, y1) => {
    const start = key(x0, y0);
    if (!edges.has(start)) edges.set(start, []);
    edges.get(start).push([x1, y1]);
  };
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!dark(x, y)) continue;
    if (!dark(x, y - 1)) edge(x, y, x + 1, y);
    if (!dark(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
    if (!dark(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
    if (!dark(x - 1, y)) edge(x, y + 1, x, y);
  }
  const paths = [];
  let pointsTotal = 0;
  while (edges.size) {
    const first = edges.keys().next().value;
    const [sx, sy] = first.split(",").map(Number);
    const path = [[sx, sy]];
    let x = sx, y = sy;
    do {
      const at = key(x, y), choices = edges.get(at);
      if (!choices?.length) throw new Error("Text outline could not be closed.");
      const [nextX, nextY] = choices.pop();
      if (!choices.length) edges.delete(at);
      x = nextX;
      y = nextY;
      path.push([x, y]);
    } while (x !== sx || y !== sy);
    const simplified = [];
    for (let i = 0; i < path.length - 1; i++) {
      const prev = path[(i - 1 + path.length - 1) % (path.length - 1)];
      const now = path[i], next = path[i + 1];
      if ((now[0] - prev[0]) * (next[1] - now[1]) !== (now[1] - prev[1]) * (next[0] - now[0])) simplified.push(now);
    }
    if (simplified.length < 3) continue;
    simplified.push(simplified[0]);
    pointsTotal += simplified.length;
    if (pointsTotal > maxPoints) throw new Error("Text outline is too detailed. Use larger text or simplify the design.");
    paths.push(simplified.map(([px, py]) => [px / width, py / height]));
  }
  return paths;
}

// browser/svg-contours.mjs
function extractSvgContours(svg, width, height) {
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none";
  const attached = document.importNode(svg, true);
  attached.setAttribute("width", String(width));
  attached.setAttribute("height", String(height));
  holder.append(attached);
  document.body.append(holder);
  const contours = [];
  let skipped = 0, total = 0;
  try {
    skipped += attached.querySelectorAll("text,image,use,foreignObject").length;
    for (const shape of attached.querySelectorAll("path,line,polyline,polygon,rect,circle,ellipse")) {
      if (getComputedStyle(shape).display === "none" || getComputedStyle(shape).visibility === "hidden") continue;
      if (shape.localName === "path" && (shape.getAttribute("d")?.match(/[Mm]/g)?.length || 0) > 1) {
        skipped++;
        continue;
      }
      let length;
      try {
        length = shape.getTotalLength();
      } catch {
        skipped++;
        continue;
      }
      const matrix = shape.getCTM();
      if (!matrix || !Number.isFinite(length) || length < 0.01) {
        skipped++;
        continue;
      }
      const steps = Math.min(2e3, Math.max(2, Math.ceil(length / 2)));
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const point = shape.getPointAtLength(length * i / steps);
        const x = (point.x * matrix.a + point.y * matrix.c + matrix.e) / width;
        const y = (point.x * matrix.b + point.y * matrix.d + matrix.f) / height;
        if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Invalid SVG contour coordinates.");
        points.push([x, y]);
      }
      total += points.length;
      if (total > 12e3) throw new Error("SVG has too many contour nodes. Simplify the paths first.");
      contours.push(points);
    }
  } finally {
    holder.remove();
  }
  return { contours, skipped };
}
var CUT_LAYER_IDS = ["engrave", "score", "cut-inner", "cut-outer", "labels-do-not-cut"];
var DRAWABLE_SELECTOR = "path,line,polyline,polygon,rect,circle,ellipse";
function hasLayeredCutGroups(svg) {
  if (!svg?.querySelector) return false;
  return ["score", "cut-inner", "cut-outer"].some((id) => svg.querySelector(`[id="${id}"]`));
}
function sampleShape(shape, width, height, maxSegmentMm = 0.4) {
  if (shape.localName === "path" && (shape.getAttribute("d")?.match(/[Mm]/g)?.length || 0) > 1) {
    throw new Error("A score or cut path contains multiple disconnected subpaths. Split it into separate paths before cutting.");
  }
  let length;
  try {
    length = shape.getTotalLength();
  } catch {
    return null;
  }
  const matrix = shape.getCTM();
  if (!matrix || !Number.isFinite(length) || length < 0.01) return null;
  const steps = Math.max(1, Math.ceil(length / maxSegmentMm));
  if (steps > 5e4) throw new Error("A single SVG path is too complex to cut safely.");
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const point = shape.getPointAtLength(length * i / steps);
    const x = (point.x * matrix.a + point.y * matrix.c + matrix.e) / width;
    const y = (point.x * matrix.b + point.y * matrix.d + matrix.f) / height;
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error("Invalid SVG cut coordinates.");
    const previous = points.at(-1);
    if (!previous || Math.hypot(x - previous[0], y - previous[1]) * Math.max(width, height) > 1e-3) {
      points.push([x, y]);
    }
  }
  return points.length >= 2 ? points : null;
}
function extractLayeredCutSvg(svg, width, height) {
  if (!hasLayeredCutGroups(svg)) return null;
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-100000px;top:0;opacity:0;pointer-events:none";
  const attached = document.importNode(svg, true);
  attached.setAttribute("width", String(width));
  attached.setAttribute("height", String(height));
  holder.append(attached);
  document.body.append(holder);
  const result = { score: [], cutInner: [], cutOuter: [], counts: {}, skipped: 0 };
  let total = 0;
  try {
    const mapping = [["score", "score"], ["cut-inner", "cutInner"], ["cut-outer", "cutOuter"]];
    result.counts.engrave = attached.querySelectorAll("#engrave path, #engrave line, #engrave polyline, #engrave polygon, #engrave rect, #engrave circle, #engrave ellipse").length;
    result.counts.labels = attached.querySelectorAll("#labels-do-not-cut path, #labels-do-not-cut text").length;
    for (const [id, operation] of mapping) {
      const group = attached.querySelector(`[id="${id}"]`);
      if (!group) {
        result.counts[operation] = 0;
        continue;
      }
      if (group.querySelector("text,image,use,foreignObject")) {
        throw new Error(`The ${id} layer contains unsupported text, image, or referenced content. Convert it to plain vector paths first.`);
      }
      for (const shape of group.querySelectorAll(DRAWABLE_SELECTOR)) {
        if (getComputedStyle(shape).display === "none" || getComputedStyle(shape).visibility === "hidden") continue;
        const points = sampleShape(shape, width, height);
        if (!points) throw new Error(`The ${id} layer contains a vector path that could not be extracted.`);
        total += points.length;
        if (total > 25e4) throw new Error("SVG has too many cut nodes. Split or simplify the sheet first.");
        result[operation].push(points);
      }
      result.counts[operation] = result[operation].length;
    }
  } finally {
    holder.remove();
  }
  if (!result.cutInner.length && !result.cutOuter.length && !result.score.length) {
    throw new Error("Layered SVG groups were found, but they contain no supported vector paths.");
  }
  return result;
}
function svgLayerMarkup(svg, layerId) {
  if (!CUT_LAYER_IDS.includes(layerId)) throw new Error("Unknown SVG operation layer.");
  const clone = svg.cloneNode(true);
  for (const shape of clone.querySelectorAll(`${DRAWABLE_SELECTOR},text,image,use`)) {
    if (!shape.closest(`[id="${layerId}"]`)) shape.remove();
  }
  return new XMLSerializer().serializeToString(clone);
}

// browser/editor-src.mjs
var $ = (id) => document.getElementById(id);
var BED = 300;
var canvas = $("editorCanvas");
var rulerX = $("bedRulerX");
var rulerY = $("bedRulerY");
var ctx = canvas.getContext("2d", { willReadFrequently: true });
var imageCache = /* @__PURE__ */ new Map();
var engraveImageCache = /* @__PURE__ */ new Map();
var processedCache = /* @__PURE__ */ new Map();
var project = { objects: [], selectedId: null, material: "Unspecified", materialNote: "" };
var history = [];
var historyIndex = -1;
var drawMode = false;
var pointerAction = null;
var framePreview = false;
var machineSettings = null;
var renderQueued = false;
var rulerStep = 0;
var autosaveTimer = null;
var saveQueue = Promise.resolve();
var selectingProjects = false;
var preparedFingerprint = null;
var objectListSignature = "";
var settingsReturnFocus = null;
var activeAlignment = { jig: null, origin: { x: 0, y: 0 }, measurement: null, outline: null };
var selectedProjectIds = /* @__PURE__ */ new Set();
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
var selected = () => project.objects.find((object) => object.id === project.selectedId);
var hint = (message) => {
  $("editorHint").textContent = message;
};
function snapshot() {
  return JSON.stringify(project);
}
function jobFingerprint(parameters = project.parameters) {
  const current = parameters || {};
  return JSON.stringify({
    objects: project.objects,
    jobName: current.jobName,
    power: current.power,
    speed: current.speed,
    passes: current.passes,
    airAssist: current.airAssist,
    sMax: current.sMax,
    resolution: current.resolution,
    vector: current.vector
  });
}
function invalidatePreparedJob(parameters = project.parameters) {
  if (!preparedFingerprint || preparedFingerprint === jobFingerprint(parameters)) return;
  preparedFingerprint = null;
  window.dispatchEvent(new CustomEvent("laserlink:job-invalidated"));
}
function commit() {
  invalidatePreparedJob();
  window.dispatchEvent(new Event("laserlink:design-changed"));
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot());
  if (history.length > 30) history.shift();
  historyIndex = history.length - 1;
  $("undoEdit").disabled = historyIndex <= 0;
  $("redoEdit").disabled = historyIndex >= history.length - 1;
  scheduleAutosave();
}
function restore(index) {
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  project = JSON.parse(history[index]);
  invalidatePreparedJob();
  window.dispatchEvent(new Event("laserlink:design-changed"));
  processedCache.clear();
  engraveImageCache.clear();
  $("materialSelect").value = project.material || "Unspecified";
  $("materialNote").value = project.materialNote || "";
  syncSelection();
  render();
  $("undoEdit").disabled = historyIndex <= 0;
  $("redoEdit").disabled = historyIndex >= history.length - 1;
  scheduleAutosave();
}
async function ensureImage(object) {
  if (!object?.dataUrl) return null;
  if (imageCache.has(object.id)) return imageCache.get(object.id);
  return cacheImage(object);
}
async function ensureEngraveImage(object) {
  if (!object?.engraveDataUrl) return null;
  if (engraveImageCache.has(object.id)) return engraveImageCache.get(object.id);
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.onload = () => {
      promise.image = image;
      resolve(image);
    };
    image.onerror = () => reject(new Error("The engraving layer could not be decoded."));
  });
  engraveImageCache.set(object.id, promise);
  image.src = object.engraveDataUrl;
  return promise;
}
function svgLengthMm(value) {
  const match = String(value || "").trim().match(/^([0-9]*\.?[0-9]+)\s*(mm|cm|in|px|pt)?$/i);
  if (!match) return null;
  const number = Number(match[1]);
  const unit = (match[2] || "px").toLowerCase();
  const scale = { mm: 1, cm: 10, in: 25.4, px: 25.4 / 96, pt: 25.4 / 72 }[unit];
  return number * scale;
}
function svgPhysicalSize(root) {
  const width = svgLengthMm(root.getAttribute("width"));
  const height = svgLengthMm(root.getAttribute("height"));
  if (!width || !height) throw new Error("A layered cut SVG needs explicit physical width and height, preferably in millimetres.");
  if (width > BED + 1e-3 || height > BED + 1e-3) throw new Error("The layered SVG is larger than the 300 \xD7 300 mm bed.");
  return { width, height };
}
async function rasterizeSvgMarkup(markup, targetWidth, targetHeight) {
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas2 = document.createElement("canvas");
    const scale = Math.min(1, 1600 / Math.max(targetWidth, targetHeight));
    canvas2.width = Math.max(1, Math.round(targetWidth * scale));
    canvas2.height = Math.max(1, Math.round(targetHeight * scale));
    const context = canvas2.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas2.width, canvas2.height);
    context.drawImage(image, 0, 0, canvas2.width, canvas2.height);
    return canvas2.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}
function maskPath(context, shape, w, h) {
  context.beginPath();
  if (shape === "circle") {
    context.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (shape === "triangle") {
    context.moveTo(0, -h / 2);
    context.lineTo(w / 2, h / 2);
    context.lineTo(-w / 2, h / 2);
  } else if (shape === "star") {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5;
      const radius = i % 2 ? 0.23 : 0.5;
      const x = Math.cos(a) * w * radius, y = Math.sin(a) * h * radius;
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
  } else if (shape === "heart") {
    context.moveTo(0, h * 0.43);
    context.bezierCurveTo(-w * 0.68, h * 0.05, -w * 0.47, -h * 0.48, 0, -h * 0.2);
    context.bezierCurveTo(w * 0.47, -h * 0.48, w * 0.68, h * 0.05, 0, h * 0.43);
  } else {
    context.rect(-w / 2, -h / 2, w, h);
  }
  context.closePath();
}
function processedImage(object, image) {
  const key = `${object.id}:${object.filter}:${object.brightness}:${object.contrast}:${JSON.stringify(object.crop)}`;
  if (processedCache.has(key)) return processedCache.get(key);
  const crop = object.crop || [0, 0, 0, 0];
  const sx = image.width * crop[0] / 100, sy = image.height * crop[1] / 100;
  const sw = Math.max(1, image.width * (100 - crop[0] - crop[2]) / 100);
  const sh = Math.max(1, image.height * (100 - crop[1] - crop[3]) / 100);
  const scale = Math.min(1, 1200 / Math.max(sw, sh));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * scale));
  out.height = Math.max(1, Math.round(sh * scale));
  const context = out.getContext("2d", { willReadFrequently: true });
  if (object.kind !== "Text") {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, out.width, out.height);
  }
  context.drawImage(image, sx, sy, sw, sh, 0, 0, out.width, out.height);
  const imageData = context.getImageData(0, 0, out.width, out.height);
  const data = imageData.data;
  const gray = new Float32Array(out.width * out.height);
  const brightness = (object.brightness || 100) / 100;
  const contrast = (object.contrast || 100) / 100;
  for (let i = 0; i < gray.length; i++) {
    const offset = i * 4;
    const r = clamp((data[offset] - 128) * contrast + 128, 0, 255) * brightness;
    const g = clamp((data[offset + 1] - 128) * contrast + 128, 0, 255) * brightness;
    const b = clamp((data[offset + 2] - 128) * contrast + 128, 0, 255) * brightness;
    gray[i] = data[offset + 3] === 0 ? 255 : clamp(0.2126 * r + 0.7152 * g + 0.0722 * b, 0, 255);
    if (object.filter === "original") {
      data[offset] = clamp(r, 0, 255);
      data[offset + 1] = clamp(g, 0, 255);
      data[offset + 2] = clamp(b, 0, 255);
    }
  }
  if (object.filter === "dither") {
    for (let y = 0; y < out.height; y++) {
      for (let x = 0; x < out.width; x++) {
        const i = y * out.width + x;
        const old = gray[i], next = old < 128 ? 0 : 255, error = old - next;
        gray[i] = next;
        if (x + 1 < out.width) gray[i + 1] += error * 7 / 16;
        if (y + 1 < out.height) {
          if (x > 0) gray[i + out.width - 1] += error * 3 / 16;
          gray[i + out.width] += error * 5 / 16;
          if (x + 1 < out.width) gray[i + out.width + 1] += error / 16;
        }
      }
    }
  }
  if (object.filter !== "original") {
    for (let i = 0; i < gray.length; i++) {
      let value = gray[i];
      if (object.filter === "strong") value = value < 145 ? 0 : 255;
      if (object.filter === "sketch") {
        const x = i % out.width, y = Math.floor(i / out.width);
        const edge = Math.abs(value - gray[y * out.width + Math.min(out.width - 1, x + 1)]) + Math.abs(value - gray[Math.min(out.height - 1, y + 1) * out.width + x]);
        value = edge > 35 ? 0 : 255;
      }
      const offset = i * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = clamp(value, 0, 255);
    }
  }
  context.putImageData(imageData, 0, 0);
  processedCache.set(key, out);
  return out;
}
function drawScene(context, size, { grid = false, selection = false } = {}) {
  const scale = size / BED;
  context.clearRect(0, 0, size, size);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, size, size);
  if (grid) {
    const displaySize = canvas.getBoundingClientRect().width || size;
    const pixelRatio = size / displaySize;
    context.save();
    for (let mm = 0; mm <= BED; mm += 10) {
      const major = mm % 100 === 0;
      const middle = mm % 50 === 0;
      context.strokeStyle = major ? "#9ca9a4" : middle ? "#c9d3ce" : "#e7ece9";
      context.lineWidth = (major ? 1.1 : middle ? 0.8 : 0.5) * pixelRatio;
      const p = mm === 0 ? context.lineWidth / 2 : mm === BED ? size - context.lineWidth / 2 : mm * scale;
      context.beginPath();
      context.moveTo(p, 0);
      context.lineTo(p, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, p);
      context.lineTo(size, p);
      context.stroke();
    }
    context.restore();
  }
  const capturedOutline = grid ? activeAlignment.outline : null;
  if (capturedOutline?.closed && capturedOutline.points.length >= 3) {
    context.save();
    context.beginPath();
    capturedOutline.points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x * scale, (BED - point.y) * scale);
      else context.lineTo(point.x * scale, (BED - point.y) * scale);
    });
    context.closePath();
    context.fillStyle = "rgba(123, 65, 194, 0.13)";
    context.fill();
    context.restore();
  }
  for (const object of project.objects) {
    const centerX = (object.x + object.w / 2) * scale;
    const centerY = (BED - object.y - object.h / 2) * scale;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(-(object.rotation || 0) * Math.PI / 180);
    context.scale(object.flipX ? -1 : 1, object.flipY ? -1 : 1);
    if (object.type === "path") {
      context.beginPath();
      for (const [index, point] of object.points.entries()) {
        const x = (point[0] / object.sourceW - 0.5) * object.w * scale;
        const y = (point[1] / object.sourceH - 0.5) * object.h * scale;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = "#000";
      context.lineWidth = Math.max(1, (object.stroke || 1) * scale);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
    } else {
      const imagePromise = imageCache.get(object.id);
      const image = imagePromise?.image;
      if (image?.complete && image.naturalWidth) {
        maskPath(context, object.mask || "rectangle", object.w * scale, object.h * scale);
        context.clip();
        const processed = processedImage(object, image);
        context.drawImage(processed, -object.w * scale / 2, -object.h * scale / 2, object.w * scale, object.h * scale);
      } else if (object.dataUrl) ensureImage(object).catch((error) => hint(error.message));
    }
    context.restore();
  }
  if (grid) {
    const middle = size / 2;
    context.save();
    context.setLineDash([Math.max(7, scale * 3), Math.max(5, scale * 2)]);
    context.strokeStyle = "rgba(16, 113, 83, 0.85)";
    context.lineWidth = Math.max(1.5, scale * 0.55);
    context.beginPath();
    context.moveTo(middle, 0);
    context.lineTo(middle, size);
    context.moveTo(0, middle);
    context.lineTo(size, middle);
    context.stroke();
    context.setLineDash([]);
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(middle, middle, Math.max(6, scale * 2.5), 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#107153";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#107153";
    context.beginPath();
    context.arc(middle, middle, Math.max(2.5, scale), 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  if (selection) {
    if (capturedOutline?.points.length) {
      context.save();
      context.beginPath();
      capturedOutline.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x * scale, (BED - point.y) * scale);
        else context.lineTo(point.x * scale, (BED - point.y) * scale);
      });
      if (capturedOutline.closed) context.closePath();
      context.setLineDash(capturedOutline.closed ? [] : [7, 4]);
      context.strokeStyle = "#7b41c2";
      context.lineWidth = 3;
      context.stroke();
      context.setLineDash([]);
      for (const [index, point] of capturedOutline.points.entries()) {
        context.beginPath();
        context.arc(point.x * scale, (BED - point.y) * scale, 4, 0, Math.PI * 2);
        context.fillStyle = index === 0 ? "#e9498b" : "#7b41c2";
        context.fill();
        context.strokeStyle = "#fff";
        context.lineWidth = 1;
        context.stroke();
      }
      context.restore();
    }
    if (activeAlignment.jig) {
      context.save();
      context.setLineDash([9, 5]);
      context.strokeStyle = "#4270c8";
      context.lineWidth = 2;
      context.strokeRect(
        0,
        (BED - activeAlignment.jig.max_height) * scale,
        activeAlignment.jig.max_width * scale,
        activeAlignment.jig.max_height * scale
      );
      context.restore();
    }
    if (activeAlignment.measurement) {
      const b = activeAlignment.measurement;
      context.save();
      context.setLineDash([6, 4]);
      context.strokeStyle = "#d56932";
      context.lineWidth = 3;
      context.strokeRect(
        b.minX * scale,
        (BED - b.maxY) * scale,
        (b.maxX - b.minX) * scale,
        (b.maxY - b.minY) * scale
      );
      context.restore();
    }
    if (pointerAction?.type === "draw") {
      context.beginPath();
      pointerAction.points.forEach((point, index) => {
        const x = point.x * scale, y = (BED - point.y) * scale;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = "#121719";
      context.lineWidth = Math.max(1, Number($("drawWidth").value || 1) * scale);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
    }
    const object = selected();
    if (object) {
      const centerX = (object.x + object.w / 2) * scale;
      const centerY = (BED - object.y - object.h / 2) * scale;
      context.save();
      context.translate(centerX, centerY);
      context.rotate(-(object.rotation || 0) * Math.PI / 180);
      context.strokeStyle = "#30ad77";
      context.lineWidth = 2;
      context.strokeRect(-object.w * scale / 2, -object.h * scale / 2, object.w * scale, object.h * scale);
      for (const x of [-object.w * scale / 2, object.w * scale / 2]) {
        for (const y of [-object.h * scale / 2, object.h * scale / 2]) {
          context.fillStyle = "#fff";
          context.beginPath();
          context.arc(x, y, 8, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        }
      }
      context.restore();
    }
    if (framePreview) {
      const bounds = objectBounds();
      if (bounds) {
        context.save();
        context.setLineDash([8, 5]);
        context.strokeStyle = "#e98155";
        context.lineWidth = 3;
        context.strokeRect(
          bounds.minX * scale,
          (BED - bounds.maxY) * scale,
          (bounds.maxX - bounds.minX) * scale,
          (bounds.maxY - bounds.minY) * scale
        );
        context.restore();
      }
    }
  }
}
function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    drawScene(ctx, canvas.width, { grid: true, selection: true });
  });
}
function updateRulers(displayWidth) {
  const step = displayWidth >= 580 ? 10 : displayWidth >= 360 ? 20 : 50;
  const hideNextToEnd = step * displayWidth / BED < 36;
  if (rulerStep === `${step}:${hideNextToEnd}`) return;
  rulerStep = `${step}:${hideNextToEnd}`;
  const xLabels = [], yLabels = [];
  for (let mm = 0; mm <= BED; mm += step) {
    if (!(hideNextToEnd && mm === BED - step)) {
      const xLabel = document.createElement("span");
      xLabel.className = `ruler-label${mm % 100 === 0 ? " major" : ""}`;
      xLabel.textContent = String(mm);
      xLabel.style.left = `${mm / BED * 100}%`;
      xLabels.push(xLabel);
    }
    const yLabel = document.createElement("span");
    yLabel.className = `ruler-label${mm % 100 === 0 ? " major" : ""}`;
    yLabel.textContent = String(mm);
    yLabel.style.top = `${(BED - mm) / BED * 100}%`;
    yLabels.push(yLabel);
  }
  rulerX.replaceChildren(...xLabels);
  rulerY.replaceChildren(...yLabels);
}
function fitCanvasResolution() {
  const displayWidth = canvas.getBoundingClientRect().width;
  if (!displayWidth) return;
  updateRulers(displayWidth);
  const target = Math.max(900, Math.min(2e3, Math.round(displayWidth * (window.devicePixelRatio || 1))));
  if (canvas.width !== target) canvas.width = canvas.height = target;
  render();
}
function cacheImage(object) {
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.onload = () => {
      promise.image = image;
      render();
      resolve(image);
    };
    image.onerror = () => reject(new Error("Image could not be decoded."));
  });
  imageCache.set(object.id, promise);
  image.src = object.dataUrl;
  return promise;
}
function projectCard(record, selectable) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "project-card";
  button.setAttribute("aria-pressed", String(selectable && selectingProjects && selectedProjectIds.has(record.id)));
  const thumb = document.createElement("div");
  thumb.className = "project-thumb";
  if (record.thumb) {
    const image = document.createElement("img");
    image.src = record.thumb;
    image.alt = "";
    thumb.append(image);
  } else {
    const empty = document.createElement("span");
    empty.textContent = "No preview";
    thumb.append(empty);
  }
  const meta = document.createElement("div");
  meta.className = "project-card-meta";
  const title = document.createElement("strong");
  title.textContent = record.title || "Untitled project";
  const sub = document.createElement("small");
  const count = record.objectCount || 0;
  sub.textContent = `${count} ${count === 1 ? "object" : "objects"} \xB7 ${new Date(record.updatedAt).toLocaleDateString()}`;
  meta.append(title, sub);
  button.append(thumb, meta);
  if (selectable && selectingProjects) {
    const check = document.createElement("span");
    check.className = "project-check";
    check.textContent = selectedProjectIds.has(record.id) ? "\u2713" : "\u25CB";
    button.append(check);
  }
  button.addEventListener("click", () => {
    if (selectable && selectingProjects) {
      if (selectedProjectIds.has(record.id)) selectedProjectIds.delete(record.id);
      else selectedProjectIds.add(record.id);
      renderProjects();
    } else {
      try {
        acceptProject(record.data, record.title || "project");
      } catch (error) {
        $("projectsStatus").textContent = `Could not open project: ${error.message}`;
        return;
      }
      window.dispatchEvent(new Event("laserlink:show-create"));
    }
  });
  return button;
}
async function renderProjects() {
  try {
    const records = await listLocalProjects();
    const recent = $("recentProjectsGrid"), grid = $("projectsGrid");
    recent.replaceChildren();
    grid.replaceChildren();
    if (!records.length) {
      const message = document.createElement("p");
      message.textContent = "No recent projects yet. Add artwork to save one in this browser.";
      recent.append(message);
      const empty = document.createElement("p");
      empty.textContent = "No saved projects yet. Create a design to start your local gallery.";
      grid.append(empty);
    } else {
      for (const record of records.slice(0, 4)) recent.append(projectCard(record, false));
      for (const record of records) grid.append(projectCard(record, true));
    }
    $("deleteProjects").hidden = !selectingProjects;
    $("deleteProjects").disabled = !selectedProjectIds.size;
    $("selectProjects").textContent = selectingProjects ? "Cancel selection" : "Select";
  } catch (error) {
    $("projectsStatus").textContent = `Project gallery unavailable: ${error.message}`;
  }
}
function scheduleAutosave() {
  if (!project.objects.length && history.length <= 1) return;
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveQueue = saveQueue.then(async () => {
      const id = project.id;
      await Promise.all(project.objects.filter((object) => object.type === "image").map(ensureImage));
      if (project.id !== id) return;
      const thumbnail = document.createElement("canvas");
      thumbnail.width = thumbnail.height = 300;
      drawScene(thumbnail.getContext("2d"), 300);
      const data = JSON.parse(snapshot());
      await saveLocalProject({
        id,
        title: data.parameters?.jobName?.replace(/\.nc$/i, "") || "Untitled project",
        objectCount: data.objects.length,
        updatedAt: Date.now(),
        thumb: thumbnail.toDataURL("image/jpeg", 0.75),
        data
      });
      await renderProjects();
    }).catch((error) => {
      $("projectsStatus").textContent = `Autosave unavailable: ${error.message}`;
    });
  }, 400);
}
function addObject(object) {
  project.objects.push(object);
  project.selectedId = object.id;
  framePreview = false;
  if (object.dataUrl) cacheImage(object).catch((error) => hint(error.message));
  syncSelection();
  commit();
  render();
}
function objectBounds() {
  if (!project.objects.length) return null;
  return project.objects.reduce((result, object) => {
    const margin = object.type === "path" ? (object.stroke || 1) / 2 : 0;
    const bounds = rotatedBounds(object, margin);
    result.minX = Math.min(result.minX, bounds.minX);
    result.maxX = Math.max(result.maxX, bounds.maxX);
    result.minY = Math.min(result.minY, bounds.minY);
    result.maxY = Math.max(result.maxY, bounds.maxY);
    return result;
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
}
function renderObjectList() {
  const signature = JSON.stringify([project.selectedId, project.objects.map((object) => [object.id, object.kind, object.x, object.y, object.w, object.h])]);
  if (signature === objectListSignature) return;
  objectListSignature = signature;
  const list = $("objectList");
  list.replaceChildren();
  if (!project.objects.length) {
    const empty = document.createElement("p");
    empty.textContent = "No objects yet.";
    list.append(empty);
    return;
  }
  project.objects.forEach((object, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(object.id === project.selectedId));
    option.innerHTML = `<span>${index + 1}</span><strong></strong><small></small>`;
    option.querySelector("strong").textContent = object.kind || "Artwork";
    option.querySelector("small").textContent = `X ${object.x.toFixed(1)} \xB7 Y ${object.y.toFixed(1)} mm`;
    option.addEventListener("click", () => {
      project.selectedId = object.id;
      syncSelection();
      render();
      hint(`${object.kind || "Artwork"} selected. Use the position fields or focus the canvas and use arrow keys.`);
    });
    list.append(option);
  });
}
function syncSelection() {
  const object = selected();
  const margin = object?.type === "path" ? (object.stroke || 1) / 2 : 0;
  const bounds = object ? rotatedBounds(object, margin) : null;
  $("selectedSummary").textContent = object ? `${object.kind || "Artwork"} \xB7 ${object.w.toFixed(1)} \xD7 ${object.h.toFixed(1)} mm artwork` + (object.rotation ? ` \xB7 occupies ${bounds.width.toFixed(1)} \xD7 ${bounds.height.toFixed(1)} mm` : "") + (object.lockedCutFile ? " \xB7 physical size locked" : "") : "Select an object on the grid to position it.";
  for (const [id, key] of [["objectX", "x"], ["objectY", "y"], ["objectW", "w"], ["objectH", "h"], ["objectRotation", "rotation"]]) {
    $(id).disabled = !object || Boolean(object.lockedCutFile);
    const value = key === "x" ? bounds?.minX : key === "y" ? bounds?.minY : object?.[key];
    $(id).value = object ? (Math.abs(value || 0) < 0.05 ? 0 : value).toFixed(key === "rotation" ? 0 : 1) : "";
  }
  for (const id of ["flipHorizontal", "flipVertical"]) $(id).disabled = !object || Boolean(object.lockedCutFile);
  $("deleteObject").disabled = !object;
  if (object?.type === "image") {
    $("brightnessInput").value = object.brightness || 100;
    $("contrastInput").value = object.contrast || 100;
    $("brightnessValue").value = `${$("brightnessInput").value}%`;
    $("contrastValue").value = `${$("contrastInput").value}%`;
    $("maskShape").value = object.mask || "rectangle";
    for (const [i, id] of ["cropLeft", "cropTop", "cropRight", "cropBottom"].entries()) $(id).value = object.crop?.[i] || 0;
    document.querySelectorAll("[data-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === (object.filter || "original"))));
    for (const id of ["brightnessInput", "contrastInput", "maskShape", "cropLeft", "cropTop", "cropRight", "cropBottom"]) {
      $(id).disabled = Boolean(object.lockedCutFile);
    }
    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.disabled = Boolean(object.lockedCutFile);
    });
  }
  renderObjectList();
}
async function addPictureFile(file) {
  if (!file) return;
  const svg = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
  const supported = svg || ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type);
  if (!supported || file.size > 12 * 1024 * 1024) {
    hint("Choose an SVG, PNG, JPEG, WebP, or GIF under 12 MB.");
    return;
  }
  try {
    let svgBlob = file, svgRoot = null, layeredCut = false, svgCoordinateWidth = null, svgCoordinateHeight = null;
    if (svg) {
      const source = await file.text();
      const parsed = new DOMParser().parseFromString(source, "image/svg+xml");
      if (parsed.querySelector("parsererror") || parsed.documentElement.localName !== "svg" || /<!DOCTYPE|<script\b|<foreignObject\b|\bon[a-z]+\s*=|\b(?:href|xlink:href)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(source)) {
        throw new Error("SVG contains unsupported active or external content. Export it as a plain SVG or PNG.");
      }
      const root = parsed.documentElement;
      svgRoot = root;
      layeredCut = hasLayeredCutGroups(root);
      if (layeredCut && project.objects.length) {
        throw new Error("Start a new project before importing a layered cut SVG. Cut sheets cannot be mixed with other artwork.");
      }
      const viewBox = root.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
      if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
        svgCoordinateWidth = viewBox[2];
        svgCoordinateHeight = viewBox[3];
      }
      if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0 && (!root.hasAttribute("width") || !root.hasAttribute("height") || root.getAttribute("width").includes("%") || root.getAttribute("height").includes("%"))) {
        root.setAttribute("width", String(viewBox[2]));
        root.setAttribute("height", String(viewBox[3]));
      }
      svgBlob = new Blob([new XMLSerializer().serializeToString(root)], { type: "image/svg+xml" });
    }
    let bitmap;
    if (svg) {
      const url = URL.createObjectURL(svgBlob);
      try {
        const image = new Image();
        image.src = url;
        await image.decode();
        bitmap = image;
      } finally {
        URL.revokeObjectURL(url);
      }
    } else bitmap = await createImageBitmap(file);
    const sourceWidth = bitmap.width || bitmap.naturalWidth;
    const sourceHeight = bitmap.height || bitmap.naturalHeight;
    if (!sourceWidth || !sourceHeight || Math.max(sourceWidth, sourceHeight) > 2e4) {
      bitmap.close?.();
      throw new Error("Image dimensions are missing or too large.");
    }
    const scale = Math.min(1, 1600 / Math.max(sourceWidth, sourceHeight));
    const asset = document.createElement("canvas");
    asset.width = Math.max(1, Math.round(sourceWidth * scale));
    asset.height = Math.max(1, Math.round(sourceHeight * scale));
    const imageContext = asset.getContext("2d");
    imageContext.fillStyle = "#fff";
    imageContext.fillRect(0, 0, asset.width, asset.height);
    imageContext.drawImage(bitmap, 0, 0, asset.width, asset.height);
    bitmap.close?.();
    let width = Math.min(120, 120 * asset.width / Math.max(asset.width, asset.height));
    let height = Math.min(120, 120 * asset.height / Math.max(asset.width, asset.height));
    let contours = null, contourNote = "", vectorLayers = null, engraveDataUrl = null;
    if (svgRoot && layeredCut) {
      const physical = svgPhysicalSize(svgRoot);
      width = physical.width;
      height = physical.height;
      vectorLayers = extractLayeredCutSvg(svgRoot, svgCoordinateWidth || sourceWidth, svgCoordinateHeight || sourceHeight);
      if (vectorLayers.counts.engrave) {
        engraveDataUrl = await rasterizeSvgMarkup(svgLayerMarkup(svgRoot, "engrave"), sourceWidth, sourceHeight);
      }
      contourNote = ` Recognized ${vectorLayers.counts.engrave || 0} engraving, ${vectorLayers.counts.score || 0} score, ${vectorLayers.counts.cutInner || 0} inner-cut, and ${vectorLayers.counts.cutOuter || 0} outer-cut shapes. ${vectorLayers.counts.labels || 0} label shapes will not output.`;
    } else if (svgRoot) {
      try {
        const result = extractSvgContours(svgRoot, svgCoordinateWidth || sourceWidth, svgCoordinateHeight || sourceHeight);
        contours = result.skipped ? null : result.contours;
        contourNote = result.skipped ? ` This SVG has ${result.skipped} unsupported shape(s), so contour tracing is unavailable for it.` : "";
      } catch (error) {
        contourNote = ` Contour tracing unavailable: ${error.message}`;
      }
    }
    if (layeredCut) project.parameters.jobName = `${safeName(file.name.replace(/\.svg$/i, ""), "layered-cut")}.nc`;
    addObject({
      id: uid(),
      type: "image",
      kind: layeredCut ? "Layered SVG cut file" : "Picture",
      dataUrl: asset.toDataURL("image/png"),
      contours,
      vectorLayers,
      engraveDataUrl,
      lockedCutFile: layeredCut,
      x: (BED - width) / 2,
      y: (BED - height) / 2,
      w: width,
      h: height,
      rotation: 0,
      flipX: false,
      flipY: false,
      filter: "original",
      brightness: 100,
      contrast: 100,
      crop: [0, 0, 0, 0],
      mask: "rectangle"
    });
    hint(layeredCut ? `Imported ${file.name} at ${width.toFixed(1)} \xD7 ${height.toFixed(1)} mm.${contourNote} Open settings to review every operation before preparing the job.` : `Imported ${file.name}${svg ? " and retained supported contours for tracing" : ""}. Drag the image to move it, or drag a green corner to resize it.${contourNote}`);
  } catch (error) {
    hint(`Picture import failed: ${error.message}`);
  }
}
function addTextObject() {
  const content = $("textContent").value.trim();
  const sizeMm = Number($("textSize").value);
  if (!content || !Number.isFinite(sizeMm) || sizeMm < 2 || sizeMm > 60) {
    hint("Enter text and a height between 2 and 60 mm.");
    return;
  }
  const asset = document.createElement("canvas");
  const context = asset.getContext("2d");
  context.font = "bold 96px Arial, sans-serif";
  asset.width = Math.min(4e3, Math.ceil(context.measureText(content).width + 28));
  asset.height = 132;
  context.font = "bold 96px Arial, sans-serif";
  context.fillStyle = "#000";
  context.textBaseline = "middle";
  context.fillText(content, 14, 66);
  const width = Math.min(280, sizeMm * asset.width / 100);
  const height = Math.min(75, sizeMm * asset.height / 100);
  addObject({
    id: uid(),
    type: "image",
    kind: "Text",
    dataUrl: asset.toDataURL("image/png"),
    x: (BED - width) / 2,
    y: (BED - height) / 2,
    w: width,
    h: height,
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "original",
    brightness: 100,
    contrast: 100,
    crop: [0, 0, 0, 0],
    mask: "rectangle"
  });
  hint("Text added. Adjust its size and location on the right.");
}
function qrContent() {
  const type = $("qrType").value;
  if (type === "wifi") {
    const ssid = $("wifiName").value.trim(), password = $("wifiPassword").value;
    if (!ssid) throw new Error("Enter the Wi-Fi network name.");
    const escape = (value2) => value2.replace(/[\\;,:]/g, "\\$&");
    return `WIFI:T:WPA;S:${escape(ssid)};P:${escape(password)};;`;
  }
  if (type === "vcard") {
    const name = $("cardName").value.trim();
    if (!name) throw new Error("Enter a business card name.");
    const safe = (value2) => value2.replace(/[\r\n]/g, " ").trim();
    return `BEGIN:VCARD
VERSION:3.0
FN:${safe(name)}
TEL:${safe($("cardPhone").value)}
EMAIL:${safe($("cardEmail").value)}
END:VCARD`;
  }
  const value = $("qrValue").value.trim();
  if (!value) throw new Error("Enter text or a URL.");
  if (type === "url" && !/^https?:\/\//i.test(value)) throw new Error("URL must start with http:// or https://.");
  return value;
}
function addCodeObject() {
  try {
    let asset, kind, width, height;
    if ($("codeFamily").value === "qr") {
      const content = qrContent();
      if (content.length > 1e3) throw new Error("QR content must be under 1000 characters.");
      qrcode_default.stringToBytes = (value) => Array.from(new TextEncoder().encode(value));
      const code = qrcode_default(0, "M");
      code.addData(content);
      code.make();
      const count = code.getModuleCount(), cell = 8, quiet = 4;
      asset = document.createElement("canvas");
      asset.width = asset.height = (count + quiet * 2) * cell;
      const context = asset.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, asset.width, asset.height);
      context.fillStyle = "#000";
      for (let row = 0; row < count; row++) for (let col = 0; col < count; col++) {
        if (code.isDark(row, col)) context.fillRect((col + quiet) * cell, (row + quiet) * cell, cell, cell);
      }
      kind = "QR code";
      width = height = 55;
    } else {
      const value = $("barcodeValue").value.trim();
      if (!value) throw new Error("Enter a barcode value.");
      asset = document.createElement("canvas");
      (0, import_jsbarcode.default)(asset, value, {
        format: $("barcodeType").value,
        displayValue: false,
        width: 3,
        height: 130,
        margin: 20,
        lineColor: "#000",
        background: "#fff"
      });
      kind = `${$("barcodeType").value} barcode`;
      width = 90;
      height = 90 * asset.height / asset.width;
    }
    addObject({
      id: uid(),
      type: "image",
      kind,
      dataUrl: asset.toDataURL("image/png"),
      x: (BED - width) / 2,
      y: (BED - height) / 2,
      w: width,
      h: height,
      rotation: 0,
      flipX: false,
      flipY: false,
      filter: "original",
      brightness: 100,
      contrast: 100,
      crop: [0, 0, 0, 0],
      mask: "rectangle"
    });
    hint(`${kind} added. Keep its size large enough for reliable scanning.`);
  } catch (error) {
    hint(`Code generation failed: ${error.message || error}`);
  }
}
function pointerToMm(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width * BED, 0, BED),
    y: clamp(BED - (event.clientY - rect.top) / rect.height * BED, 0, BED)
  };
}
function hitObject(point) {
  return [...project.objects].reverse().find((object) => pointInRotatedRect(point, object));
}
function resizeHandleAt(point) {
  const rect = canvas.getBoundingClientRect();
  return selected()?.lockedCutFile ? null : hitResizeCorner(point, selected(), 15 / rect.width * BED);
}
canvas.addEventListener("pointerdown", (event) => {
  const point = pointerToMm(event);
  if (drawMode) {
    pointerAction = { type: "draw", points: [point] };
    canvas.setPointerCapture(event.pointerId);
    return;
  }
  const handle = resizeHandleAt(point);
  if (handle) {
    const object2 = selected();
    pointerAction = { type: "resize", original: { ...object2 }, corner: handle, changed: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = handle === "topLeft" || handle === "bottomRight" ? "nwse-resize" : "nesw-resize";
    return;
  }
  const object = hitObject(point);
  project.selectedId = object?.id || null;
  pointerAction = object && !object.lockedCutFile ? { type: "drag", start: point, x: object.x, y: object.y, changed: false } : null;
  if (pointerAction) canvas.setPointerCapture(event.pointerId);
  syncSelection();
  render();
});
canvas.addEventListener("pointermove", (event) => {
  const point = pointerToMm(event);
  if (!pointerAction) {
    const handle = drawMode ? null : resizeHandleAt(point);
    canvas.style.cursor = handle ? handle === "topLeft" || handle === "bottomRight" ? "nwse-resize" : "nesw-resize" : drawMode ? "crosshair" : hitObject(point) ? "move" : "crosshair";
    return;
  }
  if (pointerAction.type === "draw") {
    pointerAction.points.push(point);
    render();
  } else if (pointerAction.type === "resize") {
    const object = selected();
    if (!object) return;
    const next = resizeFromCorner(pointerAction.original, pointerAction.corner, point, BED);
    pointerAction.changed ||= ["x", "y", "w", "h"].some((key) => Math.abs(next[key] - pointerAction.original[key]) > 1e-3);
    Object.assign(object, next);
    syncSelection();
    render();
  } else {
    const object = selected();
    if (!object) return;
    const original = { ...object, x: pointerAction.x, y: pointerAction.y };
    const margin = object.type === "path" ? (object.stroke || 1) / 2 : 0;
    const bounds = rotatedBounds(original, margin);
    const position = moveRotatedBounds(
      original,
      bounds.minX + point.x - pointerAction.start.x,
      bounds.minY + point.y - pointerAction.start.y,
      BED,
      margin
    );
    object.x = position.x;
    object.y = position.y;
    pointerAction.changed ||= Math.abs(object.x - pointerAction.x) > 1e-3 || Math.abs(object.y - pointerAction.y) > 1e-3;
    syncSelection();
    render();
  }
});
canvas.addEventListener("pointerup", () => {
  if (!pointerAction) return;
  if (pointerAction.type === "draw") {
    const points = pointerAction.points;
    if (points.length === 1) points.push({ x: Math.min(BED, points[0].x + 0.2), y: points[0].y });
    const minX = Math.min(...points.map((p) => p.x)), maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y)), maxY = Math.max(...points.map((p) => p.y));
    const w = Math.max(0.2, maxX - minX), h = Math.max(0.2, maxY - minY);
    addObject({
      id: uid(),
      type: "path",
      kind: "Drawing",
      x: minX,
      y: minY,
      w,
      h,
      sourceW: w,
      sourceH: h,
      points: points.map((p) => [p.x - minX, maxY - p.y]),
      stroke: Number($("drawWidth").value) || 1,
      rotation: 0,
      flipX: false,
      flipY: false
    });
  } else if (pointerAction.changed) commit();
  pointerAction = null;
  canvas.style.cursor = "crosshair";
});
canvas.addEventListener("pointercancel", () => {
  if (pointerAction?.type === "resize") {
    const object = selected();
    if (object) {
      Object.assign(object, pointerAction.original);
      syncSelection();
      render();
    }
  } else if (pointerAction?.type === "drag") {
    const object = selected();
    if (object) {
      object.x = pointerAction.x;
      object.y = pointerAction.y;
      syncSelection();
      render();
    }
  }
  pointerAction = null;
  canvas.style.cursor = "crosshair";
});
function deleteSelectedObject() {
  if (!selected()) return;
  project.objects = project.objects.filter((object) => object.id !== project.selectedId);
  project.selectedId = null;
  syncSelection();
  commit();
  render();
  hint("Object deleted.");
}
canvas.addEventListener("keydown", (event) => {
  const object = selected();
  if (!object) return;
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelectedObject();
    return;
  }
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
  if (!directions[event.key]) return;
  event.preventDefault();
  if (object.lockedCutFile) {
    hint("Layered cut files stay at their imported physical size and position.");
    return;
  }
  const step = event.shiftKey ? 10 : 1;
  const [dx, dy] = directions[event.key];
  const margin = object.type === "path" ? (object.stroke || 1) / 2 : 0;
  const bounds = rotatedBounds(object, margin);
  Object.assign(object, moveRotatedBounds(object, bounds.minX + dx * step, bounds.minY + dy * step, BED, margin));
  syncSelection();
  commit();
  render();
  hint(`${object.kind || "Artwork"} moved to X ${object.x.toFixed(1)}, Y ${object.y.toFixed(1)} mm.`);
});
function selectTool(button, focus = false) {
  document.querySelectorAll("[data-tool]").forEach((item) => {
    item.setAttribute("aria-selected", String(item === button));
    item.tabIndex = item === button ? 0 : -1;
  });
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== button.dataset.tool;
  });
  if (focus) button.focus();
}
document.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => selectTool(button)));
document.querySelector(".tool-tabs").addEventListener("keydown", (event) => {
  const tabs = [...document.querySelectorAll("[data-tool]")];
  const current = tabs.indexOf(event.target);
  if (current < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  selectTool(tabs[next], true);
});
$("addPicture").addEventListener("click", () => $("pictureInput").click());
$("pictureInput").addEventListener("change", () => {
  addPictureFile($("pictureInput").files?.[0]);
  $("pictureInput").value = "";
});
$("addText").addEventListener("click", addTextObject);
$("addCode").addEventListener("click", addCodeObject);
$("codeFamily").addEventListener("change", () => {
  $("qrFields").hidden = $("codeFamily").value !== "qr";
  $("barcodeFields").hidden = $("codeFamily").value !== "barcode";
});
$("qrType").addEventListener("change", () => {
  $("qrValueLabel").hidden = ["wifi", "vcard"].includes($("qrType").value);
  $("qrValue").hidden = ["wifi", "vcard"].includes($("qrType").value);
  $("wifiFields").hidden = $("qrType").value !== "wifi";
  $("vcardFields").hidden = $("qrType").value !== "vcard";
});
$("drawToggle").addEventListener("click", () => {
  drawMode = !drawMode;
  $("drawToggle").setAttribute("aria-pressed", String(drawMode));
  $("drawToggle").textContent = drawMode ? "Stop drawing" : "Start drawing";
  hint(drawMode ? "Drag on the grid to draw. Click Stop drawing to select objects again." : "Drawing stopped.");
});
$("materialSelect").addEventListener("change", () => {
  project.material = $("materialSelect").value;
  commit();
});
$("materialNote").addEventListener("change", () => {
  project.materialNote = $("materialNote").value;
  commit();
});
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  const object = selected();
  if (!object || object.type !== "image") {
    hint("Select a picture or code first.");
    return;
  }
  if (object.lockedCutFile) {
    hint("Layered cut-file colours define its operations and cannot be filtered.");
    return;
  }
  object.filter = button.dataset.filter;
  processedCache.clear();
  syncSelection();
  commit();
  render();
}));
for (const [id, key, output] of [["brightnessInput", "brightness", "brightnessValue"], ["contrastInput", "contrast", "contrastValue"]]) {
  $(id).addEventListener("input", () => {
    $(output).value = `${$(id).value}%`;
    const object = selected();
    if (!object || object.type !== "image" || object.lockedCutFile) return;
    object[key] = Number($(id).value);
    processedCache.clear();
    render();
  });
  $(id).addEventListener("change", () => {
    if (selected() && !selected().lockedCutFile) commit();
  });
}
for (const id of ["cropLeft", "cropTop", "cropRight", "cropBottom"]) $(id).addEventListener("change", () => {
  const object = selected();
  if (!object || object.type !== "image" || object.lockedCutFile) return;
  const values = ["cropLeft", "cropTop", "cropRight", "cropBottom"].map((key) => clamp(Number($(key).value) || 0, 0, 80));
  if (values[0] + values[2] >= 95 || values[1] + values[3] >= 95) {
    hint("Crop must leave at least 5% of the picture.");
    syncSelection();
    return;
  }
  object.crop = values;
  processedCache.clear();
  commit();
  render();
});
$("maskShape").addEventListener("change", () => {
  const object = selected();
  if (!object || object.type !== "image" || object.lockedCutFile) return;
  object.mask = $("maskShape").value;
  commit();
  render();
});
for (const [id, key] of [["objectX", "x"], ["objectY", "y"], ["objectW", "w"], ["objectH", "h"], ["objectRotation", "rotation"]]) $(id).addEventListener("change", () => {
  const object = selected();
  if (!object) return;
  if (object.lockedCutFile) {
    syncSelection();
    hint("Layered cut files stay at their imported physical size and position.");
    return;
  }
  const value = Number($(id).value);
  if (!Number.isFinite(value)) {
    syncSelection();
    return;
  }
  const before = { ...object };
  const margin = object.type === "path" ? (object.stroke || 1) / 2 : 0;
  try {
    if (key === "x" || key === "y") {
      const bounds = rotatedBounds(object, margin);
      Object.assign(object, moveRotatedBounds(
        object,
        key === "x" ? value : bounds.minX,
        key === "y" ? value : bounds.minY,
        BED,
        margin
      ));
    } else {
      object[key] = key === "rotation" ? clamp(value, -180, 180) : clamp(value, 0.2, BED);
      const bounds = rotatedBounds(object, margin);
      Object.assign(object, moveRotatedBounds(object, bounds.minX, bounds.minY, BED, margin));
    }
  } catch (error) {
    Object.assign(object, before);
    hint(error.message);
    syncSelection();
    return;
  }
  syncSelection();
  commit();
  render();
});
$("flipHorizontal").addEventListener("click", () => {
  const object = selected();
  if (object) {
    object.flipX = !object.flipX;
    commit();
    render();
  }
});
$("flipVertical").addEventListener("click", () => {
  const object = selected();
  if (object) {
    object.flipY = !object.flipY;
    commit();
    render();
  }
});
$("deleteObject").addEventListener("click", deleteSelectedObject);
$("undoEdit").addEventListener("click", () => restore(historyIndex - 1));
$("redoEdit").addEventListener("click", () => restore(historyIndex + 1));
function download(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 3e4);
}
function safeName(value, fallback) {
  return String(value || fallback).replace(/[^a-z0-9._-]+/gi, "-").slice(0, 80) || fallback;
}
function validVectorLayers(layers) {
  if (!layers || typeof layers !== "object") return false;
  let pathCount = 0, pointCount = 0;
  for (const operation of ["score", "cutInner", "cutOuter"]) {
    if (!Array.isArray(layers[operation])) return false;
    pathCount += layers[operation].length;
    if (pathCount > 1e4) return false;
    for (const path of layers[operation]) {
      if (!Array.isArray(path) || path.length < 2) return false;
      pointCount += path.length;
      if (pointCount > 25e4 || path.some((point) => !Array.isArray(point) || point.length !== 2 || point.some((value) => !Number.isFinite(value) || value < -0.01 || value > 1.01))) return false;
    }
  }
  return Boolean(layers.cutInner.length || layers.cutOuter.length || layers.score.length);
}
function validProjectObject(object) {
  if (!object || typeof object !== "object" || !["image", "path"].includes(object.type) || typeof object.id !== "string" || object.id.length > 100 || ![object.x, object.y, object.w, object.h, object.rotation || 0].every(Number.isFinite) || object.w <= 0 || object.h <= 0 || Math.abs(object.rotation || 0) > 180) return false;
  const margin = object.type === "path" ? (object.stroke || 1) / 2 : 0;
  const bounds = rotatedBounds(object, margin);
  if (bounds.minX < -1e-3 || bounds.minY < -1e-3 || bounds.maxX > BED + 1e-3 || bounds.maxY > BED + 1e-3) return false;
  if (object.type === "image") {
    return typeof object.dataUrl === "string" && /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(object.dataUrl) && (!object.lockedCutFile || validVectorLayers(object.vectorLayers) && (!object.engraveDataUrl || /^data:image\/png;base64,[a-z0-9+/=]+$/i.test(object.engraveDataUrl))) && (!object.contours || Array.isArray(object.contours) && object.contours.length <= 1e3 && object.contours.reduce((count, path) => count + (Array.isArray(path) ? path.length : 12001), 0) <= 12e3 && object.contours.every((path) => Array.isArray(path) && path.length >= 2 && path.every((point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite)))) && (!object.crop || Array.isArray(object.crop) && object.crop.length === 4 && object.crop.every((value) => Number.isFinite(value) && value >= 0 && value <= 80) && object.crop[0] + object.crop[2] < 95 && object.crop[1] + object.crop[3] < 95);
  }
  return Array.isArray(object.points) && object.points.length >= 2 && object.points.length <= 5e4 && [object.sourceW, object.sourceH, object.stroke].every((value) => Number.isFinite(value) && value > 0) && object.points.every((point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite));
}
function freshProject() {
  return {
    version: 1,
    id: uid(),
    objects: [],
    selectedId: null,
    material: "Unspecified",
    materialNote: "",
    parameters: {
      power: 5,
      speed: 1e3,
      passes: 1,
      framePower: 5,
      airAssist: false,
      sMax: 1e3,
      resolution: 0.3,
      jobName: "laser-link-job.nc",
      vector: {
        engraveOutput: true,
        engravePower: 30,
        engraveSpeed: 3e3,
        engravePasses: 1,
        scoreOutput: true,
        scorePower: 20,
        scoreSpeed: 1500,
        scorePasses: 1,
        cutOutput: true,
        cutPower: 100,
        cutSpeed: 180,
        cutPasses: 1,
        cutAirAssist: true
      }
    }
  };
}
$("newProject").addEventListener("click", () => {
  if (project.objects.length && !window.confirm("Start a new design? Save this project first if you want to keep it.")) return;
  project = freshProject();
  imageCache.clear();
  engraveImageCache.clear();
  processedCache.clear();
  history = [];
  historyIndex = -1;
  framePreview = false;
  syncSelection();
  commit();
  render();
  hint("New 300 \xD7 300 mm project ready.");
});
$("saveProject").addEventListener("click", () => {
  const name = safeName(project.parameters?.jobName?.replace(/\.nc$/i, ""), "laser-link-project");
  download(`${name}.laserlink.json`, JSON.stringify(project, null, 2), "application/json");
  hint("Project saved as a local JSON file, including imported artwork.");
});
$("openProject").addEventListener("click", () => $("projectInput").click());
function acceptProject(loaded, label) {
  if (loaded.version !== 1 || !Array.isArray(loaded.objects) || loaded.objects.length > 100 || loaded.objects.some((object) => !validProjectObject(object))) {
    throw new Error("This is not a supported Laser Link project.");
  }
  clearTimeout(autosaveTimer);
  const defaults = freshProject();
  project = {
    ...defaults,
    ...loaded,
    id: typeof loaded.id === "string" && loaded.id.length < 100 ? loaded.id : uid(),
    parameters: {
      ...defaults.parameters,
      ...loaded.parameters || {},
      vector: { ...defaults.parameters.vector, ...loaded.parameters?.vector || {} }
    }
  };
  imageCache.clear();
  engraveImageCache.clear();
  processedCache.clear();
  history = [];
  historyIndex = -1;
  project.selectedId = null;
  $("materialSelect").value = project.material;
  $("materialNote").value = project.materialNote || "";
  syncSelection();
  commit();
  render();
  hint(`Opened ${label}.`);
}
$("projectInput").addEventListener("change", async () => {
  const file = $("projectInput").files?.[0];
  $("projectInput").value = "";
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) {
    hint("Project file exceeds 20 MB.");
    return;
  }
  try {
    const loaded = JSON.parse(await file.text());
    acceptProject(loaded, file.name);
  } catch (error) {
    hint(`Could not open project: ${error.message}`);
  }
});
$("selectProjects").addEventListener("click", () => {
  selectingProjects = !selectingProjects;
  selectedProjectIds.clear();
  $("projectsStatus").textContent = selectingProjects ? "Select projects to delete." : "";
  renderProjects();
});
$("deleteProjects").addEventListener("click", async () => {
  if (!selectedProjectIds.size) return;
  if (!window.confirm(`Delete ${selectedProjectIds.size} selected project(s) from this browser? This cannot be undone.`)) return;
  const ids = [...selectedProjectIds];
  try {
    await removeLocalProjects(ids);
    if (ids.includes(project.id)) {
      clearTimeout(autosaveTimer);
      project = freshProject();
      imageCache.clear();
      processedCache.clear();
      history = [];
      historyIndex = -1;
      syncSelection();
      commit();
      render();
    }
    selectingProjects = false;
    selectedProjectIds.clear();
    $("projectsStatus").textContent = `Deleted ${ids.length} project(s) from this browser.`;
    renderProjects();
  } catch (error) {
    $("projectsStatus").textContent = `Could not delete projects: ${error.message}`;
  }
});
function settingsMessage(message, error = false) {
  $("parameterError").textContent = message;
  $("parameterError").dataset.kind = error ? "error" : "neutral";
}
function readParameterForm() {
  const basename = safeName($("jobFileName").value, "laser-link-job.nc").replace(/\.[^.]+$/, "");
  return {
    jobName: `${basename || "laser-link-job"}.nc`,
    power: Number($("laserPower").value),
    speed: Number($("workSpeed").value),
    passes: Number($("passes").value),
    framePower: Number($("framePower").value),
    airAssist: $("airAssist").checked,
    sMax: Number($("sMaxInput").value),
    resolution: Number($("resolution").value),
    vector: {
      engraveOutput: $("engraveOutput").checked,
      engravePower: Number($("engravePower").value),
      engraveSpeed: Number($("engraveSpeed").value),
      engravePasses: Number($("engravePasses").value),
      scoreOutput: $("scoreOutput").checked,
      scorePower: Number($("scorePower").value),
      scoreSpeed: Number($("scoreSpeed").value),
      scorePasses: Number($("scorePasses").value),
      cutOutput: $("cutOutput").checked,
      cutPower: Number($("cutPower").value),
      cutSpeed: Number($("cutSpeed").value),
      cutPasses: Number($("cutPasses").value),
      cutAirAssist: $("cutAirAssist").checked
    }
  };
}
function layeredCutObject() {
  return project.objects.length === 1 && project.objects[0].lockedCutFile && project.objects[0].vectorLayers ? project.objects[0] : null;
}
function setWorkspaceInert(inert) {
  document.querySelectorAll("#appShell > :not(#settingsDialog)").forEach((element) => {
    element.inert = inert;
  });
}
function hideSettingsDialog({ restoreFocus = true } = {}) {
  $("settingsDialog").hidden = true;
  setWorkspaceInert(false);
  if (restoreFocus && settingsReturnFocus?.isConnected) settingsReturnFocus.focus();
  settingsReturnFocus = null;
}
function openSettings() {
  if (!project.objects.length) {
    hint("Add a picture, text, drawing, QR code, or barcode first.");
    return;
  }
  const defaults = freshProject().parameters;
  const parameters = project.parameters || defaults;
  const vector = { ...defaults.vector, ...parameters.vector || {} };
  const cutFile = layeredCutObject();
  $("jobFileName").value = parameters.jobName;
  $("laserPower").value = parameters.power;
  $("workSpeed").value = parameters.speed;
  $("passes").value = parameters.passes;
  $("framePower").value = parameters.framePower;
  $("airAssist").checked = parameters.airAssist;
  $("resolution").value = String(parameters.resolution);
  for (const [id, key] of [
    ["engraveOutput", "engraveOutput"],
    ["engravePower", "engravePower"],
    ["engraveSpeed", "engraveSpeed"],
    ["engravePasses", "engravePasses"],
    ["scoreOutput", "scoreOutput"],
    ["scorePower", "scorePower"],
    ["scoreSpeed", "scoreSpeed"],
    ["scorePasses", "scorePasses"],
    ["cutOutput", "cutOutput"],
    ["cutPower", "cutPower"],
    ["cutSpeed", "cutSpeed"],
    ["cutPasses", "cutPasses"],
    ["cutAirAssist", "cutAirAssist"]
  ]) {
    if ($(id).type === "checkbox") $(id).checked = Boolean(vector[key]);
    else $(id).value = vector[key];
  }
  $("vectorSettings").hidden = !cutFile;
  document.querySelectorAll("[data-raster-only]").forEach((element) => {
    element.hidden = Boolean(cutFile);
  });
  $("settingsTitle").textContent = cutFile ? "Prepare layered SVG cut" : "Prepare engraving";
  if (cutFile) {
    const counts = cutFile.vectorLayers.counts || {};
    $("vectorLayerSummary").textContent = `${counts.engrave || 0} engraving shapes \xB7 ${counts.score || 0} score paths \xB7 ${counts.cutInner || 0} inner cuts \xB7 ${counts.cutOuter || 0} outer cuts \xB7 green labels excluded`;
    $("engraveOutput").disabled = !counts.engrave;
    $("scoreOutput").disabled = !counts.score;
    $("cutOutput").disabled = !(counts.cutInner || counts.cutOuter);
    if (!counts.engrave) $("engraveOutput").checked = false;
    if (!counts.score) $("scoreOutput").checked = false;
    if (!(counts.cutInner || counts.cutOuter)) $("cutOutput").checked = false;
  }
  $("sMaxInput").value = machineSettings?.sMax || parameters.sMax;
  $("machineConfig").textContent = machineSettings ? `Controller: $30=${machineSettings.sMax}, $32=${machineSettings.laserMode ?? "unknown"}, travel ${machineSettings.travelX || "?"} \xD7 ${machineSettings.travelY || "?"} mm.` : "Connect the laser to read its actual $30 and $32 settings.";
  settingsMessage(cutFile ? "Verify these starting values on scrap. The job runs engraving, scoring, inner cuts, then outer cuts." : "Screenshot example: 5% power, 1000 mm/min, one pass, M4. Preview the job before sending.");
  settingsReturnFocus = document.activeElement;
  setWorkspaceInert(true);
  $("settingsDialog").hidden = false;
  $("jobFileName").focus();
}
function closeSettings() {
  project.parameters = readParameterForm();
  commit();
  hideSettingsDialog();
}
$("settingsDialog").addEventListener("input", () => invalidatePreparedJob(readParameterForm()));
$("settingsDialog").addEventListener("change", () => invalidatePreparedJob(readParameterForm()));
$("openSettings").addEventListener("click", openSettings);
window.addEventListener("laserlink:open-settings", openSettings);
$("closeSettings").addEventListener("click", closeSettings);
$("settingsDialog").addEventListener("click", (event) => {
  if (event.target === $("settingsDialog")) closeSettings();
});
document.addEventListener("keydown", (event) => {
  if ($("settingsDialog").hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeSettings();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...$("settingsDialog").querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden && element.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
window.addEventListener("laserlink:machine-settings", (event) => {
  machineSettings = event.detail;
  if (!$("settingsDialog").hidden) {
    $("sMaxInput").value = machineSettings?.sMax || $("sMaxInput").value;
    $("machineConfig").textContent = machineSettings ? `Controller: $30=${machineSettings.sMax}, $32=${machineSettings.laserMode ?? "unknown"}, travel ${machineSettings.travelX || "?"} \xD7 ${machineSettings.travelY || "?"} mm.` : "Connect the laser to read its actual $30 and $32 settings.";
  }
});
async function buildJob() {
  const parameters = readParameterForm();
  if (!Number.isInteger(parameters.framePower) || parameters.framePower < 1 || parameters.framePower > 10) {
    throw new Error("Frame power must be 1\u201310%; it is saved but not used by preview framing.");
  }
  const bounds = objectBounds();
  if (!bounds || bounds.minX < -1e-3 || bounds.minY < -1e-3 || bounds.maxX > BED + 1e-3 || bounds.maxY > BED + 1e-3) {
    throw new Error("Artwork extends outside the 300 \xD7 300 mm bed. Move or resize it before export.");
  }
  if (activeAlignment.jig && (bounds.minX < -1e-3 || bounds.minY < -1e-3 || bounds.maxX > activeAlignment.jig.max_width + 1e-3 || bounds.maxY > activeAlignment.jig.max_height + 1e-3)) {
    throw new Error("Artwork extends outside the active jig pocket.");
  }
  if (activeAlignment.jig && !activeAlignment.origin) {
    throw new Error("Connect and home the laser to calculate this jig\u2019s work-coordinate offset.");
  }
  project.parameters = parameters;
  const cutFile = layeredCutObject();
  if (cutFile) return buildLayeredCutJob(cutFile, parameters);
  await Promise.all(project.objects.filter((object) => object.type === "image").map(ensureImage));
  const size = Math.round(BED / parameters.resolution);
  const raster = document.createElement("canvas");
  raster.width = raster.height = size;
  const context = raster.getContext("2d", { willReadFrequently: true });
  drawScene(context, size);
  const rgba = context.getImageData(0, 0, size, size).data;
  const pixels = new Uint8Array(size * size);
  for (let i = 0; i < pixels.length; i++) {
    const offset = i * 4;
    pixels[i] = 0.2126 * rgba[offset] + 0.7152 * rgba[offset + 1] + 0.0722 * rgba[offset + 2] < 128 ? 1 : 0;
  }
  const result = rasterToGcode({
    pixels,
    width: size,
    height: size,
    stepMm: parameters.resolution,
    powerPercent: parameters.power,
    speedMmMin: parameters.speed,
    passes: parameters.passes,
    sMax: parameters.sMax,
    airAssist: parameters.airAssist,
    originX: activeAlignment.origin?.x || 0,
    originY: activeAlignment.origin?.y || 0
  });
  if (activeAlignment.jig) {
    assertMachineBounds(result.bounds, activeAlignment.wco, activeAlignment.limits, activeAlignment.jig);
  }
  return { ...result, parameters };
}
async function buildLayeredCutJob(object, parameters) {
  const vector = parameters.vector || {};
  const originX = activeAlignment.origin?.x || 0;
  const originY = activeAlignment.origin?.y || 0;
  let rasterJob = null;
  if (vector.engraveOutput && object.engraveDataUrl) {
    const image = await ensureEngraveImage(object);
    const size = Math.round(BED / parameters.resolution);
    const raster = document.createElement("canvas");
    raster.width = raster.height = size;
    const context = raster.getContext("2d", { willReadFrequently: true });
    context.fillStyle = "#fff";
    context.fillRect(0, 0, size, size);
    const scale = size / BED;
    const centerX = (object.x + object.w / 2) * scale;
    const centerY = (BED - object.y - object.h / 2) * scale;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(-(object.rotation || 0) * Math.PI / 180);
    context.scale(object.flipX ? -1 : 1, object.flipY ? -1 : 1);
    context.drawImage(
      image,
      -object.w * scale / 2,
      -object.h * scale / 2,
      object.w * scale,
      object.h * scale
    );
    context.restore();
    const rgba = context.getImageData(0, 0, size, size).data;
    const pixels = new Uint8Array(size * size);
    let darkPixels = 0;
    for (let i = 0; i < pixels.length; i++) {
      const offset = i * 4;
      pixels[i] = 0.2126 * rgba[offset] + 0.7152 * rgba[offset + 1] + 0.0722 * rgba[offset + 2] < 128 ? 1 : 0;
      darkPixels += pixels[i];
    }
    if (darkPixels) rasterJob = rasterToGcode({
      pixels,
      width: size,
      height: size,
      stepMm: parameters.resolution,
      powerPercent: vector.engravePower,
      speedMmMin: vector.engraveSpeed,
      passes: vector.engravePasses,
      sMax: parameters.sMax,
      airAssist: false,
      originX,
      originY
    });
  }
  const source = object.vectorLayers;
  const layers = {
    score: vector.scoreOutput ? source.score.map((path) => transformContour(object, path)) : [],
    cutInner: vector.cutOutput ? source.cutInner.map((path) => transformContour(object, path)) : [],
    cutOuter: vector.cutOutput ? source.cutOuter.map((path) => transformContour(object, path)) : []
  };
  const hasVectors = layers.score.length || layers.cutInner.length || layers.cutOuter.length;
  const vectorJob = hasVectors ? vectorLayersToGcode({
    layers,
    sMax: parameters.sMax,
    originX,
    originY,
    includePreamble: !rasterJob,
    settings: {
      score: {
        powerPercent: vector.scorePower,
        speedMmMin: vector.scoreSpeed,
        passes: vector.scorePasses,
        airAssist: false
      },
      cut: {
        powerPercent: vector.cutPower,
        speedMmMin: vector.cutSpeed,
        passes: vector.cutPasses,
        airAssist: vector.cutAirAssist
      }
    }
  }) : null;
  const result = mergeLayeredJobs({ raster: rasterJob, vector: vectorJob });
  if (activeAlignment.jig) {
    assertMachineBounds(result.bounds, activeAlignment.wco, activeAlignment.limits, activeAlignment.jig);
  }
  return { ...result, parameters, layered: true };
}
function textContours(object, image) {
  const width = Math.max(1, Math.min(900, Math.round(object.w / 0.3)));
  const height = Math.max(1, Math.min(900, Math.round(object.h / 0.3)));
  const raster = document.createElement("canvas");
  raster.width = width;
  raster.height = height;
  const context = raster.getContext("2d", { willReadFrequently: true });
  context.save();
  context.translate(width / 2, height / 2);
  maskPath(context, object.mask || "rectangle", width, height);
  context.clip();
  context.drawImage(processedImage(object, image), -width / 2, -height / 2, width, height);
  context.restore();
  const rgba = context.getImageData(0, 0, width, height).data;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < binary.length; i++) {
    const at = i * 4;
    binary[i] = rgba[at + 3] > 127 && 0.2126 * rgba[at] + 0.7152 * rgba[at + 1] + 0.0722 * rgba[at + 2] < 128 ? 1 : 0;
  }
  return traceBinaryContours(binary, width, height);
}
window.addEventListener("laserlink:alignment", (event) => {
  const next = event.detail || { jig: null, origin: { x: 0, y: 0 }, measurement: null, outline: null };
  if (JSON.stringify(activeAlignment.jig) !== JSON.stringify(next.jig) || JSON.stringify(activeAlignment.origin) !== JSON.stringify(next.origin)) {
    activeAlignment = next;
    if (preparedFingerprint) {
      preparedFingerprint = null;
      window.dispatchEvent(new CustomEvent("laserlink:job-invalidated"));
    }
  } else activeAlignment = next;
  $("fitMeasured").disabled = !next.measurement;
  render();
});
window.addEventListener("laserlink:geometry-request", async (event) => {
  try {
    if (event.detail.kind === "box") {
      event.detail.resolve({ bounds: objectBounds() });
      return;
    }
    const objects = project.objects.map((object) => ({ ...object }));
    for (const object of objects.filter((item) => item.kind === "Text")) {
      const image = await ensureImage(object);
      object.contours = textContours(object, image);
    }
    event.detail.resolve({ bounds: objectBounds(), paths: collectContourPaths(objects) });
  } catch (error) {
    event.detail.reject(error);
  }
});
$("fitMeasured").addEventListener("click", () => {
  const object = selected(), box = activeAlignment.measurement;
  if (!object || !box) {
    hint("Select an object and capture both measurement points first.");
    return;
  }
  const angle = (object.rotation || 0) * Math.PI / 180;
  const c = Math.abs(Math.cos(angle)), s = Math.abs(Math.sin(angle));
  const rotatedW = object.w * c + object.h * s;
  const rotatedH = object.w * s + object.h * c;
  const factor = Math.min((box.maxX - box.minX) / rotatedW, (box.maxY - box.minY) / rotatedH);
  object.w *= factor;
  object.h *= factor;
  object.x = (box.minX + box.maxX - object.w) / 2;
  object.y = (box.minY + box.maxY - object.h) / 2;
  syncSelection();
  commit();
  render();
  hint("Selected artwork fitted inside the measured box. Review its position before framing.");
});
$("previewFrame").addEventListener("click", () => {
  framePreview = true;
  closeSettings();
  render();
  hint("Orange box shows the design bounds. This preview does not move or fire the laser.");
});
$("downloadGcode").addEventListener("click", async () => {
  settingsMessage("Building G-code\u2026");
  try {
    const job = await buildJob();
    const contents = `${job.lines.join("\n")}
`;
    if (contents.length > 20 * 1024 * 1024) throw new Error("Job exceeds 20 MB. Choose a coarser raster resolution.");
    download(job.parameters.jobName, contents, "text/plain");
    commit();
    settingsMessage(job.layered ? `Downloaded ${job.parameters.jobName}: ${job.segments.toLocaleString()} engraving/cut moves, maximum S${job.sValue}. Review it before running.` : `Downloaded ${job.parameters.jobName}: ${job.segments.toLocaleString()} dark runs, S${job.sValue}. Check orientation and origin before use.`);
  } catch (error) {
    settingsMessage(error.message, true);
  }
});
$("prepareJob").addEventListener("click", async () => {
  settingsMessage("Building G-code\u2026");
  try {
    const job = await buildJob();
    if (machineSettings && (machineSettings.sMax !== job.parameters.sMax || machineSettings.laserMode !== 1)) {
      throw new Error("Controller $30 must match this job and $32 must be 1 (laser mode) before direct sending.");
    }
    const contentsLength = job.lines.join("\n").length;
    if (contentsLength > 20 * 1024 * 1024) throw new Error("Job exceeds 20 MB. Choose a coarser raster resolution.");
    commit();
    hideSettingsDialog();
    preparedFingerprint = jobFingerprint();
    const enabledVector = job.layered ? [
      job.parameters.vector.engraveOutput && { power: job.parameters.vector.engravePower, speed: job.parameters.vector.engraveSpeed, passes: job.parameters.vector.engravePasses },
      job.parameters.vector.scoreOutput && { power: job.parameters.vector.scorePower, speed: job.parameters.vector.scoreSpeed, passes: job.parameters.vector.scorePasses },
      job.parameters.vector.cutOutput && { power: job.parameters.vector.cutPower, speed: job.parameters.vector.cutSpeed, passes: job.parameters.vector.cutPasses }
    ].filter(Boolean) : [];
    const displayPower = job.layered ? Math.max(...enabledVector.map((item) => item.power)) : job.parameters.power;
    const displaySpeed = job.layered ? Math.min(...enabledVector.map((item) => item.speed)) : job.parameters.speed;
    const displayPasses = job.layered ? Math.max(...enabledVector.map((item) => item.passes)) : job.parameters.passes;
    window.dispatchEvent(new CustomEvent("laserlink:generated-job", { detail: {
      name: job.parameters.jobName,
      lines: job.lines,
      bounds: job.bounds,
      sMax: job.parameters.sMax,
      jigId: activeAlignment.jig?.id || "",
      origin: activeAlignment.origin || { x: 0, y: 0 },
      power: displayPower,
      speed: displaySpeed,
      passes: displayPasses,
      sValue: job.sValue
    } }));
    hint(job.layered ? `Prepared ${job.segments.toLocaleString()} engraving, scoring, and cutting moves. Review the sender before starting.` : `Prepared ${job.segments.toLocaleString()} dark runs. Review the sender before starting.`);
  } catch (error) {
    settingsMessage(error.message, true);
  }
});
project = freshProject();
commit();
syncSelection();
fitCanvasResolution();
renderProjects();
window.addEventListener("resize", fitCanvasResolution);
new ResizeObserver(fitCanvasResolution).observe(canvas);
window.dispatchEvent(new Event("laserlink:editor-ready"));
