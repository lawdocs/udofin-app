import { create } from 'zustand';

export interface DraftApplication {
  loanType: string;
  amount: number;
  tenure: number; // months
  employmentType: string;
  companyName: string;
  designation: string;
  experience: string;
  monthlySalary: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  state: string;
}

export interface LoanApplication {
  id: string;
  loanType: string;
  amount: number;
  tenure: number;
  status: 'submitted' | 'kyc' | 'review' | 'offers' | 'selected' | 'agreement' | 'disbursed' | 'completed';
  lender?: string;
  date: string;
  selectedOfferId?: string;
}

export interface LenderOffer {
  id: string;
  bankName: string;
  bankLogo: string; // Emoji or asset name
  amount: number;
  interestRate: number; // p.a.
  apr: number;
  emi: number;
  tenure: number;
  processingFee: number;
  coolingPeriodDays: number;
  latePaymentCharges: string;
  foreclosureCharges: string;
}

export interface EMI {
  id: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
}

export interface ActiveLoan {
  id: string;
  lenderName: string;
  outstandingAmount: number;
  totalAmount: number;
  interestRate: number;
  nextEmiDate: string;
  nextEmiAmount: number;
  paidTenure: number;
  totalTenure: number;
  repaymentSchedule: EMI[];
  statements: { id: string; name: string; date: string; size: string }[];
}

export interface SupportComplaint {
  id: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'applications' | 'offers' | 'loan' | 'payments' | 'support';
  date: string;
  read: boolean;
}

interface LoanStoreState {
  draftApplication: DraftApplication;
  applications: LoanApplication[];
  activeLoan: ActiveLoan | null;
  complaints: SupportComplaint[];
  notifications: NotificationItem[];
  offers: Record<string, LenderOffer[]>;
  
  setDraftApplication: (draft: Partial<DraftApplication>) => void;
  clearDraftApplication: () => void;
  addApplication: (app: Omit<LoanApplication, 'id' | 'status' | 'date'>) => string;
  updateApplicationStatus: (id: string, status: LoanApplication['status']) => void;
  selectOffer: (appId: string, offerId: string, lenderName: string) => void;
  disburseLoan: (appId: string) => void;
  addComplaint: (category: string, description: string) => string;
  markNotificationRead: (id: string) => void;
  payEmi: (emiId: string) => void;
}

const initialDraft: DraftApplication = {
  loanType: 'Personal',
  amount: 50000,
  tenure: 12,
  employmentType: 'Salaried',
  companyName: '',
  designation: '',
  experience: '',
  monthlySalary: '',
  addressLine1: '',
  addressLine2: '',
  pincode: '',
  city: '',
  state: '',
};

