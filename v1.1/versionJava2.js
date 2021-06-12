const servidores = {
	"doo": {
		"icon": "https://i.imgur.com/7MT16Fo.png",
		"name": "Doodstream",
	},
	"tap": {
		"icon": "https://i.imgur.com/B9IBIDk.png",
		"name": "StreamTape",
	},
	"fem": {
		"icon": "https://i.imgur.com/xE1bCn7.png",
		"name": "Fembed",
	},
	"uq": {
		"icon": "https://i.imgur.com/V9Itdgb.png",
		"name": "Uqload",
	}
}

var uRL = window.location.href
var slp = uRL.split('ipfs/')
var slp2 = slp[1].split('/')

const nameSite = 'COOZ'
const baseRute = slp[0]+'ipfs/'+slp2[0]
const singleRute = baseRute+'/json/singles/'
const videosRute = baseRute+'/json/videos/'
const moviesRute = baseRute+'/json/movies.json'
const versionsRute = baseRute+'/json/versions.json'
const versionRute = baseRute+'/version.json'
const msnLove = "Don't be evil"

up.on('up:link:follow', function(event) {

	if (document.querySelector('.insert_single') != null) {	 document.querySelector('.insert_single').remove()	}
	if (document.querySelector('.active_mv') != null) {	document.querySelector('.active_mv').classList.remove("active_mv")	}

	var data = event.target.getAttribute("data")
    if (data != null) {
    	var tnmb = fract(data)
    	document.querySelector('.article_'+tnmb).insertAdjacentHTML('beforebegin', `<div id="fastSingle" class="insert_single"></div>`)
    	event.target.insertAdjacentHTML('afterbegin', `<div class="loadig_single"></div>`)
    	event.target.classList.add("active_mv")
    }else {
    	document.getElementById('load').classList.add("load")
    }

});

up.on('up:fragment:inserted', function(event) {

	linksChange()

	var aURL = window.location.href; var slp = aURL.split('/')
	var section = slp.slice(-1)[0] 

	idb.init({
	    database: "ipfs_db",
	    version: 2,
	    tables: [
	        { name: "movies", autoIncrement: true },
	        { name: "videos", keyPath: 'i' },
	        { name: "watch_list", keyPath: 'i' }
	    ]
	});

	if (document.getElementById('articles') != null) {

		if (document.querySelector('.insert_single') != null) {
	    	document.querySelector('.insert_single').scrollIntoView(true); 
	    	if (document.querySelector('.loadig_single') != null) {
	    		document.querySelector('.loadig_single').remove()
	    		document.getElementById("articles").scrollTop -= 0
	    	}
	    	var slpv = section.split('-')
			if (slpv[0]) {	loadSingle(slpv[0])	}
		}else {

			document.getElementById('load').classList.remove("load") 
			
			if (section) {
				var integer = parseInt(section, 10);
				if (Number.isInteger(integer) && section.length == 4) {
					// Años
					getData(integer, 1)
					document.title = integer+" | "+nameSite

				}else {
					// Generos
					var sectionT = arrayGeneros[section]
					var integer = parseInt(sectionT, 10);
					if (integer) {
						getData(integer, 1)
					}else {
						document.getElementById('articles').innerHTML = `<div class="errorJSON">Pagina no encontrada, ¿estás seguro que es la url correcta?</div>`
					}
				}
			}else {
				//Home
				getData('index', 1)
				checkVersion()
			}
		}

	}else {

		if (aURL.includes('info')) {
			document.querySelector('.icon_userSet').classList.add("menuA1")
		}
		// WatchList
		if (aURL.includes('watch-list')) {
			document.getElementById('load').classList.add("load") 
			document.querySelector('.icon_user').classList.add("menuA1") 
			getData('user', 10)
		}

	}

})


// Get all movies
function getData(sec, page) {

	if (page == 1 && sec != 'search') { document.getElementById('load').classList.add("load") }

	var noCache = new Headers();
	var check_existCache = checkExist_Cache(moviesRute, 1)
	if (check_existCache != 200) {
		noCache.append('pragma', 'no-cache');
		noCache.append('cache-control', 'no-cache');
	}

	fetch(moviesRute, {
		method: 'GET',
		headers: noCache
	}).then(res => res.json()) .then( d => { 

		if (sec == 'search' || sec == 'user') {	
			if (sec == 'search') {
				send_data_search(d)	
			}else {
				userData(d)
			}
		}else {	before_getData(d, sec, page) }
		
		if (page == 1) { document.getElementById('load').classList.remove("load") }


		if (check_existCache == 404) {
			checkExist_Cache(moviesRute, 2)
		}

	}).catch(function(e) {  
		if (page == 1) {
			document.getElementById('load').classList.remove("load") 
		}
		document.getElementById('articles').innerHTML = `<div class="errorJSON">Hubo un problema inesperado, por favor inténtelo de nuevo</div>`
	});

}



