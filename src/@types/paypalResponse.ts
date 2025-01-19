

export interface PayoutResponse {
    batch_header: {
        payout_batch_id: string;
        batch_status: string;
        amount: {
            currency: string;
            value: string;
        };
    };
    items: Array<{
        payout_item_id: string;
        transaction_status: string;
        payout_item: {
            receiver: string;
            amount: {
                currency: string;
                value: string;
            };
            note: string;
        };
        time_processed: string;
    }>;
}
