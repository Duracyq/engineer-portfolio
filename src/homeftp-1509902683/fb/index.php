<?php
$url = "about-us/?fresh=1443432167";
if (isset($_GET["fresh"])) {
	$url .= "?fresh=" . $_GET["fresh"];
}
header("Location: " . $url);