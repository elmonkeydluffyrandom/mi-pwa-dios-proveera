'use server';

/**
 * @fileOverview An AI agent that suggests new products for the store owner to stock.
 *
 * - suggestNewProducts - A function that suggests new products based on current inventory and sales data.
 * - SuggestNewProductsInput - The input type for the suggestNewProducts function.
 * - SuggestNewProductsOutput - The return type for the suggestNewProducts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewProductsInputSchema = z.object({
  currentInventory: z.string().describe('A list of the store\'s current inventory, including names, prices, and categories.'),
  salesData: z.string().describe('A summary of recent sales data, including products sold and quantities.'),
});
export type SuggestNewProductsInput = z.infer<typeof SuggestNewProductsInputSchema>;

const SuggestNewProductsOutputSchema = z.object({
  suggestedProducts: z.string().describe('A list of suggested new products to stock, based on the current inventory and sales data.'),
});
export type SuggestNewProductsOutput = z.infer<typeof SuggestNewProductsOutputSchema>;

export async function suggestNewProducts(input: SuggestNewProductsInput): Promise<SuggestNewProductsOutput> {
  return suggestNewProductsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewProductsPrompt',
  input: {schema: SuggestNewProductsInputSchema},
  output: {schema: SuggestNewProductsOutputSchema},
  prompt: `You are a helpful assistant to a store owner, suggesting new products they might want to stock in their store to increase sales and customer satisfaction.

  Consider the store\'s current inventory and recent sales data when making your suggestions. If the provided sales data is empty, suggest popular products based on the provided inventory.

  Current Inventory: {{{currentInventory}}}
  Sales Data: {{{salesData}}}

  Based on this information, what new products should the store owner consider stocking? Explain why these products would be a good addition to the store\'s inventory.
  Return the suggested products in the following format:
  Product: [product name]
  Reason: [why this product is suggested]
`,
});

const suggestNewProductsFlow = ai.defineFlow(
  {
    name: 'suggestNewProductsFlow',
    inputSchema: SuggestNewProductsInputSchema,
    outputSchema: SuggestNewProductsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