export const useLoanStore = create<LoanStoreState>((set, get) => ({
  draftApplication: initialDraft,
  
  // Clean initialization (No hardcoded dummy data)
  applications: [],
  activeLoan: null,
  complaints: [],
  notifications: [],
  offers: {},
  
  setDraftApplication: (draft) => set((state) => ({
    draftApplication: { ...state.draftApplication, ...draft }
  })),
  
  clearDraftApplication: () => set({ draftApplication: initialDraft }),
  
  addApplication: (app) => {
    const id = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: LoanApplication = {
      ...app,
      id,
      status: 'submitted',
      date: new Date().toISOString().split('T')[0]
    };
    
    set((state) => ({
      applications: [newApp, ...state.applications],
      notifications: [
        {
          id: `N-${Math.random()}`,
          title: 'Application Received',
          message: `Your application ${id} for ₹${app.amount.toLocaleString('en-IN')} has been submitted.`,
          category: 'applications',
          date: new Date().toISOString(),
          read: false,
        },
        ...state.notifications
      ]
    }));

    // BACKGROUND TIMELINE SIMULATOR (Basic In-Memory Backend Flow)
    
    // Step 2: KYC (after 4 seconds)
    setTimeout(() => {
      set((state) => {
        const appExists = state.applications.some(a => a.id === id);
        if (!appExists) return {}; // safeguard if deleted
        
        return {
          applications: state.applications.map(a => a.id === id ? { ...a, status: 'kyc' } : a),
          notifications: [
            {
              id: `N-${Math.random()}`,
              title: 'KYC Underway',
              message: `Aadhaar & Bureau soft pull has been initiated for application ${id}.`,
              category: 'applications',
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications
          ]
        };
      });
    }, 4000);

    // Step 3: Under Review (after 8 seconds)
    setTimeout(() => {
      set((state) => {
        const appExists = state.applications.some(a => a.id === id);
        if (!appExists) return {};
        
        return {
          applications: state.applications.map(a => a.id === id ? { ...a, status: 'review' } : a),
          notifications: [
            {
              id: `N-${Math.random()}`,
              title: 'Lender Matching',
              message: `Application ${id} is currently under evaluation by our multi-lender credit desk.`,
              category: 'applications',
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications
          ]
        };
      });
    }, 8000);

    // Step 4: Offers Received (after 12 seconds)
    setTimeout(() => {
      set((state) => {
        const appExists = state.applications.some(a => a.id === id);
        if (!appExists) return {};
        
        // Dynamically generate comparative offers matching parameters
        const reqAmount = app.amount;
        const reqTenure = app.tenure;
        const generatedOffers: LenderOffer[] = [
          {
            id: `OFF-SBI-${id}`,
            bankName: 'State Bank of India',
            bankLogo: '🔵',
            amount: reqAmount,
            interestRate: 10.99,
            apr: 11.9,
            emi: Math.round((reqAmount * 1.1) / reqTenure),
            tenure: reqTenure,
            processingFee: Math.round(reqAmount * 0.01),
            coolingPeriodDays: 5,
            latePaymentCharges: '1% per month on outstanding EMI',
            foreclosureCharges: 'Nil after 12 months'
          },
          {
            id: `OFF-HDFC-${id}`,
            bankName: 'HDFC Bank',
            bankLogo: '🏦',
            amount: reqAmount,
            interestRate: 11.25,
            apr: 12.4,
            emi: Math.round((reqAmount * 1.12) / reqTenure),
            tenure: reqTenure,
            processingFee: Math.round(reqAmount * 0.015),
            coolingPeriodDays: 3,
            latePaymentCharges: '2% per month on outstanding EMI',
            foreclosureCharges: '4% of principal outstanding'
          },
          {
            id: `OFF-ICICI-${id}`,
            bankName: 'ICICI Bank',
            bankLogo: '🦁',
            amount: reqAmount,
            interestRate: 11.5,
            apr: 12.8,
            emi: Math.round((reqAmount * 1.13) / reqTenure),
            tenure: reqTenure,
            processingFee: Math.round(reqAmount * 0.012),
            coolingPeriodDays: 3,
            latePaymentCharges: '2% per month on outstanding EMI',
            foreclosureCharges: '3.5% of principal outstanding'
          }
        ];

        return {
          applications: state.applications.map(a => a.id === id ? { ...a, status: 'offers' } : a),
          offers: {
            ...state.offers,
            [id]: generatedOffers
          },
          notifications: [
            {
              id: `N-${Math.random()}`,
              title: 'Lender Matches Found!',
              message: `Congratulations! SBI, HDFC and ICICI have generated custom loan offers for application ${id}.`,
              category: 'offers',
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications
          ]
        };
      });
    }, 12000);

    return id;
  },
  
  updateApplicationStatus: (id, status) => set((state) => ({
    applications: state.applications.map((app) => 
      app.id === id ? { ...app, status } : app
    )
  })),
  
  selectOffer: (appId, offerId, lenderName) => set((state) => ({
    applications: state.applications.map((app) => 
      app.id === appId ? { ...app, status: 'selected', selectedOfferId: offerId, lender: lenderName } : app
    ),
    notifications: [
      {
        id: `N-${Math.random()}`,
        title: 'Lender Confirmed',
        message: `You selected ${lenderName} for application ${appId}. Proceed to sign Key Fact Statement (KFS).`,
        category: 'applications',
        date: new Date().toISOString(),
        read: false,
      },
      ...state.notifications
    ]
  })),
  
  disburseLoan: (appId) => set((state) => {
    const targetApp = state.applications.find(app => app.id === appId);
    if (!targetApp) return {};
    
    // Find the offer details inside dynamic offers record
    const offersList = state.offers[appId] || [];
    const selectedOffer = offersList.find(o => o.id === targetApp.selectedOfferId);
    
    const lender = targetApp.lender || 'Partner Lender';
    const amount = targetApp.amount;
    const tenure = targetApp.tenure;
    const emiAmount = selectedOffer ? selectedOffer.emi : Math.round((amount * 1.1) / tenure);
    const interest = selectedOffer ? selectedOffer.interestRate : 11.5;

    // update application status
    const updatedApps = state.applications.map(app => 
      app.id === appId ? { ...app, status: 'disbursed' as const } : app
    );
    
    // Create new active loan repayment schedule dynamically
    const newActiveLoan: ActiveLoan = {
      id: `LN-${Math.floor(10000 + Math.random() * 90000)}`,
      lenderName: lender,
      totalAmount: amount,
      outstandingAmount: amount,
      interestRate: interest,
      nextEmiDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextEmiAmount: emiAmount,
      paidTenure: 0,
      totalTenure: tenure,
      repaymentSchedule: Array.from({ length: tenure }).map((_, idx) => ({
        id: `EM-${idx + 1}`,
        dueDate: new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: emiAmount,
        status: 'pending'
      })),
      statements: [
        { id: 'S1', name: 'Interest Certificate FY 26-27', date: new Date().toISOString().split('T')[0], size: '210 KB' }
      ]
    };
    
    return {
      applications: updatedApps,
      activeLoan: newActiveLoan,
      notifications: [
        {
          id: `N-${Math.random()}`,
          title: 'Direct Disbursement Complete',
          message: `Congratulations! ₹${amount.toLocaleString('en-IN')} has been credited directly to your bank account by ${lender}.`,
          category: 'loan',
          date: new Date().toISOString(),
          read: false,
        },
        ...state.notifications
      ]
    };
  }),
  
  addComplaint: (category, description) => {
    const id = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: SupportComplaint = {
      id,
      category,
      description,
      status: 'open',
      date: new Date().toISOString().split('T')[0]
    };
    
    set((state) => ({
      complaints: [newComplaint, ...state.complaints],
      notifications: [
        {
          id: `N-${Math.random()}`,
          title: 'Complaint Ticket Raised',
          message: `Grievance ticket ${id} has been created and assigned to support desk.`,
          category: 'support',
          date: new Date().toISOString(),
          read: false,
        },
        ...state.notifications
      ]
    }));

    // COMPLAINT TIMELINE RESOLVER SIMULATOR
    
    // Transition to in-progress after 5 seconds
    setTimeout(() => {
      set((state) => {
        const ticketExists = state.complaints.some(c => c.id === id);
        if (!ticketExists) return {};
        
        return {
          complaints: state.complaints.map(c => c.id === id ? { ...c, status: 'in_progress' } : c),
          notifications: [
            {
              id: `N-${Math.random()}`,
              title: 'Complaint Update',
              message: `Grievance officer is investigating ticket ${id}.`,
              category: 'support',
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications
          ]
        };
      });
    }, 5000);

    // Transition to resolved after 12 seconds
    setTimeout(() => {
      set((state) => {
        const ticketExists = state.complaints.some(c => c.id === id);
        if (!ticketExists) return {};
        
        return {
          complaints: state.complaints.map(c => 
            c.id === id 
              ? { 
                  ...c, 
                  status: 'resolved', 
                  notes: 'Resolution: We have checked with the bank partner gateway. The pending transaction logs have been processed successfully. Please verify your banking statement.' 
                } 
              : c
          ),
          notifications: [
            {
              id: `N-${Math.random()}`,
              title: 'Complaint Resolved!',
              message: `Your grievance ticket ${id} has been marked as RESOLVED. View resolution notes.`,
              category: 'support',
              date: new Date().toISOString(),
              read: false,
            },
            ...state.notifications
          ]
        };
      });
    }, 12000);

    return id;
  },
  
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  payEmi: (emiId) => set((state) => {
    if (!state.activeLoan) return {};
    const updatedSchedule = state.activeLoan.repaymentSchedule.map((emi) => 
      emi.id === emiId ? { ...emi, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] } : emi
    );
    
    // count paid ones
    const paidCount = updatedSchedule.filter(emi => emi.status === 'paid').length;
    const paidAmount = state.activeLoan.nextEmiAmount;
    
    // adjust outstanding
    const newOutstanding = Math.max(0, state.activeLoan.outstandingAmount - paidAmount);
    
    // determine next EMI date
    const nextPending = updatedSchedule.find(emi => emi.status === 'pending');
    
    // Generate statement item dynamically upon payment
    const newStatement = {
      id: `ST-${Math.random()}`,
      name: `EMI Payment Receipt - ${new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
      date: new Date().toISOString().split('T')[0],
      size: '180 KB'
    };

    return {
      activeLoan: {
        ...state.activeLoan,
        outstandingAmount: newOutstanding,
        paidTenure: paidCount,
        nextEmiDate: nextPending ? nextPending.dueDate : 'Fully Paid',
        repaymentSchedule: updatedSchedule,
        statements: [newStatement, ...state.activeLoan.statements]
      },
      notifications: [
        {
          id: `N-${Math.random()}`,
          title: 'EMI Repayment Success',
          message: `Your monthly payment of ₹${paidAmount.toLocaleString('en-IN')} was processed successfully. Receipt added to vault.`,
          category: 'payments',
          date: new Date().toISOString(),
          read: false,
        },
        ...state.notifications
      ]
    };
  })
}));