// Single
function loadSingle(id) {

	document.getElementById('load').classList.add("load") 

	var uRL = window.location.href; var slp = uRL.split('-');
	var pst = slp[slp.length - 1]


	var noCache = new Headers();
	var check_existCache = checkExist_Cache(singleRute+pst+'_sgl.json', 1)
	if (check_existCache != 200) {
		noCache.append('pragma', 'no-cache');
		noCache.append('cache-control', 'no-cache');
	}

	fetch(singleRute+pst+'.json', {
		method: 'GET',
		headers: noCache
	}) .then(res => res.json()) .then( d => { 

		before_loadSingle(id, d)
		checkVersion()

		if (check_existCache == 404) {
			checkExist_Cache(singleRute+pst+'_sgl.json', 2)
		}

		}).catch(function(e) {  
		if (page == 1) {
			document.getElementById('load').classList.remove("load") 
		}
		document.getElementById('articles').innerHTML = `<div class="errorJSON">Hubo un problema inesperado, por favor inténtelo de nuevo</div>`
	});

}

function before_loadSingle(id, d) {
	var getByID = d.filter(p => p.i == id);
  		if (getByID.length > 0) {

  			var mv = getByID[0]

  			var genr = []; mv.g.forEach( function(vv, ii, aa) {
				if (arrayGeneros[vv]) { genr.push(`<a href="${baseRute}/genero/#!/${arrayGeneros['-'+vv]}" up-target="body">${arrayGeneros[vv]}</a>`);}
			})

  			document.title = mv.n+" | "+nameSite

  			var classThis = ''
  			var lengthTitle = mv.n.length
  			if (lengthTitle > 25 && lengthTitle < 35) {
  				var classThis = 'class="titleLarge25"'
  			}if (lengthTitle > 35) {
  				var classThis = 'class="titleLarge35"'
  			}

  			var trlc='';if (mv.v && mv.v != '') {
  				var trlc = `<span onclick="trailer('${mv.v}');">Watch Trailer</span>`
  			}

  			document.querySelector('#single').insertAdjacentHTML('afterbegin', `
  				<div class="seeLater"></div>
				<div class="wallpaper">
					<img class="lazy" src="https://cdn.jsdelivr.net/gh/cooz-co/cooz/src/lazy.gif" data-src="https://www.themoviedb.org/t/p/w1280${mv.w}">
				</div>
			<div id="CenterInfo">
				<h1 ${classThis}>${mv.n}</h1>
				<div class="genrs">
					<a href="${baseRute}/year/#!/${mv.d}" up-target="body">${mv.d}</a>
					<li>${timeConvert(mv.r)}</li>
					<div>
						${genr.join('')}
					</div>
				</div>
				<p>${mv.s}</p>
				<div class="watch_trailer">
					<span onclick="stream_lng(this, '${mv.i}', '${mv.ps}');">Stream Now</span>
					${trlc}
				</div>
			</div>`);

  			loadImg()

  			checkUserContent(mv.i)

  		}else {
  			document.getElementById('single').innerHTML = `<div class="errorJSON">Ficha no encontrada, ¿estás seguro que es la url correcta?</div>`
  		}

  	document.getElementById('load').classList.remove("load") 

}

function linksChange() {
	var x = document.querySelector("header").querySelectorAll("a"); 
	x.forEach( function(vv, ii, aa) {
		var rolV = ''; if (ii == 1) { var rolV = '/watch-list'; }if (ii == 2) { var rolV = '/info'; }
		vv.setAttribute("href", baseRute+rolV)
	})

}

function before_getData(d, sec, page) {

		var data = d
		var number_page = page
		var perPage = 48

		if (Number.isInteger(sec)) {

			if (sec > 19) {
				// YEARS
				var data = d.filter(p => p.d.includes(sec))
				if (document.querySelector('#articles h1') == null) {
					document.querySelector('#articles').insertAdjacentHTML('afterbegin', `<h1>${sec} <b>${data.length} Películas</b></h1>`);
				}
			}else {
				// INDEX y GENEROS
				var n = sec.toString();
				var data = d.filter(p => p.g.includes(n));
				if (document.querySelector('#articles h1') == null) {
					document.querySelector('#articles').insertAdjacentHTML('afterbegin', `<h1>${arrayGeneros[n]} <b>${data.length} Películas</b></h1>`);
				}
				document.title = arrayGeneros[n]+" | "+nameSite
			}
		}

		var paginationData = paginate(data, perPage, number_page)

		if (paginationData.length > 0) {
			paginationData.forEach( function(v, i, a) {  
				var genr = []; v.g.forEach( function(vv, ii, aa) { if (arrayGeneros[vv]) { genr.push(`<b>${arrayGeneros[vv]}</b>`);} })
				document.querySelector('#articles').insertAdjacentHTML('beforeend', `<article>	<a href="${baseRute}/movie/#!/${v.i}-${v.ps}" up-target=".insert_single">			
				<div class="wallpaper"> <img  class="lazy" src="https://cdn.jsdelivr.net/gh/cooz-co/cooz/src/lazy.gif" data-src="https://www.themoviedb.org/t/p/w300${v.p}"> </div>
				<div class="moreInfo">
					<p>${v.d}</p>
					<h2>${v.n}</h2>
					<span>${genr.join('')}</span>
				</div>
				</a> </article>`);	  		
			})

			setArticleID();

			if (paginationData.length >= perPage ) {
		  		var plusPage = parseInt(number_page) + parseInt(1);
		  		if (document.querySelector('.pagination') != null) { document.querySelector('.pagination').remove() }
		  			document.querySelector('#articles').insertAdjacentHTML('beforeend', `<div class="pagination pagLoading" page="${plusPage}"></div>`);
		  			paginacion(sec, plusPage)
		  	}else { if (document.querySelector('.pagination') != null) {   document.querySelector('.pagination').remove();	} }

			
			loadImg(); 
		}else {
			if (page == 1) {
				document.querySelector('#articles').insertAdjacentHTML('beforeend', `<div class="errorJSON">No se encontraron películas que mostrar</div>`)
			}
			if (document.querySelector('.pagination') != null) {   document.querySelector('.pagination').remove();	}
		}
}

