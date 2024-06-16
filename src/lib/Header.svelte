<script>
	import socket from '$lib/socket.js';
	import { name } from './stores.js';
	export let inGame = false;
	export let i = 0;
	export let loading = true;
	export let searchedThisPage = false;
	export let searchTerm;
	export let searchPage = null;
	socket.on('gameEnded', () => {
		inGame = false;
	});
</script>

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
			<p class="note">note: searching will cost you a click & you can only search once per page!</p>
		</div>
		<p class="clicks">Clicks: {i}</p>
	{/if}
	{#if $name}
		<p class="name">{$name}</p>
	{/if}
</div>

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
	}
</style>
