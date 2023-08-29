<?php
$url = "about-us/";
if (isset($_GET["fresh"])) {
	$url .= "?fresh=" . $_GET["fresh"];
}
header("Location: " . $url);