<?php
require_once ('engine/content.php');

$route = explode('/', $_GET['route']);

if ($route[0] == 'e')
{
	$redirectAddress = '';

	switch ($route[1])
	{
		case 'android':
			$redirectAddress = 'https://play.google.com/store/apps/details?id=org.identsoft.provodach';
			break;

		case 'ios':
			$redirectAddress = 'https://itunes.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?id=1080566427';
			break;

		case 'telegram':
			$redirectAddress = 'https://telegram.me/provodach';
			break;

		case 'tunein':
			$redirectAddress = 'http://tunein.com/radio/Provodach-s255847/';
			break;

		default:
			$redirectAddress = 'https://provoda.ch';
			break;
	}

	header ('HTTP/1.1 302 Redirect');
	header ('Location: '.$redirectAddress);

	die();
}

$content_template = get_template ($route[0]);

function str_shuffle_unicode($str) {
    $tmp = preg_split("//u", $str, -1, PREG_SPLIT_NO_EMPTY);
    shuffle($tmp);
    return join("", $tmp);
}

if (isset($_GET['ajax']))
{
	include_once ('engine/content/'.$content_template);
	die();
}
else
{
	// $nowtime = (int)date('G');
	
	
		
	/* if (!empty($_GET['mode']))
		$site_mode = ($_GET['mode'] == 'day') ? 'day' : 'night';
	else
		$site_mode = ($nowtime > 8 && $nowtime < 20) ? 'day' : 'night'; */
	
	// It will be an endless night on Provodach.
	$site_mode = 'night';
		
	$content['site_mode'] = $site_mode;
	$content['background_mode'] = $site_mode;
	$content['title'] = 'Радио &laquo;Проводач&raquo;';
	// $content['title'] = str_shuffle_unicode('Радио Проводач');
	$content['logo'] = 'provoda.ch';
	// $content['logo'] = str_shuffle('provoda.ch');
	
	include_once ('engine/header.tpl');
	include_once ('engine/content/'.$content_template);
	include_once ('engine/footer.tpl');
	die();
}