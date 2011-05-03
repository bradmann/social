xquery version "1.0-ml";
(: links to json :)
declare namespace html = "http://www.w3.org/1999/xhtml";
declare namespace social = "http://marklogic.com/social";
xdmp:set-response-content-type("application/json"),
let $linkdocs := xdmp:directory("/links/")
let $jsonobjs :=
for $d in $linkdocs
  let $usermap := map:map()
  let $_ := for $u in $d/social:link/social:tweet/social:user
    return map:put($usermap, $u, 1)
  let $count := count(map:keys($usermap))
  return if ($count gt 1) then
  let $url := substring-before(substring-after($d/base-uri(), "/links/"), ".xml")
  let $url := xdmp:url-decode($url)
  return concat('{"url": "', $url, '", "users": ["', string-join(map:keys($usermap), '", "'), '"]}')
  else ()

return concat('[', string-join($jsonobjs, ', '), ']')