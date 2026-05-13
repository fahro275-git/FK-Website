<?php
if(isset($_POST['data'])) {
	$data = json_decode($_POST['data'], true);
	
	$currenturl = "http";
	if(isset($_SERVER['HTTPS'])) {
		$currenturl .= "s";
	}
	$currenturl .= "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	$url = parse_url($currenturl);
	
	$message = '';
	foreach($data as $key=>$value) {
		$message .= '<b>'.$key.':</b> '.$value.'<br>';
	}
	
	$to_email = "fahro275@googlemail.com";
	$subject = "Website Form Completion";
	$body = $message."<br><br>This message was sent using ".$url['host'].".";
	$headers = "From: no-reply@".$url['host']."\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
	
	if(mail($to_email, $subject, $body, $headers)) {
		$success = "Enquiry Sent";
	}
	else {
		$error = 'There was an error.';	
	}
	
}
else {
	$error = 'There was an error.';	
}

if(isset($error)) {
	echo 'ERROR: '.$error;
}
