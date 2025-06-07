<script lang="ts">
    import type { PageProps } from './$types';
    import { goto } from '$app/navigation';
    import type { Receipt, ReceiptItem } from '$lib/utils/Receipts';
    import { page } from '$app/state';
    import copy from 'copy-to-clipboard';

    let { data }: PageProps = $props();
    let receipt: Receipt = $derived.by(() => {
        return data.receipt;
    });

    $effect(() => {
        // If receipt is not loaded, redirect to home
        if (!receipt) {
            goto('/');
        }
    });

    // Get short URL to this receipt
    let shortUrl: string = $derived.by(() => {
        return data.shortUrl || page.url.toString();
    });

    let peopleSet = $derived.by(() => {
        // Create a Set of unique names from receipt items
        const set = new Set<string>();
        receipt.items.forEach((item) => {
            item.people?.forEach((person) => {
                set.add(person);
            });
        });
        // Sort the Set to maintain consistent order
        return new Set(Array.from(set).sort((a, b) => a.localeCompare(b)));
    });

    let totalAmount = $derived.by(() => {
        // Calculate total amount from receipt items
        return (
            receipt.items.reduce((sum, item) => {
                return sum + (item.price || 0);
            }, 0) +
            (receipt.tax || 0) +
            (receipt.tip || 0) +
            (receipt.fees || 0)
        );
    });

    let splitAmounts = $derived.by(() => {
        const subtotal = receipt.items.reduce((sum, item) => {
            return sum + (item.price || 0);
        }, 0);

        // Calculate total amount for each person
        const subtotals: Record<string, number> = {};
        receipt.items.forEach((item) => {
            item.people?.forEach((person) => {
                if (!subtotals[person]) subtotals[person] = 0;
                subtotals[person] += item.price / (item.people?.length || 1);
            });
        });

        const tax = receipt.tax || 0;
        const tip = receipt.tip || 0;
        const fees = receipt.fees || 0;

        // For each person, calculate their total including tax, tip, and fees
        const totals: Record<string, number> = {};
        Object.keys(subtotals).forEach((person) => {
            const share = subtotals[person] / subtotal;
            totals[person] = subtotals[person] + (tax + tip + fees) * share;
        });

        return totals;
    });

    let peopleColors = $derived.by(() => {
        // TODO: improve color generation
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

    function isAssigned(item: ReceiptItem, person: string) {
        return item.people && item.people.includes(person);
    }
</script>

<div class="flex justify-center">
    <div class="mx-6 my-10 max-w-xl rounded-xl border border-gray-300 bg-gray-100 p-6 shadow-lg">
        <h2 class="mb-4 text-center text-3xl font-bold">Receipt from {receipt.merchant}</h2>
        <h3 class="mb-2 text-center text-xl font-semibold text-gray-900">Split Summary</h3>
        <div class="mb-6 flex flex-wrap justify-center gap-4">
            {#each Array.from(peopleSet) as person, idx}
                <div
                    class="flex w-full items-center gap-3 rounded-lg bg-white px-4 py-2 shadow sm:w-auto"
                >
                    <span
                        class="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                        style="background-color: {peopleColors[idx]};"
                        title={person}
                    >
                        {person.charAt(0).toUpperCase()}
                    </span>
                    <span class="font-medium">{person}</span>
                    <span class="ml-2 block flex-1 text-right font-mono text-gray-700">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(splitAmounts[person] || 0)}
                    </span>
                </div>
            {/each}
        </div>

        <p class="mb-4 text-center text-gray-600">
            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                totalAmount
            )}
            {#if receipt.tax || receipt.tip || receipt.fees}
                <span class="text-sm text-gray-500">
                    (Tax: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(receipt.tax || 0)}, Tip: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(receipt.tip || 0)}, Fees: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(receipt.fees || 0)})
                </span>
            {/if}
        </p>
        <div class="mb-6 text-center">
            <!-- QR code to this page -->
            <div class="mb-4 flex justify-center">
                <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shortUrl)}`}
                    alt="QR code for this receipt"
                    width="160"
                    height="160"
                />
            </div>
            <button
                class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                onclick={() => {
                    // Copy the receipt URL to clipboard
                    copy(shortUrl);
                    alert('Receipt split link copied to clipboard!');
                }}
                type="button"
            >
                Copy receipt split link
            </button>
        </div>
        <hr class="my-6 border-gray-300" />
        <h3 class="mb-2 text-center text-xl font-semibold text-gray-900">Items</h3>
        <div class="space-y-4">
            <div class="overflow-x-scroll rounded-lg bg-white shadow">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-neutral-200">
                            <th class="px-4 py-2 text-center">Qty</th>
                            <th class="px-4 py-2">Item</th>
                            <th class="px-4 py-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each receipt.items as item, idx}
                            <tr>
                                <td class="px-4 py-2 text-center">{item.quantity || 1}</td>
                                <td class="px-4 py-2">{item.name}</td>
                                <td class="px-4 py-2 text-right">
                                    {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'USD'
                                    }).format(item.price)}
                                </td>
                            </tr>
                            <tr class="border-b border-b-slate-300 last:border-b-0">
                                <td colspan="3" class="px-4 py-2 pb-5">
                                    <div class="flex flex-wrap justify-center gap-2">
                                        {#each peopleSet as person, personIdx}
                                            <span
                                                class="rounded-full border px-3 py-1 text-sm font-medium transition
                                                    {isAssigned(item, person)
                                                    ? 'text-white'
                                                    : 'border-gray-300 bg-gray-100 text-gray-700'}"
                                                style="border-color: {isAssigned(item, person)
                                                    ? peopleColors[personIdx] || '#ccc'
                                                    : '#ccc'};
                                                    background-color: {isAssigned(item, person)
                                                    ? peopleColors[personIdx]
                                                    : ''};"
                                            >
                                                {person}
                                            </span>
                                        {/each}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {#if receipt.url}
                <div class="mt-6 text-center">
                    <a
                        href={receipt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-700 underline transition hover:text-blue-900"
                    >
                        View original receipt
                    </a>
                </div>
            {/if}
            <div class="mt-8 flex justify-center">
                <button
                    class="cursor-pointer rounded bg-slate-600 px-4 py-2 text-white transition hover:bg-slate-700"
                    type="button"
                    onclick={() => goto('/')}
                >
                    Start New Receipt
                </button>
            </div>
        </div>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";
</style>
