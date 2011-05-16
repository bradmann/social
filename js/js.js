$(function() {
	var engine = Object.create(nodular.computePrototype);
	var graphics = Object.create(nodular.graphicsPrototype);
	var timeout = null;
	
	var quadtree;
	var nodes = [{x: 0.0,y: 0.0,vx: 0.0,vy: 0.0,m: 1.0, c: "#000000"}];
	var links = [];
	var forces = [];
	var interval = 20;
	var nodeRadius = 10;
	var selectedNode = -1;
	var width = 1000;
	var height = 500;
	var xscale = 1;
	var yscale = 1;
	var offsetx = 0;
	var offsety = 0;
	var dragOrigin = null;
	var canvas = $('#canvas')[0];
	var canvaswidth = $(canvas).width();
	var canvasheight = $(canvas).height();
	var graphconfig = {coulombConstant: 250000, damping: .02, springConstant: 2, theta: 1, timeStep: 1, width: 100 * width, height: 100 * height};
	var canvasconfig = {canvas: canvas, width: width, height: height, canvaswidth: canvaswidth, canvasheight: canvasheight, xscale: xscale, yscale: yscale};
	
	function setup_controls() {
		function panCanvas(evt) {
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			graphics.pan(dragOrigin.x, dragOrigin.y, x, y);
			$('#links').html("x: " + graphics.offsetx + ", y: " + graphics.offsety);
		}
	
		$('#speed_val').html(graphconfig.timeStep);
		$('#damping_val').html(graphconfig.damping);
		$('#rep_val').html(graphconfig.coulombConstant);
		$('#spring_val').html(graphconfig.springConstant);
		$('#speed').bind('change', function(evt) {
			var val = $(this).val() / 10;
			engine.timeStep = val;
			$('#speed_val').html(val);
		});
		$('#damping').bind('change', function(evt) {
			var val = $(this).val() / 1000;
			engine.damping = val;
			$('#damping_val').html(val);
		});
		$('#repulsion').bind('change', function(evt) {
			var val = $(this).val();
			engine.coulombConstant = val;
			$('#rep_val').html(val);
		});
		$('#springs').bind('change', function(evt) {
			var val = $(this).val() / 100;
			engine.springConstant = val;
			$('#spring_val').html(val);
		});
		
		$(canvas).attr('width', width.toString());
		$(canvas).attr('height', height.toString());
		
		$(canvas).mousedown(function(evt) {
			evt.preventDefault();
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			var coords = graphics.getWorldCoords(x, y);
			dragOrigin = {x: x, y: y};
			$('#links').html("x: " + dragOrigin.x + ", y: " + coords.y);
			selectedNode = engine.get_node_at_location(coords.x, coords.y);
			if (selectedNode == -1) {
				$(canvas).bind('mousemove', panCanvas);
				return;
			}
			var url = nodes[selectedNode]["data"];
			if (url) {
				$('#links').html('<a href="' + url + '" target="_blank">' + url + '</a>');
			}
			engine.select_node(selectedNode);
		});
		
		$(window).mouseup(function(evt) {
			$(canvas).unbind('mousemove', panCanvas);
			if (selectedNode !== -1) {
				selectedNode = -1;
				engine.deselect_node();
			}
		});
		
		$(canvas).mousemove(function(evt) {
			if (selectedNode !== -1) {
				var offset = $(this).offset();
				var x = evt.pageX - offset.left;
				var y = evt.pageY - offset.top;
				var coords = graphics.getWorldCoords(x, y);
				engine.move_node(selectedNode, coords.x, coords.y);
			}
		});
		
		$('#canvas').bind('mousewheel', function(evt, delta) {
			clearTimeout(timeout);
			var offset = $(this).offset();
			var x = evt.pageX - offset.left;
			var y = evt.pageY - offset.top;
			//var coords = graphics.getWorldCoords(x, y);
			if (delta > 0) {
				graphics.zoomIn(x, y);
			} else {
				graphics.zoomOut(x, y);
			}
			
			update_graph();
		});
		
		$('#loaddata').bind('click', function(evt) {
			var json = '({"nodes": {"searches": ["osama", "obama"], "urls": ["http:\/\/bit.ly\/l0tR8N", "http:\/\/bit.ly\/iptVNE", "http:\/\/apne.ws\/jpQspP", "http:\/\/lx.im\/1cuNx", "http:\/\/youtu.be\/EpEHIb3RyvQ", "http:\/\/tpm.ly\/mqYbuk", "http:\/\/bit.ly\/lpwoJD", "http:\/\/bit.ly\/mzDDx8", "http:\/\/drudge.tw\/iu7dXq", "http:\/\/t.co\/NIHb0bY", "http:\/\/yhoo.it\/mTOWrF", "http:\/\/bit.ly\/kyC9rD", "http:\/\/bit.ly\/kucBjU", "http:\/\/bit.ly\/jWqSlW", "http:\/\/bit.ly\/jD6u1I", "http:\/\/yhoo.it\/lvg5JU", "http:\/\/migre.me\/4vHGF", "http:\/\/is.gd\/iGPeSz", "http:\/\/bit.ly\/m4Nkj8", "http:\/\/feedzil.la\/jhZUiG", "http:\/\/youtu.be\/DjSZ_n9PbgM", "http:\/\/tinyurl.com\/3rplqrp", "http:\/\/bit.ly\/jZHVEL", "http:\/\/bit.ly\/iyd9bI", "http:\/\/bit.ly\/mOSHFV", "http:\/\/6topoder-aldeaglobal.blogspot.com\/2011\/05\/murio-osama-bin-laden-pero-la-guerra.html", "http:\/\/j.mp\/jYjfnS", "http:\/\/bit.ly\/j7bdqf", "http:\/\/mediaite.com\/a\/qeesx", "http:\/\/bit.ly\/kZaZmG", "http:\/\/fxn.ws\/mx8fZB", "http:\/\/bit.ly\/lgEvMI", "http:\/\/nyti.ms\/j65BYi", "http:\/\/yhoo.it\/m6QdqE", "http:\/\/on.msnbc.com\/kur0Hv", "http:\/\/t.co\/fuVzFNW", "http:\/\/su.pr\/2LaFP7", "http:\/\/bit.ly\/md2aDD", "http:\/\/monk.ly\/mtbpVr", "http:\/\/bit.ly\/kXyTFh", "http:\/\/bit.ly\/iQzOlQ", "http:\/\/ow.ly\/4RZWX", "http:\/\/t.co\/ENu1eQb", "http:\/\/bit.ly\/k0fwLR", "http:\/\/bit.ly\/jVXZHc", "http:\/\/bit.ly\/lG8kgA", "http:\/\/bit.ly\/jPFaaO", "http:\/\/bit.ly\/mgrPQW", "http:\/\/is.gd\/ZffLsh", "http:\/\/bit.ly\/m2bJNS", "http:\/\/onion.com\/lbP3fB", "http:\/\/www.thepetitionsite.com\/takeaction\/182\/811\/421\/", "http:\/\/bit.ly\/iZPbne", "http:\/\/bit.ly\/jECVVi", "http:\/\/j.mp\/mftew6", "http:\/\/n.pr\/k3e73E", "http:\/\/huff.to\/kJE2lZ", "http:\/\/t.co\/CBs7DRy", "http:\/\/bit.ly\/lUOxwE", "http:\/\/tinyurl.com\/preztrack", "http:\/\/ow.ly\/4S1Jt", "http:\/\/yfrog.com\/hsda2yuj", "http:\/\/bit.ly\/jRLJDY", "http:\/\/t.co\/PjorYaO", "http:\/\/bit.ly\/jKzWhe", "http:\/\/n.pr\/kEBLQz", "http:\/\/nyti.ms\/mHZ2KA", "http:\/\/fxn.ws\/m71r4F", "http:\/\/ow.ly\/4S3nb", "http:\/\/huff.to\/kRlwQN", "http:\/\/bit.ly\/ilRzjh", "http:\/\/goo.gl\/fb\/A3003", "http:\/\/thkpr.gs\/k1i9jN", "http:\/\/bit.ly\/mpawu5", "http:\/\/bit.ly\/l9OBKX", "http:\/\/ht.ly\/4S3ii", "http:\/\/nyti.ms\/juQVJ8", "http:\/\/feedzil.la\/lqJrKm", "http:\/\/wapo.st\/ls9XTG", "http:\/\/bit.ly\/jCWIRF", "http:\/\/bit.ly\/kW9cZB", "http:\/\/bmg.ma\/kCWJYW", "http:\/\/t.co\/7tUk917", "http:\/\/bit.ly\/lDcmt1", "http:\/\/huff.to\/l9oJZI"], "users": ["BethArnold (Beth Arnold)", "GaryPercesepe (Gary Percesepe)", "MichaelGrover2 (Michael Grover)", "KelliMalcolm (Kelli Malcolm)", "Only4RM (TMiami)", "ClintonSroka (Clinton Sroka)", "kichigaisan (Brian Thompson)", "ToyaAuxier (505)", "Erudite_Enigma (Michael Chavez)", "Kate_Chase (Kate J Chase)", "sjcilluffo (Shirley Cilluffo)", "ganheaqui (ganhe@aqui)", "AmakaWho (Amaka G. )", "JPie612 (JPie612)", "ndtvfeed (NDTV News feed)", "Sir_Ville (Will Blackmon)", "Copernispiracy (Stardust we are)", "jbnovais (Jo\u00E3o Batista Novais)", "propanestudios (Brent Lyon)", "SvenskNyheter (Timmy Evers)", "EuroKonferenz (EuroAktionskonferenz)", "EmelBenAli (Emel Ben Ali)", "MonaB2010 (Mona Hussein Obama)", "dsilvapeter2011 (Peter Dsilva)", "JoyceH2008 (Joyce H.)", "Fochik (Shoteka Dodd)", "OpheliaWinslow (Ophelia Winslow)", "SonrisaEspianoB (I AM-Sonrisa Espiano)", "SanjuanitaStro (183)", "VanessaMagnumXL (Miss V)", "DilKnml (Dilraz Kunnummal)", "kallou22 (kat kallou)", "Hermionejh (Hermionejh)", "nillysoggin (NillySoggin)", "NativeOfTahoe (Brenda \u266A \u266B \u2665)", "rothandy (Andy Roth)", "DailyCaller (The Daily Caller)", "ClaireByrnerd (Claire Byrne)", "GuilbertAntoine (Antoine Guilbert)", "BDiddyNoVA (BD)", "AngeLsLuv (AngeLsLuv)", "johnkriesel (John Kriesel)", "AcrobatSausages (Keith Martin)", "nylonthread (nylonthread)", "intelwire (J.M. Berger)", "agmilky (AG)", "cfreelakers24 (Curtis)", "Dismukes (Dismukes)", "jkainja (Jimmy Kainja)", "JayRevell (Jay Revell)", "TheeeSickestKid (Greatest\' Ever)", "stacilandis (Staci Landis)", "sanctuaryhum (Jacob Johnson)", "AnyStreetTN (AnyStreet TN)", "2525 (Francisco van Jole)", "SanskritGr8 (SanskritG)", "gorgeonnews (Online News)", "dwivedi_arun (Arun Dwivedi)", "TPartyUSA (Tea Party USA)", "HoraceRooks (Horace Rooks)", "joeyconway (Joey Conway)", "jozzjonz (Joseph John)", "novariqueza (Maria Teresa  )", "valerauko (Vale)", "TEmoryUSA (Tara Emory)", "HealthTVNews (HealthTVnews)", "webdesigniinc (Karl W.K.)", "nightbusmusic (Jack Kennedy)", "prchristen (Paul R Christen)", "MontyB1976 (Bill Montgomery)", "Newsweekusa (NewsWeekUSA)", "RosaacLev (Rosa A C Lev)", "marionetf74 (marionet\uFF20\u767E\u9053\u6D5C)", "ScottEtchison (676)", "ErikMckeown (Erik Mckeown)", "ToniaCola (139)", "UncleTrump (Uncle Trump)", "garyrlake (Gary Lake)", "hey_gary (Gary Parker)", "BrokenStud (Mike Moore)", "JoaoFalanga (Jo\u00E3o Odair Falanga )", "leoveimrober (L\u00E9o Veimrober)", "AchaDesconto (Acha Desconto)", "FnVLiberal (Liberal Feeds)", "101Valkyrie101 (Lord Valkyrie Bell)", "jasmin20xx (jasmin 20xx)", "JonathonSnyder (JonathonSnyder)", "avataryosoy (avatar yo soy)", "El_Vlade (Vlade)", "WayOfTheSword (Doug C)", "bringoutthejimp (Jim Parsons)", "mediaite (Mediaite)", "georgecassalis (George Cassalis)", "idiosyncronaut (idiosyncronaut)", "cheapballybags (Emily Lowes)", "UnstableIsotope (Unstable Isotope)", "liort1 (Lior tt)", "hiphoppress (Hip Hop Press)", "fmnacion (Naci\u00F3n FM)", "dashkdot (-k.)", "Dinizvicente (Gabriel pib 2011)", "NoemieVXXC (No\u00E9mie VXXC)", "Ancha_Syuhada (Abhu Hamzah)", "nonstrategic (Ben Loehrke)", "rlm22b (Bone McGee)", "searchlight2 (scott newell)", "Nickieqk (Nickie Overmyer)", "rpmkel (Rich Kelley)", "SarahPalinSux (SarahPalinSux)", "GilangSoLamby2 (Ardyan Gilang R V.2)", "jendeaderick (Jen Deaderick)", "dncfail (DNC Fail!)", "OMG_itsDestiny (Americas Sweetheart)", "beritaupdate (Berita Update)", "wolftsax (motsh\u00E9)", "MissStanislas (Miss Stanislas)", "kmcneel (Kate)", "JoeTaxpayer (Erik Telford)", "Angelus1701 (Glenn Quagmire)", "FiredUpMissouri (Fired Up! Missouri)", "vraniero (Raniero Virgilio)", "ash_n_k (ashley klotz)", "brunellibruno (Bruno Brunelli)", "grdyc47 (Grady)", "djoalpha11 (David OLeary)", "CONTRACOMA (CONTRACOMA)", "TheTrips (John \'Trips\' Gallen)", "EraseMeNot (EraseMeNot)", "bomani_jones (Bomani Jones)", "allie4marie (Allie Marie )", "hiphoplogic (Hip Hop Logic)", "ithinkimalion (DeMarcus Parkeur)", "wagnerjorge (wagner jorge)", "Javier_Be (Javier Bento)", "adamhasner (Adam Hasner)", "drodzand (Drodzand)", "xDustinDeLoachx (Dustin DeLoach)", "C_A_JONEStechno (CAROLE JONES)", "imagist (George Lottermoser)", "Aplusd_ (Jay Padnom)", "Sexy_Hokage (tobi babs)", "Wulfcempa (Wulfcempa)", "Gabrielpib (Gabriel diniz)", "PuckScheres (Puck Scheres)", "JonUPS (Jonathan Cohen)", "Lukas_M_ (Lukas Moreno)", "jlff63taz (JOSE LUIS )", "willywaldo (Wilda Williams)", "MaartenNatzijl (Maarten Natzijl)", "sarahbellumd (Sarah)", "alfoders (alfoders)", "sportsalmighty (joseph)", "eduardocidade (Eduardo Cidade)", "JazzieJessie88 (JessieMarie )", "marcokito_ (Marco )", "stephen_58 (Stephen Gilmore)", "DinoFranz2 (Dino Franz)", "ebangani (Carlos A. Torres)", "reddpups (Betty Pappas)", "KMBReferee (Mr. Ref)", "WillWash (the Best 6:30)", "jaymz7783 (Tony)", "hoss9009 (hoss9009)", "LanceShults (Lance Shults)", "jbouie (Jamelle Bouie)", "AnasRazzaq (Anas M. Razzaq)", "GiuseppeEmme (Giuseppe Marazzotta)", "JornalOGlobo (Jornal O Globo)", "bzerebiec (Brian Zerebiec)", "brunobom35 (bruno)", "brodigan (John Brodigan)", "OnlyWorldNews (Only World News)", "Winghunter (Winghunter)", "varemenos (V\u03B1\u044F\u0113\u043C\u0113\u0438\u00F8\u0161)", "Max597 (Max malone)", "matthew_gould (Matt Gould)", "nowooski (Wally)", "esimmers (Erich Simmers)", "Myrlea333 (Myrle Stones)", "SUPindy (Paddleboard Indiana )", "estudiodownload (Estudio Download)", "vadherasudesh (Sudesh)", "cheapleatherbag (Evangeline)", "owenbarder (Owen Barder)", "ProudoftheUSA (Melissia )", "watzak (Heidi WatzakRichmond)", "EI_Forest (Forest News)", "oladitisegun ( olusegun  oladiti)", "WebGuyTV (Mark W. Mumma \u261A)", "Sue_Graber (Sue Graber)", "Rob_ODriscoll (Rob O\'Driscoll)", "Infobae (Infobae)", "andrew_overton (Andrew Overton)", "arcangelcrowe (\u00C4R\u00C7 \u00C4\u00D1G\u03A3L \u00C7R\u00D8W\u03A3\u256A)", "balladacarioca (Balada Carioca)", "Calchala (Calchala)", "eaprisby (Edward Prisby)", "andi_SB (andi sulistio)", "ReaganFan13 (Kayla)", "photozenthesis (L D Dick)", "seriousmundo (Seriously)", "Naci_MorenO (TheReal0hG)", "djalma30 (Djalma Ara\u00FAjo)", "BreakingNewz (Conservative News )", "mstinytina (Tina)", "stillonline (sharon stillson)", "MediaMarosi (Jessica Marosi)", "WisconsinSoul (Wisconsin Soul)", "jpeders6 (Jack the Tripper)", "will_mccants (Will McCants)", "mark_patten (Mark Patten)", "SanAlexTwitt (Alexandrea Teguh)", "SmittyDFW (Brian Smith)", "InvisblAmerican (InvisibleAmerican)", "bionicV3 (Soler Kedar)", "TunisieAffaires (She)", "BizarrePolitiek (BizarrePolitiek)", "GandolphThePoet (Randolph Greer)", "smalgov (I miss Reagan)", "pas5974 (D.Pasley.)", "pike360 (Chris Pike)", "sharrington2012 (Sherry Harrington)", "kschar20 (Kevin Scharlau)", "rumpfshaker (Sarah Rumpf)", "RFreiesleben (Freiesleben)", "bokonon07 (Don Frazell)", "FoxNewsUpdate (Fox News Update)", "RDaddi24 (Rachel )", "MiiyukiH (Miyuki Hassimoto)", "shawkins (Steve Hawkins)", "superglaze (David Meyer)", "andrewdrinker (Andrew Drinker)", "thinkprogress (ThinkProgress)", "aniltanwar (ANIL TANWAR)", "yujijeda (yujijeda \u4F8D\u679D\u96C4\u58EB)", "EI_Nuclear (Nuclear News)", "shonibay (timmy )", "walie (Walie Piracha)", "JammieWF (JammieWearingFool)", "aquarharris688 (aquarharris688)", "DonaldPridgen (Donald Pridgen)", "Nyhetsankaret (Mike Fyhr)", "thecanaryleft (The Canary Left)", "exposingthelie3 (H. Clinton )", "vgtz (Vg)", "jasonlw (Jason Winegeart)", "LaFemmeLestat (Jessie de Lioncourt)", "joshtpm (Josh Marshall)", "kfmurph (Katy Murphy)", "RightHookRadio (The Right Hook)", "albertodeb (albertodeb)", "KanosOfficial (Kanos)", "PatMcMahonDC (Patrick McMahon)", "dredeyedick (Dave Manchester)", "pablobarre (Pablo  Barreiro)", "platocygnus (Platocygnus)", "thurmanjc (J. Thurman)", "thedudest (Robin \u0E42\u0E23\u0E1A\u0E34\u0E19)", "nyheterna (TV4Nyheterna)", "JD211 (John Domen)", "foxnewspolitics (foxnewspolitics)", "imentros (Iago Mentros)", "ToureX (Tour\u00E9)", "MajjieD (Jamie Davis)", "rlbaldwinartist (Rebecca L Baldwin)", "FlashPresse (Flash Presse)", "africangoddess8 (Nicky)", "fabiolamsilva3 (Fabi Silva)", "GPEblogCom (GlobalPoliticalEcont)", "viniciusmacedob (Vin\u00EDcius Macedo)", "NathanPease (Nathan Pease)", "rei_c (Rei C.)", "omarilu (Omarilu)", "caligulaelsanto (sergio)", "StuLevitan (Stu Levitan)", "conflictlive (The Peace Maker)", "BKneon (Bkneon)", "latte_lib_86 (Tara )", "NaplesVaBeach (Sic Semper Tyrannis)", "thomasmoore1234 (thomas moore)", "Thomasgivens (Thomas Givens)", "Texas_Liberal (Gene Kinney)", "monicaaiex (M\u00F4nica)", "MBesterman (MBesterman)", "GPEblog (GPEblog.com)", "oficialRLsilva (Raphael Silva)", "MCBlankenship (Mark C. Blankenship)", "berrytweety (Eberechukwu)", "isaiahbumblebee (Tsuru Masahiko)", "MominaKhawar (Momina Khawar)", "YACO69 (Aquiles Pico)", "JasonMattera (Jason Mattera)", "1Sheyanne (S 1)", "Retweeteuse (Sophie)", "Mayzee590 (BeckblowsKoch)", "karenmc115 (Karen McSweeney)", "dominic_bhimwal (Arjun Bhimwal)", "bibahot (Biba (\u2022\u0361\u032F.\u2022\u0361\u032F))", "patrickrpayne (Patrick Payne)", "aBeardedLiberal (David M)", "akaSunday (Sandy Binnig)", "MartWaterval (Mart Waterval)", "ModelProgress (ModelProgress)", "feed_brasil (Feed Brasil)", "HuffPostMedia (HuffPost Media)", "LatinosMatter (Latinos Matter)", "Nimmagaddaeswar (N.Eswar)", "butt3r (Jonathan Davila)", "prohiphop (Pro Hip Hop)", "Cfremb (Chris Frembling)", "EI_Climate (Climate Change News)", "speculumfight (robert bagalayos)", "peluso86 (David Guti\u00E9rrez H.)", "Farcaster (Brian L. Gunn)", "ladyjanet (Janet)", "IndiaNewsBrk (India Breaking News)", "debitking (Nelsa)", "niitagustine (Nita Agustine)", "jvpublicidade (jvpublicidade)", "Paul_chingy (Paul Elago)", "jrlarson1000 (John Larson)", "pisssmaker (Pisssmaker)", "elraphbo (elraphbo)", "penguinoid (Gavin Duley)", "radiocomcidade (Radio Cidade FM)", "meowtree (Linda Raftree)", "TVRecordBrasil (Rede Record)", "iLordStewie (Stewie Griffin)", "gleidsonlive (Gleidson \u2714)", "OGlobo_Mundo (O Globo_Mundo)", "InObamaLand (Obama Hussein)", "josephsaurio (Joseph Ling\u00E1n)", "dreampicker (Dreampicker)", "cerdajoel1 (Joel Cerda)", "Jatzel09 (Jatzel Roman)", "Times_0f_India (Time 0f India)", "mckaycoppins (McKay Coppins)", "mysticrealm21 (Arci Jimenez)", "StephenBWhite (Stephen White)", "ingje (Ingje)", "KimBrock5 (Kim Brock)", "theoneherbie (theone herbert)", "_pepo__ (Jose A)", "theqcast (The Q Show)", "monkeyrotica (monkeyrotica)", "tweetzcelebrity (joseph)", "dunearn_gardens (Dunearn Gardens)", "lucianogames201 (Luciano concei\u00E7\u00E3o)", "wjnelson11 (Bill Nelson)", "foxheadlines (Fox News)", "bishtneha (Neha Bisht)", "CindyCoops (Cindy Cooper)", "sarah13795 (Sarah Dickson)", "Omarjmc (Omar McCrimmon)", "JacksKennedy (Jack Kennedy)", "CL212CL (C L)", "rizkimj (Rizky Meyansyah \u00AE)", "t_bouvier (Thami B ;*)", "Endyoktavian (EndyOktavian)", "jvgoodwin (Jay Goodwin)", "Slimkay78 (Lisa )", "JonnyLove79 (Jonathan Christison)", "danielrvt (Daniel Rodriguez)", "Omegamichael (Michael Healy)", "Andrew2893 (Harry Smith)", "Williampogut (William)", "ratujean (Jeanny Silvie Ratu)", "douglaslabier (Douglas LaBier)", "THErealSKRIBE (SKRIBE)", "chrisofrights (Chris Of Rights)", "logg_ (logg_)", "jfx316 (J. Whittaker)", "RasmussenPoll (Scott Rasmussen)", "rodrigolange (Rodrigo Lange)", "write_elizabeth (Elizabeth )", "bchao524 (Brian Chao)", "gods4legangels (Helen Hunt)", "miumiumiucha (miyuki\u266B)", "ray_harmon (Ray Harmon)", "candilo10 (Candace Stowers)", "vinimdocarmo (Vin\u00EDcius do Carmo.)", "drewunga (Andrew Ungvari)", "Gleebelieber1 (Jacqui _Belieber_:D)", "lactualaloupe (diane saint-r\u00E9quier)", "Pierrederuelle (Pierre Deruelle)", "GinAAndo (Gin A. Ando)", "titithedynamite (Titilayo Adelagun)", "_double0kevin (_double0kevin)", "tiff2765 (Tiffany Reed)", "nemcneil (Denise)", "PharmacyCo (PharmacyCo)", "DavidHJackson (David Howard Jackson)", "hiphopprwire (Hip Hop PR Wire)", "monkchips (James Governor)", "cindyrizzo (Cindy Rizzo)", "jennifer7owens (Jennifer  Owens)", "EI_EcoNewsfeed (Biocentric Eco News)", "CheckMyDubstep (Jake Van Buschbach)", "williederrick3 (Yacwms)", "niceninja (ccs)", "LeslieHedrick5 (Leslie Hedrick)", "Syl2944 (Syl Dennie)", "OblitR8 (Ichabod Crane)", "Kevinbsnyder (Kevin B Snyder)", "Daniel_Lompa (Not\u00EDcias Clik Link )", "jeev1sen (jeevan sen)", "DrJennyK (Dr. Jenny K)", "chvl222 (valerie levy-brown)", "shiriuma (\u30DE\u30A6\u30EA\u30FC\u30B7\u30FB\u30CF\u30FC\u30EA\u30C9\u30FB\u30D3\u30F3\u30FB\u30A2\u30EB\u30EF\u30EA\u30FC\u30C9)", "LJayBaker ( Jay Baker)", "RobertWesleyB (Robert Wesley Branch)", "CplxSimplicity (Morpheus)", "marilest (Mariana Lestari)", "phephemoore (Phenola Moore)", "bbanck (Bryan Banck)", "PonyRuhe (Steven Garrett)", "allahpundit (Allah Pundit)", "steven_a_s (Steven Samson)", "savinggrc (Karen Linton)", "USRealityCheck (US Reality Check )", "profragsdale (Rhonda Ragsdale)", "pkpress (Pakistan Press)", "alavancagenfina (Diogo)", "DivulgaUOL (UOL)", "ottpops (Martin Ott)", "Sttbs73 (Sttbs73)", "bluemassgroup (Blue Mass Group)", "Feni_55_Crystal (Fenia Yfandi)", "inyo0104 (inoue kosuke)", "W911 (Frank Ho)", "akruglov (Alex Kruglov)", "kshypptl (kashyap parsaniya)", "diellasoraya (Diella Soraya =))", "haveabetterone (J D)", "TerryMarino2 (Terry Marino)", "NeilMcMahon (NeilMcMahon)", "B97matt (Matt Thiel)", "JamesDavi2 (James Davis)", "Venaq675 (Vena Miller)", "tonydeviveiros (Tony De Viveiros)"]}, "links": {"http:\/\/bit.ly\/l0tR8N":["Nyhetsankaret (Mike Fyhr)", "SvenskNyheter (Timmy Evers)", "nyheterna (TV4Nyheterna)"], "http:\/\/bit.ly\/iptVNE":["dreampicker (Dreampicker)", "albertodeb (albertodeb)", "josephsaurio (Joseph Ling\u00E1n)"], "http:\/\/apne.ws\/jpQspP":["phephemoore (Phenola Moore)", "bchao524 (Brian Chao)", "williederrick3 (Yacwms)", "write_elizabeth (Elizabeth )"], "http:\/\/lx.im\/1cuNx":["TheeeSickestKid (Greatest\' Ever)", "Paul_chingy (Paul Elago)", "bishtneha (Neha Bisht)", "iLordStewie (Stewie Griffin)", "Gleebelieber1 (Jacqui _Belieber_:D)", "Sexy_Hokage (tobi babs)"], "http:\/\/youtu.be\/EpEHIb3RyvQ":["vinimdocarmo (Vin\u00EDcius do Carmo.)", "Lukas_M_ (Lukas Moreno)", "jbnovais (Jo\u00E3o Batista Novais)", "t_bouvier (Thami B ;*)"], "http:\/\/tpm.ly\/mqYbuk":["Only4RM (TMiami)", "MonaB2010 (Mona Hussein Obama)", "joshtpm (Josh Marshall)", "SarahPalinSux (SarahPalinSux)", "theoneherbie (theone herbert)"], "http:\/\/bit.ly\/lpwoJD":["BDiddyNoVA (BD)", "JoyceH2008 (Joyce H.)", "CindyCoops (Cindy Cooper)", "Andrew2893 (Harry Smith)", "Kevinbsnyder (Kevin B Snyder)", "garyrlake (Gary Lake)", "KMBReferee (Mr. Ref)"], "http:\/\/bit.ly\/mzDDx8":["KimBrock5 (Kim Brock)", "DonaldPridgen (Donald Pridgen)", "HoraceRooks (Horace Rooks)"], "http:\/\/drudge.tw\/iu7dXq":["MediaMarosi (Jessica Marosi)", "johnkriesel (John Kriesel)", "bbanck (Bryan Banck)"], "http:\/\/t.co\/NIHb0bY":["akaSunday (Sandy Binnig)", "douglaslabier (Douglas LaBier)", "jfx316 (J. Whittaker)", "LatinosMatter (Latinos Matter)"], "http:\/\/yhoo.it\/mTOWrF":["Nickieqk (Nickie Overmyer)", "Myrlea333 (Myrle Stones)", "UncleTrump (Uncle Trump)", "LJayBaker ( Jay Baker)", "Williampogut (William)", "ratujean (Jeanny Silvie Ratu)"], "http:\/\/bit.ly\/kyC9rD":["imagist (George Lottermoser)", "allie4marie (Allie Marie )", "ebangani (Carlos A. Torres)", "USRealityCheck (US Reality Check )", "chvl222 (valerie levy-brown)", "SanAlexTwitt (Alexandrea Teguh)"], "http:\/\/bit.ly\/kucBjU":["PonyRuhe (Steven Garrett)", "JonathonSnyder (JonathonSnyder)", "JammieWF (JammieWearingFool)", "monkeyrotica (monkeyrotica)", "joeyconway (Joey Conway)", "nylonthread (nylonthread)", "JD211 (John Domen)", "photozenthesis (L D Dick)", "DilKnml (Dilraz Kunnummal)", "JasonMattera (Jason Mattera)"], "http:\/\/bit.ly\/jWqSlW":["ErikMckeown (Erik Mckeown)", "DinoFranz2 (Dino Franz)", "TerryMarino2 (Terry Marino)", "ClintonSroka (Clinton Sroka)", "MichaelGrover2 (Michael Grover)", "JamesDavi2 (James Davis)", "LeslieHedrick5 (Leslie Hedrick)"], "http:\/\/bit.ly\/jD6u1I":["ToyaAuxier (505)", "ScottEtchison (676)", "SanjuanitaStro (183)"], "http:\/\/yhoo.it\/lvg5JU":["Venaq675 (Vena Miller)", "cheapballybags (Emily Lowes)", "cheapleatherbag (Evangeline)"], "http:\/\/migre.me\/4vHGF":["brunellibruno (Bruno Brunelli)", "monicaaiex (M\u00F4nica)", "radiocomcidade (Radio Cidade FM)", "djalma30 (Djalma Ara\u00FAjo)", "MiiyukiH (Miyuki Hassimoto)"], "http:\/\/is.gd\/iGPeSz":["debitking (Nelsa)", "RightHookRadio (The Right Hook)", "NaplesVaBeach (Sic Semper Tyrannis)", "adamhasner (Adam Hasner)", "TEmoryUSA (Tara Emory)", "elraphbo (elraphbo)", "brodigan (John Brodigan)", "rumpfshaker (Sarah Rumpf)"], "osama":["http:\/\/bit.ly\/ilRzjh", "http:\/\/bit.ly\/jZHVEL", "http:\/\/bit.ly\/iyd9bI", "http:\/\/6topoder-aldeaglobal.blogspot.com\/2011\/05\/murio-osama-bin-laden-pero-la-guerra.html", "http:\/\/bit.ly\/kZaZmG", "http:\/\/bit.ly\/lG8kgA", "http:\/\/t.co\/PjorYaO", "http:\/\/goo.gl\/fb\/A3003", "http:\/\/bit.ly\/l9OBKX", "http:\/\/bit.ly\/jVXZHc", "http:\/\/youtu.be\/EpEHIb3RyvQ", "http:\/\/bit.ly\/kucBjU", "http:\/\/migre.me\/4vHGF", "http:\/\/yfrog.com\/hsda2yuj", "http:\/\/lx.im\/1cuNx", "http:\/\/bit.ly\/kyC9rD", "http:\/\/t.co\/fuVzFNW", "http:\/\/nyti.ms\/juQVJ8", "http:\/\/bit.ly\/mOSHFV", "http:\/\/bit.ly\/kXyTFh", "http:\/\/bit.ly\/jPFaaO", "http:\/\/bit.ly\/jECVVi", "http:\/\/ow.ly\/4S3nb", "http:\/\/drudge.tw\/iu7dXq", "http:\/\/bit.ly\/jWqSlW", "http:\/\/t.co\/CBs7DRy", "http:\/\/bit.ly\/jKzWhe", "http:\/\/t.co\/7tUk917", "http:\/\/j.mp\/jYjfnS", "http:\/\/youtu.be\/DjSZ_n9PbgM", "http:\/\/bit.ly\/lUOxwE", "http:\/\/ow.ly\/4S1Jt", "http:\/\/tinyurl.com\/3rplqrp", "http:\/\/t.co\/ENu1eQb", "http:\/\/on.msnbc.com\/kur0Hv", "http:\/\/bit.ly\/k0fwLR"], "http:\/\/bit.ly\/m4Nkj8":["hiphopprwire (Hip Hop PR Wire)", "prohiphop (Pro Hip Hop)", "hiphoppress (Hip Hop Press)", "hiphoplogic (Hip Hop Logic)", "Sir_Ville (Will Blackmon)"], "http:\/\/feedzil.la\/jhZUiG":["jeev1sen (jeevan sen)", "Newsweekusa (NewsWeekUSA)", "webdesigniinc (Karl W.K.)"], "http:\/\/youtu.be\/DjSZ_n9PbgM":["shonibay (timmy )", "VanessaMagnumXL (Miss V)", "SonrisaEspianoB (I AM-Sonrisa Espiano)", "KanosOfficial (Kanos)"], "http:\/\/tinyurl.com\/3rplqrp":["MominaKhawar (Momina Khawar)", "titithedynamite (Titilayo Adelagun)", "berrytweety (Eberechukwu)"], "http:\/\/bit.ly\/jZHVEL":["Ancha_Syuhada (Abhu Hamzah)", "Endyoktavian (EndyOktavian)", "niitagustine (Nita Agustine)", "diellasoraya (Diella Soraya =))", "bibahot (Biba (\u2022\u0361\u032F.\u2022\u0361\u032F))"], "http:\/\/bit.ly\/iyd9bI":["NativeOfTahoe (Brenda \u266A \u266B \u2665)", "LaFemmeLestat (Jessie de Lioncourt)", "W911 (Frank Ho)"], "obama":["http:\/\/apne.ws\/jpQspP", "http:\/\/bit.ly\/m4Nkj8", "http:\/\/mediaite.com\/a\/qeesx", "http:\/\/huff.to\/kJE2lZ", "http:\/\/thkpr.gs\/k1i9jN", "http:\/\/feedzil.la\/lqJrKm", "http:\/\/bit.ly\/jD6u1I", "http:\/\/yhoo.it\/lvg5JU", "http:\/\/j.mp\/mftew6", "http:\/\/bit.ly\/m2bJNS", "http:\/\/bit.ly\/mpawu5", "http:\/\/t.co\/NIHb0bY", "http:\/\/nyti.ms\/mHZ2KA", "http:\/\/su.pr\/2LaFP7", "http:\/\/bit.ly\/iZPbne", "http:\/\/ht.ly\/4S3ii", "http:\/\/bit.ly\/j7bdqf", "http:\/\/bit.ly\/md2aDD", "http:\/\/fxn.ws\/m71r4F", "http:\/\/fxn.ws\/mx8fZB", "http:\/\/n.pr\/k3e73E", "http:\/\/bit.ly\/lpwoJD", "http:\/\/yhoo.it\/m6QdqE", "http:\/\/bit.ly\/jRLJDY", "http:\/\/bit.ly\/kW9cZB", "http:\/\/bit.ly\/lgEvMI", "http:\/\/bit.ly\/iQzOlQ", "http:\/\/bit.ly\/mgrPQW", "http:\/\/huff.to\/kRlwQN", "http:\/\/bit.ly\/jCWIRF", "http:\/\/t.co\/7tUk917", "http:\/\/bit.ly\/l0tR8N", "http:\/\/tpm.ly\/mqYbuk", "http:\/\/wapo.st\/ls9XTG", "http:\/\/yhoo.it\/mTOWrF", "http:\/\/bmg.ma\/kCWJYW", "http:\/\/bit.ly\/lDcmt1", "http:\/\/monk.ly\/mtbpVr", "http:\/\/onion.com\/lbP3fB", "http:\/\/feedzil.la\/jhZUiG", "http:\/\/ow.ly\/4RZWX", "http:\/\/tinyurl.com\/preztrack", "http:\/\/bit.ly\/mzDDx8", "http:\/\/nyti.ms\/j65BYi", "http:\/\/www.thepetitionsite.com\/takeaction\/182\/811\/421\/", "http:\/\/n.pr\/kEBLQz", "http:\/\/huff.to\/l9oJZI", "http:\/\/bit.ly\/iptVNE", "http:\/\/is.gd\/iGPeSz", "http:\/\/is.gd\/ZffLsh"], "http:\/\/bit.ly\/mOSHFV":["_pepo__ (Jose A)", "YACO69 (Aquiles Pico)", "El_Vlade (Vlade)"], "http:\/\/6topoder-aldeaglobal.blogspot.com\/2011\/05\/murio-osama-bin-laden-pero-la-guerra.html":["fabiolamsilva3 (Fabi Silva)", "jlff63taz (JOSE LUIS )", "tonydeviveiros (Tony De Viveiros)"], "http:\/\/j.mp\/jYjfnS":["Omegamichael (Michael Healy)", "meowtree (Linda Raftree)", "owenbarder (Owen Barder)"], "http:\/\/bit.ly\/j7bdqf":["KimBrock5 (Kim Brock)", "DonaldPridgen (Donald Pridgen)", "HoraceRooks (Horace Rooks)"], "http:\/\/mediaite.com\/a\/qeesx":["mediaite (Mediaite)", "101Valkyrie101 (Lord Valkyrie Bell)", "drewunga (Andrew Ungvari)"], "http:\/\/bit.ly\/kZaZmG":["jvpublicidade (jvpublicidade)", "oficialRLsilva (Raphael Silva)", "gleidsonlive (Gleidson \u2714)", "ganheaqui (ganhe@aqui)"], "http:\/\/fxn.ws\/mx8fZB":["Winghunter (Winghunter)", "smalgov (I miss Reagan)", "rlbaldwinartist (Rebecca L Baldwin)"], "http:\/\/bit.ly\/lgEvMI":["JamesDavi2 (James Davis)", "TerryMarino2 (Terry Marino)", "DinoFranz2 (Dino Franz)", "ClintonSroka (Clinton Sroka)", "MichaelGrover2 (Michael Grover)", "ErikMckeown (Erik Mckeown)", "LeslieHedrick5 (Leslie Hedrick)"], "http:\/\/nyti.ms\/j65BYi":["BethArnold (Beth Arnold)", "jendeaderick (Jen Deaderick)", "GaryPercesepe (Gary Percesepe)"], "http:\/\/yhoo.it\/m6QdqE":["alfoders (alfoders)", "sjcilluffo (Shirley Cilluffo)", "omarilu (Omarilu)"], "http:\/\/on.msnbc.com\/kur0Hv":["PharmacyCo (PharmacyCo)", "DrJennyK (Dr. Jenny K)", "GilangSoLamby2 (Ardyan Gilang R V.2)", "HealthTVNews (HealthTVnews)"], "http:\/\/t.co\/fuVzFNW":["intelwire (J.M. Berger)", "esimmers (Erich Simmers)", "will_mccants (Will McCants)", "dredeyedick (Dave Manchester)"], "http:\/\/su.pr\/2LaFP7":["rpmkel (Rich Kelley)", "willywaldo (Wilda Williams)", "ottpops (Martin Ott)"], "http:\/\/bit.ly\/md2aDD":["SmittyDFW (Brian Smith)", "Dismukes (Dismukes)", "stacilandis (Staci Landis)"], "http:\/\/monk.ly\/mtbpVr":["monkchips (James Governor)", "kmcneel (Kate)", "shawkins (Steve Hawkins)", "superglaze (David Meyer)"], "http:\/\/bit.ly\/kXyTFh":["Times_0f_India (Time 0f India)", "dsilvapeter2011 (Peter Dsilva)", "Nimmagaddaeswar (N.Eswar)", "dwivedi_arun (Arun Dwivedi)", "IndiaNewsBrk (India Breaking News)", "aniltanwar (ANIL TANWAR)", "kshypptl (kashyap parsaniya)"], "http:\/\/t.co\/ENu1eQb":["jkainja (Jimmy Kainja)", "matthew_gould (Matt Gould)", "TheTrips (John \'Trips\' Gallen)", "ClaireByrnerd (Claire Byrne)"], "http:\/\/ow.ly\/4RZWX":["Infobae (Infobae)", "pablobarre (Pablo  Barreiro)", "peluso86 (David Guti\u00E9rrez H.)", "fmnacion (Naci\u00F3n FM)", "Javier_Be (Javier Bento)", "caligulaelsanto (sergio)"], "http:\/\/bit.ly\/iQzOlQ":["FoxNewsUpdate (Fox News Update)", "AnyStreetTN (AnyStreet TN)", "ModelProgress (ModelProgress)"], "http:\/\/bit.ly\/k0fwLR":["DonaldPridgen (Donald Pridgen)", "KimBrock5 (Kim Brock)", "HoraceRooks (Horace Rooks)"], "http:\/\/bit.ly\/jVXZHc":["sharrington2012 (Sherry Harrington)", "ProudoftheUSA (Melissia )", "watzak (Heidi WatzakRichmond)", "wjnelson11 (Bill Nelson)", "sarahbellumd (Sarah)", "JoeTaxpayer (Erik Telford)"], "http:\/\/bit.ly\/lG8kgA":["TPartyUSA (Tea Party USA)", "hey_gary (Gary Parker)", "Erudite_Enigma (Michael Chavez)", "BreakingNewz (Conservative News )", "arcangelcrowe (\u00C4R\u00C7 \u00C4\u00D1G\u03A3L \u00C7R\u00D8W\u03A3\u256A)"], "http:\/\/bit.ly\/jPFaaO":["GPEblogCom (GlobalPoliticalEcont)", "pkpress (Pakistan Press)", "GPEblog (GPEblog.com)", "AnasRazzaq (Anas M. Razzaq)"], "http:\/\/bit.ly\/mgrPQW":["ToyaAuxier (505)", "SanjuanitaStro (183)", "ToniaCola (139)", "ScottEtchison (676)"], "http:\/\/is.gd\/ZffLsh":["rlbaldwinartist (Rebecca L Baldwin)", "allahpundit (Allah Pundit)", "mckaycoppins (McKay Coppins)"], "http:\/\/bit.ly\/m2bJNS":["sportsalmighty (joseph)", "jozzjonz (Joseph John)", "tweetzcelebrity (joseph)"], "http:\/\/onion.com\/lbP3fB":["bzerebiec (Brian Zerebiec)", "GinAAndo (Gin A. Ando)", "jennifer7owens (Jennifer  Owens)", "Sue_Graber (Sue Graber)", "Rob_ODriscoll (Rob O\'Driscoll)", "nightbusmusic (Jack Kennedy)", "WebGuyTV (Mark W. Mumma \u261A)", "butt3r (Jonathan Davila)", "WayOfTheSword (Doug C)", "savinggrc (Karen Linton)", "Angelus1701 (Glenn Quagmire)", "ash_n_k (ashley klotz)", "mark_patten (Mark Patten)", "DavidHJackson (David Howard Jackson)", "steven_a_s (Steven Samson)", "nonstrategic (Ben Loehrke)", "ithinkimalion (DeMarcus Parkeur)", "BrokenStud (Mike Moore)", "danielrvt (Daniel Rodriguez)", "stephen_58 (Stephen Gilmore)", "propanestudios (Brent Lyon)", "xDustinDeLoachx (Dustin DeLoach)", "sanctuaryhum (Jacob Johnson)", "seriousmundo (Seriously)", "NathanPease (Nathan Pease)", "patrickrpayne (Patrick Payne)", "jvgoodwin (Jay Goodwin)", "penguinoid (Gavin Duley)", "jrlarson1000 (John Larson)", "platocygnus (Platocygnus)", "tiff2765 (Tiffany Reed)", "JonnyLove79 (Jonathan Christison)", "drodzand (Drodzand)", "AcrobatSausages (Keith Martin)", "bringoutthejimp (Jim Parsons)", "StephenBWhite (Stephen White)", "jbouie (Jamelle Bouie)", "africangoddess8 (Nicky)", "sarah13795 (Sarah Dickson)", "jaymz7783 (Tony)", "rothandy (Andy Roth)", "bionicV3 (Soler Kedar)", "jasonlw (Jason Winegeart)", "idiosyncronaut (idiosyncronaut)", "JacksKennedy (Jack Kennedy)", "mstinytina (Tina)"], "http:\/\/www.thepetitionsite.com\/takeaction\/182\/811\/421\/":["KelliMalcolm (Kelli Malcolm)", "RDaddi24 (Rachel )", "reddpups (Betty Pappas)", "kichigaisan (Brian Thompson)"], "http:\/\/bit.ly\/iZPbne":["JamesDavi2 (James Davis)", "DinoFranz2 (Dino Franz)", "LeslieHedrick5 (Leslie Hedrick)", "ErikMckeown (Erik Mckeown)", "MichaelGrover2 (Michael Grover)", "ClintonSroka (Clinton Sroka)", "TerryMarino2 (Terry Marino)"], "http:\/\/bit.ly\/jECVVi":["andi_SB (andi sulistio)", "beritaupdate (Berita Update)", "marilest (Mariana Lestari)"], "http:\/\/j.mp\/mftew6":["DailyCaller (The Daily Caller)", "PatMcMahonDC (Patrick McMahon)", "prchristen (Paul R Christen)"], "http:\/\/n.pr\/k3e73E":["cindyrizzo (Cindy Rizzo)", "CL212CL (C L)", "akruglov (Alex Kruglov)", "MediaMarosi (Jessica Marosi)"], "http:\/\/huff.to\/kJE2lZ":["C_A_JONEStechno (CAROLE JONES)", "HuffPostMedia (HuffPost Media)", "rei_c (Rei C.)"], "http:\/\/t.co\/CBs7DRy":["bomani_jones (Bomani Jones)", "B97matt (Matt Thiel)", "thurmanjc (J. Thurman)"], "http:\/\/bit.ly\/lUOxwE":["estudiodownload (Estudio Download)", "marcokito_ (Marco )", "TVRecordBrasil (Rede Record)", "balladacarioca (Balada Carioca)", "lucianogames201 (Luciano concei\u00E7\u00E3o)", "JoaoFalanga (Jo\u00E3o Odair Falanga )", "Gabrielpib (Gabriel diniz)", "Daniel_Lompa (Not\u00EDcias Clik Link )", "jvpublicidade (jvpublicidade)", "alavancagenfina (Diogo)", "wagnerjorge (wagner jorge)", "AchaDesconto (Acha Desconto)", "novariqueza (Maria Teresa  )", "eduardocidade (Eduardo Cidade)", "feed_brasil (Feed Brasil)", "viniciusmacedob (Vin\u00EDcius Macedo)", "DivulgaUOL (UOL)", "Dinizvicente (Gabriel pib 2011)", "imentros (Iago Mentros)"], "http:\/\/tinyurl.com\/preztrack":["Jatzel09 (Jatzel Roman)", "nillysoggin (NillySoggin)", "debitking (Nelsa)", "sharrington2012 (Sherry Harrington)", "chrisofrights (Chris Of Rights)", "prchristen (Paul R Christen)", "RasmussenPoll (Scott Rasmussen)", "MCBlankenship (Mark C. Blankenship)", "InvisblAmerican (InvisibleAmerican)", "djoalpha11 (David OLeary)"], "http:\/\/ow.ly\/4S1Jt":["brunobom35 (bruno)", "rodrigolange (Rodrigo Lange)", "leoveimrober (L\u00E9o Veimrober)", "OGlobo_Mundo (O Globo_Mundo)"], "http:\/\/yfrog.com\/hsda2yuj":["Slimkay78 (Lisa )", "valerauko (Vale)", "ReaganFan13 (Kayla)", "MontyB1976 (Bill Montgomery)", "SUPindy (Paddleboard Indiana )"], "http:\/\/bit.ly\/jRLJDY":["NoemieVXXC (No\u00E9mie VXXC)", "thedudest (Robin \u0E42\u0E23\u0E1A\u0E34\u0E19)", "GuilbertAntoine (Antoine Guilbert)", "Aplusd_ (Jay Padnom)"], "http:\/\/t.co\/PjorYaO":["vraniero (Raniero Virgilio)", "MajjieD (Jamie Davis)", "GiuseppeEmme (Giuseppe Marazzotta)"], "http:\/\/bit.ly\/jKzWhe":["niceninja (ccs)", "exposingthelie3 (H. Clinton )", "Max597 (Max malone)", "Copernispiracy (Stardust we are)", "gods4legangels (Helen Hunt)"], "http:\/\/n.pr\/kEBLQz":["rlm22b (Bone McGee)", "JayRevell (Jay Revell)", "WisconsinSoul (Wisconsin Soul)", "_double0kevin (_double0kevin)"], "http:\/\/nyti.ms\/mHZ2KA":["EI_EcoNewsfeed (Biocentric Eco News)", "EI_Climate (Climate Change News)", "EI_Forest (Forest News)", "EI_Nuclear (Nuclear News)"], "http:\/\/fxn.ws\/m71r4F":["1Sheyanne (S 1)", "oladitisegun ( olusegun  oladiti)", "foxheadlines (Fox News)", "foxnewspolitics (foxnewspolitics)"], "http:\/\/ow.ly\/4S3nb":["JornalOGlobo (Jornal O Globo)", "RosaacLev (Rosa A C Lev)", "avataryosoy (avatar yo soy)", "RFreiesleben (Freiesleben)"], "http:\/\/huff.to\/kRlwQN":["FnVLiberal (Liberal Feeds)", "ModelProgress (ModelProgress)", "EuroKonferenz (EuroAktionskonferenz)", "OblitR8 (Ichabod Crane)", "CONTRACOMA (CONTRACOMA)", "georgecassalis (George Cassalis)"], "http:\/\/bit.ly\/ilRzjh":["marionetf74 (marionet\uFF20\u767E\u9053\u6D5C)", "dunearn_gardens (Dunearn Gardens)", "yujijeda (yujijeda \u4F8D\u679D\u96C4\u58EB)", "shiriuma (\u30DE\u30A6\u30EA\u30FC\u30B7\u30FB\u30CF\u30FC\u30EA\u30C9\u30FB\u30D3\u30F3\u30FB\u30A2\u30EB\u30EF\u30EA\u30FC\u30C9)", "isaiahbumblebee (Tsuru Masahiko)", "inyo0104 (inoue kosuke)", "miumiumiucha (miyuki\u266B)"], "http:\/\/goo.gl\/fb\/A3003":["vgtz (Vg)", "dominic_bhimwal (Arjun Bhimwal)", "ndtvfeed (NDTV News feed)"], "http:\/\/thkpr.gs\/k1i9jN":["aquarharris688 (aquarharris688)", "akaSunday (Sandy Binnig)", "Mayzee590 (BeckblowsKoch)", "kallou22 (kat kallou)", "aBeardedLiberal (David M)", "LanceShults (Lance Shults)", "Only4RM (TMiami)", "haveabetterone (J D)", "pike360 (Chris Pike)", "theoneherbie (theone herbert)", "WillWash (the Best 6:30)", "FiredUpMissouri (Fired Up! Missouri)", "AmakaWho (Amaka G. )", "walie (Walie Piracha)", "THErealSKRIBE (SKRIBE)", "RobertWesleyB (Robert Wesley Branch)", "Hermionejh (Hermionejh)", "speculumfight (robert bagalayos)", "CplxSimplicity (Morpheus)", "Sttbs73 (Sttbs73)", "ToureX (Tour\u00E9)", "candilo10 (Candace Stowers)", "cfreelakers24 (Curtis)", "Kate_Chase (Kate J Chase)", "NeilMcMahon (NeilMcMahon)", "profragsdale (Rhonda Ragsdale)", "Syl2944 (Syl Dennie)", "theqcast (The Q Show)", "andrewdrinker (Andrew Drinker)", "nowooski (Wally)", "pas5974 (D.Pasley.)", "latte_lib_86 (Tara )", "Omarjmc (Omar McCrimmon)", "hoss9009 (hoss9009)", "BKneon (Bkneon)", "UnstableIsotope (Unstable Isotope)", "dashkdot (-k.)", "mysticrealm21 (Arci Jimenez)", "thinkprogress (ThinkProgress)", "cerdajoel1 (Joel Cerda)", "ray_harmon (Ray Harmon)", "MonaB2010 (Mona Hussein Obama)", "kschar20 (Kevin Scharlau)", "thecanaryleft (The Canary Left)", "OMG_itsDestiny (Americas Sweetheart)", "andrew_overton (Andrew Overton)", "Thomasgivens (Thomas Givens)", "stillonline (sharon stillson)", "JPie612 (JPie612)"], "http:\/\/bit.ly\/mpawu5":["TunisieAffaires (She)", "bokonon07 (Don Frazell)", "wolftsax (motsh\u00E9)", "lactualaloupe (diane saint-r\u00E9quier)", "logg_ (logg_)", "jasmin20xx (jasmin 20xx)", "FlashPresse (Flash Presse)", "Retweeteuse (Sophie)"], "http:\/\/bit.ly\/l9OBKX":["searchlight2 (scott newell)", "conflictlive (The Peace Maker)", "pisssmaker (Pisssmaker)"], "http:\/\/ht.ly\/4S3ii":["EmelBenAli (Emel Ben Ali)", "Pierrederuelle (Pierre Deruelle)", "MissStanislas (Miss Stanislas)"], "http:\/\/nyti.ms\/juQVJ8":["agmilky (AG)", "varemenos (V\u03B1\u044F\u0113\u043C\u0113\u0438\u00F8\u0161)", "CheckMyDubstep (Jake Van Buschbach)"], "http:\/\/feedzil.la\/lqJrKm":["vadherasudesh (Sudesh)", "rizkimj (Rizky Meyansyah \u00AE)", "OnlyWorldNews (Only World News)", "liort1 (Lior tt)", "EraseMeNot (EraseMeNot)", "grdyc47 (Grady)"], "http:\/\/wapo.st\/ls9XTG":["Naci_MorenO (TheReal0hG)", "nemcneil (Denise)", "JazzieJessie88 (JessieMarie )", "JonUPS (Jonathan Cohen)", "Calchala (Calchala)", "SanskritGr8 (SanskritG)"], "http:\/\/bit.ly\/jCWIRF":["thomasmoore1234 (thomas moore)", "Wulfcempa (Wulfcempa)", "Texas_Liberal (Gene Kinney)", "Farcaster (Brian L. Gunn)", "Fochik (Shoteka Dodd)", "AngeLsLuv (AngeLsLuv)", "OpheliaWinslow (Ophelia Winslow)", "GandolphThePoet (Randolph Greer)", "kfmurph (Katy Murphy)", "ladyjanet (Janet)"], "http:\/\/bit.ly\/kW9cZB":["dncfail (DNC Fail!)", "ModelProgress (ModelProgress)", "InObamaLand (Obama Hussein)"], "http:\/\/bmg.ma\/kCWJYW":["eaprisby (Edward Prisby)", "latte_lib_86 (Tara )", "bluemassgroup (Blue Mass Group)", "MBesterman (MBesterman)"], "http:\/\/t.co\/7tUk917":["MartWaterval (Mart Waterval)", "ingje (Ingje)", "MaartenNatzijl (Maarten Natzijl)", "BizarrePolitiek (BizarrePolitiek)", "2525 (Francisco van Jole)", "PuckScheres (Puck Scheres)"], "http:\/\/bit.ly\/lDcmt1":["Cfremb (Chris Frembling)", "StuLevitan (Stu Levitan)", "gorgeonnews (Online News)", "Calchala (Calchala)"], "http:\/\/huff.to\/l9oJZI":["jpeders6 (Jack the Tripper)", "karenmc115 (Karen McSweeney)", "Andrew2893 (Harry Smith)", "Feni_55_Crystal (Fenia Yfandi)"]}})';
			$('#logo').hide();
			clearTimeout(timeout);
			load_json(eval(json));
			update_graph();
			/*
			$.ajax({
				cache: false,
				url: 'buildlinks.xqy?searches=osama|obama&minshares=3',
				dataType: 'json',
				success: function(data) {
					$('#logo').hide();
					clearTimeout(timeout);
					load_json(data);
					update_graph();
				}
			});*/
		});
	}
	
	function load_json_orig(data) {
		var usermap = {};
		for (var i = 0; i < data.length; i++) {
			var url = data[i]["url"];
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF", data: url});
			var nodeid = nodes.length - 1;
			links.push({a: 0, b: nodeid, c: "#000000"});
			var users = data[i]["users"];
			for (var j = 0; j < users.length; j++) {
				if (!usermap[users[j]]) {
					usermap[users[j]] = [];
				}
				usermap[users[j]].push(nodeid);
			}
		}
		for (var key in usermap) {
			var urls = usermap[key];
			var l2 = pick_random_location();
			nodes.push({x: l2[0],y: l2[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#555555"});
			var nodeid = nodes.length - 1;
			for (var i=0; i < urls.length; i++) {
				links.push({a: urls[i], b: nodeid, c: "#000000"});
			}
		}
		
		engine.nodes = nodes;
		engine.links = links;
	}
	
	function load_json(data) {
		nodes = [];
		links = [];
		var itemmap = {};
		var searches = data["nodes"]["searches"];
		var urls = data["nodes"]["urls"];
		var users = data["nodes"]["users"];
		var datalinks = data["links"];
		
		if (searches.constructor != Array) { searches = [searches]; }
		
		for (var i = 0; i < searches.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#000000", t: "search", data: searches[i]});
			itemmap[searches[i]] = nodeid;
		}
		
		for (var i = 0; i < urls.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#FFFFFF", t: "url", data: urls[i]});
			itemmap[urls[i]] = nodeid;
		}
		
		for (var i = 0; i < users.length; i++) {
			var nodeid = nodes.length;
			var loc = pick_random_location();
			nodes.push({x: loc[0],y: loc[1],vx: 0.0,vy: 0.0,m: 1.0, c: "#555555", t: "user", data: users[i]});
			itemmap[users[i]] = nodeid;
		}
		
		for (var key in datalinks) {
			for (var item in datalinks[key]) {
				links.push({a: itemmap[key], b: itemmap[datalinks[key][item]], c: "#000000"});
			}
		}
		engine.nodes = nodes;
		engine.links = links;
	}
	
	function update_graph() {
		timenow = (new Date()).getTime();
		engine.compute_graph();
		graphics.render(nodes, links);
		var wait = 17 - ((new Date()).getTime() - timenow);
		timeout = setTimeout(update_graph, wait);
	}
	
	function pick_random_location() {
		return [Math.floor(Math.random() * (width / xscale)) - ((width / 2) / xscale - 1), Math.floor(Math.random() * (height / yscale)) - ((height / 2) / yscale - 1)];
	}
	
	var timenow;

	setup_controls();

	//Make some nodes here
	/*for (var i=0; i < 19; i++) {
		var x = Math.floor(Math.random() * width) - ((width / 2) - 1);
		var y = Math.floor(Math.random() * height) - ((height / 2) - 1);
		var n = {x: x, y: y, vx: 0.0, vy: 0.0, m: 1.0, c: "#555555"};
		nodes.push(n);
	}

	//Make some links here
	for (var i=1; i < 20; i++) {
		var link = {a: 0, b: i, c: "#000000"};
		links.push(link);
	}
	
	links.push({a: 1, b: 5, c: "#000000"});
	links.push({a: 4, b: 7, c: "#000000"});
	links.push({a: 3, b: 4, c: "#000000"});
	links.push({a: 5, b: 8, c: "#000000"});
	links.push({a: 4, b: 6, c: "#000000"});*/
	
	//Set up the engine with our universe parameters
	engine.init(graphconfig);
	
	var that = this;
	
	/*engine.render = function() {
		graphics.render(nodes, links);
		var wait = 17 - ((new Date()).getTime() - timenow);
		timeout = setTimeout(update_graph, wait);
	}*/

	//Set up the graphics engine with our canvas config
	graphics.init(canvasconfig);
});