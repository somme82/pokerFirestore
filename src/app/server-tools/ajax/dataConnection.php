<?php

$servername = "localhost";
$username = "admin";
$password = "admin";
$dbname = "poker_live";

$mysqli = new mysqli($servername, $username, $password, $dbname);

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8");

?>
