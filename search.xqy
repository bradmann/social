xquery version "1.0-ml";
(: twitter search :)
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace atom = "http://www.w3.org/2005/Atom";

let $search := xdmp:get-request-field("search", "hamburger")
let $time := current-dateTime()
let $uri := concat("/searches/", encode-for-uri($search), "_", $time, ".xml")

let $entries :=
for $i in 1 to 15
let $url := concat("http://search.twitter.com/search.atom?rpp=100&amp;result_type=recent&amp;page=", $i, "&amp;q=", $search)
let $response := xdmp:http-get($url, <options xmlns="xdmp:http-get"><format xmlns="xdmp:document-get">xml</format></options>)
return if ($response[1]//*:code eq 200) then
  $response[2]//atom:entry
  else ()

let $dedupmap := map:map()
let $buildmap := for $e in $entries return map:put($dedupmap, $e//atom:id, $e)

let $feed := 
  <feed xmlns="http://www.w3.org/2005/Atom"><title>{$search}</title><updated>{$time}</updated>{
  for $key in map:keys($dedupmap) return map:get($dedupmap, $key)
  }</feed>
return xdmp:document-insert($uri, $feed)