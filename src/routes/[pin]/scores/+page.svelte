<script>
	import Header from '$lib/Header.svelte';
	import socket from '$lib/socket.js';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let gameId = $page.params.pin;
	let scores = [];
	let host = false;

	socket.emit('exists', gameId);
	socket.emit('isHost', gameId);
	socket.emit('scores', gameId);

	socket.on('exists', (val) => {
		if (!val) goto('/');
	});

	socket.on('isHost', (isHost) => {
		host = isHost;
	});

	socket.on('scores', (newScores) => {
		scores = newScores;
	});
</script>

<Header />

<h1 class="scoresHeader">Scores</h1>

{#each scores as score}
	<div class="score">
		<div class="center">
			<p class="name">{score.name}</p>
			<p class="clicks">Clicks: {score.clicks}</p>
		</div>
		<p class="route">{score.route}</p>
	</div>
{/each}

<a
	href="/"
	class="leaveButton"
	on:click|preventDefault={() => {
		socket.emit('leave', gameId);
		location = '/';
	}}>Leave</a
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
	}
</style>
