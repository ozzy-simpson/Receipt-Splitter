<script lang="ts">
	import type { ReceiptItem } from '$lib/utils/Receipts';

	// Props: receiptData (with items), peopleSet (Set<string>), peopleColors (Map<string, string>), itemsAssigned (store or callback)
	let { receiptData, peopleSet, peopleColors, itemsAssigned } = $props();

	// Convert Set to Array for iteration
	let people: string[] = $derived.by(() => Array.from(peopleSet));

	let receiptItems: ReceiptItem[] = $state(receiptData.items || []);

	$inspect(receiptItems, 'receiptData');

	// Assign/unassign a person to an item
	function togglePerson(itemIdx: number, person: string) {
		const item = receiptItems[itemIdx];
		if (!item.people) item.people = [];
		const idx = item.people.indexOf(person);
		if (idx === -1) {
			item.people.push(person);
		} else {
			item.people.splice(idx, 1);
		}
	}

	function isAssigned(item: ReceiptItem, person: string) {
		return item.people && item.people.includes(person);
	}
</script>

<div class="mx-auto mt-8 max-w-xl p-4">
	<h2 class="mb-4 text-3xl font-bold">Who got what?</h2>
	<p class="mb-4 text-gray-600">
		Assign items from the receipt to the people splitting the bill. Click on a name to
		assign/unassign them to an item.
	</p>
	<div class="space-y-4">
		<div class="overflow-x-scroll rounded-lg bg-white shadow">
			<table class="w-full text-left">
				<thead>
					<tr class="bg-gray-100">
						<th class="px-4 py-2 text-center">Qty</th>
						<th class="px-4 py-2">Item</th>
						<th class="px-4 py-2 text-right">Price</th>
					</tr>
				</thead>
				<tbody>
					{#each receiptItems as item, idx}
						<tr>
							<td class="px-4 py-2 text-center">{item.quantity || 1}</td>
							<td class="px-4 py-2">{item.name}</td>
							<td class="px-4 py-2 text-right">
								{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
									item.price
								)}
							</td>
						</tr>
						<tr class="border-b border-b-slate-300 last:border-b-0">
							<td colspan="3" class="px-4 py-2 pb-5">
								<div class="flex flex-wrap justify-center gap-2">
									{#each people as person, personIdx}
										<button
											type="button"
											class="rounded-full border px-3 py-1 text-sm font-medium transition
                                                {isAssigned(item, person)
												? 'text-white'
												: 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-slate-200'}"
											style="border-color: {peopleColors[personIdx] || '#ccc'}; 
                                                background-color: {isAssigned(item, person)
												? peopleColors[personIdx]
												: ''};"
											onclick={() => togglePerson(idx, person)}
										>
											{person}
										</button>
									{/each}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="mt-8 flex gap-4">
			<button
				class="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition disabled:cursor-not-allowed disabled:opacity-50"
				onclick={() => itemsAssigned(receiptItems)}
				disabled={receiptItems.some((item) => !item.people || item.people.length === 0)}
			>
				Show results →
			</button>
			<button
				class="cursor-pointer rounded border border-gray-300 bg-gray-100 px-4 py-2 text-gray-800 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={() => {
					receiptItems = receiptItems.map((item) => ({ ...item, people: [] }));
				}}
				type="button"
				disabled={receiptItems.every((item) => !item.people || item.people.length === 0)}
			>
				Clear
			</button>
		</div>
	</div>
</div>