function BiggerElements(val, rl=1){	
	return function(evalue, index, array) {
		if (rl == 1) {
			return (evalue >= val);
		}else {

			return (evalue <= val);
		}
    };
}

function fract(nmp) {

	var w = window.innerWidth; var fileNb = 6
	if (w < 1500 && w > 1300) {	fileNb = 5	}
	if (w < 1300 && w > 1000) {	fileNb = 4	}
	if (w < 1000 && w > 650) {	fileNb = 3	}
	if (w < 650 && w > 350) {	fileNb = 2	}
	if (w < 350) {	fileNb = 1	}

	var articles = document.getElementById("articles").getElementsByTagName("article");
	var psc = new Array; 
	for( var i = 0; i < articles.length; i+=fileNb ) {
		 psc.push(i);
	}

	var nmb = parseInt(nmp)

	var mayor = psc.filter(BiggerElements(nmb, 1));
	var menor = psc.filter(BiggerElements(nmb, 2));

	if (nmb > menor.slice(-1)[0] && nmb < mayor[0]) {
		var nmbC =  menor.slice(-1)[0];
	}else {
		if (psc.includes(nmb)) {
			var nmbC =  parseInt(nmb);
		}else {
			var nmbC = psc.slice(-1)[0];
		}
	}

	return nmbC;
}

function setArticleID() {
	var articles = document.getElementById("articles").getElementsByTagName("article");
	for (var i = 0; i < articles.length; i++) {
		articles[i].classList.add("article_"+i)
		articles[i].querySelector('a').setAttribute("data", i)
	}
}

// START LazyLoad
const io = new IntersectionObserver((entries) =>
	entries.forEach((entry) => {
    	if (entry.isIntersecting) {
        	const image = entry.target;
        	image.src = image.dataset.src;
        	io.unobserve(image);
    	}
	})
);

function loadImg() {
	document.querySelectorAll(".lazy").forEach((element) => io.observe(element));
}
// END LazyLoad
const arrayGeneros = {
    '1': 'Acción',
    '2': 'Aventura',
    '3': 'Animación',
    '4': 'Comedia',
    '5': 'Crimen',
    '6': 'Documental',
    '7': 'Drama',
    '8': 'Familia',
    '9': 'Fantasía',
    '10': 'Historia',
    '11': 'Terror',
    '12': 'Música',
    '13': 'Misterio',
    '14': 'Romance',
    '15': 'Ciencia Ficción',
    '17': 'Suspense',
    '18': 'Bélica',
    '19': 'Western',
    'accion': '1',
    'aventura': '2',
    'animacion': '3',
    'comedia': '4',
    'crimen': '5',
    'documental': '6',
    'drama': '7',
    'familia': '8',
    'fantasia': '9',
    'historia': '10',
    'terror': '11',
    'musica': '12',
    'misterio': '13',
    'romance': '14',
    'ciencia-ficcion': '15',
    'suspense': '17',
    'belica': '18',
    'western': '19',
    '-1': 'accion',
    '-2': 'aventura',
    '-3': 'animacion',
    '-4': 'comedia',
    '-5': 'crimen',
    '-6': 'documental',
    '-7': 'drama',
    '-8': 'familia',
    '-9': 'fantasia',
    '-10': 'historia',
    '-11': 'terror',
    '-12': 'musica',
    '-13': 'misterio',
    '-14': 'romance',
    '-15': 'ciencia-ficcion',
    '-17': 'suspense',
    '-18': 'belica',
    '-19': 'western',
}


//Funcion Paginacion
function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}

//	Paginacion
function paginacion(sec, page) {
	if (document.querySelector('.pagination') != null) {

		let divPag = document.querySelector('.pagination');
		let optionsPag = {
			root: null,
			rootMargin: '0px',
			threshold: 0.05
		};

		let callback = (entries, observePag) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					if (document.querySelector('.pagLoading') != null) {
						getData(sec, page)
						divPag.classList.remove("pagLoading");
					}
				}
			});
		}
		let observePag = new IntersectionObserver(callback, optionsPag);
		observePag.observe(divPag);
	}
}

