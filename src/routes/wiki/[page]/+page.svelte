<script>
	import Header from '$lib/Header.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import socket from '../../../lib/socket';
	const searchParams = new URLSearchParams(window.location.search);
	let lang = searchParams.get('lang') || 'en';
	let err = false;
	let pageParam = $page.params.page;
	let previousPage = '';
	let searchedThisPage = false;
	let searchTerm;
	let i = 0;
	let loading = true;
	let searchPage = null;
	let inGame = true;
	let gameId = searchParams.get('gameId');
	let host = false;
	let destinationArticle = '';

	let route = '';

	socket.emit('exists', gameId);
	socket.emit('isHost', gameId);
	socket.emit('gameDetails', gameId);
	socket.on('exists', (val) => {
		if (!val) goto('/');
	});

	socket.on('isHost', (isHost) => {
		host = isHost;
	});

	socket.on('destinationArticle', (article) => {
		destinationArticle = article;
	});

	function assignListeners() {
		//apply event listeners to all links
		for (let a of document.body.getElementsByTagName('a')) {
			a.addEventListener('click', (e) => {
				e.preventDefault();
				loading = true;
				previousPage = pageParam;

				pageParam = a.href.split('/wiki/')[1]; //als dit niet werkt dan paniek
				pageParam = decodeURIComponent(pageParam);

				url = getURL();
				loadPage();
				i += 1;
			});
		}
	}

	function getURL() {
		return `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${pageParam}/with_html?redirects=0&disableeditsection=true`;
	}
	let url = getURL();
	let processedPage;

	async function loadPage(updateRoute = true) {
		//reset variables
		err = false;
		searchedThisPage = false;
		searchTerm = '';

		loading = true;

		const redCheck = await fetch(
			`https://${lang}.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=displaytitle&page=${pageParam}`
		);
		const redCheckData = await redCheck.json();

		if (redCheckData?.parse?.redirects?.length > 0) {
			const last = redCheckData?.parse?.redirects[redCheckData.parse.redirects.length - 1];
			pageParam = last.to.replaceAll(' ', '_');
			url = getURL();
			loadPage(true);
			return;
		}

		if (pageParam === destinationArticle) {
			socket.emit('score', {
				gameId,
				clicks: i + 1,
				route: `${route} -> ${pageParam.replaceAll('_', ' ')} 🏁`
			});
		}

		const response = await fetch(url);
		const data = await response.json();

		console.log(data);

		const html = data.html;
		if (!html) {
			if (!previousPage) return (err = true);
			alert('This page could not be loaded.');
			if (i > 0) i--;
			pageParam = previousPage;
			url = getURL();
			loadPage(false);
			return;
		}

		//parse html as html
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		function disableElem(elem) {
			elem.style.pointerEvents = 'none';
			elem.style.color = 'red';
		}

		//remove base tag
		const base = doc.getElementsByTagName('base')[0];
		if (base) base.parentNode.removeChild(base);

		//loop through all a links
		for (let a of doc.getElementsByTagName('a')) {
			console.log(a.href);
			a.href = a.href.replace(`http://${window.location.host}`, `https://${lang}.wikipedia.org`);
			a.href = a.href.replace(`https://${window.location.host}`, `https://${lang}.wikipedia.org`);
			if (
				(!a.href.startsWith(`http://${lang}.wikipedia.org/wiki/`) &&
					!a.href.startsWith(`https://${lang}.wikipedia.org/wiki/`) &&
					!a.href.startsWith(`${window.location.host}/wiki/`)) ||
				a.href.endsWith('&redlink=1')
			)
				disableElem(a);
		}

		const h2s = ['External_links', 'References', 'See_also'];

		//loop through all h2 tags
		h2s.forEach((h2) => {
			const h2Elem = doc.getElementById(h2);
			if (!h2Elem) return;
			h2Elem.parentElement.style.display = 'none';
		});

		//loop through all img tags
		for (let img of doc.getElementsByTagName('img')) {
			if (img.parentElement.tagName === 'A') disableElem(img.parentElement);
		}

		//loop through all tables
		for (let table of doc.getElementsByTagName('table')) {
			if (table.classList.contains('sidebar')) table.style.display = 'none';
		}

		//loop through all link tags
		for (let link of doc.getElementsByTagName('link')) {
			link.href = link.href.replace(
				`http://${window.location.host}`,
				`https://${lang}.wikipedia.org`
			);
			link.href = link.href.replace(
				`https://${window.location.host}`,
				`https://${lang}.wikipedia.org`
			);
		}

		//push entire page to processedPage
		processedPage = doc.head.innerHTML + doc.body.innerHTML;
		loading = false;

		if (updateRoute)
			if (route.length > 0) route = `${route} -> ${pageParam.replaceAll('_', ' ')}`;
			else if (route.length === 0) route = pageParam.replaceAll('_', ' ');

		setTimeout(() => assignListeners(), 1);
	}

	searchPage = async function () {
		if (searchedThisPage) alert('You can only search once per page!');
		if (searchTerm.length < 3) return;
		i += 1;
		searchedThisPage = true;

		const parser = new DOMParser();
		const doc = parser.parseFromString(processedPage, 'text/html');

		//loop through all text and highlight it
		for (let text of doc.getElementsByTagName('p'))
			if (text.textContent.toLowerCase().includes(searchTerm.toLowerCase()))
				text.style.backgroundColor = '#ffff00';

		processedPage = doc.head.innerHTML + doc.body.innerHTML;

		setTimeout(() => assignListeners(), 1);
	};

	loadPage();

	//block control+f
	window.addEventListener('keydown', (e) => {
		if (e.ctrlKey && e.key === 'f') {
			e.preventDefault();
		}
	});

	//block right click
	window.addEventListener('contextmenu', (e) => {
		e.preventDefault();
	});
</script>

<Header
	bind:inGame
	bind:i
	bind:loading
	bind:searchedThisPage
	bind:searchTerm
	bind:searchPage
	bind:destinationArticle
	bind:route
	bind:gameId
/>
{#if processedPage && !loading && !err}
	<h1>{pageParam.replaceAll('_', ' ')}</h1>
	<div class="gameContent">
		{@html processedPage}
	</div>
{:else if err}
	<p class="loading">Error loading {pageParam.replaceAll('_', ' ')}</p>
{:else}
	<p class="loading">Loading {pageParam.replaceAll('_', ' ')}...</p>
{/if}

<style>
	.loading {
		font-size: 1.5rem;
		text-align: center;
	}

	.gameContent {
		padding-left: 1rem;
		padding-right: 1rem;
	}
</style>
