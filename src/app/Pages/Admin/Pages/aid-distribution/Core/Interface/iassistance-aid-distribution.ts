export interface AidDistribution {
    id: string;
    beneficiaryId: string;
    inKindDonationId: string | null;
    monetaryDonationId: string | null;
    volunteerId: string;
    description: string;
    quantity: number;
    amount: number;
    status: number;
}

export interface DistributionDisplay {
    id: string;
    beneficiaryId: string;
    inKindDonationId: string | null;
    monetaryDonationId: string | null;
    volunteerId: string;
    amount: number;
    status: number;
    donationName: string;
    beneficiaryName: string;
    volunteerName: string;
    quantity: number;
    description: string;
}
