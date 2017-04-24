<?php
include(getcwd() . '/../app/init.php');

$eventTimes = EventTime::getByID($_GET['id']);
$eventTime = $eventTimes[0];
$event = $eventTime->toEventSummaryArray();

echo <<< EOT
<html>
<head>
<title>{$event['title']}</title>
EOT;

function addOgTag($property, $content) {
	$content = htmlspecialchars($content);
	echo "<meta property=\"og:$property\" content=\"$content\" />\n";
}

addOgTag('title', $event['title']);
addOgTag('url', $event['shareable']);
$image = $event['image'];
if (empty($image)) {
	$image = ""; //TODO: default image
} else {
	$image = "$PROTOCOL$HOST/$IMAGEDIR/$image";
}
addOgTag('image', $image);
addOgTag('type', 'article'); //FIXME: Does FB support 'event' yet?
addOgTag('description', $event['details']);
addOgTag('site_name', $SITENAME);
$eventDate = DateTime::createFromFormat('Y-m-d', $event['date']);
$datestring = $eventDate->format('D, M jS');
$eventTime = DateTime::createFromFormat('G:i:s', $event['time']);
$timestring = $eventTime->format('g:i A');

echo <<< EOT
</head>
<body>
<h2>$datestring, $timestring - {$event['title']}</h2>
<p>{$event['details']}</p>
<p>{$event['address']}</p>

</body>
</html>
EOT;

