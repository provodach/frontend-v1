<?php

function get_template ($mode)
{
	switch ($mode)
	{
		case 'index' :
			return 'index.tpl'; break;
		
		case 'schedule' :
			return 'schedule.tpl'; break;
			
		case 'chat' :
			return 'chat.tpl'; break;
			
		case 'pp' :
			return 'pp.tpl'; break;
			
		default :
			return 'index.tpl'; break;
	}
}