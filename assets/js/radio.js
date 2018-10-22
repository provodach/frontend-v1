/*
	I use SoundManager 2 by schillmania.com (thank you!)
*/

var RADIO_CURRENT_TRACK;

function rnd(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randword()
{
    var s = '';
    var ltr = 'qwertyuiopasdfghjklzxcvbnm';
    while (s.length < 20)
    {
        s += ltr[rnd(0, 20)];
    }
    return s;
}

// Radio Player. Driven by SoundManager
var radioPlayer = null;
var playerReady = false,
	currentChannel = 'provodach',
	volBarFadeTimer = null;

function radioInit()
{
	try
	{
		soundManager.setup(
		{
			url: '//api.nyan.pw/smswf/',
			// We'll try to use HTML5 instead of Flash
			preferFlash: false,
			
			//debugMode : true, debugFlash : true,
			
			ontimeout: function ()
			{
				error('Error: Radio engine cant start up.');
			},
			
			onready: function() {
				// We are ready to play!
				playerReady = true;
				setupVolumeControl(); 	
				
				// Restore volume settings
				radioSetVolume(radioGetVolume(), false);
				
				
				// Initialize track info.
				requestTrackInfo();
				
				// Restore radio player status
				if (parseInt(getVal('player_on')) === 1)
					radioPlay(currentChannel);
				
				
				
			}
		});


	}
	catch (e)
	{
		error ("Error: " + e.message);
		playerReady = false;
	}
}

function wheelVolControl(objEvent, intDelta)
{
	objEvent.preventDefault();
	var chg = (intDelta > 0) ? 5 : -5;
	radioSetVolume(radioGetVolume() + chg, true);
}

function setupVolumeControl()
{
	$('#player-trackinfo-handler').mousewheel(wheelVolControl);
	$('#volume-dots').mousewheel(wheelVolControl);
}

function radioPlay(channel)
{

    channel = channel || 'stream';
	
	if (playerReady)
	{
		// Create a player object
		radioPlayer = soundManager.createSound(
		{
			id: 'radio',
			allowScriptAccess: 'always',
			volume: radioGetVolume(),
			// 							 Fuck the cache in its dirty ass!!!!!11`1
			url: '//radio.nyan.pw/station/' + channel + '?' + randword()
		});
		radioPlayer.play();
		
		$('#player-control').attr('class', 'player-control-playing');
		
		setVal('player_on', 1);
	}
		else
	error ('ERR: Still loading');
}

function radioStop()
{
	if (playerReady)
	{
		radioPlayer.stop();
		radioPlayer.destruct();
		// Restruct, lol :D
		// Hi to Tesaque

		// Make an object to be NULL to get radioToggle() correct work
		radioPlayer = null;
		$('#player-control').attr('class', 'player-control-stalled');
		
		setVal('player_on', 0);
	}
		else
	error ('ERR: Still loading');
}


function radioGetVolume()
{
    
	if (radioPlayer != null)
		return radioPlayer.volume;
		
	var savedVol = getVal('volume');
    if (savedVol == null)
        return 100;
    else
        return parseInt(savedVol);
}

function radioSetVolume(value, userAct)
{
	userAct = userAct || false;
	if (value > 100)
		value = 100;
	else if (value < 0)
		value = 0;
			
    if (radioPlayer != null)
    {
        radioPlayer.setVolume(value);
    }
		
	if (userAct)
	{
		radioSaveVolume(value);
	}
	
	setVolValue(value);
}

function radioSaveVolume(value)
{
    setVal('volume', value);
}

function radioToggle(channel)
{
	channel = channel || currentChannel;
	if (!playerReady)
	{
		error ('ERR: Still loading');
		return false;
	}
    if (radioPlayer == null)
    {
        try
        {
            radioPlay(channel);
        }
        catch (e)
        {
            error('ERR: ' + e.message);
        }
    }
    else
    {
        try
        {
            radioStop();
        }
        catch (e)
        {
            error('ERR: ' + e.message);
        }
    }
}

function setVolValue(value)
{
    var max = 10;
	
	value = Math.floor(value / 10);
	
    if (value > max)
        return;
	
	$('.volume-dot').css({color:'#909090'});
	
    for (i = 1; i <= value; i++)
	{
		$('#bullet-'+i).css({color:'#f5f5f5'});
	}
}


function requestTrackInfo()
{
	setTimeout(requestTrackInfo, 15000);

    $.ajax(
    {
        url: '//api.nyan.pw/info/radio-track.php?mount='+currentChannel,
        dataType: 'json',
        crossDomain: true
    }).done(
        function (data)
        {
            processResult(data);
        }
    ).fail(function(jq, jx) { setTrackInfo('- bad track data -') });
}


function processResult(csRes)
{
	
	if (tempShowing)
		return;
	
	try
	{
		var a = csRes["track"];
	}
	catch (e)
	{
		$("#player-trackinfo").text('- bad server response -');
		return;
	}

    if (a == null || typeof a == 'undefined')
    {
        $("#player-trackinfo").text('- server\'s down -');
        return;
    }

    if (a == "" || a == '-')
	{
        a = "- no title -";
	}
	
	if (a != RADIO_CURRENT_TRACK)
	{

		RADIO_CURRENT_TRACK = a;
		setTrackInfo (a);
	}
}

function shstr (s) {
    var a = s.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function setTrackInfo (track)
{
	$("#player-trackinfo").attr('title', track);
	$("#player-trackinfo").attr('href', 'https://vk.com/audio?q='+encodeURIComponent(track));
	
	// track = shstr(track);
	
	if (track.length > 35)
		track = track.substr(0, 35)+'...';

	$("#player-trackinfo").text(track);
}