<script>
	import Header from '$lib/Header.svelte';
	import socket from '$lib/socket.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let gameId = $page.params.pin;
	let scores = [];
	let notTopScores = [];
	let host = false;
	let users = [];
	let nonFinishedUsers = [];

	socket.emit('exists', gameId);
	socket.emit('isHost', gameId);
	socket.emit('scores', gameId);
	socket.emit('getUsers', gameId);

	socket.on('exists', (val) => {
		if (!val) goto('/');
	});

	socket.on('isHost', (isHost) => {
		host = isHost;
	});

	socket.on('scores', (newScores) => {
		scores = newScores;
		scores.sort((a, b) => b.clicks - a.clicks);

		//invert the order, so the least clicks are at the top
		scores.reverse();

		//remove first 3 elements from array
		notTopScores = scores.slice(3);

		socket.emit('getUsers', gameId);
	});

	socket.on('users', (newUsers) => {
		users = newUsers;

		nonFinishedUsers = users.filter((user) => !scores.find((score) => score.name === user));
	});
</script>

<Header />

<h1 class="scoresHeader">Scores</h1>
<div class="topScores">
	{#if scores.length > 1}
		<div class="top top2">
			<h2 class="placement">2nd</h2>
			<h3 class="name">{scores[1].name}</h3>
			<p class="clicks">Clicks: {scores[1].clicks}</p>
			<p class="route">{scores[1].route}</p>
		</div>
	{/if}
	<div class="top top1">
		<h2 class="placement">1st</h2>
		<h3 class="name">{scores[0]?.name}</h3>
		<p class="clicks">Clicks: {scores[0]?.clicks}</p>
		<p class="route">{scores[0]?.route}</p>
	</div>
	{#if scores.length > 2}
		<div class="top top3">
			<h2 class="placement">3rd</h2>
			<h3 class="name">{scores[2].name}</h3>
			<p class="clicks">Clicks: {scores[2].clicks}</p>
			<p class="route">{scores[2].route}</p>
		</div>
	{/if}
</div>

{#each notTopScores as score, i}
	<div class="score">
		<div class="center">
			<p class="notTopName">#{i + 1} {score.name}</p>
			<p class="clicks">Clicks: {score.clicks}</p>
		</div>
		<p class="route">{score.route}</p>
	</div>
{/each}

<p class="notFinished">
	{nonFinishedUsers.length} user{#if nonFinishedUsers.length > 1 || nonFinishedUsers.length === 0}s{/if}
	{#if nonFinishedUsers.length === 1}
		is
	{:else}
		are
	{/if}
	still playing
</p>
<p class="notFinishedUsers">{nonFinishedUsers.join(', ')}</p>

<a
	href="/"
	class="leaveButton"
	on:click|preventDefault={() => {
		socket.emit('newLobby', gameId);
	}}>New game</a
>

<style>
	.scoresHeader {
		font-size: 1.5rem;
		text-align: center;
		font-family: sans-serif;
	}

	.score {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;

		font-family: sans-serif;

		flex-direction: column;
		align-items: center;
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;

		gap: 1rem;
		margin-bottom: 0;
	}

	.name {
		font-size: 1.3rem;
		text-align: center;
	}

	.clicks {
		font-size: 1rem;
	}

	.leaveButton {
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
		text-decoration: none;
		font-family: sans-serif;
		max-width: 20rem;
	}

	.route {
		font-size: 0.8rem;
		color: #999;
		display: block !important;
		margin-top: 0;
		font-family: sans-serif;
		text-align: center;
	}

	.topScores {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
	}

	.top {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		max-width: 20rem;

		padding-bottom: 2rem;
	}

	.top2 {
		background-color: #f5f5f5;
	}

	.top3 {
		background-color: #e3f2fd;
	}

	.top1 {
		background-color: #e9e3f4;
	}
	.placement {
		color: black;
		font-size: 3rem;
		font-family: sans-serif;
		margin-bottom: 0.5rem;
	}
	.name {
		color: black;
		font-size: 1.5rem;
		font-family: sans-serif;
		margin-bottom: 0.5rem;
	}

	.clicks {
		color: black;
		font-size: 1rem;
		font-family: sans-serif;
	}

	.notTopName {
		color: black;
		font-size: 1.3rem;
		font-family: sans-serif;
	}

	.notFinished {
		color: black;
		font-size: 1rem;
		font-family: sans-serif;
		text-align: center;
	}
	.notFinishedUsers {
		color: grey;
		font-size: 0.8rem;
		font-family: sans-serif;
		text-align: center;
	}
</style>
