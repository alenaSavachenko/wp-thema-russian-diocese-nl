<?php
require_once __DIR__ . '/google/GoogleTranslateForFree.php';


if (isset($_GET['text1']))
    $t1 = $_GET['text1'] ;
if (isset($_GET['text2']))
    $t2 = $_GET['text2'] ;
if (isset($_GET['text2']))
    $t3 = $_GET['text3'] ;
if (isset($_GET['text3']))
    $t4 = $_GET['text4'] ;
if (isset($_GET['text5']))
    $t5 = $_GET['text5'] ;

$source = 'en';
$target = 'nl';
$attempts = 5;
$text1 = $t1;
$text2 = $t2;
$text3 = $t3;
$text4 = $t4;
$text5 = $t5;

$tr = new GoogleTranslateForFree();

$r1 = $tr->translate($source, $target, $text1, $attempts);
$r2 = $tr->translate($source, $target, $text2, $attempts);
$r3 = $tr->translate($source, $target, $text3, $attempts);
$r4 = $tr->translate($source, $target, $text4, $attempts);
$r5 = $tr->translate($source, $target, $text5, $attempts);



echo "$r1; $r2; $r3 ;$r4; $r5";