<script>
	import socket from '$lib/socket.js';
	import Header from '$lib/Header.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let sourceArticleSearch = '';
	let sourceArticle = '';
	let destinationArticleSearch = '';
	let destinationArticle = '';
	let language = 'en';

	let destinationArticleResults = [];
	let sourceArticleResults = [];
	let destinationArticleSearchInput;

	let users = [];

	let pin = $page.params.pin;
	let host = false;

	function harrassSocket() {
		socket.emit('exists', pin);
		socket.emit('isHost', pin);
		socket.emit('getUsers', pin);
		socket.emit('gameDetails', pin);
	}

	socket.on('reconnect', () => harrassSocket());

	harrassSocket();

	socket.on('isHost', (isHost) => {
		host = isHost;
	});
	socket.on('exists', (val) => {
		if (!val) goto('/');
	});

	socket.on('users', (newUsers) => {
		users = newUsers;
	});

	socket.on('sourceArticle', (article) => {
		sourceArticle = article;
	});

	socket.on('destinationArticle', (article) => {
		destinationArticle = article;
	});

	socket.on('language', (newLanguage) => {
		language = newLanguage;
	});

	async function searchWikipedia(searchTerm) {
		const res = await fetch(
			`https://${language}.wikipedia.org/w/api.php?action=opensearch&origin=*&format=json&formatversion=2&search=${encodeURIComponent(
				searchTerm
			)}
            &namespace=0&limit=5`
		);

		const json = await res.json();

		const results = json[1] || [];

		return results;
	}
</script>

<Header gameId={pin} lobby={true} />

<h1 class="lobby">{pin}</h1>

<h2 class="usersHeader">Users in lobby</h2>
<p class="users">{users.join(', ')}</p>

<h2 class="objectiveHeader">Objective</h2>
<p class="objective">
	{sourceArticle?.replaceAll('_', ' ') ?? 'None'} to {destinationArticle?.replaceAll('_', ' ') ??
		'None'} ({language})
</p>

{#if host}
	<div class="language">
		<select
			bind:value={language}
			on:change={() => {
				socket.emit('language', {
					pin,
					language
				});

				sourceArticle = '';
				destinationArticle = '';
				socket.emit('sourceArticle', {
					pin,
					article: ''
				});
				socket.emit('destinationArticle', {
					pin,
					article: ''
				});
			}}
		>
			<option value="en">English</option>
			<option value="nl">Nederlands</option>
			<option value="ru">Russia</option>
		</select>
	</div>
	<div class="sourceArticle">
		<input
			type="text"
			placeholder="Source article"
			bind:value={sourceArticleSearch}
			on:keyup={async (e) => {
				const curVal = e.target.value;
				setTimeout(async () => {
					if (curVal !== sourceArticleSearch) return;
					sourceArticleResults = await searchWikipedia(curVal);
				}, 300);
			}}
		/>
		{#if sourceArticleResults.length > 0}
			<select
				bind:value={sourceArticle}
				on:change={async () => {
					const res = await fetch(
						`https://${language}.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=displaytitle&page=${encodeURIComponent(
							sourceArticle
						)}`
					);

					const json2 = await res.json();

					const exists = json2?.parse?.displaytitle?.length > 0;
					const redirects = json2?.parse?.redirects || [];
					if (!exists) {
						sourceArticle = '';
						return alert(
							'This article does not exist, dont ask me why Wikipedia does this sometimes :D'
						);
					}

					if (redirects?.length > 0) {
						const lastRedirect = redirects[redirects.length - 1];
						sourceArticle = lastRedirect.to;
					}

					socket.emit('sourceArticle', {
						pin,
						article: sourceArticle
					});
					sourceArticleResults = [];
				}}
			>
				{#each sourceArticleResults as result}
					<option value={result}>{result}</option>
				{/each}
			</select>
		{/if}
	</div>
	<div class="destinationArticle">
		<input
			type="text"
			placeholder="Destination article"
			bind:value={destinationArticleSearch}
			bind:this={destinationArticleSearchInput}
			on:keyup={async (e) => {
				const curVal = e.target.value;
				setTimeout(async () => {
					if (curVal !== destinationArticleSearch) return;
					destinationArticleResults = await searchWikipedia(curVal);
				}, 300);
			}}
		/>
		{#if destinationArticleResults.length > 0}
			<select
				bind:value={destinationArticle}
				on:change={async () => {
					const res = await fetch(
						`https://${language}.wikipedia.org/w/api.php?redirects=1&format=json&origin=*&action=parse&prop=displaytitle&page=${encodeURIComponent(
							destinationArticle
						)}`
					);

					const json = await res.json();

					const exists = json?.parse?.displaytitle?.length > 0;
					const redirects = json?.parse?.redirects || [];
					if (!exists) {
						destinationArticle = '';

						return alert(
							'This article does not exist, dont ask me why Wikipedia does this sometimes :D'
						);
					}

					if (redirects?.length > 0) {
						const lastRedirect = redirects[redirects.length - 1];
						destinationArticle = lastRedirect.to;
					}

					const res2 = await fetch(
						`https://${language}.wikipedia.org/w/api.php?action=query&origin=*&format=json&prop=pageprops&ppprop=disambiguation&titles=${encodeURIComponent(destinationArticle)}&formatversion=2`
					);

					const json2 = await res2.json();

					const disambiguation = json2?.query?.pages[0]?.pageprops?.disambiguation;

					if (disambiguation === '') {
						destinationArticleSearch = `${destinationArticle} (`;
						destinationArticle = '';
						socket.emit('destinationArticle', {
							pin,
							article: destinationArticle
						});

						alert(
							'This article is a disambiguation page and is impossible to reach. Please select a more specific article.'
						);
						destinationArticleResults = await searchWikipedia(destinationArticleSearch);
						return;
					}

					socket.emit('destinationArticle', {
						pin,
						article: destinationArticle
					});
					destinationArticleResults = [];
				}}
			>
				{#each destinationArticleResults as result}
					<option value={result}>{result}</option>
				{/each}
			</select>
		{/if}
	</div>

	<button
		class="startButton"
		on:click={() => {
			socket.emit('language', {
				pin,
				language
			});
			socket.emit('start', pin);
		}}
		disabled={!host || !sourceArticle || !destinationArticle}>Start</button
	>
{/if}

<style>
	.lobby {
		font-size: 2.5rem;
		font-weight: bold;
		font-family: sans-serif;
		text-align: center;
		height: 100%;
	}

	.sourceArticle {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1rem;
	}

	.destinationArticle {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1rem;
	}

	.language {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.sourceArticle input {
		min-width: 20rem;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}
	.sourceArticle select {
		min-width: 20rem;

		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}
	.destinationArticle input {
		min-width: 20rem;

		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}
	.destinationArticle select {
		min-width: 20rem;

		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}
	.language select {
		min-width: 20rem;

		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
		font-size: 1rem;
	}

	.users {
		font-size: 1.3rem;
		text-align: center;
		font-family: sans-serif;
	}

	.usersHeader {
		font-size: 1.5rem;
		text-align: center;
		font-family: sans-serif;
	}

	.objectiveHeader {
		font-size: 1.5rem;
		text-align: center;
		font-family: sans-serif;
	}

	.objective {
		font-size: 1.3rem;
		text-align: center;
		font-family: sans-serif;
	}

	.startButton {
		min-width: 20rem;
		text-align: center;
		display: block;
		margin: 0 auto;
		padding: 0.5rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	.startButton:disabled {
		background-color: #ccc;
	}
</style>
