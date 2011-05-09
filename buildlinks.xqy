xquery version "1.0-ml";
(: create links :)
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace atom = "http://www.w3.org/2005/Atom";
declare namespace twitter = "http://api.twitter.com/";
declare namespace social = "http://marklogic.com/social";
declare default element namespace "http://marklogic.com/social";

declare function local:to-json($node as item()*) as xs:string {
  typeswitch($node)
    case map:map return
      let $keys := map:keys($node)
      let $items := for $k in $keys return concat('"', $k, '": ', local:to-json(map:get($node, $k)))
      return concat('{', string-join($items, ','), '}')
    case node()* return if (count($node) gt 1) then concat('[', string-join(for $n in $node return local:to-json($n), ','), ']') else concat('"', $node, '"')
    case text() return concat('"', $node, '"')
    case xs:string return concat('"', $node, '"')
    default return xdmp:node-kind($node)
};

declare function local:item-in-set($item as item(), $set as item()*) {
  let $val := for $i in $set return if ($item eq $i) then fn:true() else ()
  return if ($val) then fn:true() else fn:false()
};

declare function local:add-to-map($map as map:map, $key as xs:string, $value as item()) {
  if (map:get($map, $key)) then if (local:item-in-set($value, map:get($map, $key))) then () else map:put($map, $key, (map:get($map, $key), $value))
  else map:put($map, $key, $value)
};

let $searches := xdmp:get-request-field("searches", "hamburger")
let $searches := if (contains($searches, "|")) then tokenize($searches, "|") else $searches
let $minshares := xs:integer(xdmp:get-request-field("minshares", "2"))

let $searches := ("hamburger", "hot dog")

let $searchmap := map:map()

let $entries := 
  for $search in $searches
  return map:put($searchmap, $search, cts:search(doc(), cts:element-value-query(xs:QName("atom:title"), $search))//atom:entry)

let $linksearchmap := map:map()
let $entries :=
  for $key in map:keys($searchmap)
    for $t in map:get($searchmap, $key)//atom:title/text() return if (matches($t, "^.*?https??://[^ ]*.*$")) then local:add-to-map($linksearchmap, $key, $t/../..) else ()

let $finalsearchmap := map:map()
let $urlmap := map:map()
let $buildmap :=
  for $key in map:keys($linksearchmap)
    for $entry in map:get($linksearchmap, $key)
      let $url := replace($entry/atom:title/text(), "^.*?(https??://[^ ]*).*$", "$1")
      let $_ := local:add-to-map($finalsearchmap, $url, $key)
      let $text := xs:string($entry//atom:author/atom:name/text())
      return local:add-to-map($urlmap, $url, $text)

let $prunedsearch := map:map()
let $newmap := map:map()
let $prunemap :=
  for $key in map:keys($urlmap)
  let $val := map:get($urlmap, $key)
  return if (count($val) >= $minshares) then 
  let $_ := local:add-to-map($prunedsearch, map:get($finalsearchmap, $key), $key)
  return map:put($newmap, $key, $val) else ()

let $usermap := map:map()
let $buildmap := for $key in map:keys($newmap) return for $user in map:get($newmap, $key) return map:put($usermap, $user, 1)

let $users := map:keys($usermap)
let $urls := map:keys($newmap)
(: let $searches := map:keys($finalsearchmap) :)

let $linkmap := map:map()
let $_ :=
for $key in map:keys($newmap) return map:put($linkmap, $key, map:get($newmap, $key))
let $_ :=
for $key in map:keys($prunedsearch) return map:put($linkmap, $key, map:get($prunedsearch, $key))

return concat('{"nodes": {"searches": ', xdmp:to-json($searches), ', "urls": ', xdmp:to-json($urls), ', "users": ', xdmp:to-json($users), '}, "links": ', xdmp:to-json($linkmap), '}')