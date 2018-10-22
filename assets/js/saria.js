/*
	Saria :: A WebSocket client for Airin Chat daemon.
	  Based on airin.js from Airin/3.3.0-nyanserver
	  Made by IDENT Software ~ http://identsoft.org
	  
	To get how it works, visit Airin API documentation page:
	https://wiki.nyan.pw/Airin/API
*/
var
	sariaSocket = null,
	
	sariaSettings = {
		server               : 'api.nyan.pw',
		port                 : 1337,
		secure               : true,
		authCode             : '',
		userName             : '',
		logCount             : 20,
		messagesQueueLength  : 50,
		defaultColor         : '1CBAE1',
		readonly             : false,
		connectRetries       : 5
	},
	
	sariaStatus = {
		ready: false,
		authorized: false,
		lastMessageCode: '',
		nowSending: false,
		connectRetries: 0,
		allowAutoscroll: true,
		maxMessageId : 0,
		minMessageId : 0,
		messagesLeft : 0,
		currentCommandPosition : -1
	},
	
	messagesQueue   = [],
	commandsHistory = [],
		
	SARIA_VERSION   = '4.0.6',
	AIRIN_API_LEVEL = 2;


function autoScroll(appendedId)
{
	appendedId = appendedId || -1;
	
	if (sariaStatus.allowAutoscroll)
	{
		$('#content').scrollTop($('#chat-messages').get(0).scrollHeight);
	}
	else
	{
		if (appendedId > -1)
		{
			var apdBlock = $('#mesg-'+appendedId),
				cntBlock = $('#content');
				
				cntBlock.scrollTop(cntBlock.scrollTop() + apdBlock.height());
		}
	}
}

function toggleSettings()
{
	var cab = $('#chat-settings'),
		txt = $('#chat-text');
		
	if (cab.is(':visible'))
		cab.fadeOut(100, function() {txt.fadeIn(100)});
	else
		txt.fadeOut(100, function() {cab.fadeIn(100)});
}


function checkUserName(un)
{
	un = un || '';
	var isUserNameOk = ((un.search(/^[a-zA-Z0-9]{3,20}$/, un) > -1) || (!un));
	$('#username').css({'border-bottom':'1px solid #'+(isUserNameOk ? 'f5f5f5' : 'f02020')});
	return (isUserNameOk ? un : '_NULL');
}

function setUserName(enterPressed)
{
	sariaSettings.userName = checkUserName($('#username').val());
	if (sariaSettings.userName != '_NULL')
	{
		setVal('username', sariaSettings.userName);
		if (enterPressed)
			saria_sendCommand('IAM #'+sariaSettings.userName);
	}
}

function restoreUserName()
{
	sariaSettings.userName = checkUserName(getVal('username'));
	$('#username').val(sariaSettings.userName);

	if (sariaSettings.userName && sariaStatus.authorized)
	{
		saria_sendCommand('IAM #'+sariaSettings.userName);
	}
}

function mentionId(id)
{
	var cm = $('#chat-text');
	cm.val('>>'+id+' '+cm.val());
	cm.focus();
}

function highlightId(id, active)
{
	var
		color = (active) ? '#505050' :
		(containsMyMessage($('#chat-content-'+id).text()) ? 'rgba(70, 70, 70, 0.35)' : 'transparent');
		
	$('#mesg-'+id).css({background:color});
}

function addMyMessage (id)
{
	messagesQueue.unshift (id);
	
	if (messagesQueue.length > sariaSettings.messagesQueueLength)
		messagesQueue.pop();
}

function containsMyMessage(mesg)
{
	var myMesgLength = messagesQueue.length;
	
	for (i = 0; i < myMesgLength; i++)
	{
		if (mesg.indexOf('>>'+messagesQueue[i]) > -1)
			return true;
	}
	
	return false;
}

function messagesScrolled(ev)
{
	var conblock = $('#content');
	if (ev.originalEvent && !conblock.is(':animated'))
	{
		sariaStatus.allowAutoscroll = ((conblock.scrollTop() + conblock.innerHeight()) >= conblock[0].scrollHeight);
	}
}

