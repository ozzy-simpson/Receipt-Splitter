<script lang="ts">
    import type { PageProps } from './$types';
    import { goto } from '$app/navigation';
    import ReceiptUrl from '$lib/components/ReceiptURL.svelte';
    import PersonSetup from '$lib/components/PersonSetup.svelte';
    import AssignItems from '$lib/components/AssignItems.svelte';
    import type { ReceiptItem } from '$lib/utils/Receipts';

    let { data }: PageProps = $props();
    let loading = $derived.by(() => {
        return data.loading ?? false;
    });

    let guestCount = $derived.by(() => {
        return Math.max(data.receipt?.guestCount || 2, 2);
    });
    let guestsProvided = $state(false);
    let peopleSet = $state(new Set<string>()); // Set of names of people splitting the bill
    let peopleColors = $derived.by(() => {
        // Generate a pastel color for each person, seeded by their name for randomness
        function pastelColor(str: string) {
            // Simple hash from string
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            // Use hash to generate HSL values
            const hue = Math.abs(hash) % 360;
            const sat = 85 + (Math.abs(hash * 13) % 10); // 75-85%
            const light = 60 + (Math.abs(hash * 7) % 10); // 75-85%
            return `hsl(${hue}, ${sat}%, ${light}%)`;
        }
        return Array.from(peopleSet).map((name) => pastelColor(name));
    });

    // Function to handle receipt URL submission
    const urlProvided = (url: string) => {
        loading = true;
        guestsProvided = false;
        peopleSet.clear();
        // Set URL parameter `receipt` to contain the receipt URL
        goto(`?receipt=${encodeURIComponent(url)}`);
    };

    // Function to save the names of guests
    const saveGuests = (guests: string[]) => {
        guestsProvided = true;
        peopleSet.clear();
        guests.forEach((guest) => {
            if (guest.trim()) {
                peopleSet.add(guest.trim());
            }
        });

        // Sort the peopleSet to maintain consistent order
        peopleSet = new Set(Array.from(peopleSet).sort((a, b) => a.localeCompare(b)));
    };

    // Function to show results after assigning items
    const showResults = (receiptItems: ReceiptItem[]) => {
        const newReceipt = { ...data.receipt, items: receiptItems };
        const encodedReceipt = btoa(JSON.stringify(newReceipt));

        goto(`/results?receipt=${encodedReceipt}`);
    };
</script>

{#if loading}
    <div role="status" class="flex h-screen items-center justify-center">
        <svg
            aria-hidden="true"
            class="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
            />
            <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
            />
        </svg>
        <span class="sr-only">Loading...</span>
    </div>
{:else if !data.receipt}
    <ReceiptUrl sendURL={urlProvided} />
{:else if data.receipt && !guestsProvided}
    <PersonSetup receiptData={data.receipt} {guestCount} provideGuests={saveGuests} />
{:else if data.receipt && guestsProvided}
    <AssignItems
        receiptData={data.receipt}
        {peopleSet}
        {peopleColors}
        itemsAssigned={showResults}
    />
{:else if data.receipt && guestsProvided && peopleSet.size < guestCount - 1}
    <div class="mx-auto mt-8 max-w-xl p-4">
        <h2 class="mb-4 text-3xl font-bold">Almost there!</h2>
        <p class="mb-4 text-gray-600">
            Please make sure all guests have been added before proceeding.
        </p>
    </div>
    <!-- {:else if data.receipt && guestConfirmed && myName !== '' && peopleSet.size == (guestCount - 1) && data.results} -->
    <!-- TODO: show results, with QR code to results page -->
{/if}

<style lang="postcss">
    @reference "tailwindcss";
</style>
