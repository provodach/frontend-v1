<!-- Main styles override. I hope it'll work correctly -->
<style>
body
{
	/*padding-top: 110px;
	padding-bottom: 70px;*/
}

#main
{
	height: 100%;
}

#content
{
	display: block;
    position:absolute;
    height:auto;
    bottom:0;
    top:0;
    left:0;
    right:0;
	margin: 0 auto;
    margin-top:110px;
    margin-bottom:20px;
	overflow-x: hidden;
	overflow-y: auto;
	width: 800px;
	font-family: "Open Sans", "Jura", Verdana, Tahoma, Arial, Sans-Serif;
}


#main
{
	position: static!important;
	-webkit-transform: none!important;
	-ms-transform: none!important;
	-o-transform: none!important;
	transform: none!important;
	margin: 0 auto;
}

#footer-links
{
	position: fixed!important;
	bottom: 0!important;
	width: 800px;
}

#header-struct
{
	position: fixed!important;
	top: 0!important;
	width: 800px;
}
</style>


<div id="chat-auth">
	Для использования чата нужно авторизоваться. Авторизация выполняется через &laquo;ВКонтакте&raquo;.<br>Твои данные не будут видны в чате. Их невозможно раскрыть. После авторизации можно будет указать ник или вообще остаться анонимусом. А ещё, а ещё, а ещё можно попробовать зайти почитать. В таком случае нужно нажать вторую кнопку. 
	<a href="https://oauth.vk.com/authorize?client_id=5216648&display=page&redirect_uri=https://api.nyan.pw/airin/auth&response_type=code" class="chat-auth-link">Авторизоваться</a>
	<br>
	<a href="javascript:void(0)" class="chat-auth-link" onclick="saria_goReadonly()">Просто почитать</a>
	<br>
	Особо дотошные могут читнуть <a href="/pp" onclick="loadContent('pp'); return false;">Политику конфиденциальности</a>.
</div>

<div id="chat-messages">
	<div id="chat-service-message">Соединяюсь с сервером...</div>
</div>

<table id="chat-panel">
	<tr>
	<td id="chat-settings-button" onclick="toggleSettings()" title="Нажми меня чтобы поменять ник :3">
		<!-- <img src="/assets/sprites/gear_night.png" id="chat-gear"> -->
	</td>
	<td id="chat-authorized">
		<textarea id="chat-text" placeholder="[messaging intensifies] нажми Enter чтобы отправить."></textarea>
		
		<div id="chat-settings">
			<div id="chat-settings-controls">
				<input type="text" placeholder="Ник (латиница и цифры, Enter чтобы сохранить)" id="username" name="username">
			</div>
		</div>
	</td>
	
	<td id="chat-readonly">
		Чтобы писать в чат нужно <a href="https://oauth.vk.com/authorize?client_id=5216648&display=page&redirect_uri=https://api.nyan.pw/airin/auth&response_type=code">пройти авторизацию</a>.
	</td>
</table>

<script type="text/javascript">
	$(document).ready(function() {saria_init('<?php echo ((preg_match('/^[a-zA-Z0-9]+$/', $_GET['auth']) == 1) ? $_GET['auth'] : null);?>'); });
</script>