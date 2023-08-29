<?php
$url = "about-us/?fresh=1397048225";
if (isset($_GET["fresh"])) {
	$url .= "?fresh=" . $_GET["fresh"];
}
header("Location: " . $url);