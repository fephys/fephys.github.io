function d2r(x) {
    return Math.PI*x/180.0
}

function r2d(x) {
    return 180.0*x/Math.PI
}

function s2d(x) {
    return 360.0*x/86400.0
}

function df(x) {
    return x.toFixed(3);
}

function dnorm(x) {
    if (x < 0.0) x+=360;
    return x;
}


function setfields(prefix,value) {
    var o = value % 10;
    var t = (value / 10) | 0; // force to integer...
    return ''+t+o;
}

/* Equation of time, in seconds; input in ms */
function solaroffset(base) {
    var t = (base / 1000.0),
	t = t / (86400.0 * 36525.0);
    var l = 280.460 + 36000.770 * t;
    while (l < -180.0) l += 360.0;
    while (l > 360.0) l -= 360;
    var g = 357.528 + 35999.050 * t;
    while (g < -180.0) g += 360.0;
    while (g > 360.0) g -= 360;
    var lr = l * (Math.PI / 180.0);
    var gr = g * (Math.PI / 180.0);
    var m = l + 1.915 * Math.sin (gr) + 0.020 * Math.sin (2.0 * gr);
    var mr = m * (Math.PI / 180.0);
    var e = -1.915 * Math.sin (gr) - 0.020 * Math.sin (2.0 * gr)
	+ 2.466 * Math.sin (2.0 * mr) - 0.053 * Math.sin (4.0 * mr);
    e *= 240; /* Four minutes per degree */
    return e * 1000.0;
}