function filter(w=null) {

	var loadd = document.getElementById('load'); loadd.innerHTML = ''; loadd.classList.remove('load')

	var seachclass = document.querySelector('.icon_search')
	var loadDiv = document.querySelector('#load_2')
	loadDiv.innerHTML=''


	if (seachclass.classList.contains('menuA')) {
		seachclass.classList.remove('menuA');
		loadDiv.classList.remove('load_s_2')
	}


	if (w == null) { 
		if (document.querySelector('.menuA') != null) {
			document.querySelector('.menuA').classList.remove('menuA')
		} 
		loadDiv.classList.remove('load_s_2'); 
	}else {
		loadDiv.innerHTML=`
		<div class="closePp" onclick="filter();">×</div>
		<div class="filterS">
			<div>
				<li class="slepT">
					<input type="text" data-countmax="2" maxlength="4" data-lengthmin="1" autocomplete="off" spellcheck="false" placeholder="1994" onkeyup="yearFilter()">
					<a href="" up-target="body"><span></span></a>
				</li>
				<a href="${baseRute}/year/#!/2021" up-target="body">2021</a>
				<a href="${baseRute}/year/#!/2020" up-target="body">2020</a>
				<a href="${baseRute}/year/#!/2019" up-target="body">2019</a>
				<a href="${baseRute}/year/#!/2018" up-target="body">2018</a>
				<a href="${baseRute}/year/#!/2017" up-target="body">2017</a>
				<a href="${baseRute}/year/#!/2016" up-target="body">2016</a>
				<a href="${baseRute}/year/#!/2015" up-target="body">2015</a>
				<a href="${baseRute}/year/#!/2014" up-target="body">2014</a>
			</div>
			
			<div>
				<a href="${baseRute}/genero/#!/accion" up-target="body">Acción</a>
				<a href="${baseRute}/genero/#!/aventura" up-target="body">Aventura</a>
				<a href="${baseRute}/genero/#!/animacion" up-target="body">Animación</a>
				<a href="${baseRute}/genero/#!/comedia" up-target="body">Comedia</a>
				<a href="${baseRute}/genero/#!/crimen" up-target="body">Crimen</a>
				<a href="${baseRute}/genero/#!/documental" up-target="body">Documental</a>
				<a href="${baseRute}/genero/#!/drama" up-target="body">Drama</a>
				<a href="${baseRute}/genero/#!/familia" up-target="body">Familia</a>
				<a href="${baseRute}/genero/#!/fantasia" up-target="body">Fantasía</a>
				<a href="${baseRute}/genero/#!/historia" up-target="body">Historia</a>
				<a href="${baseRute}/genero/#!/terror" up-target="body">Terror</a>
				<a href="${baseRute}/genero/#!/musica" up-target="body">Música</a>
				<a href="${baseRute}/genero/#!/misterio" up-target="body">Misterio</a>
				<a href="${baseRute}/genero/#!/romance" up-target="body">Romance</a>
				<a href="${baseRute}/genero/#!/ciencia-ficcion" up-target="body">Ciencia Ficción</a>
				<a href="${baseRute}/genero/#!/suspense" up-target="body">Suspense</a>
				<a href="${baseRute}/genero/#!/belica" up-target="body">Bélica</a>
				<a href="${baseRute}/genero/#!/western" up-target="body">Western</a>
			</div>
		</div>`
	}

	if (document.querySelector('.menuA') != null) {
		loadDiv.innerHTML=''
	}
	if (w != null) {w.classList.toggle('menuA'); loadDiv.classList.toggle('load_s_2')}

}

function searchClick(w) {
	var loadd = document.getElementById('load'); loadd.innerHTML = ''; loadd.classList.remove('load')

	var filclass = document.querySelector('.icon_filter')
	var loadDiv = document.querySelector('#load_2')
	loadDiv.innerHTML=''

	if (filclass.classList.contains('menuA')) {
		filclass.classList.remove('menuA');
		var loadDiv = document.querySelector('#load_2');
		loadDiv.classList.remove('load_s_2')
	}

	loadDiv.innerHTML=`
		<div class="searchBox">
			<div class="closePp" onclick="filter();">×</div>
			<input id="search" name="key" type="text" data-countmax="2" maxlength="50" data-lengthmin="1" autocomplete="off" spellcheck="false" placeholder="Buscar en Cooz" onkeypress="return liveSearch(event)" onkeyup="return liveSearch(event)" onpaste="setTimeout('liveSearch(event)', 300)">
			<div class="articleSimple"></div>
		</div>`
	
	if (document.querySelector('.menuA') != null) {
		loadDiv.innerHTML=''
	}

	if (w != null) {w.classList.toggle('menuA'); loadDiv.classList.toggle('load_s_2')}
	var seacDiv = document.querySelector('#search')
	if (seacDiv != null) {
		seacDiv.focus()
		seacDiv.select()
	}

}

