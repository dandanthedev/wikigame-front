<script>
	import Header from '$lib/Header.svelte';
	import socket from '$lib/socket.js';
	import { page } from '$app/stores';
	let nameInput = '';
	let name = localStorage.getItem('name');
	let joining = false;
	let loading = false;
	let pin = $page.url.searchParams.get('pin') ?? '';

	$: name && pin && socket.emit('join', pin);

	socket.on('joinError', (err) => {
		loading = false;
	});
</script>

<Header />
<h1 class="gameTitle" onclick="location='/'">WikiGame</h1>
<p class="gameDescription">
	In WikiGame, you navigate from a source and to a destination by clicking on WikiLinks.
</p>
<div class="gameControls">
	{#if !name}
		<form
			on:submit|preventDefault={() => {
				name = nameInput;
				nameInput = '';
				socket.emit('signOn', {
					name,
					id: localStorage.getItem('id')
				});
				localStorage.setItem('name', name);
			}}
		>
			<div class="nameInput">
				<input type="text" placeholder="Enter your name" maxlength="20" bind:value={nameInput} />
				<button>Start playing!</button>
			</div>
		</form>
	{:else if !joining}
		<div class="choose">
			<button
				disabled={loading}
				on:click={() => {
					socket.emit('host');
					loading = true;
				}}>Host</button
			>
			<button
				disabled={loading}
				on:click={() => {
					joining = true;
				}}>Join</button
			>
		</div>
	{:else}
		<div class="joining">
			<form
				on:submit|preventDefault={() => {
					loading = true;
					socket.emit('discoverGame', pin);
				}}
			>
				<input type="text" placeholder="Pin" maxlength="6" bind:value={pin} disabled={loading} />
				<button disabled={loading}>Continue</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.gameTitle {
		font-size: 3.5rem;
		font-weight: bold;
		font-family: sans-serif;
		text-align: center;
		height: 100%;
	}

	.gameDescription {
		font-size: 1.5rem;
		text-align: center;
		margin-top: 1rem;
		font-family: sans-serif;
	}

	.gameControls {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 1rem;
		flex-direction: column;
		gap: 1rem;
	}

	.nameInput {
		display: flex;
		align-items: center;
		flex-direction: column;
		margin-right: 1rem;
	}

	.nameInput input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		font-size: 1.5rem;
		text-align: center;
	}
	.nameInput button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		cursor: pointer;
		width: 90%;
		margin-top: 0.5rem;
	}

	.error {
		border: 1px solid red !important;
	}

	.choose {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.choose button {
		font-size: 1.5rem;
		border: 1px solid #ccc;
		padding: 0.5rem;
		border-radius: 0.5rem;
		padding-left: 1rem;
		padding-right: 1rem;
		cursor: pointer;
	}

	.joining {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.joining input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		font-size: 1rem;
	}
	.joining button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		cursor: pointer;
	}
</style>
