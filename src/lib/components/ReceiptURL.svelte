<script lang="ts">
	import Textfield from '@smui/textfield';
    import HelperText from '@smui/textfield/helper-text';
	import Button from '@smui/button';

    let { sendURL } = $props();

	let url: string = $state('');
	let error: string | null = $state(null);

    const urlValid: boolean = $derived.by(() => {
        const toastUrlPattern = /^https:\/\/www\.toasttab\.com\/receipts\/[A-Za-z0-9\-_]+\/[A-Za-z0-9\-_]+$/;
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

<div class="max-w-xl mx-auto mt-8 p-4">
	<h2 class="text-xl font-bold mb-4">Paste your Toast receipt URL</h2>

    <Textfield
        bind:value={url}
        variant="outlined"
        label="Toast receipt URL"
        style="width: 100%;"
        invalid={!urlValid && url.length > 0}
        >
        {#snippet helper()}
            <HelperText>
                {#if !urlValid && url.length > 0}
                    Please enter a valid Toast receipt URL.
                {:else}
                    Enter the URL of your Toast receipt to parse it.
                {/if}
            </HelperText>
        {/snippet}
    </Textfield>

	<div class="mt-4 flex items-center gap-4">
		<Button
            onclick={startSplit}
            disabled={!urlValid}>
            Split Receipt
        </Button>
	</div>

	{#if error}
		<p class="text-red-600 mt-2">{error}</p>
	{/if}
</div>
