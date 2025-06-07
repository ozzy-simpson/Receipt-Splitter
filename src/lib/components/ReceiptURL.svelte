<script lang="ts">
    let { sendURL } = $props();

    let url: string = $state('');
    let error: string | null = $state(null);

    const urlValid: boolean = $derived.by(() => {
        const toastUrlPattern =
            /^https:\/\/www\.toasttab\.com\/receipts\/[A-Za-z0-9\-_]+\/[A-Za-z0-9\-_]+$/;
        return toastUrlPattern.test(url || '');
    });

    const startSplit = async () => {
        if (!urlValid) {
            error = 'Please enter a valid Toast receipt URL.';
            return;
        }
        error = null;
        try {
            sendURL(url);
        } catch (e) {
            error = 'Failed to parse receipt. Please check the URL.';
            console.error(e);
        }
    };
</script>

<div class="mx-auto mt-8 max-w-xl p-4">
    <h2 class="mb-4 text-3xl font-bold">What's your receipt?</h2>
    <p class="mb-4 text-gray-600">
        Enter the URL of your Toast receipt to split it among your friends. Make sure the URL is
        correct and points to a valid receipt.
    </p>

    <label class="mb-2 block font-medium text-gray-700" for="toast-url"> Toast receipt URL </label>
    <input
        id="toast-url"
        type="text"
        class="w-full rounded border px-3 py-2 transition focus:ring-2 focus:ring-blue-500 focus:outline-none
            {!urlValid && url.length > 0 ? 'border-red-500' : 'border-gray-300'}"
        bind:value={url}
        placeholder="https://www.toasttab.com/receipts/..."
        aria-invalid={!urlValid && url.length > 0}
    />
    <p class="mt-1 text-sm {!urlValid && url.length > 0 ? 'text-red-600' : 'text-gray-500'}">
        {#if !urlValid && url.length > 0}
            Please enter a valid Toast receipt URL.
        {:else}
            Enter the URL of your Toast receipt to parse it.
        {/if}
    </p>

    <div class="mt-4 flex items-center gap-4">
        <button
            class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            onclick={startSplit}
            disabled={!urlValid}
        >
            Add guests →
        </button>
    </div>

    {#if error}
        <p class="mt-2 text-red-600">{error}</p>
    {/if}
</div>

<style lang="postcss">
    @reference "tailwindcss";
</style>
