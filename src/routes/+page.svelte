<script>
	import Header from '$lib/Header.svelte';
	import socket from '$lib/socket.js';
	let nameInput = '';
	let name = localStorage.getItem('name');
	let joining = false;
	let loading = false;
	let pin = '';

	socket.on('joinError', (err) => {
		alert(err);
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
		<div class="nameInput">
			<form
				on:submit|preventDefault={() => {
					name = nameInput;
					nameInput = '';
					socket.emit('name', name);
					localStorage.setItem('name', name);
				}}
			>
				<input type="text" placeholder="Name" maxlength="20" bind:value={nameInput} />
				<button>Continue</button>
			</form>
		</div>
	{:else if !joining}
		<div class="choose">
			<button
				disabled={loading}
				on:click={() => {
					socket.emit('host', name);
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
					socket.emit('join', pin);
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
		margin-right: 1rem;
	}

	.nameInput input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		font-size: 1rem;
	}
	.nameInput button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		cursor: pointer;
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
