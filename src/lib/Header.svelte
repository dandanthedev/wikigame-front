<script>
	import socket from '$lib/socket.js';
	import { name } from './stores.js';
	import { goto } from '$app/navigation';
	export let inGame = false;
	export let i = 0;
	export let loading = true;
	export let searchedThisPage = false;
	export let searchTerm;
	export let searchPage = null;
	export let destinationArticle = '';
	export let route = '';
	export let gameId;
	export let lobby = false;
	let starting;
	socket.on('gameEnded', () => {
		inGame = false;
	});
	socket.on('start', (url) => {
		starting = 3;
		const int = setInterval(() => {
			starting--;
			if (starting === 0) {
				clearInterval(int);
				goto(url);
			}
		}, 1000);
	});

</script>

{#if starting}
	<div class="starting">
		<p class="startingSeconds">{starting}</p>
		<p class="startingText">get ready!</p>
	</div>
{/if}

<div class="gameHeader">
	<h1 class="gameTitle">WikiGame</h1>

	{#if inGame}
		<div class="search">
			<input
				type="text"
				placeholder="Search..."
				class="searchInput"
				bind:value={searchTerm}
				on:keyup={(e) => {
					if (e.key === 'Enter') searchPage();
				}}
				disabled={loading || searchedThisPage}
			/>
			<p class="note">
				note: searching will cost you a click & you can only search once per page!<br />
				Results will be <span style="background-color: #ffff00">highlighted</span> in the page.
			</p>
		</div>
	{/if}
	<div class="right">
		{#if $name}
			<button
				class="name"
				on:click={() => {
					//ask for new name
					const newName = prompt('Please enter a new name', $name);
					if (newName) {
						socket.emit('name', newName);
						localStorage.setItem('name', newName);
					}
				}}
			>
				{$name}
			</button>
		{/if}
		{#if inGame}
			<p class="clicks">Clicks: {i}</p>
			<p class="destination">Destination: {destinationArticle.replaceAll('_', ' ')}</p>
			<button
				class="giveUp"
				on:click={() => {
					socket.emit('giveUp', gameId);
					goto('/' + gameId + '/scores');
				}}>Give up</button
			>
		{/if}

		{#if lobby}
			<button
				class="giveUp"
				on:click={() => {
					socket.emit('leave', gameId);
					goto('/');
				}}>Leave</button
			>
		{/if}
	</div>
</div>
<p class="route">{route}</p>

<slot />

<style>
	.gameHeader {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-family: sans-serif;
		border-bottom: 5px solid #ccc;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.gameTitle {
		font-size: 2rem;
		font-weight: bold;
		border-bottom: 0;
	}

	.clicks {
		font-size: 1rem;
	}

	.search {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-left: 1rem;
	}

	.searchInput {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		text-align: center;
	}
	.note {
		font-size: 0.8rem;
		color: #999;
	}

	.name {
		font-size: 1.5rem;
		font-weight: bold;
		cursor: pointer;
		border: none;
		background-color: transparent;
	}

	.right {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}

	.route {
		position: fixed;
		bottom: 0;
		left: 10px;
		font-size: 0.8rem;
		color: #999;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background-color: #fff;
	}

	.starting {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-family: sans-serif;
		color: white;
	}

	.startingSeconds {
		font-size: 5rem;
		margin-bottom: 0;
	}

	.startingText {
		font-size: 1.5rem;
		margin-top: 0;
	}

	.giveUp {
		background-color: #ff0000;
		color: white;
		padding: 0.5rem;
		border-radius: 0.5rem;
		border: none;
		cursor: pointer;
	}
</style>
