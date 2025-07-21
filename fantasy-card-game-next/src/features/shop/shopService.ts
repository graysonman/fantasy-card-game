import { Card } from '@/models/Card';

export const getDailyCards = async (): Promise<Card[]> => {
  try {
    const response = await fetch('/api/get-daily-cards');

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const purchaseCard = async (cardId: number): Promise<{ new_credits: number }> => {
  const response = await fetch('/api/purchase-card', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ card_id: cardId }),
  });
  if (!response.ok) {
    throw new Error('Failed to purchase card');
  }
  return response.json();
};

export const openCardPack = async (packId: number): Promise<Card> => {
  console.log('Opening card pack from /api/open-card-pack');
  try {
    const response = await fetch('/api/open-card-pack', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pack_id: packId }),
    });
    console.log('Received response from API:', response);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Failed to open card pack. Status:', response.status, 'Body:', errorBody);
      throw new Error(`API request failed: ${errorBody}`);
    }

    const data = await response.json();
    console.log('Successfully opened and parsed card pack:', data);

    // The RPC function returns an array with a single card object.
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else {
      throw new Error('API did not return the expected card data.');
    }
  } catch (error) {
    console.error('Error in openCardPack service:', error);
    throw error; // Re-throw the error to be caught by the component
  }
};
