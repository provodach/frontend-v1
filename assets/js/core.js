var localStorageAvailable = false;

function init()
{
	localStorageAvailable = isLSAvailable();
	
	radioInit();
	// enmarquee();
}

function error (tx)
{
	alert (tx);
	// TODO: Normal error message show
}

function enmarquee()
{
	$('#player-trackinfo').marquee().destroy();
	
	$('#player-trackinfo').marquee({
			delayBeforeStart : 5000,
			pauseOnHover : true,
			pauseOnCycle : true
	});
}


function loadContent(name)
{
	$.ajax({url: '/'+name+'?ajax',}).done(function (c) {showContent(name, c);}).fail(function(jq, jx) {error ('ERR: '+jx);});
	return false;
}

function showContent (name, content)
{
	history.pushState(null, null, name);
	
	if (typeof saria_disconnect == 'function')
		saria_disconnect();
	
	$('#content').html(content);
}

$(document).ready(init);