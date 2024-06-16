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

	socket.on('gotoScores', () => {
		goto('/' + gameId + '/scores');
	});

	function assignListeners() {
		//apply event listeners to all links
		for (let a of document.body.getElementsByTagName('a')) {
			a.addEventListener('click', (e) => {
				e.preventDefault();
				previousPage = pageParam;

				pageParam = a.href.replace(`http://${lang}.wikipedia.org/wiki/`, '');

				//START WIKIPEDIA IS STUPID FIXES

				//if pageparam ends with (hoofdbetekenis), remove it (for nl)
				if (pageParam.endsWith('(hoofdbetekenis)')) {
					pageParam = pageParam.replace('_(hoofdbetekenis)', '');
				}

				//END WIKIPEDIA IS STUPID FIXES

				if (pageParam === destinationArticle) {
					loading = true;
					socket.emit('score', {
						gameId,
						clicks: i + 1,
						route: `${route} -> ${pageParam.replaceAll('_', ' ')}`
					});
					return;
				}
				url = getURL();
				loadPage();
				i += 1;
			});
		}
	}

	function getURL() {
		return `https://api.wikimedia.org/core/v1/wikipedia/${lang}/page/${pageParam}/with_html`;
	}
	let url = getURL();
	let processedPage;

	async function loadPage(loadingPreviousPage = false) {
		//reset variables
		err = false;
		searchedThisPage = false;
		searchTerm = '';

		loading = true;
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
			loadPage(true);
			return;
		}

		//parse html as html
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');

		function disableElem(elem) {
			elem.style.pointerEvents = 'none';
			elem.style.color = 'red';
		}

		//loop through all a links
		for (let a of doc.getElementsByTagName('a')) {
			if (a.href.startsWith('./')) {
				a.href = a.href.replace('./', `http://${lang}.wikipedia.org/wiki/`);
			}
			if (!a.href.startsWith(`http://${lang}.wikipedia.org/wiki/`)) disableElem(a);
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

		//push entire page to processedPage
		processedPage = doc.head.innerHTML + doc.body.innerHTML;
		loading = false;
		if (!loadingPreviousPage) route = `${route} -> ${pageParam.replaceAll('_', ' ')}`;

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

<Header bind:inGame bind:i bind:loading bind:searchedThisPage bind:searchTerm bind:searchPage />
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
