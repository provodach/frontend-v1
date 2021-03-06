<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="description" content="Проводач. Радио для любителей спокойной музыки, проводов и урбанистической эстетики. Круглосуточное вещание с короткими информационными блоками.">
		<meta name="keywords" content="проводач, провода, панельки, панельные дома, урбанистика, онлайн радио, радио, радио онлайн, спокойная музыка, музыка для отдыха, пост рок, эмбиент, provodach, provoda.ch, panel house, panel buildings, plattenbau, plattenbauten, urban, urbanistic, wires, wire pole, ambient, post-rock, relax music, relaxation music, relax radio">
		<meta name="author" content="IDENT Software">
		<meta name="google-play-app" content="app-id=org.identsoft.provodach">
		<link href='//fonts.googleapis.com/css?family=Open+Sans:400,300,300italic,700,700italic,400italic&subset=latin,cyrillic-ext,cyrillic,latin-ext' rel='stylesheet' type='text/css'>
		<link rel="stylesheet" href="/assets/generic.css" type="text/css">
		<link rel="stylesheet" href="/assets/<?php echo($content['site_mode']); ?>.css" type="text/css">
		<link rel="stylesheet" href="/assets/chat.css" type="text/css">
		<title><?php echo($content['title']); ?></title>
		
		<!-- Dynamic style definition generated by the engine -->
		<style>
		html, body
		{
			background: #020220 url(//api.https.cat/graphics/provodach/web/<?php echo($content['site_mode']); ?>) no-repeat center;
			background-size: cover;
		}
		</style>
		
		<script src="//static.https.cat/js/jquery.js" type="text/javascript"></script>
		<script src="//static.https.cat/js/jquery.mousewheel.js" type="text/javascript"></script>
		<script src="//static.https.cat/js/util.js" type="text/javascript"></script>
		<script src="//static.https.cat/js/soundmanager2.js" type="text/javascript"></script>
		<script src="/assets/js/radio.js" type="text/javascript"></script>
		<script src="/assets/js/trackvote.js" type="text/javascript"></script>
		<script src="/assets/js/core.js" type="text/javascript"></script>
		<script src="/assets/js/saria.js" type="text/javascript"></script>
	</head>
	<body>	
	<div id="main">
		<table id="header-struct">
			<tr>
				<td colspan="3" id="menu-handler">
					<div id="menu">
						<a href="/" onclick="loadContent('index'); return false;">Главная</a>
						<br>
						<a href="/chat" onclick="loadContent('chat'); return false;">Проводачат</a>
					</div>
				</td>
			</tr>
			<tr>
				<td rowspan="2" id="title">
					<?php echo($content['logo']); ?>
				</td>
				
				<!-- It's a &bull;shit -->
				<td colspan="4" id="volume-dots" title="Используй колёсико мыши для регулировки громкости">
					<div class="volume-dot" id="bullet-10" onclick="radioSetVolume(100, true);">&bull;</div><div class="volume-dot" id="bullet-9" onclick="radioSetVolume(90, true);">&bull;</div><div class="volume-dot" id="bullet-8" onclick="radioSetVolume(80, true);">&bull;</div><div class="volume-dot" id="bullet-7" onclick="radioSetVolume(70, true);">&bull;</div><div class="volume-dot" id="bullet-6" onclick="radioSetVolume(60, true);">&bull;</div><div class="volume-dot" id="bullet-5" onclick="radioSetVolume(50, true);">&bull;</div><div class="volume-dot" id="bullet-4" onclick="radioSetVolume(40, true);">&bull;</div><div class="volume-dot" id="bullet-3" onclick="radioSetVolume(30, true);">&bull;</div><div class="volume-dot" id="bullet-2" onclick="radioSetVolume(20, true);">&bull;</div><div class="volume-dot" id="bullet-1" onclick="radioSetVolume(10, true);">&bull;</div>				
				</td>
			</tr>
			<tr>
				<td id="player-control-handler" onclick="radioToggle();" title="Включить/выключить проигрыватель">
					<div id="player-control" class="player-control-stalled"></div>
				</td>
				<td id="player-trackinfo-handler" title="Используй колёсико мыши для регулировки громкости">
					<a href="#" target="_blank" id="player-trackinfo">- WAITING FOR SERVER -</a>
				</td>
				<td class="trackvote" id="vote-class" title="Класс" onclick="trackVote(true)"></td>
				<td class="trackvote" id="vote-disclass" title="Дискласс" onclick="trackVote(false)"></td>
			</tr>
		</table>
		<div id="content">