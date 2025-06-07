<script lang="ts">
	let { receiptData, guestCount, provideGuests } = $props();

	let count = $state(guestCount || 2); // Default to 2 if not provided
	// svelte-ignore state_referenced_locally
	let guestNames = $state(new Array(count).fill('')); // Initialize with empty names
</script>

<div class="mx-auto mt-8 max-w-xl p-4">
	<h2 class="mb-4 text-3xl font-bold">Who's splitting the bill?</h2>
	<p class="mb-4 text-gray-600">Enter the names of the people splitting this receipt.</p>
	<div class="space-y-4">
		{#each Array(count) as _, index}
			<div class="flex items-center gap-2">
				<input
					type="text"
					class="flex-1 rounded border px-3 py-2 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="Enter name"
					value={guestNames[index] || ''}
					oninput={(e) => {
						guestNames[index] = (e.target as HTMLInputElement).value;
					}}
				/>
				{#if count > 2}
					<button
						type="button"
						class="rounded bg-red-200 px-2 py-2 transition hover:bg-red-300"
						title="Remove guest"
						onclick={() => {
							guestNames.splice(index, 1);
							count--;
						}}
					>
						&times;
					</button>
				{/if}
			</div>
		{/each}
		<button
			type="button"
			class="mt-2 rounded bg-gray-200 px-3 py-1 transition hover:bg-gray-300"
			onclick={() => {
				guestNames.push('');
				count++;
			}}
		>
			+ Add Guest
		</button>
		<div class="mt-4">
			<button
				class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
				onclick={() => {
					provideGuests(Array.from(guestNames).filter((name) => name.trim() !== ''));
				}}
				disabled={!Array.from(guestNames).every((name) => name.trim() !== '') || count < 2}
			>
				Split items →
			</button>
		</div>
	</div>
</div>