function yearFilter(e, i) {
	let yearFl = document.querySelector('.slepT input').value;
	if (yearFl.length > 3 && yearFl.length < 5) {
		document.querySelector('.slepT a').setAttribute("href", baseRute+"/year/#!/"+yearFl)
	}
}

var search_timeout = 0;
function liveSearch(e) {

	var valueSearch = document.querySelector('#search').value;
	st = valueSearch.replace(/\s/g, '')
	if (st.length > 1) {
		if (document.querySelector('.loadingSearch') == null) {
			document.querySelector('.searchBox').insertAdjacentHTML('afterbegin', `<div class="loadingSearch"></div>`)
		}
		if (e == true) {

				getData('search', 1)
			
		}else {	clearTimeout(search_timeout), search_timeout = setTimeout("liveSearch(true)", 200);	}
	}else {
		if (document.querySelector('.loadingSearch') != null) {	document.querySelector('.loadingSearch').remove() }
		document.querySelector('.articleSimple').innerHTML = ''
	}
}

function send_data_search(d) {

	document.querySelector('.articleSimple').innerHTML = '';

	if (document.querySelector('.loadingSearch') != null) {
		document.querySelector('.loadingSearch').remove()
	}

	var valueSearch = document.querySelector('#search').value;

	var dataArr1 = d.filter(function(value) { return value.n.toLowerCase().indexOf(valueSearch.toLowerCase()) >= 0; });
	var dataArr2 = d.filter(function(value) { return value.on.toLowerCase().indexOf(valueSearch.toLowerCase()) >= 0; });
	var dataArr3 = dataArr1.concat(dataArr2);

	var data = dataArr3.reduce((acc, current) => {
		const x = acc.find(item => item.i === current.i);
		if (!x) {
			return acc.concat([current]);
		} else {
			return acc;
		}
	}, []);

	if (data.length > 0) {

		var paginationData = paginate(data, 40, 1)

		if (paginationData.length > 0) {

			paginationData.forEach( function(v, i, a) {  

				var genr = []; v.g.forEach( function(vv, ii, aa) { if (arrayGeneros[vv]) { genr.push(`<b>${arrayGeneros[vv]}</b>`);} })
				document.querySelector('.articleSimple').insertAdjacentHTML('beforeend', `<li><a href="${baseRute}/movie/#!/${v.i}-${v.ps}" up-target="body">
					<div class="poster"> <img class="lazy" src="https://cdn.jsdelivr.net/gh/cooz-co/cooz/src/lazy.gif" data-src="https://www.themoviedb.org/t/p/w92${v.p}"> </div>
					<p>${v.d}</p>
					<h2>${v.n}</h2>
					<span>${genr.join('')}</span>
				</a></li>`);	  		

			})

			loadImg(); 

		}

	}
}

function timeConvert(n) {
	var num = n;
	var hours = (num / 60);
	var rhours = Math.floor(hours);
	var minutes = (hours - rhours) * 60;
	var rminutes = Math.round(minutes);
	return rhours + "H " + rminutes + "M";
}

function checkVersion() {

	var noCache = new Headers();
	noCache.append('pragma', 'no-cache');
	noCache.append('cache-control', 'no-cache');

	fetch(versionRute, {
	    method: 'GET',
	    headers: noCache
	}) .then(res => res.json()) .then( d => { 
	  	
		var cardsLocal = localStorage.getItem('version');
		if (cardsLocal) {

			if (cardsLocal != d) { versionDelte(1, d) }

		}else { versionDelte(1, d) }

	}).catch(function(e) {  versionDelte(2) });

}

function versionDelte(i, w=null) {
	if (i == 1) {
		localStorage.setItem('version', w)
		document.querySelector('.icon_version').classList.add("newVers")
	}else { window.localStorage.removeItem('version') }
	

	var cacheCheck = localStorage.getItem('cacheCooz');
	if (cacheCheck) { localStorage.setItem('cacheCooz', JSON.stringify([])) }else {	 localStorage.setItem('cacheCooz', JSON.stringify([]))  }

}

function getVersions() {
	var loadVrs = document.getElementById('load')
	var offArt = document.querySelector('#articles_off article')

	loadVrs.classList.add("load") 

	var noCache = new Headers();
	var check_existCache = checkExist_Cache('versions.json', 1)
	if (check_existCache != 200) {
		noCache.append('pragma', 'no-cache');
		noCache.append('cache-control', 'no-cache');
	}

	fetch(versionsRute, {
		method: 'GET',
		headers: noCache
	}) .then(res => res.json()) .then( d => { 

		loadVrs.classList.remove("load") 

		d.forEach( function(v, i, a) {  
			var idsIPFS = []; v.i.forEach( function(vv, ii, aa) { idsIPFS.push(`<li onclick="openVersions(this, '${vv}');">${vv}</li>`); })
			offArt.insertAdjacentHTML('afterbegin', ` <div>	<h2>${v.d}</h2>	${idsIPFS.join('')}	</div>`);
		})

		offArt.insertAdjacentHTML('afterbegin', `<h1>Versiones descentralizadas <b>${d.length}</b></h1>`);

		d.l

		if (check_existCache == 404) {
			checkExist_Cache('versions.json', 2)
		}

	}).catch(function(e) {
		loadVrs.classList.remove("load") 
		offArt.innerHTML = `<div class="errorJSON">Hubo un problema inesperado, por favor inténtelo de nuevo</div>`
	});
}

