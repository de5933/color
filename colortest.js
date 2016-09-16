function setBg(c) {
    document.body.style.backgroundColor = c;
}

function colortest(){
    var c;
    var passed = 0;
    var failed = 0;
    
    function assert(actual, expected) {
        if (typeof(actual)=='object') actual = JSON.stringify(actual);
        if (typeof(expected)=='object') expected = JSON.stringify(expected);
        if (actual === expected) {
            passed++;
            return true;
        }
        console.error('Actual: ' + actual + '\t Expected: ' + expected);
        failed++;
        return false;
    }
    
    function assertError(funct, expectederror) {
        var result = '';
        try {
            funct();
        }
        catch (e) {
            result = e[0];
        }
        assert(result, expectederror);
    }
    
    function rgb(r,g,b) {
        return { _r:r, _g:g, _b:b, _a:1 };
    };
    
    function rgba(r,g,b,a) {
        return { _r:r, _g:g, _b:b, _a:a };
    };
    
    // Valid hex constructors
    assert(new Color('#0077ff'), rgb(0,119,255) );
    assert(new Color('0077ff'), rgb(0,119,255) );
    assert(new Color('#07f'), rgb(0,119,255) );
    assert(new Color('07f'), rgb(0,119,255) );
    
    // Valid int constructors
    assert(new Color(0x0077ff), rgb(0,119,255) );
    assert(new Color(30719), rgb(0,119,255) );
    assert(new Color(255), rgb(0,0,255) );
    assert(new Color(0), rgb(0,0,0) );
    assert(new Color(), rgb(0,0,0) );
    
    // Valid rgba constructors
    assert(new Color(0, 119, 255), rgb(0,119,255) );
    assert(new Color(0, 119, 255, 0.3), rgba(0,119,255,0.3) );
    assert(new Color({r:0, g:119, b:255}), rgb(0,119,255) );
    assert(new Color({r:0, g:119, b:255, a:0.3}), rgba(0,119,255,0.3) );
    assert(new Color(5,5,5,0), rgba(5,5,5,0) );
    assert(new Color(5,5,5,null), rgba(5,5,5,1) );
    
    // Invalid constructors
    assertError(function(){ Color(0xffcc9977); }, 'InvalidArgumentsException');
    assertError(function(){ Color(16, 32, 64, 128, 255); }, 'InvalidArgumentsException');
    
    var c0 = new Color(0x0077ff);
    
    // Conversions
    assert(c0.hex(), '0077ff');
    assert(c0.toString(), '#0077ff');
    
    c0._a = 0.4;
    assert(c0.hex(), '0077ff');
    assert(c0.toString(), 'rgba(0,119,255,0.4)');
    
    var c1 = new Color(255, 200, 64, 0.7);
    
    assert(c1.hex(), 'ffc840');
    assert(c1.toString(), 'rgba(255,200,64,0.7)');
    assert(c1.valueOf(), 0xffc840);
    
    // Operations
    assert(c0.not(), rgb(255, 136, 0) );
    assert(c0.add(c1), rgb(255, 255, 255) );
    assert(c0.sub(c1), rgb(0, 0, 191) );
    assert(c0.and(c1), rgb(0, 64, 64) );
    assert(c0.or(c1), rgb(255, 255, 255) );
    assert(c0.xor(c1), rgb(255, 191, 191) );
    
    // Getters and Setters
    assert( c0.r(5), rgba(5,119,255,0.4) );
    assert( c0,      rgba(5,119,255,0.4) );
    assert( c0.r(), 5);
    assert( c0.g(6), rgba(5,6,255,0.4) );
    assert( c0,      rgba(5,6,255,0.4) );
    assert( c0.g(), 6);
    assert( c0.b(7), rgba(5,6,7,0.4) );
    assert( c0,      rgba(5,6,7,0.4) );
    assert( c0.b(), 7);
    assert( c0.a(0.8), rgba(5,6,7,0.8) );
    assert( c0,      rgba(5,6,7,0.8) );
    assert( c0.a(), 0.8);
    
    console.log('Passed: ' + passed);
    console.log('Failed: ' + failed);
}

