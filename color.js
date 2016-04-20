/**
 * Color object
 * RGB Color with three 8-bit channels
 * Each instance expresses color in three different ways:
 *  - Hexidecimal: A 6-character string
 *  - FlatInteger: A 24-bit integer encoding three bytes
 *  - RGB: r, g, and b are three separate properties, 1 byte each
 *  
 *  valueOf() returns the FlatInteger representation.
 *  toString() returns the hexidecimal representation.
 *  toString('rgb') returns the rgb representation as a string.
 *  
 *  This allows shortcuts like document.body.style.color = new Color('ff7700');
 * 
 * TODO: 
 *  - Integrate HSL and HSV calculations
 *  - Add handy methods like lighter() darker()
 *  - Add a fuzz() function to randomize the color within a range
 */

var Color = (function(){
    var BYTE = 0xff;
    var BYTE3 = 0xffffff;
    
    /*** Constructor ***/
    function Color() {
        // Initialize default values
        this.r=0;
        this.g=0;
        this.b=0;
        this.a=1;
        
        var success = false;
        
        // If no arguments, set to default color
        if (arguments.length == 0) {
            this.r = 0;
            this.g = 0;
            this.b = 0;
            this.a = 1;
            
            success = true;
        }
        else if (arguments.length == 1) {
            var c = arguments[0];
            
            // #hex
            if (vld.hex(c)) {
                // Convert to rgb
                var rgb = cnv.hex_rgb(c);
                this.r = rgb.r;
                this.g = rgb.g;
                this.b = rgb.b;
                
                success = true;
            }
            
            // Flat integer
            else if (vld.int(c)) {
                // Convert to rgb
                var rgb = cnv.int_rgb(c);
                this.r = rgb.r;
                this.g = rgb.g;
                this.b = rgb.b;
                
                success = true;
            }
            
            // RGB(A) object
            else if (typeof(c) == 'object') {
                this.r = parse.byte(c.r);
                this.g = parse.byte(c.g);
                this.b = parse.byte(c.b);
                this.a = parse.unit(c.a);
                
                success = true;
            }
            
            
        }
        // R,G,B(,A) arguments
        else if (arguments.length == 3 || arguments.length == 4) {
            this.r = parse.byte(arguments[0]);
            this.g = parse.byte(arguments[1]);
            this.b = parse.byte(arguments[2]);
            this.a = parse.unit(arguments[3]);
            
            success = true;
        }
        
        if (!success) 
            throw ['InvalidArgumentsException' , 
                ' Constructor arguments not recognized: ' + JSON.stringify(arguments)];
        
        // Computed values 
        this.hex = function(){
            return cnv.rgb_hex(this.r, this.g, this.b);
        };
        
        this.int = function(){
            return cnv.rgb_int(this.r, this.g, this.b);
        };
        
        // Attach member functions
        this.toString = function()    {return util.tostr(this);};
        this.valueOf = function()     {return util.val(this);};
        this.rgb = function()         {return [this.r, this.g, this.b];};
        this.rgba = function()        {return [this.r, this.g, this.b, this.r];};
        
        this.inv = function(c)        {return util.not(this);};
        this.add = function(c)        {return util.add(this, c);};
        this.avg = function(c)        {return util.avg(this, c);};
        this.sub = function(c)        {return util.sub(this, c);};
        this.not = function()         {return util.not(this);};
        this.and = function(c)        {return util.and(this, c);};
        this.or = function(c)         {return util.or(this, c);};
        this.xor = function(c)        {return util.xor(this, c);};
        
        this.multiply = function(c)   {return blend.multiply(this, c);};
        this.screen = function(c)     {return blend.screen(this, c);};
        this.overlay = function(c)    {return blend.overlay(this, c);};
        this.hardLight = function(c)  {return blend.hardLight(this, c);};
        this.divide = function(c)     {return blend.divide(this, c);};
        this.addition = function(c)   {return blend.addition(this, c);};
        this.subtract = function(c)   {return blend.subtract(this, c);};
        this.difference = function(c) {return blend.difference(this, c);};
        
        this.clone = function()     {return util.clone(this);};
    }
    
    /*** Utilities ***/
    var util = {
        tostr: function toString(c, fmt) {
            if ( c.a<1 || (fmt && fmt == 'rgba') ) {
                return 'rgba('+c.r+','+c.g+','+c.b+','+c.a+')';
            }
            else {
                return '#' + c.hex();
            }
        },
        
        val: function valueOf(c) {
            return c.int();
        },
        
        add: function add(x,y) {
            return new Color(
                x.r + y.r,
                x.g + y.g,
                x.b + y.b,
                x.a + y.a
            );
        },
        
        avg: function average(x,y) {
            var rgb = parse.rgb(
                (x.r + y.r)/2,
                (x.g + y.g)/2,
                (x.b + y.b)/2
            );
            return new Color(rgb);
        },
        
        sub: function subtract(x,y) {
            return new Color(
                x.r - y.r,
                x.g - y.g,
                x.b - y.b
            );
        },
        
        not: function bitnot(x){
            return new Color( clamp(BYTE3-x.int(), 0, BYTE3) );
        },
        
        and: function bitand(x,y){
            return new Color( clamp(x.int() & y.int(), 0, BYTE3) );
        },
        
        or: function bitor(x,y){
            return new Color( clamp(x.int() | y.int(), 0, BYTE3) );
        },
        
        xor: function bitxor(x,y){
            return new Color( clamp(x.int() ^ y.int(), 0, BYTE3) );
        },
        
        random: function random() {
            return new Color(Math.floor(Math.random()*BYTE3));
        },
        
        clone: function clone(c) {
            return new Color( c.r, c.g, c.b, c.a );
        }
    };
        
    /*** Validation ***/
    var vld = {
            
        hex: function isvalidHex(str) {
            return (typeof(str)=='string') && /^\s*#?[a-fA-F0-9]{1,6}\s*;?$/.test(str);
        },
        
        int: function isvalidFlatInt(n) {
            return (typeof(n)=='number') && (0<=n) && (n<=BYTE3);
        },
        
        rgb: function isvalidRGB() {
            var retval = true;
            for (var i in arguments) {
                retval &= vld.byte(arguments[i]);
            }
            return retval;
        },
        
        byte: function isvalidByte(n) {
            return (typeof(n)=='number') && (0<=n) && (n<=BYTE);
        },
        
        color: function isvalidColor(c) {
            return (
                vld.hex(c.hex) &&
                vld.int(c.int()) &&
                vld.byte(c.r) &&
                vld.byte(c.g) &&
                vld.byte(c.b)
            );
        }
    };
    
    /*** Parsing ***/
    var parse = {
        hex: function parseHex(x) {
            // Remove whitspace and hash sign
            x = x.replace(/[\s#;]*/g,'');
            // Handle 3-digit shorthand
            if (x.length==3) {
                var r = x.charAt(0);
                var g = x.charAt(1);
                var b = x.charAt(2);
                x = r+r + g+g + b+b;
            }
            // Left pad with zeros
            while (x.length < 6) {
                x = '0'+x;
            }
            return x;
        },
        
        int: function parseFlatInt(n) {
            var i = parseInt(n);
            if (isNull(i)) return 0;
            return clamp(n, 0, BYTE3);
        },
        
        rgb: function parseRGB(r,g,b) {
            return { 
                r: parse.byte(r), 
                g: parse.byte(g), 
                b: parse.byte(b)
            };
        },
        
        rgba: function parseRGBA(r, g, b, a) {
            return { 
                r: parse.byte(r), 
                g: parse.byte(g), 
                b: parse.byte(b),
                a: parse.unit(a)
            };
        },
        
        unit: function parseUnit(n) {
            var i = parseFloat(n);
            if (isNull(i)) return 1;
            return clamp(i, 0, 1);
        },
        
        byte: function parseByte(n) {
            var i = parseInt(n);
            if (isNull(i)) return 0;
            return clamp(i, 0, BYTE);
        }
    }
    
    /*** Conversion ***/
    var cnv = {
        hex_int: function hexToInt(x){
            var hex = parse.hex(x);
            return parseInt(hex, 16);
        },
        
        hex_rgb: function hexToRgb(x){
            var int = cnv.hex_int(x);
            return cnv.int_rgb(int);
        },
        
        int_hex: function intToHex(n){
            var int = parse.int(n);
            return parse.hex(int.toString(16));
        },
        
        int_rgb: function intToRgb(n){
            var int = parse.int(n);
            return {
                r: (int & 0xff0000) >> 16,
                g: (int & 0x00ff00) >> 8,
                b:  int & 0x0000ff
            }
        },
        
        rgb_hex: function rgbToHex(r,g,b){
            var int = cnv.rgb_int(r,g,b);
            return cnv.int_hex(int);
        },
        
        rgb_int: function rgbToInt(r,g,b){
            return (parse.byte(r) << 16) + 
                    (parse.byte(g) << 8) + 
                    parse.byte(b);
        },
        
        byte_unit: function byteToUnit(n) {
            return parse.byte(n)/BYTE;
        },
        
        unit_byte: function unitToByte(n) {
            return parse.byte(n*BYTE);
        }
    };

    /*** Blending ***/
    
    var blend = (function(){
        
        function makeBlender(op) {
            return function(x,y){
                return new Color(
                    cnv.unit_byte( 
                        op( cnv.byte_unit(x.r), cnv.byte_unit(y.r) )
                    ),
                    cnv.unit_byte( 
                        op( cnv.byte_unit(x.g), cnv.byte_unit(y.g) )
                    ),
                    cnv.unit_byte( 
                        op( cnv.byte_unit(x.b), cnv.byte_unit(y.b) )
                    )
                );
            };
        }
        
        return {
            multiply: makeBlender(function(a, b){
                return a*b;
            }),
            
            screen: makeBlender(function(a, b){
                return (1 - (1-a) * (1-b) );
            }),
            
            overlay: makeBlender(function(a, b){
                if (a < 0.5) {
                    return (2 * a * b);
                }
                return ( 1 - 2 * (1-a) * (1-b) );
            }),
            
            hardLight: makeBlender(function(a, b){
                if (b < 0.5) {
                    return (2 * b * a);
                }
                return ( 1 - 2 * (1-b) * (1-a) );
            }),
            
            divide: makeBlender(function(a, b){
                return a/b;
            }),
            
            addition: makeBlender(function(a, b){
                return a+b;
            }),
            
            subtract: makeBlender(function(a, b){
                return a-b;
            }),
            
            difference: makeBlender(function(a, b){
                return a>b ? a-b : b-a;
            }),
            
        };
    })();
    
    function clamp(val, min, max) {
        if (val > max) val = max;
        if (val < min) val = min;
        return val;
    }
    
    function isNull(v) {
        return (v==undefined) || isNaN(v) || !isFinite(v);
    }
    
    /*** Static Properties ***/
    Color.util = util;
    
    Color.inv = util.not;
    Color.add = util.add;
    Color.avg = util.avg;
    Color.sub = util.sub;
    Color.and = util.and;
    Color.or = util.or;
    Color.xor = util.xor;
    Color.random = util.random;
    
    Color.rgb = function(r,g,b) {
        return new Color(
            parse.byte(r),
            parse.byte(g),
            parse.byte(b)
        );
    };
    Color.rgba = function(r,g,b,a) {
        return new Color(
            parse.byte(r),
            parse.byte(g),
            parse.byte(b),
            parse.byte(a)
        );
    };
    
    Color.WHITE =   new Color(0xffffff);
    Color.RED =     new Color(0xff0000);
    Color.GREEN =   new Color(0x00ff00);
    Color.BLUE =    new Color(0x0000ff);
    Color.YELLOW =  new Color(0xffff00);
    Color.CYAN =    new Color(0x00ffff);
    Color.MAGENTA = new Color(0xff00ff);
    Color.BLACK =   new Color(0x0);
    Color.TRANSPARENT = new Color(0,0,0,0);
    
    /** Return constructor **/
    return Color;
})();

// #19CB97
// 162.4, 0.779, 0.447
// 162.4 198.645, 113.985
function getHSL(color) {
    var H = 0;
    var S = 0;
    var L = 0;
    
    var r = color.r;
    var g = color.g;
    var b = color.b;
    
    var min = 255;
    var max = 0;
    var arr = [r,g,b];
    
    for (var i in arr) {
        if (arr[i] > max) max = arr[i];
        if (arr[i] < min) min = arr[i];
    }
    
    var chroma = parseFloat(max-min);
    
    var H = 0;
    
    if ( r>g && r>b ) {
        H = ((g-b)/chroma) % 6;
    }
    else if (g>r && g>b) {
        H = ((b-r)/chroma) + 2;
    }
    else if (b>r && b>g) {
        H = ((r-g)/chroma) + 4;
    }
    
    H = 60*H;
    L = (max + min) / 2;
    
    if (L <= 127.5) {
        S = 255*chroma/(2*L);
    }
    else {
        S = 255*chroma/(2 - 2*L);
    }
    
    return {
        h: H,
        s: S,
        l: L
    };
}