function openVersions(w, id) {

	if (document.querySelector('.thisPorts') != null) {
		document.querySelector('.thisPorts').remove()
	}if (document.querySelector('.versionAc') != null) {
		document.querySelector('.versionAc').classList.remove('versionAc')
	}

	w.classList.add('versionAc')
	w.insertAdjacentHTML('afterend', `<span class="thisPorts">
		<p>Portales publicos IPFS de esta versión</p>
		<a href="https://trusted-setup.filecoin.io/ipfs/${id}" rel="nofollow" target="_blank">https://filecoin.io/ipfs/${id}</a>
		<a href="https://cloudflare-ipfs.com/ipfs/${id}" rel="nofollow" target="_blank">https://cloudflare.com/ipfs/${id}</a>
		<a href="https://video.oneloveipfs.com/ipfs/${id}" rel="nofollow" target="_blank">https://video.oneloveipfs.com/ipfs/${id}</a>
		<a href="https://gateway.ipfs.io/ipfs/${id}" rel="nofollow" target="_blank">https://gateway.ipfs.io/ipfs/${id}</a>
		<a href="https://ipfs.fleek.co/ipfs/${id}" rel="nofollow" target="_blank">https://ipfs.fleek.co/ipfs/${id}</a>
	</span>`)	
}


function trailer(id) {

	if (id != 1) {
		document.getElementById('load').classList.add("load")
		document.getElementById('articles').insertAdjacentHTML('beforebegin', `<div class="trailer" style="display: none;"><div class="closePp" onclick="trailer(1);">×</div><iframe frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe></div>`)

		var ifrm = document.querySelector('.trailer iframe');
		ifrm.addEventListener("load", function() {
			document.querySelector('.trailer').removeAttribute("style")
		});
		ifrm.src = 'https://www.youtube.com/embed/'+id+'?autoplay=1&loop=1';
	}else {
		document.querySelector('.trailer').remove()
		document.getElementById('load').classList.remove("load")
	}

}

function userData(data) {

	var request = indexedDB.open("watch_list")
	request.onsuccess = function(event) { document.querySelector('#articles_off').remove()
		idb.select("watch_list", function (selected, res) {
	        if (selected) {
	        	if (res.length > 0) { var cong = 0
	        		document.querySelector('header').insertAdjacentHTML('afterend', '<div id="articles" class="ilikethis"></div>')

	        		res.sort((a, b)=> a.t - b.t)
					res.forEach( function(v, ii, a) {
						if (v.i) {
							var getByID = data.filter(p => p.i == v.i);
	  						if (getByID.length > 0) {
								var genr = []; getByID[0].g.forEach( function(vv, ii, aa) { if (arrayGeneros[vv]) { genr.push(`<b>${arrayGeneros[vv]}</b>`);} })
								document.querySelector('#articles').insertAdjacentHTML('afterbegin', `<article>	<a href="${baseRute}/movie/#!/${getByID[0].i}-${getByID[0].ps}" up-target=".insert_single">			
									<div class="wallpaper"> <img  class="lazy" src="https://cdn.jsdelivr.net/gh/cooz-co/cooz/src/lazy.gif" data-src="https://www.themoviedb.org/t/p/w300${getByID[0].p}"> </div>
									<div class="moreInfo">
									<p>${getByID[0].d}</p>
									<h2>${getByID[0].n}</h2>
									<span>${genr.join('')}</span>
								</div>
								</a> </article>`);	

								document.getElementById('load').classList.remove("load") 
								cong++
	  						}
						}		
					})

					document.querySelector('#articles').insertAdjacentHTML('afterbegin', `<h1 style="text-transform: capitalize;">Watch List <b>${cong} Películas</b></h1>`);
					setArticleID(); loadImg(); 

	        	}else {
	        		document.getElementById('load').classList.remove("load")
					document.querySelector('header').insertAdjacentHTML('afterend', `<div id="articles" class="ilikethis">
						<h1 style="text-transform: capitalize;">Watch List <b>0 Películas</b></h1>
						<div class="errorJSON">Por ahora no tienes películas guardadas</div>
					</div>`)
	        	}
	        }
	    });

	};

	request.onerror = function(event) {
		document.getElementById('load').classList.remove("load")
		document.querySelector('header').insertAdjacentHTML('afterend', `<div id="articles" class="ilikethis">
			<h1 style="text-transform: capitalize;">Watch List <b>0 Películas</b></h1>
			<div class="errorJSON">Hubo un problema inesperado, por favor inténtelo de nuevo</div>
		</div>`)
	};
}



