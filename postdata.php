<?php
require_once __DIR__ . '/google/GoogleTranslateForFree.php';

$title = "";

if (isset($_GET['title']))
{
    $title = $_GET['title'] ;


}

$and_other_saints= str_replace("strip_tags("," ",$title);
$response = str_replace("и другие святые, имена которых вспоминаем в этот день"," ",$and_other_saints);


$source = 'ru';
$target = 'nl';
$attempts = 5;
$text = $response;

$tr = new GoogleTranslateForFree();
$result = $tr->translate($source, $target, $text, $attempts);

echo  $result;