function messagesWheeled (ev, delta)
{	
	if ($('#content').scrollTop() == 0 && delta > 0 && sariaStatus.messagesLeft <= 0)
	{
		sariaStatus.messagesLeft = sariaSettings.logCount;
		saria_sendCommand('LOG '+sariaSettings.logCount+' '+(sariaStatus.minMessageId - sariaSettings.logCount)+' DESC');
	}
}

function saria_goReadonly()
{
	$('#chat-authorized').hide();
	$('#chat-readonly').show();
	sariaSettings.readonly = true;
	saria_reconnect();
}

function saria_toggleAuth(showAuth)
{
	(showAuth) ? $('#chat-auth').show() : $('#chat-auth').hide();
	(showAuth) ? $('#chat-messages').hide() : $('#chat-messages').show();
}

function saria_setServiceMessage(mesg)
{
	$('#chat-service-message').text(mesg);
}

function saria_startReconnect(reconnectingText)
{
	if (sariaStatus.connectRetries > sariaSettings.connectRetries)
	{
		saria_sysmessage ('Попытались переподключиться несколько раз, но не судьба.', 'error');
		return;
	}
	setTimeout(saria_reconnect, 5000);
	sariaStatus.connectRetries++;
}

	
/*
	Saria/Airin Error codes
	
	[1xx] System Errors
		100 Socket is already connected
		101 No parameters
		102 Could not create websocket
		103 Not connected
		199 Bad server command / System Error

	[2xx] Server-generated errors
		200 Not Authorized
		201 Auth failed
		202 User is banned
		203 Bad username
		204 No or very long message
		205 Flood limit reached, see next number
		206 No messages to display
		299 Syntax error / Internal Server error
*/

function saria_sysmessage(message, type)
{
	type = type || 'info';
	$('#chat-messages').append('<div class="service-message '+type+'">'+message+'</div>');
	autoScroll();
}

function saria_error (code, message)
{
	switch (+code)
	{
		case 200 :
		case 201 :
			saria_toggleAuth(true);
			break;
			
		case 202 :
			alert(message);
			saria_toggleAuth(true);
			break;
		case 203 :
			saria_sysmessage('Ник не может содержать никаких символов кроме латиницы и цифр.', 'warning');
			break;
			
		case 204 :
			saria_sysmessage('Сообщение слишком длинное или состоит из целого ничего!', 'warning');
			break;
			
		case 205 :
			saria_sysmessage('Упырь мел! Держи себя в руках, ковбой! Помедленнее!', 'warning');
			break;
		
		case 1000:
		case 1001:
			break;
			
		default:
			if (code > 1001)
			{
				saria_sysmessage('Сокет порвался неправильно, перезапускаем...', 'warning');
				saria_startReconnect();
			}
			break;
	}
	
	
}

function saria_log (message)
{
	console.log(message);
}

function saria_resetStatus()
{
	sariaStatus = {
		ready: false,
		authorized: false,
		lastMessageCode: '',
		nowSending: false,
		connectRetries: 0,
		allowAutoscroll: true,
		maxMessageId : 0,
		minMessageId : 0,
		messagesLeft : 0,
		currentCommandPosition : -1
	};
	
	messagesQueue = [],
	commandsHistory = [];
}