function checkUserContent(id) {
	var request = indexedDB.open("watch_list")
	request.onsuccess = function(event) {
		idb.select("watch_list", function (selected, res) {
	        if (selected) {
	        	var getByID = res.filter(p => p.i == id);
  				if (getByID.length > 0) {
  					document.querySelector('.seeLater').innerHTML = `<span onclick="addORdelete(this, '${id}');" style="background: #0e3884; color: #ffffff;"><i class="icon_inLate"></i> Ver mas tarde</span>`
  				}else {
  					document.querySelector('.seeLater').innerHTML = `<span onclick="addORdelete(this, '${id}');"><i class="icon_seeLater"></i> Ver mas tarde</span>`
  				}
	        }
	    });

	};
}

function addORdelete(w, id) {

	w.insertAdjacentHTML('afterbegin', '<p></p>');

	var request = indexedDB.open("watch_list")
	request.onsuccess = function(event) {
		idb.select("watch_list", function (selected, res) {
	        if (selected) {
	        	var getByID = res.filter(p => p.i == id);
  				if (getByID.length > 0) {
  					idb.delete("watch_list", String(id), function (isDeleted, responseText) {
  						if (isDeleted) {
  							document.querySelector('.seeLater').innerHTML = `<span onclick="addORdelete(this, '${id}');"><i class="icon_seeLater"></i> Ver mas tarde</span>`
  						}
  					});
  				}else {
  					var seconds = new Date().getTime() / 1000;
  					idb.insert("watch_list", {'i': id, 't': seconds}, function (isInserted, responseText) {
						if (isInserted) {   
							document.querySelector('.seeLater').innerHTML = `<span onclick="addORdelete(this, '${id}');" style="background: #0e3884; color: #ffffff;"><i class="icon_inLate"></i> Ver mas tarde</span>`
						}
					});
  				}
	        }
	    });
	};
}


const videosArray = [];

function stream_lng(w, id=null, ps=null) {

	var existInVar = videosArray.filter(p => p.i == id);

  	if (existInVar.length == 0) {

		if (id != null) {

			if (w.querySelector('p') == null) {
				w.innerHTML += `<p></p>`


				var noCache = new Headers();
				var check_existCache = checkExist_Cache(videosRute+ps+'vds.json', 1)
				if (check_existCache != 200) {
					noCache.append('pragma', 'no-cache');
					noCache.append('cache-control', 'no-cache');
				}

				fetch(videosRute+ps+'.json', {
					method: 'GET',
					headers: noCache
				}) .then(res => res.json()) .then( d => { 

					var exot = d.filter(p => p.i == id);
					if (exot[0].v.length > 0) {
					  	beforeStream(id, exot, w)
					}else {
					  	beforeStream(id, [], w)
					}

					if (check_existCache == 404) {
						checkExist_Cache(videosRute+ps+'vds.json', 2)
					}

							 	
				}).catch(function(e) {   });

			}

		}else {
			document.querySelector('.getLG').remove();
			var allFnd = document.querySelectorAll("[class^=fondo_play]")
			for (var i = allFnd.length - 1; i >= 0; i--) {
				allFnd[i].remove()
			}
			document.querySelector('#single').classList.remove('readyToplay');
		}

	}else {
		if (w.querySelector('p') == null) {
			w.innerHTML += `<p></p>`
			beforeStream(id, existInVar, w)
		}
	}
}

function beforeStream(id, data, w) {

	var idms = ['', 'Español', 'Latino', 'Subtitulado', 'Ingles']

	var getByID = data.filter(p => p.i == id);
  	if (getByID.length > 0) {
  		var mv = getByID[0]
  			
  		var psc = new Array; for (var i = 5 - 1; i >= 1; i--) {
  			var exot = mv.v.filter(p => p.t == i);
  			if (exot.length > 0) {
  				psc.push(`<li class="lng_${i}" onclick="selectLng(${i}, ${id});">${idms[i]}</li>`);
  			}
  		}

  		if (psc.length > 0) {
  			var reversed = psc.reverse();
	  			remST(w)
			document.querySelector('.watch_trailer').insertAdjacentHTML('beforeend', `
				<div class="getLG">
					${reversed.join('')}
					<b onclick="stream_lng(null);">×</b>
				</div>
			`);

  		}else {
  			remST(w)
  			document.querySelector('.watch_trailer').insertAdjacentHTML('beforeend', `
				<div class="getLG">
					<span>No disponible</span>
					<b onclick="stream_lng(null);">×</b>
				</div>
			`);
  		}

  		var existInVar = videosArray.filter(p => p.i == id);
  		if (existInVar.length == 0) {
  			videosArray.push(data[0]);
  		}
 
  	}else {

  		remST(w)
  		document.querySelector('.watch_trailer').insertAdjacentHTML('beforeend', `
		<div class="getLG">
			<span>No disponible</span>
			<b onclick="stream_lng(null);">×</b>
		</div>
		`);
  	}
}

