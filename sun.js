var lati = 52.035746;
var longi = -2.42878210;

function showloc() {
    document.getElementById('lat').innerHTML=''+Math.abs(longi);
    document.getElementById('east').innerHTML=(longi >= 0) ? 'east' : 'west'
}

function askloc() {

    document.getElementById('east').innerHTML='east &middot; querying';
    navigator.geolocation.getCurrentPosition(
	function(loc) {
	    console.log('co:'+loc.coords);
	    longi = loc.coords.longitude;
	    lati = loc.coords.latitude;
	    if (isNaN(longi)) {
		longi = 0.0;
	    }
	    if (isNaN(lati)) {
		lati = 0.0;
	    }
	    showloc();
	},
	function(err) {
	    console.log('err:'+err.coords);
	    document.getElementById('east').innerHTML='east &middot; query failed: ' + err.message;
	}
    );
}

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

function tack() {
    var d=new Date();
    var t=d.getTime();
    t += 240000.0 * longi;      /* Offset from Greenwich */
    var ld=new Date(t);
    var m=1050-ld.getMilliseconds();
    if (m < 500) m += 1000;
    window.setTimeout(tack,m);
    var z=''+
	setfields('h',ld.getUTCHours())+':'+
	setfields('m',ld.getUTCMinutes())+':'+
	setfields('s',ld.getUTCSeconds());
    // var s='['+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'] '+m+z;
    document.getElementById('med').innerHTML=z;
}

function tock() {
    var d=new Date();
    var t=d.getTime();
    var m=1050-d.getMilliseconds();
    if (m < 500) m += 1000;
    window.setTimeout(tock,m);
    var z=''+
	setfields('h',d.getHours())+':'+
	setfields('m',d.getMinutes())+':'+
	setfields('s',d.getSeconds());
    document.getElementById('time').innerHTML=z;
}

function tick() {
    var d = new Date();
    var t0 = d.getTime();
    var so = solaroffset(t0);
    var t = t0 + so;

    /* Offset from Greenwich (in ms) */
    t += 240000.0 * longi;

    var ld=new Date(t0);
    var m=1050-ld.getMilliseconds();
    if (m < 500) m += 1000;
    window.setTimeout(tick,m);
    var z=''+
	setfields('h',ld.getUTCHours())+':'+
	setfields('m',ld.getUTCMinutes())+':'+
	setfields('s',ld.getUTCSeconds());
    // var s='['+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'] '+m+z;
    document.getElementById('sol').innerHTML=z;

    t0 /= 1000.0;
    so /= 1000.0;

    i = s2d((t0+43200)%86400)

    //i += longi;
    i += s2d(so)

    s='i: ' + df(i);
    s+='<br>so: ' + df(so);
    s+='<br>t: ' + df(t0);
    s+='<br>hour: ' + df((t0 / 3600.0) % 24.0);

/*
puts "d: #{((t-T0)/TP/86400.0)}"
el=                             23.6  *Math.sin(2*Math.PI*(t-T0)/TP)
puts "el:#{el}"
*/
    var TP=31557600.0;
    var T0=1640084400.0+TP/4;
    
    var el=r2d(Math.asin(Math.sin(d2r(23.4))*Math.sin(2*Math.PI*(t0-T0)/TP)))

    s+='<br>long: ' + df(longi) + ' lat: ' + df(lati);
    s+='<br>el: ' + df(el);

    var x=Math.cos(d2r(i))*Math.cos(d2r(el))
    var y=Math.sin(d2r(i))*Math.cos(d2r(el))
    var z=Math.sin(d2r(el))

    s+='<br>zero up: ' + df(x);
    s+=' west: ' + df(y);
    s+=' north: ' + df(z);

    var lat=d2r(lati);
    var sl=Math.sin(lat)
    var cl=Math.cos(lat)

    var xr=x*cl+z*sl // elevation
    var yr=y         // West
    var zr=z*cl-x*cl // South

    s+='<br>local elev: ' + df(xr);
    s+=' west: ' + df(yr);
    s+=' north: ' + df(zr);

    var ang=r2d(Math.atan2(xr,Math.sqrt(yr*yr+zr*zr)))
    var azi=r2d(Math.atan2(yr,-zr))

    document.getElementById('log').innerHTML=s;
    document.getElementById('pos').innerHTML=
	"Elev: " + df (ang) + "<br>Azimuth: " + df(azi + 180.0);
}

window.setTimeout(tick,100);
window.setTimeout(tack,100);
window.setTimeout(tock,100);

showloc();