function saria_init(auth)
{
	sariaSettings.authCode = (auth) ? auth : ((getVal('auth_code')) ? getVal('auth_code') : '');
	
	if (auth)
	{
		setVal('auth_code', auth);
		history.pushState(null, null, 'chat');
	}
	
	$('#chat-text').keydown(function(e)
	{		
		switch (e.keyCode)
		{
			case 13 : // enter
			case 10 : // enter alternative
				if (!e.shiftKey)
				{
					e.preventDefault();
					saria_sendMessage();
					return false;
				}
				break;
			
			case 38 : // up
				e.preventDefault();
				
				if (commandsHistory.length > 0)
				{
					if (sariaStatus.currentCommandPosition < commandsHistory.length - 1)
					{
						sariaStatus.currentCommandPosition++;
						if (sariaStatus.currentCommandPosition < commandsHistory.length)
							$('#chat-text').val(commandsHistory[sariaStatus.currentCommandPosition]);
					}
				}
				
				return false;
				
				break;
				
			case 40 : // down
				e.preventDefault();
				
				if (commandsHistory.length > 0)
				{
					
					if (sariaStatus.currentCommandPosition >= 0)
					{
						sariaStatus.currentCommandPosition--;
						
						if (sariaStatus.currentCommandPosition <= -1)
							$('#chat-text').val('');
						else
						{
							$('#chat-text').val(commandsHistory[sariaStatus.currentCommandPosition]);
						}
					}
				}
				
				return false;
				
			break;
		}
	});
	
	$('#content').on('scroll', (messagesScrolled));
	
	$('#content').mousewheel(messagesWheeled);
	
	$('#username').keydown(function(e)
	{
		setUserName(e.keyCode == 13 || e.keyCode == 10);
	});
	
	$('#username').blur(function()
	{
		setUserName(true);
	});
	
	
	restoreUserName();
	
	if (sariaSettings.authCode)
	{
		saria_toggleAuth(false);
		saria_connect();
	}
	else
		saria_toggleAuth(true);
}

function saria_connect()
{	
	if (sariaSocket)
	{
		saria_error(100, 'Saria Socket is already connected. Disconnect it first!');
		return;
	}

	if (!('WebSocket' in window))
	{
		saria_error (199, 'No WebSocket support!');
		return;
	}
	
	saria_resetStatus();
		
	if (!sariaSettings.server || !sariaSettings.port)
		{
			saria_error (101, 'No server and/or port specified!');
			return;
		}
	
	saria_log ('Welcome to Saria Chat Client. I\'ll use WebSocket, may I? :3');
	try
	{
		sariaSocket = new WebSocket((sariaSettings.secure ? 'wss' : 'ws')+'://'+sariaSettings.server+':'+sariaSettings.port);
		sariaSocket.onmessage = function (ev) { saria_getCommand(ev.data); };
		sariaSocket.onclose = function (ev) { saria_error(ev.code, (ev.reason) ? ev.reason : 'Websocket disconnected itself'); };
	}
	catch (e)
	{
		saria_error (102, 'WebSocket creation failed: '+e.message);
		return;
	}
}

function saria_disconnect()
{
	if (sariaSocket)
	{
		sariaStatus.ready = false;
		sariaSocket.close (1000);
		sariaSocket = null;
	}
}

function saria_reconnect()
{
	if (!sariaSettings.server || !sariaSettings.port)
	{
		saria_error(103, 'Cannot reconnect without settings! Try connecting first.');
	}
	saria_disconnect();
	saria_connect();
}

function saria_sendCommand (command)
{
	if (sariaSocket)
	{
		saria_log ('Client command: '+command);
		sariaSocket.send(command);
		return true;
	}
		else
	{
		saria_error(103, 'Saria is not connected, cannot send message.');
		return false;
	}
}