function remST(w) {
		w.querySelector('p').remove()
  		if (document.querySelector('.fondo_play') == null) {
			document.querySelector('#single').insertAdjacentHTML('afterbegin', '<div class="fondo_play"></div>');
			document.querySelector('#CenterInfo').insertAdjacentHTML('afterbegin', '<div class="fondo_play"></div>');
			document.querySelector('#single').classList.add('readyToplay');
		}
}

function selectLng(id, tp) {
		
	var existInVar = videosArray.filter(p => p.i == tp);

  	if (existInVar[0].v.length > 0) {

  		var this_videos = existInVar[0].v
  			var exot = this_videos.filter(p => p.t == id);
			exot.sort((a, b)=> a.p - b.p)
						
						var psc = new Array; exot.forEach( function(v, i, a) {  
							var typ = v.s
							psc.push(`<li onclick="severSelect(this, '${v.l}');">
								<img src="${servidores[typ].icon}">
								<span>${servidores[typ].name}</span>
							</li>`);  		
						})

						document.querySelector('#articles').insertAdjacentHTML('afterbegin', `
						<div id="InsertHere">
							<div class="ListServers">
								<p onclick="stream_close();">×</p>
								<span class="pop_ChangeServer"></span>
								<ul>
									${psc.join('')}
									<li style="opacity: 0;cursor: initial;margin: 0;padding: 0 119px 0 0;"></li>
								</ul>
							</div>

							<div class="ServerOn">
								<div class="inD">
									<span class="pop_ChangeServer"></span>
									<iframe frameborder="0" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>
								</div>
							</div>

						</div>`);

						var firstC = document.querySelectorAll(".ListServers ul > li")[0]
						severSelect(firstC, exot[0].l)
						touch()

  	}
}


function stream_close() {
	if (document.getElementById("InsertHere") != null) {
		document.getElementById("InsertHere").remove()
		stream_lng(null)
	}
}

function touch() {

	if (mobilecheck() == true || mobileAndTabletcheck() == true) {
		document.querySelector(".ListServers").setAttribute("style", "overflow-x: auto;");
	}

	const slider = document.querySelector('.ListServers');
	let isDown = false;
	let startX;
	let scrollLeft;

	slider.addEventListener('mousedown', (e) => {
	  isDown = true;
	  startX = e.pageX - slider.offsetLeft;
	  scrollLeft = slider.scrollLeft;
	  slider.classList.remove("desableA");
	});
	slider.addEventListener('mouseleave', () => {
	  isDown = false;
	});
	slider.addEventListener('mouseup', (e) => {
	  isDown = false;
	  slider.classList.remove("desableA");
	  const x = e.pageX - slider.offsetLeft;
	  const walk = (x - startX); //scroll-fast
	});
	slider.addEventListener('mousemove', (e) => {
	  if(!isDown) return;
	  e.preventDefault();
	  const x = e.pageX - slider.offsetLeft;
	  const walk = (x - startX); //scroll-fast
	  slider.scrollLeft = scrollLeft - walk;
	  if (walk > 20 || walk < -20) {
	  	slider.classList.add("desableA");
	  }
	});
}


window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

window.mobileAndTabletcheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


var CryptoJSAesJson = {
	stringify: function (cipherParams) {
		var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
		if (cipherParams.iv) j.iv = cipherParams.iv.toString();
		if (cipherParams.salt) j.s = cipherParams.salt.toString();
		return JSON.stringify(j);
	},
	parse: function (jsonStr) {
		var j = JSON.parse(jsonStr);
		var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
		if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
		if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
		return cipherParams;
	}
}

function checkExist_Cache(str, id) {
	
	var slp = str.split('/');
	var pst = slp[slp.length - 1]
	if (id == 1) {
		var status = 404
		var cacheCheck = localStorage.getItem('cacheCooz');
		if (cacheCheck) {
			var parse = JSON.parse(cacheCheck)
			if (parse.includes(pst)) { var status = 200 }
		}else { var status = 303 }

		return status

	}else {

		var cacheCheck = localStorage.getItem('cacheCooz');
		if (cacheCheck) {
			var parse = JSON.parse(cacheCheck)
			parse.push(pst)
			localStorage.setItem('cacheCooz', JSON.stringify(parse))
		}
	}
}

function severSelect(w, id) {
	
	var aRL = window.location.href; var sp = aRL.split('/')
	var iflv = sp.slice(-1)[0]+'/xd' 

	document.getElementById("InsertHere").classList.add("ChangeActive");
	var lis = document.querySelector(".ListServers ul").getElementsByTagName("li");
	for (i = 0; i < lis.length; i++)lis[i].classList.remove("serverActived");
	w.classList.add("serverActived");
	
	var dd = atob(id);
	var ddc = JSON.parse(CryptoJS.AES.decrypt(dd, iflv+"/shhh/"+msnLove, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));

	var ifrm = document.querySelector('.inD iframe');
	ifrm.addEventListener("load", function() {
		document.getElementById("InsertHere").classList.remove("ChangeActive");
	});
	ifrm.src = ddc;

}