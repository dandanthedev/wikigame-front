<script>
	import socket from '../../lib/socket';
	import { goto } from '$app/navigation';

	socket.on('id', () => {
		goto('/');
	});
</script>

<div class="disconnected">
	<h1>You joined the game in another tab</h1>
	<button
		on:click={() => {
			location.reload();
		}}>Reload</button
	>
</div>

<style>
	.disconnected {
		text-align: center;
		font-family: sans-serif;
		margin-top: 30px;
	}

	button {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		margin-right: 1rem;
		cursor: pointer;
	}
</style>