// go fcuk urself zalgoautists
function saria_unzalgo (text)
{
	return text.replace(/[\u0300-\u036f\u0483-\u0489\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/gm, '');
}

// Special for Ree.
// AWWWW SHIT NIGGA! NESTED SPOILER PROCESSING IN JS! OH MY GODEENSS!!11!!
// Yeah, it's very very very very extremely shitty. Sorry guys.
function saria_spoiler (text)
{
	var patt = new RegExp ('\\[spoiler\\](.+)\\[\\/spoiler\\]', 'im');
    
    while (text.search(patt) > -1)
    {
        text = text.replace('[spoiler]', '<span class="chat-spoiler">');
        text = text.replace('[/spoiler]', '</span>');
    }
    
    return text;
}

function saria_sanitize(message)
{
	var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		
	message = message.replace(/[&<>"']/g, function(m) { return map[m]; });
	
	return saria_unzalgo(message);
}

function saria_processMessage(message)
{
	message = saria_sanitize(message);
	
	var parsePatterns = [
			'\\[b\\](.+?)\\[/b\\]', // b
			'\\[i\\](.+?)\\[/i]', // i
			'\\[u\\](.+?)\\[/u\\]', // u
			'\\[s\\](.+?)\\[/s\\]', // s
			'\\[sub\\](.+?)\\[/sub\\]', // sub
			'\\[sup\\](.+?)\\[/sup\\]', // sup
			'&gt;&gt;([0-9]{1,10})', // mention
			'(https?:\\/\\/([a-zA-Z0-9\\-\\.]+)\\/?[a-zA-Z0-9?&=.:;\\#\\/\\-_~%+]*)', // url
			'^&gt;(.*)$',// , // quotation
		    '^#!(.*)$' // redline
			];
			
		var parseReplaces = [
			'<b>$1</b>', // b
			'<i>$1</i>', // i
			'<u>$1</u>', // u
			'<s>$1</s>', // s
			'<sub>$1</sub>', // sub
			'<sup>$1</sup>', // sup
			'<a href="javascript:void(0)" class="chat-mention" onmouseover="highlightId(\'$1\', true);" onmouseout="highlightId(\'$1\', false);">&gt;&gt;$1</a>', // mention
			'<a href="$1" title="$1" target="_blank">$2</a>', // url
			'<span class="chat-quote">&gt;$1</span>', // quotation
			'<span class="redline">$1</span>', // redline
			];
			
		for (i = 0; i < parsePatterns.length; i++)
		{
			message = message.replace(new RegExp(parsePatterns[i], 'gim'), parseReplaces[i]);
		}
		
		message = saria_spoiler(message);
		
		// Special replacements
		message = message.replace (/h3sot/gi, '<b>H<sub>3</sub>S&Ouml;T</b>');
		message = message.replace (/\(c\)/gi, '&copy;');
		message = message.replace (/\(r\)/gi, '&reg;');
		message = message.replace (/\(tm\)/gi, '&trade;');
		message = message.replace (/\s+--\s+/g, ' &mdash; ');
		message = message.replace (/&lt;&lt;([a-zA-Z\u0400-\u04ff]+)(&gt;&gt;)/gi, '&laquo;$1&raquo;');
	
	return message;
}


function saria_getCommand (command)
{
	saria_log('Server command: '+command);
	var commands = command.split (' '),
		fulltext = command.substr(command.indexOf('#')+1),
		mainCmd = commands[0];
	
	switch (mainCmd)
	{
		case 'INIT' :
			saria_log ('You are using '+fulltext);
			saria_sendCommand('LEVEL '+AIRIN_API_LEVEL);
			saria_sendCommand('CONNECT '+(sariaSettings.readonly ? 'READONLY' : sariaSettings.authCode)+' #Saria/'+SARIA_VERSION);
			saria_setServiceMessage('Проверяю авторизацию...');
			break;
			
		case 'AUTH' :
			switch (commands[1])
			{
				case 'OK' :
				case 'READONLY':
					if (sariaSettings.readonly)
					{
						$('#chat-authorized').hide();
						$('#chat-settings-button').hide();
						$('#chat-readonly').show();
					}
					else
					{
						$('#chat-authorized').show();
						$('#chat-settings-button').show();
						$('#chat-readonly').hide();
						sariaStatus.authorized = true;
						
						if (sariaSettings.userName)
							saria_sendCommand('IAM #'+sariaSettings.userName);
					}
						
					$('#chat-messages').html('');
					saria_toggleAuth(false);
					saria_sendCommand('LOG '+sariaSettings.logCount+' DESC');
					break;
					
				case 'FAIL' :
					saria_setServiceMessage('Не удалось авторизоваться: '+fulltext);
					saria_error (201, fulltext);
					saria_toggleAuth(true);
					break;
					
				case 'BANNED' :
					saria_setServiceMessage('Ты заблокирован, прости.');
					saria_error (202, fulltext);
					break;
			}
			break;
			
		case 'CONTENT' :
		case 'LOGCON'  :
		
			if (commands.length < 5)
			{
				saria_error(199, 'Server sent bad data');
				break;
			}
			
			var stamp = new Date(+commands[2]*1000),
				time  = ((stamp.getHours() < 10) ? '0' : '')+stamp.getHours()+':'+
						((stamp.getMinutes() < 10) ? '0' : '')+stamp.getMinutes()+':'+
						((stamp.getSeconds() < 10) ? '0' : '')+stamp.getSeconds(),
				date  = ((stamp.getDate() < 10) ? '0' : '')+stamp.getDate()+':'+
						((stamp.getMonth()+1 < 10) ? '0' : '')+(stamp.getMonth()+1)+':'+
						stamp.getFullYear();
						
			/*
				<div class="chat-message" id="1">
					<span class="chat-time">[13:37:21]</span>
					<span class="chat-id">1337</span>
					<span class="chat-name">vereleen</span>
					<span class="chat-content">няяши говорят няя</span>
				</div>
			
				id          commands[1]
				timestamp   commands[2]
				name        commands[3]
				color       commands[4]
				
			*/
			
			var color = (commands[4] !== 'NULL') ? commands[4] : sariaSettings.defaultColor,
				border = (containsMyMessage(fulltext)) ? 'background: rgba(70, 70, 70, 0.35); border-left: 3px solid #'+sariaSettings.defaultColor : '';
			
			var messageHtml = '<div class="chat-message" style="'+border+'" id="mesg-'+commands[1]+'"><span class="chat-time">'+time+'</span> <span class="chat-id" onclick="mentionId('+commands[1]+')">'+commands[1]+'</span> <span class="chat-name" style="color: #'+color+'" onclick="mentionId('+commands[1]+')">'+commands[3]+'</span> <span class="chat-content" id="chat-content-'+commands[1]+'">'+saria_processMessage(fulltext)+'</span></div>';
			
			
			if (mainCmd == 'LOGCON')
			{
				$('#chat-messages').prepend(messageHtml);
				
				if (+commands[1] > sariaStatus.maxMessageId)
				{
					sariaStatus.maxMessageId = +commands[1];
					if (sariaStatus.minMessageId == 0)
						sariaStatus.minMessageId = +commands[1];
				}
				
				if (+commands[1] < sariaStatus.minMessageId)
					sariaStatus.minMessageId = +commands[1];
				
				if (sariaStatus.messagesLeft > 0)
				{
					sariaStatus.messagesLeft--;
				}
			}
			else
			{
				$('#chat-messages').append(messageHtml);
			}
			
			autoScroll(commands[1]);
			break;
			
		case 'CONREC' :
			if (commands[1] == sariaStatus.lastMessageCode)
			{
				$('#chat-text').val('');
				sariaStatus.nowSending = false;
				addMyMessage(commands[2]);
			}
			break;
			
		case 'NTM' :
			saria_log('Name is accepted by the server :3');
			break;
			
		case 'FAIL' :
			saria_error(commands[1], fulltext);
			break;
			
			
		case 'SERVICE' :
			var messageClass = '';
			switch (commands[1])
			{
				case 'INFO' : messageClass = 'info'; break;
				case 'WARNING' : messageClass = 'warning'; break;
				case 'ERROR' : messageClass = 'error'; break;
				default : messageClass = 'info';
			}
			
			saria_sysmessage('* '+saria_sanitize(fulltext), messageClass);
			
			break;
	}
}

function saria_sendMessage(message)
{
	message = message || $('#chat-text').val();
	message = message.trim();
	
	if (message && sariaStatus.authorized && !sariaStatus.nowSending)
	{
		sariaSettings.nowSending = true;
		sariaStatus.lastMessageCode = (typeof randword === 'function') ? randword() : Math.floor(Math.random(10*9999));
		
		if (message.indexOf('/') === 0)
		{
			if (commandsHistory.indexOf(message) == -1)
				commandsHistory.unshift(message);
			
			saria_sysmessage('# '+message);
			sariaStatus.currentCommandPosition = -1;
		}
		
		saria_sendCommand('CONTENT '+sariaStatus.lastMessageCode+' #'+message);
	}
}