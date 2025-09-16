
// //   this is the code for minimizing number of transactions
  
//   const calculateOptimizedTransactions = (currentBalances) => {  // Ignore param, use expenses
//     // console.log('Expenses for calculation:', expenses);  
//     if (!activeGroup || !activeGroup.members || expenses.length === 0) {
//       // console.log('No group, members, or expenses, returning empty');
//       setOptimizedTransactions([]);
//       setIsCalculating(false);
//       return;
//     }

//     setIsCalculating(true);

//     // Step 1: Brute force compute balances from expenses (loop through all)

//     console.log('members - > ', activeGroup.members);

//     const balances = {};
//     activeGroup.members.forEach(member => {
//       balances[member._id.toString()] = 0;  // Initialize for all members
//     });



//     expenses.forEach(expense => {

//       if (expense.splitType !== 'equal' || expense.isSettled === true) {
//         // console.warn('Non-equal split not supported, skipping:', expense.title);
//         return;
//       }
//       const share = expense.amount / (expense.participants ? expense.participants.length : 1);
//       const paidById = expense.paidBy?._id?.toString() || expense.paidBy;  // Handle populated object or string

//       // Credit full amount to paidBy
//       if (paidById && balances[paidById] !== undefined) {
//         balances[paidById] += expense.amount;
//       }

//       // Deduct share from all participants (brute loop)
//       if (expense.participants && Array.isArray(expense.participants)) {
//         expense.participants.forEach(participantObj => {
//           const pId = participantObj?._id?.toString() || participantObj;  // Handle object or string
//           if (pId && balances[pId] !== undefined) {
//             balances[pId] -= share;
//           }
//         });
//       }
//     });

//     // console.log('Computed Balances from Expenses:', balances);

//     // Step 2: Separate debtors (negative, owe money) and creditors (positive, owed)
//     const debtors = [];
//     const creditors = [];
//     Object.entries(balances).forEach(([userId, amount]) => {
//       if (amount < -0.01) {  // Epsilon for negatives
//         debtors.push({ userId, amount: Math.abs(amount) });  // Positive debt amount
//       } else if (amount > 0.01) {  // Epsilon for positives
//         creditors.push({ userId, amount });
//       }
//     });

//     // console.log('Debtors:', debtors);
//     // console.log('Creditors:', creditors);

//     // Step 3: Brute force settlement - Simple loop through all pairs (greedy-like for min tx)
//     const transactions = [];
//     // Sort descending for efficiency (largest first)
//     debtors.sort((a, b) => b.amount - a.amount);
//     creditors.sort((a, b) => b.amount - a.amount);

//     let debtorIdx = 0;
//     let creditorIdx = 0;
//     while (debtorIdx < debtors.length && creditorIdx < creditors.length) {
//       const debtor = debtors[debtorIdx];
//       const creditor = creditors[creditorIdx];
//       const payAmount = Math.min(debtor.amount, creditor.amount);

//       transactions.push({
//         from: debtor.userId,
//         to: creditor.userId,
//         amount: payAmount
//       });

//       // Update remaining (brute update)
//       debtor.amount -= payAmount;
//       creditor.amount -= payAmount;

//       // Advance if settled (epsilon)
//       if (debtor.amount < 0.01) debtorIdx++;
//       if (creditor.amount < 0.01) creditorIdx++;
//     }

//     // console.log('Raw Transactions:', transactions);

//     // Step 4: Map to names (brute lookup for each)
//     const namedTransactions = transactions.map(tx => {
//       const fromMember = activeGroup.members.find(m => m._id.toString() === tx.from);
//       const toMember = activeGroup.members.find(m => m._id.toString() === tx.to);
//       return {
//         from: fromMember ? (fromMember.email === userEmail ? 'You' : (fromMember.name || fromMember.email)) : tx.from,
//         to: toMember ? (toMember.email === userEmail ? 'You' : (toMember.name || toMember.email)) : tx.to,
//         amount: tx.amount
//       };
//     });

//     // console.log('Named Transactions:', namedTransactions);

//     setTimeout(() => {

//       setOptimizedTransactions(namedTransactions);
//       setIsCalculating(false);

//     }, 1000);

//   };