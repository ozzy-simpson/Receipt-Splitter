<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import ReceiptUrl from '$lib/components/ReceiptURL.svelte';

	import CircularProgress from '@smui/circular-progress';

	let { data }: PageProps = $props();
	let loading = $derived.by(() => {
        return data.loading ?? false;
    });

    let guestCount = $derived.by(() => {
        return data.receipt?.guestCount || 2; // Default to 2 if not provided (me + one other person)
    });
    let guestConfirmed = $state(false);
    let myName = $state(''); // TODO: store name in cookies or local storage
    let peopleSet = $state(new Set<string>()); // Set of names of people splitting the bill

	const urlProvided = (url: string) => {
		loading = true;
        // Set URL parameter `receipt` to contain the receipt URL
        goto(`?receipt=${encodeURIComponent(url)}`);
    };
</script>


{#if loading}
    <CircularProgress style="height: 24px; width: 24px;" indeterminate />
{:else if !data.receipt}
    <ReceiptUrl sendURL={urlProvided} />
{:else if data.receipt && !guestConfirmed}
    <!-- TODO: confirm number of guests -->
{:else if data.receipt && guestConfirmed && myName === ''}
    <!-- TODO: get name of splitter -->
{:else if data.receipt && guestConfirmed && myName !== '' && peopleSet.size < (guestCount - 1)}
    <!-- TODO: get guest names -->
{:else if data.receipt && guestConfirmed && myName !== '' && peopleSet.size == (guestCount - 1)}
    <!-- TODO: assign items to guests -->
<!-- {:else if data.receipt && guestConfirmed && myName !== '' && peopleSet.size == (guestCount - 1) && data.results} -->
    <!-- TODO: show results, with QR code to results page -->
{/if}